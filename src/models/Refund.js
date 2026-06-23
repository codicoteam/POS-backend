const { query } = require('../config/database');

const Refund = {
  async create({ business_id, sale_id, cashier_id, reason, amount }) {
    const { rows } = await query(
      'INSERT INTO refunds (business_id, sale_id, cashier_id, reason, amount) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [business_id, sale_id, cashier_id, reason, amount]
    );
    return rows[0];
  },
};

module.exports = Refund;
