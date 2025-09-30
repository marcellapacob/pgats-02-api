// app.js na raiz do projeto
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const authenticate = require('./graphql/authenticate');

const app = express();

// Middleware para JSON
app.use(express.json());

// --- Configuração ApolloServer (GraphQL) ---
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => authenticate(req),
});

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
}

// --- Endpoints REST (exemplo) ---
app.get('/health', (req, res) => res.json({ status: 'ok' }));
// Adicione aqui suas rotas REST, por exemplo:
// app.post('/transfers', transferController.create);

const PORT = process.env.PORT || 4000;

startApolloServer().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🚀 GraphQL ready at http://localhost:${PORT}/graphql`);
  });
});

module.exports = app;