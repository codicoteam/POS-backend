const Refund = require('../models/Refund');

exports.create = async (req, res, next) => {
  try {
    const business_id = req.body.business_id || req.user.business_id;
    const { sale_id, reason, amount } = req.body;
    const r = await Refund.create({ business_id, sale_id, cashier_id: req.user.id, reason, amount });
    res.status(201).json(r);
  } catch (e) { next(e); }
};
