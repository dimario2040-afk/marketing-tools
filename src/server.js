const app = require('./app');
const { init } = require('./db/init');
const { ensureTable } = require('./services/shortener');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    await init();
    await ensureTable();
    console.log('Database ready');
  } catch (err) {
    console.error('Database init error (non-fatal):', err.message);
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`Marketing Tools running on http://${HOST}:${PORT}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...');
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down...');
    server.close(() => process.exit(0));
  });
}

start();

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});

module.exports = server;
