const Customer = require('../models/Customer');

// GET /api/customers
exports.list = async (req, res, next) => {
  try { res.json(await Customer.findAll(req.query.search)); } catch (e) { next(e); }
};

// GET /api/customers/:id
exports.get = async (req, res, next) => {
  try {
    const c = await Customer.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Customer not found.' });
    res.json(c);
  } catch (e) { next(e); }
};

// POST /api/customers
exports.create = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required.' });
    res.status(201).json(await Customer.create(req.body));
  } catch (e) { next(e); }
};

// PUT /api/customers/:id
exports.update = async (req, res, next) => {
  try {
    res.json(await Customer.update(req.params.id, req.body));
  } catch (e) { next(e); }
};

// GET /api/customers/:id/history
exports.history = async (req, res, next) => {
  try { res.json(await Customer.getPurchaseHistory(req.params.id)); } catch (e) { next(e); }
};

// GET /api/customers/:id/stats
exports.stats = async (req, res, next) => {
  try { res.json(await Customer.getStats(req.params.id)); } catch (e) { next(e); }
};
