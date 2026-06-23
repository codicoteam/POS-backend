const router = require('express').Router();
const c = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticate);

router.get('/plans', c.plans);
router.post('/subscribe', requireRole('owner'), c.subscribe);

module.exports = router;
