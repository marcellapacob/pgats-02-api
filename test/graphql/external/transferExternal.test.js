// Bibliotecas
const request = require('supertest');
const { expect } = require('chai');

// Detecta CI (GitHub Actions, etc.)
const isCI = process.env.CI === 'true';

// Testes
(isCI ? describe.skip : describe)(
  'Testes de Transferência',
  () => {
    const baseUrl =
      (process.env.BASE_URL_GRAPHQL || 'http://localhost:4000') + '/graphql';
    let token;

    before(async function () {
      this.timeout(70000);

      const loginUser = require('../fixture/requisicoes/login/loginUser.json');

      const maxAttempts = 60;
      let attempt = 0;
      let respostaLogin;

      while (attempt < maxAttempts) {
        try {
          respostaLogin = await request(baseUrl)
            .post('')
            .send(loginUser);

          if (respostaLogin?.body?.data?.loginUser) break;
        } catch (err) {
          // ignora e tenta novamente
        }

        attempt++;
        await new Promise(r => setTimeout(r, 1000));
      }

      if (!respostaLogin?.body?.data?.loginUser) {
        throw new Error(`GraphQL login failed after ${maxAttempts} attempts`);
      }

      token = respostaLogin.body.data.loginUser.token;
    });

    it('Validar que é possível transferir grana entre duas contas', async () => {
      const createTransfer = require('../fixture/requisicoes/transferencia/createTransfer.json');

      const resposta = await request(baseUrl)
        .post('')
        .set('Authorization', `Bearer ${token}`)
        .send(createTransfer);

      expect(resposta.status).to.equal(200);
    });

    it('Sem saldo disponível', async () => {
      const createTransfer = require('../fixture/requisicoes/transferencia/createTransfer.json');
      createTransfer.variables.value = 10000.01;

      const resposta = await request(baseUrl)
        .post('')
        .set('Authorization', `Bearer ${token}`)
        .send(createTransfer);

      expect(resposta.body).to.have.property('errors');
    });
  }
);
