/**
 * Receipt Service
 * Generates plain-text receipts suitable for thermal/POS printers (80mm roll).
 * Extend with ESC/POS commands or a printer SDK as needed.
 */

const receiptService = {

  buildText(sale, items, business = {}) {
    const biz = {
      name:    business.name    || 'MY BUSINESS',
      address: business.address || '',
      phone:   business.phone   || '',
      tagline: business.tagline || 'Thank you for shopping with us!',
    };

    const LINE_WIDTH = 42;
    const line       = '─'.repeat(LINE_WIDTH);
    const dline      = '═'.repeat(LINE_WIDTH);

    const center = (str) => {
      const pad = Math.max(0, Math.floor((LINE_WIDTH - str.length) / 2));
      return ' '.repeat(pad) + str;
    };

    const col = (left, right, width = LINE_WIDTH) => {
      const rightStr = String(right);
      const leftStr  = String(left).substring(0, width - rightStr.length - 1);
      const spaces   = width - leftStr.length - rightStr.length;
      return leftStr + ' '.repeat(Math.max(1, spaces)) + rightStr;
    };

    let r = '';

    // Header
    r += dline + '\n';
    r += center(biz.name) + '\n';
    if (biz.address) r += center(biz.address) + '\n';
    if (biz.phone)   r += center('Tel: ' + biz.phone) + '\n';
    r += dline + '\n';

    // Sale info
    r += col('Receipt No:', sale.receipt_no || ('#' + sale.id)) + '\n';
    r += col('Date:', new Date(sale.created_at).toLocaleString()) + '\n';
    r += col('Cashier:', sale.cashier || '') + '\n';
    if (sale.customer) r += col('Customer:', sale.customer) + '\n';
    r += line + '\n';

    // Column headers
    r += col('ITEM' + ' '.repeat(18), 'QTY  PRICE    TOTAL') + '\n';
    r += line + '\n';

    // Line items
    for (const item of items) {
      const productName = (item.product_name || item.name || '').substring(0, 22);
      const qty         = String(item.quantity).padStart(3);
      const price       = Number(item.unit_price).toFixed(2).padStart(7);
      const total       = Number(item.subtotal).toFixed(2).padStart(8);
      r += productName + '\n';
      r += ' '.repeat(23) + qty + price + total + '\n';
    }

    r += line + '\n';

    // Totals
    r += col('Subtotal:', '$' + Number(sale.subtotal || 0).toFixed(2)) + '\n';
    if (Number(sale.discount) > 0) {
      r += col('Discount:', '-$' + Number(sale.discount).toFixed(2)) + '\n';
    }
    r += col('TOTAL:', '$' + Number(sale.total).toFixed(2)) + '\n';
    r += line + '\n';

    // Payment
    r += col('Payment Method:', sale.payment_method || '') + '\n';
    if (sale.amount_tendered) {
      r += col('Tendered:', '$' + Number(sale.amount_tendered).toFixed(2)) + '\n';
      r += col('Change:', '$' + Number(sale.change_given || 0).toFixed(2)) + '\n';
    }

    r += dline + '\n';
    r += center(biz.tagline) + '\n';
    r += dline + '\n';

    return r;
  },

  /**
   * Returns a structured receipt object (useful for mobile apps / JSON APIs)
   */
  buildJson(sale, items) {
    return {
      receipt_no:     sale.receipt_no || ('#' + sale.id),
      date:           sale.created_at,
      cashier:        sale.cashier,
      customer:       sale.customer || null,
      items:          items.map(i => ({
        name:       i.product_name || i.name,
        quantity:   i.quantity,
        unit_price: Number(i.unit_price),
        subtotal:   Number(i.subtotal),
      })),
      subtotal:       Number(sale.subtotal || 0),
      discount:       Number(sale.discount || 0),
      total:          Number(sale.total),
      payment_method: sale.payment_method,
      amount_tendered: sale.amount_tendered ? Number(sale.amount_tendered) : null,
      change_given:   sale.change_given    ? Number(sale.change_given)    : null,
    };
  },
};

module.exports = receiptService;
