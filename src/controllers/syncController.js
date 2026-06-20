const Sale = require('../models/Sale');

// Accept an array of sales from offline device and create them server-side
exports.syncQueue = async (req, res, next) => {
  try {
    const { sales } = req.body;
    if (!Array.isArray(sales)) return res.status(400).json({ message: 'sales array required.' });

    const results = [];
    for (const s of sales) {
      // Ensure cashier_id is set to the authenticated user if not provided
      const saleObj = { ...s, cashier_id: req.user.id };
      const created = await Sale.create(saleObj);
      results.push(created);
    }

    res.json({ synced: results.length, sales: results });
  } catch (e) { next(e); }
};
