/* Microsoft Clarity – Game On & DAS
   1) Upisite Clarity projekat ID ispod (clarity.microsoft.com → Settings → Overview).
   2) Skripte se ucitavaju tek kad posetilac prihvati kolacice (ZZPL / ZEKOM). */
(function () {
  var CLARITY_ID = 'XXXXXXXXXX';
  var KEY = 'go_consent_v1';
  var page = /das/.test(location.pathname) ? 'DAS' : 'Game On';
  var loaded = false;

  function track(name, params) {
    params = params || {};
    params.sajt = page;
    if (window.clarity) { try { window.clarity('event', name); } catch (e) {} }
  }
  window.goTrack = track;

  function load() {
    if (loaded) return; loaded = true;
    if (CLARITY_ID && CLARITY_ID.indexOf('XXXX') < 0) {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', CLARITY_ID);
      window.clarity('set', 'sajt', page);
      window.clarity('consent');
    }
  }

  function banner() {
    var b = document.createElement('div');
    b.id = 'goConsent'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Kolacici');
    b.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(12px + var(--mbar,0px));z-index:9999;max-width:560px;margin:0 auto;background:#1A0B2E;color:#fff;border:2px solid #fff;border-radius:20px;padding:16px 18px;box-shadow:5px 5px 0 ' + (page === 'DAS' ? '#10B981' : '#FF2A85') + ';font:15px/1.5 Outfit,system-ui,sans-serif';
    var priv = page === 'DAS' ? 'das-privatnost.html' : 'privatnost.html';
    b.innerHTML = '<p style="margin:0 0 12px">Koristimo kolacice za analitiku (Microsoft Clarity) da bismo poboljsali sajt. <a href="' + priv + '" style="color:#7CE08A;font-weight:700">Politika privatnosti</a></p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" data-c="1" style="flex:1 1 140px;min-height:46px;border:2px solid #fff;border-radius:999px;background:' + (page === 'DAS' ? '#10B981' : '#FF2A85') + ';color:#fff;font-weight:800;font-size:15px;cursor:pointer">Prihvatam</button>' +
      '<button type="button" data-c="0" style="flex:1 1 140px;min-height:46px;border:2px solid #fff;border-radius:999px;background:transparent;color:#fff;font-weight:700;font-size:15px;cursor:pointer">Samo neophodni</button></div>';
    b.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-c'); if (v === null) return;
      try { localStorage.setItem(KEY, v); } catch (err) {}
      b.remove(); if (v === '1') load();
    });
    document.body.appendChild(b);
  }

  // Dogadjaji za detaljnu analizu
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a,button'); if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) track('poziv_telefon', { broj: href.slice(4) });
    else if (href.indexOf('mailto:') === 0) track('klik_email');
    else if (/instagram\.com/.test(href)) track('klik_instagram');
    else if (/facebook\.com/.test(href)) track('klik_facebook');
    else if (/google\.com\/maps/.test(href)) track('klik_mapa');
    if (a.hasAttribute('data-trial')) track('klik_paket_program', { izbor: a.getAttribute('data-prog') || a.textContent.trim() });
    if (a.hasAttribute('data-cal-tab')) track('kalendar_tab', { tab: a.getAttribute('data-cal-tab') });
    if (/das\.html/.test(href)) track('prelaz_na_das');
  }, true);
  window.addEventListener('message', function (e) {
    if (!/cal\.com$/.test((e.origin || '').replace(/\/$/, ''))) return;
    var d = e.data || {}, t = d.type || '';
    if (t === 'bookingSuccessful' || t === 'bookingSuccessfulV2') track('rezervacija_uspesna', { kalendar: d.namespace || 'gameon' });
    if (t === 'linkReady') track('kalendar_ucitan', { kalendar: d.namespace || 'gameon' });
  });

  function init() {
    var v = null; try { v = localStorage.getItem(KEY); } catch (e) {}
    if (v === '1') load(); else if (v === null) banner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.goConsentReset = function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };
})();
