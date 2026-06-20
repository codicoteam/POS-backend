const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');
const User = require('../models/User');

async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch fresh user record to get latest must_change_password and is_active
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found.' });
    if (!user.is_active) return res.status(403).json({ message: 'Account is deactivated.' });

    req.user = { id: user.id, name: user.name, email: user.email, role: user.role, must_change_password: user.must_change_password };

    // Enforce forced password change: allow password change endpoint only
    const isPasswordChangeEndpoint = req.path === '/api/auth/password' && req.method === 'PUT';
    if (user.must_change_password && !isPasswordChangeEndpoint) {
      return res.status(403).json({ message: 'Change password required.' });
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

module.exports = { authenticate };
