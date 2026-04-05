/**
 * Middleware de autenticación JWT
 * Verifica token en header Authorization
 */

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Acceso denegado. Token requerido',
      code: 'MISSING_TOKEN'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({
          error: 'Token expirado. Inicie sesión nuevamente',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(403).json({
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    req.user = user;
    next();
  });
};

const generateToken = (userData) => {
  return jwt.sign(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role || 'user',
      clientId: userData.clientId || 'unknown'
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

module.exports = { authenticateToken, generateToken, optionalAuth };
