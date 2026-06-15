const { query } = require('../config/database');

const Payment = {
  async create({ sale_id, amount, method }) {
    const { rows } = await query(
      'INSERT INTO payments (sale_id,amount,method) VALUES ($1,$2,$3) RETURNING *',
      [sale_id, amount, method]
    );
    return rows[0];
  },
  async findBySaleId(sale_id) {
    const { rows } = await query('SELECT * FROM payments WHERE sale_id=$1', [sale_id]);
    return rows;
  },
};

module.exports = Payment;
