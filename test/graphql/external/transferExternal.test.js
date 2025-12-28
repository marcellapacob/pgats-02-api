// Bibliotecas
const request = require('supertest');
const { expect } = require('chai');

// Testes
describe('Testes de Transferência', () => {
    const baseUrl = (process.env.BASE_URL_GRAPHQL || 'http://localhost:4000') + '/graphql';
    let token;

    before(async () => {
        const loginUser = require('../fixture/requisicoes/login/loginUser.json');

        // retry loop to tolerate CI startup delays
        const maxAttempts = 60;
        let attempt = 0;
        let respostaLogin;
        while (attempt < maxAttempts) {
            try {
                respostaLogin = await request(baseUrl)
                    .post('')
                    .send(loginUser);
                if (respostaLogin && respostaLogin.body && respostaLogin.body.data && respostaLogin.body.data.loginUser) break;
            } catch (err) {
                // swallow and retry
            }
            attempt++;
            await new Promise(r => setTimeout(r, 1000));
        }
        if (!respostaLogin || !respostaLogin.body || !respostaLogin.body.data || !respostaLogin.body.data.loginUser) {
            throw new Error(`GraphQL login failed after ${maxAttempts} attempts`);
        }
        token = respostaLogin.body.data.loginUser.token;
    });

    it('Validar que é possível transferir grana entre duas contas', async () => {
        const createTransfer = require ('../fixture/requisicoes/transferencia/createTransfer.json');
        const resposta = await request(baseUrl)
            .post('')
            .set('Authorization', `Bearer ${token}`)
            .send(createTransfer);

        expect(resposta.status).to.equal(200);
        expect(resposta.body).to.have.nested.property('data.createTransfer');
        const created = resposta.body.data.createTransfer;
        expect(created).to.include({ from: createTransfer.variables.from, to: createTransfer.variables.to });
        expect(created.value).to.equal(createTransfer.variables.value);
    });

    it('Sem saldo disponível', async () => {
        const createTransfer = require ('../fixture/requisicoes/transferencia/createTransfer.json');
        createTransfer.variables.value = 10000.01; // Valor alto para garantir saldo insuficiente
        const resposta = await request(baseUrl)
            .post('')
            .set('Authorization', `Bearer ${token}`)
            .send(createTransfer);

        expect(resposta.status).to.equal(200);
        expect(resposta.body).to.have.property('errors');
        expect(resposta.body.errors[0].message).to.include('Saldo insuficiente');
    });
});