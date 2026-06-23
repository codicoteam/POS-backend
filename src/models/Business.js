const { query } = require('../config/database');

const Business = {
  async create({ name, phone, email, address, subscription_plan_id, status = 'active' }) {
    const { rows } = await query(
      `INSERT INTO businesses (name, phone, email, address, subscription_plan_id, status)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, phone, email, address, subscription_plan_id, status]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await query('SELECT * FROM businesses WHERE id=$1', [id]);
    return rows[0];
  },

  async findAll() {
    const { rows } = await query('SELECT * FROM businesses ORDER BY name');
    return rows;
  },
};

module.exports = Business;
