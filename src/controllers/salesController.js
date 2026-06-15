const Sale = require('../models/Sale');
const receiptService = require('../services/receiptService');

// POST /api/sales
exports.create = async (req, res, next) => {
  try {
    const { items, payment_method } = req.body;
    if (!items || !items.length)
      return res.status(400).json({ message: 'items array is required.' });
    if (!payment_method)
      return res.status(400).json({ message: 'payment_method is required.' });

    const sale = await Sale.create({ ...req.body, cashier_id: req.user.id });
    res.status(201).json(sale);
  } catch (e) { next(e); }
};

// GET /api/sales
exports.list = async (req, res, next) => {
  try { res.json(await Sale.findAll(req.query)); } catch (e) { next(e); }
};

// GET /api/sales/:id
exports.get = async (req, res, next) => {
  try {
    const s = await Sale.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Sale not found.' });
    res.json(s);
  } catch (e) { next(e); }
};

// GET /api/sales/:id/receipt
exports.receipt = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found.' });
    const text = receiptService.buildText(sale, sale.items);
    res.json({ receipt_no: sale.receipt_no, text, sale });
  } catch (e) { next(e); }
};

// POST /api/sales/:id/refund
exports.refund = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    if (!amount) return res.status(400).json({ message: 'amount is required.' });
    await Sale.refund(req.params.id, { amount, reason, user_id: req.user.id });
    res.json({ message: 'Refund processed.' });
  } catch (e) { next(e); }
};
