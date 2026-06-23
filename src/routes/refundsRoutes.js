const router = require('express').Router();
const c = require('../controllers/refundController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/', c.create);

module.exports = router;
