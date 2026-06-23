const { query } = require('../config/database');

async function requireActiveSubscription(req, res, next) {
  try {
    const business_id = req.user && req.user.business_id;
    if (!business_id) return res.status(400).json({ message: 'Business context missing.' });

    const { rows } = await query('SELECT * FROM subscriptions WHERE business_id=$1 AND status=$2 AND (end_date IS NULL OR end_date >= CURRENT_DATE) ORDER BY start_date DESC LIMIT 1', [business_id, 'active']);
    if (!rows[0]) return res.status(403).json({ message: 'Subscription inactive. Please renew.' });
    next();
  } catch (e) { next(e); }
}

module.exports = { requireActiveSubscription };
