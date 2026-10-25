/* Your library: sign-in state, bookmarks and saved results, shared by the DESIGN.md
   gallery and the free tools. It uses the website session (same-origin cookies) and the
   same refresh step as the account page. Anyone signed in can bookmark; accounts with
   access also keep their results, which happens on its own after each run. */
(() => {
  'use strict';
  const RETURN = 'sitepeel-after-signin', STATE = 'sitepeel-library-state';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = {
    mark: '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h11v17L12 16.6l-5.5 3.9z"/></svg>',
    check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
    lib: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 4h4v16H4zM10 4h4v16h-4zM16 5l3.5-.9 3 15.5-3.5.9z"/></svg>',
  };

  async function call(path, body, retry = true) {
    const response = await fetch(path, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) });
    let data = {}; try { data = await response.json(); } catch { /* not JSON */ }
    // The access cookie lasts 15 minutes; the refresh cookie a month. Refresh once, then retry.
    if (response.status === 401 && retry) {
      const refreshed = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => null);
      if (refreshed?.ok) return call(path, body, false);
    }
    if (!response.ok || !data.ok) throw Object.assign(Error(data.error || 'Something went wrong. Please try again.'), { code: data.code, status: response.status });
    return data;
  }

  // Who is here: signed in or not, access, and their bookmarks. Asked once per page; a
  // signed-out answer is remembered for two minutes so pages don't keep asking.
  let mine = null;
  function me(fresh = false) {
    if (mine && !fresh) return mine;
    mine = (async () => {
      if (!fresh) try { const s = JSON.parse(sessionStorage.getItem(STATE) || 'null'); if (s?.out && Date.now() - s.at < 120000) return { signedIn: false }; } catch { /* storage blocked */ }
      try {
        const d = await call('/api/library/marks');
        try { sessionStorage.removeItem(STATE); } catch { /* storage blocked */ }
        return { signedIn: true, access: d.access, bookmarks: new Set(d.bookmarks || []) };
      } catch (error) {
        if (error.status === 401) { try { sessionStorage.setItem(STATE, JSON.stringify({ out: true, at: Date.now() })); } catch { /* storage blocked */ } }
        return { signedIn: false };
      }
    })();
    return mine;
  }

  function toast(message, link) {
    const el = document.createElement('div');
    el.className = 'lib-toast'; el.setAttribute('role', 'status');
    el.innerHTML = `<span>${esc(message)}</span>${link ? `<a href="${esc(link.href)}">${esc(link.text)}</a>` : ''}`;
    document.body.append(el);
    requestAnimationFrame(() => el.classList.add('in'));
    setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 250); }, 3200);
  }

  // A small card next to the button: sign in (and come back here), or see access.
  let pop = null;
  function closePop() { pop?.remove(); pop = null; }
  function ask(anchor, { title, text, href = '/account/', label = 'Sign in', back = true }) {
    closePop();
    pop = document.createElement('div');
    pop.className = 'lib-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', title);
    pop.innerHTML = `<b>${esc(title)}</b><p>${esc(text)}</p><div class="lib-pop-actions"><a class="lib-btn lib-btn-primary" href="${esc(href)}">${esc(label)}</a><button type="button" class="lib-btn" data-lib-close>Not now</button></div>`;
    document.body.append(pop);
    const r = anchor.getBoundingClientRect(), w = Math.min(300, innerWidth - 24);
    pop.style.width = w + 'px';
    pop.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.right - w)) + 'px';
    const below = r.bottom + 8 + pop.offsetHeight < innerHeight;
    pop.style.top = (below ? r.bottom + 8 : Math.max(12, r.top - 8 - pop.offsetHeight)) + 'px';
    pop.querySelector('a').addEventListener('click', () => { if (back) try { sessionStorage.setItem(RETURN, JSON.stringify({ path: location.pathname + location.search + location.hash, at: Date.now() })); } catch { /* storage blocked */ } });
    pop.querySelector('a').focus();
  }
  document.addEventListener('click', e => { if (!pop) return; if (e.target.closest('[data-lib-close]') || (!pop.contains(e.target) && !e.target.closest('[data-mark],[data-lib-save]'))) closePop(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePop(); });

  // Bookmark buttons ([data-mark="slug"]) on gallery cards and design pages. syncMarks()
  // also runs after the gallery swaps in another tab's cards.
  async function syncMarks() {
    const buttons = document.querySelectorAll('[data-mark]');
    if (!buttons.length) return;
    const m = await me();
    if (m.signedIn) for (const b of buttons) b.setAttribute('aria-pressed', String(m.bookmarks.has(b.dataset.mark)));
  }
  async function marks() {
    if (!document.querySelector('[data-mark],#gallery')) return;
    await syncMarks();
    document.addEventListener('click', async e => {
      const b = e.target.closest('[data-mark]');
      if (!b || b.disabled) return;
      e.preventDefault();
      const who = await me();
      if (!who.signedIn) return ask(b, { title: 'Sign in to bookmark', text: 'Bookmarks are free. Sign in and they stay in your library on any device.' });
      const slug = b.dataset.mark, on = b.getAttribute('aria-pressed') !== 'true', all = [...document.querySelectorAll(`[data-mark="${CSS.escape(slug)}"]`)];
      all.forEach(x => x.setAttribute('aria-pressed', String(on))); b.disabled = true;
      try {
        await call('/api/library/bookmark', { kind: 'design', ref: slug, on });
        on ? who.bookmarks.add(slug) : who.bookmarks.delete(slug);
        toast(on ? 'Bookmarked' : 'Bookmark removed', on ? { href: '/account/?show=bookmarks#library', text: 'Your library' } : null);
      } catch (error) { all.forEach(x => x.setAttribute('aria-pressed', String(!on))); toast(error.message); }
      finally { b.disabled = false; }
    });
  }

  // "Save this version" on a design page ([data-save-copy]): with access, a dated copy of
  // the DESIGN.md goes in the library and stays as it is when the site changes.
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-save-copy]');
    if (!b || b.disabled) return;
    e.preventDefault();
    const who = await me();
    if (!who.signedIn) return ask(b, { title: 'Sign in to save this version', text: 'With lifetime access, each DESIGN.md is kept as it was on the day it was measured, even after the site changes.' });
    if (!who.access?.active) return ask(b, { title: 'Keep versions with lifetime access', text: 'Save each DESIGN.md as it was on the day it was measured. Measure the site again any time and keep both.', href: '/account/?buy=1', label: 'Get lifetime access', back: false });
    b.disabled = true;
    try {
      const d = await call('/api/library/save', { kind: 'design', ref: b.dataset.saveCopy });
      const day = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date((d.copy?.measuredAt || Number(b.dataset.measured)) * 1000));
      b.setAttribute('aria-pressed', 'true');
      toast(`Saved the ${day} version`, { href: '/account/?show=designcopy#library', text: 'Your library' });
    } catch (error) { toast(error.message); }
    finally { b.disabled = false; }
  });

  // After a tool run: a one-line bar under the form. Accounts with access keep the result
  // automatically; others see how to keep it.
  async function result({ kind, url, after, label = 'result' }) {
    if (!after) return;
    let bar = document.getElementById('lib-bar');
    if (!bar) { bar = document.createElement('div'); bar.id = 'lib-bar'; bar.className = 'lib-bar'; bar.setAttribute('role', 'status'); }
    after.after(bar);
    const show = (state, html) => { bar.dataset.state = state; bar.innerHTML = html; bar.hidden = false; };
    const who = await me();
    if (!who.signedIn) return show('out', `<span class="lib-bar-text">${icon.mark}Keep this ${esc(label)} in your library.</span><button type="button" class="lib-link" data-lib-save>Sign in to save</button>`);
    if (!who.access?.active) return show('locked', `<span class="lib-bar-text">${icon.mark}Saving ${esc(label)}s comes with lifetime access. Bookmarks stay free.</span><a class="lib-link" href="/account/?buy=1">Get lifetime access</a>`);
    show('saving', `<span class="lib-bar-text">${icon.lib}Saving to your library…</span>`);
    try {
      // The run's result is written to our cache just after it is returned: wait for it.
      for (let i = 0; ; i++) {
        try { await call('/api/library/save', { kind, url }); break; }
        catch (error) { if (error.code === 'LIBRARY_GONE' && i < 3) { await new Promise(r => setTimeout(r, 1200)); continue; } throw error; }
      }
      show('saved', `<span class="lib-bar-text">${icon.check}Saved to your library</span><a class="lib-link" href="/account/#library">Open library</a>`);
    } catch (error) {
      show('error', `<span class="lib-bar-text">${esc(error.message)}</span><button type="button" class="lib-link" data-lib-retry>Try again</button>`);
      bar.querySelector('[data-lib-retry]').addEventListener('click', () => result({ kind, url, after, label }), { once: true });
    }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lib-save]');
    if (b) ask(b, { title: 'Sign in to save', text: 'Sign in to keep results in your library. Saving tool results comes with Sitepeel access.' });
  });

  // Tool pages open a saved result with ?saved=<page address>.
  async function open(kind, render) {
    const ref = new URLSearchParams(location.search).get('saved');
    if (!ref) return false;
    try {
      const data = await call('/api/library/open', { kind, ref });
      await render(data);
      toast('Opened from your library', { href: '/account/#library', text: 'Library' });
      return true;
    } catch (error) { toast(error.message); return false; }
  }

  window.SitepeelLibrary = { me, call, ask, toast, result, open, icon, syncMarks };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', marks); else marks();
})();
