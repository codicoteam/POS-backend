const StockReceipt = require('../models/StockReceipt');

exports.receive = async (req, res, next) => {
  try {
    const business_id = req.body.business_id || req.user.business_id;
    const { supplier, items } = req.body;
    const receipt = await StockReceipt.create({ business_id, supplier, received_by: req.user.id, total_amount: req.body.total_amount || 0 });

    if (Array.isArray(items)) {
      for (const it of items) {
        await StockReceipt.addItem({ stock_receipt_id: receipt.id, product_id: it.product_id, quantity: it.quantity, unit_cost: it.unit_cost });
      }
    }

    res.status(201).json(receipt);
  } catch (e) { next(e); }
};
