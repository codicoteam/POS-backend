const { pool } = require('../config/database');

const Purchase = {
  async create({ supplier_id, user_id, items }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const total = items.reduce((s, i) => s + i.cost_price * i.quantity, 0);

      const { rows: [purchase] } = await client.query(
        'INSERT INTO purchases (supplier_id,user_id,total) VALUES ($1,$2,$3) RETURNING *',
        [supplier_id, user_id, total]
      );

      for (const item of items) {
        await client.query(
          'INSERT INTO purchase_items (purchase_id,product_id,quantity,cost_price) VALUES ($1,$2,$3,$4)',
          [purchase.id, item.product_id, item.quantity, item.cost_price]
        );
        await client.query(
          'UPDATE inventory SET quantity = quantity + $1, updated_at=NOW() WHERE product_id=$2',
          [item.quantity, item.product_id]
        );
        await client.query(
          'INSERT INTO stock_movements (product_id,type,quantity,note,created_by) VALUES ($1,$2,$3,$4,$5)',
          [item.product_id, 'purchase', item.quantity, `Purchase #${purchase.id}`, user_id]
        );
      }

      await client.query(
        'UPDATE suppliers SET balance_owed = balance_owed + $1 WHERE id=$2',
        [total, supplier_id]
      );

      await client.query('COMMIT');
      return purchase;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async findAll({ supplier_id, page = 1, limit = 50 } = {}) {
    let sql = `SELECT p.*, s.name AS supplier, u.name AS created_by
               FROM purchases p
               LEFT JOIN suppliers s ON s.id=p.supplier_id
               LEFT JOIN users u ON u.id=p.user_id WHERE 1=1`;
    const params = [];
    if (supplier_id) { params.push(supplier_id); sql += ` AND p.supplier_id=$${params.length}`; }
    sql += ` ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${(page-1)*limit}`;
    const { rows } = await pool.query(sql, params);
    return rows;
  },

  async findById(id) {
    const { rows: [purchase] } = await pool.query(
      `SELECT p.*, s.name AS supplier FROM purchases p
       LEFT JOIN suppliers s ON s.id=p.supplier_id WHERE p.id=$1`, [id]
    );
    if (!purchase) return null;
    const { rows: items } = await pool.query(
      `SELECT pi.*, pr.name AS product_name FROM purchase_items pi
       JOIN products pr ON pr.id=pi.product_id WHERE pi.purchase_id=$1`, [id]
    );
    return { ...purchase, items };
  },
};

module.exports = Purchase;
