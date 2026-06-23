const { query } = require('../config/database');

const SyncLog = {
  async create({ business_id, user_id, payload, type, status = 'pending' }) {
    const { rows } = await query('INSERT INTO sync_logs (business_id, user_id, payload, type, status) VALUES ($1,$2,$3,$4,$5) RETURNING *', [business_id, user_id, payload, type, status]);
    return rows[0];
  },
  async updateStatus(id, status) {
    const { rows } = await query('UPDATE sync_logs SET status=$1, processed_at=NOW() WHERE id=$2 RETURNING *', [status, id]);
    return rows[0];
  }
};

module.exports = SyncLog;
