const { query } = require('../config/database');

const reportService = {

  // ── Dashboard ────────────────────────────────────────────────────────────
  async dashboardSummary() {
    const today = new Date().toISOString().slice(0, 10);

    const [todayRow, lowStockRow, topTodayRows, revenueWeekRows] = await Promise.all([
      query(
        `SELECT
           COUNT(*)                        AS transactions,
           COALESCE(SUM(total), 0)         AS revenue,
           COALESCE(SUM(discount), 0)      AS discounts
         FROM sales
         WHERE DATE(created_at) = $1 AND status = 'completed'`,
        [today]
      ),
      query(
        `SELECT COUNT(*) AS count
         FROM inventory
         WHERE quantity <= low_stock_threshold`
      ),
      query(
        `SELECT p.name, SUM(si.quantity) AS units_sold, SUM(si.subtotal) AS revenue
         FROM sale_items si
         JOIN products p ON p.id = si.product_id
         JOIN sales s    ON s.id = si.sale_id
         WHERE DATE(s.created_at) = $1 AND s.status = 'completed'
         GROUP BY p.id
         ORDER BY units_sold DESC
         LIMIT 5`,
        [today]
      ),
      query(
        `SELECT DATE(created_at) AS day, COALESCE(SUM(total), 0) AS revenue
         FROM sales
         WHERE created_at >= NOW() - INTERVAL '7 days' AND status = 'completed'
         GROUP BY day
         ORDER BY day`
      ),
    ]);

    return {
      today:             todayRow.rows[0],
      low_stock_count:   Number(lowStockRow.rows[0].count),
      top_products_today: topTodayRows.rows,
      revenue_last_7_days: revenueWeekRows.rows,
    };
  },

  // ── Daily ────────────────────────────────────────────────────────────────
  async dailySales(date = new Date().toISOString().slice(0, 10)) {
    const [summary, byHour, items] = await Promise.all([
      query(
        `SELECT
           COUNT(*)                    AS transactions,
           COALESCE(SUM(total), 0)     AS revenue,
           COALESCE(SUM(discount), 0)  AS discounts,
           COALESCE(AVG(total), 0)     AS avg_sale
         FROM sales
         WHERE DATE(created_at) = $1 AND status = 'completed'`,
        [date]
      ),
      query(
        `SELECT EXTRACT(HOUR FROM created_at) AS hour, COUNT(*) AS transactions, SUM(total) AS revenue
         FROM sales
         WHERE DATE(created_at) = $1 AND status = 'completed'
         GROUP BY hour ORDER BY hour`,
        [date]
      ),
      query(
        `SELECT p.name, SUM(si.quantity) AS units_sold, SUM(si.subtotal) AS revenue
         FROM sale_items si
         JOIN products p ON p.id = si.product_id
         JOIN sales s    ON s.id = si.sale_id
         WHERE DATE(s.created_at) = $1 AND s.status = 'completed'
         GROUP BY p.id ORDER BY units_sold DESC LIMIT 10`,
        [date]
      ),
    ]);

    return {
      date,
      summary:    summary.rows[0],
      by_hour:    byHour.rows,
      top_items:  items.rows,
    };
  },

  // ── Weekly ───────────────────────────────────────────────────────────────
  async weeklySales(dateInWeek = new Date().toISOString().slice(0, 10)) {
    const { rows } = await query(
      `SELECT
         DATE(created_at)           AS day,
         COUNT(*)                   AS transactions,
         COALESCE(SUM(total), 0)    AS revenue,
         COALESCE(SUM(discount), 0) AS discounts
       FROM sales
       WHERE created_at >= DATE_TRUNC('week', $1::date)
         AND created_at <  DATE_TRUNC('week', $1::date) + INTERVAL '7 days'
         AND status = 'completed'
       GROUP BY day ORDER BY day`,
      [dateInWeek]
    );
    const total = rows.reduce((s, r) => s + Number(r.revenue), 0);
    return { week_start: dateInWeek, days: rows, total_revenue: total };
  },

  // ── Monthly ──────────────────────────────────────────────────────────────
  async monthlySales({ year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = {}) {
    const [daily, summary] = await Promise.all([
      query(
        `SELECT
           DATE(created_at)           AS day,
           COUNT(*)                   AS transactions,
           COALESCE(SUM(total), 0)    AS revenue,
           COALESCE(SUM(discount), 0) AS discounts
         FROM sales
         WHERE EXTRACT(YEAR  FROM created_at) = $1
           AND EXTRACT(MONTH FROM created_at) = $2
           AND status = 'completed'
         GROUP BY day ORDER BY day`,
        [year, month]
      ),
      query(
        `SELECT
           COUNT(*)                    AS transactions,
           COALESCE(SUM(total), 0)     AS revenue,
           COALESCE(SUM(discount), 0)  AS discounts,
           COALESCE(AVG(total), 0)     AS avg_sale
         FROM sales
         WHERE EXTRACT(YEAR  FROM created_at) = $1
           AND EXTRACT(MONTH FROM created_at) = $2
           AND status = 'completed'`,
        [year, month]
      ),
    ]);

    return { year, month, summary: summary.rows[0], daily: daily.rows };
  },

  // ── Inventory Report ─────────────────────────────────────────────────────
  async inventoryReport() {
    const { rows } = await query(
      `SELECT
         p.name, p.sku, p.barcode,
         c.name                          AS category,
         i.quantity,
         i.low_stock_threshold,
         (i.quantity <= i.low_stock_threshold) AS is_low_stock,
         (p.cost_price    * i.quantity)  AS stock_cost_value,
         (p.selling_price * i.quantity)  AS stock_retail_value
       FROM inventory i
       JOIN products p    ON p.id = i.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = true
       ORDER BY p.name`
    );
    const totalCost   = rows.reduce((s, r) => s + Number(r.stock_cost_value),   0);
    const totalRetail = rows.reduce((s, r) => s + Number(r.stock_retail_value), 0);
    return { items: rows, total_cost_value: totalCost, total_retail_value: totalRetail };
  },

  // ── Low Stock Items ──────────────────────────────────────────────────────
  async lowStockItems() {
    const { rows } = await query(
      `SELECT i.quantity, i.low_stock_threshold, p.name, p.sku, p.barcode
       FROM inventory i
       JOIN products p ON p.id = i.product_id
       WHERE i.quantity <= i.low_stock_threshold AND p.is_active = true
       ORDER BY i.quantity ASC`
    );
    return rows;
  },

  // ── Top Products ─────────────────────────────────────────────────────────
  async topProducts({ from, to, limit = 10 } = {}) {
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const defaultTo   = now.toISOString();

    const { rows } = await query(
      `SELECT
         p.id, p.name, p.sku,
         SUM(si.quantity)  AS units_sold,
         SUM(si.subtotal)  AS revenue
       FROM sale_items si
       JOIN products p ON p.id = si.product_id
       JOIN sales s    ON s.id = si.sale_id
       WHERE s.created_at BETWEEN $1 AND $2
         AND s.status = 'completed'
       GROUP BY p.id
       ORDER BY units_sold DESC
       LIMIT $3`,
      [from || defaultFrom, to || defaultTo, Number(limit)]
    );
    return rows;
  },

  // ── Employee Performance ─────────────────────────────────────────────────
  async employeePerformance({ from, to } = {}) {
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const defaultTo   = now.toISOString();

    const { rows } = await query(
      `SELECT
         u.id, u.name,
         COUNT(s.id)                AS total_sales,
         COALESCE(SUM(s.total), 0)  AS total_revenue,
         COALESCE(AVG(s.total), 0)  AS avg_sale_value
       FROM users u
       LEFT JOIN sales s ON s.cashier_id = u.id
         AND s.created_at BETWEEN $1 AND $2
         AND s.status = 'completed'
       JOIN roles r ON r.id = u.role_id
       WHERE r.name IN ('cashier', 'manager')
       GROUP BY u.id
       ORDER BY total_revenue DESC`,
      [from || defaultFrom, to || defaultTo]
    );
    return rows;
  },

  // ── Profitability ────────────────────────────────────────────────────────
  async profitabilityReport({ from, to } = {}) {
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const defaultTo   = now.toISOString();

    const { rows } = await query(
      `SELECT
         p.name,
         SUM(si.quantity)                                    AS units_sold,
         SUM(si.subtotal)                                    AS revenue,
         SUM(p.cost_price * si.quantity)                     AS cost,
         SUM(si.subtotal) - SUM(p.cost_price * si.quantity)  AS gross_profit,
         ROUND(
           (SUM(si.subtotal) - SUM(p.cost_price * si.quantity))
           / NULLIF(SUM(si.subtotal), 0) * 100, 2
         )                                                   AS margin_pct
       FROM sale_items si
       JOIN products p ON p.id = si.product_id
       JOIN sales s    ON s.id = si.sale_id
       WHERE s.created_at BETWEEN $1 AND $2
         AND s.status = 'completed'
       GROUP BY p.id
       ORDER BY gross_profit DESC`,
      [from || defaultFrom, to || defaultTo]
    );

    const totals = rows.reduce((acc, r) => ({
      revenue:      acc.revenue      + Number(r.revenue),
      cost:         acc.cost         + Number(r.cost),
      gross_profit: acc.gross_profit + Number(r.gross_profit),
    }), { revenue: 0, cost: 0, gross_profit: 0 });

    return { from: from || defaultFrom, to: to || defaultTo, products: rows, totals };
  },
};

module.exports = reportService;
