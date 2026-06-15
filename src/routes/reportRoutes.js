const router = require('express').Router();
const c = require('../controllers/reportController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole }  = require('../middleware/roleMiddleware');

router.use(authenticate, requireRole('owner', 'manager'));

router.get('/dashboard',       c.dashboard);
router.get('/daily',           c.daily);
router.get('/weekly',          c.weekly);
router.get('/monthly',         c.monthly);
router.get('/inventory',       c.inventory);
router.get('/top-products',    c.topProducts);
router.get('/employee',        c.employeePerformance);
router.get('/profitability',   c.profitability);

module.exports = router;
