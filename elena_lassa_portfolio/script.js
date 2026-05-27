/* ============================================================
   Elena Lassa — Portfolio personal
   script.js
   ============================================================ */

'use strict';

/* ── LOADER ─────────────────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('loader');
  const countEl = document.getElementById('loader-count');
  const fillEl = document.getElementById('loader-fill');
  if (!loader || !countEl || !fillEl) return;

  let current = 0;
  const target = 100;
  const interval = 18;
  const step = 1;

  document.body.classList.add('loading');

  const tick = setInterval(() => {
    current += step;
    if (current > target) current = target;

    countEl.textContent = current;
    fillEl.style.width = current + '%';

    if (current >= target) {
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
      }, 400);
    }
  }, interval);
})();

/* ── HEADER: scroll state ───────────────────────────────── */
(function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── MOBILE MENU ────────────────────────────────────────── */
(function initMobileMenu() {
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!burger || !mobileNav) return;

  const toggle = () => {
    const open = mobileNav.classList.toggle('open');
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  const close = () => {
    mobileNav.classList.remove('open');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', toggle);
  mobileNav.querySelectorAll('.mobile-nav__link').forEach(link => link.addEventListener('click', close));

  document.addEventListener('click', e => {
    if (mobileNav.classList.contains('open') && !mobileNav.contains(e.target) && !burger.contains(e.target)) close();
  });
})();

/* ── SMOOTH SCROLL ──────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── SCROLL REVEAL ──────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-up');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  els.forEach(el => observer.observe(el));
})();

/* ── CUSTOM CURSOR ──────────────────────────────────────── */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.style.display = 'none';
    return;
  }

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  const hoverEls = document.querySelectorAll('a, button, .tag, .card__link, .btn-outline, .btn-submit');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
})();

/* ── PROJECT FILTER ─────────────────────────────────────── */
(function initFilter() {
  const tags = document.querySelectorAll('.tag');
  const cards = document.querySelectorAll('.works__grid .card');
  if (!tags.length || !cards.length) return;

  tags.forEach(tag => {
    tag.addEventListener('click', () => {
      tags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');

      const filter = tag.dataset.filter;

      cards.forEach(card => {
        const cat = card.dataset.cat;
        const show = filter === 'all' || cat === filter;
        card.classList.toggle('is-filtered-out', !show);
      });
    });
  });
})();

/* ── PARALLAX ───────────────────────────────────────────── */
(function initParallax() {
  const deco = document.querySelector('.hero__deco');
  if (!deco) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    deco.style.transform = `translateY(calc(-55% + ${y * 0.12}px))`;
  }, { passive: true });
})();

/* ── MEDIA MODAL + PROJECT CAROUSELS ────────────────────── */
(function initMediaModal() {
  const modal = document.getElementById('media-modal');
  const modalStage = document.getElementById('modal-stage');
  const modalLabel = document.getElementById('modal-label');
  const modalCounter = document.getElementById('modal-counter');
  const closeBtn = document.getElementById('modal-close');
  const prevBtn = document.getElementById('modal-prev');
  const nextBtn = document.getElementById('modal-next');
  const controls = document.getElementById('modal-controls');

  if (!modal || !modalStage || !modalLabel || !modalCounter || !closeBtn || !prevBtn || !nextBtn || !controls) return;

  const galleries = {
    branding: [
      { type: 'image', src: 'assets/media/branding-freak-wear-logo.jpg', title: 'Branding — Freak Wear / Logo' },
      { type: 'image', src: 'assets/media/branding-freak-wear-8.jpg', title: 'Branding — Freak Wear / 8' },
      { type: 'image', src: 'assets/media/branding-freak-wear-6.jpg', title: 'Branding — Freak Wear / 6' },
      { type: 'image', src: 'assets/media/branding-freak-wear-10.jpg', title: 'Branding — Freak Wear / 10' },
      { type: 'image', src: 'assets/media/branding-freak-wear-9.jpg', title: 'Branding — Freak Wear / 9' },
      { type: 'image', src: 'assets/media/branding-trazo-3.jpg', title: 'Branding — Trazo / 3' },
      { type: 'image', src: 'assets/media/branding-trazo-4.jpg', title: 'Branding — Trazo / 4' },
      { type: 'image', src: 'assets/media/branding-trazo-5.jpg', title: 'Branding — Trazo / 5' },
      { type: 'image', src: 'assets/media/branding-trazo-6.jpg', title: 'Branding — Trazo / 6' },
      { type: 'image', src: 'assets/media/branding-trazo-8.jpg', title: 'Branding — Trazo / 8' }
    ],
    digital: [
      { type: 'video', src: 'assets/media/bunker-video.mp4', title: 'Digital — Bunker / Video' },
      { type: 'video', src: 'assets/media/freak-wear-video.mp4', title: 'Digital — Freak Wear / Video' }
    ],
    campaign: [
      { type: 'image', src: 'assets/media/campaign-trazo-1.jpg', title: 'Campaign — Trazo / 1' },
      { type: 'image', src: 'assets/media/campaign-modular-1.jpg', title: 'Campaign — Modular / 1' },
      { type: 'image', src: 'assets/media/campaign-arag-n-5.jpg', title: 'Campaign — Aragón / 5' },
      { type: 'image', src: 'assets/media/campaign-freak-wear-1.jpg', title: 'Campaign — Freak Wear / 1' },
      { type: 'image', src: 'assets/media/campaign-freak-wear-2.jpg', title: 'Campaign — Freak Wear / 2' },
      { type: 'image', src: 'assets/media/campaign-freak-wear-3.jpg', title: 'Campaign — Freak Wear / 3' }
    ],
    space: [
      { type: 'image', src: 'assets/media/space-trazo-10.jpg', title: 'Space — Trazo / 10' },
      { type: 'image', src: 'assets/media/space-freak-wear-12.jpg', title: 'Space — Freak Wear / 12' },
      { type: 'image', src: 'assets/media/space-bunker-5.jpg', title: 'Space — Bunker / 5' }
    ],
    art: [
      { type: 'image', src: 'assets/media/art-intervalo-8.jpg', title: 'Art Direction — Intervalo / 8' },
      { type: 'image', src: 'assets/media/art-intervalo-1.jpg', title: 'Art Direction — Intervalo / 1' },
      { type: 'image', src: 'assets/media/art-intervalo-3.jpg', title: 'Art Direction — Intervalo / 3' },
      { type: 'image', src: 'assets/media/art-intervalo-4.jpg', title: 'Art Direction — Intervalo / 4' },
      { type: 'image', src: 'assets/media/art-intervalo-5.jpg', title: 'Art Direction — Intervalo / 5' },
      { type: 'image', src: 'assets/media/art-intervalo-6.jpg', title: 'Art Direction — Intervalo / 6' }
    ]
  };

  let activeItems = [];
  let activeIndex = 0;

  const render = () => {
    const item = activeItems[activeIndex];
    if (!item) return;

    modalLabel.textContent = item.title;
    modalCounter.textContent = `${activeIndex + 1} / ${activeItems.length}`;
    controls.classList.toggle('is-hidden', activeItems.length <= 1);

    if (item.type === 'video') {
      modalStage.innerHTML = `
        <video class="media-modal__video" controls autoplay muted playsinline>
          <source src="${item.src}" type="video/mp4" />
        </video>
      `;
    } else {
      modalStage.innerHTML = `<img class="media-modal__img" src="${item.src}" alt="${item.title}" />`;
    }
  };

  const open = items => {
    activeItems = items;
    activeIndex = 0;
    render();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      modalStage.innerHTML = '';
      activeItems = [];
      activeIndex = 0;
    }, 250);
  };

  const next = () => {
    if (!activeItems.length) return;
    activeIndex = (activeIndex + 1) % activeItems.length;
    render();
  };

  const prev = () => {
    if (!activeItems.length) return;
    activeIndex = (activeIndex - 1 + activeItems.length) % activeItems.length;
    render();
  };

  document.querySelectorAll('.project-gallery-trigger[data-gallery]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const key = trigger.dataset.gallery;
      if (galleries[key]) open(galleries[key]);
    });
  });

  document.querySelectorAll('.principle[data-modal-media]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      open([{ type: 'image', src: trigger.dataset.modalMedia, title: trigger.dataset.modalTitle || 'Project image' }]);
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
})();

/* ── CONTACT FORM: opens email to Elena ─────────────────── */
(function initForm() {
  const form = document.getElementById('contact-form');
  const btn = form ? form.querySelector('.btn-submit') : null;
  if (!form || !btn) return;

  const destination = 'elenalasa.tirado@gmail.com';

  form.addEventListener('submit', e => {
    e.preventDefault();

    const required = form.querySelectorAll('[required]');
    let valid = true;

    required.forEach(input => {
      if (!input.value.trim()) {
        valid = false;
        input.style.borderBottom = '1px solid #c0392b';
        input.addEventListener('input', () => { input.style.borderBottom = ''; }, { once: true });
      }
    });

    if (!valid) return;

    const data = new FormData(form);
    const subject = encodeURIComponent(`Nuevo mensaje desde el portfolio — ${data.get('name') || 'Contacto'}`);
    const body = encodeURIComponent(
`Nombre: ${data.get('name') || ''}
Proyecto / Empresa: ${data.get('company') || ''}
Email: ${data.get('email') || ''}
Teléfono: ${data.get('phone') || ''}

Mensaje:
${data.get('message') || ''}`
    );

    const label = btn.querySelector('span:first-child');
    const arrow = btn.querySelector('.btn-arrow');
    label.textContent = 'Opening email…';
    arrow.textContent = '↗';
    btn.disabled = true;

    window.location.href = `mailto:${destination}?subject=${subject}&body=${body}`;

    setTimeout(() => {
      label.textContent = 'Submit Message';
      arrow.textContent = '→';
      btn.disabled = false;
    }, 1800);
  });
})();

/* ── NAV ACTIVE STATE ───────────────────────────────────── */
(function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();
