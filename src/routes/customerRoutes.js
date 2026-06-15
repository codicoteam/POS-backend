const router = require('express').Router();
const c = require('../controllers/customerController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/',              c.list);
router.post('/',             c.create);
router.get('/:id',           c.get);
router.put('/:id',           c.update);
router.get('/:id/history',   c.history);
router.get('/:id/stats',     c.stats);

module.exports = router;
