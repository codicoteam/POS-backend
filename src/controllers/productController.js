const Product  = require('../models/Product');
const Category = require('../models/Category');
const { generateBarcode, generateBarcodeSvg, generateBarcodeDataUrl } = require('../services/barcodeService');

// GET /api/products
exports.list = async (req, res, next) => {
  try {
    const products = await Product.findAll(req.query);
    const total    = await Product.count(req.query);
    res.json({ data: products, total, page: Number(req.query.page) || 1 });
  } catch (e) { next(e); }
};

// GET /api/products/:id
exports.get = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found.' });
    res.json(p);
  } catch (e) { next(e); }
};

// GET /api/products/barcode/:barcode
exports.getByBarcode = async (req, res, next) => {
  try {
    const p = await Product.findByBarcode(req.params.barcode);
    if (!p) return res.status(404).json({ message: 'Product not found.' });
    res.json(p);
  } catch (e) { next(e); }
};

// POST /api/products
exports.create = async (req, res, next) => {
  try {
    const { name, selling_price } = req.body;
    if (!name || !selling_price)
      return res.status(400).json({ message: 'name and selling_price are required.' });
    const p = await Product.create(req.body);
    res.status(201).json(p);
  } catch (e) { next(e); }
};

// PUT /api/products/:id
exports.update = async (req, res, next) => {
  try {
    const p = await Product.update(req.params.id, req.body);
    if (!p) return res.status(404).json({ message: 'Product not found.' });
    res.json(p);
  } catch (e) { next(e); }
};

// DELETE /api/products/:id
exports.remove = async (req, res, next) => {
  try {
    await Product.softDelete(req.params.id);
    res.json({ message: 'Product deactivated.' });
  } catch (e) { next(e); }
};

// GET /api/products/categories
exports.listCategories = async (req, res, next) => {
  try { res.json(await Category.findAll()); } catch (e) { next(e); }
};

// POST /api/products/categories
exports.createCategory = async (req, res, next) => {
  try {
    if (!req.body.name)
      return res.status(400).json({ message: 'name is required.' });
    res.status(201).json(await Category.create(req.body.name));
  } catch (e) { next(e); }
};

// PUT /api/products/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    res.json(await Category.update(req.params.id, req.body.name));
  } catch (e) { next(e); }
};

// DELETE /api/products/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.delete(req.params.id);
    res.json({ message: 'Category deleted.' });
  } catch (e) { next(e); }
};

// POST /api/products/generate-barcode
// Generate barcode for a value (returns PNG image)
exports.generateBarcodeImage = async (req, res, next) => {
  try {
    const { value, format } = req.body;
    if (!value) {
      return res.status(400).json({ message: 'Barcode value is required.' });
    }
    const png = await generateBarcode(value, format || 'code128');
    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch (e) { next(e); }
};

// POST /api/products/generate-barcode-svg
// Generate barcode as SVG (vector format)
exports.generateBarcodeSvgEndpoint = async (req, res, next) => {
  try {
    const { value, format } = req.body;
    if (!value) {
      return res.status(400).json({ message: 'Barcode value is required.' });
    }
    const svg = await generateBarcodeSvg(value, format || 'code128');
    res.set('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (e) { next(e); }
};

// POST /api/products/generate-barcode-dataurl
// Generate barcode as base64 data URL
exports.generateBarcodeDataUrl = async (req, res, next) => {
  try {
    const { value, format } = req.body;
    if (!value) {
      return res.status(400).json({ message: 'Barcode value is required.' });
    }
    const dataUrl = await generateBarcodeDataUrl(value, format || 'code128');
    res.json({ dataUrl });
  } catch (e) { next(e); }
};
