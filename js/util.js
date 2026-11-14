// Small helpers shared by every other file. Everything hangs off one global: window.A
(function () {
  'use strict';
  const A = (window.A = {});
  const U = (A.util = {});

  // ---- DOM -------------------------------------------------------------
  // Text is always added as text nodes, never as HTML, so card content can't inject markup.
  U.h = function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k of Object.keys(attrs)) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'css') Object.assign(el.style, v);
        else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      }
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return el;
  };
  const h = U.h;

  // Only used with SVG strings we build ourselves from fixed catalogues.
  U.html = (str) => {
    const t = document.createElement('template');
    t.innerHTML = str;
    return t.content.firstElementChild;
  };

  // ---- misc ------------------------------------------------------------
  U.clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  U.pick = (a) => a[Math.floor(Math.random() * a.length)];
  U.shuffle = (a) => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  U.dayNum = (d = new Date()) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
  U.words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
  U.alts = (s) => {
    const a = s.split(/\s*\/\s*/).map((x) => x.trim()).filter(Boolean);
    return a.length ? a : [s];
  };

  // ---- answer checking --------------------------------------------------
  U.norm = (s) =>
    String(s)
      .toLowerCase()
      .replace(/[’‘`´]/g, "'")
      .replace(/[^\p{L}\p{N}\s']/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  U.lev = (a, b) => {
    if (a === b) return 0;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[b.length];
  };

  U.exact = (given, target) => {
    const g = U.norm(given);
    return !!g && [target, ...U.alts(target)].some((t) => U.norm(t) === g);
  };

  // 'exact' | 'near' (small typo) | 'wrong'
  U.check = (given, target) => {
    const g = U.norm(given);
    if (!g) return 'wrong';
    let best = Infinity;
    for (const t of [target, ...U.alts(target)]) {
      const n = U.norm(t);
      if (n === g) return 'exact';
      best = Math.min(best, U.lev(g, n));
    }
    const len = U.norm(target).length;
    const lim = len >= 20 ? 3 : len >= 9 ? 2 : len >= 4 ? 1 : 0;
    return best <= lim ? 'near' : 'wrong';
  };

  // ---- sound & speech ---------------------------------------------------
  // iPhones are strict about audio: it must be started by a tap, it is muted by the ring/silent switch unless the page
  // asks for "playback" mode, a suspended or "interrupted" context has to be resumed, and speechSynthesis drops a
  // phrase that is spoken right after cancel(). The code below works around each of these.
  let ctx = null;
  let keep = null;      // a silent looping clip, only for iPhones too old to know navigator.audioSession
  let voice = null;
  let spoken = null;    // keeps the utterance alive until it is finished (otherwise it can be garbage collected mid-sentence)
  let speakId = 0;
  const loud = () => !!(A.state && A.state.settings.loud !== false);

  // let sound play even when the silent switch is on (if she wants that)
  U.playbackMode = () => {
    try {
      if (navigator.audioSession) navigator.audioSession.type = loud() ? 'playback' : 'auto';
      else if (loud()) {
        keep = keep || Object.assign(new Audio('audio/silence.wav'), { loop: true });
        keep.play().catch(() => {});
      } else if (keep) keep.pause();
    } catch (e) { /* optional */ }
  };

  function audioCtx() {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }
  function beep(notes) {
    if (!A.state || !A.state.settings.sound) return;
    try {
      const c = audioCtx();
      const go = () => {
        let t = c.currentTime;
        for (const [f, d] of notes) {
          const o = c.createOscillator();
          const g = c.createGain();
          o.type = 'triangle';
          o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.3, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, t + d);
          o.connect(g);
          g.connect(c.destination);
          o.start(t);
          o.stop(t + d + 0.02);
          t += d * 0.8;
        }
      };
      if (c.state === 'running') go();
      else c.resume().then(go).catch(() => {}); // 'suspended', or 'interrupted' after a call or the lock screen
    } catch (e) { /* sound is optional */ }
  }
  U.sfx = {
    good: () => beep([[660, 0.09], [880, 0.16]]),
    bad: () => beep([[300, 0.14], [220, 0.22]]),
    win: () => beep([[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.3]]),
    coin: () => beep([[988, 0.07], [1319, 0.14]]),
  };

  U.canSpeak = () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  function pickVoice() {
    try {
      const en = speechSynthesis.getVoices().filter((v) => /^en([-_]|$)/i.test(v.lang));
      voice = en.find((v) => /en[-_]US/i.test(v.lang) && v.localService) || en.find((v) => /en[-_]US/i.test(v.lang)) || en[0] || null;
    } catch (e) { voice = null; }
  }
  if (U.canSpeak()) {
    pickVoice();
    if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', pickVoice); // voices arrive late on iPhones
  }
  U.speak = (text, rate = 0.9) => {
    if (!U.canSpeak() || !A.state || !A.state.settings.tts) return;
    try {
      const id = ++speakId;
      const say = () => {
        if (id !== speakId) return; // a newer phrase has replaced this one
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        if (voice) u.voice = voice;
        u.rate = rate;
        u.volume = 1;
        u.onend = u.onerror = () => { if (spoken === u) spoken = null; };
        spoken = u;
        speechSynthesis.speak(u);
      };
      if (speechSynthesis.paused) speechSynthesis.resume(); // can get stuck paused after the app was in the background
      if (speechSynthesis.speaking || speechSynthesis.pending) {
        speechSynthesis.cancel();
        setTimeout(say, 150); // speaking straight after cancel() is silently dropped on iOS
      } else say();
    } catch (e) { /* speech is optional */ }
  };

  // The first tap on the page switches audio on (browsers refuse to make a sound before that).
  U.unlockAudio = () => {
    U.playbackMode();
    try {
      const c = audioCtx();
      if (c.state !== 'running') c.resume();
      const src = c.createBufferSource();
      src.buffer = c.createBuffer(1, 1, 22050);
      src.connect(c.destination);
      src.start(0);
    } catch (e) { /* optional */ }
    if (U.canSpeak()) {
      try {
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        speechSynthesis.speak(u);
      } catch (e) { /* optional */ }
    }
  };
  const FIRST = ['touchend', 'click', 'keydown'];
  const onFirst = () => {
    FIRST.forEach((e) => document.removeEventListener(e, onFirst, true));
    U.unlockAudio();
  };
  FIRST.forEach((e) => document.addEventListener(e, onFirst, true));
  // coming back from the background: wake everything up again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    try {
      if (ctx && ctx.state !== 'running') ctx.resume();
      if (U.canSpeak()) { speechSynthesis.cancel(); speechSynthesis.resume(); }
      U.playbackMode();
    } catch (e) { /* optional */ }
  });

  // for the "Sound check" row in Settings
  U.soundInfo = () => {
    const mode = navigator.audioSession ? navigator.audioSession.type : (keep ? 'playback (clip)' : 'normal');
    const v = !U.canSpeak() ? 'speech not supported' : voice ? voice.name + ' (' + voice.lang + ')' : 'no English voice found';
    return 'Audio: ' + (ctx ? ctx.state : 'not started') + ' · Mode: ' + mode + ' · Voice: ' + v;
  };
  U.vibrate = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* ignore */ } };

  // ---- feedback widgets -------------------------------------------------
  U.toast = (msg, icon) => {
    const t = h('div', { class: 'toast', role: 'status' }, icon ? h('span', null, icon) : null, msg);
    document.body.append(t);
    setTimeout(() => t.remove(), 2600);
  };

  U.confetti = (n = 60) => {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#7b4dff', '#ff6fb5', '#ffc933', '#34c77b', '#37a8ff', '#ff9b21'];
    const wrap = h('div', { class: 'confetti', 'aria-hidden': 'true' });
    for (let i = 0; i < n; i++) {
      const p = h('i');
      p.style.setProperty('--x', Math.random() * 100 + 'vw');
      p.style.setProperty('--dx', Math.random() * 160 - 80 + 'px');
      p.style.setProperty('--rot', Math.random() * 720 - 360 + 'deg');
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = 1.8 + Math.random() * 1.6 + 's';
      p.style.animationDelay = Math.random() * 0.5 + 's';
      wrap.append(p);
    }
    document.body.append(wrap);
    setTimeout(() => wrap.remove(), 4200);
  };

  // actions: [{label, kind, onClick(close) -> false keeps it open}]
  U.modal = ({ title, body, actions = [], onClose }) => {
    const overlay = h('div', { class: 'overlay' });
    const close = () => {
      overlay.remove();
      if (onClose) onClose();
    };
    const sheet = h(
      'div',
      { class: 'sheet', role: 'dialog', 'aria-modal': 'true' },
      title ? h('h2', null, title) : null,
      body,
      actions.length
        ? h(
            'div',
            { class: 'sheet-actions' },
            actions.map((a) =>
              h('button', {
                class: 'btn ' + (a.kind || 'ghost'),
                onclick: () => {
                  if (a.onClick && a.onClick(close) === false) return;
                  close();
                },
              }, a.label)
            )
          )
        : null
    );
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.append(sheet);
    document.body.append(overlay);
    return { close, sheet };
  };

  U.confirm = (title, text, okLabel = 'OK', kind = 'primary') =>
    new Promise((resolve) => {
      let answered = false;
      const done = (v) => { answered = true; resolve(v); };
      U.modal({
        title,
        body: h('p', { class: 'muted' }, text),
        actions: [
          { label: 'Cancel', kind: 'ghost', onClick: () => { done(false); } },
          { label: okLabel, kind, onClick: () => { done(true); } },
        ],
        onClose: () => { if (!answered) resolve(false); },
      });
    });

  // ---- files ------------------------------------------------------------
  U.download = (filename, text, mime) => {
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const a = h('a', { href: url, download: filename });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  let fileInput = null;
  U.pickFile = (accept, cb) => {
    if (!fileInput) {
      fileInput = h('input', { type: 'file', class: 'hidden', 'aria-hidden': 'true', tabindex: '-1' });
      document.body.append(fileInput);
    }
    fileInput.accept = accept;
    fileInput.value = '';
    fileInput.onchange = () => {
      const f = fileInput.files && fileInput.files[0];
      if (!f) return;
      if (f.size > 2e6) return U.toast('That file is too big (2 MB max).', '⚠️');
      const r = new FileReader();
      r.onload = () => cb(String(r.result), f);
      r.onerror = () => U.toast('Could not read that file.', '⚠️');
      r.readAsText(f, 'utf-8');
    };
    fileInput.click();
  };
})();
