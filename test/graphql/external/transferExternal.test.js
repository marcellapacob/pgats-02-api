const request = require('supertest');
const { expect } = require('chai');

describe('Testes de Transferência', () => {
    
    before(async () => {
        const loginUser = require('../fixture/requisicoes/login/loginUser.json');
        const resposta = await request('http://localhost:4000/graphql')
            .post('')
            .send(loginUser);

        token = resposta.body.data.loginUser.token;
    });
    
    it('Validar que é possível transferir grana entre duas contas', async () => {
        const respostaTransferencia = await request('http://localhost:4000/graphql')
            .post('')
            .set('Authorization', `Bearer ${token}`)
            .send({
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
                    from: 'julio',
                    to: 'priscila',
                    value: 15
                }
            });

        expect(respostaTransferencia.status).to.equal(200);
    });

    it('Validar que não é possível transferir de uma conta que não possui saldo suficiente', async () => {
        const respostaTransferencia = await request('http://localhost:4000/graphql')
            .post('')
            .set('Authorization', `Bearer ${token}`)
            .send({
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
                    from: 'julio',
                    to: 'priscila',
                    value: 10000.01
                }
            });

        expect(respostaTransferencia.status).to.equal(200);
        expect(respostaTransferencia.body.errors[0].message).to.equal('Saldo insuficiente');
    });
});