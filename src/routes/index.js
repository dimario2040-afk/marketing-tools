const { Router } = require('express');

const router = Router();

// ─── Homepage ───────────────────────────────────────────────
router.get('/', (req, res) => {
  res.render('index', { title: 'Marketing Tools' });
});

// ─── Info pages ─────────────────────────────────────────────
router.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

router.get('/privacy', (req, res) => {
  res.render('privacy', { title: 'Privacy Policy' });
});

router.get('/macros', (req, res) => {
  res.render('macros', { title: 'Excel Macros for Marketing' });
});

router.get('/resize', (req, res) => {
  res.render('resize-info', { title: 'Image Resize Guide' });
});

router.get('/video-editor', (req, res) => {
  res.render('video-info', { title: 'Video Editor Tools' });
});

router.get('/dictionary', (req, res) => {
  res.render('dictionary', { title: 'Marketing Dictionary' });
});

// ─── Client-side tools ──────────────────────────────────────
router.get('/utm-builder', (req, res) => {
  res.render('tools/utm-builder', { title: 'UTM Builder' });
});

router.get('/qr-generator', (req, res) => {
  res.render('tools/qr-generator', { title: 'QR Code Generator' });
});

router.get('/diff-checker', (req, res) => {
  res.render('tools/diff-checker', { title: 'Diff Checker' });
});

router.get('/encoder-decoder', (req, res) => {
  res.render('tools/encoder-decoder', { title: 'Encoder / Decoder' });
});

router.get('/character-counter', (req, res) => {
  res.render('tools/character-counter', { title: 'Character Counter' });
});

router.get('/cyrillic-detector', (req, res) => {
  res.render('tools/cyrillic-detector', { title: 'Cyrillic Detector' });
});

router.get('/html-editor', (req, res) => {
  res.render('tools/html-editor', { title: 'HTML Editor' });
});

router.get('/email-validator', (req, res) => {
  res.render('tools/email-validator', { title: 'Email Validator' });
});

router.get('/phone-validator', (req, res) => {
  res.render('tools/phone-validator', { title: 'Phone Number Validator' });
});

router.get('/transposition-tool', (req, res) => {
  res.render('tools/transposition-tool', { title: 'Transposition Tool' });
});

router.get('/vast-inspector', (req, res) => {
  res.render('tools/vast-inspector', { title: 'VAST Inspector' });
});

// ─── Server-side tools ──────────────────────────────────────
router.get('/url-shortener', (req, res) => {
  res.render('tools/url-shortener', { title: 'URL Shortener' });
});

router.get('/image-resizer', (req, res) => {
  res.render('tools/image-resizer', { title: 'Image Resizer' });
});

router.get('/redirect-checker', (req, res) => {
  res.render('tools/redirect-checker', { title: 'Redirect Checker' });
});

router.get('/creative-preview', (req, res) => {
  res.render('tools/creative-preview', { title: 'Creative Preview' });
});

// ─── Shortener API ──────────────────────────────────────────
const shortener = require('../services/shortener');

router.post('/api/shorten', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });
    // Basic URL validation
    if (!/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'url must start with http:// or https://' });
    const link = await shortener.create(url);
    res.json({ id: link.id, shortUrl: req.protocol + '://' + req.get('host') + '/' + link.id });
  } catch (err) {
    console.error('Shortener error:', err);
    res.status(500).json({ error: 'Failed to create short link' });
  }
});

router.get('/api/links', async (req, res) => {
  try {
    const links = await shortener.list();
    res.json(links);
  } catch (err) {
    console.error('List links error:', err);
    res.status(500).json({ error: 'Failed to list links' });
  }
});

// ─── Image Resizer API ──────────────────────────────────────
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const resizer = require('../services/resizer');

router.post('/api/resize', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image file is required' });
    const { width, height, format } = req.body;
    const result = await resizer.resize(req.file.buffer, width || 800, height || 0, format || 'jpeg');
    res.set('Content-Type', 'image/' + (result.format === 'jpeg' ? 'jpeg' : result.format));
    res.set('Content-Disposition', 'inline; filename="resized.' + result.format + '"');
    res.send(result.buffer);
  } catch (err) {
    console.error('Resizer error:', err);
    res.status(500).json({ error: 'Failed to resize image: ' + err.message });
  }
});

// ─── Redirect Checker API ───────────────────────────────────
const { checkRedirect } = require('../services/redirect-checker');

router.post('/api/redirect-check', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });
    if (!/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'url must start with http:// or https://' });
    const chain = await checkRedirect(url);
    res.json(chain);
  } catch (err) {
    console.error('Redirect check error:', err);
    res.status(500).json({ error: 'Failed to check redirect: ' + err.message });
  }
});

// ─── Short code redirect (must be LAST route) ──────────────
router.get('/:code', async (req, res) => {
  const code = req.params.code;
  // Only try to resolve 7-char alphanumeric codes (nanoid default)
  if (!/^[a-zA-Z0-9_-]{7}$/.test(code)) {
    return res.status(404).render('errors/404', { title: 'Not Found' });
  }
  try {
    const link = await shortener.resolve(code);
    if (link) return res.redirect(301, link.originalUrl);
    res.status(404).render('errors/404', { title: 'Not Found' });
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).render('errors/500', { title: 'Server Error', error: null });
  }
});

module.exports = router;
