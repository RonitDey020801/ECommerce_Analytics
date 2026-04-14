const Cart = (() => {
  const KEY = 'shopdemo_cart';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    updateBadges();
  }

  function updateBadges() {
    const count = getCount();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  function addItem(product, qty = 1) {
    const items = load();
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        emoji: product.emoji
      , quantity: qty });
    }
    save(items);
    showToast(`"${product.name}" added to cart`);
  }

  function removeItem(productId) {
    const items = load().filter(i => i.id !== productId);
    save(items);
  }

  function updateQty(productId, newQty) {
    if (newQty < 1) { removeItem(productId); return; }
    const items = load();
    const item = items.find(i => i.id === productId);
    if (item) { item.quantity = newQty; save(items); }
  }

  function getItems() { return load(); }

  function getCount() { return load().reduce((s, i) => s + i.quantity, 0); }

  function getSubtotal() { return load().reduce((s, i) => s + i.price * i.quantity, 0); }

  function clear() { localStorage.removeItem(KEY); updateBadges(); }

  document.addEventListener('DOMContentLoaded', updateBadges);

  return { addItem, removeItem, updateQty, getItems, getCount, getSubtotal, clear };
})();
