/* Game On – main.js (vanilla, bez zavisnosti) */
(function () {
  'use strict';

  // ===== PODEŠAVANJA =====
  // Forma šalje preko FormSubmit (radi na GitHub Pages, bez servera i API ključeva).
  // Prvi poslat upit šalje aktivacioni email na ovu adresu – kliknite "Activate" u tom mejlu.
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/gameon.igraonica@gmail.com';
  var PHONE_LABEL = '064 444 0244';
  var PHONE_HREF = 'tel:+381644440244';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // ===== Header: scroll stanje + progress =====
  var hdr = $('#hdr'), bar = $('#progress'), mbar = $('#mbar'), hero = $('#pocetna'), rez = $('#rezervacija');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, d = document.documentElement;
    hdr.classList.toggle('scrolled', y > 24);
    var p = y / Math.max(1, d.scrollHeight - d.clientHeight);
    bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (mbar && hero) {
      var pastHero = hero.getBoundingClientRect().bottom < 80;
      var inRez = rez && rez.getBoundingClientRect().top < window.innerHeight * 0.75 && rez.getBoundingClientRect().bottom > 0;
      mbar.classList.toggle('show', pastHero && !inRez);
    }
    if (rocket) rocket(p);
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // ===== Mobilni meni =====
  var burger = $('#burger'), mnav = $('#mnav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
    mnav.classList.toggle('open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mnav.classList.contains('open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 960) setMenu(false); });

  // ===== Aktivni link u navigaciji =====
  var navLinks = $$('.nav a');
  if ('IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var t = $(a.getAttribute('href')); if (t) secIO.observe(t); });
  }

  // ===== Hero slider =====
  var slides = $$('#slider .slide'), dots = $$('#dots button');
  var labels = ['Sportski teren', 'VR Meta Quest zona', 'Kafić za roditelje', 'Rođendanska sala'];
  var cur = 0, timer;
  function show(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('on', k === cur); });
    dots.forEach(function (d, k) { d.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
    $('#slideNum').textContent = 'Zona ' + (cur + 1) + ' / ' + slides.length;
    $('#slideLabel').textContent = labels[cur];
  }
  function auto() { clearInterval(timer); if (!reduce) timer = setInterval(function () { show(cur + 1); }, 4500); }
  $('#prev').addEventListener('click', function () { show(cur - 1); auto(); });
  $('#next').addEventListener('click', function () { show(cur + 1); auto(); });
  dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); auto(); }); });
  var slider = $('#slider');
  slider.addEventListener('mouseenter', function () { clearInterval(timer); });
  slider.addEventListener('mouseleave', auto);
  swipe(slider, function () { show(cur + 1); auto(); }, function () { show(cur - 1); auto(); });
  auto();

  function swipe(el, onLeft, onRight) {
    var x0 = null, y0 = null;
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? onLeft : onRight)();
      x0 = null;
    }, { passive: true });
  }

  // ===== Reveal animacije =====
  var revs = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    revs.forEach(function (el) { el.classList.add('in'); });
  } else {
    var rio = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, sib = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.transitionDelay = Math.min(sib, 5) * 70 + 'ms';
        el.classList.add('in');
        setTimeout(function () { el.style.transitionDelay = ''; }, 1200);
        rio.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revs.forEach(function (el) { rio.observe(el); });
  }

  // ===== Izbor paketa -> forma =====
  var selPkg = $('#f-paket'), kidsField = $('#f-deca');
  function choosePackage(name, kids) {
    if (name) {
      var ok = Array.prototype.some.call(selPkg.options, function (o) { return o.value === name; });
      if (ok) selPkg.value = name;
    }
    if (kids) kidsField.value = kids;
    showForm();
    var top = $('#rezervacija').getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    selPkg.classList.add('flash');
    clearError(selPkg);
    setTimeout(function () { selPkg.classList.remove('flash'); }, 2200);
    setTimeout(function () { $('#f-ime').focus({ preventScroll: true }); }, reduce ? 0 : 700);
  }
  $$('[data-pkg]').forEach(function (b) { b.addEventListener('click', function () { choosePackage(b.getAttribute('data-pkg')); }); });

  // ===== Kalkulator =====
  var kids = $('#kids'), total = $('#calcTotal');
  function fmt(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' RSD'; }
  function calc() {
    var n = Math.max(20, Math.min(200, parseInt(kids.value, 10) || 20));
    var p = $('input[name="calcPkg"]:checked');
    total.textContent = fmt(n * parseInt(p.value, 10));
    return { n: n, name: p.getAttribute('data-name') };
  }
  kids.addEventListener('input', calc);
  kids.addEventListener('change', function () { kids.value = calc().n; });
  $('#kidsMinus').addEventListener('click', function () { kids.value = Math.max(20, (parseInt(kids.value, 10) || 20) - 1); calc(); });
  $('#kidsPlus').addEventListener('click', function () { kids.value = Math.min(200, (parseInt(kids.value, 10) || 20) + 1); calc(); });
  $$('input[name="calcPkg"]').forEach(function (r) { r.addEventListener('change', calc); });
  $('#calcBook').addEventListener('click', function () { var c = calc(); choosePackage(c.name, c.n); });
  calc();

  // ===== Galerija + lightbox =====
  var gImgs = $$('#gallery .g-btn img'), lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), gi = 0, lastFocus;
  function lbShow(i) {
    gi = (i + gImgs.length) % gImgs.length;
    lbImg.src = gImgs[gi].currentSrc || gImgs[gi].src;
    lbImg.alt = gImgs[gi].alt;
    lbCap.textContent = gImgs[gi].alt + ' · ' + (gi + 1) + ' / ' + gImgs.length;
  }
  function lbOpen(i) { lastFocus = document.activeElement; lbShow(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbClose').focus(); }
  function lbClose() { lb.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  gImgs.forEach(function (img, i) { img.parentNode.setAttribute('aria-label', 'Uvećaj: ' + img.alt); img.parentNode.addEventListener('click', function () { lbOpen(i); }); });
  $('#lbClose').addEventListener('click', lbClose);
  $('#lbPrev').addEventListener('click', function () { lbShow(gi - 1); });
  $('#lbNext').addEventListener('click', function () { lbShow(gi + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
  swipe(lb, function () { lbShow(gi + 1); }, function () { lbShow(gi - 1); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') lbClose();
    else if (e.key === 'ArrowRight') lbShow(gi + 1);
    else if (e.key === 'ArrowLeft') lbShow(gi - 1);
    else if (e.key === 'Tab') {
      var f = $$('button', lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // ===== Forma za rezervaciju =====
  var form = $('#form'), ok = $('#f-ok'), alertBox = $('#f-alert'), submit = $('#f-submit'), sending = false;
  var dateIn = $('#f-datum');
  var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
  dateIn.min = t.toISOString().slice(0, 10);

  var rules = {
    'f-ime': function (v) { return v.trim().length < 3 ? 'Unesite ime i prezime.' : ''; },
    'f-tel': function (v) { var d = v.replace(/[^\d+]/g, ''); return !/^(\+?381|0)6\d{6,8}$/.test(d) && !/^(\+?381|0)[1-5]\d{6,8}$/.test(d) ? 'Unesite ispravan broj telefona (npr. 064 123 4567).' : ''; },
    'f-email': function (v) { return v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Email adresa nije ispravna.' : ''; },
    'f-datum': function (v) { return !v ? 'Izaberite željeni datum.' : (v < dateIn.min ? 'Datum ne može biti u prošlosti.' : ''); },
    'f-vreme': function (v) { return !v ? 'Izaberite željeni termin.' : (v < '10:00' || v > '22:00' ? 'Radno vreme je od 10:00 do 22:00.' : ''); },
    'f-deca': function (v) { var n = parseInt(v, 10); return !n || n < 1 ? 'Unesite okviran broj dece.' : ''; },
    'f-paket': function (v) { return !v ? 'Izaberite paket.' : ''; }
  };
  function errEl(input) { return $('#e-' + input.id.replace('f-', '')); }
  function setError(input, msg) {
    var e = errEl(input);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (e) { e.textContent = msg; if (msg) input.setAttribute('aria-describedby', e.id); else input.removeAttribute('aria-describedby'); }
  }
  function clearError(input) { setError(input, ''); }
  function validate(input) { var r = rules[input.id]; if (!r) return true; var m = r(input.value); setError(input, m); return !m; }
  Object.keys(rules).forEach(function (id) {
    var el = $('#' + id);
    el.addEventListener('blur', function () { if (el.value) validate(el); });
    el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') validate(el); });
    el.addEventListener('change', function () { if (el.getAttribute('aria-invalid') === 'true') validate(el); });
  });

  function setLoading(on) {
    sending = on;
    submit.disabled = on;
    submit.innerHTML = on ? '<span class="spin" aria-hidden="true"></span> Šaljem…' : 'Pošalji zahtev za rezervaciju';
  }
  function showForm() { if (!ok.hidden) { ok.hidden = true; $('#formWrap').hidden = false; } }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    alertBox.hidden = true;
    var firstBad = null;
    Object.keys(rules).forEach(function (id) { var el = $('#' + id); if (!validate(el) && !firstBad) firstBad = el; });
    if (firstBad) { firstBad.focus(); return; }
    if (form._honey && form._honey.value) return;
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    setLoading(true);
    fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) !== 'true') throw new Error(j.message || 'Greška'); }); })
      .then(function () {
        $('#ok-pkg').textContent = data['Paket'];
        form.reset(); $('#formWrap').hidden = true; ok.hidden = false; ok.focus();
      })
      .catch(function () {
        alertBox.innerHTML = 'Zahtev trenutno nije moguće poslati. Pozovite nas na <a href="' + PHONE_HREF + '">' + PHONE_LABEL + '</a> ili pišite na <a href="mailto:gameon.igraonica@gmail.com">gameon.igraonica@gmail.com</a>.';
        alertBox.hidden = false;
      })
      .then(function () { setLoading(false); });
  });
  $('#f-again').addEventListener('click', function () { showForm(); $('#f-ime').focus(); });

  // ===== Raketa (desktop) =====
  var rocket = null;
  if (!reduce) {
    var mob = window.matchMedia('(max-width: 719px)');
    var rk = document.createElement('button');
    rk.type = 'button'; rk.setAttribute('aria-label', 'Nazad na vrh'); rk.title = 'Nazad na vrh';
    rk.style.cssText = 'position:fixed;right:clamp(4px,2.4vw,34px);top:0;z-index:55;width:64px;height:110px;padding:0;border:0;background:none;cursor:pointer;will-change:transform;transform-origin:100% 0;-webkit-tap-highlight-color:transparent';
    rk.innerHTML = '<span style="position:absolute;inset:0;transform-origin:50% 72%;transition:transform .55s cubic-bezier(.3,1.5,.5,1)">' +
      '<span style="position:absolute;left:50%;bottom:70px;width:10px;height:0;transform:translateX(-50%);border-radius:10px;background:linear-gradient(180deg,rgba(0,229,255,0),rgba(0,229,255,.55) 40%,#FF2A85);transition:height .25s ease"></span>' +
      '<span style="position:absolute;left:50%;bottom:46px;width:16px;height:26px;border-radius:50% 50% 50% 50%/70% 70% 30% 30%;background:radial-gradient(circle at 50% 75%,#fff,#FFDF00 35%,#FF2A85 80%);transform-origin:50% 100%;animation:flame .18s ease-in-out infinite;opacity:0;transition:opacity .2s"></span>' +
      '<span style="position:absolute;left:50%;bottom:0;transform:translateX(-50%);font-size:46px;line-height:1"><span style="display:block;animation:wobble 1.4s ease-in-out infinite;filter:drop-shadow(0 0 12px rgba(0,229,255,.7))" aria-hidden="true">🚀</span></span></span>';
    document.body.appendChild(rk);
    var turn = rk.firstChild, trail = turn.children[0], flame = turn.children[1], up = false, lastY = window.scrollY, idle;
    rk.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    rocket = function (p) {
      var m = mob.matches, sc = m ? 0.62 : 1, vh = window.innerHeight;
      var top = m ? 78 : 96, bottom = vh - 110 * sc - (m ? 96 : 20);
      rk.style.transform = 'translateY(' + (top + p * (bottom - top)).toFixed(1) + 'px) scale(' + sc + ')';
      rk.style.opacity = m && mnav.classList.contains('open') ? '0' : '1';
      var dy = window.scrollY - lastY, v = Math.min(1, Math.abs(dy) / 40); lastY = window.scrollY;
      if (dy < -1 && !up) { up = true; turn.style.transform = 'rotate(180deg)'; }
      else if (dy > 1 && up) { up = false; turn.style.transform = 'rotate(0deg)'; }
      trail.style.height = (20 + v * 110).toFixed(0) + 'px';
      flame.style.opacity = v > 0.02 ? '1' : '0';
      clearTimeout(idle); idle = setTimeout(function () { trail.style.height = '0px'; flame.style.opacity = '0'; }, 160);
    };
  }

  // ===== Pikselasti kursor (desktop) =====
  if (window.matchMedia('(pointer: fine)').matches) {
    var px = function (map, colors, s) {
      var rows = map.trim().split('\n').map(function (r) { return r.trim(); }), r = '';
      rows.forEach(function (row, y) { row.split('').forEach(function (c, x) { if (colors[c]) r += '<rect x="' + x * s + '" y="' + y * s + '" width="' + s + '" height="' + s + '" fill="' + colors[c] + '"/>'; }); });
      return 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + rows[0].length * s + '" height="' + rows.length * s + '" shape-rendering="crispEdges">' + r + '</svg>') + '")';
    };
    var arrow = 'K..........\nKK.........\nKPK........\nKPPK.......\nKPPPK......\nKPPPPK.....\nKPPPPPK....\nKPPPPPPK...\nKPPPPPPPK..\nKPPPPPPPPK.\nKPPPPPKKKKK\nKPPKPPK....\nKPK.KPPK...\nKK..KPPK...\nK....KPPK..\n.....KPPK..\n......KK...';
    var hand = '....KK.......\n...KYYK......\n...KYYK......\n...KYYK......\n...KYYKKK....\n...KYYKYYKKK.\n.KKKYYKYYKYYK\nKYYKYYYYYYYYK\nKYYYYYYYYYYYK\n.KYYYYYYYYYYK\n.KYYYYYYYYYYK\n..KYYYYYYYYK.\n..KYYYYYYYYK.\n...KYYYYYYK..\n...KKKKKKKK..';
    var st = document.createElement('style');
    st.textContent = 'html,body{cursor:' + px(arrow, { K: '#1A0B2E', P: '#FF2A85' }, 2) + ' 0 0,auto}a,button,summary,label,select,.g-btn{cursor:' + px(hand, { K: '#1A0B2E', Y: '#FFDF00' }, 2) + ' 9 0,pointer}input,textarea{cursor:text}';
    document.head.appendChild(st);
    if (!reduce) {
      var cols = ['#FF2A85', '#00E5FF', '#FFDF00'];
      window.addEventListener('mousedown', function (ev) {
        for (var i = 0; i < 8; i++) (function (i) {
          var p = document.createElement('span'), a = i / 8 * Math.PI * 2;
          p.style.cssText = 'position:fixed;left:' + ev.clientX + 'px;top:' + ev.clientY + 'px;width:6px;height:6px;background:' + cols[i % 3] + ';pointer-events:none;z-index:9998;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .45s';
          document.body.appendChild(p);
          requestAnimationFrame(function () { p.style.transform = 'translate(' + (Math.cos(a) * 28).toFixed(0) + 'px,' + (Math.sin(a) * 28).toFixed(0) + 'px)'; p.style.opacity = '0'; });
          setTimeout(function () { p.remove(); }, 500);
        })(i);
      });
    }
  }

  // ===== Brojke u hero sekciji (mobilni) se odbrojavaju =====
  (function () {
    var els = $$('[data-count]'); if (!els.length || reduce || !('IntersectionObserver' in window)) return;
    els.forEach(function (el) { el.dataset.final = el.textContent.trim(); el.textContent = el.dataset.final.replace(/\d+/g, '0'); });
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return; io.unobserve(en.target);
        var el = en.target, parts = el.dataset.final.split(/(\d+)/), t0;
        setTimeout(function () {
          requestAnimationFrame(function step(t) {
            t0 = t0 || t; var k = Math.min(1, (t - t0) / 1500), ez = 1 - Math.pow(1 - k, 3);
            el.textContent = parts.map(function (p) { return /^\d+$/.test(p) ? Math.round(+p * ez) : p; }).join('');
            if (k < 1) requestAnimationFrame(step);
          });
        }, 400);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  })();

  // ===== Slajder recenzija =====
  (function () {
    var track = $('#rvTrack'); if (!track) return;
    var items = $$('.review', track), dotsBox = $('#rvDots'), i = 0, t, paused = false;
    function per() { return window.innerWidth >= 1080 ? 3 : window.innerWidth >= 720 ? 2 : 1; }
    function max() { return Math.max(0, items.length - per()); }
    function render() {
      var m = max(); if (i > m) i = m;
      track.style.transform = 'translateX(-' + (i * 100 / per()) + '%)';
      if (dotsBox.children.length !== m + 1) {
        dotsBox.innerHTML = '';
        for (var k = 0; k <= m; k++) (function (k) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Recenzija ' + (k + 1)); b.addEventListener('click', function () { i = k; render(); restart(); }); dotsBox.appendChild(b); })(k);
      }
      Array.prototype.forEach.call(dotsBox.children, function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    }
    function go(d) { var m = max(); i = i + d > m ? 0 : i + d < 0 ? m : i + d; render(); }
    function restart() { clearInterval(t); if (!reduce) t = setInterval(function () { if (!paused) go(1); }, 5000); }
    $('#rvPrev').addEventListener('click', function () { go(-1); restart(); });
    $('#rvNext').addEventListener('click', function () { go(1); restart(); });
    var rvEl = $('#rv');
    rvEl.addEventListener('mouseenter', function () { paused = true; });
    rvEl.addEventListener('mouseleave', function () { paused = false; });
    swipe(rvEl, function () { go(1); restart(); }, function () { go(-1); restart(); });
    window.addEventListener('resize', render);
    render(); restart();
  })();

  // ===== Email kartica: Gmail na desktopu, mail aplikacija na telefonu =====
  var mailCard = $('#mailCard');
  if (mailCard) mailCard.addEventListener('click', function (e) {
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
    e.preventDefault();
    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=gameon.igraonica@gmail.com&su=' + encodeURIComponent('Upit za rezervaciju'), '_blank', 'noopener');
  });

  // ===== Animacije iz stare verzije =====
  if (!reduce) {
    // sekcije izlaze jedna preko druge
    if ('IntersectionObserver' in window) {
      var sio = new IntersectionObserver(function (ents) { ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('over'); sio.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
      $$('.stack').forEach(function (s) { sio.observe(s); });
    } else $$('.stack').forEach(function (s) { s.classList.add('over'); });

    // parallax hero slike
    var heroArt = $('.hero-visual .slider');
    window.addEventListener('scroll', function () { if (heroArt && window.scrollY < 900) heroArt.style.transform = 'translateY(' + Math.min(window.scrollY * 0.08, 60).toFixed(1) + 'px)'; }, { passive: true });

    // odsjaj na glavnim dugmadima
    $$('.hero-cta .btn, .hdr-cta, #f-submit, .pkg .btn, .mbar .btn-pink').forEach(function (b) { b.classList.add('shine'); });

    var fine = window.matchMedia('(pointer: fine)').matches;
    if (fine) {
      // 3D naginjanje kartica tematskih proslava
      $$('.theme').forEach(function (cEl) {
        cEl.classList.add('tilt');
        cEl.addEventListener('mousemove', function (e) {
          var r = cEl.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
          cEl.style.transform = 'perspective(900px) rotateX(' + (-y * 6).toFixed(2) + 'deg) rotateY(' + (x * 8).toFixed(2) + 'deg) translateY(-4px)';
        });
        cEl.addEventListener('mouseleave', function () { cEl.style.transform = ''; });
      });
      // neonsko svetlo koje prati kursor u tamnim sekcijama
      $$('#o-nama, #tematske, #kontakt').forEach(function (sec) {
        var g = document.createElement('div'); g.className = 'glow'; g.setAttribute('aria-hidden', 'true');
        sec.classList.add('has-glow'); sec.insertBefore(g, sec.firstChild);
        sec.addEventListener('mousemove', function (e) { var r = sec.getBoundingClientRect(); g.style.left = (e.clientX - r.left) + 'px'; g.style.top = (e.clientY - r.top) + 'px'; });
      });
      // trag kockica za kursorom
      var tc = ['#FF2A85', '#00E5FF', '#FFDF00'], last = 0, ci = 0;
      window.addEventListener('mousemove', function (ev) {
        var now = performance.now(); if (now - last < 28) return; last = now;
        var p = document.createElement('span'), sz = 4 + Math.random() * 5;
        p.style.cssText = 'position:fixed;left:' + (ev.clientX + 2) + 'px;top:' + (ev.clientY + 2) + 'px;width:' + sz + 'px;height:' + sz + 'px;background:' + tc[ci++ % 3] + ';box-shadow:0 0 8px ' + tc[ci % 3] + ';pointer-events:none;z-index:9998;transition:transform .6s ease-out,opacity .6s ease-out';
        document.body.appendChild(p);
        requestAnimationFrame(function () { p.style.transform = 'translate(' + ((Math.random() - .5) * 26).toFixed(0) + 'px,' + (10 + Math.random() * 18).toFixed(0) + 'px) rotate(45deg) scale(.3)'; p.style.opacity = '0'; });
        setTimeout(function () { p.remove(); }, 650);
      }, { passive: true });
    } else {
      // mobilni: kratki "tap" sjaj na dodir
      document.addEventListener('touchstart', function (ev) {
        var t = ev.touches[0]; if (!t) return;
        for (var i = 0; i < 6; i++) (function (i) {
          var p = document.createElement('span'), a = i / 6 * Math.PI * 2;
          p.style.cssText = 'position:fixed;left:' + t.clientX + 'px;top:' + t.clientY + 'px;width:6px;height:6px;background:' + ['#FF2A85', '#00E5FF', '#FFDF00'][i % 3] + ';pointer-events:none;z-index:9998;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .45s';
          document.body.appendChild(p);
          requestAnimationFrame(function () { p.style.transform = 'translate(' + (Math.cos(a) * 24).toFixed(0) + 'px,' + (Math.sin(a) * 24).toFixed(0) + 'px)'; p.style.opacity = '0'; });
          setTimeout(function () { p.remove(); }, 500);
        })(i);
      }, { passive: true });
    }
  }

  onScroll();
})();
