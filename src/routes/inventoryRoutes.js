const router = require('express').Router();
const c = require('../controllers/inventoryController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole }  = require('../middleware/roleMiddleware');

router.use(authenticate);

router.get('/',                          c.list);
router.get('/low-stock',                 c.lowStock);
router.get('/movements/:product_id',     c.movements);
router.post('/adjust',                   requireRole('owner', 'manager', 'inventory_clerk'), c.adjust);
router.put('/threshold/:product_id',     requireRole('owner', 'manager', 'inventory_clerk'), c.setThreshold);

module.exports = router;
