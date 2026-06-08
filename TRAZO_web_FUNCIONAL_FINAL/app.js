/**
 * TRAZO · app.js
 * Interactividad completa: nav, home, ficha producto, carrito, checkout.
 * Sin dependencias externas. Vanilla JS puro.
 */
(() => {
  'use strict';

  /* ── CONSTANTES Y ESTADO ────────────────────── */
  const STORAGE_KEY = 'trazo_cart_v4';
  const body        = document.body;
  const PAGE        = body.dataset.page;
  const products    = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  const currency    = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

  /* ── HELPERS ────────────────────────────────── */
  const $    = (sel, root = document) => root.querySelector(sel);
  const $$   = (sel, root = document) => [...root.querySelectorAll(sel)];
  const fmt  = (v) => currency.format(Number(v || 0));
  const byId = (id) => products.find((p) => p.id === String(id).padStart(2, '0'));

  /* ── CARRITO (localStorage) ─────────────────── */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    const total = getCart().reduce((s, i) => s + i.qty, 0);
    $$('[data-cart-count]').forEach((el) => { el.textContent = total; });
  }

  function addToCart(id, size, qty = 1) {
    const cart = getCart();
    const existing = cart.find((i) => i.id === id && i.size === size);
    if (existing) existing.qty += qty;
    else cart.push({ id, size, qty });
    saveCart(cart);
  }

  /* ── TOAST ──────────────────────────────────── */
  let toastTimer = null;
  function showToast(msg) {
    const toast = $('[data-toast]');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  /* ── NAVEGACIÓN ─────────────────────────────── */
  function initNav() {
    const toggle = $('[data-nav-toggle]');
    const nav    = $('[data-nav]');
    if (!toggle || !nav) return;

    function closeNav() {
      nav.classList.remove('open');
      body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    function openNav() {
      nav.classList.add('open');
      body.classList.add('nav-open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', () => {
      nav.classList.contains('open') ? closeNav() : openNav();
    });

    nav.addEventListener('click', (e) => {
      if (e.target.matches('a')) closeNav();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) closeNav();
    });
  }

  /* ── HEADER SCROLL ──────────────────────────── */
  function initHeaderScroll() {
    const header = $('[data-header]');
    if (!header) return;
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ── REVEAL CON INTERSECTION OBSERVER ───────── */
  function initReveal() {
    const reveals = $$('.reveal');
    if (!reveals.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: mostrar todo sin animación
      reveals.forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
      return;
    }

    // Pausar la animación CSS hasta que el elemento sea visible
    reveals.forEach((el) => { el.style.animationPlayState = 'paused'; });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach((el) => observer.observe(el));
  }

  /* ── TARJETA DE PRODUCTO (HTML) ─────────────── */
  function productCard(p) {
    return `
      <a class="product-card" href="product.html?id=${p.id}" aria-label="Ver producto: ${p.name}">
        <span class="badge">Look ${p.id}</span>
        <div class="product-card-media">
          <img src="${p.look}" alt="Look completo de ${p.name}" loading="lazy">
        </div>
        <div class="product-card-body">
          <span class="product-kicker">${p.category}</span>
          <h3>${p.name}</h3>
          <p>${p.short}</p>
          <div class="product-card-footer">
            <strong class="product-price">${fmt(p.price)}</strong>
            <span class="product-open">Ver producto</span>
          </div>
        </div>
      </a>
    `;
  }

  /* ── HOME: VALORES ──────────────────────────── */
  function initValues() {
    const grid = $('[data-values-grid]');
    if (!grid) return;

    const values = [
      ['01', 'Reducción consciente', 'No se trata de tener menos por tener menos, sino de elegir mejor y evitar decisiones innecesarias.'],
      ['02', 'Coherencia',           'Cada prenda, color y soporte forma parte de un mismo sistema visual y conceptual.'],
      ['03', 'Atemporalidad',        'La colección evita depender de tendencias pasajeras y busca permanecer en el armario.'],
      ['04', 'Funcionalidad',        'La belleza se entiende desde el uso: prendas claras, cómodas y fáciles de combinar.'],
      ['05', 'Calma',                'La experiencia se aleja del ruido del retail rápido y propone una compra más pausada.'],
      ['06', 'Sensibilidad estética','TRAZO cuida la imagen, los materiales y la lectura editorial de cada pieza.'],
      ['07', 'Cercanía',             'La marca acompaña sin imponer, con un tono humano, claro y natural.'],
      ['08', 'Intención',            'Cada decisión tiene un motivo: vestir no desde la acumulación, sino desde el criterio.'],
    ];

    grid.innerHTML = values.map(([num, title, text], i) => `
      <article class="value-card reveal${i < 4 ? '' : ' delay-' + (i - 3)}">
        <span>${num}</span>
        <h3>${title}</h3>
        <p>${text}</p>
      </article>
    `).join('');

    // Re-observar las nuevas tarjetas
    initReveal();
  }

  /* ── HOME: PRODUCTOS + FILTROS ──────────────── */
  function initHome() {
    initValues();

    const grid    = $('[data-product-grid]');
    const filters = $('[data-filters]');
    if (!grid || !filters) return;

    const categories = ['Todo', ...new Set(products.map((p) => p.category))];
    let current = 'Todo';

    function render() {
      const visible = current === 'Todo'
        ? products
        : products.filter((p) => p.category === current);

      grid.innerHTML = visible.map(productCard).join('');

      $$('.filter-btn', filters).forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.category === current);
      });
    }

    filters.innerHTML = categories.map((cat) => `
      <button
        class="filter-btn${cat === 'Todo' ? ' active' : ''}"
        type="button"
        data-category="${cat}"
        aria-pressed="${cat === 'Todo'}"
      >${cat}</button>
    `).join('');

    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-category]');
      if (!btn || btn.dataset.category === current) return;
      current = btn.dataset.category;
      $$('.filter-btn', filters).forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.category === current));
      });
      render();
    });

    render();
  }

  /* ── ACORDEÓN ───────────────────────────────── */
  function initAccordion() {
    const accordion = $('[data-accordion]');
    if (!accordion) return;

    const buttons = $$(':scope > button', accordion);
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const panel  = btn.nextElementSibling;
        const isOpen = panel.classList.contains('open');

        // Cerrar todos
        $$('.accordion-panel', accordion).forEach((p) => p.classList.remove('open'));
        buttons.forEach((b) => b.setAttribute('aria-expanded', 'false'));

        // Abrir este si estaba cerrado
        if (!isOpen) {
          panel.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ── FICHA DE PRODUCTO ──────────────────────── */
  function initProductPage() {
    const params  = new URLSearchParams(window.location.search);
    const id      = params.get('id') || '01';
    const product = byId(id) || products[0];
    if (!product) return;

    // Meta y título
    document.title = `${product.name} · TRAZO`;

    // Campos de datos
    const map = {
      '[data-product-category]':    product.category,
      '[data-product-name]':        product.name,
      '[data-product-price]':       fmt(product.price),
      '[data-product-description]': product.desc,
      '[data-product-color]':       product.color,
      '[data-product-fit]':         product.fit,
      '[data-product-use]':         product.use,
      '[data-product-sku]':         product.sku,
      '[data-product-composition]': product.comp,
      '[data-product-care]':        product.care,
    };
    Object.entries(map).forEach(([sel, val]) => {
      const el = $(sel);
      if (el) el.textContent = val;
    });

    // Propiedades
    const propList = $('[data-product-properties]');
    if (propList) {
      propList.innerHTML = product.properties.map((p) => `<li>${p}</li>`).join('');
    }

    // Tallas
    const sizeGrid = $('[data-size-grid]');
    if (sizeGrid) {
      sizeGrid.innerHTML = product.sizes.map((size, i) => `
        <label class="size-option">
          <input type="radio" name="size" value="${size}" ${i === 1 ? 'checked' : ''}>
          <span>${size}</span>
        </label>
      `).join('');
    }

    /* GALERÍA */
    const images = [
      { src: product.look,         label: 'Look completo',       alt: `Look completo de ${product.name}` },
      { src: product.productImage, label: 'Producto individual', alt: `Foto individual de ${product.name}` },
    ];
    let activeImage = 0;

    const galleryImg   = $('[data-gallery-image]');
    const galleryLabel = $('[data-gallery-label]');
    const thumbsWrap   = $('[data-gallery-thumbs]');

    function renderGallery() {
      const img = images[activeImage];
      galleryImg.src = img.src;
      galleryImg.alt = img.alt;
      galleryLabel.textContent = img.label;

      thumbsWrap.innerHTML = images.map((item, i) => `
        <button class="thumb-btn${i === activeImage ? ' active' : ''}" type="button" data-image-index="${i}">
          <img src="${item.src}" alt="${item.label} de ${product.name}" loading="lazy">
          <span>${item.label}</span>
        </button>
      `).join('');
    }

    $('[data-gallery-prev]').addEventListener('click', () => {
      activeImage = (activeImage + images.length - 1) % images.length;
      renderGallery();
    });
    $('[data-gallery-next]').addEventListener('click', () => {
      activeImage = (activeImage + 1) % images.length;
      renderGallery();
    });
    thumbsWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-image-index]');
      if (!btn) return;
      activeImage = Number(btn.dataset.imageIndex);
      renderGallery();
    });

    // Swipe en móvil para galería
    let touchStartX = 0;
    const frame = $('[data-gallery]');
    if (frame) {
      frame.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
      frame.addEventListener('touchend', (e) => {
        const delta = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 40) {
          activeImage = delta > 0
            ? (activeImage + 1) % images.length
            : (activeImage + images.length - 1) % images.length;
          renderGallery();
        }
      }, { passive: true });
    }

    renderGallery();

    /* CANTIDAD */
    const qtyInput = $('[data-qty-input]');
    $('[data-qty-minus]').addEventListener('click', () => {
      qtyInput.value = Math.max(1, Number(qtyInput.value || 1) - 1);
    });
    $('[data-qty-plus]').addEventListener('click', () => {
      qtyInput.value = Math.min(9, Number(qtyInput.value || 1) + 1);
    });

    /* AÑADIR A LA CESTA */
    $('[data-add-form]').addEventListener('submit', (e) => {
      e.preventDefault();
      const size = $('input[name="size"]:checked')?.value;
      const qty  = Math.max(1, Math.min(9, Number(qtyInput.value || 1)));
      if (!size) {
        showToast('Selecciona una talla antes de añadir a la cesta.');
        return;
      }
      addToCart(product.id, size, qty);
      showToast(`${product.name} (talla ${size}) añadido a la cesta.`);
    });

    /* RELACIONADOS */
    const relatedGrid = $('[data-related-grid]');
    if (relatedGrid) {
      const related = products
        .filter((p) => p.id !== product.id && (p.category === product.category || p.color === product.color))
        .slice(0, 3);
      const fallback = products.filter((p) => p.id !== product.id).slice(0, 3);
      relatedGrid.innerHTML = (related.length ? related : fallback).map(productCard).join('');
    }

    initAccordion();
  }

  /* ── PÁGINA CARRITO ─────────────────────────── */
  function setItemQty(index, qty) {
    const cart = getCart();
    if (!cart[index]) return;
    cart[index].qty = Math.max(1, Math.min(9, qty));
    saveCart(cart);
    renderCart();
  }

  function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
  }

  function renderCart() {
    const container = $('[data-cart-items]');
    if (!container) return;
    const cart = getCart();

    if (!cart.length) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="eyebrow">Cesta vacía</p>
          <h2>Aún no has añadido ninguna prenda.</h2>
          <p>Vuelve a la colección y elige las piezas que encajen con tu armario.</p>
          <a class="btn btn-primary" href="index.html#productos">Ver productos</a>
        </div>
      `;
    } else {
      container.innerHTML = cart.map((item, index) => {
        const p = byId(item.id);
        if (!p) return '';
        return `
          <article class="cart-item">
            <img src="${p.productImage}" alt="${p.name}" loading="lazy">
            <div>
              <span class="product-kicker">${p.category} · talla ${item.size}</span>
              <h3>${p.name}</h3>
              <p>${p.short}</p>
              <p>${fmt(p.price)} / unidad</p>
            </div>
            <div class="cart-item-actions">
              <strong>${fmt(p.price * item.qty)}</strong>
              <div class="mini-quantity" aria-label="Cambiar cantidad de ${p.name}">
                <button type="button" data-cart-minus="${index}" aria-label="Restar unidad">&#8722;</button>
                <span aria-live="polite">${item.qty}</span>
                <button type="button" data-cart-plus="${index}" aria-label="Añadir unidad">&#43;</button>
              </div>
              <button class="remove-btn" type="button" data-remove-item="${index}">Eliminar</button>
            </div>
          </article>
        `;
      }).join('');
    }

    // Totales
    const subtotal = cart.reduce((s, item) => {
      const p = byId(item.id);
      return s + (p ? p.price * item.qty : 0);
    }, 0);
    const shipping = subtotal > 0 && subtotal < 80 ? 4.95 : 0;

    const subEl  = $('[data-subtotal]');
    const shipEl = $('[data-shipping]');
    const totEl  = $('[data-total]');

    if (subEl)  subEl.textContent  = fmt(subtotal);
    if (shipEl) shipEl.textContent = subtotal === 0 ? fmt(0) : (shipping === 0 ? 'Gratis' : fmt(shipping));
    if (totEl)  totEl.textContent  = fmt(subtotal + shipping);
  }

  function initCartPage() {
    renderCart();

    const items = $('[data-cart-items]');
    if (items) {
      items.addEventListener('click', (e) => {
        const minus  = e.target.closest('[data-cart-minus]');
        const plus   = e.target.closest('[data-cart-plus]');
        const remove = e.target.closest('[data-remove-item]');
        const cart   = getCart();

        if (minus)  setItemQty(Number(minus.dataset.cartMinus),  cart[Number(minus.dataset.cartMinus)].qty  - 1);
        if (plus)   setItemQty(Number(plus.dataset.cartPlus),    cart[Number(plus.dataset.cartPlus)].qty    + 1);
        if (remove) removeItem(Number(remove.dataset.removeItem));
      });
    }

    const clearBtn = $('[data-clear-cart]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('¿Vaciar toda la cesta?')) {
          saveCart([]);
          renderCart();
          showToast('Cesta vaciada.');
        }
      });
    }

    const checkout = $('[data-checkout-form]');
    if (checkout) {
      checkout.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!getCart().length) {
          showToast('La cesta está vacía.');
          return;
        }
        const order = `TRAZO-${Date.now().toString().slice(-6)}`;
        saveCart([]);
        renderCart();
        checkout.reset();
        showToast(`¡Pedido simulado creado! Ref: ${order}`);
      });
    }
  }

  /* ── INICIALIZACIÓN ─────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initHeaderScroll();
    updateCartCount();
    initReveal();

    if (PAGE === 'home')    initHome();
    if (PAGE === 'product') initProductPage();
    if (PAGE === 'cart')    initCartPage();
  });

})();
