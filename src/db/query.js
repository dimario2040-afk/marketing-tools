/**
 * Unified query interface for SQLite and PostgreSQL.
 *
 * Usage:
 *   const db = require('./init');
 *   const { all, get, run } = require('./query');
 *
 *   await db.init();
 *   const rows = await all('SELECT * FROM links WHERE ...');
 */

const { getDb, getMode } = require('./init');

/**
 * Convert ? placeholders to $1,$2,... for PostgreSQL.
 */
function pgParams(sql, params) {
  let idx = 0;
  const adapted = sql.replace(/\?/g, () => `$${++idx}`);
  return adapted;
}

/**
 * Run a SELECT and return all rows.
 */
async function all(sql, params = []) {
  const db = getDb();
  const mode = getMode();

  if (mode === 'postgres') {
    const { rows } = await db.query(pgParams(sql, params), params);
    return rows;
  }

  // SQLite (sql.js)
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Run a SELECT and return the first row (or null).
 */
async function get(sql, params = []) {
  const rows = await all(sql, params);
  return rows[0] || null;
}

/**
 * Run an INSERT / UPDATE / DELETE and return info.
 */
async function run(sql, params = []) {
  const db = getDb();
  const mode = getMode();

  if (mode === 'postgres') {
    const result = await db.query(pgParams(sql, params), params);
    return { changes: result.rowCount };
  }

  // SQLite (sql.js)
  db.run(sql, params);
  return { changes: db.getRowsModified() };
}

module.exports = { all, get, run };
