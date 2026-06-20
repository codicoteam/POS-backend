const router = require('express').Router();
const c = require('../controllers/devicesController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticate);

// Only owner/manager can register devices
router.post('/', requireRole('owner', 'manager'), c.register);
router.get('/', requireRole('owner', 'manager'), c.list);

module.exports = router;
