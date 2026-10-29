(function (A) {
  'use strict';
  A.load();
  A.render();

  // save when the app goes to the background, so nothing is lost
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') A.flush(); });
  window.addEventListener('pagehide', A.flush);

  // ask the browser not to clear our data when the phone is low on space
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* ignore */ }

  // offline support (needs https or localhost)
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})(window.A);
