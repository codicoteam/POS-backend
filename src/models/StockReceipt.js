const { query } = require('../config/database');

const StockReceipt = {
  async create({ business_id, supplier, received_by, total_amount }) {
    const { rows } = await query(
      'INSERT INTO stock_receipts (business_id, supplier, received_by, total_amount) VALUES ($1,$2,$3,$4) RETURNING *',
      [business_id, supplier, received_by, total_amount]
    );
    return rows[0];
  },

  async addItem({ stock_receipt_id, product_id, quantity, unit_cost }) {
    const { rows } = await query(
      'INSERT INTO stock_receipt_items (stock_receipt_id, product_id, quantity, unit_cost) VALUES ($1,$2,$3,$4) RETURNING *',
      [stock_receipt_id, product_id, quantity, unit_cost]
    );
    return rows[0];
  },
};

module.exports = StockReceipt;
