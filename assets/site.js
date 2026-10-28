const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('primary-nav');
function closeMenu() { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); });
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
window.matchMedia('(min-width: 1001px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// Explicit, versioned website acceptance. The preference stays in this browser.
(() => {
  const dialog = document.getElementById('website-terms-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const form = document.getElementById('website-terms-form');
  const agree = document.getElementById('website-terms-agree');
  const accept = document.getElementById('website-terms-accept');
  const decline = document.getElementById('website-terms-decline');
  const declined = document.getElementById('website-terms-declined');
  const storageKey = 'tensileera.website-acceptance';
  const version = '2026-10-27.1';
  const maxAge = 365 * 24 * 60 * 60 * 1000;
  let acceptedInMemory = false;
  let opener = null;

  function readAcceptance() {
    if (acceptedInMemory) return true;
    try {
      const record = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (!record || record.termsVersion !== version || record.privacyVersion !== version) return false;
      const timestamp = Date.parse(record.acceptedAt);
      const age = Date.now() - timestamp;
      if (!Number.isFinite(age) || age < 0 || age >= maxAge) {
        localStorage.removeItem(storageKey);
        return false;
      }
      return record.method === 'explicit-checkbox';
    } catch { return false; }
  }
  function openTerms(trigger = null) {
    if (dialog.open) return;
    opener = trigger || document.activeElement;
    agree.checked = false;
    accept.disabled = true;
    declined.hidden = true;
    dialog.showModal();
  }
  function closeTerms() {
    if (dialog.open) dialog.close();
    if (opener && typeof opener.focus === 'function') opener.focus();
  }
  agree.addEventListener('change', () => { accept.disabled = !agree.checked; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!agree.checked) { agree.focus(); return; }
    const record = {
      termsVersion: version,
      privacyVersion: version,
      acceptedAt: new Date().toISOString(),
      method: 'explicit-checkbox'
    };
    acceptedInMemory = true;
    try { localStorage.setItem(storageKey, JSON.stringify(record)); } catch { /* Continue without persistent browser storage. */ }
    closeTerms();
  });
  decline.addEventListener('click', () => {
    acceptedInMemory = false;
    try { localStorage.removeItem(storageKey); } catch { /* Storage may be disabled. */ }
    agree.checked = false;
    accept.disabled = true;
    declined.hidden = false;
    declined.querySelector('a').focus();
  });
  dialog.addEventListener('cancel', event => {
    if (!readAcceptance()) event.preventDefault();
  });
  document.querySelectorAll('[data-review-terms]').forEach(button => {
    button.addEventListener('click', () => openTerms(button));
  });
  window.addEventListener('storage', event => {
    if (event.key === storageKey && readAcceptance()) closeTerms();
  });
  const page = location.pathname.split('/').pop();
  const readingPolicy = page === 'terms.html' || page === 'privacy.html';
  if (!readingPolicy && !readAcceptance()) openTerms();
})();
