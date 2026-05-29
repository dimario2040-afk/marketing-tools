# Marketing Tools Clone — Work Plan

## Metadata
- **Source:** https://marketing-tools.info/
- **Stack:** Node.js v24 + Express.js + EJS + SQLite (dev) / PostgreSQL (prod)
- **Design:** Unique (new, not copying original)
- **Content:** New shorter descriptions (not copying original SEO articles)
- **Testing:** Jest + Supertest
- **Deploy Target:** Railway.app (через GitHub)
- **Domain:** *.railway.app (поддомен)
- **Created:** 2026-05-29

## Project Structure

```
D:\Разработка\Marketing-tools\
├── package.json
├── .env
├── .gitignore
├── jest.config.js
├── src/
│   ├── app.js                    # Express app bootstrap
│   ├── server.js                 # Entry point (listen)
│   ├── routes/
│   │   ├── index.js              # All GET route definitions → renders EJS views
│   │   └── api/
│   │       ├── shortener.js      # POST /api/shorten, GET /s/:code
│   │       ├── resizer.js        # POST /api/resize
│   │       ├── redirect.js       # POST /api/check-redirect
│   │       └── preview.js        # POST /api/preview, GET /preview/:id
│   ├── views/
│   │   ├── layout.ejs            # Main layout shell (nav, footer, head)
│   │   └── pages/
│   │       ├── index.ejs         # Homepage with tool cards
│   │       ├── utm.ejs, macros.ejs, creative.ejs, qr.ejs,
│   │       ├── vast.ejs, redirect.ejs, resize.ejs, video.ejs,
│   │       ├── dictionary.ejs, cyrillic.ejs, diff.ejs,
│   │       ├── shortener.ejs, length-chars.ejs, html-editor.ejs,
│   │       ├── transposition.ejs, encoder.ejs, previewer.ejs,
│   │       ├── check-numbers.ejs, check-email.ejs,
│   │       ├── about.ejs, privacy.ejs
│   ├── public/
│   │   ├── css/
│   │   │   ├── main.css          # Design system + layout styles
│   │   │   └── tools.css         # Shared tool widget styles
│   │   ├── js/
│   │   │   ├── tools/
│   │   │   │   ├── utm.js, qr.js, diff.js, encoder.js,
│   │   │   │   ├── char-counter.js, cyrillic.js,
│   │   │   │   ├── email-validator.js, phone-validator.js,
│   │   │   │   ├── html-editor.js, transposition.js,
│   │   │   │   ├── vast.js
│   │   │   └── client/
│   │   │       ├── shortener.js, redirect.js, previewer.js,
│   │   │       └── creative.js
│   │   ├── images/
│   │   └── lib/                  # Vendor JS (qrcode.min.js, etc.)
│   ├── services/
│   │   ├── shortener.js          # Short URL business logic + DB
│   │   ├── resizer.js            # Image resize pipeline (Sharp)
│   │   ├── redirect.js           # HTTP redirect tracer
│   │   └── preview.js            # Creative preview storage
│   ├── middleware/
│   │   ├── error-handler.js
│   │   └── upload.js             # Multer config
│   └── db/
│       └── init.js               # SQLite schema init
├── tests/
│   ├── unit/
│   │   ├── utm.test.js
│   │   ├── encoder.test.js
│   │   ├── char-counter.test.js
│   │   ├── cyrillic.test.js
│   │   ├── email-validator.test.js
│   │   ├── diff.test.js
│   │   ├── phone-validator.test.js
│   │   └── transposition.test.js
│   └── api/
│       ├── shortener.test.js
│       ├── redirect.test.js
│       └── resizer.test.js
└── uploads/                      # Temp storage (gitignored)
```

## Dependencies

### Production
- **express** — web framework
- **ejs** — template engine
- **better-sqlite3** — SQLite3 binding (dev)
- **pg** — PostgreSQL driver (production on Railway)
- **sharp** — image processing
- **multer** — file upload handling
- **nanoid** — unique ID generation (short URLs, preview IDs)
- **adm-zip** — ZIP creation/extraction (for image resizer)
- **dotenv** — environment config
- **morgan** — request logging
- **axios** — HTTP requests (redirect checker)
- **qrcode** — QR code generation in JS (client-side lib served statically)

### Dev
- **jest** — test runner
- **supertest** — HTTP assertion
- **nodemon** — dev auto-restart

### Client-side (loaded via CDN or bundled in public/lib/)
- **qrcode-generator** — QR code generation in browser
- **xlsx** (SheetJS) — XLSX export for email/phone/redirect tools

### Optional fallback
- **jimp** — pure JS image processing (fallback if Sharp native module fails on Windows)

## Deployment Strategy

### Target: Railway.app

**Почему Railway:**
- Нативная поддержка Node.js — `npm start` из package.json
- Бесплатный тир: $5 кредитов/месяц (хватит на months работы)
- Поддомен `*.railway.app` бесплатно
- Поддержка cron-задач (для очистки временных файлов)
- Поддержка переменных окружения
- Быстрый деплой через GitHub

**Архитектурные решения под Railway:**

1. **База данных:** SQLite для локальной разработки → Railway PostgreSQL для продакшна
   - Подключаем `pg` (node-postgres) как production-драйвер
   - SQLite через `better-sqlite3` как dev-драйвер
   - Переключение через `process.env.DATABASE_URL` — если есть → PostgreSQL, иначе SQLite
   - Railway предоставляет PostgreSQL бесплатно (до 500MB)

2. **Файловое хранилище:** Временные файлы (ZIP, ресайзы, превью) хранятся локально
   - Railway имеет эфемерную файловую систему — при рестарте данные теряются
   - Для временных файлов (10 мин TTL для ресайзов, 24ч для превью) это нормально
   - В `railway.json` настраиваем healthcheck и start command

3. **Docker-опционально:** Можно деплоить как напрямую Node.js, так и через Dockerfile
   - Dockerfile даёт больше контроля над Sharp native bindings
   - Рекомендую начать с прямого Node.js деплоя (Railway сам определяет)

4. **Environment variables:**
   - `NODE_ENV=production`
   - `DATABASE_URL` (PostgreSQL connection string) — задаётся Railway автоматически при подключении БД
   - `PORT` — Railway задаёт автоматически
   - `HOST=0.0.0.0` — обязательно для Railway

5. **Dependencies для деплоя:**
   - `pg` (node-postgres) — production БД
   - `better-sqlite3` — dev БД
   - `db.js` — абстракция, выбирающая драйвер по `DATABASE_URL`

6. **GitHub integration:**
   - Проект на GitHub
   - Railway подключается к репозиторию
   - Автоматический деплой при пуше в main

### Railway Checklist (выполняется после локального завершения)
- [ ] Создать GitHub репозиторий
- [ ] Создать проект в Railway, подключить репозиторий
- [ ] Добавить PostgreSQL plugin в Railway
- [ ] Настроить `HOST=0.0.0.0` в переменных окружения
- [ ] Проверить, что `start` скрипт в package.json корректный
- [ ] Добавить `railway.json` с healthcheck
- [ ] Проверить деплой
- [ ] Настроить custom domain (если нужно потом)

---

## Phases & Tasks

### Phase A: Project Scaffolding
Tasks to initialize the project skeleton.

### Phase B: Design System & Shared Layout
Tasks for CSS design system, navigation, footer, responsive layout.

### Phase C: Homepage + Informational Pages
Tasks for static/informational pages: index, macros, resize, video, dictionary, about, privacy.

### Phase D: Client-Side Tools
11 tasks — each one adds a route, view, client JS, description.

### Phase E: Server-Side Tools
4 tasks — each one adds API endpoints + service layer.

### Phase F: Testing
Unit tests + API tests.

### Phase G: Final Verification Wave
Manual testing, cross-browser check, final fixes.

---

## Phase A — Project Scaffolding

### A1: Init npm project + install dependencies
**Files:** `package.json`, `.env`, `.gitignore`, `jest.config.js`
- `npm init -y`
- Install all production + dev dependencies
- Add scripts: `"dev": "nodemon src/server.js"`, `"start": "node src/server.js"`, `"test": "jest"`
- `.env` with `PORT=3000`
- `.gitignore`: node_modules, uploads/, .env, *.db

### A2: Initialize Express app
**Files:** `src/app.js`, `src/server.js`
- `app.js`: create express app, register middleware (morgan, express.json, express.urlencoded, static serving from `public/`), set EJS as view engine, register routes, error handler
- `server.js`: import app, listen on PORT from env

### A3: Database layer (SQLite dev / PostgreSQL prod)
**Files:** `src/db/init.js`, `src/db/query.js`
- **Dual-driver architecture:**
  - If `DATABASE_URL` env var exists → use `pg` (PostgreSQL)
  - Else → use `better-sqlite3` (local SQLite)
- `src/db/init.js` — create connection pool/client based on env
- `src/db/query.js` — wrapper that executes queries with same interface regardless of driver
- Table `short_urls`: id SERIAL/INTEGER PK, code VARCHAR(10) UNIQUE, original_url TEXT, created_at TIMESTAMP
- Table `previews`: id VARCHAR(20) PK, filename TEXT, original_name TEXT, created_at TIMESTAMP
- Auto-create tables on startup

**Dependencies added:** `pg`

### A5: Layout engine configuration
**Files:** `package.json` (dep: `ejs-mate`), `src/app.js`
- Add `ejs-mate` for EJS layout support
- Configure Express to use `ejs-mate` engine: `app.engine('ejs', engine)`
- Layout pattern: `layout.ejs` wraps each page via `<%- body %>`
- Alternative: if ejs-mate causes issues, use EJS `include()` pattern in layout.ejs

### A4: Error handling middleware
**Files:** `src/middleware/error-handler.js`
- Catch-all error handler returning JSON for API, redirect to 500 page for GET
- 404 handler for unknown routes

---

## Phase B — Design System & Shared Layout

### B1: Design System CSS
**Files:** `src/public/css/main.css`
- Modern clean design: white background, accent color (#2563EB blue or user choice), sans-serif font (Inter via Google Fonts)
- CSS custom properties: --color-primary, --color-bg, --color-text, --color-border, --radius, --shadow
- Typography scale, spacing scale
- Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
- Card component for tool listing
- Form input/button styling
- Dark/light mode toggle prepared

### B2: Navigation Header
**Files:** `src/views/partials/nav.ejs`, integrated into `layout.ejs`
- Top bar with site logo/name + tagline
- Hamburger menu on mobile
- Tools categorized in mega-dropdown or grouped links:
  - **UTM & Ссылки:** UTM-генератор, Динамические параметры, Сокращатель ссылок, Проверка редиректов
  - **Изображения:** Ресайзер, Примеры баннеров, Превью креативов
  - **Текст:** Детектор кириллицы, Сравнение списков, Счётчик символов, Энкодер
  - **Видео:** VAST Player, Виды видео форматов
  - **Валидация:** Проверка email, Проверка номеров
  - **Прочее:** QR-генератор, HTML-редактор, Транспонирование, Словарь

### B3: Footer
**Files:** `src/views/partials/footer.ejs`
- Logo, tagline
- Link columns
- Social/contact links (email, Telegram)
- Copyright line

### B4: Layout Shell
**Files:** `src/views/layout.ejs`
- `<head>` with meta tags, fonts, main.css
- `<body>`: nav partial + `<%- body %>` + footer partial
- `<%- script %>` block for per-page JS

---

## Phase C — Homepage + Informational Pages

### C1: Homepage
**Files:** `src/views/pages/index.ejs`, `src/public/js/client/home.js`
- Hero section: "Бесплатные инструменты для маркетологов"
- Grid of tool cards (19 cards), each with icon/emoji, title, short description, link
- SEO meta-description
- Categories section
- CTA: featured tools

### C2: Динамические параметры (Macros)
**Files:** `src/views/pages/macros.ejs`
- Reference table of dynamic macros for ad platforms
- Platforms: Яндекс.Директ, myTarget, VK Ads, Google Ads, Facebook Ads, DV360, GetIntent
- Each macro with description and example value
- **Content:** Write original concise descriptions for each platform's macros — not copied from original site

### C3: Примеры баннеров (Banner Standards)
**Files:** `src/views/pages/resize.ejs`
- Table of standard banner sizes (IAB standards)
- Organized by format type: horizontal, vertical, square, mobile
- Visual size comparison (CSS-based rectangles showing relative sizes)
- **Content:** Write original descriptions of each format category and its use cases

### C4: Виды видео форматов (Video Formats)
**Files:** `src/views/pages/video.ejs`
- Guide to in-stream and out-stream video ad formats
- Descriptions and use-cases for each format
- Links to related tools
- **Content:** Write original short descriptions for each video format (pre-roll, mid-roll, post-roll, out-stream, etc.)

### C5: Словарь маркетолога (Dictionary)
**Files:** `src/views/pages/dictionary.ejs`
- A-Z glossary of marketing terms (CPM, CPC, CTR, CPA, ROAS, DMP, DSP, SSP, etc.)
- Each term with short explanation and formula if applicable
- **Content:** Write original definitions — aim for 15-20 key terms minimum, each with 1-2 sentence explanation + formula where relevant

### C6: About + Privacy
**Files:** `src/views/pages/about.ejs`, `src/views/pages/privacy.ejs`
- About page: project description, contact info
- Privacy policy: standard text (GDPR + 152-ФЗ compliant)

---

## Phase D — Client-Side Tools
Each tool follows this pattern:
- Route: `GET /tool-name` → renders `pages/tool-name.ejs` inside layout
- View: short description header + interactive widget + brief usage notes
- JS: separate file in `public/js/tools/`, loaded via script tag
- Acceptance: tool produces correct output for 3 test cases

### D1: UTM-генератор
**Route:** `GET /utm`
**Files:** `src/views/pages/utm.ejs`, `src/public/js/tools/utm.js`
**UI:**
- Fields: URL, utm_source, utm_medium, utm_campaign (required) + utm_content, utm_term, utm_id (optional)
- Real-time preview of generated UTM URL
- Copy-to-clipboard button
- Auto-sanitize: lowercase inputs, replace spaces with _, remove cyrillic
**JS Logic:**
- On any field change → rebuild URL string
- Validate URL format
- Highlight issues in red
**Acceptance:**
- Input: url="https://example.com", source="yandex", medium="cpc", campaign="sale" → output: "https://example.com/?utm_source=yandex&utm_medium=cpc&utm_campaign=sale"
- Cyrillic in source → auto-transliterated or warned
- Double `?` auto-fixed

### D2: QR-генератор
**Route:** `GET /qr`
**Files:** `src/views/pages/qr.ejs`, `src/public/js/tools/qr.js`
**CDN lib (loaded via script tag in EJS):** `qrcode-generator` (or copy `qrcode.min.js` to `src/public/lib/`)
**UI:**
- Input field for URL/text
- Color picker for QR color and background
- Size selector (200/300/400/500)
- Preview area showing QR code
- Download buttons: PNG, SVG
**JS Logic:**
- Use `qrcode-generator` library (client-side) to generate QR in a canvas
- On any change → regenerate
- Download PNG from canvas `.toDataURL()`
- SVG download: generate QR as SVG string (using qrcode-generator's `createTableTag` or custom path data → `<svg>` element) → download via Blob URL
**Acceptance:**
- QR code contains the entered URL (verified by scanning via browser test)
- PNG downloads correctly
- SVG downloads correctly
- Color changes reflected in real-time

### D3: Сравнение списков (Diff)
**Route:** `GET /diff`
**Files:** `src/views/pages/diff.ejs`, `src/public/js/tools/diff.js`
**UI:**
- Two textareas (Text 1, Text 2)
- Buttons: 🔍 Найти отличия, ⋂ Найти пересечения, Найти разницу, ⇄ Поменять местами
- Result area with three sections: "← Только в тексте 1", "→ Только в тексте 2", "Общие"
- Copy result button
**JS Logic:**
- Split each text into lines
- Find unique lines per text (set difference)
- Find intersection (common lines)
- Case-sensitive comparison
**Acceptance:**
- Text1: "a\nb\nc", Text2: "b\nc\d" → Differences: "a" only in 1, "d" only in 2. Intersection: "b", "c"
- Handles empty input gracefully

### D4: Энкодер/Декодер
**Route:** `GET /encoder`
**Files:** `src/views/pages/encoder.ejs`, `src/public/js/tools/encoder.js`
**UI:**
- Input textarea
- Direction toggle: Кодировать / Декодировать
- Format selector: Base64, Base64URL, URL-encoding, HTML Entities, HEX, Binary, Unicode Escape, Punycode, ROT13, Morse, MD5, SHA-1, SHA-256
- Input encoding selector (UTF-8, Windows-1251, KOI8-R)
- Output textarea with copy button
- "Декодировать каждую строку отдельно" checkbox
**JS Logic:**
- Implement each encoding/decoding in pure JS
- For MD5/SHA-1/SHA-256: use SubtleCrypto API (Web Crypto)
- For Punycode: use built-in `Intl` or punycode module
- For Morse: manual mapping
**Acceptance:**
- "Hello" → Base64 → "SGVsbG8="
- "SGVsbG8=" → Decode Base64 → "Hello"
- "Привет" → URL-encoding → "%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82"

### D5: Счётчик символов
**Route:** `GET /length-chars`
**Files:** `src/views/pages/length-chars.ejs`, `src/public/js/tools/char-counter.js`
**UI:**
- Large textarea
- Real-time stats panel:
  - Всего символов, Символов без пробелов, Слов, Предложений, Абзацев
  - Количество: кириллица, латиница, цифры, пробелы, знаки препинания
- Per-type breakdown with bars/progress
**JS Logic:**
- Count on every input event
- Use regex for character classification
**Acceptance:**
- "Привет мир!" → chars: 11 (including space), chars no space: 10, words: 2, кириллица: 9, латиница: 0, digits: 0
- Updates in real-time as user types

### D6: Детектор кириллицы
**Route:** `GET /cyrillic`
**Files:** `src/views/pages/cyrillic.ejs`, `src/public/js/tools/cyrillic.js`
**UI:**
- Input textarea
- "Распознать" button
- Result area: same text with cyrillic chars highlighted (red background)
- Key: "А — так выглядит кириллический символ"
- Table of visually similar cyrillic/latin chars (а/a, е/e, о/o, с/c, р/p, х/x)
**JS Logic:**
- Regex: `/[\u0400-\u04FF]/g` to find cyrillic
- Wrap each cyrillic char in `<span class="cyrillic-highlight">`
**Acceptance:**
- "привет" → all 6 chars highlighted
- "hello" → no highlights
- "Привет, world" → only "П", "р", "и", "в", "е", "т" highlighted

### D7: HTML/JS редактор
**Route:** `GET /html-editor`
**Files:** `src/views/pages/html-editor.ejs`, `src/public/js/tools/html-editor.js`
**UI:**
- Two panels side-by-side: editor (textarea) and preview (iframe)
- HTML/CSS/JS entered in editor → rendered in preview
- Auto-wrap in `<!DOCTYPE html><html><body>...</body></html>` for safe rendering
- Clear button
**JS Logic:**
- On input → debounce 300ms → write to iframe's srcdoc
- Use `srcdoc` attribute for secure preview
- Handle JS errors gracefully
**Acceptance:**
- `<h1>Hello</h1>` renders as heading in preview
- `<script>alert(1)</script>` does not break the tool
- Preview updates automatically

### D8: Проверка email
**Route:** `GET /check-email`
**Files:** `src/views/pages/check-email.ejs`, `src/public/js/tools/email-validator.js`
**UI:**
- Large textarea for list of emails (one per line)
- "Проверить" button
- Results table: Email | Статус (Валидный / Невалидный)
- Checkbox: "Оставить только валидные"
- Export buttons: CSV, XLSX (use `xlsx` npm package — SheetJS Community Edition, loaded client-side via CDN or bundled)
**JS Logic:**
- RFC 5322 simplified regex validation
- Check: @ presence, domain has dot, no spaces, proper length
- Process each line independently
**Acceptance:**
- "user@example.com" → valid
- "user@" → invalid
- "user@.com" → invalid
- "test@test" → invalid (no TLD)
- 1000 emails processed in < 1s

### D9: Проверка номеров
**Route:** `GET /check-numbers`
**Files:** `src/views/pages/check-numbers.ejs`, `src/public/js/tools/phone-validator.js`
**UI:**
- Textarea for phone numbers (one per line)
- "Проверить" button
- Results table: Номер | Статус | Оператор | Регион | Формат
- Country prefix selector (default: +7 / Russia)
**JS Logic:**
- Strip non-digits, normalize to +7 format
- Check length (10-15 digits)
- Determine operator from prefix map (embedded static data: 901, 902, 903... → МТС, Билайн, Мегафон и т.д.)
- Determine region from prefix ranges
**Acceptance:**
- "+7 (901) 123-45-67" → valid, МТС
- "12345" → invalid
- "+79161234567" → valid, Билайн, Москва

### D10: Транспонирование
**Route:** `GET /transposition`
**Files:** `src/views/pages/transposition.ejs`, `src/public/js/tools/transposition.js`
**UI:**
- Big textarea for input (rows separated by newlines, columns by tabs/commas)
- Action buttons: Транспонировать (rows↔columns), Верхний регистр, Нижний регистр, Удалить дубли, Конвертировать разделитель
- Output textarea
- Download as XLSX button (use `xlsx` library — same as D8)
- Copy result
**JS Logic:**
- Transpose: split by rows → split by delimiter → transpose matrix → rejoin
- Case conversion
- Dedup lines
- Delimiter conversion: CSV ↔ TSV ↔ pipe
- XLSX export: simple CSV download (or use xlsx library)
**Acceptance:**
- Input: "a\tb\nc\td" → Transpose → "a\tc\nb\td"
- "HELLO" → Lowercase → "hello"
- "a\nb\na\nc" → Dedup → "a\nb\nc"

### D11: VAST Player
**Route:** `GET /vast`
**Files:** `src/views/pages/vast.ejs`, `src/public/js/tools/vast.js`
**UI:**
- Input: URL field for VAST tag OR textarea for raw XML
- Tab switcher: "По ссылке" / "Вставить XML"
- "Запустить рекламу" button
- Video player area (HTML5 video element)
- Event log panel showing real-time IMA SDK events
- "Поделиться" button (generates URL with encoded tag)
**JS Logic:**
- Parse VAST XML (fetch if URL, or parse inline XML using DOMParser)
- Extract media files, tracking event URLs
- Attempt to play video from first valid media file URL in HTML5 `<video>` element
- Track video time via `timeupdate` event: at 0%→impression, 0%→start, 25%→firstQuartile, 50%→midpoint, 75%→thirdQuartile, 100%→complete
- Display each tracking event in the log panel as it fires
- Handle VAST 2.0, 3.0, 4.x wrapper chains (follow wrapper URL recursively, max depth 5)
- Note: Full IMA SDK integration is complex; implement simplified player that:
  - Parses VAST XML client-side via DOMParser
  - Extracts video URL and tracking URLs
  - Simulates event firing based on video playback progress
  - Plays video in HTML5 player
**Acceptance:**
- Demo VAST tag plays video
- Event log shows: loaded, started, impression, firstQuartile, midpoint, complete
- XML validation: shows error for invalid XML

---

## Phase E — Server-Side Tools

### E1: URL Shortener
**Files:**
- `src/routes/api/shortener.js` — POST /api/shorten, GET /s/:code
- `src/services/shortener.js` — DB operations, hash generation
- `src/views/pages/shortener.ejs` — tool UI
- `src/public/js/client/shortener.js` — client-side AJAX calls
**Logic:**
- **POST /api/shorten:** accept `{ url }` → validate URL → check if exists in DB → if not, generate short code (first 6 chars of SHA-256 hash in base62) → store → return `{ shortUrl }`
- **GET /s/:code:** look up in DB → if found, 301 redirect → else 404
- **GET /shortener** renders tool page with form
- Validation: must be valid HTTP/HTTPS URL, max length 2000
- Rate limiting: max 100 requests/IP/hour (basic)
**Acceptance:**
- POST valid URL → returns short URL
- GET /s/abc123 → 301 redirect to original URL
- Same URL twice → same short code (idempotent)
- Invalid URL → 400 error message
- Non-existent code → 404

### E2: Image Resizer
**Files:**
- `src/routes/api/resizer.js` — POST /api/resize
- `src/services/resizer.js` — image processing pipeline
- `src/middleware/upload.js` — Multer config for ZIP upload (max 50MB)
- `src/views/pages/creative.ejs` — tool UI
- `src/public/js/client/creative.js` — client-side AJAX
**Logic:**
- **POST /api/resize:** accept ZIP file → extract images → for each image, generate resized versions at standard banner sizes → repack into ZIP → return download link
- Standard target sizes (18+): 300x250, 728x90, 160x600, 300x600, 970x250, 336x280, 300x300, 250x250, 320x50, 320x100, 468x60, 120x600, 240x400, 200x200, 300x500, 320x480, 480x320, 1920x1080, 1080x1920, 1280x720, 720x1280, 1080x1350, 1080x607, 600x600, 400x300, 580x400
- Stretch level: low (≤5%), medium (≤10%), high (≤15%) — user selects
- Best-fit algorithm: for each target size, pick source image with closest aspect ratio within tolerance
- Use Sharp for resize with `fit: 'inside'` + `withoutEnlargement: true` + Lanczos filter
- Cleanup: delete temp files after 10 minutes (use setTimeout or cron)
- Progress endpoint: GET /api/resize/status/:jobId to poll progress
**Acceptance:**
- Upload ZIP with 1 image → download ZIP with 18+ resized images
- Images maintain aspect ratio within tolerance
- Files named by size: `300x250.jpg`, `728x90.jpg`, etc.
- Processing time < 10s for a single source image

### E3: Redirect Checker
**Files:**
- `src/routes/api/redirect.js` — POST /api/check-redirect
- `src/services/redirect.js` — HTTP redirect tracing
- `src/views/pages/redirect.ejs` — tool UI
- `src/public/js/client/redirect.js` — client-side AJAX
**Logic:**
- **POST /api/check-redirect:** accept `{ url, macro, macroValue }` → follow redirect chain (max 20 hops, timeout 15s per hop) → return array of { step, statusCode, url, headers, time }
- Use axios with `maxRedirects: 0` to catch redirects manually
- Track: HTTP status, Location header, response time per hop
- Macro check: if macro provided, replace it in URL, verify it survives through chain
- Mass check mode: POST up to 5000 URLs, process in batches of 10 concurrently
- Export: CSV, XLSX download of results table
**Acceptance:**
- URL with 301 → returns [{status:301, url:old}, {status:200, url:new}]
- URL with 200 → returns [{status:200, url:url}]
- URL with 404 → returns [{status:404}]
- Timeout → returns error message
- Macro check works: {keyword} replaced and tracked through chain

### E4: Creative Preview
**Files:**
- `src/routes/api/preview.js` — POST /api/preview, GET /preview/:id
- `src/services/preview.js` — file storage
- `src/views/pages/previewer.ejs` — tool UI
- `src/public/js/client/previewer.js` — client-side AJAX
**Logic:**
- **POST /api/preview:** accept image file (PNG, JPG, GIF, HTML5 zip) → save to `uploads/previews/{id}` → return `{ previewUrl, deleteUrl }`
- **GET /preview/:id:** serve preview page with the image/HTML5 rendered in iframe
- **GET /api/preview/:id/raw:** serve the raw file
- **GET /api/preview/:id/delete:** delete the file (one-time access)
- Auto-cleanup: delete files older than 24h
- HTML5 banner preview: render ZIP contents in isolated iframe
- Simple image preview: show image in centered viewer
**Acceptance:**
- Upload PNG → returns shareable URL → opens in browser showing image
- Upload HTML5 ZIP → opens in isolated iframe
- Delete link works once, then 404
- Files auto-delete after 24h

---

## Phase F — Testing

### F1: Unit Tests — Client-Side Logic
**Files:** All test files in `tests/unit/`
**Approach:**
- Test pure JS functions extracted from tool logic
- Each tool's core logic is a pure function:
  - `buildUtmUrl(baseUrl, params)` → string
  - `encodeText(input, format)` → string
  - `countChars(text)` → stats object
  - `detectCyrillic(text)` → highlighted HTML
  - `compareLists(text1, text2, mode)` → diff object
  - `validateEmail(email)` → boolean
  - `validatePhone(phone)` → { valid, operator, region }
  - `transposeTable(text, delimiter)` → string
  - `hashText(text, algorithm)` → string (for MD5/SHA)
**Acceptance:**
- All tests pass (`npm test`)
- Line coverage > 80% on all utility functions in `tests/unit/` (measured via `jest --coverage`)

### F2: API Tests — Server-Side
**Files:** All test files in `tests/api/`
**Approach:**
- Use supertest to test HTTP endpoints
- Test success + failure cases for each API
- Test DB operations
**Test cases per API:**
- Shortener: create, retrieve, duplicate, invalid URL, 404
- Redirect: single URL, chain, timeout, mass check
- Resizer: valid ZIP, invalid file, no file, empty ZIP

---

## Phase G — Railway Deployment

### G1: Railway configuration
**Files:** `railway.json`, `Dockerfile` (optional)
- `railway.json` with healthcheck path and start command
- Ensure `HOST=0.0.0.0` is set as env variable
- `start` script: `node src/server.js`
- Add `postinstall` script for Sharp: `npm install sharp` (Sharp needs to rebuild on Railway)

### G2: GitHub + Railway deploy
- Create GitHub repo
- Push code to `main`
- Connect Railway project to GitHub repo
- Add PostgreSQL plugin via Railway dashboard
- Set env vars: `NODE_ENV=production`, `HOST=0.0.0.0`
- Trigger manual deploy
- Verify: `https://marketing-tools-production.up.railway.app/`

### G3: Post-deploy verification
- Run through H1 (Manual Verification Checklist) on live URL
- Check that PostgreSQL connection works
- Check that uploads/temp files work
- Check that all API endpoints respond
- Fix any Railway-specific issues

---

## Phase H — Final Verification Wave

### H1: Manual Verification Checklist
Run through each tool and verify:
- [ ] Homepage: all 19 tool cards visible and linked correctly
- [ ] Navigation: all tools accessible from header
- [ ] Mobile: responsive layout works on 375px width
- [ ] UTM Generator: generates correct URL, copy works
- [ ] QR Generator: generates scannable QR, PNG/SVG download works
- [ ] Diff: all 4 modes produce correct results
- [ ] Encoder: all 20 formats encode/decode correctly
- [ ] Character Counter: stats update in real-time
- [ ] Cyrillic Detector: highlights correctly
- [ ] HTML Editor: code renders in preview
- [ ] Email Validator: processes list, CSV export works
- [ ] Phone Validator: operator/region detection works
- [ ] Transposition: transpose, case, dedup all work
- [ ] VAST Player: plays demo video, shows events
- [ ] Shortener: creates short URL, redirects, idempotent
- [ ] Image Resizer: processes ZIP, download works
- [ ] Redirect Checker: traces chain, mass check works
- [ ] Creative Preview: upload → share → view works
- [ ] About/Privacy pages render correctly
- [ ] All tests pass: `npm test`
- [ ] No console errors in browser

### H2: Performance Check
- Lighthouse audit: target > 80 on all categories
- First paint < 1.5s
- Tool JS files < 50KB each (minified)

### H3: Final Fixes
Based on verification results, fix all issues found

---

## Execution Order Notes

**Parallelism opportunities:**
- D1-D11 (client tools) can be worked on in any order after Phase B is done
- E1-E4 (server tools) can be worked on in any order after Phase A is done
- C1-C6 can be done in parallel with D or E phases
- F1 (unit tests) can start after any D tool is done
- F2 (API tests) can start after any E tool is done

**Recommended order for implementer:**
1. Phase A (scaffolding)
2. Phase B (design system + layout)
3. C1 (homepage) + C2-C6 (info pages)
4. D1-D4 (simpler client tools: UTM, QR, Diff, Encoder)
5. D5-D10 (medium client tools: counter, cyrillic, email, phone, transposition, html-editor)
6. D11 (VAST player — most complex client tool)
7. E1 (shortener — simplest server tool)
8. E2-E4 (resizer, redirect, preview — server tools)
9. Phase F (testing)
10. Phase G (verification)

## Edge Cases & Guardrails

1. **File upload security:** Validate file types (ZIP only for resizer, images for preview), limit file size (50MB max for ZIP, 10MB for images), sanitize filenames
2. **Sharp on Windows:** Sharp has prebuilt binaries for Windows + Node.js v24. If installation fails (missing build tools), fallback to `jimp` (pure JS image processing, slower but no native deps)
2. **URL validation:** Must start with http:// or https://, reject javascript: and file: protocols
3. **No external API keys required** — all tools work standalone
4. **Short URL collision:** SHA-256 first 6 hex chars → 16M combinations, but add DB uniqueness constraint + retry on collision
5. **SQLite concurrent writes:** Use WAL mode for better concurrent access
6. **VAST Player simplified:** Since Google IMA SDK requires specific licensing/loading, implement a lightweight VAST parser + HTML5 video player that demonstrates the core functionality
7. **Rate limiting:** Basic in-memory rate limiter for shortener and API endpoints
8. **Temp file cleanup:** After download or timeout for resizer results; 24h TTL for preview files
