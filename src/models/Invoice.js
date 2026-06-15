const { query } = require('../config/database');

const Invoice = {
  async create(sale_id, pdf_path) {
    const { rows } = await query(
      'INSERT INTO invoices (sale_id,pdf_path) VALUES ($1,$2) RETURNING *',
      [sale_id, pdf_path]
    );
    return rows[0];
  },
  async findBySaleId(sale_id) {
    const { rows } = await query('SELECT * FROM invoices WHERE sale_id=$1', [sale_id]);
    return rows[0];
  },
};

module.exports = Invoice;
