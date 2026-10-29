// Spaced repetition: a simplified SM-2 (the family of algorithms Anki's classic scheduler comes from).
// Grades: 0 = again, 1 = hard, 2 = good, 3 = easy. Due dates are whole local days.
(function (A) {
  'use strict';
  const U = A.util;
  const S = (A.srs = {});

  S.newState = () => ({ ease: 2.5, iv: 0, reps: 0, lapses: 0, due: 0, seen: false, relearn: false });

  S.review = (card, g, today) => {
    const s = card.st;
    s.seen = true;
    if (g === 0) {
      if (s.reps > 0) s.lapses++;
      s.reps = 0;
      s.iv = 0;
      s.due = today; // comes back in the same session until she gets it right
      s.relearn = true;
      s.ease = Math.max(1.3, s.ease - 0.2);
      return;
    }
    s.relearn = false;
    if (s.reps === 0) s.iv = g === 3 ? 4 : 1;
    else if (s.reps === 1) s.iv = g === 1 ? 3 : g === 2 ? 6 : 8;
    else {
      const f = g === 1 ? 1.2 : g === 2 ? s.ease : s.ease * 1.3;
      s.iv = Math.max(s.iv + 1, Math.round(s.iv * f));
    }
    s.ease = U.clamp(s.ease + (g === 1 ? -0.15 : g === 3 ? 0.15 : 0), 1.3, 3);
    s.reps++;
    s.due = today + s.iv;
  };

  // A card that was missed and then answered correctly later in the same session.
  S.graduate = (card, today) => {
    const s = card.st;
    s.relearn = false;
    s.reps = 1;
    s.iv = 1;
    s.due = today + 1;
  };

  // new -> learning -> young -> mastered
  S.stage = (card) => {
    const s = card.st;
    if (!s.seen) return 'new';
    if (s.relearn || s.reps === 0) return 'learning';
    return s.iv < 21 ? 'young' : 'mastered';
  };

  S.counts = (state, deckId, today) => {
    const cards = deckId ? state.cards.filter((c) => c.deck === deckId) : state.cards;
    let due = 0;
    let fresh = 0;
    for (const c of cards) {
      if (c.st.seen) { if (c.st.due <= today) due++; } else fresh++;
    }
    const left = Math.max(0, state.settings.newPerDay - state.daily.newDone);
    const newAvail = Math.min(fresh, left);
    return { due, newAvail, total: due + newAvail, cards: cards.length };
  };

  // Which cards go into the next session.
  S.build = (state, opts, today) => {
    const limit = state.settings.session;
    const cards = opts.deckId ? state.cards.filter((c) => c.deck === opts.deckId) : state.cards;
    if (opts.bonus) {
      const seen = cards.filter((c) => c.st.seen).sort((a, b) => a.st.due - b.st.due || Math.random() - 0.5);
      const fresh = cards.filter((c) => !c.st.seen);
      return U.shuffle([...seen.slice(0, limit), ...fresh.slice(0, Math.max(0, limit - seen.length))].slice(0, limit));
    }
    const due = cards.filter((c) => c.st.seen && c.st.due <= today).sort((a, b) => a.st.due - b.st.due);
    const left = Math.max(0, state.settings.newPerDay - state.daily.newDone);
    const fresh = cards.filter((c) => !c.st.seen).sort((a, b) => a.created - b.created).slice(0, left);
    const reserve = Math.min(fresh.length, Math.ceil(limit / 3));
    const dueTake = Math.min(due.length, limit - reserve);
    const newTake = Math.min(fresh.length, limit - dueTake);
    return U.shuffle([...due.slice(0, dueTake), ...fresh.slice(0, newTake)]);
  };
})(window.A);
