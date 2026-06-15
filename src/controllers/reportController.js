const reportService = require('../services/reportService');

// GET /api/reports/dashboard
exports.dashboard = async (req, res, next) => {
  try { res.json(await reportService.dashboardSummary()); } catch (e) { next(e); }
};

// GET /api/reports/daily?date=2024-01-15
exports.daily = async (req, res, next) => {
  try { res.json(await reportService.dailySales(req.query.date)); } catch (e) { next(e); }
};

// GET /api/reports/weekly?date=2024-01-15
exports.weekly = async (req, res, next) => {
  try { res.json(await reportService.weeklySales(req.query.date)); } catch (e) { next(e); }
};

// GET /api/reports/monthly?year=2024&month=1
exports.monthly = async (req, res, next) => {
  try { res.json(await reportService.monthlySales(req.query)); } catch (e) { next(e); }
};

// GET /api/reports/inventory
exports.inventory = async (req, res, next) => {
  try { res.json(await reportService.inventoryReport()); } catch (e) { next(e); }
};

// GET /api/reports/top-products?from=2024-01-01&to=2024-01-31&limit=10
exports.topProducts = async (req, res, next) => {
  try { res.json(await reportService.topProducts(req.query)); } catch (e) { next(e); }
};

// GET /api/reports/employee?from=2024-01-01&to=2024-01-31
exports.employeePerformance = async (req, res, next) => {
  try { res.json(await reportService.employeePerformance(req.query)); } catch (e) { next(e); }
};

// GET /api/reports/profitability?from=2024-01-01&to=2024-01-31
exports.profitability = async (req, res, next) => {
  try { res.json(await reportService.profitabilityReport(req.query)); } catch (e) { next(e); }
};
