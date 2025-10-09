const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'segredo';

exports.login = (req, res) => {
  const { user, password } = req.body;
  
  if (user === 'admin' && password === '123456') {
    const token = jwt.sign({ user }, SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Credenciais inválidas' });
};