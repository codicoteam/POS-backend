const { pool } = require('../config/database');

const Sale = {
  /**
   * Create a sale inside a DB transaction.
   * items: [{ product_id, quantity, unit_price }]
   */
  async create({ customer_id, cashier_id, items, discount = 0, payment_method, amount_tendered, note }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const subtotal = items.reduce((sum, i) => sum + Number(i.unit_price) * Number(i.quantity), 0);
      const total    = subtotal - Number(discount);
      const change   = amount_tendered ? Number(amount_tendered) - total : null;

      // Insert sale header
      const { rows: [sale] } = await client.query(
        `INSERT INTO sales
           (customer_id, cashier_id, subtotal, discount, total, payment_method, amount_tendered, change_given, note)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [customer_id || null, cashier_id, subtotal, discount, total, payment_method, amount_tendered || null, change, note || null]
      );

      // Insert line items and update stock
      for (const item of items) {
        const lineTotal = Number(item.unit_price) * Number(item.quantity);

        await client.query(
          `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
           VALUES ($1,$2,$3,$4,$5)`,
          [sale.id, item.product_id, item.quantity, item.unit_price, lineTotal]
        );

        // Decrement inventory
        await client.query(
          `UPDATE inventory
           SET quantity = quantity - $1, updated_at = NOW()
           WHERE product_id = $2`,
          [item.quantity, item.product_id]
        );

        // Stock movement record
        await client.query(
          `INSERT INTO stock_movements (product_id, type, quantity, note, created_by)
           VALUES ($1, 'sale', $2, $3, $4)`,
          [item.product_id, -Number(item.quantity), `Sale #${sale.id}`, cashier_id]
        );
      }

      // Payment record
      await client.query(
        `INSERT INTO payments (sale_id, amount, method) VALUES ($1,$2,$3)`,
        [sale.id, total, payment_method]
      );

      // Generate receipt number
      const receiptNo = 'RCP-' + String(sale.id).padStart(6, '0');
      await client.query(
        `INSERT INTO receipts (sale_id, receipt_no, data)
         VALUES ($1, $2, $3)`,
        [sale.id, receiptNo, JSON.stringify({ sale_id: sale.id, total, items })]
      );

      // Loyalty points: 1 point per dollar (integer)
      if (customer_id) {
        await client.query(
          'UPDATE customers SET loyalty_pts = loyalty_pts + $1 WHERE id = $2',
          [Math.floor(total), customer_id]
        );
      }

      await client.query('COMMIT');
      return { ...sale, receipt_no: receiptNo };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async findAll({ from, to, cashier_id, status, page = 1, limit = 50 } = {}) {
    const params = [];
    let sql = `
      SELECT
        s.*,
        u.name  AS cashier,
        c.name  AS customer,
        r.receipt_no
      FROM sales s
      LEFT JOIN users     u ON u.id = s.cashier_id
      LEFT JOIN customers c ON c.id = s.customer_id
      LEFT JOIN receipts  r ON r.sale_id = s.id
      WHERE 1=1
    `;

    if (from)       { params.push(from);       sql += ` AND s.created_at >= $${params.length}`; }
    if (to)         { params.push(to);         sql += ` AND s.created_at <= $${params.length}`; }
    if (cashier_id) { params.push(cashier_id); sql += ` AND s.cashier_id = $${params.length}`; }
    if (status)     { params.push(status);     sql += ` AND s.status = $${params.length}`; }

    sql += ` ORDER BY s.created_at DESC LIMIT ${Number(limit)} OFFSET ${(Number(page) - 1) * Number(limit)}`;

    const { rows } = await pool.query(sql, params);
    return rows;
  },

  async findById(id) {
    const { rows: [sale] } = await pool.query(`
      SELECT s.*, u.name AS cashier, c.name AS customer, r.receipt_no
      FROM sales s
      LEFT JOIN users     u ON u.id = s.cashier_id
      LEFT JOIN customers c ON c.id = s.customer_id
      LEFT JOIN receipts  r ON r.sale_id = s.id
      WHERE s.id = $1
    `, [id]);

    if (!sale) return null;

    const { rows: items } = await pool.query(`
      SELECT si.*, p.name AS product_name, p.barcode, p.sku
      FROM sale_items si
      JOIN products p ON p.id = si.product_id
      WHERE si.sale_id = $1
    `, [id]);

    return { ...sale, items };
  },

  async refund(sale_id, { amount, reason, user_id }) {
    await pool.query(
      `INSERT INTO refunds (sale_id, amount, reason, created_by) VALUES ($1,$2,$3,$4)`,
      [sale_id, amount, reason || null, user_id]
    );
    await pool.query(`UPDATE sales SET status = 'refunded' WHERE id = $1`, [sale_id]);
  },
};

module.exports = Sale;
