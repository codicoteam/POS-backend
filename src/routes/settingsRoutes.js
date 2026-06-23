const router = require('express').Router();
const c = require('../controllers/settingsController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/', c.get);
router.put('/', c.upsert);

module.exports = router;
