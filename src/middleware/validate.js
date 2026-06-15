/**
 * Simple request body validation middleware
 * Usage: validate(['name','email','password'])
 */
function validate(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter(f => {
      const val = req.body[f];
      return val === undefined || val === null || String(val).trim() === '';
    });
    if (missing.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields: ' + missing.join(', '),
      });
    }
    next();
  };
}

module.exports = { validate };
