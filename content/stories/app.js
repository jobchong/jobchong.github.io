/* app.js: the shelf, the reader, the typing, the voice.
 *
 * Keys the app listens for (all of them are on the Karabiner allowlist):
 *   letters        fill in the blank
 *   left / right   turn the page (right only once the page is filled in)
 *   up / space     read the page again
 *   down           a hint: show the next letter and light up its key
 *   return         open a book / turn the page
 * Shortcuts with cmd, ctrl or option are left alone for grown-ups.
 */
(function () {
  'use strict';

  const BOOKS = window.BOOKS, SHELVES = window.SHELVES, ART = window.ART;
  const params = new URLSearchParams(location.search);
  const SETTINGS = {
    // The browser's built-in voices sound robotic, so reading aloud is off.
    // ?speech=on turns it back on (a stand-in until there are recorded clips).
    speech: params.get('speech') === 'on',
    rate: +params.get('rate') || 0.92,      // speaking speed for the big shelf
    littleRate: +params.get('rate') || 0.85, // and for the little shelf
    voice: params.get('voice') || '',        // e.g. ?voice=Daniel
    idleMs: 11000,                           // quiet time before a gentle reminder
    nagGapMs: 2600                           // don't repeat a reminder faster than this
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const screenEl = $('#screen'), kbEl = $('#keyboard');

  // Letter names, spelled so the speech voice says the name, not the sound.
  const NAME = {
    a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'eff', g: 'jee', h: 'aitch', i: 'eye', j: 'jay',
    k: 'kay', l: 'ell', m: 'em', n: 'en', o: 'oh', p: 'pee', q: 'queue', r: 'ar', s: 'ess', t: 'tee',
    u: 'you', v: 'vee', w: 'double-you', x: 'ex', y: 'why', z: 'zed'
  };
  const PRAISE = ['Well done!', 'Splendid!', 'Hooray!', 'Jolly good!', 'Clever you!', 'Wonderful!', 'Marvellous!', 'You did it!'];

  /* ---------------- storage (stars) ---------------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('briarpatch.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('briarpatch.' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };

  /* ---------------- little sounds ---------------- */
  const Sound = (() => {
    let ctx = null;
    function ac() {
      if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function tone(freq, t0, dur, type = 'sine', gain = 0.08) {
      const c = ac(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
    }
    function noise(dur, f0, f1, gain = 0.05) {
      const c = ac(); if (!c) return;
      const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime;
      src.buffer = buf; bp.type = 'bandpass'; bp.Q.value = 1.1;
      bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(bp); bp.connect(g); g.connect(c.destination); src.start(t);
    }
    return {
      wake: ac,
      stamp() { noise(0.07, 1400, 300, 0.14); tone(150, 0, 0.12, 'sine', 0.1); },
      nope() { tone(220, 0, 0.16, 'sine', 0.035); tone(185, 0.07, 0.2, 'sine', 0.03); },
      chime() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.09, 0.9, 'triangle', 0.05)); },
      turn() { noise(0.38, 450, 3200, 0.07); },
      star() { [1047, 1319, 1568, 2093, 2637].forEach((f, i) => tone(f, i * 0.08, 0.8, 'sine', 0.05)); },
      tick() { tone(700, 0, 0.05, 'triangle', 0.025); }
    };
  })();

  /* ---------------- the reading voice ---------------- */
  const Voice = (() => {
    const synth = window.speechSynthesis;
    let voice = null, token = 0;
    const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|deranged|hysterical|junior|ralph|fred|kathy|princess|grandpa|grandma|rocko|shelley|sandy|flo|eddy|reed/i;
    const PREFER = [/serena/i, /kate/i, /daniel/i, /stephanie/i, /martha/i, /arthur/i, /oliver/i, /jamie/i, /google uk english female/i];
    function choose() {
      if (!synth) return;
      const all = synth.getVoices();
      if (SETTINGS.voice) { const v = all.find((x) => x.name.toLowerCase().includes(SETTINGS.voice.toLowerCase())); if (v) { voice = v; return; } }
      const en = all.filter((v) => /^en/i.test(v.lang) && !NOVELTY.test(v.name));
      const score = (v) => {
        let s = 0;
        if (/en[-_]GB/i.test(v.lang)) s += 50;
        const i = PREFER.findIndex((r) => r.test(v.name)); if (i >= 0) s += 40 - i;
        if (/premium|enhanced/i.test(v.name)) s += 30;
        if (/samantha/i.test(v.name)) s += 20;
        if (v.localService) s += 5;
        return s;
      };
      voice = en.sort((a, b) => score(b) - score(a))[0] || null;
    }
    if (synth) { choose(); synth.addEventListener ? synth.addEventListener('voiceschanged', choose) : (synth.onvoiceschanged = choose); }

    function chunks(text) {
      return String(text).replace(/([.!?;:])\s+/g, '$1\n').split('\n').map((s) => s.trim()).filter(Boolean);
    }
    function say(text, then, opts = {}) {
      const my = ++token;
      let finished = false;
      const finish = () => { if (finished) return; finished = true; if (my === token && typeof then === 'function') then(); };
      const parts = chunks(text);
      if (!synth || !SETTINGS.speech || !parts.length) { setTimeout(finish, 250); return; }
      const rate = opts.rate || (R && R.little ? SETTINGS.littleRate : SETTINGS.rate);
      const go = () => {
        if (my !== token) return;
        parts.forEach((p, i) => {
          const u = new SpeechSynthesisUtterance(p);
          if (voice) { u.voice = voice; u.lang = voice.lang; }
          u.rate = rate; u.pitch = 1.05;
          if (i === parts.length - 1) { u.onend = finish; u.onerror = finish; }
          synth.speak(u);
        });
        // a safety net, in case the browser never says it has finished
        setTimeout(finish, parts.join(' ').length * (95 / rate) + 2500);
      };
      if (synth.speaking || synth.pending) { synth.cancel(); setTimeout(go, 60); } else go();
    }
    return {
      say,
      stop() { token++; if (synth) synth.cancel(); },
      speaking() { return !!(synth && (synth.speaking || synth.pending)); }
    };
  })();

  // How the voice should pronounce a few things.
  function speakable(t) {
    return String(t).replace(/\[([^\]]+)\]/g, '$1')
      .replace(/E-I-E-I-O/g, 'ee, eye, ee, eye, oh')
      .replace(/\bBrer\b/g, 'Brair')
      .replace(/A-a-a-CHOO/g, 'ah, ah, ah, choo')
      .replace(/\bPLEASE\b/g, 'please')
      .replace(/["“”]/g, '');
  }
  const say = (text, then, opts) => Voice.say(speakable(text), then, opts);
  let lastNag = 0;
  function nag(text, opts) {
    const now = Date.now();
    if (now - lastNag < SETTINGS.nagGapMs) return;
    lastNag = now; say(text, armIdle, opts);
  }

  /* ---------------- the typewriter keyboard ---------------- */
  const ARROW = (rot) => `<svg viewBox="0 0 10 10" style="transform:rotate(${rot}deg)"><path d="M3 1.5L8 5L3 8.5Z" fill="currentColor"/></svg>`;
  const KB = {
    build() {
      const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
      kbEl.innerHTML = `<div class="kb-main">${rows.map((r, i) => `<div class="kb-row r${i}">${[...r].map((c) => `<button class="key" tabindex="-1" data-k="${c}">${c.toUpperCase()}</button>`).join('')}${i === 1 ? '<button class="key ret" tabindex="-1" data-k="Enter">return</button>' : ''}</div>`).join('')}
<div class="kb-row r3"><button class="key space" tabindex="-1" data-k=" "></button></div></div>
<div class="kb-arrows"><span></span><button class="key arrow" tabindex="-1" data-k="ArrowUp">${ARROW(-90)}</button><span></span>
<button class="key arrow" tabindex="-1" data-k="ArrowLeft">${ARROW(180)}</button><button class="key arrow" tabindex="-1" data-k="ArrowDown">${ARROW(90)}</button><button class="key arrow" tabindex="-1" data-k="ArrowRight">${ARROW(0)}</button></div>`;
      kbEl.addEventListener('pointerdown', (e) => {
        const b = e.target.closest('.key'); if (!b) return;
        e.preventDefault(); handleKey(b.dataset.k);
      });
    },
    el(k) { return $$('.key', kbEl).find((b) => b.dataset.k === k); },
    glow(keys) {
      const want = new Set([].concat(keys || []));
      $$('.key', kbEl).forEach((b) => b.classList.toggle('glow', want.has(b.dataset.k)));
    },
    press(k) { const b = KB.el(k); if (!b) return; b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 130); },
    flutter(k) {
      const b = KB.el(k); if (!b) return;
      const r = b.getBoundingClientRect(), s = document.createElement('div');
      s.className = 'flutter'; s.textContent = k;
      s.style.left = r.left + r.width / 2 + 'px'; s.style.top = r.top + 'px';
      s.style.setProperty('--dx', (Math.random() * 80 - 40).toFixed(0) + 'px');
      s.style.setProperty('--rot', (Math.random() * 60 - 30).toFixed(0) + 'deg');
      document.body.appendChild(s); setTimeout(() => s.remove(), 1400);
    }
  };

  /* ---------------- idle reminders ---------------- */
  let idleT = 0, idleCount = 0;
  function armIdle(fn, ms) {
    clearTimeout(idleT);
    idleT = setTimeout(() => {
      if (Voice.speaking()) return armIdle(fn, 2500);
      if (++idleCount > 3) return; // they have wandered off; wait for a key
      (typeof fn === 'function' ? fn : idleHint)();
    }, ms || SETTINGS.idleMs);
  }
  function clearTimers() { clearTimeout(idleT); }

  /* ---------------- the shelf ---------------- */
  const sel = { row: 0, idx: 0 };
  let screen = 'shelf', woke = false, R = null;

  const rowsData = () => SHELVES.map((s) => ({ ...s, books: BOOKS.filter((b) => b.shelf === s.id) })).filter((r) => r.books.length);
  const selectedBook = () => { const r = rowsData()[sel.row]; return r && r.books[sel.idx]; };
  const starSvg = (cls = '') => `<svg class="star ${cls}" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6L62 37L95 38L69 58L78 91L50 72L22 91L31 58L5 38L38 37Z"/></svg>`;
  function starsRow(n, max = 5) {
    if (!n) return '';
    const shown = Math.min(n, max);
    return `<div class="stars">${Array.from({ length: shown }, () => starSvg()).join('')}${n > max ? `<span class="more">+${n - max}</span>` : ''}</div>`;
  }

  function renderShelf() {
    screen = 'shelf'; R = null; clearTimers();
    const stars = store.get('stars', {});
    screenEl.innerHTML = `<main class="shelf">
<header><h1>The Briar Patch Library</h1><p class="sub">stories you spell yourself</p></header>
${rowsData().map((r, ri) => `<section class="row">
  <div class="plaque">${ART.scene({ bg: 'none', art: [[r.icon, 150, 300, 2.7]] }, 'icon')}<span>${esc(r.label)}</span></div>
  <div class="books">${r.books.map((b, bi) => `<button class="cover" tabindex="-1" data-row="${ri}" data-idx="${bi}" style="--cloth:${b.cloth}">
    <div class="plate">${ART.scene(b.cover, 'mini')}</div>
    <div class="ctitle">${esc(b.title)}</div>${starsRow(stars[b.id] || 0)}
  </button>`).join('')}</div>
</section>`).join('')}
</main>`;
    $$('.books', screenEl).forEach((row) => row.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.shiftKey || e.deltaX || !e.deltaY || row.scrollWidth <= row.clientWidth) return;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? row.clientWidth : 1;
      row.scrollLeft += e.deltaY * unit;
      e.preventDefault();
    }, { passive: false }));
    $$('.cover', screenEl).forEach((c) => c.addEventListener('click', () => {
      wake(); sel.row = +c.dataset.row; sel.idx = +c.dataset.idx; openBook(selectedBook());
    }));
    markSel(false);
    KB.glow(['ArrowLeft', 'ArrowRight', 'Enter']);
  }
  function markSel(speak = true) {
    $$('.cover', screenEl).forEach((c) => c.classList.toggle('sel', +c.dataset.row === sel.row && +c.dataset.idx === sel.idx));
    const cover = $('.cover.sel', screenEl);
    if (cover) cover.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const b = selectedBook();
    if (speak && b) say(b.title);
  }
  let welcomed = false;
  function shelfKey(k, letter) {
    const rows = rowsData();
    let moved = false;
    if (k === 'ArrowRight' || k === 'ArrowLeft') {
      const n = rows[sel.row].books.length;
      sel.idx = (sel.idx + (k === 'ArrowRight' ? 1 : -1) + n) % n; moved = true;
    } else if (k === 'ArrowUp' || k === 'ArrowDown') {
      sel.row = (sel.row + (k === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length;
      sel.idx = Math.min(sel.idx, rows[sel.row].books.length - 1); moved = true;
    } else if (k === 'Enter' || k === ' ') {
      welcomed = true; return openBook(selectedBook());
    } else if (letter) {
      KB.flutter(letter); Sound.tick(); nag(NAME[letter]); return;
    }
    if (!moved) return;
    Sound.tick(); markSel(false);
    const b = selectedBook();
    const shelfName = (k === 'ArrowUp' || k === 'ArrowDown') ? rows[sel.row].label + '. ' : '';
    if (!welcomed) {
      welcomed = true;
      say(`Welcome to the Briar Patch Library! Use the arrow keys to choose a book, and press return to open it. ${shelfName}${b.title}.`);
    } else say(shelfName + b.title);
    armIdle(() => say('Use the arrow keys to choose a book. Then press return.'), 25000);
  }

  /* ---------------- the reader ---------------- */
  function openBook(book, startPage = 0, solve = false) {
    if (!book) return;
    screen = 'book'; Voice.stop();
    const pages = [{ type: 'cover' }, ...book.pages.map((p) => ({ type: 'story', ...p })), { type: 'end' }];
    R = {
      book, pages, little: book.shelf === 'little', starGiven: false,
      i: Math.max(0, Math.min(startPage, pages.length - 1)),
      st: pages.map((p) => (p.type === 'story' ? initState(p) : null))
    };
    if (solve) R.st.forEach((s, i) => { if (s && i <= R.i) { s.blanks.forEach((b) => (b.n = b.word.length)); s.done = true; } });
    screenEl.innerHTML = `<div class="reader">
<div class="topbar"><button class="home" tabindex="-1"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10L10 3L17 10M5 8.5V17H15V8.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Shelf</button>
<span class="bt">${esc(book.title)}</span><span class="pg"></span></div>
<div class="stage"><div class="book" style="--cloth:${book.cloth}"><div class="spread"></div></div></div></div>`;
    $('.home', screenEl).addEventListener('click', goShelf);
    showPage('none');
  }
  function initState(p) {
    const blanks = [];
    p.text.replace(/\[([^\]]+)\]/g, (_, w) => { blanks.push({ word: w, n: 0, miss: 0, ghost: -1, slow: false }); return _; });
    return { blanks, done: blanks.length === 0 };
  }
  const page = () => R.pages[R.i];
  const cur = () => R.st[R.i];
  const curBlank = () => { const s = cur(); return s ? s.blanks.find((b) => b.n < b.word.length) : null; };
  const nextChar = (b) => b.word[b.n].toLowerCase();
  const fullText = (p, st) => p.text + (st && st.done && p.after ? '\n' + p.after.text : '');

  function goShelf() {
    Voice.stop(); clearTimers(); Sound.turn();
    const id = R && R.book.id;
    renderShelf();
    const rows = rowsData();
    rows.forEach((r, ri) => r.books.forEach((b, bi) => { if (b.id === id) { sel.row = ri; sel.idx = bi; } }));
    markSel(false);
  }

  function showPage(dir) {
    clearTimers();
    const spread = $('.spread', screenEl), book = $('.book', screenEl);
    if (dir !== 'none') {
      Sound.turn();
      const leaf = document.createElement('div');
      leaf.className = 'leaf ' + dir;
      book.appendChild(leaf); setTimeout(() => leaf.remove(), 700);
    }
    spread.classList.add('nofx');
    spread.innerHTML = leftHtml() + rightHtml();
    spread.classList.remove('fresh'); void spread.offsetWidth; spread.classList.add('fresh');
    setTimeout(() => spread.classList.remove('nofx'), 60);
    fitText();
    $$('.corner.next', spread).forEach((c) => c.addEventListener('click', () => handleKey('ArrowRight')));
    $$('.corner.back', spread).forEach((c) => c.addEventListener('click', () => handleKey('ArrowLeft')));
    const story = R.pages.filter((p) => p.type === 'story').length;
    $('.pg', screenEl).textContent = page().type === 'story' ? `${R.i} of ${story}` : '';
    enterPage();
  }

  function sceneFor(p, st) {
    const scene = st && st.done && p.after && (p.after.art || p.after.image) ? p.after : p;
    return ART.scene({ ...scene, bg: scene.bg || p.bg, seed: R.i + 3 });
  }
  function leftHtml() {
    const p = page(), b = R.book;
    let art;
    if (p.type === 'cover') art = ART.scene({ ...b.cover, seed: 2 });
    else if (p.type === 'end') art = ART.scene({ ...(b.end || b.cover), seed: 5 });
    else art = sceneFor(p, cur());
    const folio = p.type === 'story' ? `<div class="folio">${R.i * 2}</div>` : '';
    return `<div class="page left"><div class="art">${art}</div>${folio}<button class="corner back" tabindex="-1" aria-label="Back"></button></div>`;
  }
  // Shrink the words a little if that lets every written line fit on one line,
  // but never so far that they get hard to read; past that, lines wrap evenly.
  function fitText() {
    const t = $('.page.right .text', screenEl); if (!t) return;
    t.style.fontSize = '';
    const base = parseFloat(getComputedStyle(t).fontSize);
    // poems may shrink further, since keeping Lear's lines whole matters more there
    const min = Math.max(base * (t.classList.contains('verse') ? 0.62 : 0.74), $('.page.right', screenEl).clientHeight * 0.034);
    t.classList.add('measure');
    const widest = Math.max(...$$('.ln', t).map((l) => l.scrollWidth));
    const avail = t.clientWidth;
    t.classList.remove('measure');
    if (widest > avail) t.style.fontSize = Math.max(min, base * (avail / widest) * 0.98).toFixed(1) + 'px';
  }
  window.addEventListener('resize', () => { if (screen === 'book') fitText(); });

  function sizeCls(p) {
    const t = p.text + (p.after ? '\n' + p.after.text : '');
    const lines = t.split('\n').length, chars = t.length;
    if (lines >= 7 || chars > 210) return 'xlong';
    if (lines >= 4 || chars > 105) return 'long';
    return chars < 64 ? 'short' : '';
  }
  function rightHtml() {
    const p = page(), b = R.book, st = cur();
    if (p.type === 'cover') {
      return `<div class="page right"><div class="titlepage">
<div class="orn">&#10086;</div><h2>${esc(b.title)}</h2><div class="rule"></div></div>
<button class="corner next ready" tabindex="-1" aria-label="Next"></button></div>`;
    }
    if (p.type === 'end') {
      const n = (store.get('stars', {})[b.id] || 0);
      return `<div class="page right"><div class="endpage"><div class="theend">The End</div>
<div class="sticker">${starSvg('big')}</div>${starsRow(n, 10)}</div>
<button class="corner next ready" tabindex="-1" aria-label="Back to the shelf"></button></div>`;
    }
    const first = R.i === 1 && !R.little && !b.verse && !/^\[/.test(p.text); // a big red initial, old-book style
    return `<div class="page right"><div class="runhead">${esc(b.title)}</div>
<div class="inner"><div class="text ${sizeCls(p)}${first ? ' dropcap' : ''}${b.verse ? ' verse' : ''}">${textHtml(p, st)}</div>
${p.after ? `<div class="after${st.done ? ' shown' : ''}">${esc(p.after.text).replace(/\n/g, '<br>')}</div>` : ''}</div>
<div class="findkey"><span class="hand">&#9758;</span><span class="fk-key"></span></div>
<div class="folio">${R.i * 2 + 1}</div><button class="corner next${st.done ? ' ready' : ''}" tabindex="-1" aria-label="Next"></button></div>`;
  }
  function textHtml(p, st) {
    let bi = 0;
    const piece = (part) => {
      const m = part.match(/^\[([^\]]+)\]$/);
      if (!m) return esc(part);
      const idx = bi++, b = st.blanks[idx];
      return `<span class="blank" data-b="${idx}">${[...b.word].map((c) => `<span class="slot">${esc(c)}</span>`).join('')}</span>`;
    };
    // One block per line. Each space-separated word that holds a blank is kept on one
    // line, so a comma or "E-I-E-I-O" never wraps away from its letters.
    return p.text.split('\n').map((line) => `<span class="ln">${line.split(/(\s+)/).map((word) => {
      const html = word.split(/(\[[^\]]+\])/).map(piece).join('');
      return word.includes('[') || /\w-\w/.test(word) ? `<span class="nw">${html}</span>` : html; // also keep "Pussy-Cat" whole
    }).join('')}</span>`).join('');
  }
  function refreshSlots() {
    const st = cur(); if (!st) return;
    const active = curBlank();
    $$('.blank', screenEl).forEach((el) => {
      const b = st.blanks[+el.dataset.b];
      el.classList.toggle('done', b.n >= b.word.length);
      $$('.slot', el).forEach((s, j) => {
        const filled = j < b.n;
        s.classList.toggle('filled', filled);
        s.classList.toggle('ghost', !filled && (R.little || j === b.ghost));
        s.classList.toggle('next', !filled && b === active && j === b.n);
      });
    });
  }
  function updateHints() {
    refreshSlots();
    const b = curBlank(), fk = $('.findkey', screenEl), p = page();
    if (!b) {
      KB.glow(p.type === 'story' && !cur().done ? [] : ['ArrowRight']);
      if (fk) fk.classList.remove('on');
      return;
    }
    const c = nextChar(b), show = R.little || b.ghost === b.n;
    KB.glow(show ? [c] : []);
    if (fk) { fk.classList.toggle('on', show); $('.fk-key', fk).textContent = c.toUpperCase(); }
  }

  function enterPage() {
    const p = page(), st = cur();
    KB.glow([]);
    if (p.type === 'cover') {
      KB.glow(['ArrowRight']);
      say(R.book.title, () => armIdle(() => say('Press the arrow to start the story.', armIdle), 6000));
      return;
    }
    if (p.type === 'end') return theEnd();
    updateHints();
    if (st.done) say(fullText(p, st), readyToTurn);
    else say(p.text, () => prompt(true));
  }
  function prompt(first) {
    const b = curBlank(); if (!b) return;
    updateHints();
    const c = NAME[nextChar(b)];
    if (R.little) {
      const lead = first && b.n === 0 && b.word.length > 1 ? `Let's spell ${b.word}. ` : '';
      say(`${lead}Find ${c}.`, armIdle);
    } else {
      say(b.n === 0 ? `Can you spell ${b.word}?` : `${b.word}. Find ${c}.`, armIdle);
    }
  }
  function readyToTurn() {
    KB.glow(['ArrowRight']);
    const c = $('.corner.next', screenEl); if (c) c.classList.add('ready');
    armIdle(() => say('Press the arrow to turn the page.', armIdle), 6000);
  }
  function idleHint() {
    if (screen !== 'book') return;
    const p = page(), b = curBlank();
    if (p.type === 'story' && b) {
      if (!R.little && b.ghost !== b.n) {
        if (!b.slow && SETTINGS.speech) { b.slow = true; say(`${b.word}. ${b.word}.`, armIdle, { rate: 0.7 }); return; }
        b.ghost = b.n; updateHints();
      }
      wiggle(b);
      say(`Find ${NAME[nextChar(b)]}. Look for the shining key!`, armIdle);
    } else if (p.type === 'end') say('Press the arrow to go back to the shelf.', armIdle);
    else say(p.type === 'cover' ? 'Press the arrow to start the story.' : 'Press the arrow to turn the page.', armIdle);
  }

  function typeLetter(l) {
    const b = curBlank();
    if (!b) { KB.flutter(l); return; } // page is already filled in
    const want = nextChar(b);
    if (l === want) {
      b.n++; b.miss = 0;
      while (b.n < b.word.length && !/[a-z]/i.test(b.word[b.n])) b.n++; // skip hyphens etc.
      Sound.stamp();
      if (b.n >= b.word.length) return blankDone(b);
      updateHints();
      const nx = NAME[nextChar(b)];
      if (R.little) say(NAME[l], () => say(`Now ${nx}.`, armIdle));
      else say(NAME[l], armIdle);
    } else {
      b.miss++;
      Sound.nope(); KB.flutter(l); wiggle(b);
      if (R.little) nag(`Find ${NAME[want]}.`);
      else if (b.miss === 1 && b.ghost !== b.n) nag(`${b.word}.`, { rate: 0.7 });
      else { b.ghost = b.n; updateHints(); nag(`Find ${NAME[want]}.`); }
      armIdle();
    }
  }
  function blankDone(b) {
    sparkle(b);
    refreshSlots();
    const multi = b.word.length > 1;
    const spelled = multi ? [...b.word.toLowerCase()].filter((c) => NAME[c]).map((c) => NAME[c]).join(', ') + '. ' : '';
    const word = multi ? b.word : NAME[b.word.toLowerCase()];
    if (curBlank()) { updateHints(); say(`${spelled}${word}!`, () => prompt(true)); }
    else pageDone(`${spelled}${word}!`);
  }
  function pageDone(lead) {
    const p = page(), st = cur();
    st.done = true;
    Sound.chime();
    updateHints();
    const corner = $('.corner.next', screenEl); if (corner) corner.classList.add('ready');
    let text = lead + ' ' + pick(PRAISE);
    if (st.blanks.length > 1 && p.text.split('\n').length <= 2) text += '\n' + p.text;
    if (p.after) {
      const a = $('.after', screenEl); if (a) a.classList.add('shown');
      if (p.after.art || p.after.image) {
        const art = $('.page.left .art', screenEl);
        art.innerHTML = sceneFor(p, st); art.classList.add('animate');
      }
      text += '\n' + p.after.text;
    }
    say(text, readyToTurn);
  }
  function theEnd() {
    const allDone = R.st.every((s) => !s || s.done);
    KB.glow(['ArrowRight']);
    if (allDone && !R.starGiven) {
      R.starGiven = true;
      const stars = store.get('stars', {});
      stars[R.book.id] = (stars[R.book.id] || 0) + 1;
      store.set('stars', stars);
      const row = $('.endpage .stars', screenEl), html = starsRow(stars[R.book.id], 10);
      if (row) row.outerHTML = html; else $('.endpage', screenEl).insertAdjacentHTML('beforeend', html);
      $('.sticker', screenEl).classList.add('on');
      setTimeout(() => Sound.star(), 350);
      say('The End! You earned a gold star!', () => armIdle(() => say('Press the arrow to go back to the shelf.', armIdle), 6000));
    } else {
      $('.sticker', screenEl).classList.add('on', 'dim');
      say('The End.', () => armIdle(() => say('Press the arrow to go back to the shelf.', armIdle), 6000));
    }
  }

  function next() {
    const p = page();
    if (p.type === 'story' && !cur().done) {
      const b = curBlank();
      Sound.nope(); wiggle(b);
      nag(R.little ? `Find ${NAME[nextChar(b)]}.` : `First, spell ${b.word}.`);
      armIdle(); return;
    }
    if (R.i >= R.pages.length - 1) return goShelf();
    R.i++; showPage('next');
  }
  function prev() {
    if (R.i === 0) return goShelf();
    R.i--; showPage('prev');
  }
  function reread() {
    const p = page();
    if (p.type !== 'story') return enterPage();
    const st = cur();
    say(fullText(p, st), () => (st.done ? readyToTurn() : prompt(false)));
  }
  function helpMe() {
    const b = curBlank();
    if (!b) return reread();
    b.ghost = b.n; updateHints();
    say(`Find ${NAME[nextChar(b)]}.`, armIdle);
  }
  function bookKey(k, letter) {
    const p = page();
    const ready = p.type !== 'story' || cur().done;
    if (k === 'ArrowRight' || k === 'Enter' || (k === ' ' && ready)) return next();
    if (k === 'ArrowLeft') return prev();
    if (k === 'ArrowUp' || k === ' ') return reread();
    if (k === 'ArrowDown') return helpMe();
    if (k === 'Escape') return goShelf();
    if (letter && p.type === 'story') return typeLetter(letter);
    if (letter) KB.flutter(letter);
  }

  /* ---------------- little effects ---------------- */
  function blankEl(b) { const i = cur().blanks.indexOf(b); return $(`.blank[data-b="${i}"]`, screenEl); }
  function wiggle(b) {
    const el = b && blankEl(b); if (!el) return;
    el.classList.remove('wiggle'); void el.offsetWidth; el.classList.add('wiggle');
  }
  function sparkle(b) {
    const el = blankEl(b); if (!el) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('div'), a = (i / 10) * Math.PI * 2 + Math.random() * 0.5, d = 50 + Math.random() * 50;
      s.className = 'spark'; s.innerHTML = '&#10022;';
      s.style.left = r.left + r.width / 2 + 'px'; s.style.top = r.top + r.height / 2 + 'px';
      s.style.setProperty('--dx', (Math.cos(a) * d).toFixed(0) + 'px');
      s.style.setProperty('--dy', (Math.sin(a) * d).toFixed(0) + 'px');
      document.body.appendChild(s); setTimeout(() => s.remove(), 1000);
    }
  }

  /* ---------------- keys ---------------- */
  function wake() { if (!woke) { woke = true; Sound.wake(); } }
  function handleKey(k) {
    wake();
    idleCount = 0;
    const letter = /^[a-z]$/i.test(k) ? k.toLowerCase() : null;
    KB.press(letter || k);
    if (screen === 'shelf') shelfKey(k, letter);
    else if (screen === 'book') bookKey(k, letter);
  }
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return; // grown-up shortcuts
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter', 'Backspace', 'Tab'].includes(e.key)) e.preventDefault();
    if (e.repeat) return;
    handleKey(e.key);
  });
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('dragstart', (e) => e.preventDefault());

  /* ---------------- a sprite gallery for grown-ups: index.html#gallery ---------------- */
  function gallery() {
    screen = 'gallery';
    const names = Object.keys(ART.sprites).filter((n) => n !== 'piphead');
    screenEl.innerHTML = `<div class="gallery">${names.map((n) => `<figure>${ART.scene({ bg: 'none', art: [[n, 150, 300, 2.4]] })}<figcaption>${n}</figcaption></figure>`).join('')}</div>`;
  }

  /* ---------------- start ---------------- */
  KB.build();
  const h = location.hash.slice(1), m = h.match(/^book=([\w-]+)(?:&page=(\d+))?(&solve)?/);
  if (h === 'gallery') gallery();
  else if (m && BOOKS.find((b) => b.id === m[1])) openBook(BOOKS.find((b) => b.id === m[1]), +(m[2] || 0), !!m[3]);
  else renderShelf();
})();
