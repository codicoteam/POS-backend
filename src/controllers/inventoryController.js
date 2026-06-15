const Inventory = require('../models/Inventory');

// GET /api/inventory
exports.list = async (req, res, next) => {
  try { res.json(await Inventory.findAll()); } catch (e) { next(e); }
};

// GET /api/inventory/low-stock
exports.lowStock = async (req, res, next) => {
  try { res.json(await Inventory.findLowStock()); } catch (e) { next(e); }
};

// POST /api/inventory/adjust
exports.adjust = async (req, res, next) => {
  try {
    const { product_id, quantity, note } = req.body;
    if (!product_id || quantity === undefined)
      return res.status(400).json({ message: 'product_id and quantity are required.' });

    await Inventory.adjust({ product_id, quantity: Number(quantity), note, user_id: req.user.id });
    res.json({ message: 'Stock adjusted successfully.' });
  } catch (e) { next(e); }
};

// PUT /api/inventory/threshold/:product_id
exports.setThreshold = async (req, res, next) => {
  try {
    const { threshold } = req.body;
    if (threshold === undefined)
      return res.status(400).json({ message: 'threshold is required.' });
    await Inventory.setThreshold(req.params.product_id, Number(threshold));
    res.json({ message: 'Threshold updated.' });
  } catch (e) { next(e); }
};

// GET /api/inventory/movements/:product_id
exports.movements = async (req, res, next) => {
  try {
    res.json(await Inventory.getMovements(req.params.product_id, req.query.limit));
  } catch (e) { next(e); }
};
