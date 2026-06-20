const router = require('express').Router();
const c = require('../controllers/shiftsController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/start', c.start);
router.post('/:id/end', c.end);
router.get('/', c.list);

module.exports = router;
