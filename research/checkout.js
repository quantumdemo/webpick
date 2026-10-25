/* Lifetime access in one step (owner, 2026-10-24: less friction). Every "Get lifetime access"
   link ([data-checkout], or any link to /account/?buy=1) goes straight to the payment page
   when you're signed in. Signed out, it goes to sign-in first and then on to the payment page
   by itself, with no second click (/account/?buy=go, see account-dashboard.js). The button
   carries the Terms and Refund Policy note, so there is no separate checkbox.
   Purchases stay tied to the signed-in account (the server never matches a payment by email
   alone), and a launch place is only held for a signed-in account. */
(() => {
  'use strict';
  if (window.SitepeelCheckout) return;
  const AFTER = 'sitepeel-after-signin';
  const trusted = value => {
    try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && (url.hostname === 'checkout.dodopayments.com' || url.hostname.endsWith('.dodopayments.com')) ? url.href : ''; }
    catch { return ''; }
  };
  const track = (name, props) => { try { window.SitepeelAnalytics?.track(name, props); } catch {} };
  async function call(path, body, retry = true, busy = 0) {
    const response = await fetch(path, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) });
    // A short session cookie that lapsed: refresh it once, like the account card does.
    if (response.status === 401 && retry && path !== '/api/auth/refresh') {
      try { await call('/api/auth/refresh', {}, false); } catch { /* signed out */ }
      return call(path, body, false);
    }
    const data = await response.json().catch(() => ({}));
    if (response.status === 409 && data.code === 'REFRESH_BUSY' && busy < 3) { await new Promise(r => setTimeout(r, 500)); return call(path, body, retry, busy + 1); }
    if (!response.ok || !data.ok) throw Object.assign(Error(data.error || 'Please try again.'), { code: data.code, status: response.status });
    return data;
  }
  // Signed out: sign in on the account page, which then comes back to /account/?buy=go.
  function signIn() {
    try { sessionStorage.setItem(AFTER, JSON.stringify({ path: '/account/?buy=go', at: Date.now() })); } catch { /* storage blocked */ }
    location.assign('/account/?buy=go');
  }
  // Resolves when the browser is on its way to the payment page (or to sign-in).
  async function start(where = 'site') {
    track('checkout_requested', { location: where });
    let account;
    try { account = await call('/api/account'); }
    catch (error) {
      if (error.status === 401 || ['SIGN_IN_REQUIRED', 'SESSION_EXPIRED'].includes(error.code)) { signIn(); return 'sign-in'; }
      throw error;
    }
    if (account.status === 'lifetime') { location.assign('/account/'); return 'owned'; }
    if (!account.checkoutAvailable) throw Error('Checkout isn’t available right now. Contact support@sitepeel.dev.');
    // A launch place already held for this account: carry on with that same checkout.
    const pending = trusted(account.pendingCheckoutUrl);
    if (pending) { track('checkout_started', { currency: account.currency }); location.assign(pending); return 'checkout'; }
    if (account.offer?.temporarilyUnavailable) throw Error('The last launch places are in checkout right now. Please try again in a few minutes.');
    let result;
    try { result = await call('/api/checkout', { acceptPolicies: true, quote: account.quote }); }
    catch (error) {
      track('checkout_failed', { currency: account.currency, error_code: error.code });
      if (error.code === 'PRICE_CHANGED') throw Error('The price just changed. Refresh the page to see the new price.');
      throw error;
    }
    const url = trusted(result.checkoutUrl);
    if (!url) throw Error('Checkout couldn’t open. Please try again.');
    track('checkout_started', { currency: account.currency });
    location.assign(url);
    return 'checkout';
  }
  const say = (button, message) => {
    const box = button.closest('[data-checkout-box]')?.querySelector('[data-checkout-status]');
    if (box) { box.textContent = message; box.hidden = false; return; }
    if (window.SitepeelFreeTools?.toast) { window.SitepeelFreeTools.toast(message); return; }
    const el = document.createElement('div'); el.className = 'ft-toast'; el.setAttribute('role', 'status'); el.textContent = message;
    document.body.append(el); setTimeout(() => el.remove(), 4000);
  };
  document.addEventListener('click', async event => {
    const button = event.target.closest?.('[data-checkout],a[href="/account/?buy=1"]');
    if (!button || event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    if (button.getAttribute('aria-busy') === 'true') return;
    const label = button.querySelector('[data-checkout-label]') || button, before = label.dataset.idle || label.textContent;
    label.dataset.idle = before;
    button.setAttribute('aria-busy', 'true'); label.textContent = 'Opening checkout…';
    let outcome = '';
    try { outcome = await start(button.dataset.checkout || 'site'); }
    catch (error) { say(button, error.message || 'Checkout couldn’t open. Please try again.'); }
    finally {
      // The page is leaving for checkout or sign-in: keep the busy label until it does.
      if (!outcome) { button.removeAttribute('aria-busy'); label.textContent = before; }
    }
  });
  // Coming back with the Back button from the payment page: the button is usable again.
  addEventListener('pageshow', event => { if (event.persisted) document.querySelectorAll('[data-checkout][aria-busy=true],a[href="/account/?buy=1"][aria-busy=true]').forEach(b => { b.removeAttribute('aria-busy'); const l = b.querySelector('[data-checkout-label]') || b; if (l.dataset.idle) l.textContent = l.dataset.idle; }); });
  window.SitepeelCheckout = { start };
})();
