require('./setup');
const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  it('returns 200 and renders the homepage', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('AdMatic');
  });
});

describe('GET /info pages', () => {
  const infoPages = ['/about', '/privacy', '/macros', '/resize', '/video-editor', '/dictionary'];

  infoPages.forEach((page) => {
    it(`returns 200 for ${page}`, async () => {
      const res = await request(app).get(page);
      expect(res.status).toBe(200);
    });
  });
});

describe('GET /client-side tools', () => {
  const tools = [
    '/utm-builder',
    '/qr-generator',
    '/diff-checker',
    '/encoder-decoder',
    '/character-counter',
    '/cyrillic-detector',
    '/html-editor',
    '/email-validator',
    '/phone-validator',
    '/transposition-tool',
    '/vast-inspector',
  ];

  tools.forEach((tool) => {
    it(`returns 200 for ${tool}`, async () => {
      const res = await request(app).get(tool);
      expect(res.status).toBe(200);
    });
  });
});

describe('GET /server-side tools', () => {
  const tools = ['/url-shortener', '/image-resizer', '/redirect-checker', '/creative-preview'];

  tools.forEach((tool) => {
    it(`returns 200 for ${tool}`, async () => {
      const res = await request(app).get(tool);
      expect(res.status).toBe(200);
    });
  });
});

describe('POST /api/shorten', () => {
  it('returns 400 when url is missing', async () => {
    const res = await request(app).post('/api/shorten').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for invalid URL format', async () => {
    const res = await request(app).post('/api/shorten').send({ url: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('http');
  });

  it('returns 200 and shortUrl for a valid URL', async () => {
    const res = await request(app).post('/api/shorten').send({ url: 'https://example.com' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body).toHaveProperty('id');
    expect(res.body.shortUrl).toContain('http');
  });
});

describe('GET /api/links', () => {
  it('returns an array', async () => {
    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/redirect-check', () => {
  it('returns 400 when url is missing', async () => {
    const res = await request(app).post('/api/redirect-check').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 200 and redirect chain for a valid URL', async () => {
    const res = await request(app).post('/api/redirect-check').send({ url: 'https://example.com' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('chain');
    expect(res.body).toHaveProperty('finalUrl');
    expect(res.body).toHaveProperty('finalStatus');
  });
});

describe('POST /api/resize', () => {
  it('returns 400 when no image file is uploaded', async () => {
    const res = await request(app).post('/api/resize');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('404 handling', () => {
  it('returns 404 for unknown page', async () => {
    const res = await request(app).get('/nonexistent-page');
    expect(res.status).toBe(404);
  });

  it('returns 404 JSON for unknown API endpoint', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
