// CSV import/export. Files are only ever read as plain text and turned into plain strings.
(function (A) {
  'use strict';
  const C = (A.csv = {});
  const ROW_CAP = 5000;

  function parse(text, delim) {
    const rows = [];
    let row = [];
    let cell = '';
    let q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') {
          if (text[i + 1] === '"') { cell += '"'; i++; } else q = false;
        } else cell += c;
      } else if (c === '"' && cell === '') q = true;
      else if (c === delim) { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell);
        cell = '';
        rows.push(row);
        row = [];
      } else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((x) => x.trim() !== ''));
  }

  // Excel in Polish uses ';', Google Sheets uses ','. Pick whichever splits the first lines most consistently.
  function detect(text) {
    const sample = text.slice(0, 4000);
    let best = ',';
    let bestScore = -1;
    for (const d of ['\t', ';', ',']) {
      const rows = parse(sample, d).slice(0, 10);
      if (!rows.length || rows[0].length < 2) continue;
      const n = rows[0].length;
      const score = rows.filter((r) => r.length === n).length * 10 + n;
      if (score > bestScore) { best = d; bestScore = score; }
    }
    return best;
  }

  const HEAD = {
    en: /^(english|en|front|word|words|phrase|angielski|słówko)$/i,
    pl: /^(polish|pl|back|translation|meaning|polski|tłumaczenie)$/i,
    ex: /^(example|sentence|ex|przykład|zdanie)$/i,
    deck: /^(deck|talia|set|unit|category)$/i,
  };

  const clean = (s, max) =>
    String(s == null ? '' : s)
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/^'(?=[=+\-@])/, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, max);

  // -> { cards: [{en, pl, ex, deck}], skipped, truncated }
  C.toCards = (text) => {
    text = text.replace(/^﻿/, '');
    const rows = parse(text, detect(text));
    let map = { en: 0, pl: 1, ex: 2, deck: 3 };
    let start = 0;
    if (rows.length) {
      const first = rows[0].map((x) => x.trim());
      const idx = (re) => first.findIndex((x) => re.test(x));
      if (idx(HEAD.en) >= 0 && idx(HEAD.pl) >= 0) {
        map = { en: idx(HEAD.en), pl: idx(HEAD.pl), ex: idx(HEAD.ex), deck: idx(HEAD.deck) };
        start = 1;
      }
    }
    const cards = [];
    let skipped = 0;
    let truncated = false;
    for (let i = start; i < rows.length; i++) {
      if (cards.length >= ROW_CAP) { truncated = true; break; }
      const r = rows[i];
      const en = clean(r[map.en], 200);
      const pl = clean(r[map.pl], 200);
      if (!en || !pl) { skipped++; continue; }
      cards.push({
        en,
        pl,
        ex: map.ex >= 0 ? clean(r[map.ex], 300) : '',
        deck: map.deck >= 0 ? clean(r[map.deck], 40) : '',
      });
    }
    return { cards, skipped, truncated };
  };

  // Cells starting with = + - @ get a leading apostrophe so spreadsheets never run them as formulas.
  C.stringify = (rows, d = ';') =>
    rows
      .map((r) =>
        r
          .map((v) => {
            v = String(v == null ? '' : v);
            if (/^[=+\-@]/.test(v)) v = "'" + v;
            return /["\n\r;,\t]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
          })
          .join(d)
      )
      .join('\r\n') + '\r\n';
})(window.A);
