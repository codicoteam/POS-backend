const router = require('express').Router();
const c = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole }  = require('../middleware/roleMiddleware');

router.use(authenticate);

// Categories (before /:id to avoid conflict)
router.get('/categories',         c.listCategories);
router.post('/categories',        requireRole('owner', 'manager'), c.createCategory);
router.put('/categories/:id',     requireRole('owner', 'manager'), c.updateCategory);
router.delete('/categories/:id',  requireRole('owner'), c.deleteCategory);

// Barcode operations (before /barcode/:barcode to avoid conflict)
router.post('/generate-barcode',           c.generateBarcodeImage);
router.post('/generate-barcode-svg',       c.generateBarcodeSvgEndpoint);
router.post('/generate-barcode-dataurl',   c.generateBarcodeDataUrl);

// Barcode lookup (used by POS / scanner)
router.get('/barcode/:barcode',   c.getByBarcode);

// Products CRUD
router.get('/',       c.list);
router.get('/:id',    c.get);
router.post('/',      requireRole('owner', 'manager', 'inventory_clerk'), c.create);
router.put('/:id',    requireRole('owner', 'manager', 'inventory_clerk'), c.update);
router.delete('/:id', requireRole('owner'), c.remove);

module.exports = router;
