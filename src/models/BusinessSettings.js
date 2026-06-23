const { query } = require('../config/database');

const BusinessSettings = {
  async upsert({ business_id, vat_percentage = 0, currency = 'USD', receipt_footer = null, whatsapp_number = null, low_stock_threshold = 0 }) {
    const { rows } = await query(
      `INSERT INTO business_settings (business_id, vat_percentage, currency, receipt_footer, whatsapp_number, low_stock_threshold)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (business_id) DO UPDATE SET vat_percentage=EXCLUDED.vat_percentage, currency=EXCLUDED.currency, receipt_footer=EXCLUDED.receipt_footer, whatsapp_number=EXCLUDED.whatsapp_number, low_stock_threshold=EXCLUDED.low_stock_threshold
       RETURNING *`,
      [business_id, vat_percentage, currency, receipt_footer, whatsapp_number, low_stock_threshold]
    );
    return rows[0];
  },

  async findByBusiness(business_id) {
    const { rows } = await query('SELECT * FROM business_settings WHERE business_id=$1', [business_id]);
    return rows[0];
  },
};

module.exports = BusinessSettings;
