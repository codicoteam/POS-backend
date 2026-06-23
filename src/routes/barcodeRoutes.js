const router = require('express').Router();
const c = require('../controllers/barcodeController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/generate', c.generate);
router.get('/print', c.print);

module.exports = router;
