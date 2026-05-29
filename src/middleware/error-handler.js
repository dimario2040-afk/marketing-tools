/**
 * 404 handler — must be placed after all routes
 */
function notFound(req, res, next) {
  const t = res.locals.t || function (k) { return k; };
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.status(404).render('errors/404', { title: t('errors.404_title') });
}

/**
 * Global error handler
 */
function serverError(err, req, res, _next) {
  const t = res.locals.t || function (k) { return k; };
  console.error('Unhandled error:', err);

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  if (req.path.startsWith('/api/')) {
    return res.status(status).json({ error: message });
  }

  res.status(status).render('errors/500', {
    title: t('errors.500_title'),
    error: process.env.NODE_ENV === 'development' ? message : null,
  });
}

module.exports = { notFound, serverError };
