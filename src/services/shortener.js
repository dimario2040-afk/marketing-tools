/**
 * URL Shortener service.
 *
 * Creates short links and resolves them via SQLite (local) or PostgreSQL (prod).
 */

const crypto = require('crypto');
const { init, getDb, getMode } = require('../db/init');
const { all, get, run } = require('../db/query');

const TABLE = 'shortened_links';
const ID_LENGTH = 7;

async function ensureTable() {
  const mode = getMode();
  if (mode === 'postgres') {
    await run(`
      CREATE TABLE IF NOT EXISTS ${TABLE} (
        id VARCHAR(${ID_LENGTH}) PRIMARY KEY,
        original_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  } else {
    // SQLite
    await run(`
      CREATE TABLE IF NOT EXISTS ${TABLE} (
        id TEXT PRIMARY KEY,
        original_url TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
  }
}

/**
 * Create a shortened link.
 * @param {string} originalUrl
 * @returns {Promise<{id: string, originalUrl: string}>}
 */
async function create(originalUrl) {
  const id = crypto.randomUUID().replace(/-/g, '').substring(0, ID_LENGTH);
  await run('INSERT INTO ' + TABLE + ' (id, original_url) VALUES (?, ?)', [id, originalUrl]);
  return { id, originalUrl };
}

/**
 * Resolve a short code to the original URL.
 * @param {string} id
 * @returns {Promise<{id: string, originalUrl: string} | null>}
 */
async function resolve(id) {
  const row = await get('SELECT id, original_url FROM ' + TABLE + ' WHERE id = ?', [id]);
  if (!row) return null;
  return { id: row.id, originalUrl: row.original_url };
}

/**
 * List all shortened links (most recent first).
 */
async function list() {
  const rows = await all('SELECT id, original_url, created_at FROM ' + TABLE + ' ORDER BY created_at DESC LIMIT 50');
  return rows.map(function (r) {
    return { id: r.id, originalUrl: r.original_url, createdAt: r.created_at };
  });
}

module.exports = { create, resolve, list, ensureTable, init };
