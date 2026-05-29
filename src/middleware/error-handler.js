/**
 * 404 handler — must be placed after all routes
 */
function notFound(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.status(404).render('errors/404', { title: 'Page Not Found' });
}

/**
 * Global error handler
 */
function serverError(err, req, res, _next) {
  console.error('Unhandled error:', err);

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  if (req.path.startsWith('/api/')) {
    return res.status(status).json({ error: message });
  }

  res.status(status).render('errors/500', {
    title: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? message : null,
  });
}

module.exports = { notFound, serverError };
