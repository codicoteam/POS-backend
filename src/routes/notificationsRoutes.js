const router = require('express').Router();
const c = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', c.list);
router.post('/', c.create);

module.exports = router;
