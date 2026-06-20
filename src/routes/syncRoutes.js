const router = require('express').Router();
const c = require('../controllers/syncController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/queue', c.syncQueue);

module.exports = router;
