const { query } = require('../config/database');

const auditLog = (action, entity) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (data) => {
    if (res.statusCode < 400 && req.user) {
      try {
        await query(
          `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            req.user.id,
            action,
            entity,
            data?.data?.id || req.params.id || null,
            JSON.stringify({ method: req.method, body: req.body }),
            req.ip,
          ]
        );
      } catch (_) {}
    }
    return originalJson(data);
  };
  next();
};

module.exports = { auditLog };
