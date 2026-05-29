require('./setup');
const shortener = require('../src/services/shortener');

describe('URL Shortener Service', () => {
  test('create() returns an object with id and originalUrl', async () => {
    const result = await shortener.create('https://example.com/test');
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('originalUrl');
    expect(result.originalUrl).toBe('https://example.com/test');
    expect(result.id.length).toBeGreaterThanOrEqual(7);
  });

  test('resolve() returns the original URL for a valid short code', async () => {
    const created = await shortener.create('https://example.com/resolve-test');
    const resolved = await shortener.resolve(created.id);
    expect(resolved).not.toBeNull();
    expect(resolved.originalUrl).toBe('https://example.com/resolve-test');
  });

  test('resolve() returns null for an unknown code', async () => {
    const result = await shortener.resolve('unknown1');
    expect(result).toBeNull();
  });

  test('list() returns an array', async () => {
    const links = await shortener.list();
    expect(Array.isArray(links)).toBe(true);
    // Each item should have id and originalUrl
    if (links.length > 0) {
      expect(links[0]).toHaveProperty('id');
      expect(links[0]).toHaveProperty('originalUrl');
    }
  });
});
