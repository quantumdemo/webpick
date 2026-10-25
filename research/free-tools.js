/* Shared helpers for Sitepeel's free website tools. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const toast = message => {
    const el = document.createElement('div'); el.className = 'ft-toast'; el.setAttribute('role', 'status'); el.textContent = message;
    document.body.append(el); setTimeout(() => el.remove(), 1900);
  };
  // Results fetched by the link box (homepage, free tools page) travel to the tool's page:
  // the box keeps the response here and opens the page with ?handoff=1; the page's own run
  // then gets it back from post() at once, with no second check or loading window.
  // IndexedDB, as some results are megabytes. One waiting behind sign-in keeps 30 minutes.
  const handoff = (() => {
    const open = () => new Promise((resolve, reject) => { const r = indexedDB.open('sitepeel-handoff', 1); r.onupgradeneeded = () => r.result.createObjectStore('runs'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
    const tx = async (mode, fn) => { const db = await open(); return new Promise((resolve, reject) => { const t = db.transaction('runs', mode), req = fn(t.objectStore('runs')); t.oncomplete = () => { db.close(); resolve(req?.result); }; t.onerror = () => { db.close(); reject(t.error); }; }); };
    const key = url => String(url || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');
    const same = (e, path, body) => !!e && e.path === path && key(e.body?.url) === key(body?.url) && (e.body?.mode || '') === (body?.mode || '') && (e.body?.tool || '') === (body?.tool || '');
    const params = new URLSearchParams(location.search);
    const waiting = !params.has('handoff') ? Promise.resolve(null) : tx('readonly', st => st.get('last')).catch(() => null).then(e => {
      params.delete('handoff'); history.replaceState(history.state, '', location.pathname + (params.size ? '?' + params : '') + location.hash);
      return e && Date.now() - e.at < (e.gated ? 1800000 : 300000) ? e : null;
    });
    let now = null; waiting.then(e => { now = e; });
    return {
      waiting, same,
      put: entry => tx('readwrite', st => st.put({ ...entry, at: Date.now() }, 'last')).catch(() => {}),
      clear: () => tx('readwrite', st => st.delete('last')).catch(() => {}),
      get active() { return !!now && !now.used; },
    };
  })();
  async function post(path, body) {
    const kept = await handoff.waiting;
    if (kept && !kept.used && handoff.same(kept, path, body)) { kept.used = true; handoff.clear(); return kept.data; }
    const response = await fetch(path, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    let data = {}; try { data = await response.json(); } catch {}
    if (!response.ok || !data.ok) throw Object.assign(Error(data.error || 'Something went wrong. Please try again.'), { code: data.code, status: response.status });
    return data;
  }
  // Accept linear.app, www.linear.app or a full https:// link.
  const validLink = value => /^(?:https?:\/\/)?[^\s/]+\.[^\s/.]{2,}/i.test(String(value).trim());
  const EXAMPLES = ['linear.app', 'stripe.com', 'vercel.com', 'notion.com', 'apple.com', 'framer.com', 'airbnb.com', 'raycast.com', 'spotify.com', 'figma.com'];

  // Wires the shared link form: validation, bot check, busy state and messages.
  function form(options) {
    const el = options.form || document.getElementById('ft-form');
    if (!el) return null;
    const input = el.querySelector('input[name=url]'), submit = el.querySelector('button[type=submit]'), label = el.querySelector('[id$=submit-label]') || submit, status = el.querySelector('.ft-status');
    const idle = label.textContent;
    // Phones get a short placeholder that fits beside the button.
    if (!input.value) input.placeholder = matchMedia('(max-width:600px)').matches ? 'Paste a website link' : 'Paste a link, like ' + EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
    const preset = new URLSearchParams(location.search).get('url');
    if (preset && options.preset !== false) input.value = preset.trim().slice(0, 2000);
    const protection = window.SitepeelFormProtection?.create(el, 'free_tools');
    const say = (message, kind = '') => { if (!status) return; status.hidden = !message; status.className = 'ft-status' + (kind ? ' ' + kind : ''); status.textContent = message; };
    // Example sites fill the field and run; the site's icon appears once the link looks valid.
    el.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => { if (busy) return; input.value = button.dataset.example; showIcon(); el.requestSubmit(); }));
    const favicon = el.querySelector('.ft-favicon'), globe = el.querySelector('.ft-globe');
    let iconTimer;
    const showIcon = () => {
      if (!favicon) return;
      const host = validLink(input.value) ? hostOf(input.value) : '';
      if (!host) { favicon.hidden = true; if (globe) globe.style.display = ''; return; }
      if (favicon.dataset.host === host) return;
      favicon.dataset.host = host;
      favicon.onload = () => { const ok = favicon.naturalWidth > 1; favicon.hidden = !ok; if (globe) globe.style.display = ok ? 'none' : ''; };
      favicon.onerror = () => { favicon.hidden = true; if (globe) globe.style.display = ''; };
      favicon.src = iconUrl(host);
    };
    input.addEventListener('input', () => { clearTimeout(iconTimer); iconTimer = setTimeout(showIcon, 350); });
    if (input.value) showIcon();
    let busy = false, timer;
    const api = {
      input, say,
      async token() { const kept = await handoff.waiting; if (kept && !kept.used && kept.body?.token !== false) return ''; return protection ? protection.token() : ''; },
      reset() { protection?.reset(); },
      progress(steps, every = 3200) { let i = 0; say(steps[0], 'working'); clearInterval(timer); timer = setInterval(() => { i = Math.min(i + 1, steps.length - 1); say(steps[i], 'working'); }, every); },
      stop() { clearInterval(timer); },
      setBusy(on, text) { busy = on; el.toggleAttribute('data-busy', on); submit.setAttribute('aria-busy', String(on)); input.readOnly = on; label.textContent = on ? (text || 'Working…') : idle; },
      get busy() { return busy; },
      url() { return input.value.trim(); },
    };
    el.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy) return;
      if (!validLink(input.value)) { say('Paste a website link, like linear.app or https://linear.app.', 'error'); input.focus(); return; }
      document.querySelector('[data-preview]')?.remove();
      api.setBusy(true, options.busyLabel);
      try { await options.onSubmit(api.url(), api); }
      catch (error) { say(error.message || 'Something went wrong. Please try again.', 'error'); }
      finally { api.stop(); api.reset(); api.setBusy(false); }
    });
    if (preset && options.autorun) handoff.waiting.then(kept => setTimeout(() => el.requestSubmit(), kept ? 0 : 400));
    return api;
  }
  async function copyText(text, message = 'Copied') {
    try { await navigator.clipboard.writeText(text); toast(message); } catch { toast('Copy failed'); }
  }
  function download(data, filename) {
    const url = data instanceof Blob ? URL.createObjectURL(data) : data;
    const a = Object.assign(document.createElement('a'), { href: url, download: filename }); document.body.append(a); a.click(); a.remove();
    if (data instanceof Blob) setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  const iconUrl = host => '/api/tools/icon?host=' + encodeURIComponent(host);

  // Loading popup for runs that take a while: the site, Peel and then the other tools, the
  // steps and short tips. loader({host, title, steps, tips, estimate, tool}) → {next, done, close}.

  // The first seconds of every run (owner, 2026-10-24: something funny and cute before the
  // promos): Peel, a little sticker with a magnifying glass, inspects the page and peels its
  // corner while a silly line about this site changes every two seconds. Drawn in code.
  const BUDDY = `<div class="ftb-wrap"><svg class="ftb" viewBox="0 0 320 150" aria-hidden="true" focusable="false">
    <path class="ftb-ground" d="M24 136H296"/>
    <g class="ftb-site"><rect class="ftb-paper" x="172" y="26" width="120" height="104" rx="8"/><path class="ftb-bar" d="M172 42h120"/><circle class="ftb-dot" cx="182" cy="34" r="2.5"/><circle class="ftb-dot" cx="190" cy="34" r="2.5"/><circle class="ftb-dot" cx="198" cy="34" r="2.5"/>
      <rect class="ftb-ink" x="184" y="54" width="58" height="8" rx="2"/><rect class="ftb-ink2" x="184" y="68" width="88" height="5" rx="2"/><rect class="ftb-ink2" x="184" y="78" width="72" height="5" rx="2"/><rect class="ftb-btn" x="184" y="94" width="36" height="14" rx="7"/>
      <path class="ftb-peel" d="M292 130V106L268 130Z"/><path class="ftb-spark" d="M302 92l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></g>
    <ellipse class="ftb-shadow" cx="98" cy="137" rx="30" ry="4"/>
    <g class="ftb-body"><path class="ftb-tab" d="M100 62c4-12 14-16 22-12-5 8-12 11-22 12z"/><rect class="ftb-skin" x="66" y="60" width="64" height="70" rx="24"/>
      <g class="ftb-eyes"><circle class="ftb-eye" cx="88" cy="90" r="9.5"/><circle class="ftb-eye" cx="110" cy="90" r="9.5"/><g class="ftb-pupils"><circle class="ftb-pupil" cx="90" cy="91" r="4.2"/><circle class="ftb-pupil" cx="112" cy="91" r="4.2"/><circle class="ftb-shine" cx="91.5" cy="89.5" r="1.3"/><circle class="ftb-shine" cx="113.5" cy="89.5" r="1.3"/></g></g>
      <circle class="ftb-cheek" cx="78" cy="106" r="4.5"/><circle class="ftb-cheek" cx="120" cy="106" r="4.5"/><path class="ftb-smile" d="M93 108q6 6 12 0"/>
      <rect class="ftb-foot" x="78" y="126" width="15" height="8" rx="4"/><rect class="ftb-foot" x="104" y="126" width="15" height="8" rx="4"/>
      <g class="ftb-glass"><path class="ftb-arm" d="M128 100q14 0 22-12"/><path class="ftb-handle" d="M150 88l-8 8"/><circle class="ftb-lens" cx="160" cy="76" r="15"/><path class="ftb-glint" d="M152 70q4-5 10-5"/></g></g>
  </svg><p class="ftb-line" aria-live="polite"></p></div>`;
  const QUIPS = {
    '': ['Knocking on {host}’s door…', 'Wiping the magnifying glass…', 'Peeling back the first layer…', 'Taking very careful notes…'],
    'design-md': ['Asking {host} for its colors…', 'Measuring every button with a tiny ruler…', 'Writing down the font’s name…', 'Peeling back the first layer…'],
    clone: ['Sketching {host} on a napkin…', 'Counting the sections twice…', 'Measuring the spacing with a tiny ruler…', 'Collecting the logo and pictures…'],
    slop: ['Sniffing {host} for AI slop…', 'Looking for purple gradients…', 'Counting the em dashes…', 'Checking for a “Not just X, it’s Y”…'],
    assets: ['Rummaging through {host}’s drawers…', 'Finding the SVGs it hid…', 'Counting every picture…', 'Packing the box…'],
    screenshot: ['Asking {host} to say cheese…', 'Scrolling all the way down…', 'Holding the camera very still…'],
    fonts: ['Asking the fonts their names…', 'Squinting at the letters…', 'Measuring every heading…'],
  };

  // While a run works, the space under the address bar shows the other tools: drawn,
  // animated line art and one plain sentence each (opens in a new tab).
  const STORE = 'https://chromewebstore.google.com/detail/sitepeel/khcjkaobanoeohahnlffnnppinoeljme';
  const SHOWCASE = [
    { id: 'design-md', href: '/design-md/', title: 'DESIGN.md for any website', text: 'Colors, type and spacing, measured into a file your AI agent follows.',
      art: '<svg viewBox="0 0 160 110" class="fts-art"><rect x="8" y="14" width="62" height="82" rx="4" class="l"/><rect x="16" y="24" width="30" height="6" class="f"/><rect x="16" y="36" width="46" height="4" class="f2"/><rect x="16" y="46" width="40" height="4" class="f2"/><rect x="16" y="62" width="20" height="10" rx="2" class="a"/><path d="M8 22h62" class="l"/><rect x="10" y="20" width="58" height="2" class="scan"/><g class="fly"><rect x="58" y="62" width="7" height="7" rx="1" class="a"/><rect x="58" y="36" width="7" height="7" rx="1" class="g"/></g><path d="M96 14h38l12 12v70H96z" class="l"/><path d="M134 14v12h12" class="l"/><rect x="104" y="34" width="34" height="3" class="ln" style="--d:0s"/><rect x="104" y="44" width="26" height="3" class="ln" style="--d:.25s"/><rect x="104" y="54" width="30" height="3" class="ln" style="--d:.5s"/><rect x="104" y="64" width="20" height="3" class="ln" style="--d:.75s"/><rect x="104" y="74" width="28" height="3" class="ln" style="--d:1s"/></svg>' },
    { id: 'assets', href: '/free-tools/asset-extractor/', title: 'Every asset, even the hidden ones', text: 'SVGs, sprites, Lottie files and 3D models, ready in one ZIP.',
      art: '<svg viewBox="0 0 160 110" class="fts-art"><rect x="8" y="14" width="64" height="82" rx="4" class="l"/><path d="M8 22h64" class="l"/><g class="pop" style="--d:0s"><path d="m28 38 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" class="a"/></g><g class="pop" style="--d:.4s"><circle cx="54" cy="46" r="7" class="lg"/></g><g class="pop" style="--d:.8s"><path d="m40 66 10-6 10 6-10 6zM40 66v11l10 6V72M60 66v11l-10 6" class="lw"/></g><g class="tiles"><rect x="96" y="20" width="22" height="22" rx="3" class="t" style="--d:.2s"/><rect x="124" y="20" width="22" height="22" rx="3" class="t" style="--d:.5s"/><rect x="96" y="48" width="22" height="22" rx="3" class="t" style="--d:.8s"/><rect x="124" y="48" width="22" height="22" rx="3" class="t" style="--d:1.1s"/><rect x="96" y="76" width="50" height="14" rx="3" class="zip"/></g></svg>' },
    { id: 'slop', href: '/free-tools/ai-slop-checker/', title: 'Does it look AI-made?', text: 'A score, the tells we found, and a prompt that fixes them.',
      art: '<svg viewBox="0 0 160 110" class="fts-art"><path d="M30 78a50 50 0 0 1 100 0" class="arc"/><path d="M30 78a50 50 0 0 1 100 0" class="arc-on"/><g class="needle"><path d="M80 78 80 38" class="nd"/></g><circle cx="80" cy="78" r="4" class="a"/><rect x="22" y="88" width="30" height="12" rx="2" class="tell" style="--d:0s"/><rect x="65" y="88" width="30" height="12" rx="2" class="tell" style="--d:.5s"/><rect x="108" y="88" width="30" height="12" rx="2" class="tell" style="--d:1s"/></svg>' },
    { id: 'screenshot', href: '/free-tools/screenshot/', title: 'Full-page screenshots', text: 'Capture any site, frame it, blur it and export.',
      art: '<svg viewBox="0 0 160 110" class="fts-art"><g class="turn"><path d="M40 20h80v52H40z" class="l"/><path d="M46 26h68v40H46z" class="sc"/><rect x="52" y="32" width="28" height="5" class="f"/><rect x="52" y="42" width="42" height="3" class="f2"/><rect x="52" y="50" width="16" height="7" rx="1" class="a"/><path d="M28 80h104l-8 8H36z" class="l"/><path d="M40 72h80l8 8H32z" class="l"/></g><path d="M18 100h124" class="l dim"/></svg>' },
    { id: 'fonts', href: '/free-tools/font-finder/', title: 'Every font on a page', text: 'Where each one is used, with free look-alikes for paid fonts.',
      art: '<svg viewBox="0 0 160 110" class="fts-art"><text x="80" y="74" text-anchor="middle" class="glyph">Aa</text><path d="M24 74h112" class="guide" style="--d:0s"/><path d="M24 44h112" class="guide" style="--d:.4s"/><path d="M24 30h112" class="guide" style="--d:.8s"/><rect x="104" y="84" width="34" height="12" rx="2" class="tag"/></svg>' },
    { id: 'extension', href: STORE, title: '13 tools in one extension', text: 'Inspect, clone and export from any page you open in Chrome.',
      art: '<svg viewBox="0 0 160 110" class="fts-art"><rect x="10" y="12" width="140" height="22" rx="4" class="l"/><circle cx="20" cy="23" r="2.5" class="f2"/><circle cx="28" cy="23" r="2.5" class="f2"/><rect x="40" y="18" width="70" height="10" rx="5" class="f2"/><rect x="128" y="16" width="14" height="14" rx="3" class="a"/>' + Array.from({ length: 13 }, (_, i) => `<rect x="${22 + (i % 7) * 17}" y="${48 + Math.floor(i / 7) * 22}" width="12" height="12" rx="2" class="dot" style="--d:${(i * 0.12).toFixed(2)}s"/>`).join('') + '</svg>' },
  ];

  function loader({ host = '', title = 'Working on it', steps = [], tips = [], visual = 'page', estimate = 12, tool = '' } = {}) {
    if (handoff.active) return { next() {}, async done() {}, close() {} };
    const root = document.createElement('div');
    root.className = 'ftl'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', title);
    root.innerHTML = `<div class="ftl-card"><div class="ftl-bar"><span class="ftl-dots"><i></i><i></i><i></i></span><span class="ftl-address">${host ? `<img class="ftl-icon" src="${esc(iconUrl(host))}" alt="" width="14" height="14">` : ''}<span>${esc(host || 'sitepeel.dev')}</span></span></div>
      <div class="ftl-scene"><div class="ftl-own">${BUDDY}</div><div class="fts" aria-label="More from Sitepeel">${SHOWCASE.filter(x => x.id !== tool).map((x, i) => `<div class="fts-slide" data-i="${i}">${x.art}<div class="fts-text"><span class="fts-kicker">Also in Sitepeel</span><b>${esc(x.title)}</b><span>${esc(x.text)}</span><a href="${esc(x.href)}" target="_blank" rel="noopener">Try it ↗</a></div></div>`).join('')}</div><span class="fts-dots" aria-hidden="true"></span></div>
      <div class="ftl-body"><b class="ftl-title">${esc(title)}</b><ol class="ftl-steps">${steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol>
      <div class="ftl-progress" aria-hidden="true"><i></i></div><p class="ftl-time"><span class="ftl-left"></span><span class="ftl-clock" aria-hidden="true">0:00</span></p><p class="ftl-tip" aria-live="polite"></p></div></div>`;
    document.body.append(root);
    root.querySelector('.ftl-icon')?.addEventListener('load', e => { if (e.target.naturalWidth <= 1) e.target.remove(); });
    root.querySelector('.ftl-icon')?.addEventListener('error', e => e.target.remove());
    const items = [...root.querySelectorAll('.ftl-steps li')], bar = root.querySelector('.ftl-progress i'), tip = root.querySelector('.ftl-tip');
    const leftText = root.querySelector('.ftl-left'), clock = root.querySelector('.ftl-clock');
    // The task's own picture first, then the other tools, one every few seconds.
    const scene = root.querySelector('.ftl-scene'), slides = [...root.querySelectorAll('.fts-slide')], dots = root.querySelector('.fts-dots');
    dots.innerHTML = slides.map(() => '<i></i>').join('');
    let slide = -1, showLoop = 0;
    const nextSlide = () => { if (!slides.length) return; slide = (slide + 1) % slides.length; scene.classList.add('is-showing'); slides.forEach((x, n) => x.classList.toggle('on', n === slide)); [...dots.children].forEach((d, n) => d.classList.toggle('on', n === slide)); };
    // Peel's silly lines first (about six seconds), then the other tools.
    const lines = (QUIPS[tool] || QUIPS['']).map(x => x.replace('{host}', host || 'the site')), say = root.querySelector('.ftb-line');
    let q = 0; const quip = () => { say.classList.remove('in'); setTimeout(() => { say.textContent = lines[q++ % lines.length]; say.classList.add('in'); }, 160); };
    quip(); const quipLoop = setInterval(quip, 2000);
    const showTimer = setTimeout(() => { clearInterval(quipLoop); nextSlide(); showLoop = setInterval(nextSlide, 4200); }, 6200);
    // A real time estimate: a countdown from the usual run time, then an honest note when it runs long.
    const roundTo = n => n <= 15 ? Math.max(5, Math.round(n)) : Math.round(n / 5) * 5;
    const timeText = t => { const left = estimate - t; if (t < 1.5) return `Usually takes about ${roundTo(estimate)} seconds`; if (left > 3) return `About ${roundTo(left)} seconds left`; if (left > -estimate * 0.35) return 'Almost done…'; return t < 90 ? 'Taking longer than usual. Big pages can take up to 90 seconds.' : 'Still working. This page is slow to load.'; };
    let shown = '';
    let index = -1, closed = false;
    const started = performance.now();
    const set = i => { index = Math.min(i, items.length - 1); items.forEach((item, n) => { item.className = n < index ? 'done' : n === index ? 'active' : ''; }); };
    set(0);
    requestAnimationFrame(() => root.classList.add('open'));
    // Steps advance on their own over the expected time; the bar eases towards 92%.
    const tick = setInterval(() => {
      const t = (performance.now() - started) / 1000;
      bar.style.width = Math.min(92, 100 * (1 - Math.exp(-t / Math.max(3, estimate) * 1.6))) + '%';
      const auto = Math.min(items.length - 1, Math.floor(t / (Math.max(3, estimate) / Math.max(1, items.length))));
      if (auto > index) set(auto);
      const text = timeText(t); if (text !== shown) { shown = text; leftText.textContent = text; }
      clock.textContent = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    }, 200);
    let t = 0; const showTip = () => { if (!tips.length) return; tip.classList.remove('in'); setTimeout(() => { tip.textContent = tips[t++ % tips.length]; tip.classList.add('in'); }, 180); };
    showTip(); const tipTimer = setInterval(showTip, 4200);
    const close = () => { if (closed) return; closed = true; clearInterval(tick); clearInterval(tipTimer); clearTimeout(showTimer); clearInterval(showLoop); clearInterval(quipLoop); root.classList.remove('open'); setTimeout(() => root.remove(), 260); };
    return {
      next() { set(index + 1); },
      async done() { if (closed) return; set(items.length); items.forEach(item => item.className = 'done'); bar.style.width = '100%'; await new Promise(r => setTimeout(r, 420)); close(); },
      close,
    };
  }

  // Pop-ups (2026-10-24): a result waiting behind sign-in, sign in to keep going, and the
  // lifetime offer. Centred over a scrim with the page locked; Esc, the backdrop and Close
  // dismiss them. Sign-in goes to the account page, which brings people back (returnTo).
  const X = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  const GO = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const TICK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  const READY = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="m9.5 14.5 2 2 3.5-4"/></svg>';
  const OUT = '<svg class="ftg-out" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';
  const CHROME = '<img src="/logos/chrome.svg" alt="" width="15" height="15">';
  const LOCK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  function modal(inner) {
    document.querySelector('.ftg')?.remove();
    const root = document.createElement('div'), before = document.activeElement;
    root.className = 'ftg'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'ftg-title');
    root.innerHTML = `<div class="ftg-card" tabindex="-1"><button type="button" class="ftg-close" aria-label="Close">${X}</button>${inner}</div>`;
    const onKey = event => { if (event.key === 'Escape') close(); };
    function close() { removeEventListener('keydown', onKey); root.classList.remove('open'); document.documentElement.classList.remove('ftg-lock'); setTimeout(() => root.remove(), 180); before?.focus?.({ preventScroll: true }); }
    root.addEventListener('click', event => { if (event.target === root || event.target.closest('.ftg-close,[data-ftg-close]')) close(); });
    addEventListener('keydown', onKey);
    document.body.append(root); document.documentElement.classList.add('ftg-lock');
    requestAnimationFrame(() => root.classList.add('open'));
    root.querySelector('.ftg-card').focus({ preventScroll: true });
    return { root, close };
  }
  const remember = path => { try { sessionStorage.setItem('sitepeel-after-signin', JSON.stringify({ path, at: Date.now() })); } catch { /* storage blocked */ } };
  const NOUN = { designmd: ['DESIGN.md', 'DESIGN.md files'], assets: ['asset list', 'asset downloads'], clone: ['clone prompt', 'clone prompts'] };
  const gate = {
    // ready: the result is made and waits for sign-in; otherwise sign in before the next run.
    signIn({ kind = 'designmd', ready = false, returnTo = location.pathname + location.search } = {}) {
      const [one, many] = NOUN[kind] || NOUN.designmd;
      const m = modal(`<span class="ftg-icon${ready ? ' ftg-icon-ready' : ''}">${ready ? READY : LOCK}</span>
        <h2 id="ftg-title">${ready ? `Your ${esc(one)} is ready` : 'Sign in to keep going'}</h2>
        <p>${ready ? 'Sign in to open it. It’s free and takes a few seconds.' : `You’ve used today’s free ${esc(many)}. Sign in to make more. It’s free, and it brings you right back.`}</p>
        <div class="ftg-actions"><a class="ft-btn ft-btn-primary" href="/account/" data-ftg-signin>${ready ? 'Sign in to see it' : 'Sign in'}${GO}</a></div>
        <p class="ftg-note">Google or email. You’ll come straight back here.</p>`);
      m.root.querySelector('[data-ftg-signin]').addEventListener('click', () => remember(returnTo));
      return m;
    },
    // The lifetime offer: what you get, the live regional price, one action.
    async lifetime({ kind = 'designmd', blocked = false } = {}) {
      const [, many] = NOUN[kind] || NOUN.designmd;
      const m = modal(`<p class="ftg-kicker">${blocked ? 'Free limit reached' : 'Lifetime access'}</p>
        <h2 id="ftg-title">${blocked ? `You’ve used today’s free ${esc(many)}` : `Make unlimited ${esc(many)}`}</h2>
        ${blocked ? `<p class="ftg-sub">Get lifetime access to keep going now, with no limits. Or come back tomorrow.</p>` : ''}
        <p class="ftg-price" aria-live="polite"><s hidden></s><strong>…</strong><span>one-time</span></p>
        <ul class="ftg-list">${[['Unlimited DESIGN.md files, clone prompts and asset downloads'], ['All 13 tools in the Sitepeel Chrome extension', CHROME, '/extension/'], ['Every result saved to your library'], ['Future updates. No subscription.']].map(([item, mark = TICK, href]) => href ? `<li><a class="ftg-link" href="${href}" target="_blank" rel="noopener">${mark}<span>${item}</span>${OUT}<span class="sr-only"> (opens in a new tab)</span></a></li>` : `<li>${mark}<span>${item}</span></li>`).join('')}</ul>
        <div class="ftg-actions ftg-two" data-checkout-box><a class="ft-btn ft-btn-primary" href="/account/?buy=1" data-checkout="popup"><span data-checkout-label>Get lifetime access</span>${GO}</a><button type="button" class="ft-btn" data-ftg-close>Not now</button><p class="ftg-error" data-checkout-status role="alert" hidden></p></div>
        <p class="ftg-note ftg-terms">Goes straight to secure checkout. By continuing you agree to the <a href="/terms/" target="_blank" rel="noopener">Terms</a> and <a href="/refunds/" target="_blank" rel="noopener">Refund Policy</a>.</p>`);
      const price = m.root.querySelector('.ftg-price strong'), was = m.root.querySelector('.ftg-price s');
      try {
        const p = await fetch('/api/pricing', { cache: 'no-store' }).then(r => r.json());
        if (!p?.ok || typeof p.formatted !== 'string') throw Error();
        price.textContent = p.formatted;
        if (p.tier === 'launch' && !p.offer?.soldOut && typeof p.regularFormatted === 'string') { was.textContent = p.regularFormatted; was.hidden = false; }
      } catch { price.textContent = 'Pay once'; m.root.querySelector('.ftg-price span').hidden = true; }
      return m;
    },
  };
  // Before a gated run (owner, 2026-10-24): someone out of free runs sees the pop-up at once,
  // not after the bot check and the loading window. Nothing is counted; a link made in the
  // last day stays free. Returns true when the pop-up was shown and the run should not start.
  async function blocked(kind, link, returnTo) {
    const kept = await handoff.waiting;
    if (kept && !kept.used) return false;
    // A short session cookie that lapsed is refreshed first, so the account's runs count.
    await window.SitepeelLibrary?.me().catch(() => null);
    let state = 'ok';
    try {
      const r = await fetch(`/api/tools/allowance?kind=${encodeURIComponent(kind)}&url=${encodeURIComponent(link)}`, { credentials: 'same-origin', cache: 'no-store' });
      const d = await r.json();
      if (d?.ok && typeof d.state === 'string') state = d.state;
    } catch { /* the run itself still checks */ }
    if (state === 'sign-in') { gate.signIn({ kind, returnTo }); return true; }
    if (state === 'lifetime') { gate.lifetime({ kind, blocked: true }); return true; }
    return false;
  }
  // After a run: a signed-in account without access sees the lifetime offer, once per page.
  let offered = false;
  async function afterRun(kind = 'designmd') {
    if (offered) return;
    const who = await window.SitepeelLibrary?.me().catch(() => null);
    if (!who?.signedIn || who.access?.active) return;
    offered = true;
    setTimeout(() => gate.lifetime({ kind }), 1200);
  }

  const hostOf = link => { try { return new URL(/^https?:\/\//i.test(link) ? link : 'https://' + link).hostname.replace(/^www\./, ''); } catch { return 'site'; } };
  // Tool cards show their size on hover, like an element picked in the inspector.
  document.addEventListener('pointerover', event => {
    const card = event.target.closest?.('.ft-cards:not(.ft-cards-small) > .ft-tool-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.dataset.size = `a · ${Math.round(r.width)} × ${Math.round(r.height)}`;
  }, { passive: true });
  // The scrollbar's width, so full-width tool views can span the window exactly (--sbw).
  const scrollbar = () => document.documentElement.style.setProperty('--sbw', Math.max(0, innerWidth - document.documentElement.clientWidth) + 'px');
  scrollbar(); addEventListener('resize', scrollbar);
  window.SitepeelFreeTools = { esc, toast, post, form, copyText, download, hostOf, validLink, iconUrl, loader, handoff, gate, afterRun, blocked };
})();
