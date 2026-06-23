const Barcode = require('../models/Barcode');

exports.generate = async (req, res, next) => {
  try {
    const business_id = req.body.business_id || req.user.business_id;
    const { product_id, barcode_value } = req.body;
    const b = await Barcode.create({ business_id, product_id, barcode_value });
    res.status(201).json(b);
  } catch (e) { next(e); }
};

exports.print = async (req, res, next) => {
  try {
    // Placeholder - printing handled client-side or via label service
    res.json({ message: 'Print endpoint placeholder' });
  } catch (e) { next(e); }
};
