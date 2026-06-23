const { query } = require('../config/database');

const Notification = {
  async create({ business_id, user_id, type, title, body, data = null }) {
    const { rows } = await query(
      'INSERT INTO notifications (business_id, user_id, type, title, body, data) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [business_id, user_id, type, title, body, data]
    );
    return rows[0];
  },

  async listForBusiness(business_id, limit = 50) {
    const { rows } = await query('SELECT * FROM notifications WHERE business_id=$1 ORDER BY created_at DESC LIMIT $2', [business_id, limit]);
    return rows;
  },
};

module.exports = Notification;
