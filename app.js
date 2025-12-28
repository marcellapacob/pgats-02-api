const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const authenticate = require('./graphql/authenticate');
const routes = require('./routes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(routes);

// Iniciar Apollo Server de forma assíncrona sem bloquear
(async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => authenticate(req)
  });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
})();

module.exports = app;