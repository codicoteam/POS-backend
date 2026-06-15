const whatsappService = require('../services/whatsappService');
const reportService   = require('../services/reportService');
const { WHATSAPP_VERIFY_TOKEN } = require('../config/environment');

// GET /api/whatsapp/webhook  — webhook verification by Meta
exports.verify = (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
};

// POST /api/whatsapp/webhook  — incoming messages from Meta
exports.webhook = async (req, res, next) => {
  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return res.sendStatus(404);

    const entry    = body.entry?.[0];
    const changes  = entry?.changes?.[0];
    const value    = changes?.value;
    const messages = value?.messages;

    if (!messages || !messages.length) return res.sendStatus(200);

    const msg  = messages[0];
    const from = msg.from;
    const text = (msg.text?.body || '').toLowerCase().trim();

    let replyText = '';

    if (text.includes('sales today') || text === 'sales') {
      const data = await reportService.dailySales();
      replyText  = `*Sales Today*\nTransactions: ${data.transactions}\nRevenue: $${Number(data.revenue).toFixed(2)}\nDiscounts: $${Number(data.discounts).toFixed(2)}`;

    } else if (text.includes('top products')) {
      const products = await reportService.topProducts({ limit: 5 });
      replyText = '*Top 5 Products Today*\n' +
        products.map((p, i) => `${i + 1}. ${p.name} — ${p.units_sold} sold`).join('\n');

    } else if (text.includes('low stock')) {
      const items = await reportService.lowStockItems();
      if (!items.length) {
        replyText = 'No low stock items at the moment.';
      } else {
        replyText = '*Low Stock Alert*\n' +
          items.map(i => `• ${i.name}: ${i.quantity} left (min: ${i.low_stock_threshold})`).join('\n');
      }

    } else if (text.includes('monthly') || text.includes('this month')) {
      const now   = new Date();
      const rows  = await reportService.monthlySales({ year: now.getFullYear(), month: now.getMonth() + 1 });
      const total = rows.reduce((s, r) => s + Number(r.revenue), 0);
      replyText   = `*Monthly Sales (${now.toLocaleString('default', { month: 'long' })})*\nTotal Revenue: $${total.toFixed(2)}\nDays recorded: ${rows.length}`;

    } else {
      replyText = `*RMS Assistant*\nAvailable commands:\n• sales today\n• top products\n• low stock\n• monthly sales`;
    }

    await whatsappService.sendText(from, replyText);
    res.sendStatus(200);
  } catch (e) { next(e); }
};

// POST /api/whatsapp/send-daily-summary  — manual trigger or cron
exports.sendDailySummary = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'phone is required.' });
    const summary = await reportService.dailySales();
    await whatsappService.sendDailySummary(phone, summary);
    res.json({ message: 'Daily summary sent.' });
  } catch (e) { next(e); }
};
