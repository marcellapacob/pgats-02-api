// test/graphql/external/transferExternal.test.js

const request = require('supertest');
const { expect, use } = require('chai');
const chaiExclude = require('chai-exclude');
use(chaiExclude);

require('dotenv').config();

let token; // variável global para armazenar o token

describe('Testes de Transferência', () => {

  // 🔑 Antes de todos os testes: login e captura do token
  before(async () => {
    // Usa o .env ou fallback para localhost:4000
    const baseUrl = process.env.BASE_URL_GRAPHQL || "http://localhost:4000";

    const loginMutation = {
      query: `
        mutation LoginUser($username: String!, $password: String!) {
          loginUser(username: $username, password: $password) {
            token
          }
        }
      `,
      variables: {
        username: "julio",
        password: "123456"
      }
    };

    const respostaLogin = await request(baseUrl)
      .post('/graphql') // endpoint correto
      .send(loginMutation);

    // 🔍 Logs para depuração
    console.log('Base URL usada:', baseUrl);
    console.log('Status login:', respostaLogin.status);
    console.log('Body login:', JSON.stringify(respostaLogin.body, null, 2));

    token = respostaLogin.body.data?.loginUser?.token;

    if (!token) {
      throw new Error('Não foi possível obter token no login');
    }
  });

  // 🔄 Teste de criar transferência
  it('Validar que é possível transferir grana entre duas contas', async () => {
    const createTransfer = {
      query: `
        mutation CreateTransfer($from: String!, $to: String!, $value: Float!) {
          createTransfer(from: $from, to: $to, value: $value) {
            date
            from
            to
            value
          }
        }
      `,
      variables: {
        from: "julio",
        to: "priscila",
        value: 15
      }
    };

    const respostaEsperada = require('../fixture/respostas/transferencia/validarQueEPossivelTransferirGranaEntreDuasContas.json');

    const respostaTransferencia = await request(process.env.BASE_URL_GRAPHQL || "http://localhost:4000")
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send(createTransfer);

    // 🔍 Log para depuração
    console.log('Resposta transferência:', JSON.stringify(respostaTransferencia.body, null, 2));

    expect(respostaTransferencia.status).to.equal(200);
    expect(respostaTransferencia.body.data.createTransfer)
      .excluding('date') // ignora campo date
      .to.deep.equal(respostaEsperada.data.createTransfer);
  });

});
