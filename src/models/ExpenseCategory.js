const { query } = require('../config/database');

const ExpenseCategory = {
  async create({ business_id, name }) {
    const { rows } = await query('INSERT INTO expense_categories (business_id, name) VALUES ($1,$2) RETURNING *', [business_id, name]);
    return rows[0];
  },

  async findAll(business_id) {
    const { rows } = await query('SELECT * FROM expense_categories WHERE business_id=$1 ORDER BY name', [business_id]);
    return rows;
  },
};

module.exports = ExpenseCategory;
