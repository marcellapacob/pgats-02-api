// Bibliotecas
const request = require('supertest');
const app = require('../../../app'); // Correção 2: garantir app
const { expect, use } = require('chai');
const chaiExclude = require('chai-exclude');
use(chaiExclude);

require('dotenv').config();

let token;
let tokenSemSaldo;

// Testes
describe('Transfer', () => {
    describe('POST /transfers', () => {

        // Antes de todos os testes, faz login e pega token do usuário principal
        before(async () => {
            const postLogin = require('../fixture/requisicoes/login/postLogin.json');

            const respostaLogin = await request(process.env.BASE_URL_REST)
                .post('/users/login')
                .send(postLogin);

            token = respostaLogin.body.token || null;

            // Cria um usuário com saldo 0 para teste de saldo insuficiente
            await request(process.env.BASE_URL_REST)
                .post('/users/register')
                .send({
                    username: "usuarioSemSaldo",
                    password: "123456",
                    balance: 0
                });

            const loginSemSaldo = await request(process.env.BASE_URL_REST)
                .post('/users/login')
                .send({
                    username: "usuarioSemSaldo",
                    password: "123456"
                });

            tokenSemSaldo = loginSemSaldo.body.token;
        });

        // Teste de sucesso com 201 CREATED
        it('Quando informo valores válidos eu tenho sucesso com 201 CREATED', async () => {
            const postTransfer = require('../fixture/requisicoes/transferencias/postTransfer.json');

            const resposta = await request(process.env.BASE_URL_REST)
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send(postTransfer);

            expect(resposta.status).to.equal(201);

            // Validação com fixture (Correção 4: caminho correto do fixture)
            const respostaEsperada = require('../fixture/requisicoes/respostas/quandoInformoValoresValidosEuTenhoSucessoCom201Created.json');
            expect(resposta.body)
                .excluding('date')
                .to.deep.equal(respostaEsperada);
        });

        // Teste de saldo insuficiente
        it('Sem saldo disponível retorna 400', async () => {
            const postTransfer = require('../fixture/requisicoes/transferencias/postTransfer.json');

            const resposta = await request(process.env.BASE_URL_REST)
                .post('/transfers')
                .set('Authorization', `Bearer ${tokenSemSaldo}`)
                .send(postTransfer);

            expect(resposta.status).to.equal(400);
            expect(resposta.body.error).to.include('Saldo insuficiente'); // Correção 3
        });

        // Teste sem token
        it('Token de autenticação não informado retorna 400', async () => { // Correção 3: status correto
            const postTransfer = require('../fixture/requisicoes/transferencias/postTransfer.json');

            const resposta = await request(process.env.BASE_URL_REST)
                .post('/transfers')
                .send(postTransfer);

            expect(resposta.status).to.equal(400); // Correção 3
        });

        // Testes de erros de negócio
        const testesDeErrosDeNegocio = require('../fixture/requisicoes/transferencias/postTransferWithErrors.json');
        testesDeErrosDeNegocio.forEach(teste => {
            it(`Testando a regra relacionada a ${teste.nomeDoTeste}`, async () => {
                const postTransfer = require('../fixture/requisicoes/transferencias/postTransfer.json');

                const resposta = await request(process.env.BASE_URL_REST)
                    .post('/transfers')
                    .set('Authorization', `Bearer ${token}`)
                    .send(teste.postTransfer);

                expect(resposta.status).to.equal(teste.statusCode);
                expect(resposta.body).to.have.property('error', teste.mensagemEsperada);
            });
        });
    });
});