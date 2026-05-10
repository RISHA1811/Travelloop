const jwt = require('jsonwebtoken');
const { read } = require('../utils/fileHelper');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token, unauthorized' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach role from users.json
    const users = read('users.json');
    const user = users.find((u) => u.id === decoded.id);
    req.user = { ...decoded, role: user?.role || 'user' };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = protect;
