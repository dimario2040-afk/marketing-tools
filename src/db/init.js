/**
 * Database initialisation — dual SQLite (local) / PostgreSQL (production).
 *
 * - If DATABASE_URL is set, connect to PostgreSQL via `pg`.
 * - Otherwise use `sql.js` (pure-JS SQLite, no native build required).
 */

let db = null;
let mode = 'sqlite';

async function init() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (DATABASE_URL) {
    // ── PostgreSQL ──────────────────────────────────────────
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: DATABASE_URL });
    // Test connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();

    db = pool;
    mode = 'postgres';
    console.log('DB: PostgreSQL connected');
    return db;
  }

  // ── SQLite (sql.js) ──────────────────────────────────────
  const initSqlJs = require('sql.js');
  const fs = require('fs');
  const path = require('path');

  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, '..', '..', 'shortener.db');

  let buffer;
  try {
    buffer = fs.readFileSync(dbPath);
  } catch {
    buffer = null;
  }

  const sqlDb = new SQL.Database(buffer);
  db = sqlDb;
  mode = 'sqlite';

  // Persist to disk on changes
  let saveQueued = false;
  function persist() {
    if (saveQueued) return;
    saveQueued = true;
    setImmediate(() => {
      try {
        const data = sqlDb.export();
        fs.writeFileSync(dbPath, Buffer.from(data));
      } catch (err) {
        console.error('Failed to persist SQLite DB:', err.message);
      }
      saveQueued = false;
    });
  }

  // Wrap sql.js methods to auto-save after write statements
  const origRun = sqlDb.run.bind(sqlDb);
  sqlDb.run = function (...args) {
    origRun(...args);
    persist();
  };
  const origExec = sqlDb.exec.bind(sqlDb);
  sqlDb.exec = function (...args) {
    origExec(...args);
    persist();
  };

  db._persist = persist;
  db._close = () => sqlDb.close();

  console.log('DB: SQLite (sql.js) ready');
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialised. Call init() first.');
  return db;
}

function getMode() {
  return mode;
}

module.exports = { init, getDb, getMode };
