/**
 * AdMatic — shared client utilities
 */

document.addEventListener('DOMContentLoaded', function () {
  // ── Header scroll effect ────────────────────────
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function() {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // ── Mobile nav toggle ──────────────────────────
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.menu');
  if (burger) {
    burger.addEventListener('click', function() {
      document.body.classList.toggle('menu-open');
    });
  }

  // ── Smooth details/summary accordion ───────────
  document.querySelectorAll('.glossary-term').forEach(function (details) {
    var summary = details.querySelector('.glossary-term__header');
    if (!summary) return;
    summary.addEventListener('click', function (e) {
      e.preventDefault();
      var isOpen = details.hasAttribute('open');
      if (isOpen) {
        details.removeAttribute('open');
      } else {
        details.setAttribute('open', '');
      }
    });
  });

  // ── Copy-to-clipboard ────────────────────────────
  document.querySelectorAll('[data-copy]').forEach(function (el) {
    el.addEventListener('click', function () {
      var target = document.querySelector(el.getAttribute('data-copy'));
      if (!target) return;

      var text = target.value || target.textContent || '';
      navigator.clipboard.writeText(text).then(function () {
        showCopyFeedback(el);
      }).catch(function () {
        // Fallback for older browsers
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showCopyFeedback(el);
      });
    });
  });

  function showCopyFeedback(el) {
    var orig = el.innerHTML;
    el.innerHTML = '✓ Copied!';
    el.style.pointerEvents = 'none';
    setTimeout(function () {
      el.innerHTML = orig;
      el.style.pointerEvents = '';
    }, 1200);
  }

  // ── Live character/word counter ──────────────────
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var sel = el.getAttribute('data-count');
    // Numeric values are stat counters (animated on the homepage) — skip them.
    if (!sel || /^\d+$/.test(sel)) return;
    var target = document.querySelector(sel);
    if (!target) return;

    function update() {
      var text = target.value || '';
      var chars = text.length;
      var words = text.trim() ? text.trim().split(/\s+/).length : 0;
      el.textContent = chars + ' chars, ' + words + ' words';
    }

    target.addEventListener('input', update);
    update();
  });

  // ── Auto-resize textareas ────────────────────────
  document.querySelectorAll('textarea.auto-resize').forEach(function (el) {
    el.addEventListener('input', function () {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    });
  });
});
