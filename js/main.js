// ── Formatters ──────────────────────────────────────────────
function fmt(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function savePct(original, current) {
  return Math.round(((original - current) / original) * 100);
}

function stars(rating) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ── URL helpers ──────────────────────────────────────────────
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// ── Toast ────────────────────────────────────────────────────
function showToast(msg, duration = 2500) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

// ── Debounce ─────────────────────────────────────────────────
function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

// ── Update cart badge ─────────────────────────────────────────
function syncCart() {
  const c = Cart.getCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = c;
    el.style.display = c > 0 ? 'inline-flex' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', syncCart);
