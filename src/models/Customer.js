const { query } = require('../config/database');

const Customer = {
  async findAll(search = '') {
    const params = [];
    let sql = 'SELECT * FROM customers WHERE 1=1';
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1)`;
    }
    sql += ' ORDER BY name';
    const { rows } = await query(sql, params);
    return rows;
  },

  async findById(id) {
    const { rows } = await query('SELECT * FROM customers WHERE id = $1', [id]);
    return rows[0];
  },

  async create({ name, phone, email }) {
    const { rows } = await query(
      `INSERT INTO customers (name, phone, email)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, phone || null, email || null]
    );
    return rows[0];
  },

  async update(id, { name, phone, email }) {
    const { rows } = await query(
      `UPDATE customers SET name=$1, phone=$2, email=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [name, phone || null, email || null, id]
    );
    return rows[0];
  },

  async getPurchaseHistory(id) {
    const { rows } = await query(`
      SELECT
        s.id, s.total, s.discount, s.payment_method, s.status, s.created_at,
        u.name AS cashier,
        COUNT(si.id) AS item_count
      FROM sales s
      LEFT JOIN users u ON u.id = s.cashier_id
      LEFT JOIN sale_items si ON si.sale_id = s.id
      WHERE s.customer_id = $1
      GROUP BY s.id, u.name
      ORDER BY s.created_at DESC
    `, [id]);
    return rows;
  },

  async addLoyaltyPoints(id, points) {
    await query(
      'UPDATE customers SET loyalty_pts = loyalty_pts + $1 WHERE id = $2',
      [points, id]
    );
  },

  async getStats(id) {
    const { rows } = await query(`
      SELECT
        COUNT(*)                          AS total_visits,
        COALESCE(SUM(total), 0)           AS total_spent,
        COALESCE(AVG(total), 0)           AS avg_spend,
        MAX(created_at)                   AS last_visit
      FROM sales
      WHERE customer_id = $1 AND status = 'completed'
    `, [id]);
    return rows[0];
  },
};

module.exports = Customer;
