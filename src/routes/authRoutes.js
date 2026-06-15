const router = require('express').Router();
const c = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole }  = require('../middleware/roleMiddleware');

// Public
router.post('/login', c.login);

// Authenticated
router.get('/me',             authenticate, c.me);
router.put('/password',       authenticate, c.changePassword);

// Owner only
router.post('/register',                 authenticate, requireRole('owner'), c.register);
router.get('/users',                     authenticate, requireRole('owner', 'manager'), c.listUsers);
router.put('/users/:id',                 authenticate, requireRole('owner'), c.updateUser);
router.delete('/users/:id',              authenticate, requireRole('owner'), c.deactivateUser);
router.put('/reset-password/:id',        authenticate, requireRole('owner', 'manager'), c.resetPassword);
router.get('/roles',                     authenticate, c.listRoles);

module.exports = router;
