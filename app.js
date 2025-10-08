const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const authenticate = require('./graphql/authenticate');


const transferController = require('./test/rest/controller/transferController');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/transfers', transferController.create);

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => authenticate(req)
  });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
}

startApolloServer();

module.exports = app;