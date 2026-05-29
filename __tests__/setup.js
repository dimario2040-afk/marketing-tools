/**
 * Test setup — initialises DB and shortener table before running tests.
 */
const { init } = require('../src/db/init');
const { ensureTable } = require('../src/services/shortener');

beforeAll(async () => {
  await init();
  await ensureTable();
});
