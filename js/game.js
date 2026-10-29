// XP, levels, coins, streaks and badges.
(function (A) {
  'use strict';
  const U = A.util;
  const G = (A.game = {});

  const K = 40; // level n starts at K * (n-1)^2 XP
  G.levelOf = (xp) => 1 + Math.floor(Math.sqrt(xp / K));
  G.levelInfo = (xp) => {
    const level = G.levelOf(xp);
    const a = K * (level - 1) ** 2;
    const b = K * level ** 2;
    return { level, into: xp - a, span: b - a, pct: (xp - a) / (b - a) };
  };

  G.hist = (day = U.dayNum()) => {
    const H = A.state.profile.history;
    return H[day] || (H[day] = { n: 0, ok: 0, xp: 0, goal: false });
  };
  G.todayXp = () => (A.state.profile.history[U.dayNum()] || { xp: 0 }).xp;

  G.streak = () => {
    const p = A.state.profile;
    return p.lastDay >= U.dayNum() - 1 ? p.streak : 0;
  };
  G.practicedToday = () => A.state.profile.lastDay === U.dayNum();

  // true the first time she practises on a given day
  G.markPracticed = () => {
    const p = A.state.profile;
    const t = U.dayNum();
    if (p.lastDay === t) return false;
    p.streak = p.lastDay === t - 1 ? p.streak + 1 : 1;
    p.lastDay = t;
    p.best = Math.max(p.best, p.streak);
    return true;
  };

  // -> { levelUp: newLevel | 0, goal: bool }
  G.addXp = (n) => {
    const p = A.state.profile;
    const before = G.levelOf(p.xp);
    p.xp += n;
    const h = G.hist();
    h.xp += n;
    const out = { levelUp: 0, goal: false };
    const after = G.levelOf(p.xp);
    if (after > before) {
      out.levelUp = after;
      p.coins += 15 * (after - before);
    }
    if (!h.goal && h.xp >= p.goal) {
      h.goal = true;
      p.coins += 20;
      out.goal = true;
    }
    return out;
  };

  G.learned = () => A.state.cards.filter((c) => c.st.seen && c.st.reps > 0).length;
  G.mastered = () => A.state.cards.filter((c) => A.srs.stage(c) === 'mastered').length;

  G.ACH = [
    { id: 'first', icon: '🎉', name: 'First steps', desc: 'Finish your first practice', coins: 10, test: (p) => p.sessions >= 1 },
    { id: 'words10', icon: '🌱', name: 'Seedling', desc: 'Learn 10 cards', coins: 15, test: () => G.learned() >= 10 },
    { id: 'words50', icon: '🌿', name: 'Word collector', desc: 'Learn 50 cards', coins: 30, test: () => G.learned() >= 50 },
    { id: 'words100', icon: '🌳', name: 'Word wizard', desc: 'Learn 100 cards', coins: 60, test: () => G.learned() >= 100 },
    { id: 'master10', icon: '⭐', name: 'Star student', desc: 'Master 10 cards', coins: 40, test: () => G.mastered() >= 10 },
    { id: 'streak3', icon: '🔥', name: 'On a roll', desc: '3 days in a row', coins: 15, test: (p) => p.best >= 3 },
    { id: 'streak7', icon: '🚀', name: 'Week warrior', desc: '7 days in a row', coins: 40, test: (p) => p.best >= 7 },
    { id: 'streak30', icon: '👑', name: 'Unstoppable', desc: '30 days in a row', coins: 150, test: (p) => p.best >= 30 },
    { id: 'perfect', icon: '💎', name: 'Flawless', desc: 'Finish a practice with no mistakes', coins: 20, test: (p) => p.perfect >= 1 },
    { id: 'combo10', icon: '⚡', name: 'Combo master', desc: 'Get 10 right in a row', coins: 20, test: (p) => p.maxCombo >= 10 },
    { id: 'goal', icon: '🎯', name: 'Goal getter', desc: 'Reach your daily goal', coins: 15, test: (p) => Object.values(p.history).some((e) => e.goal) },
    { id: 'xp500', icon: '🏆', name: 'XP hunter', desc: 'Earn 500 XP', coins: 30, test: (p) => p.xp >= 500 },
    { id: 'style3', icon: '🛍️', name: 'Fashionista', desc: 'Buy 3 things for your avatar', coins: 20, test: () => A.avatar.boughtCount() >= 3 },
  ];

  // Unlocks anything newly earned and returns the list.
  G.checkAchievements = () => {
    const p = A.state.profile;
    const fresh = [];
    for (const a of G.ACH) {
      if (p.achievements[a.id] != null) continue;
      if (a.test(p)) {
        p.achievements[a.id] = U.dayNum();
        p.coins += a.coins;
        fresh.push(a);
      }
    }
    return fresh;
  };
})(window.A);
