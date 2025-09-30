// app.js para ApolloServer
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const authenticate = require('./authenticate');

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => authenticate(req)
});

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app });
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startApolloServer();

module.exports = app;
