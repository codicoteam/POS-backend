const { query } = require('../config/database');

const Shift = {
  async start({ user_id, start_time = new Date() }) {
    const { rows } = await query(
      `INSERT INTO shifts (user_id, start_time, status) VALUES ($1,$2,'open') RETURNING *`,
      [user_id, start_time]
    );
    return rows[0];
  },

  async end(shift_id, { end_time = new Date() }) {
    const { rows } = await query(
      `UPDATE shifts SET end_time = $1, status = 'closed' WHERE id = $2 RETURNING *`,
      [end_time, shift_id]
    );
    return rows[0];
  },

  async findByUser(user_id, limit = 100) {
    const { rows } = await query(`SELECT * FROM shifts WHERE user_id = $1 ORDER BY start_time DESC LIMIT $2`, [user_id, limit]);
    return rows;
  },
};

module.exports = Shift;
