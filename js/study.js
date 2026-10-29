// A practice session: intro cards for new words, then a mix of exercises. Missed cards come back until she gets them right.
(function (A) {
  'use strict';
  const U = A.util;
  const h = U.h;
  const G = A.game;
  const SRS = A.srs;

  let S = null; // the running session
  let root, mainEl, footEl, barEl, comboEl;

  const OK_MSG = ['Nice!', 'Great job!', 'Awesome!', 'Perfect!', 'You got it!', 'Well done!', 'Brilliant!'];
  const NEAR_MSG = ['Almost!', 'So close!', 'Nearly there!'];
  const BAD_MSG = ['Not quite', 'Oops!', 'Keep going!'];

  // ---- starting and leaving ---------------------------------------------------
  function start(opts = {}) {
    A.rollDay();
    const cards = SRS.build(A.state, opts, U.dayNum());
    if (!cards.length) return U.toast('Add some cards first!', '📚');
    S = {
      practice: !!opts.bonus, opts,
      items: cards.map((c) => ({ card: c, kind: !c.st.seen && A.state.settings.intro ? 'intro' : 'ask' })),
      total: cards.length, finished: new Set(), graded: new Set(),
      n: 0, ok: 0, xp: 0, coins: 0, combo: 0, maxCombo: 0, mistakes: 0, lastType: '',
      ev: { levelUp: 0, goal: false, streak: false, ach: [] }, t0: 0,
    };
    barEl = h('i');
    comboEl = h('div', { class: 'combo' });
    mainEl = h('div', { class: 'study-main' });
    footEl = h('div', { class: 'study-foot' });
    root = h('div', { class: 'study' },
      h('div', { class: 'study-top' },
        h('button', { class: 'x', 'aria-label': 'Close practice', onclick: leave }, '✕'),
        h('div', { class: 'bar' }, barEl), comboEl),
      mainEl, footEl);
    document.body.append(root);
    document.body.classList.add('noscroll');
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
    fit();
    next();
  }

  function fit() {
    if (!root || !window.visualViewport) return;
    root.style.height = window.visualViewport.height + 'px';
    window.scrollTo(0, 0);
  }

  function close() {
    if (window.visualViewport) window.visualViewport.removeEventListener('resize', fit);
    if (U.canSpeak()) speechSynthesis.cancel();
    if (root) root.remove();
    root = null;
    S = null;
    document.body.classList.remove('noscroll');
    A.flush();
    A.render();
  }

  async function leave() {
    if (!S) return;
    if (S.n === 0 || (await U.confirm('Leave practice?', 'Your progress so far is saved.', 'Leave', 'red'))) close();
  }

  function updateBar() {
    barEl.style.width = (S.finished.size / S.total) * 100 + '%';
    comboEl.textContent = S.combo >= 2 ? '🔥 ' + S.combo : '';
  }

  function next() {
    if (!S.items.length) return finish();
    const it = S.items[0];
    S.t0 = Date.now();
    mainEl.replaceChildren();
    footEl.replaceChildren();
    footEl.className = 'study-foot';
    mainEl.scrollTop = 0;
    updateBar();
    if (it.kind === 'intro') showIntro(it);
    else showAsk(it);
  }

  // ---- new word introduction ---------------------------------------------------
  function showIntro(it) {
    const c = it.card;
    const kind = U.words(c.en) > 3 ? 'sentence' : U.words(c.en) > 1 ? 'phrase' : 'word';
    mainEl.append(
      h('div', { class: 'q-label new' }, '✨ New ' + kind),
      h('div', { class: 'intro' },
        h('div', { class: 'en' }, c.en, speakBtn(c.en)),
        h('div', { class: 'pl' }, c.pl),
        c.ex ? h('div', { class: 'ex' }, '“' + c.ex + '”', speakBtn(c.ex, false, true)) : null),
      h('p', { class: 'muted center' }, 'Read it, listen, and remember it. Then we will practise!')
    );
    footEl.append(h('button', { class: 'btn primary wide', onclick: () => {
      S.items.shift();
      S.items.splice(Math.min(2, S.items.length), 0, { card: c, kind: 'ask' });
      next();
    } }, 'Got it'));
    U.speak(c.en);
  }

  // ---- shared pieces -------------------------------------------------------------
  function speakBtn(text, slow, small) {
    return h('button', {
      class: 'spk' + (slow ? ' slow' : '') + (small ? ' sm' : ''),
      'aria-label': slow ? 'Play slowly' : 'Play sound',
      onclick: (e) => { e.stopPropagation(); U.speak(text, slow ? 0.55 : 0.9); },
    }, slow === true ? '🐢' : '🔊');
  }
  const label = (t) => h('div', { class: 'q-label' }, t);

  function distractors(card, field, n) {
    const keyEn = U.norm(card.en);
    const keyPl = U.norm(card.pl);
    const wc = U.words(card[field]);
    const seen = new Set([U.norm(card[field])]);
    const cand = [];
    for (const c of A.state.cards) {
      if (c.id === card.id || U.norm(c.en) === keyEn || U.norm(c.pl) === keyPl) continue;
      const k = U.norm(c[field]);
      if (seen.has(k)) continue;
      seen.add(k);
      cand.push({ v: c[field], s: Math.abs(U.words(c[field]) - wc) + Math.random() * 1.5 });
    }
    cand.sort((a, b) => a.s - b.s);
    return cand.slice(0, n).map((x) => x.v);
  }
  const canMC = (card) => distractors(card, 'pl', 2).length >= 2 && distractors(card, 'en', 2).length >= 2;

  function extraWords(card, toks, n) {
    if (!n) return [];
    const have = new Set(toks.map((t) => U.norm(t)));
    const pool = new Set();
    for (const c of A.state.cards) {
      if (c.id === card.id) continue;
      for (const w of c.en.split(/\s+/)) {
        const k = U.norm(w);
        if (k.length >= 2 && /^[a-z']+$/.test(k) && !have.has(k)) pool.add(w.replace(/[.,!?]/g, '').toLowerCase());
      }
    }
    return U.shuffle([...pool]).slice(0, n);
  }

  const speedGrade = (card) => (card.st.reps >= 2 && Date.now() - S.t0 < 12000 ? 3 : 2);

  // ---- exercises ---------------------------------------------------------------------
  const EX = {};

  function mc(dir, listen) {
    return (card, it, answer) => {
      const toPl = dir === 'en2pl';
      const correct = toPl ? card.pl : card.en;
      const options = U.shuffle([correct, ...distractors(card, toPl ? 'pl' : 'en', 3)]);
      mainEl.append(label(listen ? 'Listen and pick the meaning' : toPl ? 'What does this mean?' : 'How do you say this in English?'));
      if (listen) {
        mainEl.append(h('div', { class: 'listen' }, speakBtn(card.en), speakBtn(card.en, true)));
        U.speak(card.en);
      } else {
        mainEl.append(h('div', { class: 'prompt' }, h('span', null, toPl ? card.en : card.pl), toPl ? speakBtn(card.en) : null));
        if (toPl) U.speak(card.en);
      }
      const btns = options.map((o) => h('button', { class: 'opt', onclick: () => choose(o) }, o));
      mainEl.append(h('div', { class: 'opts' }, btns));
      function choose(o) {
        const good = o === correct;
        btns.forEach((b) => {
          b.disabled = true;
          if (b.textContent === correct) b.classList.add('ok');
          else if (b.textContent === o) b.classList.add('bad');
        });
        answer({ grade: good ? 2 : 0, correct, speak: !listen && !toPl });
      }
    };
  }
  EX['mc-en2pl'] = mc('en2pl', false);
  EX['mc-pl2en'] = mc('pl2en', false);
  EX['listen-mc'] = mc('en2pl', true);

  function typing(listen) {
    return (card, it, answer) => {
      mainEl.append(label(listen ? 'Listen and type what you hear' : 'Type it in English'));
      if (listen) {
        mainEl.append(h('div', { class: 'listen' }, speakBtn(card.en), speakBtn(card.en, true)));
        U.speak(card.en);
      } else mainEl.append(h('div', { class: 'prompt' }, h('span', null, card.pl)));
      const inp = h('input', {
        class: 'ans', type: 'text', placeholder: 'Type here…', autocapitalize: 'off', autocorrect: 'off',
        autocomplete: 'off', spellcheck: 'false', enterkeyhint: 'done', lang: 'en', maxlength: '240',
      });
      const check = h('button', { class: 'btn primary wide', disabled: true, onclick: submit }, 'Check');
      const skip = h('button', { class: 'link', onclick: () => finish({ grade: 0, correct: card.en, speak: !listen }) }, "I don't know");
      // once something is typed, "Check" is the only choice, so "I don't know" can't be hit by accident
      inp.addEventListener('input', () => {
        check.disabled = !inp.value.trim();
        skip.classList.toggle('hidden', !!inp.value.trim());
      });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && inp.value.trim()) submit(); });
      mainEl.append(inp, check, h('div', { class: 'center' }, skip));
      setTimeout(() => inp.focus(), 60);
      function finish(res) {
        inp.disabled = true;
        inp.blur();
        answer(res);
      }
      function submit() {
        // the same Polish word can have two English cards (afraid / scared): either one is right when typing from Polish
        const same = listen ? [] : A.state.cards.filter((c) => c.id !== card.id && U.norm(c.pl) === U.norm(card.pl)).map((c) => c.en);
        const r = U.check(inp.value, [card.en, ...same].join(' / '));
        inp.classList.add(r === 'exact' ? 'ok' : r === 'near' ? 'near' : 'bad');
        finish({
          grade: r === 'exact' ? speedGrade(card) : r === 'near' ? 1 : 0,
          correct: card.en, near: r === 'near', speak: !listen, given: inp.value.trim(),
        });
      }
    };
  }
  EX.type = typing(false);
  EX['listen-type'] = typing(true);

  EX.build = (card, it, answer) => {
    const target = U.alts(card.en)[0];
    const toks = target.split(/\s+/).filter(Boolean);
    const bank = U.shuffle([...toks, ...extraWords(card, toks, toks.length >= 4 ? 2 : 0)].map((t, i) => ({ t, id: i })));
    const placed = [];
    mainEl.append(label('Build it in English'), h('div', { class: 'prompt' }, h('span', null, card.pl)));
    const slots = h('div', { class: 'slots' });
    const pool = h('div', { class: 'pool' });
    const check = h('button', { class: 'btn primary wide', disabled: true, onclick: submit }, 'Check');
    const skip = h('button', { class: 'link', onclick: () => lock({ grade: 0, correct: target, speak: true }) }, "I don't know");
    mainEl.append(slots, pool, check, h('div', { class: 'center' }, skip));
    let locked = false;
    function draw() {
      slots.replaceChildren(...placed.map((w) => h('button', { class: 'chip', onclick: () => { if (locked) return; placed.splice(placed.indexOf(w), 1); draw(); } }, w.t)));
      pool.replaceChildren(...bank.map((w) => placed.includes(w)
        ? h('span', { class: 'chip void' }, w.t)
        : h('button', { class: 'chip', onclick: () => { if (locked) return; placed.push(w); draw(); } }, w.t)));
      check.disabled = !placed.length;
    }
    function lock(res) { locked = true; check.disabled = true; answer(res); }
    function submit() {
      const good = U.exact(placed.map((w) => w.t).join(' '), card.en);
      slots.classList.add(good ? 'ok' : 'bad');
      lock({ grade: good ? speedGrade(card) : 0, correct: target, speak: true });
    }
    draw();
  };

  EX.flip = (card, it, answer) => {
    const enFirst = Math.random() < 0.5; // sometimes English first, sometimes Polish first
    const front = enFirst ? card.en : card.pl;
    const back = enFirst ? card.pl : card.en;
    mainEl.append(label(enFirst ? 'What does it mean? Think, then check' : 'How do you say it in English? Think, then check'),
      h('div', { class: 'prompt' }, h('span', null, front), enFirst ? speakBtn(card.en) : null));
    if (enFirst) U.speak(card.en);
    footEl.append(h('button', { class: 'btn primary wide', onclick: reveal }, 'Show answer'));
    function reveal() {
      mainEl.append(h('div', { class: 'flip-back' },
        h('div', { class: 'big' }, back, enFirst ? null : speakBtn(card.en)),
        card.ex ? h('div', { class: 'ex' }, '“' + card.ex + '”') : null));
      if (!enFirst) U.speak(card.en);
      const g = (n, text, cls) => h('button', { class: 'btn ' + cls, onclick: () => answer({ grade: n, correct: card.en, skipFeedback: true }) }, text);
      footEl.replaceChildren(h('div', { class: 'grades' },
        g(0, 'Again', 'red'), g(1, 'Hard', 'orange'), g(2, 'Good', 'green'), g(3, 'Easy', 'blue')));
    }
  };

  function pickType(card, it) {
    const stage = SRS.stage(card);
    const wc = U.words(card.en);
    const tts = U.canSpeak() && A.state.settings.tts;
    const mcOk = canMC(card);
    let pool = [];
    if (A.state.settings.style === 'flip') pool = ['flip'];
    else if (it.retry) pool = mcOk ? ['mc-en2pl'] : ['flip'];
    else {
      const easy = stage === 'new' || stage === 'learning';
      if (mcOk) {
        pool.push('mc-en2pl', 'mc-pl2en');
        if (tts) pool.push('listen-mc');
      }
      if (wc >= 2 && wc <= 12 && (!easy || !mcOk)) pool.push('build');
      if (!easy) {
        if (wc <= 8) pool.push('type');
        if (tts && wc <= 8 && stage === 'mastered') pool.push('listen-type');
      }
      // self-check card, like Anki: no ready answers, she rates herself afterwards
      pool.push('flip');
      if (stage === 'mastered') pool.push('flip');
    }
    const fresh = pool.filter((t) => t !== S.lastType);
    return U.pick(fresh.length ? fresh : pool);
  }

  function showAsk(it) {
    const card = it.card;
    const type = pickType(card, it);
    S.lastType = type;
    EX[type](card, it, (res) => {
      score(card, res);
      if (res.skipFeedback) advance(card, res);
      else showFeedback(card, res);
    });
  }

  // ---- scoring ----------------------------------------------------------------------------
  function score(card, res) {
    const g = res.grade;
    const first = !S.graded.has(card.id);
    let xp = 0;
    let coins = 0;
    if (first) {
      S.graded.add(card.id);
      S.n++;
      if (G.markPracticed()) S.ev.streak = true;
      const h0 = G.hist();
      h0.n++;
      if (!S.practice) {
        if (!card.st.seen) A.state.daily.newDone++;
        SRS.review(card, g, U.dayNum());
      }
      if (g > 0) {
        h0.ok++;
        S.ok++;
        xp = [0, 5, 10, 12][g];
        coins = 1;
        S.combo++;
        S.maxCombo = Math.max(S.maxCombo, S.combo);
        if (S.combo % 5 === 0) { xp += 5; coins += 2; res.combo = S.combo; }
      } else {
        S.combo = 0;
        S.mistakes++;
      }
    } else if (g > 0) {
      xp = 3;
      if (!S.practice && card.st.relearn) SRS.graduate(card, U.dayNum());
    }
    if (g > 0) S.finished.add(card.id);
    if (S.practice) { xp = Math.ceil(xp / 2); coins = 0; }
    if (xp) {
      const r = G.addXp(xp);
      if (r.levelUp) S.ev.levelUp = r.levelUp;
      if (r.goal) S.ev.goal = true;
    }
    A.state.profile.coins += coins;
    S.xp += xp;
    S.coins += coins;
    res.xp = xp;
    A.save();
    updateBar();
  }

  function advance(card, res) {
    S.items.shift();
    if (res.grade === 0) S.items.splice(Math.min(3, S.items.length), 0, { card, kind: 'ask', retry: true });
    next();
  }

  function showFeedback(card, res) {
    const g = res.grade;
    const kind = g >= 2 ? 'good' : g === 1 ? 'near' : 'bad';
    if (g >= 2) U.sfx.good(); else U.sfx.bad();
    if (g === 0) U.vibrate(60);
    const title = res.combo ? '🔥 ' + res.combo + ' in a row!' : U.pick(kind === 'good' ? OK_MSG : kind === 'near' ? NEAR_MSG : BAD_MSG);
    footEl.className = 'study-foot fb-' + kind;
    footEl.replaceChildren(
      h('div', { class: 'fb' },
        h('div', { class: 'fb-head' },
          h('span', { class: 'fb-ic' }, kind === 'good' ? '✅' : kind === 'near' ? '🟠' : '❌'),
          h('b', null, title),
          res.xp > 0 ? h('span', { class: 'xp-pop' }, '+' + res.xp + ' XP') : null),
        g < 2 ? h('div', { class: 'fb-ans' }, h('small', null, res.near ? 'Watch the spelling' : 'Correct answer'), h('div', null, res.correct)) : null,
        g < 2 && res.given ? h('div', { class: 'fb-ex' }, 'You wrote: ' + res.given) : null,
        card.ex ? h('div', { class: 'fb-ex' }, '“' + card.ex + '”') : null,
        h('button', {
          class: 'btn wide ' + (kind === 'good' ? 'green' : kind === 'near' ? 'orange' : 'red'),
          onclick: () => advance(card, res),
        }, 'Continue'))
    );
    if (res.speak) U.speak(card.en);
    updateBar();
  }

  // ---- the end ------------------------------------------------------------------------------
  function finish() {
    const p = A.state.profile;
    const perfect = !S.practice && S.mistakes === 0 && S.n >= 8;
    p.sessions++;
    if (perfect) p.perfect++;
    p.maxCombo = Math.max(p.maxCombo, S.maxCombo);
    const bonusXp = S.practice ? 5 : 10;
    const bonusCoins = S.practice ? 0 : perfect ? 15 : 10;
    const r = G.addXp(bonusXp);
    if (r.levelUp) S.ev.levelUp = r.levelUp;
    if (r.goal) S.ev.goal = true;
    p.coins += bonusCoins;
    S.xp += bonusXp;
    S.coins += bonusCoins;
    const before = p.coins;
    S.ev.ach = G.checkAchievements();
    S.coins += p.coins - before;
    A.flush();
    summary(perfect);
  }

  function summary(perfect) {
    const acc = S.n ? Math.round((S.ok / S.n) * 100) : 0;
    const p = A.state.profile;
    const info = G.levelInfo(p.xp);
    const more = SRS.counts(A.state, S.opts.deckId || null, U.dayNum()).total > 0;
    const title = perfect ? 'Flawless! 💎' : acc >= 90 ? 'Fantastic!' : acc >= 70 ? 'Great job!' : 'Good effort!';
    const tile = (big, small) => h('div', { class: 'tile' }, h('b', null, big), h('span', null, small));
    mainEl.replaceChildren(
      h('div', { class: 'sum' },
        h('div', { class: 'hero-ava bounce' }, A.avatar.el(A.state.avatar.cfg)),
        h('h1', null, title),
        h('p', { class: 'muted' }, S.practice ? 'Bonus round complete' : 'Practice complete'),
        h('div', { class: 'tiles' }, tile('+' + S.xp, 'XP'), tile(acc + '%', 'Correct'), tile('+' + S.coins, '🪙 Coins')),
        S.ev.streak ? h('div', { class: 'note streak' }, '🔥 ' + G.streak() + '-day streak!') : null,
        S.ev.goal ? h('div', { class: 'note goal' }, '🎯 Daily goal reached! +20 🪙') : h('div', { class: 'note' }, '🎯 Today: ' + G.todayXp() + ' / ' + p.goal + ' XP'),
        S.ev.levelUp ? h('div', { class: 'note lvl' }, '⬆️ Level ' + S.ev.levelUp + '! +15 🪙') : h('div', { class: 'note' }, 'Level ' + info.level + ' · ' + info.into + ' / ' + info.span + ' XP'),
        S.ev.ach.map((a) => h('div', { class: 'note ach' }, a.icon + ' New badge: ' + a.name + ' (+' + a.coins + ' 🪙)'))
      )
    );
    footEl.className = 'study-foot';
    footEl.replaceChildren(
      ...(more ? [h('button', { class: 'btn primary wide', onclick: () => { const o = S.opts; close(); start(o); } }, 'Keep going')] : []),
      h('button', { class: 'btn wide ' + (more ? 'ghost' : 'primary'), onclick: close }, 'Done')
    );
    barEl.style.width = '100%';
    comboEl.textContent = '';
    U.sfx.win();
    if (acc >= 70 || S.ev.goal || S.ev.levelUp) U.confetti(S.ev.levelUp || S.ev.goal ? 90 : 50);
  }

  A.study = { start };
})(window.A);
