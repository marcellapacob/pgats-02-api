// app.js
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/typeDefs');       
const resolvers = require('./graphql/resolvers');     
const authenticate = require('./graphql/authenticate'); 

// Import dos controllers REST
const transferController = require('./rest/controllers/transferController');

const app = express();

// Middleware JSON
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

// --- Health check para o workflow ---
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// --- Rotas REST usadas nos testes ---
app.post('/transfers', transferController.create);
app.get('/transfers/:id', transferController.getById);

// Porta da aplicação
const PORT = process.env.PORT || 4000;

startApolloServer().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL ready at http://localhost:${PORT}/graphql`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
  });
});

module.exports = app;