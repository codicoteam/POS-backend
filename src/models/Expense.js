const { query } = require('../config/database');

const Expense = {
  async create({ cashier_id, category, description, amount, expense_date }) {
    const { rows } = await query(
      `INSERT INTO expenses (cashier_id, category, description, amount, expense_date)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [cashier_id || null, category || null, description || null, amount, expense_date || new Date()]
    );
    return rows[0];
  },

  async findAll({ from, to, cashier_id } = {}) {
    const params = [];
    let sql = `SELECT e.*, u.name AS cashier FROM expenses e LEFT JOIN users u ON u.id = e.cashier_id WHERE 1=1`;
    if (from) { params.push(from); sql += ` AND e.expense_date >= $${params.length}`; }
    if (to)   { params.push(to);   sql += ` AND e.expense_date <= $${params.length}`; }
    if (cashier_id) { params.push(cashier_id); sql += ` AND e.cashier_id = $${params.length}`; }
    sql += ` ORDER BY e.expense_date DESC`;
    const { rows } = await query(sql, params);
    return rows;
  },

  async findById(id) {
    const { rows } = await query('SELECT e.*, u.name AS cashier FROM expenses e LEFT JOIN users u ON u.id = e.cashier_id WHERE e.id = $1', [id]);
    return rows[0];
  }
};

module.exports = Expense;
