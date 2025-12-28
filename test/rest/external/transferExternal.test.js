// Bibliotecas
const request = require('supertest');
const app = require('../../../app'); 
const { expect, use } = require('chai');
const chaiExclude = require('chai-exclude');
use(chaiExclude);

require('dotenv').config();

let token;

// Testes
describe('Transfer', () => {
    describe('POST /transfers', () => {

        before(async () => {
            const postLogin = require('../fixture/requisicoes/login/postLogin.json');

            const respostaLogin = await request(app)
                .post('/users/login')
                .send(postLogin);

            token = respostaLogin.body.token || null;
        });

        it('Quando informo valores válidos eu tenho sucesso com 201 CREATED', async () => {
            const postTransfer = require('../fixture/requisicoes/transferencias/postTransfer.json');

            const resposta = await request(app)
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send(postTransfer);

            expect(resposta.status).to.equal(201);

            const respostaEsperada = require('../fixture/requisicoes/respostas/quandoInformoValoresValidosEuTenhoSucessoCom201Created.json');
            expect(resposta.body)
                .excluding('date')
                .to.deep.equal(respostaEsperada);
        });

        it('Sem saldo disponível retorna 400', async () => {
            const resposta = await request(app)
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    from: 'julio',
                    to: 'priscila',
                    value: 99999999 
                });

            expect(resposta.status).to.equal(400);
            expect(resposta.body.error).to.include('Saldo insuficiente'); 
        });

        it('Token de autenticação não informado retorna 401', async () => { 
            const postTransfer = require('../fixture/requisicoes/transferencias/postTransfer.json');

            const resposta = await request(app)
                .post('/transfers')
                .send(postTransfer);

            expect(resposta.status).to.equal(401); 
        });

        const testesDeErrosDeNegocio = require('../fixture/requisicoes/transferencias/postTransferWithErrors.json');
        testesDeErrosDeNegocio.forEach(teste => {
            it(`Testando a regra relacionada a ${teste.nomeDoTeste}`, async () => {
                const postTransfer = require('../fixture/requisicoes/transferencias/postTransfer.json');

                const resposta = await request(app)
                    .post('/transfers')
                    .set('Authorization', `Bearer ${token}`)
                    .send(teste.postTransfer);

                expect(resposta.status).to.equal(teste.statusCode);
                expect(resposta.body).to.have.property('error', teste.mensagemEsperada);
            });
        });
    });
});