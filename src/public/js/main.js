/**
 * Marketing Tools — shared client utilities
 */

document.addEventListener('DOMContentLoaded', function () {
  // ── Copy-to-clipboard ────────────────────────────
  document.querySelectorAll('[data-copy]').forEach(function (el) {
    el.addEventListener('click', function () {
      var target = document.querySelector(el.getAttribute('data-copy'));
      if (!target) return;

      var text = target.value || target.textContent || '';
      navigator.clipboard.writeText(text).then(function () {
        el.classList.add('copied');
        setTimeout(function () { el.classList.remove('copied'); }, 1500);
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
        el.classList.add('copied');
        setTimeout(function () { el.classList.remove('copied'); }, 1500);
      });
    });
  });

  // ── Live character/word counter ──────────────────
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = document.querySelector(el.getAttribute('data-count'));
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
