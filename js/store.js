// State: everything lives in this browser's localStorage. Nothing is sent anywhere.
// sanitize() rebuilds the whole state field by field, so a damaged or hand-edited backup can't break the app.
(function (A) {
  'use strict';
  const U = A.util;
  const KEY = 'pumpelek.v1';
  A.storageOk = true;

  const str = (v, max, def = '') =>
    typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : def;
  const int = (v, min, max, def) => {
    v = Number(v);
    return Number.isFinite(v) ? U.clamp(Math.round(v), min, max) : def;
  };
  const num = (v, min, max, def) => {
    v = Number(v);
    return Number.isFinite(v) ? U.clamp(v, min, max) : def;
  };
  const bool = (v, def) => (typeof v === 'boolean' ? v : def);

  // Built-in decks (js/seed.js). `seeded` remembers which ones were already handed out,
  // so a deck she deletes never comes back, while decks added in later versions still reach her.
  const addSeed = (state, d, index) => {
    state.decks.push({ id: d.id, name: d.name, emoji: d.emoji });
    d.cards.forEach(([en, pl], i) => {
      state.cards.push({ id: d.prefix + (i + 1), deck: d.id, en, pl, ex: '', created: 1e12 + index * 1e4 + i, st: A.srs.newState() });
    });
    state.seeded.push(d.id);
  };

  A.defaults = () => {
    const s = {
      v: 1,
      decks: [],
      cards: [],
      seeded: [],
    profile: {
      name: '', xp: 0, coins: 30, streak: 0, best: 0, lastDay: -1, goal: 50,
      sessions: 0, perfect: 0, maxCombo: 0, achievements: {}, history: {},
    },
    avatar: A.avatar.defaults(),
    settings: { sound: true, tts: true, intro: true, newPerDay: 10, session: 12, style: 'mixed' },
    daily: { day: -1, newDone: 0 },
    };
    A.seed.forEach((d, i) => addSeed(s, d, i));
    return s;
  };

  A.sanitize = (raw) => {
    const s = A.defaults();
    if (!raw || typeof raw !== 'object') return s;

    // decks
    const decks = [];
    const deckIds = new Set();
    for (const d of (Array.isArray(raw.decks) ? raw.decks : []).slice(0, 100)) {
      if (!d || typeof d !== 'object') continue;
      const id = str(d.id, 40);
      const name = str(d.name, 40);
      if (!id || !name || deckIds.has(id)) continue;
      deckIds.add(id);
      decks.push({ id, name, emoji: str(d.emoji, 8, '📚') || '📚' });
    }
    if (decks.length) {
      s.decks = decks;
      s.cards = [];
      s.seeded = Array.isArray(raw.seeded)
        ? raw.seeded.filter((id) => A.seed.some((d) => d.id === id))
        : ['our-world']; // backups from before this field existed
    }
    const ok = new Set(s.decks.map((d) => d.id));

    // cards
    const cardIds = new Set(s.cards.map((c) => c.id));
    for (const c of (decks.length && Array.isArray(raw.cards) ? raw.cards : []).slice(0, 20000)) {
      if (!c || typeof c !== 'object') continue;
      const id = str(c.id, 40);
      const en = str(c.en, 200);
      const pl = str(c.pl, 200);
      if (!id || !en || !pl || cardIds.has(id) || !ok.has(c.deck)) continue;
      cardIds.add(id);
      const st = c.st && typeof c.st === 'object' ? c.st : {};
      s.cards.push({
        id, deck: c.deck, en, pl, ex: str(c.ex, 300),
        created: int(c.created, 0, 1e14, Date.now()),
        st: {
          ease: num(st.ease, 1.3, 3, 2.5), iv: int(st.iv, 0, 36500, 0), reps: int(st.reps, 0, 10000, 0),
          lapses: int(st.lapses, 0, 10000, 0), due: int(st.due, 0, 1e6, 0),
          seen: bool(st.seen, false), relearn: bool(st.relearn, false),
        },
      });
    }

    // profile
    const p = raw.profile && typeof raw.profile === 'object' ? raw.profile : {};
    const d = s.profile;
    d.name = str(p.name, 20);
    d.xp = int(p.xp, 0, 1e8, d.xp);
    d.coins = int(p.coins, 0, 1e8, d.coins);
    d.streak = int(p.streak, 0, 1e5, 0);
    d.best = int(p.best, 0, 1e5, 0);
    d.lastDay = int(p.lastDay, -1, 1e6, -1);
    d.goal = [30, 50, 100].includes(p.goal) ? p.goal : 50;
    d.sessions = int(p.sessions, 0, 1e6, 0);
    d.perfect = int(p.perfect, 0, 1e6, 0);
    d.maxCombo = int(p.maxCombo, 0, 1e5, 0);
    const ach = p.achievements && typeof p.achievements === 'object' ? p.achievements : {};
    for (const a of A.game.ACH) if (Number.isFinite(ach[a.id])) d.achievements[a.id] = int(ach[a.id], 0, 1e6, 0);
    const hist = p.history && typeof p.history === 'object' ? p.history : {};
    for (const k of Object.keys(hist).slice(-500)) {
      const day = Number(k);
      const e = hist[k];
      if (!Number.isInteger(day) || day < 0 || !e || typeof e !== 'object') continue;
      d.history[day] = { n: int(e.n, 0, 1e6, 0), ok: int(e.ok, 0, 1e6, 0), xp: int(e.xp, 0, 1e6, 0), goal: bool(e.goal, false) };
    }

    // avatar
    const av = raw.avatar && typeof raw.avatar === 'object' ? raw.avatar : {};
    const cfg = av.cfg && typeof av.cfg === 'object' ? av.cfg : {};
    for (const slot of A.avatar.SLOTS) if (typeof cfg[slot] === 'string' && A.avatar.valid(slot, cfg[slot])) s.avatar.cfg[slot] = cfg[slot];
    const owned = new Set();
    for (const k of Array.isArray(av.owned) ? av.owned : []) {
      if (typeof k !== 'string') continue;
      const [slot, id] = k.split(':');
      if (A.avatar.valid(slot, id)) owned.add(k);
    }
    s.avatar.owned = [...owned];
    // never leave an item equipped that isn't owned
    for (const slot of A.avatar.SLOTS) {
      const item = A.avatar.item(slot, s.avatar.cfg[slot]);
      if (item.price > 0 && !s.avatar.owned.includes(A.avatar.key(slot, item))) {
        s.avatar.cfg[slot] = A.avatar.defaults().cfg[slot];
      }
    }

    // settings
    const t = raw.settings && typeof raw.settings === 'object' ? raw.settings : {};
    s.settings.sound = bool(t.sound, true);
    s.settings.tts = bool(t.tts, true);
    s.settings.intro = bool(t.intro, true);
    s.settings.newPerDay = int(t.newPerDay, 1, 100, 10);
    s.settings.session = int(t.session, 4, 40, 12);
    s.settings.style = t.style === 'flip' ? 'flip' : 'mixed';

    // daily counter
    const dl = raw.daily && typeof raw.daily === 'object' ? raw.daily : {};
    s.daily = { day: int(dl.day, -1, 1e6, -1), newDone: int(dl.newDone, 0, 1e5, 0) };
    return s;
  };

  A.rollDay = () => {
    const t = U.dayNum();
    if (A.state.daily.day !== t) A.state.daily = { day: t, newDone: 0 };
  };

  // Hands out built-in decks added after she first installed.
  A.addMissingSeeds = () => {
    const st = A.state;
    A.seed.forEach((d, i) => {
      if (st.seeded.includes(d.id)) return;
      if (!st.decks.some((x) => x.id === d.id)) addSeed(st, d, i);
      else st.seeded.push(d.id);
      A.save();
    });
  };

  A.load = () => {
    let raw = null;
    try {
      const t = localStorage.getItem(KEY);
      raw = t ? JSON.parse(t) : null;
    } catch (e) {
      A.storageOk = false;
    }
    A.state = A.sanitize(raw);
    A.addMissingSeeds();
    A.rollDay();
  };

  let timer = null;
  A.flush = () => {
    clearTimeout(timer);
    timer = null;
    try {
      localStorage.setItem(KEY, JSON.stringify(A.state));
    } catch (e) {
      A.storageOk = false;
    }
  };
  A.save = () => {
    if (timer) return;
    timer = setTimeout(A.flush, 250);
  };

  A.replaceState = (raw) => {
    A.state = A.sanitize(raw);
    A.rollDay();
    A.flush();
  };
  A.resetAll = () => {
    A.state = A.sanitize(null);
    A.rollDay();
    A.flush();
  };

  A.cardCount = (deckId) => A.state.cards.filter((c) => c.deck === deckId).length;
})(window.A);
