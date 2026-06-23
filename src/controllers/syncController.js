const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Refund = require('../models/Refund');
const SyncLog = require('../models/SyncLog');

// Accept an array of items from offline device and create them server-side
// Body: { type: 'sales'|'expenses'|'refunds', items: [...] } or legacy { sales: [...] }
exports.syncQueue = async (req, res, next) => {
  try {
    const business_id = req.user.business_id;
    const user_id = req.user.id;
    const payload = req.body;
    const type = req.body.type || (Array.isArray(req.body.sales) ? 'sales' : null);

    if (!type) return res.status(400).json({ message: 'type required (sales|expenses|refunds) or provide sales array.' });

    const items = req.body.items || req.body[type] || req.body.sales;
    if (!Array.isArray(items)) return res.status(400).json({ message: 'items array required.' });

    // Create a sync log entry
    const log = await SyncLog.create({ business_id, user_id, payload, type, status: 'processing' });

    const results = [];
    const errors = [];

    for (const it of items) {
      try {
        if (type === 'sales') {
          const saleObj = { ...it, cashier_id: user_id };
          const created = await Sale.create(saleObj);
          results.push({ type: 'sale', id: created.id });
        } else if (type === 'expenses') {
          const created = await Expense.create({ ...it, cashier_id: user_id });
          results.push({ type: 'expense', id: created.id });
        } else if (type === 'refunds') {
          const created = await Refund.create({ business_id, sale_id: it.sale_id, cashier_id: user_id, reason: it.reason, amount: it.amount });
          results.push({ type: 'refund', id: created.id });
        } else {
          // Unknown type — store as-is
          results.push({ type: 'unknown', payload: it });
        }
      } catch (err) {
        errors.push({ item: it, error: err.message || String(err) });
      }
    }

    if (errors.length === 0) {
      await SyncLog.updateStatus(log.id, 'processed');
      res.json({ synced: results.length, results });
    } else {
      await SyncLog.updateStatus(log.id, 'failed');
      res.status(207).json({ synced: results.length, results, errors });
    }
  } catch (e) { next(e); }
};
