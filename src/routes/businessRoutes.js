const router = require('express').Router();
const c = require('../controllers/businessController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticate);

router.post('/', requireRole('owner'), c.create);
router.get('/', requireRole('owner', 'manager'), c.list);
router.get('/:id', requireRole('owner', 'manager'), c.get);

module.exports = router;
