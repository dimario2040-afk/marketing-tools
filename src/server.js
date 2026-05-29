const app = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  try {
    const { init } = require('./db/init');
    const { ensureTable } = require('./services/shortener');
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

main();
