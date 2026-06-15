const { query } = require('../config/database');

const Supplier = {
  async findAll() {
    const { rows } = await query('SELECT * FROM suppliers ORDER BY name');
    return rows;
  },

  async findById(id) {
    const { rows } = await query('SELECT * FROM suppliers WHERE id=$1', [id]);
    return rows[0];
  },

  async create({ name, contact_name, phone, email }) {
    const { rows } = await query(
      'INSERT INTO suppliers (name,contact_name,phone,email) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, contact_name, phone, email]
    );
    return rows[0];
  },

  async update(id, { name, contact_name, phone, email }) {
    const { rows } = await query(
      'UPDATE suppliers SET name=$1,contact_name=$2,phone=$3,email=$4 WHERE id=$5 RETURNING *',
      [name, contact_name, phone, email, id]
    );
    return rows[0];
  },

  async updateBalance(id, amount) {
    await query('UPDATE suppliers SET balance_owed = balance_owed + $1 WHERE id=$2', [amount, id]);
  },

  async getPurchaseHistory(id) {
    const { rows } = await query(
      `SELECT p.*, u.name AS created_by FROM purchases p
       LEFT JOIN users u ON u.id=p.user_id
       WHERE p.supplier_id=$1 ORDER BY p.created_at DESC`,
      [id]
    );
    return rows;
  },
};

module.exports = Supplier;
