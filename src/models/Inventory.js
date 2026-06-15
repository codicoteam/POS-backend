const { query } = require('../config/database');

const Inventory = {
  async findAll() {
    const { rows } = await query(`
      SELECT
        i.*,
        p.name, p.sku, p.barcode, p.selling_price, p.cost_price,
        c.name AS category,
        (i.quantity <= i.low_stock_threshold) AS is_low_stock,
        (i.quantity * p.cost_price) AS stock_value
      FROM inventory i
      JOIN products p ON p.id = i.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_active = true
      ORDER BY p.name
    `);
    return rows;
  },

  async findByProductId(product_id) {
    const { rows } = await query(
      'SELECT * FROM inventory WHERE product_id = $1',
      [product_id]
    );
    return rows[0];
  },

  async findLowStock() {
    const { rows } = await query(`
      SELECT i.*, p.name, p.sku, p.barcode, c.name AS category
      FROM inventory i
      JOIN products p ON p.id = i.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE i.quantity <= i.low_stock_threshold AND p.is_active = true
      ORDER BY i.quantity ASC
    `);
    return rows;
  },

  async adjust({ product_id, quantity, note, user_id }) {
    await query(
      `UPDATE inventory SET quantity = $1, updated_at = NOW() WHERE product_id = $2`,
      [quantity, product_id]
    );
    await query(
      `INSERT INTO stock_movements (product_id, type, quantity, note, created_by)
       VALUES ($1, 'adjustment', $2, $3, $4)`,
      [product_id, quantity, note || null, user_id]
    );
  },

  async setThreshold(product_id, threshold) {
    await query(
      'UPDATE inventory SET low_stock_threshold = $1, updated_at = NOW() WHERE product_id = $2',
      [threshold, product_id]
    );
  },

  async getMovements(product_id, limit = 100) {
    const { rows } = await query(`
      SELECT sm.*, u.name AS created_by_name
      FROM stock_movements sm
      LEFT JOIN users u ON u.id = sm.created_by
      WHERE sm.product_id = $1
      ORDER BY sm.created_at DESC
      LIMIT $2
    `, [product_id, limit]);
    return rows;
  },
};

module.exports = Inventory;
