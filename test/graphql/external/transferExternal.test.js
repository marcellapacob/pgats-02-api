const request = require('supertest');
const { expect, use } = require('chai');

const chaiExclude = require('chai-exclude');
use(chaiExclude);

require('dotenv').config();

let token; 

describe('Testes de Transferência', () => {
    
    before(async () => {
        const loginUser = require('../fixture/requisicoes/login/loginUser.json');
        const resposta = await request(process.env.BASE_URL_GRAPHQL)
            .post('')
            .send(loginUser);

  before(async () => {
    
    const baseUrl = process.env.BASE_URL_GRAPHQL || "http://localhost:4000";

    beforeEach(() => {
        createTransfer = require('../fixture/requisicoes/transferencia/createTransfer.json');
    })
    
    it('Validar que é possível transferir grana entre duas contas', async () => {
        const respostaEsperada = require('../fixture/respostas/transferencia/validarQueEPossivelTransferirGranaEntreDuasContas.json');

    const respostaLogin = await request(baseUrl)
      .post('/graphql') 
      .send(loginMutation);

    console.log('Base URL usada:', baseUrl);
    console.log('Status login:', respostaLogin.status);
    console.log('Body login:', JSON.stringify(respostaLogin.body, null, 2));

    });

    const testesDeErrosDeNegocio = require('../fixture/requisicoes/transferencia/createTransferWithError.json'); 
    testesDeErrosDeNegocio.forEach(teste => {
        it(`Testando a regra relacionada a ${teste.nomeDoTeste}`, async () => {
            const respostaTransferencia = await request(process.env.BASE_URL_GRAPHQL)
                .post('')
                .set('Authorization', `Bearer ${token}`)
                .send(teste.createTransfer);


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

    console.log('Resposta transferência:', JSON.stringify(respostaTransferencia.body, null, 2));

    expect(respostaTransferencia.status).to.equal(200);
    expect(respostaTransferencia.body.data.createTransfer)
      .excluding('date') 
      .to.deep.equal(respostaEsperada.data.createTransfer);
  });

});
