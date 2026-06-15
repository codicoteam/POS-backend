/**
 * Role-Based Access Control Middleware
 * Usage: requireRole('owner', 'manager')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied. Required role: ' + allowedRoles.join(' or ') + '.',
      });
    }
    next();
  };
}

module.exports = { requireRole };
