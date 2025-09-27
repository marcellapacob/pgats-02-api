const request = require('supertest');
const { expect, use } = require('chai');
const chaiExclude = require('chai-exclude');
use(chaiExclude);

require('dotenv').config();

let token;

describe('Testes de Transferência', () => {
  const baseUrl = process.env.BASE_URL_GRAPHQL || "http://localhost:4000";
  let createTransfer;

  before(async () => {
    
    const loginMutation = {
      query: `
        mutation {
          login(usuario: "admin", senha: "123456") {
            token
            error
          }
        }
      `
    };

    const respostaLogin = await request(baseUrl)
      .post('/graphql')
      .send(loginMutation);

    console.log('Base URL usada:', baseUrl);
    console.log('Status login:', respostaLogin.status);
    console.log('Body login:', JSON.stringify(respostaLogin.body, null, 2));

    if (
      !respostaLogin.body ||
      !respostaLogin.body.data ||
      !respostaLogin.body.data.login ||
      !respostaLogin.body.data.login.token
    ) {
      throw new Error('Token não encontrado na resposta do login');
    }

    token = respostaLogin.body.data.login.token;
  });

  beforeEach(() => {
    createTransfer = require('../fixture/requisicoes/transferencia/createTransfer.json');
  });

  it('Validar que é possível transferir grana entre duas contas', async () => {
    const respostaEsperada = require('../fixture/respostas/transferencia/validarQueEPossivelTransferirGranaEntreDuasContas.json');

    const respostaTransferencia = await request(baseUrl)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send(createTransfer);

    console.log('Resposta transferência:', JSON.stringify(respostaTransferencia.body, null, 2));

    expect(respostaTransferencia.status).to.equal(200);
    expect(respostaTransferencia.body.data.createTransfer)
      .excluding('date')
      .to.deep.equal(respostaEsperada.data.createTransfer);
  });

  const testesDeErrosDeNegocio = require('../fixture/requisicoes/transferencia/createTransferWithError.json');
  testesDeErrosDeNegocio.forEach(teste => {
    it(`Testando a regra relacionada a ${teste.nomeDoTeste}`, async () => {
      const respostaTransferencia = await request(baseUrl)
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send(teste.createTransfer);

      expect(respostaTransferencia.status).to.equal(200);
    });
  });
});