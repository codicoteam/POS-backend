const router = require('express').Router();
const c = require('../controllers/stockController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticate);

router.post('/receive', requireRole('owner','manager'), c.receive);

module.exports = router;
