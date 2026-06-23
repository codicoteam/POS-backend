const { query } = require('../config/database');

const SubscriptionPlan = {
  async create({ name, price, duration_days }) {
    const { rows } = await query(
      `INSERT INTO subscription_plans (name, price, duration_days) VALUES ($1,$2,$3) RETURNING *`,
      [name, price, duration_days]
    );
    return rows[0];
  },

  async findAll() {
    const { rows } = await query('SELECT * FROM subscription_plans ORDER BY price');
    return rows;
  },
};

module.exports = SubscriptionPlan;
