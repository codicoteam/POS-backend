const router = require('express').Router();
const c = require('../controllers/whatsappController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole }  = require('../middleware/roleMiddleware');

// Meta webhook verification (public — no auth)
router.get('/webhook',  c.verify);
router.post('/webhook', c.webhook);

// Manual trigger (protected)
router.post('/send-daily-summary', authenticate, requireRole('owner', 'manager'), c.sendDailySummary);

module.exports = router;
