const { query } = require('../config/database');

const Subscription = {
  async create({ business_id, plan_id, start_date, end_date, status = 'active' }) {
    const { rows } = await query(
      `INSERT INTO subscriptions (business_id, plan_id, start_date, end_date, status)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [business_id, plan_id, start_date, end_date, status]
    );
    return rows[0];
  },

  async findActiveByBusiness(business_id) {
    const { rows } = await query(
      `SELECT * FROM subscriptions WHERE business_id=$1 AND status='active' AND (end_date IS NULL OR end_date >= CURRENT_DATE) ORDER BY start_date DESC LIMIT 1`,
      [business_id]
    );
    return rows[0];
  },
};

module.exports = Subscription;
