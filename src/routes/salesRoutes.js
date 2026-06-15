const router = require('express').Router();
const c = require('../controllers/salesController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole }  = require('../middleware/roleMiddleware');

router.use(authenticate);

router.post('/',              c.create);
router.get('/',               c.list);
router.get('/:id',            c.get);
router.get('/:id/receipt',    c.receipt);
router.post('/:id/refund',    requireRole('owner', 'manager'), c.refund);

module.exports = router;
