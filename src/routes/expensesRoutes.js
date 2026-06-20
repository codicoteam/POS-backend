const router = require('express').Router();
const c = require('../controllers/expensesController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/', c.create);
router.get('/', c.list);
router.get('/:id', c.get);

module.exports = router;
