// The avatar: layered SVG, built only from the fixed catalogue below (never from user text).
(function (A) {
  'use strict';
  const U = A.util;
  const V = (A.avatar = {});

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = amt < 0 ? 0 : 255;
    const p = Math.abs(amt);
    const ch = (v) => Math.round((f - v) * p + v);
    const r = ch(n >> 16);
    const g = ch((n >> 8) & 255);
    const b = ch(n & 255);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  const INK = '#2b2233';
  const BODY = 'M36 222 C36 176 66 152 100 152 C134 152 164 176 164 222 Z';
  const HEAD_Y = 94;

  // ---- catalogue ----------------------------------------------------------
  const CAT = {};
  CAT.skin = ['#FFE0C7', '#F3C9A4', '#E3A977', '#C98B5B', '#9B6240', '#6B4226'].map((c, i) => ({
    id: 'skin' + i, name: 'Skin ' + (i + 1), price: 0, color: c,
  }));
  CAT.eyes = [
    { id: 'round', name: 'Round', price: 0 },
    { id: 'happy', name: 'Happy', price: 0 },
    { id: 'sleepy', name: 'Sleepy', price: 0 },
    { id: 'wink', name: 'Wink', price: 10 },
    { id: 'sparkle', name: 'Sparkle', price: 20 },
  ];
  CAT.mouth = [
    { id: 'smile', name: 'Smile', price: 0 },
    { id: 'grin', name: 'Grin', price: 0 },
    { id: 'cat', name: 'Cat', price: 10 },
    { id: 'open', name: 'Wow', price: 10 },
  ];
  CAT.hair = [
    { id: 'bob', name: 'Bob', price: 0 },
    { id: 'short', name: 'Short', price: 0 },
    { id: 'long', name: 'Long', price: 0 },
    { id: 'ponytail', name: 'Ponytail', price: 0 },
    { id: 'buns', name: 'Buns', price: 15 },
    { id: 'curly', name: 'Curly', price: 15 },
  ];
  CAT.hairColor = [
    ['black', '#2b2233', 0], ['brown', '#6a4128', 0], ['auburn', '#a5482a', 0], ['blonde', '#e9c46a', 0],
    ['pink', '#ff7eb6', 25], ['blue', '#4aa8ff', 25], ['purple', '#9b5de5', 25], ['mint', '#48d6a8', 25], ['silver', '#cfd3dd', 25],
  ].map(([id, color, price]) => ({ id, name: id[0].toUpperCase() + id.slice(1), price, color }));

  const tee = (id, name, color, price) => ({
    id, name, price, color,
    front: (c, sk) => `<path d="${BODY}" fill="${c}"/><path d="M84 153 Q100 174 116 153 Z" fill="${sk}"/>`,
  });
  const hoodie = (id, name, color, price) => ({
    id, name, price, color,
    back: (c) => `<path d="M58 162 C54 116 146 116 142 162 Z" fill="${shade(c, -0.18)}"/>`,
    front: (c, sk) =>
      `<path d="${BODY}" fill="${c}"/><path d="M82 153 Q100 178 118 153 Z" fill="${sk}"/>` +
      `<path d="M92 168 V192 M108 168 V192" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M66 204 L134 204 L140 222 L60 222 Z" fill="${shade(c, -0.14)}"/>`,
  });
  const stripes = (id, name, a, b, price) => ({
    id, name, price, color: a,
    front: (c, sk, uid) => {
      let bands = '';
      for (let y = 150, i = 0; y < 222; y += 12, i++) bands += `<rect x="30" y="${y}" width="140" height="12" fill="${i % 2 ? b : a}"/>`;
      return `<clipPath id="${uid}t"><path d="${BODY}"/></clipPath><g clip-path="url(#${uid}t)">${bands}</g><path d="M84 153 Q100 174 116 153 Z" fill="${sk}"/>`;
    },
  });
  CAT.top = [
    tee('tee-purple', 'Purple tee', '#7b4dff', 0),
    tee('tee-blue', 'Blue tee', '#37a8ff', 0),
    tee('tee-pink', 'Pink tee', '#ff6fb5', 15),
    tee('tee-yellow', 'Sunny tee', '#ffc531', 15),
    tee('tee-green', 'Green tee', '#34c77b', 15),
    hoodie('hoodie-gray', 'Gray hoodie', '#8d93a8', 30),
    hoodie('hoodie-pink', 'Pink hoodie', '#ff8ec7', 35),
    hoodie('hoodie-teal', 'Teal hoodie', '#2bb5a6', 35),
    stripes('stripes-navy', 'Navy stripes', '#2b3a8c', '#ffffff', 40),
    stripes('stripes-red', 'Red stripes', '#ff5964', '#ffffff', 40),
    {
      id: 'denim', name: 'Denim jacket', price: 60, color: '#4a78c2',
      front: (c, sk) =>
        `<path d="${BODY}" fill="${c}"/><path d="M84 153 Q100 176 116 153 L112 222 L88 222 Z" fill="#fff"/>` +
        `<path d="M84 153 L68 170 L90 172 Z M116 153 L132 170 L110 172 Z" fill="${shade(c, -0.2)}"/>` +
        `<path d="M88 172 V222 M112 172 V222" stroke="${shade(c, -0.25)}" stroke-width="2"/>`,
    },
    {
      id: 'overalls', name: 'Overalls', price: 60, color: '#3f6fb5',
      front: (c, sk) =>
        `<path d="${BODY}" fill="#ff8ec7"/><path d="M84 153 Q100 174 116 153 Z" fill="${sk}"/>` +
        `<path d="M62 222 L68 188 L132 188 L138 222 Z" fill="${c}"/>` +
        `<path d="M76 190 L84 158 M124 190 L116 158" stroke="${c}" stroke-width="10" stroke-linecap="round"/>` +
        `<circle cx="76" cy="190" r="4" fill="#ffc933"/><circle cx="124" cy="190" r="4" fill="#ffc933"/>`,
    },
    {
      id: 'cape', name: 'Hero cape', price: 120, color: '#e63946',
      back: (c) => `<path d="M46 162 C20 190 14 212 12 222 L188 222 C186 212 180 190 154 162 Z" fill="${c}"/>`,
      front: (c, sk) =>
        `<path d="${BODY}" fill="#ffc531"/><path d="M84 153 Q100 174 116 153 Z" fill="${sk}"/>` +
        `<polygon points="100,180 103.5,188.5 112.5,188.5 105.5,194 108,203 100,198 92,203 94.5,194 87.5,188.5 96.5,188.5" fill="${c}"/>`,
    },
  ];

  const cap = (id, name, color, price) => ({
    id, name, price, color,
    front: (c) =>
      `<path d="M53 82 C53 34 147 34 147 82 Z" fill="${c}"/>` +
      `<path d="M116 74 Q172 70 174 86 Q148 90 116 84 Z" fill="${shade(c, -0.2)}"/><circle cx="100" cy="39" r="4" fill="${shade(c, -0.2)}"/>`,
  });
  const beanie = (id, name, color, price) => ({
    id, name, price, color,
    front: (c) =>
      `<path d="M52 80 C50 26 150 26 148 80 Z" fill="${c}"/><rect x="48" y="70" width="104" height="18" rx="9" fill="${shade(c, -0.2)}"/>` +
      `<circle cx="100" cy="27" r="10" fill="#fff"/>`,
  });
  CAT.head = [
    { id: 'none', name: 'None', price: 0 },
    cap('cap-red', 'Red cap', '#ff5964', 20),
    cap('cap-blue', 'Blue cap', '#37a8ff', 20),
    beanie('beanie-yellow', 'Yellow beanie', '#ffc933', 25),
    beanie('beanie-green', 'Green beanie', '#34c77b', 25),
    {
      id: 'bow', name: 'Big bow', price: 20, color: '#ff6fb5',
      front: (c) =>
        `<path d="M132 52 L108 36 L108 68 Z M132 52 L158 36 L158 68 Z" fill="${c}"/><circle cx="132" cy="52" r="8" fill="${shade(c, -0.2)}"/>`,
    },
    {
      id: 'flower', name: 'Flower', price: 20, color: '#ff8ec7',
      front: (c) => {
        let p = '';
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          p += `<circle cx="${(126 + Math.cos(a) * 10).toFixed(1)}" cy="${(54 + Math.sin(a) * 10).toFixed(1)}" r="8" fill="${c}"/>`;
        }
        return p + '<circle cx="126" cy="54" r="6" fill="#ffc933"/>';
      },
    },
    {
      id: 'ears', name: 'Cat ears', price: 40, color: '#2b2233',
      front: (c) =>
        `<path d="M56 64 L60 20 L92 46 Z M144 64 L140 20 L108 46 Z" fill="${c}"/>` +
        `<path d="M65 52 L66 32 L82 46 Z M135 52 L134 32 L118 46 Z" fill="#ffb3c7"/>`,
    },
    {
      id: 'party', name: 'Party hat', price: 45, color: '#ff6fb5',
      front: (c) =>
        `<path d="M68 60 L100 4 L132 60 Z" fill="${c}"/><circle cx="92" cy="40" r="4" fill="#ffc933"/><circle cx="108" cy="30" r="4" fill="#37a8ff"/>` +
        `<circle cx="100" cy="5" r="7" fill="#ffc933"/>`,
    },
    {
      id: 'headphones', name: 'Headphones', price: 60, color: '#2b2233',
      front: (c) =>
        `<path d="M53 100 C49 18 151 18 147 100" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>` +
        `<rect x="40" y="84" width="19" height="36" rx="9" fill="#7b4dff"/><rect x="141" y="84" width="19" height="36" rx="9" fill="#7b4dff"/>`,
    },
    {
      id: 'crown', name: 'Crown', price: 100, color: '#ffd23f',
      front: (c) =>
        `<path d="M62 58 L68 24 L86 44 L100 16 L114 44 L132 24 L138 58 Z" fill="${c}" stroke="#e6a700" stroke-width="2" stroke-linejoin="round"/>` +
        `<circle cx="100" cy="40" r="4" fill="#ff5964"/><circle cx="76" cy="46" r="3" fill="#37a8ff"/><circle cx="124" cy="46" r="3" fill="#37a8ff"/>`,
    },
  ];

  CAT.face = [
    { id: 'none', name: 'None', price: 0 },
    {
      id: 'freckles', name: 'Freckles', price: 10,
      front: () => `<g fill="#b9703f" opacity=".7"><circle cx="70" cy="106" r="1.8"/><circle cx="76" cy="111" r="1.8"/><circle cx="82" cy="106" r="1.8"/><circle cx="130" cy="106" r="1.8"/><circle cx="124" cy="111" r="1.8"/><circle cx="118" cy="106" r="1.8"/></g>`,
    },
    {
      id: 'round-glasses', name: 'Round glasses', price: 25,
      front: () =>
        `<g fill="#fff" fill-opacity=".25" stroke="${INK}" stroke-width="3"><circle cx="82" cy="96" r="15"/><circle cx="118" cy="96" r="15"/></g>` +
        `<path d="M97 95 H103 M67 93 L56 89 M133 93 L144 89" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
    },
    {
      id: 'sunglasses', name: 'Sunglasses', price: 30,
      front: () =>
        `<path d="M62 86 H97 V100 C97 109 89 113 80 113 C69 113 62 107 62 100 Z M103 86 H138 V100 C138 107 131 113 120 113 C111 113 103 109 103 100 Z" fill="#1d1a2b"/>` +
        `<path d="M96 90 H104" stroke="#1d1a2b" stroke-width="3"/><path d="M70 92 L78 90" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>`,
    },
    {
      id: 'heart-glasses', name: 'Heart glasses', price: 45,
      front: () => {
        const heart = (x) => `<path d="M${x} 111 C${x - 17} 99 ${x - 17} 86 ${x - 6} 86 C${x - 2} 86 ${x} 89 ${x} 91 C${x} 89 ${x + 2} 86 ${x + 6} 86 C${x + 17} 86 ${x + 17} 99 ${x} 111 Z" fill="#ff5a8a" fill-opacity=".85" stroke="#d63a6c" stroke-width="2"/>`;
        return heart(82) + heart(118) + `<path d="M96 94 H104" stroke="#d63a6c" stroke-width="3"/>`;
      },
    },
  ];

  CAT.pet = [
    { id: 'none', name: 'None', price: 0 },
    ...[['cat', '🐱', 40], ['dog', '🐶', 40], ['bunny', '🐰', 50], ['fox', '🦊', 50], ['panda', '🐼', 60], ['penguin', '🐧', 60], ['unicorn', '🦄', 100], ['dragon', '🐲', 120]]
      .map(([id, emoji, price]) => ({ id, name: id[0].toUpperCase() + id.slice(1), price, emoji })),
  ];

  const bgs = [
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

  // ---- drawing --------------------------------------------------------------
  const HAIR_FRONT_SHORT = (c) =>
    `<path d="M53 96 C44 52 70 34 100 34 C130 34 156 52 147 96 C143 80 134 68 120 62 C108 72 88 74 76 64 C64 72 56 84 53 96 Z" fill="${c}"/>`;
  const HAIR_FRONT_BOB = (c) =>
    `<path d="M52 94 C48 54 74 38 100 38 C126 38 152 54 148 94 C142 74 128 62 112 58 C100 70 76 74 64 70 C58 76 54 84 52 94 Z" fill="${c}"/>`;
  const HAIR = {
    short: { back: () => '', front: HAIR_FRONT_SHORT },
    bob: {
      back: (c) => `<path d="M46 98 C40 48 68 30 100 30 C132 30 160 48 154 98 L156 138 C156 148 146 152 138 146 L62 146 C54 152 44 148 44 138 Z" fill="${c}"/>`,
      front: HAIR_FRONT_BOB,
    },
    long: {
      back: (c) => `<path d="M44 98 C38 44 68 28 100 28 C132 28 162 44 156 98 L166 172 C150 184 50 184 34 172 Z" fill="${c}"/>`,
      front: HAIR_FRONT_BOB,
    },
    ponytail: {
      back: (c) => `<path d="M138 66 C178 58 196 106 170 144 C170 120 160 106 142 100 Z" fill="${c}"/>`,
      front: (c) => HAIR_FRONT_SHORT(c) + `<circle cx="142" cy="72" r="5" fill="#ff6fb5"/>`,
    },
    buns: {
      back: (c) => `<circle cx="62" cy="42" r="16" fill="${c}"/><circle cx="138" cy="42" r="16" fill="${c}"/>`,
      front: HAIR_FRONT_SHORT,
    },
    curly: {
      back: (c) => [[54, 74], [68, 48], [100, 38], [132, 48], [146, 74], [50, 102], [150, 102]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="${c}"/>`).join(''),
      front: (c) =>
        `<path d="M54 90 C50 54 74 40 100 40 C126 40 150 54 146 90 C140 70 122 62 100 62 C78 62 60 70 54 90 Z" fill="${c}"/>` +
        [[72, 62], [90, 56], [110, 56], [128, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="${c}"/>`).join(''),
    },
  };

  const EYES = {
    round: (x) => `<circle cx="${x}" cy="96" r="6" fill="${INK}"/><circle cx="${x + 2}" cy="94" r="2" fill="#fff"/>`,
    happy: (x) => `<path d="M${x - 7} 100 Q${x} 88 ${x + 7} 100" stroke="${INK}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`,
    sleepy: (x) => `<path d="M${x - 7} 96 Q${x} 102 ${x + 7} 96" stroke="${INK}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`,
    sparkle: (x) => `<path d="M${x} 87 L${x + 3} 93 L${x + 9} 96 L${x + 3} 99 L${x} 105 L${x - 3} 99 L${x - 9} 96 L${x - 3} 93 Z" fill="${INK}"/><circle cx="${x + 2}" cy="93" r="1.6" fill="#fff"/>`,
  };
  const MOUTH = {
    smile: `<path d="M88 115 Q100 128 112 115" stroke="${INK}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`,
    grin: `<path d="M86 113 Q100 136 114 113 Z" fill="#7a2e3a"/><path d="M88 113 H112 Q100 121 88 113 Z" fill="#fff"/>`,
    cat: `<path d="M89 116 Q94.5 124 100 116 Q105.5 124 111 116" stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    open: `<ellipse cx="100" cy="120" rx="5.5" ry="7" fill="#7a2e3a"/>`,
  };

  function bgSvg(bg, uid) {
    const [a, b] = bg.stops;
    let s = `<defs><linearGradient id="${uid}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>` +
      `<rect width="200" height="222" fill="url(#${uid}g)"/>`;
    if (bg.stars) {
      for (const [x, y, r] of [[22, 24, 1.8], [60, 14, 1.2], [150, 22, 2], [178, 52, 1.4], [30, 70, 1.2], [172, 100, 1.6], [16, 120, 1.6], [186, 150, 1.2], [92, 10, 1.4], [120, 30, 1]]) {
        s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".85"/>`;
      }
    }
    return s;
  }

  const get = (slot, id) => CAT[slot].find((x) => x.id === id) || CAT[slot][0];
  let counter = 0;

  V.CAT = CAT;
  V.item = get;
  V.valid = (slot, id) => !!CAT[slot] && CAT[slot].some((x) => x.id === id);
  V.SLOTS = Object.keys(CAT);

  V.defaults = () => ({
    cfg: { skin: 'skin1', eyes: 'round', mouth: 'smile', hair: 'bob', hairColor: 'brown', top: 'tee-purple', head: 'none', face: 'none', pet: 'none', bg: 'lavender' },
    owned: [],
  });

  // Item ids can repeat across slots ('none', 'cat'), so ownership is stored as "slot:id".
  V.key = (slot, item) => slot + ':' + item.id;
  V.has = (slot, item) => item.price === 0 || A.state.avatar.owned.includes(V.key(slot, item));
  V.boughtCount = () => A.state.avatar.owned.length;

  V.svg = (cfg, vb) => {
    const uid = 'a' + ++counter;
    const skin = get('skin', cfg.skin).color;
    const skinD = shade(skin, -0.1);
    const hairC = get('hairColor', cfg.hairColor).color;
    const hair = HAIR[get('hair', cfg.hair).id];
    const top = get('top', cfg.top);
    const head = get('head', cfg.head);
    const face = get('face', cfg.face);
    const pet = get('pet', cfg.pet);
    const bg = get('bg', cfg.bg);
    const eyes = EYES[get('eyes', cfg.eyes).id];
    const mouth = MOUTH[get('mouth', cfg.mouth).id];
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb || '0 0 200 222'}" aria-hidden="true">` +
      bgSvg(bg, uid) +
      (top.back ? top.back(top.color, skinD, uid) : '') +
      hair.back(hairC) +
      `<rect x="88" y="124" width="24" height="34" rx="8" fill="${skinD}"/>` +
      top.front(top.color, skinD, uid) +
      `<circle cx="54" cy="${HEAD_Y + 4}" r="9" fill="${skin}"/><circle cx="146" cy="${HEAD_Y + 4}" r="9" fill="${skin}"/>` +
      `<ellipse cx="100" cy="${HEAD_Y}" rx="46" ry="48" fill="${skin}"/>` +
      `<circle cx="68" cy="110" r="7" fill="#ff7a93" opacity=".3"/><circle cx="132" cy="110" r="7" fill="#ff7a93" opacity=".3"/>` +
      eyes(82) + eyes(118) +
      `<path d="M98 106 Q100 109 102 106" stroke="${skinD}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
      mouth +
      (face.front ? face.front() : '') +
      hair.front(hairC) +
      (head.front ? head.front(head.color) : '') +
      (pet.emoji ? `<text x="30" y="208" font-size="44" text-anchor="middle">${pet.emoji}</text>` : '') +
      '</svg>'
    );
  };

  V.el = (cfg, vb) => U.html(V.svg(cfg, vb));

  // Which part of the picture to show when previewing one slot.
  V.VIEW = {
    hair: '30 10 140 140', hairColor: '30 10 140 140', head: '30 6 140 140', face: '30 30 140 140',
    eyes: '30 30 140 140', mouth: '30 30 140 140', skin: '30 30 140 140',
    top: '30 82 140 140', pet: '0 150 100 72', bg: '0 0 200 222',
  };
  V.HEAD_VIEW = '30 6 140 150';
})(window.A);
