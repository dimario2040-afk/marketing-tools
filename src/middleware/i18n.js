/**
 * i18n middleware — English / Russian language switching.
 *
 * Detection order:
 *   1. Query param ?lang=ru
 *   2. Cookie "lang"
 *   3. Accept-Language header (starts with "ru")
 *   4. Default: "en"
 *
 * Adds to res.locals:
 *   - lang       — current language code ("en" | "ru")
 *   - t(key)     — translation function (dot-path, e.g. t('nav.brand'))
 *   - locale     — full locale object (for direct access)
 */

const fs = require('fs');
const path = require('path');

const LOCALES = {
  en: JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'locales', 'en.json'), 'utf-8')),
  ru: JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'locales', 'ru.json'), 'utf-8')),
};

/**
 * Get a nested value from an object using dot-path (e.g. "tools.utm_title").
 */
function resolve(obj, key) {
  return key.split('.').reduce(function (acc, part) {
    return acc && acc[part] !== undefined ? acc[part] : undefined;
  }, obj);
}

function i18n(req, res, next) {
  // Parse cookie header manually (no cookie-parser dependency)
  const rawCookies = req.headers.cookie || '';
  const cookies = {};
  rawCookies.split(';').forEach(function (pair) {
    const parts = pair.trim().split('=');
    if (parts.length === 2) cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
  });

  // 1. Detect language
  let lang = req.query.lang || cookies.lang || '';

  if (!lang || !LOCALES[lang]) {
    const accept = req.headers['accept-language'] || '';
    lang = accept.startsWith('ru') ? 'ru' : 'en';
  }

  // Ensure valid
  if (!LOCALES[lang]) lang = 'en';

  const locale = LOCALES[lang];

  // 2. Translation function for templates
  function t(key, fallback) {
    const val = resolve(locale, key);
    if (val !== undefined) return val;
    const enVal = resolve(LOCALES.en, key);
    return enVal !== undefined ? enVal : (fallback || key);
  }

  // 3. Set cookie if changed
  if (req.cookies?.lang !== lang) {
    res.cookie('lang', lang, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: true,
      sameSite: 'lax',
    });
  }

  res.locals.lang = lang;
  res.locals.t = t;
  res.locals.locale = locale;

  // Also expose ISO language tag for the HTML element
  res.locals.langTag = lang === 'ru' ? 'ru' : 'en';

  next();
}

module.exports = i18n;
