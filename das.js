/* DAS – minimalni JS: mobilni meni, hero slider, reveal animacije, godina u footeru */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- Mobilni meni ----- */
  var toggle = document.getElementById('navToggle'), links = document.getElementById('navLinks');
  function setMenu(open) {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.textContent = open ? '✕' : '☰';
  }
  toggle.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ----- Hero slider ----- */
  var slides = document.querySelectorAll('#slider .slide'), dots = document.querySelectorAll('#dots button');
  var num = document.getElementById('slideNum'), label = document.getElementById('slideLabel');
  var cur = 0, timer;
  function show(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('on', k === cur); });
    dots.forEach(function (d, k) { d.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
    num.textContent = 'Slika ' + (cur + 1) + ' / ' + slides.length;
    label.textContent = slides[cur].dataset.label;
  }
  function auto() { clearInterval(timer); if (!reduce) timer = setInterval(function () { show(cur + 1); }, 4500); }
  document.getElementById('prev').addEventListener('click', function () { show(cur - 1); auto(); });
  document.getElementById('next').addEventListener('click', function () { show(cur + 1); auto(); });
  dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); auto(); }); });
  var sl = document.getElementById('slider'), x0 = null;
  sl.addEventListener('mouseenter', function () { clearInterval(timer); });
  sl.addEventListener('mouseleave', auto);
  sl.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  sl.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) { show(cur + (dx < 0 ? 1 : -1)); auto(); }
    x0 = null;
  });
  auto();

  /* ----- Reveal pri skrolovanju ----- */
  var els = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ----- Godina ----- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
