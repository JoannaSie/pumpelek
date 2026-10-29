// The avatar: a stack of picture layers (img/avatar/*.webp, positions in js/avatar-art.js) inside one SVG.
// Everything is picked from the fixed catalogue below and turned into file names; nothing comes from user text.
(function (A) {
  'use strict';
  const U = A.util;
  const V = (A.avatar = {});

  // ---- catalogue ----------------------------------------------------------
  const CAT = {};
  // skin0 is the colour of the original drawing; the others are tinted copies of the pictures
  CAT.skin = ['#F8D8C2', '#F3C9A4', '#E3A977', '#C98B5B', '#9B6240', '#6B4226'].map((c, i) => ({
    id: 'skin' + i, name: 'Skin ' + (i + 1), price: 0, color: c,
  }));
  // The order follows the design sheet: classic bun first, then the other styles.
  CAT.hair = [
    { id: 'topknot', name: 'Bun', price: 0 },
    { id: 'ballerina', name: 'High bun', price: 0 },
    { id: 'long', name: 'Loose', price: 0 },
    { id: 'halfup', name: 'Half-up', price: 10 },
    { id: 'buns', name: 'Two buns', price: 15 },
    { id: 'braid', name: 'Side braid', price: 15 },
    { id: 'lowtail', name: 'Low ponytail', price: 10 },
    { id: 'ponytail', name: 'High ponytail', price: 0 },
    { id: 'braids', name: 'Two braids', price: 15 },
  ];
  CAT.hairColor = [
    ['darkbrown', 'Dark brown', '#3b2a25', 0], ['black', 'Black', '#26232b', 0], ['brown', 'Brown', '#7a4e3a', 0],
    ['lightbrown', 'Light brown', '#b08a68', 0], ['blonde', 'Blond', '#efd48f', 0], ['auburn', 'Ginger', '#c4502e', 0],
    ['pink', 'Pink', '#f0a3bd', 25], ['blue', 'Navy', '#3b4f9a', 25], ['silver', 'Silver', '#d2d5df', 25],
  ].map(([id, name, color, price]) => ({ id, name, price, color }));
  CAT.top = [
    ['kimono', 'Kimono', 0], ['school', 'School uniform', 0], ['sporty', 'Tracksuit', 25], ['sundress', 'Summer dress', 25],
    ['sweaterskirt', 'Sweater & skirt', 30], ['raincoat', 'Raincoat', 30], ['pajamas', 'Pajamas', 30], ['oversized', 'Big black hoodie', 30],
    ['coat', 'Winter coat', 40], ['wintersweater', 'Sweater & scarf', 40], ['blazer', 'Smart blazer', 45], ['outdoor', 'White jacket', 50],
    ['haori', 'Haori', 60], ['ninja', 'Ninja outfit', 80],
  ].map(([id, name, price]) => ({ id, name, price }));
  // Hair accessories, drawn on top of the hair. `art` is the picture's name.
  CAT.head = [
    { id: 'none', name: 'None', price: 0 },
    { id: 'bow', name: 'Big bow', price: 20, art: 'bow' },
    { id: 'flower', name: 'Flower', price: 20, art: 'flower' },
    { id: 'kanzashi', name: 'Hair stick', price: 30, art: 'kanzashi' },
    { id: 'ears', name: 'Cat ears', price: 40, art: 'catears' },
    { id: 'headphones', name: 'Headphones', price: 60, art: 'headphones' },
    { id: 'crown', name: 'Crown', price: 100, art: 'crown' },
  ];
  CAT.face = [
    { id: 'none', name: 'None', price: 0 },
    { id: 'freckles', name: 'Freckles', price: 10, art: 'freckles' },
  ];
  CAT.pet = [
    { id: 'none', name: 'None', price: 0 },
    ...[['cat', '🐱', 40], ['dog', '🐶', 40], ['bunny', '🐰', 50], ['fox', '🦊', 50], ['panda', '🐼', 60], ['penguin', '🐧', 60], ['unicorn', '🦄', 100], ['dragon', '🐲', 120]]
      .map(([id, emoji, price]) => ({ id, name: id[0].toUpperCase() + id.slice(1), price, emoji })),
  ];
  const bgs = [
    ['paper', 'Paper', ['#dcd8d0', '#c8c3b8'], 0],
    ['lavender', 'Lavender', ['#efe7ff', '#d3c2ff'], 0],
    ['sky', 'Sky', ['#e1f4ff', '#9fd8ff'], 0],
    ['mint', 'Mint', ['#e3fff2', '#a0eccb'], 10],
    ['peach', 'Peach', ['#fff1e3', '#ffc7a0'], 10],
    ['candy', 'Candy', ['#ffd9ee', '#c9b6ff'], 25],
    ['sunset', 'Sunset', ['#ffd29e', '#ff8fb1'], 30],
    ['ocean', 'Ocean', ['#8be4ff', '#2e7fd6'], 30],
    ['night', 'Night sky', ['#2f2f7a', '#0f1035'], 50, true],
    ['galaxy', 'Galaxy', ['#5b2a9e', '#e0558a'], 70, true],
  ];
  CAT.bg = bgs.map(([id, name, stops, price, stars]) => ({ id, name, price, stops, stars: !!stars }));

  // Items that left the shop: if she bought one, she gets the coins back (see store.sanitize).
  V.REFUND = {
    'head:cap-red': 20, 'head:cap-blue': 20, 'head:beanie-yellow': 25, 'head:beanie-green': 25, 'head:party': 45,
    'top:tee-pink': 15, 'top:tee-yellow': 15, 'top:tee-green': 15, 'top:hoodie-gray': 30, 'top:hoodie-pink': 35,
    'top:hoodie-teal': 35, 'top:stripes-navy': 40, 'top:stripes-red': 40, 'top:denim': 60, 'top:overalls': 60, 'top:cape': 120,
    'hairColor:purple': 25, 'hairColor:mint': 25, 'hair:curly': 15,
    'eyes:wink': 10, 'eyes:sparkle': 20, 'mouth:cat': 10, 'mouth:open': 10,
    'face:round-glasses': 25, 'face:sunglasses': 30, 'face:heart-glasses': 45,
  };

  const get = (slot, id) => CAT[slot].find((x) => x.id === id) || CAT[slot][0];
  let counter = 0;

  V.CAT = CAT;
  V.item = get;
  V.valid = (slot, id) => !!CAT[slot] && CAT[slot].some((x) => x.id === id);
  V.SLOTS = Object.keys(CAT);

  V.defaults = () => ({
    cfg: { skin: 'skin0', hair: 'topknot', hairColor: 'darkbrown', top: 'kimono', head: 'none', face: 'none', pet: 'none', bg: 'paper' },
    owned: [],
  });

  // Item ids can repeat across slots ('none', 'cat'), so ownership is stored as "slot:id".
  V.key = (slot, item) => slot + ':' + item.id;
  V.has = (slot, item) => item.price === 0 || A.state.avatar.owned.includes(V.key(slot, item));
  V.boughtCount = () => A.state.avatar.owned.length;

  // ---- drawing --------------------------------------------------------------
  const url = (key) => 'img/avatar/' + key.replace(/:/g, '_') + '.webp';

  // The pictures that make up one look, from back to front.
  function layerKeys(cfg) {
    const s = 's' + get('skin', cfg.skin).id.slice(4);
    const hair = get('hair', cfg.hair).id;
    const color = get('hairColor', cfg.hairColor).id;
    const top = get('top', cfg.top).id;
    const head = get('head', cfg.head);
    const face = get('face', cfg.face);
    return [
      `hair:${hair}:back:${color}`, `outfit:${top}:${s}`, `head:${s}`,
      face.art ? 'acc:' + face.art : '', `hair:${hair}:front:${color}`, head.art ? 'acc:' + head.art : '',
    ].filter((k) => k && A.art.box[k]);
  }
  V.urls = (cfg) => layerKeys(cfg).map(url);

  function bgSvg(bg, uid) {
    const [a, b] = bg.stops;
    let s = `<defs><linearGradient id="${uid}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>` +
      `<rect width="${A.art.W}" height="${A.art.H}" fill="url(#${uid}g)"/>`;
    if (bg.stars) {
      for (const [x, y, r] of [[110, 140, 7], [330, 80, 5], [840, 120, 8], [990, 330, 6], [160, 440, 5], [960, 620, 6], [90, 760, 6], [1030, 900, 5], [510, 60, 6], [670, 190, 4], [130, 1180, 6], [990, 1250, 7], [60, 1000, 5], [1050, 560, 4]]) {
        s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".85"/>`;
      }
    }
    return s;
  }

  V.svg = (cfg, vb) => {
    const uid = 'a' + ++counter;
    const pet = get('pet', cfg.pet);
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb || `0 0 ${A.art.W} ${A.art.H}`}" aria-hidden="true">` +
      bgSvg(get('bg', cfg.bg), uid) +
      layerKeys(cfg).map((k) => {
        const b = A.art.box[k];
        return `<image href="${url(k)}" x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}"/>`;
      }).join('') +
      (pet.emoji ? `<text x="170" y="1500" font-size="250" text-anchor="middle">${pet.emoji}</text>` : '') +
      '</svg>'
    );
  };

  V.el = (cfg, vb) => U.html(V.svg(cfg, vb));

  // Which part of the picture to show when previewing one slot (canvas units: x y width height).
  V.VIEW = {
    hair: '215 0 690 760', hairColor: '215 0 690 760', head: '240 30 640 640', face: '350 330 420 330',
    skin: '330 190 460 460', top: '90 520 940 820', pet: '0 1230 460 322', bg: '0 0 1122 1552',
  };
  V.HEAD_VIEW = '265 40 590 590';
})(window.A);
