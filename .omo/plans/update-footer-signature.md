# Update Footer Signature

**Goal:** Update footer copyright line to include "Created by Dmitriy Pechenkin" in both EN/RU locales

## Tasks

### Task 1: Update footer template
**File:** `src/views/partials/footer.ejs`
**Change:** Add `t('footer.created_by')` between brand and copyright
```
Old: <p class="footer__copy">&copy; 2026 AdMatic. Free online tools for marketers.</p>
New: <p class="footer__copy">&copy; 2026 AdMatic. Created by Dmitriy Pechenkin. Бесплатные онлайн-инструменты для маркетологов.</p>
```
**Action:**
```ejs
<p class="footer__copy">&copy; 2026 <%= t('nav.brand') %>. <%= t('footer.created_by') %> <%= t('footer.copyright') %></p>
```

### Task 2: Update en.json locale
**File:** `src/locales/en.json`
**Section:** `"footer"` block (line ~449)
**Add:**
```json
"created_by": "Created by Dmitriy Pechenkin.",
```

### Task 3: Update ru.json locale
**File:** `src/locales/ru.json`
**Section:** `"footer"` block (line ~449)
**Add:**
```json
"created_by": "Создано Дмитрием Печенкиным.",
```

### Task 4: Verify tests pass
```bash
npm test
```

### Task 5: Commit and push to GitHub
```bash
git add .
git commit -m "Update footer: add Created by Dmitriy Pechenkin"
git push origin master
```

## Result
Footer will show:
- **EN:** `© 2026 AdMatic. Created by Dmitriy Pechenkin. Free online tools for marketers.`
- **RU:** `© 2026 AdMatic. Создано Дмитрием Печенкиным. Бесплатные онлайн-инструменты для маркетологов.`
