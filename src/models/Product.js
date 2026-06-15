const { query } = require('../config/database');

const Product = {
  async findAll({ search = '', category_id, page = 1, limit = 50, active_only = true } = {}) {
    const params = [];
    let sql = `
      SELECT
        p.*,
        c.name AS category,
        COALESCE(i.quantity, 0) AS stock,
        i.low_stock_threshold
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN inventory i ON i.product_id = p.id
      WHERE 1=1
    `;

    if (active_only) sql += ' AND p.is_active = true';

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (p.name ILIKE $${params.length} OR p.barcode ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
    }

    if (category_id) {
      params.push(Number(category_id));
      sql += ` AND p.category_id = $${params.length}`;
    }

    sql += ` ORDER BY p.name LIMIT ${Number(limit)} OFFSET ${(Number(page) - 1) * Number(limit)}`;
    const { rows } = await query(sql, params);
    return rows;
  },

  async count({ search = '', category_id, active_only = true } = {}) {
    const params = [];
    let sql = 'SELECT COUNT(*) FROM products WHERE 1=1';
    if (active_only) sql += ' AND is_active = true';
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (name ILIKE $${params.length} OR barcode ILIKE $${params.length})`;
    }
    if (category_id) {
      params.push(Number(category_id));
      sql += ` AND category_id = $${params.length}`;
    }
    const { rows } = await query(sql, params);
    return Number(rows[0].count);
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT p.*, c.name AS category, COALESCE(i.quantity,0) AS stock, i.low_stock_threshold
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN inventory i ON i.product_id = p.id
       WHERE p.id = $1`,
      [id]
    );
    return rows[0];
  },

  async findByBarcode(barcode) {
    const { rows } = await query(
      `SELECT p.*, COALESCE(i.quantity,0) AS stock
       FROM products p
       LEFT JOIN inventory i ON i.product_id = p.id
       WHERE p.barcode = $1 AND p.is_active = true`,
      [barcode]
    );
    return rows[0];
  },

  async create({ name, sku, barcode, category_id, cost_price, selling_price, description, initial_stock = 0 }) {
    // Insert product
    const { rows } = await query(
      `INSERT INTO products (name, sku, barcode, category_id, cost_price, selling_price, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, sku || null, barcode || null, category_id || null, cost_price || 0, selling_price, description || null]
    );
    const product = rows[0];

    // Initialise inventory row
    await query(
      'INSERT INTO inventory (product_id, quantity) VALUES ($1, $2)',
      [product.id, initial_stock]
    );

    return product;
  },

  async update(id, fields) {
    const allowed = ['name', 'sku', 'barcode', 'category_id', 'cost_price', 'selling_price', 'description', 'is_active'];
    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (!keys.length) return this.findById(id);

    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const { rows } = await query(
      `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
      [...keys.map(k => fields[k]), id]
    );
    return rows[0];
  },

  async softDelete(id) {
    await query('UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);
  },
};

module.exports = Product;
