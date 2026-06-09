/* ============================================================
   CPOP Albuquerque – 30 Aniversario
   script.js
   ============================================================ */

/* ── Esperar a que el DOM esté listo ───────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initCountdown();
  initStars();
  initScrollAnimations();
  initSponsorsCarousel();
});

/* ============================================================
   HEADER – scroll shadow + active link
============================================================ */
function initHeader() {
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('main section[id], footer[id]');

  /* Sombra al hacer scroll */
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveLink(navLinks, sections);
  }, { passive: true });

  /* Subrayado de enlace activo según sección visible */
  function updateActiveLink(links, sects) {
    let current = '';
    sects.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= 120) current = sec.id;
    });
    links.forEach(link => {
      const href = link.getAttribute('href').slice(1);
      link.classList.toggle('active', href === current);
    });
  }
}

/* ============================================================
   MENÚ MÓVIL – hamburguesa
============================================================ */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav    = document.getElementById('mainNav');
  const header = document.getElementById('header');

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('open');
    nav.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  /* Cerrar al hacer clic en un enlace */
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* Cerrar al hacer clic fuera */
  document.addEventListener('click', e => {
    if (!header.contains(e.target) && !nav.contains(e.target)) {
      toggle.classList.remove('open');
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ============================================================
   COUNTDOWN – cuenta atrás hasta 21/08/2026 00:00:00
============================================================ */
function initCountdown() {
  const target = new Date('2026-08-21T00:00:00').getTime();

  const elDays    = document.getElementById('cdDays');
  const elHours   = document.getElementById('cdHours');
  const elMinutes = document.getElementById('cdMinutes');
  const elSeconds = document.getElementById('cdSeconds');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      /* El festival ha comenzado */
      elDays.textContent    = '00';
      elHours.textContent   = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    elDays.textContent    = days;
    elHours.textContent   = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);

    /* Pequeña animación de pulso en los segundos */
    elSeconds.classList.remove('pulse');
    void elSeconds.offsetWidth; /* forzar reflow */
    elSeconds.classList.add('pulse');
  }

  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   ESTRELLAS DECORATIVAS en el hero
============================================================ */
function initStars() {
  const container = document.getElementById('heroStars');
  if (!container) return;

  const STAR_COUNT = 22;
  const colors     = ['#f5c518', '#ffffff', '#4ecdc4', '#ff6b6b', '#a8d8ea'];

  for (let i = 0; i < STAR_COUNT; i++) {
    const el = document.createElement('span');
    el.className   = 'star';
    el.textContent = '★';

    /* Posición aleatoria */
    const top    = Math.random() * 92;
    const left   = Math.random() * 92;
    const size   = 10 + Math.random() * 22;
    const color  = colors[Math.floor(Math.random() * colors.length)];
    const dur    = 2 + Math.random() * 4;
    const delay  = Math.random() * 5;

    el.style.cssText = `
      top:${top}%;
      left:${left}%;
      font-size:${size}px;
      color:${color};
      --tw-dur:${dur}s;
      --tw-delay:${delay}s;
    `;

    container.appendChild(el);
  }
}

/* ============================================================
   ANIMACIONES DE ENTRADA al hacer scroll (Intersection Observer)
============================================================ */
function initScrollAnimations() {
  /* Seleccionar elementos a animar */
  const targets = document.querySelectorAll(
    '.feature-card, .news-card, .hero__content, .hero__img-wrap, .tickets__content, .tickets__img-wrap, .countdown__unit'
  );

  targets.forEach((el, i) => {
    el.classList.add('anim-hidden');
    /* Retrasar en cascada para elementos hermanos */
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
}

/* ============================================================
   SMOOTH SCROLL para anclas internas (fallback navegadores viejos)
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id  = anchor.getAttribute('href').slice(1);
    const sec = id ? document.getElementById(id) : null;
    if (!sec) return;
    e.preventDefault();
    const offset = document.getElementById('header')?.offsetHeight ?? 70;
    const top    = sec.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   CARRUSEL DE NOTICIAS — flechas prev / next
============================================================ */
(function initNewsCarousel() {
  const track  = document.getElementById('newsCarousel');
  if (!track) return;

  const btnPrev = document.querySelector('.carousel__arrow--prev');
  const btnNext = document.querySelector('.carousel__arrow--next');

  function getCardWidth() {
    const card = track.querySelector('.ncard-sm');
    if (!card) return 0;
    const style = getComputedStyle(track);
    const gap   = parseFloat(style.gap) || 24;
    return card.offsetWidth + gap;
  }

  function updateArrows() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (btnPrev) btnPrev.disabled = track.scrollLeft <= 2;
    if (btnNext) btnNext.disabled = track.scrollLeft >= maxScroll - 2;
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      track.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      track.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
    });
  }

  track.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();
})();

/* ============================================================
   CARRUSEL DE PATROCINADORES — flechas prev / next (móvil)
============================================================ */
function initSponsorsCarousel() {
  const logos   = document.getElementById('sponsorsLogos');
  if (!logos) return;

  const btnPrev = logos.closest('.sponsors-bar__scroll-wrap')?.querySelector('.sponsors-bar__arrow--prev');
  const btnNext = logos.closest('.sponsors-bar__scroll-wrap')?.querySelector('.sponsors-bar__arrow--next');
  const STEP = 160;

  function updateArrows() {
    const maxScroll = logos.scrollWidth - logos.clientWidth;
    if (btnPrev) btnPrev.disabled = logos.scrollLeft <= 2;
    if (btnNext) btnNext.disabled = logos.scrollLeft >= maxScroll - 2;
  }

  if (btnPrev) btnPrev.addEventListener('click', () => {
    logos.scrollBy({ left: -STEP, behavior: 'smooth' });
  });
  if (btnNext) btnNext.addEventListener('click', () => {
    logos.scrollBy({ left: STEP, behavior: 'smooth' });
  });

  logos.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();
}
