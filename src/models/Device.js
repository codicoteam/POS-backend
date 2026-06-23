const { query } = require('../config/database');

const Device = {
  async create({ business_id, user_id, device_id, device_name, status = 'registered' }) {
    const { rows } = await query(
      `INSERT INTO devices (business_id, user_id, device_id, device_name, status) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [business_id || null, user_id || null, device_id, device_name || null, status]
    );
    return rows[0];
  },

  async findByDeviceId(device_id) {
    const { rows } = await query('SELECT * FROM devices WHERE device_id = $1', [device_id]);
    return rows[0];
  },

  async findAll() {
    const { rows } = await query('SELECT d.*, u.name AS user_name FROM devices d LEFT JOIN users u ON u.id = d.user_id ORDER BY d.registered_at DESC');
    return rows;
  }
};

module.exports = Device;
