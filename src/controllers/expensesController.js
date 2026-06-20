const Expense = require('../models/Expense');

exports.create = async (req, res, next) => {
  try {
    const { category, description, amount, expense_date } = req.body;
    if (amount === undefined) return res.status(400).json({ message: 'amount is required.' });
    const e = await Expense.create({ cashier_id: req.user.id, category, description, amount, expense_date });
    res.status(201).json(e);
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try { res.json(await Expense.findAll(req.query)); } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const e = await Expense.findById(req.params.id);
    if (!e) return res.status(404).json({ message: 'Expense not found.' });
    res.json(e);
  } catch (e) { next(e); }
};
