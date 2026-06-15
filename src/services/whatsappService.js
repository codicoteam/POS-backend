const { WHATSAPP_TOKEN, WHATSAPP_PHONE_ID } = require('../config/environment');

const BASE_URL = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`;

async function sendMessage(to, body) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    console.log('[WhatsApp STUB] To:', to, '\nMessage:', body);
    return;
  }
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + WHATSAPP_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('WhatsApp API error: ' + err);
  }
  return res.json();
}

const whatsappService = {
  async sendText(to, text) {
    return sendMessage(to, text);
  },

  async sendDailySummary(phone, summary) {
    const text =
      `*RMS Daily Summary*\n` +
      `Transactions: ${summary.transactions}\n` +
      `Revenue: $${Number(summary.revenue).toFixed(2)}\n` +
      `Discounts: $${Number(summary.discounts).toFixed(2)}`;
    return sendMessage(phone, text);
  },

  async sendLowStockAlert(phone, products) {
    const list = products.map(p => `• ${p.name}: ${p.quantity} left (min ${p.low_stock_threshold})`).join('\n');
    const text = `*Low Stock Alert*\n${list}`;
    return sendMessage(phone, text);
  },
};

module.exports = whatsappService;
