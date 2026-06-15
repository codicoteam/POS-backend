function errorHandler(err, req, res, next) {
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', err.stack || err.message);
  }

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    return res.status(409).json({ message: 'A record with that value already exists.' });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referenced record does not exist.' });
  }

  // PostgreSQL check constraint violation
  if (err.code === '23514') {
    return res.status(400).json({ message: 'Data constraint violated: ' + (err.detail || '') });
  }

  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
