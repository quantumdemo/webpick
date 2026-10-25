/* Free DESIGN.md generator: form, likes, copy and tabs. */
(() => {
  'use strict';
  document.documentElement.classList.add('dm-js');
  const LIKES = 'sitepeel-design-likes';
  const liked = new Set((() => { try { return JSON.parse(localStorage.getItem(LIKES) || '[]'); } catch { return []; } })());
  const saveLikes = () => { try { localStorage.setItem(LIKES, JSON.stringify([...liked].slice(-500))); } catch {} };
  const toast = message => {
    const el = document.createElement('div'); el.className = 'dm-toast'; el.setAttribute('role', 'status'); el.textContent = message;
    document.body.append(el); setTimeout(() => el.remove(), 1800);
  };
  const post = async (path, body) => {
    // Same-origin cookies: a signed-in account with access keeps what it generates.
    const response = await fetch(path, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    let data = {}; try { data = await response.json(); } catch {}
    if (!response.ok || !data.ok) throw Object.assign(Error(data.error || 'Something went wrong. Please try again.'), { code: data.code });
    return data;
  };

  // Tabs on a design page.
  const tabs = [...document.querySelectorAll('.dm-tabs [role=tab]')];
  const show = tab => {
    for (const t of tabs) { const on = t === tab; t.setAttribute('aria-selected', String(on)); document.getElementById(t.getAttribute('aria-controls'))?.classList.toggle('is-active', on); }
  };
  // A long DESIGN.md shows its first lines, so "What you can build with it" stays in reach.
  document.querySelector('.dm-code-more')?.addEventListener('click', event => {
    const wrap = event.target.closest('.dm-code-wrap'), open = wrap.classList.toggle('is-collapsed');
    event.target.setAttribute('aria-expanded', String(!open));
    event.target.textContent = open ? event.target.dataset.more || event.target.textContent : 'Show less';
  });
  const moreButton = document.querySelector('.dm-code-more');
  if (moreButton) moreButton.dataset.more = moreButton.textContent;
  tabs.forEach(tab => tab.addEventListener('click', () => { show(tab); history.replaceState(null, '', tab.id === 'dm-tab-md' ? '#design-md' : location.pathname + location.search); }));
  if (tabs.length) show(location.hash === '#design-md' ? tabs[1] : tabs[0]);

  // Copy the raw DESIGN.md, or the prompt under "What you can build with it". The prompt
  // carries this page's whole DESIGN.md with it (owner, 2026-10-24): one paste gives the
  // AI agent everything, the way a chat app attaches a pasted file.
  const promptText = () => {
    const el = document.querySelector('[data-prompt]'), markdown = document.getElementById('dm-markdown')?.textContent.trim() || '';
    if (!el) return '';
    if (!el.dataset.prompt || !markdown) return el.textContent.trim();
    return `${el.dataset.prompt}\n\n<DESIGN.md source="${el.dataset.source || location.hostname}">\n${markdown}\n</DESIGN.md>\n`;
  };
  document.addEventListener('click', event => {
    if (!event.target.closest('[data-show-md]')) return;
    const tab = document.getElementById('dm-tab-md');
    tab?.click(); tab?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    const prompt = button.dataset.copy === 'prompt';
    const text = prompt ? promptText() : document.getElementById('dm-markdown')?.textContent || '';
    const original = button.dataset.label || button.textContent;
    button.dataset.label = original;
    try { await navigator.clipboard.writeText(text); button.textContent = 'Copied'; toast(prompt ? 'Prompt and DESIGN.md copied' : 'DESIGN.md copied'); }
    catch { button.textContent = 'Copy failed'; toast('Copy failed. Use Download instead.'); }
    clearTimeout(button.copyTimer); button.copyTimer = setTimeout(() => { button.textContent = original; }, 1600);
  });

  // Likes: one per visitor, toggled.
  const syncLikes = () => {
    for (const button of document.querySelectorAll('[data-like]')) {
      const slug = button.dataset.like;
      if (button.getAttribute('aria-pressed') === 'true') liked.add(slug);
      if (liked.has(slug)) button.setAttribute('aria-pressed', 'true');
    }
    saveLikes();
  };
  syncLikes();

  // Gallery tabs and pages switch in place, without reloading the page. Every tab's
  // cards are fetched once in the background (hovering a tab also warms its pictures),
  // so a switch is instant; the address and the back button still work.
  const gallery = document.getElementById('gallery');
  if (gallery) {
    const cache = new Map();
    const key = href => { const u = new URL(href, location.href); u.hash = ''; return u.pathname + u.search; };
    const load = k => {
      if (!cache.has(k)) cache.set(k, fetch(k, { credentials: 'same-origin' }).then(r => { if (!r.ok) throw Error('HTTP ' + r.status); return r.text(); })
        .then(html => new DOMParser().parseFromString(html, 'text/html').getElementById('gallery')?.innerHTML ?? null)
        .catch(() => { cache.delete(k); return null; }));
      return cache.get(k);
    };
    const warm = async k => { const html = await load(k); if (!html) return; const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html'); [...doc.querySelectorAll('.dm-card-shot img')].slice(0, 8).forEach(img => { new Image().src = img.getAttribute('src'); }); };
    cache.set(key(location.href), Promise.resolve(gallery.innerHTML));
    let current = key(location.href);
    async function show(href, push) {
      const k = key(href);
      if (k === current) return;
      current = k;
      // The chosen tab lights up at once; the cards follow.
      const target = new URL(href, location.href);
      const sortOf = h => new URL(h, location.href).searchParams.get('sort') || '';
      gallery.querySelectorAll('.dm-sorts a').forEach(a => { sortOf(a.href) === sortOf(k) ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
      gallery.setAttribute('aria-busy', 'true');
      const html = await load(k);
      if (current !== k) return;
      if (html == null) { location.href = target.href; return; }
      gallery.innerHTML = html;
      gallery.removeAttribute('aria-busy');
      if (push) history.pushState({ gallery: k }, '', k + '#gallery');
      syncLikes(); window.SitepeelLibrary?.syncMarks?.();
      if (gallery.getBoundingClientRect().top < 0) gallery.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      prefetch();
    }
    const prefetch = () => gallery.querySelectorAll('.dm-sorts a').forEach(a => load(key(a.href)));
    gallery.addEventListener('click', e => {
      const a = e.target.closest('.dm-sorts a, .dm-pages a');
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault(); show(a.href, true);
    });
    gallery.addEventListener('pointerover', e => { const a = e.target.closest('.dm-sorts a'); if (a && !a.dataset.warm) { a.dataset.warm = '1'; warm(key(a.href)); } });
    addEventListener('popstate', () => show(location.href, false));
    (window.requestIdleCallback || (f => setTimeout(f, 1200)))(prefetch);
  }
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-like]');
    if (!button || button.disabled) return;
    event.preventDefault();
    const slug = button.dataset.like, on = button.getAttribute('aria-pressed') !== 'true', count = button.querySelector('span');
    const all = [...document.querySelectorAll(`[data-like="${CSS.escape(slug)}"]`)];
    const set = (pressed, likes) => all.forEach(b => { b.setAttribute('aria-pressed', String(pressed)); const s = b.querySelector('span'); if (s && likes !== undefined) s.textContent = String(likes); });
    const before = Number(count?.textContent || 0);
    set(on, Math.max(0, before + (on ? 1 : -1))); button.disabled = true;
    try {
      const data = await post('/api/design-md/like', { slug, on });
      set(on, data.likes); on ? liked.add(slug) : liked.delete(slug); saveLikes();
    } catch (error) { set(!on, before); toast(error.message); }
    finally { button.disabled = false; }
  });

  // A freshly generated DESIGN.md plays a short reveal: the page first, then the measurements.
  if (new URLSearchParams(location.search).has('new') && document.querySelector('.dm-page')) {
    document.body.classList.add('dm-fresh');
    history.replaceState(null, '', location.pathname + location.hash);
    window.SitepeelLibrary?.me().then(m => { if (m.signedIn && m.access?.active) window.SitepeelLibrary.toast('Saved to your library', { href: '/account/#library', text: 'Open library' }); });
    window.SitepeelFreeTools?.afterRun('designmd');
    setTimeout(() => document.body.classList.remove('dm-fresh'), 4000);
  }

  // Generator form.
  const form = document.getElementById('dm-form');
  if (!form) return;
  const T = window.SitepeelFreeTools;
  const input = document.getElementById('dm-url'), submit = document.getElementById('dm-submit'), label = document.getElementById('dm-submit-label'), status = document.getElementById('dm-status'), listed = document.getElementById('dm-listed'), gate = document.getElementById('dm-gate');
  const protection = window.SitepeelFormProtection?.create(form, 'design_md');
  // Accept whatever people paste: linear.app, www.linear.app or a full https:// link.
  const EXAMPLES = ['linear.app', 'stripe.com', 'vercel.com', 'notion.com', 'framer.com', 'airbnb.com', 'raycast.com', 'spotify.com', 'figma.com'];
  input.placeholder = matchMedia('(max-width:600px)').matches ? 'Paste a website link' : 'Paste a link, like ' + EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
  const params = new URLSearchParams(location.search), preset = params.get('url'), resume = params.get('go') === '1';
  if (preset) input.value = preset.trim().slice(0, 500);
  if (resume) { params.delete('go'); history.replaceState(history.state, '', location.pathname + (params.size ? '?' + params : '') + location.hash); }
  const validLink = value => /^(?:https?:\/\/)?[^\s/]+\.[^\s/.]{2,}/i.test(String(value).trim());
  const hostOf = link => { try { return new URL(/^https?:\/\//i.test(link) ? link : 'https://' + link).hostname.replace(/^www\./, ''); } catch { return ''; } };
  // The site's own icon appears in the field once the link looks right.
  const favicon = form.querySelector('.ft-favicon'), globe = form.querySelector('.ft-globe');
  let iconTimer;
  const showIcon = () => {
    if (!favicon) return;
    const host = validLink(input.value) ? hostOf(input.value) : '';
    if (!host) { favicon.hidden = true; if (globe) globe.style.display = ''; delete favicon.dataset.host; return; }
    if (favicon.dataset.host === host) return;
    favicon.dataset.host = host;
    favicon.onload = () => { const ok = favicon.naturalWidth > 1; favicon.hidden = !ok; if (globe) globe.style.display = ok ? 'none' : ''; };
    favicon.onerror = () => { favicon.hidden = true; if (globe) globe.style.display = ''; };
    favicon.src = '/api/tools/icon?host=' + encodeURIComponent(host);
  };
  input.addEventListener('input', () => { clearTimeout(iconTimer); iconTimer = setTimeout(showIcon, 350); });
  if (input.value) showIcon();
  form.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => { if (busy) return; input.value = button.dataset.example; showIcon(); form.requestSubmit(); }));
  // The gallery choice is remembered, so a retry never publishes by accident.
  const note = document.getElementById('dm-public-note');
  const LISTED = 'sitepeel-design-listed', PENDING = 'sitepeel-design-pending';
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} } };
  const showListed = () => { if (!note) return; note.textContent = listed.checked ? 'Public: anyone can see and like the result in the gallery.' : 'Private: the result stays out of the gallery and opens only by its link.'; note.classList.toggle('private', !listed.checked); };
  // Off unless this browser turned it on.
  if (listed && store.get(LISTED) === '1') listed.checked = true;
  listed?.addEventListener('change', () => { store.set(LISTED, listed.checked ? '1' : '0'); showListed(); });
  showListed();
  const say = (message, kind = '') => { status.hidden = !message; status.className = 'dm-status' + (kind ? ' ' + kind : ''); status.textContent = message; };
  const STEPS = ['Opening the page', 'Waiting for it to finish loading', 'Measuring colors and type', 'Checking buttons and hover states', 'Measuring the mobile layout', 'Writing your DESIGN.md'];
  const TIPS = ['We wait for fonts, images and animations, so the values match what visitors see.', 'Every color is measured where it appears: backgrounds, text, buttons and borders.', 'Hover a button on the result page to see its measured hover state.', 'Your AI agent reads the tokens at the top and the rules below them.', 'Put DESIGN.md in your project root and ask your agent to follow it.'];
  let busy = false, retried = false;
  const setBusy = on => { busy = on; form.toggleAttribute('data-busy', on); submit.setAttribute('aria-busy', String(on)); input.readOnly = on; label.textContent = on ? 'Generating…' : 'Generate'; };
  // A reload during generation resumes: the server finishes the run and the retry opens the saved result.
  const pending = (() => { try { return JSON.parse(store.get(PENDING) || 'null'); } catch { return null; } })();
  if (pending && Date.now() - pending.at < 120000 && !preset) {
    input.value = pending.url; if (listed) listed.checked = pending.listed; showListed(); showIcon();
    say('Finishing your DESIGN.md for ' + pending.url + '…', 'working');
    setTimeout(() => form.requestSubmit(), 600);
  } else store.set(PENDING, null);
  // Back from signing in after the free two: carry on with the same link.
  if (resume && preset) setTimeout(() => form.requestSubmit(), 500);

  // Past the free runs: a pop-up to sign in (it brings them back to this link and runs it),
  // or, signed in without access, the lifetime offer.
  function showGate(code, url) {
    if (!T?.gate) return false;
    if (code === 'DESIGN_SIGN_IN_REQUIRED') { T.gate.signIn({ kind: 'designmd', returnTo: '/design-md/?url=' + encodeURIComponent(url) + '&go=1' }); return true; }
    if (code === 'DESIGN_ACCESS_REQUIRED') { T.gate.lifetime({ kind: 'designmd', blocked: true }); return true; }
    return false;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const url = input.value.trim();
    if (gate) gate.hidden = true;
    if (!validLink(url)) { say('Paste a website link, like linear.app or https://linear.app.', 'error'); input.focus(); return; }
    say('');
    setBusy(true);
    let loading = null;
    try {
      // Out of free runs: the pop-up now, before the bot check and the loading window.
      if (T?.blocked && await T.blocked('designmd', url, '/design-md/?url=' + encodeURIComponent(url) + '&go=1')) { setBusy(false); return; }
      const token = protection ? await protection.token() : '';
      // Refresh a signed-in session first, so the result can go in the library.
      await window.SitepeelLibrary?.me().catch(() => null);
      loading = T?.loader({ host: hostOf(url), title: 'Building your DESIGN.md', steps: STEPS, tips: TIPS, visual: 'page', estimate: 20, tool: 'design-md' });
      store.set(PENDING, JSON.stringify({ url, listed: !!listed?.checked, at: Date.now() }));
      const fresh = new URLSearchParams(location.search).get('fresh') === '1';
      const data = await post('/api/design-md/generate', { url, listed: !!listed?.checked, token, ...(fresh ? { fresh: true } : {}) });
      store.set(PENDING, null);
      await loading?.done();
      if (data.locked && T?.gate) { setBusy(false); T.gate.signIn({ kind: 'designmd', ready: true, returnTo: data.url + '?new=1' }); return; }
      location.href = data.url + (data.cached ? '' : '?new=1');
    } catch (error) {
      loading?.close();
      store.set(PENDING, null);
      protection?.reset();
      setBusy(false);
      // A signed-in visitor whose short session had lapsed: refresh it and try once more.
      if (error.code === 'DESIGN_SIGN_IN_REQUIRED' && !retried && (await window.SitepeelLibrary?.me(true).catch(() => null))?.signedIn) { retried = true; form.requestSubmit(); return; }
      if (!showGate(error.code, url)) say(error.message || 'Something went wrong. Please try again.', 'error');
    }
  });
})();
