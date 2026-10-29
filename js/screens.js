// The four tabs (Learn, Words, Style, Progress), plus settings and import/export.
(function (A) {
  'use strict';
  const U = A.util;
  const h = U.h;
  const G = A.game;
  const SRS = A.srs;
  const AV = A.avatar;

  A.ui = { tab: 'learn', deck: 'all', q: '', limit: 100, cat: 'hair' };

  const STAGE = {
    new: ['🆕', 'New'], learning: ['🌱', 'Learning'], young: ['🌿', 'Growing'], mastered: ['🌟', 'Mastered'],
  };

  const go = (tab) => { A.ui.tab = tab; A.ui.enter = true; A.render(); window.scrollTo(0, 0); };
  const todayStr = () => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  // ---- shared bits ------------------------------------------------------------------------
  function topbar() {
    const p = A.state.profile;
    const info = G.levelInfo(p.xp);
    return h('div', { class: 'top' },
      h('button', { class: 'me', 'aria-label': 'Open Style', onclick: () => go('style') },
        h('div', { class: 'ava-sm' }, AV.el(A.state.avatar.cfg, AV.HEAD_VIEW)),
        h('div', { class: 'lvl' }, h('b', null, 'Level ' + info.level), h('div', { class: 'bar sm' }, h('i', { css: { width: Math.round(info.pct * 100) + '%' } })))),
      h('div', { class: 'pill', title: 'Day streak' }, '🔥 ' + G.streak()),
      h('div', { class: 'pill', title: 'Coins' }, '🪙 ' + p.coins),
      h('button', { class: 'icon-btn', 'aria-label': 'Settings', onclick: openSettings }, '⚙️'));
  }

  function field(label, input) {
    return h('label', { class: 'field' }, h('span', null, label), input);
  }

  function ring(value, max) {
    const r = 34;
    const c = 2 * Math.PI * r;
    const pct = U.clamp(value / max, 0, 1);
    return U.html(
      `<svg viewBox="0 0 84 84" class="ring" aria-hidden="true"><circle cx="42" cy="42" r="${r}" fill="none" stroke="#e6e1fa" stroke-width="10"/>` +
      `<circle cx="42" cy="42" r="${r}" fill="none" stroke="${pct >= 1 ? '#34c77b' : '#7b4dff'}" stroke-width="10" stroke-linecap="round" ` +
      `stroke-dasharray="${(c * pct).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 42 42)"/></svg>`
    );
  }

  const segmented = (options, current, onPick) =>
    h('div', { class: 'seg' }, options.map(([v, text]) =>
      h('button', { class: 'seg-b' + (v === current ? ' on' : ''), onclick: (e) => {
        e.currentTarget.parentNode.querySelectorAll('.seg-b').forEach((b) => b.classList.remove('on'));
        e.currentTarget.classList.add('on');
        onPick(v);
      } }, text)));

  // ---- Learn --------------------------------------------------------------------------------
  function learn() {
    const st = A.state;
    const p = st.profile;
    const today = U.dayNum();
    const cnt = SRS.counts(st, null, today);
    const xp = G.todayXp();
    const hasCards = st.cards.length > 0;
    const greet = 'Hi' + (p.name ? ', ' + p.name : '') + '! 👋';

    const startBtn = !hasCards
      ? null
      : cnt.total > 0
        ? h('button', { class: 'btn primary big', onclick: () => A.study.start({}) }, h('span', null, 'Start practice'), h('small', null, Math.min(cnt.total, st.settings.session) + ' of ' + cnt.total + ' cards ready'))
        : h('button', { class: 'btn green big', onclick: () => A.study.start({ bonus: true }) }, h('span', null, 'Bonus round'), h('small', null, 'All done for today! Practise extra for fun'));

    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d = today - i;
      const e = p.history[d];
      const letter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(d * 864e5).getUTCDay()];
      week.push(h('div', { class: 'day' + (i === 0 ? ' today' : '') + (e && e.goal ? ' goal' : e && e.n ? ' did' : '') },
        h('span', null, letter), h('i', null, e && e.goal ? '★' : e && e.n ? '✓' : '')));
    }

    return h('div', { class: 'screen' },
      topbar(),
      h('div', { class: 'greet' }, h('h1', null, greet), h('p', { class: 'muted' }, todayStr())),
      installHint(),
      h('div', { class: 'card goal-card' },
        h('div', { class: 'ring-wrap' }, ring(xp, p.goal), h('b', null, Math.min(100, Math.round((xp / p.goal) * 100)) + '%')),
        h('div', { class: 'goal-txt' },
          h('b', null, xp >= p.goal ? 'Daily goal reached! 🎉' : 'Daily goal'),
          h('p', { class: 'muted' }, xp + ' / ' + p.goal + ' XP today'),
          h('p', { class: 'muted small' }, G.practicedToday() ? 'Streak saved for today 🔥' : G.streak() > 0 ? 'Practise today to keep your ' + G.streak() + '-day streak!' : 'Practise today to start a streak!'))),
      h('div', { class: 'week' }, week),
      hasCards
        ? [startBtn, h('div', { class: 'chips-row' },
            h('span', { class: 'mini' }, '🔁 ' + cnt.due + ' to review'),
            h('span', { class: 'mini' }, '🆕 ' + cnt.newAvail + ' new today'),
            h('span', { class: 'mini' }, '⭐ ' + G.mastered() + ' mastered'))]
        : h('div', { class: 'card empty' },
            h('div', { class: 'big-emoji' }, '📚'),
            h('h2', null, 'Let’s add your first words!'),
            h('p', { class: 'muted' }, 'Add words, phrases or whole sentences. Then practise them a little every day.'),
            h('button', { class: 'btn primary wide', onclick: () => cardSheet() }, '＋ Add a card')),
      hasCards ? h('h3', { class: 'sec' }, 'My decks') : null,
      hasCards ? st.decks.map(deckRow) : null
    );
  }

  function installHint() {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
    let hidden = false;
    try { hidden = localStorage.getItem('pumpelek.hint') === '1'; } catch (e) { /* ignore */ }
    if (!ios || standalone || hidden) return null;
    return h('div', { class: 'card hint' },
      h('div', null, h('b', null, 'Put Pumpelek on your home screen'), h('p', { class: 'muted small' }, 'Tap the Share button ⬆️ in Safari, then “Add to Home Screen”.')),
      h('button', { class: 'icon-btn', 'aria-label': 'Hide tip', onclick: (e) => {
        try { localStorage.setItem('pumpelek.hint', '1'); } catch (err) { /* ignore */ }
        e.currentTarget.closest('.hint').remove();
      } }, '✕'));
  }

  function deckRow(d) {
    const cards = A.state.cards.filter((c) => c.deck === d.id);
    const mastered = cards.filter((c) => SRS.stage(c) === 'mastered').length;
    const cnt = SRS.counts(A.state, d.id, U.dayNum());
    return h('div', { class: 'card deck' },
      h('div', { class: 'deck-emoji' }, d.emoji),
      h('div', { class: 'deck-body' },
        h('b', null, d.name),
        h('p', { class: 'muted small' }, cards.length + ' cards · ' + mastered + ' mastered'),
        h('div', { class: 'bar sm green' }, h('i', { css: { width: (cards.length ? (mastered / cards.length) * 100 : 0) + '%' } }))),
      h('button', { class: 'btn small ' + (cnt.total ? 'primary' : 'ghost'), disabled: !cards.length, onclick: () => A.study.start({ deckId: d.id, bonus: cnt.total === 0 }) }, cnt.total ? 'Practise' : 'Bonus'));
  }

  function newCard(deck, en, pl, ex, created) {
    return { id: U.uid() + Math.random().toString(36).slice(2, 5), deck, en, pl, ex, created: created || Date.now(), st: SRS.newState() };
  }

  // ---- Words ----------------------------------------------------------------------------------
  function words() {
    const list = h('div', { class: 'list' });
    const search = h('input', { type: 'search', class: 'search', placeholder: 'Search words…', value: A.ui.q, 'aria-label': 'Search cards' });
    search.addEventListener('input', () => { A.ui.q = search.value; A.ui.limit = 100; drawList(); });

    function matches(c) {
      if (A.ui.deck !== 'all' && c.deck !== A.ui.deck) return false;
      const q = U.norm(A.ui.q);
      return !q || U.norm(c.en).includes(q) || U.norm(c.pl).includes(q) || U.norm(c.ex).includes(q);
    }
    function drawList() {
      const all = A.state.cards.filter(matches).sort((a, b) => b.created - a.created);
      const shown = all.slice(0, A.ui.limit);
      list.replaceChildren(
        ...(shown.length
          ? shown.map((c) => {
              const [icon, name] = STAGE[SRS.stage(c)];
              return h('button', { class: 'row', onclick: () => cardSheet(c) },
                h('div', { class: 'row-t' }, h('b', null, c.en), h('span', { class: 'muted' }, c.pl)),
                h('span', { class: 'stage', title: name }, icon));
            })
          : [h('p', { class: 'muted center pad' }, A.state.cards.length ? 'No cards match.' : 'No cards yet. Tap ＋ to add one!')]),
        ...(all.length > shown.length ? [h('button', { class: 'btn ghost wide', onclick: () => { A.ui.limit += 100; drawList(); } }, 'Show more (' + (all.length - shown.length) + ')')] : [])
      );
    }

    const chips = h('div', { class: 'chips scroll' },
      [{ id: 'all', name: 'All', emoji: '' }, ...A.state.decks].map((d) =>
        h('button', { class: 'chip-f' + (A.ui.deck === d.id ? ' on' : ''), onclick: () => { A.ui.deck = d.id; A.ui.limit = 100; A.render(); } }, (d.emoji ? d.emoji + ' ' : '') + d.name)));

    drawList();
    return h('div', { class: 'screen' },
      topbar(),
      h('div', { class: 'row-h' }, h('h1', null, 'My words'), h('button', { class: 'btn small ghost', onclick: manageSheet }, 'Import · Export')),
      search, chips, list,
      h('button', { class: 'fab', 'aria-label': 'Add a card', onclick: () => cardSheet() }, '＋'));
  }

  function cardSheet(card) {
    const st = A.state;
    const NEW = '__new__';
    const en = h('input', { type: 'text', maxlength: '200', placeholder: 'e.g. Where is the station?', value: card ? card.en : '', autocapitalize: 'sentences', autocomplete: 'off', lang: 'en' });
    const pl = h('input', { type: 'text', maxlength: '200', placeholder: 'e.g. Gdzie jest dworzec?', value: card ? card.pl : '', autocomplete: 'off', lang: 'pl' });
    const ex = h('input', { type: 'text', maxlength: '300', placeholder: 'A sentence using it (optional)', value: card ? card.ex : '', autocomplete: 'off', lang: 'en' });
    const deckSel = h('select', null,
      st.decks.map((d) => h('option', { value: d.id }, d.emoji + ' ' + d.name)),
      h('option', { value: NEW }, '＋ New deck…'));
    deckSel.value = card ? card.deck : A.ui.deck !== 'all' && st.decks.some((d) => d.id === A.ui.deck) ? A.ui.deck : st.decks[0].id;
    const newName = h('input', { type: 'text', maxlength: '40', placeholder: 'Deck name', class: 'hidden' });
    deckSel.addEventListener('change', () => newName.classList.toggle('hidden', deckSel.value !== NEW));
    const err = h('p', { class: 'err' });

    function save(another, close) {
      const e = en.value.replace(/\s+/g, ' ').trim();
      const p = pl.value.replace(/\s+/g, ' ').trim();
      const x = ex.value.replace(/\s+/g, ' ').trim();
      if (!e || !p) { err.textContent = 'Please fill in both English and Polish.'; return false; }
      let deckId = deckSel.value;
      if (deckId === NEW) {
        const name = newName.value.trim();
        if (!name) { err.textContent = 'Give your new deck a name.'; return false; }
        deckId = U.uid();
        st.decks.push({ id: deckId, name: name.slice(0, 40), emoji: '📘' });
      }
      const dup = st.cards.find((c) => c.deck === deckId && c !== card && U.norm(c.en) === U.norm(e) && U.norm(c.pl) === U.norm(p));
      if (dup) { err.textContent = 'You already have this card in that deck.'; return false; }
      if (card) Object.assign(card, { en: e, pl: p, ex: x, deck: deckId });
      else st.cards.push(newCard(deckId, e, p, x));
      A.save();
      U.toast(card ? 'Saved' : 'Card added', '✅');
      if (another) {
        en.value = ''; pl.value = ''; ex.value = ''; err.textContent = '';
        if (deckSel.value === NEW) { deckSel.value = deckId; newName.classList.add('hidden'); deckSel.replaceChildren(...st.decks.map((d) => h('option', { value: d.id }, d.emoji + ' ' + d.name)), h('option', { value: NEW }, '＋ New deck…')); deckSel.value = deckId; }
        en.focus();
        if (A.ui.tab === 'words') A.render();
        return false;
      }
      A.render();
      return true;
    }

    const body = h('div', null,
      field('English', en), field('Polish', pl), field('Example sentence (optional)', ex),
      field('Deck', deckSel), newName, err,
      card ? h('button', { class: 'link danger', onclick: async () => {
        if (await U.confirm('Delete this card?', '“' + card.en + '” will be removed for good.', 'Delete', 'red')) {
          st.cards.splice(st.cards.indexOf(card), 1);
          A.save();
          sheet.close();
          A.render();
        }
      } }, '🗑 Delete card') : null,
      card ? h('p', { class: 'muted small' }, STAGE[SRS.stage(card)][0] + ' ' + STAGE[SRS.stage(card)][1] + (card.st.seen ? ' · next review ' + dueText(card) : '')) : null);

    const sheet = U.modal({
      title: card ? 'Edit card' : 'New card',
      body,
      actions: [
        { label: 'Cancel', kind: 'ghost' },
        ...(card ? [] : [{ label: 'Save + new', kind: 'ghost', onClick: () => { save(true); return false; } }]),
        { label: 'Save', kind: 'primary', onClick: () => save(false) },
      ],
    });
    if (!card) setTimeout(() => en.focus(), 80);
  }

  function dueText(card) {
    const d = card.st.due - U.dayNum();
    return d <= 0 ? 'today' : d === 1 ? 'tomorrow' : 'in ' + d + ' days';
  }

  // ---- import / export -------------------------------------------------------------------------
  function manageSheet() {
    const st = A.state;
    const stamp = new Date().toISOString().slice(0, 10);
    const row = (icon, title, sub, fn) =>
      h('button', { class: 'menu-row', onclick: () => { sheet.close(); fn(); } }, h('span', { class: 'mi' }, icon), h('div', null, h('b', null, title), h('small', { class: 'muted' }, sub)));
    const sheet = U.modal({
      title: 'Import · Export',
      body: h('div', { class: 'menu' },
        row('📥', 'Import cards from a file', 'A .csv file: English; Polish; example; deck', () => U.pickFile('.csv,.txt,text/csv,text/plain', importCards)),
        row('📄', 'Download a CSV template', 'Open it in Excel or Google Sheets', () => U.download('pumpelek-template.csv', '﻿' + A.csv.stringify([['english', 'polish', 'example', 'deck'], ['apple', 'jabłko', 'I eat an apple every day.', 'Food'], ['How are you?', 'Jak się masz?', '', 'Phrases']]), 'text/csv')),
        row('📤', 'Export my cards (CSV)', st.cards.length + ' cards', () => U.download('pumpelek-cards-' + stamp + '.csv', '﻿' + A.csv.stringify([['english', 'polish', 'example', 'deck'], ...st.cards.map((c) => [c.en, c.pl, c.ex, (st.decks.find((d) => d.id === c.deck) || {}).name || ''])]), 'text/csv')),
        row('💾', 'Back up everything', 'Cards, progress and avatar in one file', () => U.download('pumpelek-backup-' + stamp + '.json', JSON.stringify(st), 'application/json')),
        row('♻️', 'Restore a backup', 'Replaces what is on this device', restoreBackup),
        row('🗂', 'Manage decks', 'Rename or delete decks', decksSheet)),
      actions: [{ label: 'Close', kind: 'ghost' }],
    });
  }

  function importCards(text, file) {
    const res = A.csv.toCards(text);
    if (!res.cards.length) return U.toast('No cards found. Check the file has English and Polish columns.', '⚠️');
    const st = A.state;
    const baseName = (file.name || 'Imported').replace(/\.[^.]+$/, '').slice(0, 40) || 'Imported';
    const NEW = '__new__';
    const sel = h('select', null, st.decks.map((d) => h('option', { value: d.id }, d.emoji + ' ' + d.name)), h('option', { value: NEW }, '＋ New deck: ' + baseName));
    sel.value = NEW;
    const preview = h('div', { class: 'preview' }, res.cards.slice(0, 5).map((c) => h('div', null, h('b', null, c.en), ' — ', c.pl)), res.cards.length > 5 ? h('div', { class: 'muted' }, '…and ' + (res.cards.length - 5) + ' more') : null);
    U.modal({
      title: 'Import ' + res.cards.length + ' cards?',
      body: h('div', null, preview, res.skipped ? h('p', { class: 'muted small' }, res.skipped + (res.skipped === 1 ? ' row' : ' rows') + ' skipped (English or Polish was empty).') : null, res.truncated ? h('p', { class: 'muted small' }, 'Only the first 5000 rows are imported.') : null, field('Put them in', sel), h('p', { class: 'muted small' }, 'Rows with a “deck” column go into that deck instead.')),
      actions: [
        { label: 'Cancel', kind: 'ghost' },
        { label: 'Import', kind: 'primary', onClick: () => {
          const byName = (n) => {
            let d = st.decks.find((x) => U.norm(x.name) === U.norm(n));
            if (!d) { d = { id: U.uid(), name: n, emoji: '📘' }; st.decks.push(d); }
            return d.id;
          };
          let fallback = sel.value === NEW ? null : sel.value; // the file-name deck is only created if some row needs it
          let added = 0;
          let dups = 0;
          const seen = new Set(st.cards.map((c) => c.deck + '|' + U.norm(c.en) + '|' + U.norm(c.pl)));
          const t = Date.now();
          for (const c of res.cards) {
            if (!c.deck && !fallback) fallback = byName(baseName);
            const deck = c.deck ? byName(c.deck) : fallback;
            const key = deck + '|' + U.norm(c.en) + '|' + U.norm(c.pl);
            if (seen.has(key)) { dups++; continue; }
            seen.add(key);
            st.cards.push(newCard(deck, c.en, c.pl, c.ex, t + added));
            added++;
          }
          A.save();
          U.toast('Added ' + added + ' cards' + (dups ? ' (' + dups + ' already there)' : ''), '📥');
          A.render();
        } },
      ],
    });
  }

  function restoreBackup() {
    U.pickFile('.json,application/json', async (text) => {
      let raw;
      try { raw = JSON.parse(text); } catch (e) { return U.toast('That is not a Pumpelek backup.', '⚠️'); }
      const next = A.sanitize(raw);
      if (!raw || !Array.isArray(raw.cards)) return U.toast('That is not a Pumpelek backup.', '⚠️');
      if (await U.confirm('Restore this backup?', 'It has ' + next.cards.length + ' cards and ' + next.profile.xp + ' XP. Everything currently on this device will be replaced.', 'Restore', 'red')) {
        A.replaceState(raw);
        U.toast('Backup restored', '♻️');
        A.render();
      }
    });
  }

  function decksSheet() {
    const st = A.state;
    const list = h('div');
    function draw() {
      list.replaceChildren(...st.decks.map((d) => {
        const inp = h('input', { type: 'text', value: d.name, maxlength: '40', 'aria-label': 'Deck name' });
        inp.addEventListener('change', () => { const n = inp.value.trim(); if (n) { d.name = n.slice(0, 40); A.save(); } else inp.value = d.name; });
        return h('div', { class: 'deck-edit' }, h('span', null, d.emoji), inp,
          h('small', { class: 'muted' }, A.cardCount(d.id) + ''),
          h('button', { class: 'icon-btn', 'aria-label': 'Delete deck ' + d.name, onclick: async () => {
            const n = A.cardCount(d.id);
            if (!(await U.confirm('Delete “' + d.name + '”?', n ? 'Its ' + n + ' cards will be deleted too.' : 'This deck is empty.', 'Delete', 'red'))) return;
            st.cards = st.cards.filter((c) => c.deck !== d.id);
            st.decks = st.decks.filter((x) => x.id !== d.id);
            if (!st.decks.length) st.decks.push({ id: U.uid(), name: 'My words', emoji: '📚' });
            if (A.ui.deck === d.id) A.ui.deck = 'all';
            A.save();
            draw();
          } }, '🗑'));
      }));
    }
    const nameIn = h('input', { type: 'text', maxlength: '40', placeholder: 'New deck name' });
    draw();
    U.modal({
      title: 'Decks',
      body: h('div', null, list, h('div', { class: 'deck-add' }, nameIn, h('button', { class: 'btn small primary', onclick: () => {
        const n = nameIn.value.trim();
        if (!n) return;
        st.decks.push({ id: U.uid(), name: n.slice(0, 40), emoji: '📘' });
        nameIn.value = '';
        A.save();
        draw();
      } }, 'Add'))),
      actions: [{ label: 'Done', kind: 'primary' }],
      onClose: () => A.render(),
    });
  }

  // ---- Style (avatar) ------------------------------------------------------------------------------
  const CATS = [
    ['hair', 'Hair', '💇'], ['hairColor', 'Color', '🎨'], ['top', 'Outfit', '👕'], ['head', 'Extras', '🎀'], ['face', 'Freckles', '✨'],
    ['skin', 'Skin', '🖐️'], ['pet', 'Pets', '🐱'], ['bg', 'Scene', '🌅'],
  ];

  function style() {
    const st = A.state;
    const slot = A.ui.cat;
    const cfg = st.avatar.cfg;
    const grid = h('div', { class: 'grid' }, AV.CAT[slot].map((item) => {
      const owned = AV.has(slot, item);
      const on = cfg[slot] === item.id;
      const preview = Object.assign({}, cfg, { [slot]: item.id });
      if (slot !== 'pet' && slot !== 'bg') preview.pet = 'none';
      return h('button', { class: 'item' + (on ? ' on' : ''), 'aria-label': item.name + (owned ? '' : ', ' + item.price + ' coins'), onclick: () => pickItem(slot, item) },
        AV.el(preview, AV.VIEW[slot]),
        h('span', { class: 'iname' }, item.name),
        owned ? (on ? h('span', { class: 'tag on' }, '✓ Wearing') : null) : h('span', { class: 'tag' }, '🪙 ' + item.price));
    }));
    return h('div', { class: 'screen' },
      topbar(),
      h('h1', null, 'My style'),
      h('div', { class: 'stage-ava' }, h('div', { class: 'big-ava' }, AV.el(cfg))),
      h('p', { class: 'muted center' }, 'Earn coins by practising, then spend them here!'),
      h('div', { class: 'chips scroll' }, CATS.map(([id, name, emoji]) => h('button', { class: 'chip-f' + (slot === id ? ' on' : ''), onclick: () => { A.ui.cat = id; A.render(); } }, emoji + ' ' + name))),
      grid);
  }

  function pickItem(slot, item) {
    const st = A.state;
    if (AV.has(slot, item)) {
      st.avatar.cfg[slot] = item.id;
      A.save();
      A.render();
      return;
    }
    const need = item.price - st.profile.coins;
    const preview = Object.assign({}, st.avatar.cfg, { [slot]: item.id });
    U.modal({
      title: item.name,
      body: h('div', { class: 'buy' }, h('div', { class: 'big-ava sm' }, AV.el(preview)), h('p', null, need > 0 ? 'You need ' + need + ' more 🪙. Keep practising!' : 'Buy this for ' + item.price + ' 🪙?')),
      actions: [
        { label: need > 0 ? 'OK' : 'Not now', kind: 'ghost' },
        ...(need > 0 ? [] : [{ label: 'Buy · ' + item.price + ' 🪙', kind: 'primary', onClick: () => {
          st.profile.coins -= item.price;
          st.avatar.owned.push(AV.key(slot, item));
          st.avatar.cfg[slot] = item.id;
          const fresh = G.checkAchievements();
          A.save();
          U.sfx.coin();
          U.confetti(30);
          fresh.forEach((a) => U.toast(a.icon + ' New badge: ' + a.name));
          A.render();
        } }]),
      ],
    });
  }

  // ---- Progress ----------------------------------------------------------------------------------------
  function progress() {
    const st = A.state;
    const p = st.profile;
    const today = U.dayNum();
    const info = G.levelInfo(p.xp);
    const stages = { new: 0, learning: 0, young: 0, mastered: 0 };
    st.cards.forEach((c) => { stages[SRS.stage(c)]++; });
    const total = st.cards.length || 1;

    const days = [];
    for (let i = 6; i >= 0; i--) days.push(today - i);
    const maxN = Math.max(5, ...days.map((d) => (p.history[d] || { n: 0 }).n));
    let wn = 0;
    let wok = 0;
    days.forEach((d) => { const e = p.history[d]; if (e) { wn += e.n; wok += e.ok; } });

    const tile = (big, small, cls) => h('div', { class: 'stat ' + (cls || '') }, h('b', null, big), h('span', null, small));
    const heat = [];
    for (let i = 34; i >= 0; i--) {
      const e = p.history[today - i];
      const lvl = !e || !e.n ? 0 : e.n < 6 ? 1 : e.n < 15 ? 2 : 3;
      heat.push(h('i', { class: 'heat l' + lvl + (i === 0 ? ' today' : ''), title: e ? e.n + ' cards' : 'No practice' }));
    }

    return h('div', { class: 'screen' },
      topbar(),
      h('h1', null, 'My progress'),
      h('div', { class: 'stats' }, tile('Lv ' + info.level, info.into + ' / ' + info.span + ' XP', 'pri'), tile(String(p.xp), 'Total XP'), tile(String(G.learned()), 'Cards learned'), tile(String(stages.mastered), 'Mastered ⭐', 'gold')),
      h('div', { class: 'card' },
        h('h3', null, 'My word garden 🌳'),
        h('div', { class: 'stack' }, ['mastered', 'young', 'learning', 'new'].map((k) => stages[k] ? h('i', { class: 's-' + k, css: { width: (stages[k] / total) * 100 + '%' } }) : null)),
        h('div', { class: 'legend' }, ['new', 'learning', 'young', 'mastered'].map((k) => h('span', null, h('i', { class: 'dot s-' + k }), STAGE[k][0] + ' ' + STAGE[k][1] + ' · ' + stages[k]))),
        st.cards.length ? null : h('p', { class: 'muted small' }, 'Add some cards to grow your garden.')),
      h('div', { class: 'card' },
        h('h3', null, 'Last 7 days'),
        h('div', { class: 'bars' }, days.map((d) => {
          const e = p.history[d] || { n: 0 };
          return h('div', { class: 'col' + (d === today ? ' today' : '') }, h('small', null, e.n || ''), h('div', { class: 'bar-v' }, h('i', { css: { height: (e.n / maxN) * 100 + '%' } })), h('span', null, ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(d * 864e5).getUTCDay()]));
        })),
        h('p', { class: 'muted small' }, wn ? wn + ' cards · ' + Math.round((wok / wn) * 100) + '% correct this week' : 'No practice yet this week.')),
      h('div', { class: 'card' },
        h('h3', null, '🔥 Streak'),
        h('div', { class: 'streak-row' }, h('div', null, h('b', { class: 'huge' }, String(G.streak())), h('small', null, 'current')), h('div', null, h('b', { class: 'huge' }, String(p.best)), h('small', null, 'best'))),
        h('div', { class: 'heat-grid' }, heat)),
      h('div', { class: 'card' },
        h('h3', null, 'Badges ' + Object.keys(p.achievements).length + ' / ' + G.ACH.length),
        h('div', { class: 'badges' }, G.ACH.map((a) => {
          const got = p.achievements[a.id] != null;
          return h('div', { class: 'badge' + (got ? ' got' : '') }, h('span', { class: 'bi' }, got ? a.icon : '🔒'), h('b', null, a.name), h('small', null, a.desc));
        }))));
  }

  // ---- Settings ---------------------------------------------------------------------------------------------
  function openSettings() {
    const s = A.state.settings;
    const p = A.state.profile;
    const name = h('input', { type: 'text', maxlength: '20', value: p.name, placeholder: 'Your name', autocomplete: 'off' });
    name.addEventListener('input', () => { p.name = name.value.trim().slice(0, 20); A.save(); });
    const toggle = (key, text) => {
      const b = h('button', { class: 'switch' + (s[key] ? ' on' : ''), role: 'switch', 'aria-checked': String(s[key]), onclick: () => {
        s[key] = !s[key];
        b.classList.toggle('on', s[key]);
        b.setAttribute('aria-checked', String(s[key]));
        A.save();
        if (key === 'sound' && s.sound) U.sfx.good();
      } }, h('i'));
      return h('div', { class: 'set-row' }, h('span', null, text), b);
    };
    U.modal({
      title: 'Settings',
      body: h('div', null,
        field('My name', name),
        h('div', { class: 'field' }, h('span', null, 'Daily goal'), segmented([[30, 'Easy · 30 XP'], [50, 'Normal · 50'], [100, 'Pro · 100']], p.goal, (v) => { p.goal = v; A.save(); })),
        h('div', { class: 'field' }, h('span', null, 'New cards per day'), segmented([[5, '5'], [10, '10'], [20, '20'], [40, '40']], s.newPerDay, (v) => { s.newPerDay = v; A.save(); })),
        h('div', { class: 'field' }, h('span', null, 'Cards in one practice'), segmented([[8, '8'], [12, '12'], [20, '20']], s.session, (v) => { s.session = v; A.save(); })),
        h('div', { class: 'field' }, h('span', null, 'Exercises'), segmented([['mixed', 'Mixed'], ['flip', 'Flip cards only']], s.style, (v) => { s.style = v; A.save(); })),
        toggle('intro', 'Show new words before practising them'),
        toggle('sound', 'Sound effects'),
        U.canSpeak() ? toggle('tts', 'Read words aloud') : null,
        h('button', { class: 'link danger', onclick: async () => {
          if (await U.confirm('Erase everything?', 'All cards, progress, coins and avatar items on this device will be deleted. This cannot be undone. Tip: make a backup first.', 'Erase', 'red')) {
            A.resetAll();
            A.ui.deck = 'all';
            U.toast('Everything erased', '🧹');
            A.render();
          }
        } }, '🧹 Erase all data'),
        h('p', { class: 'muted small' }, 'Pumpelek keeps everything on this device. Nothing is sent over the internet.' + (A.storageOk ? '' : ' ⚠️ This browser is not saving data (private mode?).'))),
      actions: [{ label: 'Done', kind: 'primary' }],
      onClose: () => A.render(),
    });
  }

  // ---- shell -------------------------------------------------------------------------------------------------------
  const TABS = [['learn', '🏠', 'Learn'], ['words', '📚', 'Words'], ['style', '🎨', 'Style'], ['progress', '📈', 'Progress']];

  A.render = () => {
    const root = document.getElementById('app');
    const screen = { learn, words, style, progress }[A.ui.tab]();
    if (A.ui.enter) screen.classList.add('enter');
    A.ui.enter = false;
    const nav = h('nav', { class: 'tabbar', 'aria-label': 'Main' }, TABS.map(([id, icon, name]) =>
      h('button', { class: 'tab' + (A.ui.tab === id ? ' on' : ''), 'aria-current': A.ui.tab === id ? 'page' : null, onclick: () => go(id) }, h('span', { class: 'ic' }, icon), name)));
    root.replaceChildren(screen, nav);
  };
})(window.A);
