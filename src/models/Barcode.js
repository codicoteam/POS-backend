const { query } = require('../config/database');

const Barcode = {
  async create({ business_id, product_id, barcode_value }) {
    const { rows } = await query('INSERT INTO barcodes (business_id, product_id, barcode_value) VALUES ($1,$2,$3) RETURNING *', [business_id, product_id, barcode_value]);
    return rows[0];
  },
};

module.exports = Barcode;
