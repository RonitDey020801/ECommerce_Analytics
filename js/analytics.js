/**
 * ShopDemo Analytics — event capture layer
 * Logs events to console, sessionStorage, and the debug panel.
 * GA4 / GTM dataLayer compatible: pushes to window.dataLayer if present.
 * Fires a custom DOM event `analytics:track` for external listeners.
 */
const Analytics = (() => {
  const MAX  = 100;
  const SKEY = 'shopdemo_events';

  let _events = [];
  try { _events = JSON.parse(sessionStorage.getItem(SKEY)) || []; } catch {}

  /* ── persistence ──────────────────────────────────────── */
  function _save() {
    try { sessionStorage.setItem(SKEY, JSON.stringify(_events.slice(-MAX))); } catch {}
  }

  /* ── panel rendering ──────────────────────────────────── */
  function _ts(ms) {
    return new Date(ms).toLocaleTimeString('en-US', { hour12: false });
  }

  function _refresh() {
    const list  = document.getElementById('ap-list');
    const badge = document.getElementById('ap-badge');
    if (!list) return;
    if (badge) badge.textContent = _events.length;

    if (_events.length === 0) {
      list.innerHTML = '<div class="ap-empty">No events yet. Interact with the store.</div>';
      return;
    }

    list.innerHTML = [..._events].reverse().map(e => `
      <div class="ap-item">
        <span class="ap-time">${_ts(e.ts)}</span>
        <span class="ap-name ap-${e.event}">${e.event}</span>
        <span class="ap-props">${
          Object.entries(e.props)
            .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
            .join(' · ')
        }</span>
      </div>
    `).join('');
  }

  /* ── public: track ────────────────────────────────────── */
  function track(event, props = {}) {
    const entry = { event, props, ts: Date.now() };
    _events.push(entry);
    if (_events.length > MAX) _events.shift();
    _save();

    // Console output
    console.log(
      '%c[Analytics]%c ' + event,
      'color:#38bdf8;font-weight:700',
      'color:#4ade80;font-weight:700',
      props
    );

    // GTM dataLayer push
    if (window.dataLayer) window.dataLayer.push({ event, ...props });

    // Custom DOM event for external tools
    document.dispatchEvent(new CustomEvent('analytics:track', { detail: { event, props } }));

    _refresh();
  }

  /* ── panel init ───────────────────────────────────────── */
  function _initPanel() {
    const panel = document.getElementById('analytics-panel');
    if (!panel) return;

    panel.innerHTML = `
      <div class="ap-header">
        <span class="ap-title">⚡ Analytics</span>
        <span class="ap-badge" id="ap-badge">0</span>
        <div class="ap-controls">
          <button class="ap-btn" id="ap-copy">Copy</button>
          <button class="ap-btn" id="ap-clear">Clear</button>
          <button class="ap-btn" id="ap-toggle">▾</button>
        </div>
      </div>
      <div class="ap-body" id="ap-body">
        <div class="ap-list" id="ap-list"></div>
      </div>
    `;

    let collapsed = false;
    document.getElementById('ap-toggle').addEventListener('click', () => {
      collapsed = !collapsed;
      document.getElementById('ap-body').style.display = collapsed ? 'none' : '';
      document.getElementById('ap-toggle').textContent  = collapsed ? '▸' : '▾';
    });

    document.getElementById('ap-clear').addEventListener('click', () => {
      _events = [];
      _save();
      _refresh();
    });

    document.getElementById('ap-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(_events, null, 2))
        .then(() => showToast('Events copied to clipboard'))
        .catch(() => showToast('Copy failed — check browser permissions'));
    });

    _refresh();
  }

  document.addEventListener('DOMContentLoaded', _initPanel);

  return { track, getEvents: () => [..._events] };
})();
