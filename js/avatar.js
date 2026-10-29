// The avatar: layered SVG in an anime style, built only from the fixed catalogue below (never from user text).
// Canvas is 200 x 250: head and shoulders at the top, arms and hands at the sides, waist at the bottom.
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
  // thin darker outline, the "line art" of the anime look
  const ln = (c, w = 1.4) => `stroke="${shade(c, -0.4)}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

  const TORSO = 'M91 151 C78 152 64 155 61 166 L56 238 L144 238 L139 166 C136 155 122 152 109 151 Q100 160 91 151 Z';
  const FACE = 'M57 82 C57 52 76 36 100 36 C124 36 143 52 143 82 C143 106 130 126 114 135 Q100 143 86 135 C70 126 57 106 57 82 Z';

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
  // big anime eyes get an iris colour that goes with the hair
  const IRIS = {
    black: '#5b6bd8', brown: '#a8672f', auburn: '#2f9a6a', blonde: '#3c8de0', pink: '#d6458f',
    blue: '#2f7fe0', purple: '#8a4de0', mint: '#1fa88a', silver: '#6a7ad0',
  };

  // sleeves: t = how far down the arm the sleeve reaches (0 = shoulder, 1 = wrist)
  const tee = (id, name, color, price) => ({
    id, name, price, color, sleeve: { t: 0.36 },
    front: (c, sk) =>
      `<path d="${TORSO}" fill="${c}" ${ln(c)}/>` +
      `<path d="M86 151 Q100 172 114 151 Z" fill="${sk}" ${ln(sk, 1)}/>` +
      `<path d="M72 204 Q76 214 73 226 M128 204 Q124 214 127 226 M96 200 Q100 212 99 232" fill="none" stroke="${shade(c, -0.16)}" stroke-width="1.8" stroke-linecap="round"/>` +
      `<path d="M58 230 H142" stroke="${shade(c, -0.2)}" stroke-width="2"/>`,
  });
  const hoodie = (id, name, color, price) => ({
    id, name, price, color, sleeve: { t: 0.92, cuff: shade(color, -0.16) },
    back: (c) => `<path d="M60 170 C54 126 146 126 140 170 Z" fill="${shade(c, -0.2)}" ${ln(c)}/>`,
    front: (c, sk) =>
      `<path d="${TORSO}" fill="${c}" ${ln(c)}/>` +
      `<path d="M88 151 Q100 166 112 151 Z" fill="${sk}" ${ln(sk, 1)}/>` +
      `<path d="M91 153 Q96 160 100 163 Q104 160 109 153 L112 155 Q100 172 88 155 Z" fill="${shade(c, -0.12)}"/>` +
      `<path d="M94 163 V190 M106 163 V190" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>` +
      `<circle cx="94" cy="191" r="2.4" fill="#fff"/><circle cx="106" cy="191" r="2.4" fill="#fff"/>` +
      `<path d="M72 206 L128 206 L134 234 L66 234 Z" fill="${shade(c, -0.1)}" ${ln(c, 1.2)}/>` +
      `<path d="M62 232 H138 V238 H62 Z" fill="${shade(c, -0.18)}"/>`,
  });
  const stripes = (id, name, a, b, price) => ({
    id, name, price, color: a, sleeve: { t: 0.38, color: a, band: b },
    front: (c, sk, uid) => {
      let bands = '';
      for (let y = 150, i = 0; y < 240; y += 11, i++) bands += `<rect x="40" y="${y}" width="120" height="11" fill="${i % 2 ? b : a}"/>`;
      return `<clipPath id="${uid}t"><path d="${TORSO}"/></clipPath><g clip-path="url(#${uid}t)">${bands}</g>` +
        `<path d="${TORSO}" fill="none" ${ln(a)}/>` +
        `<path d="M86 151 Q100 172 114 151 Z" fill="${sk}" ${ln(sk, 1)}/>`;
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
      id: 'denim', name: 'Denim jacket', price: 60, color: '#4a78c2', sleeve: { t: 0.92, cuff: '#37609f' },
      front: (c, sk) =>
        `<path d="${TORSO}" fill="#fff" ${ln('#ffffff')}/>` +
        `<path d="M86 151 Q100 172 114 151 Z" fill="${sk}" ${ln(sk, 1)}/>` +
        `<path d="M91 151 C78 152 64 155 61 166 L56 238 L90 238 L86 178 Z" fill="${c}" ${ln(c)}/>` +
        `<path d="M109 151 C122 152 136 155 139 166 L144 238 L110 238 L114 178 Z" fill="${c}" ${ln(c)}/>` +
        `<path d="M91 151 L68 168 L88 180 Z M109 151 L132 168 L112 180 Z" fill="${shade(c, -0.16)}" ${ln(c, 1.2)}/>` +
        `<rect x="66" y="198" width="16" height="14" rx="2" fill="none" stroke="${shade(c, -0.3)}" stroke-width="1.4" stroke-dasharray="3 2"/>` +
        `<rect x="118" y="198" width="16" height="14" rx="2" fill="none" stroke="${shade(c, -0.3)}" stroke-width="1.4" stroke-dasharray="3 2"/>` +
        `<path d="M74 186 V232 M126 186 V232" stroke="${shade(c, -0.3)}" stroke-width="1.2" stroke-dasharray="3 2"/>` +
        `<circle cx="74" cy="198" r="0" fill="none"/><circle cx="87" cy="190" r="2.2" fill="#ffd23f"/><circle cx="113" cy="190" r="2.2" fill="#ffd23f"/>`,
    },
    {
      id: 'overalls', name: 'Overalls', price: 60, color: '#3f6fb5', sleeve: { t: 0.36, color: '#ff8ec7' },
      front: (c, sk) =>
        `<path d="${TORSO}" fill="#ff8ec7" ${ln('#ff8ec7')}/>` +
        `<path d="M86 151 Q100 172 114 151 Z" fill="${sk}" ${ln(sk, 1)}/>` +
        `<path d="M76 192 L124 192 L128 238 L72 238 Z" fill="${c}" ${ln(c)}/>` +
        `<path d="M56 232 H144 V238 H56 Z" fill="${c}"/>` +
        `<path d="M78 194 L84 158 M122 194 L116 158" stroke="${c}" stroke-width="9" stroke-linecap="round"/>` +
        `<rect x="88" y="203" width="24" height="15" rx="3" fill="${shade(c, -0.14)}" ${ln(c, 1.2)}/>` +
        `<circle cx="80" cy="193" r="3.6" fill="#ffc933"/><circle cx="120" cy="193" r="3.6" fill="#ffc933"/>`,
    },
    {
      id: 'cape', name: 'Hero cape', price: 120, color: '#e63946', sleeve: { t: 0.36, color: '#ffc531' },
      back: (c) =>
        `<path d="M60 160 C32 192 22 224 16 250 L184 250 C178 224 168 192 140 160 Z" fill="${c}" ${ln(c)}/>` +
        `<path d="M62 168 C48 196 40 226 38 250 L162 250 C160 226 152 196 138 168 Z" fill="${shade(c, -0.22)}"/>`,
      front: (c, sk) =>
        `<path d="${TORSO}" fill="#ffc531" ${ln('#ffc531')}/>` +
        `<path d="M86 151 Q100 172 114 151 Z" fill="${sk}" ${ln(sk, 1)}/>` +
        `<polygon points="100,184 104,194 115,194 106,201 109,212 100,205.5 91,212 94,201 85,194 96,194" fill="${c}" ${ln(c, 1)}/>` +
        `<path d="M82 158 Q100 170 118 158" fill="none" stroke="#e6a700" stroke-width="2.4"/>` +
        `<circle cx="82" cy="158" r="4.4" fill="#ffd23f" stroke="#e6a700" stroke-width="1.4"/><circle cx="118" cy="158" r="4.4" fill="#ffd23f" stroke="#e6a700" stroke-width="1.4"/>`,
    },
  ];

  // Hats follow the shape of the head: the band curves round the forehead (lower in the middle) and the hair stays visible below it.
  const cap = (id, name, color, price) => ({
    id, name, price, color,
    front: (c) =>
      `<path d="M46 74 C42 -2 158 -2 154 74 Q100 85 46 74 Z" fill="${c}" ${ln(c)}/>` +
      `<path d="M100 8 C88 30 85 54 90 80 M100 8 C112 30 115 54 110 80" fill="none" stroke="${shade(c, -0.22)}" stroke-width="1.4"/>` +
      `<path d="M58 62 C60 40 76 22 100 18" fill="none" stroke="${shade(c, 0.35)}" stroke-width="3.2" stroke-linecap="round" opacity=".6"/>` +
      `<circle cx="100" cy="9" r="4.6" fill="${shade(c, -0.2)}" ${ln(c, 1.2)}/>` +
      `<path d="M52 75 Q100 88 148 75 Q150 85 100 91 Q50 85 52 75 Z" fill="${shade(c, -0.2)}" ${ln(c)}/>` +
      `<path d="M62 79 Q100 90 138 79" fill="none" stroke="${shade(c, -0.4)}" stroke-width="1" opacity=".5"/>`,
  });
  const beanie = (id, name, color, price) => ({
    id, name, price, color,
    front: (c) => {
      let ribs = '';
      for (const x of [70, 82, 94, 106, 118, 130]) ribs += `M${x} ${20 + Math.abs(x - 100) * 0.5} Q${x + (x - 100) * 0.1} 44 ${x + (x - 100) * 0.12} 68 `;
      return (
        `<path d="M48 74 C42 0 158 0 152 74 Z" fill="${c}" ${ln(c)}/>` +
        `<path d="${ribs}" fill="none" stroke="${shade(c, -0.14)}" stroke-width="1.6" stroke-linecap="round"/>` +
        `<path d="M44 66 Q100 80 156 66 L158 84 Q100 98 42 84 Z" fill="${shade(c, -0.12)}" ${ln(c)}/>` +
        `<path d="M54 73 Q58 82 56 88 M70 76 Q72 85 71 91 M86 78 Q87 86 87 93 M102 78 V93 M118 78 Q117 86 117 93 M134 76 Q132 85 133 91 M148 73 Q144 82 146 88" fill="none" stroke="${shade(c, -0.3)}" stroke-width="1.2" opacity=".55"/>` +
        `<g fill="#fff" ${ln('#ffffff', 1)} stroke="#d9d4ea"><circle cx="100" cy="14" r="9"/><circle cx="91" cy="18" r="6"/><circle cx="109" cy="18" r="6"/><circle cx="100" cy="9" r="6.5"/></g>`
      );
    },
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
        `<path d="M134 46 C122 26 106 34 108 46 C108 58 124 64 134 46 Z M134 46 C146 26 162 34 160 46 C160 58 144 64 134 46 Z" fill="${c}" ${ln(c)}/>` +
        `<path d="M134 46 L122 70 L131 66 L136 76 Z M134 46 L148 70 L139 66 L136 76 Z" fill="${shade(c, -0.12)}" ${ln(c, 1.2)}/>` +
        `<path d="M116 40 C114 46 116 50 120 52 M152 40 C154 46 152 50 148 52" fill="none" stroke="${shade(c, -0.2)}" stroke-width="1.4"/>` +
        `<circle cx="134" cy="46" r="7" fill="${shade(c, -0.18)}" ${ln(c, 1.2)}/>`,
    },
    {
      id: 'flower', name: 'Flower', price: 20, color: '#ff8ec7',
      front: (c) => {
        let p = '';
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          p += `<ellipse cx="${(130 + Math.cos(a) * 10).toFixed(1)}" cy="${(46 + Math.sin(a) * 10).toFixed(1)}" rx="8" ry="7" fill="${c}" ${ln(c, 1.2)}/>`;
        }
        return `<path d="M118 62 Q106 70 98 66 Q106 58 118 62 Z" fill="#48c78e" ${ln('#48c78e', 1.2)}/>` + p + '<circle cx="130" cy="46" r="6.4" fill="#ffd23f" stroke="#e6a700" stroke-width="1.2"/>';
      },
    },
    {
      id: 'ears', name: 'Cat ears', price: 40, color: '#2b2233',
      front: (c) =>
        `<path d="M56 54 Q100 -12 144 54" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M50 58 L52 2 L92 32 Z M150 58 L148 2 L108 32 Z" fill="${c}" ${ln('#7b6a96', 1.2)}/>` +
        `<path d="M58 48 L58 16 L82 33 Z M142 48 L142 16 L118 33 Z" fill="#ffb3c7"/>`,
    },
    {
      id: 'party', name: 'Party hat', price: 45, color: '#ff6fb5',
      front: (c) =>
        `<path d="M68 58 L106 2 L136 50 Q102 66 68 58 Z" fill="${c}" ${ln(c)}/>` +
        `<path d="M80 40 L121 30 M74 52 L130 42" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>` +
        `<circle cx="96" cy="24" r="3" fill="#ffc933"/><circle cx="112" cy="46" r="3" fill="#37a8ff"/><circle cx="90" cy="48" r="3" fill="#ffc933"/>` +
        `<path d="M68 58 Q102 70 136 50" fill="none" stroke="${shade(c, -0.25)}" stroke-width="3.4" stroke-linecap="round"/>` +
        `<g fill="#ffc933" ${ln('#ffc933', 1)}><circle cx="106" cy="4" r="7"/></g>`,
    },
    {
      id: 'headphones', name: 'Headphones', price: 60, color: '#2b2233',
      front: (c) =>
        `<path d="M52 100 C44 24 156 24 148 100" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/>` +
        `<path d="M52 100 C44 24 156 24 148 100" fill="none" stroke="#7b4dff" stroke-width="2" stroke-linecap="round" opacity=".7"/>` +
        `<rect x="38" y="84" width="22" height="38" rx="10" fill="#7b4dff" ${ln('#7b4dff')}/><rect x="140" y="84" width="22" height="38" rx="10" fill="#7b4dff" ${ln('#7b4dff')}/>` +
        `<rect x="43" y="92" width="12" height="22" rx="6" fill="${shade('#7b4dff', -0.25)}"/><rect x="145" y="92" width="12" height="22" rx="6" fill="${shade('#7b4dff', -0.25)}"/>` +
        `<path d="M44 90 Q46 86 50 86" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>`,
    },
    {
      id: 'crown', name: 'Crown', price: 100, color: '#ffd23f',
      front: (c) =>
        `<g transform="translate(0 -9)">` +
        `<path d="M60 62 L62 24 L82 44 L100 14 L118 44 L138 24 L140 62 Q100 74 60 62 Z" fill="${c}" stroke="#d99a00" stroke-width="2" stroke-linejoin="round"/>` +
        `<path d="M62 56 Q100 68 138 56" fill="none" stroke="#e6a700" stroke-width="2"/>` +
        `<circle cx="100" cy="46" r="4.4" fill="#ff5964" stroke="#a82a35" stroke-width="1"/><circle cx="78" cy="55" r="3.2" fill="#37a8ff"/><circle cx="122" cy="55" r="3.2" fill="#37a8ff"/>` +
        `<circle cx="62" cy="22" r="3.4" fill="#fff" stroke="#d99a00" stroke-width="1.2"/><circle cx="100" cy="12" r="3.6" fill="#fff" stroke="#d99a00" stroke-width="1.2"/><circle cx="138" cy="22" r="3.4" fill="#fff" stroke="#d99a00" stroke-width="1.2"/></g>`,
    },
  ];

  CAT.face = [
    { id: 'none', name: 'None', price: 0 },
    {
      id: 'freckles', name: 'Freckles', price: 10,
      front: () => `<g fill="#b9703f" opacity=".7"><circle cx="70" cy="111" r="1.7"/><circle cx="76" cy="115" r="1.7"/><circle cx="82" cy="111" r="1.7"/><circle cx="130" cy="111" r="1.7"/><circle cx="124" cy="115" r="1.7"/><circle cx="118" cy="111" r="1.7"/></g>`,
    },
    {
      id: 'round-glasses', name: 'Round glasses', price: 25,
      front: () =>
        `<g fill="#fff" fill-opacity=".2" stroke="${INK}" stroke-width="2.6"><circle cx="80" cy="98" r="17"/><circle cx="120" cy="98" r="17"/></g>` +
        `<path d="M97 96 Q100 93 103 96 M63 93 L55 89 M137 93 L145 89" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>` +
        `<path d="M68 90 Q72 85 78 84" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`,
    },
    {
      id: 'sunglasses', name: 'Sunglasses', price: 30,
      front: () =>
        `<path d="M62 88 H97 V102 C97 111 89 115 80 115 C69 115 62 109 62 102 Z M103 88 H138 V102 C138 109 131 115 120 115 C111 115 103 111 103 102 Z" fill="#1d1a2b"/>` +
        `<path d="M96 92 H104 M62 90 L54 88 M138 90 L146 88" stroke="#1d1a2b" stroke-width="3" stroke-linecap="round"/><path d="M69 94 L77 92 M111 94 L119 92" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>`,
    },
    {
      id: 'heart-glasses', name: 'Heart glasses', price: 45,
      front: () => {
        const heart = (x) => `<path d="M${x} 114 C${x - 18} 101 ${x - 18} 87 ${x - 6} 87 C${x - 2} 87 ${x} 90 ${x} 92 C${x} 90 ${x + 2} 87 ${x + 6} 87 C${x + 18} 87 ${x + 18} 101 ${x} 114 Z" fill="#ff5a8a" fill-opacity=".8" stroke="#d63a6c" stroke-width="2"/>`;
        return heart(80) + heart(120) + `<path d="M96 96 H104 M60 94 L54 90 M140 94 L146 90" stroke="#d63a6c" stroke-width="2.6" stroke-linecap="round"/>`;
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
  // Hair: `back` sits behind the body, `mid` hangs in front of the shoulders, `front` is the fringe over the face.
  // h = { fill, hi, lo, line } colours for this hair colour.
  const FRINGE = (h) =>
    `<path d="M51 104 C42 52 66 18 100 18 C134 18 158 52 149 104 C148 88 145 74 139 62 C136 70 128 76 118 76 C116 70 108 62 101 53 C99 64 90 74 82 76 C72 74 64 70 60 62 C55 74 52 90 51 104 Z" fill="${h.fill}" stroke="${h.line}" stroke-width="1.4" stroke-linejoin="round"/>` +
    `<path d="M101 53 C106 38 112 28 120 24 M82 76 C86 62 92 50 98 40 M118 76 C124 66 132 56 138 50 M60 62 C64 46 72 34 84 26" fill="none" stroke="${h.lo}" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>` +
    `<path d="M62 46 C72 28 94 22 114 26" fill="none" stroke="${h.hi}" stroke-width="5" stroke-linecap="round" opacity=".55"/>`;
  const SIDELOCKS = (h, len) =>
    `<path d="M52 98 C47 116 48 ${len} 55 ${len + 8} C63 ${len - 6} 62 112 60 92 Z M148 98 C153 116 152 ${len} 145 ${len + 8} C137 ${len - 6} 138 112 140 92 Z" fill="${h.fill}" stroke="${h.line}" stroke-width="1.3" stroke-linejoin="round"/>`;
  const SHORT_BACK = (h) =>
    `<path d="M49 104 C38 50 66 14 100 14 C134 14 162 50 151 104 C146 78 130 60 100 60 C70 60 54 78 49 104 Z" fill="${h.fill}" stroke="${h.line}" stroke-width="1.3"/>`;

  const HAIR = {
    short: {
      back: SHORT_BACK, mid: () => '',
      front: (h) => FRINGE(h) + SIDELOCKS(h, 112),
    },
    bob: {
      back: (h) =>
        `<path d="M43 104 C36 48 66 14 100 14 C134 14 164 48 157 104 L159 138 C160 150 148 156 138 150 L62 150 C52 156 40 150 41 138 Z" fill="${h.fill}" stroke="${h.line}" stroke-width="1.4" stroke-linejoin="round"/>`,
      mid: () => '',
      front: (h) => FRINGE(h) + SIDELOCKS(h, 132),
    },
    long: {
      back: (h) =>
        `<path d="M43 104 C36 48 66 14 100 14 C134 14 164 48 157 104 L168 190 C170 214 162 232 152 240 C142 226 120 232 100 238 C80 232 58 226 48 240 C38 232 30 214 32 190 Z" fill="${h.fill}" stroke="${h.line}" stroke-width="1.4" stroke-linejoin="round"/>` +
        `<path d="M54 140 C52 176 50 204 52 226 M146 140 C148 176 150 204 148 226 M100 150 V232" fill="none" stroke="${h.lo}" stroke-width="1.5" stroke-linecap="round" opacity=".4"/>`,
      mid: (h) =>
        `<path d="M52 110 C46 140 44 170 50 200 C60 190 66 160 62 120 Z M148 110 C154 140 156 170 150 200 C140 190 134 160 138 120 Z" fill="${h.fill}" stroke="${h.line}" stroke-width="1.3" stroke-linejoin="round"/>`,
      front: (h) => FRINGE(h),
    },
    ponytail: {
      back: (h) =>
        SHORT_BACK(h) +
        `<path d="M140 46 C180 40 202 86 190 132 C186 156 172 174 158 182 C166 154 166 132 160 112 C156 92 150 76 140 64 Z" fill="${h.fill}" stroke="${h.line}" stroke-width="1.4" stroke-linejoin="round"/>` +
        `<path d="M156 66 C176 84 180 118 170 156" fill="none" stroke="${h.hi}" stroke-width="3.4" stroke-linecap="round" opacity=".5"/>`,
      mid: () => '',
      front: (h) => FRINGE(h) + SIDELOCKS(h, 118) + `<ellipse cx="143" cy="54" rx="6" ry="9" transform="rotate(-20 143 54)" fill="#ff6fb5" stroke="#c43a82" stroke-width="1.2"/><path d="M141 48 Q140 54 142 58" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`,
    },
    buns: {
      back: (h) =>
        SHORT_BACK(h) +
        [62, 138].map((x) => `<circle cx="${x}" cy="30" r="17" fill="${h.fill}" stroke="${h.line}" stroke-width="1.4"/><path d="M${x - 8} 24 Q${x} 18 ${x + 8} 26 M${x - 9} 34 Q${x} 28 ${x + 9} 36" fill="none" stroke="${h.lo}" stroke-width="1.4" stroke-linecap="round" opacity=".6"/>`).join(''),
      mid: () => '',
      front: (h) =>
        FRINGE(h) + SIDELOCKS(h, 120) +
        [76, 124].map((x) => `<ellipse cx="${x}" cy="40" rx="5.4" ry="3.4" fill="#ff6fb5" stroke="#c43a82" stroke-width="1.1"/>`).join(''),
    },
    curly: {
      back: (h) =>
        [[48, 74], [54, 46], [78, 28], [100, 22], [122, 28], [146, 46], [152, 74], [46, 102], [154, 102], [50, 128], [150, 128]]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="19" fill="${h.fill}" stroke="${h.line}" stroke-width="1.3"/>`).join('') +
        `<ellipse cx="100" cy="74" rx="50" ry="52" fill="${h.fill}"/>`,
      mid: () => '',
      front: (h) =>
        FRINGE(h) + SIDELOCKS(h, 118) +
        [[57, 128], [143, 128], [66, 40], [134, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="${h.fill}" stroke="${h.line}" stroke-width="1.2"/>`).join(''),
    },
  };

  // eyes: x = centre, s = -1 for the left eye and +1 for the right (the outer corner gets a little flick)
  const bigEye = (x, s, uid, sparkle) =>
    `<ellipse cx="${x}" cy="99" rx="12.4" ry="14.6" fill="#fff"/>` +
    `<ellipse cx="${x}" cy="101" rx="9.8" ry="12.6" fill="url(#${uid}i)"/>` +
    `<ellipse cx="${x}" cy="102" rx="4.6" ry="6.8" fill="#1b1530"/>` +
    `<path d="M${x - 13.4} 100 C${x - 13.4} 82 ${x + 13.4} 82 ${x + 13.4} 100 C${x + 9} 91 ${x - 9} 91 ${x - 13.4} 100 Z" fill="${INK}"/>` +
    `<path d="M${x + s * 12.6} 97 Q${x + s * 16} 93 ${x + s * 17} 87.5" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
    `<path d="M${x - 8} 113.4 Q${x} 116.6 ${x + 8} 113.4" stroke="${INK}" stroke-width="1" fill="none" opacity=".45"/>` +
    (sparkle
      ? `<path d="M${x - 4} 90 L${x - 2.6} 94 L${x + 1} 95.4 L${x - 2.6} 96.8 L${x - 4} 101 L${x - 5.4} 96.8 L${x - 9} 95.4 L${x - 5.4} 94 Z" fill="#fff"/>` +
        `<path d="M${x + 5} 103 L${x + 5.8} 105.2 L${x + 8} 106 L${x + 5.8} 106.8 L${x + 5} 109 L${x + 4.2} 106.8 L${x + 2} 106 L${x + 4.2} 105.2 Z" fill="#fff"/>`
      : `<ellipse cx="${x - 3.6}" cy="95.5" rx="3.6" ry="4.4" fill="#fff"/><circle cx="${x + 4.2}" cy="106.4" r="1.9" fill="#fff"/>`);
  const happyEye = (x, s) =>
    `<path d="M${x - 10} 101 Q${x} 86 ${x + 10} 101" stroke="${INK}" stroke-width="3.6" fill="none" stroke-linecap="round"/>` +
    `<path d="M${x + s * 10} 100 L${x + s * 14.5} 96" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
  const EYES = {
    round: (x, s, uid) => bigEye(x, s, uid, false),
    sparkle: (x, s, uid) => bigEye(x, s, uid, true),
    happy: happyEye,
    sleepy: (x, s) =>
      `<path d="M${x - 10} 96 Q${x} 105 ${x + 10} 96" stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round"/>` +
      `<path d="M${x - 6} 101 L${x - 7} 104.5 M${x} 103 V106.5 M${x + 6} 101 L${x + 7} 104.5" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`,
    wink: (x, s, uid) => (s < 0 ? bigEye(x, s, uid, false) : happyEye(x, s)),
  };
  const MOUTH = {
    smile: `<path d="M92 120 Q100 128 108 120" stroke="${INK}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`,
    grin: `<path d="M90 119 Q100 136 110 119 Z" fill="#7a2e3a" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M91 119 H109 Q100 124 91 119 Z" fill="#fff"/><path d="M95 129 Q100 125 105 129 Q100 134 95 129 Z" fill="#ff8aa1"/>`,
    cat: `<path d="M91 120 Q95.5 127 100 120 Q104.5 127 109 120" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    open: `<ellipse cx="100" cy="123" rx="4.6" ry="6.4" fill="#7a2e3a" stroke="${INK}" stroke-width="1.6"/><ellipse cx="100" cy="126" rx="2.6" ry="2.2" fill="#ff8aa1"/>`,
  };

  function bgSvg(bg, uid) {
    const [a, b] = bg.stops;
    let s = `<linearGradient id="${uid}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
    s = `<defs>${s}</defs><rect width="200" height="250" fill="url(#${uid}g)"/>`;
    if (bg.stars) {
      for (const [x, y, r] of [[22, 24, 1.8], [60, 14, 1.2], [150, 22, 2], [178, 52, 1.4], [30, 70, 1.2], [172, 100, 1.6], [16, 120, 1.6], [186, 150, 1.2], [92, 10, 1.4], [120, 30, 1], [24, 190, 1.4], [178, 200, 1.6]]) {
        s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".85"/>`;
      }
    }
    return s;
  }

  // arms hang at the sides; the sleeve covers the arm down to t (0 = shoulder, 1 = hand)
  const ARM = { L: { s: [66, 167], h: [52, 226] }, R: { s: [134, 167], h: [148, 226] } };
  const at = (a, t) => [a.s[0] + (a.h[0] - a.s[0]) * t, a.s[1] + (a.h[1] - a.s[1]) * t].map((v) => v.toFixed(1));
  const seg = (a, t0, t1, w, color, cap = 'round') => {
    const [x0, y0] = at(a, t0);
    const [x1, y1] = at(a, t1);
    return `<path d="M${x0} ${y0} L${x1} ${y1}" stroke="${color}" stroke-width="${w}" stroke-linecap="${cap}" fill="none"/>`;
  };
  function arms(skin, sleeve) {
    const edge = shade(skin, -0.32);
    let out = '';
    for (const side of ['L', 'R']) {
      const a = ARM[side];
      const dir = side === 'L' ? 1 : -1; // towards the body
      const [hx, hy] = a.h;
      out += seg(a, 0, 1, 17, edge) + seg(a, 0, 1, 14.4, skin);
      // hand: palm, thumb, finger lines
      out +=
        `<ellipse cx="${hx}" cy="${hy + 3}" rx="7.6" ry="9" fill="${skin}" stroke="${edge}" stroke-width="1.2"/>` +
        `<ellipse cx="${hx + dir * 5.6}" cy="${hy + 1}" rx="2.8" ry="5.4" transform="rotate(${dir * -18} ${hx + dir * 5.6} ${hy + 1})" fill="${skin}" stroke="${edge}" stroke-width="1.1"/>` +
        `<path d="M${hx - 2.4} ${hy + 8.6} V${hy + 11.6} M${hx + 1.8} ${hy + 9} V${hy + 12.2}" stroke="${edge}" stroke-width=".9" stroke-linecap="round" fill="none"/>`;
      if (sleeve) {
        const c = sleeve.color;
        const w = sleeve.t < 0.6 ? 17 : 16.4;
        out += seg(a, 0, sleeve.t, w + 2.4, shade(c, -0.4), 'butt') + seg(a, 0, 0, w + 2.4, shade(c, -0.4)) +
          seg(a, 0, sleeve.t, w, c, 'butt') + seg(a, 0, 0, w, c);
        if (sleeve.cuff) out += seg(a, sleeve.t - 0.09, sleeve.t, w + 1.6, sleeve.cuff, 'butt');
        if (sleeve.band) out += seg(a, sleeve.t - 0.13, sleeve.t - 0.06, w, sleeve.band, 'butt');
      }
    }
    return out;
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
    const hairItem = get('hairColor', cfg.hairColor);
    const hc = hairItem.color;
    const h = { fill: `url(#${uid}h)`, hi: shade(hc, 0.4), lo: shade(hc, -0.3), line: shade(hc, -0.5) };
    const hair = HAIR[get('hair', cfg.hair).id];
    const top = get('top', cfg.top);
    const head = get('head', cfg.head);
    const face = get('face', cfg.face);
    const pet = get('pet', cfg.pet);
    const bg = get('bg', cfg.bg);
    const eyes = EYES[get('eyes', cfg.eyes).id];
    const mouth = MOUTH[get('mouth', cfg.mouth).id];
    const iris = IRIS[hairItem.id] || '#5b6bd8';
    const edge = shade(skin, -0.32);
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb || '0 0 200 250'}" aria-hidden="true">` +
      bgSvg(bg, uid) +
      `<defs>` +
      `<linearGradient id="${uid}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(hc, 0.14)}"/><stop offset="1" stop-color="${shade(hc, -0.14)}"/></linearGradient>` +
      `<linearGradient id="${uid}i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(iris, -0.55)}"/><stop offset=".55" stop-color="${iris}"/><stop offset="1" stop-color="${shade(iris, 0.45)}"/></linearGradient>` +
      `<clipPath id="${uid}f"><path d="${FACE}"/></clipPath>` +
      `</defs>` +
      (top.back ? top.back(top.color, skinD, uid) : '') +
      hair.back(h) +
      // legs / trousers under the top
      `<path d="M58 228 H142 L146 250 H54 Z" fill="#3b3f63" stroke="#272a45" stroke-width="1.4" stroke-linejoin="round"/><path d="M100 232 V250" stroke="#272a45" stroke-width="1.4"/>` +
      // neck, with a shadow under the chin
      `<path d="M90 124 H110 V156 Q100 164 90 156 Z" fill="${skinD}"/>` +
      `<path d="M90 128 H110 V146 Q100 152 90 146 Z" fill="${shade(skin, -0.28)}" opacity=".55"/>` +
      top.front(top.color, skinD, uid) +
      arms(skin, top.sleeve ? Object.assign({ color: top.color }, top.sleeve) : null) +
      hair.mid(h) +
      // ears, head
      `<ellipse cx="56" cy="98" rx="6.4" ry="9" fill="${skin}" stroke="${edge}" stroke-width="1.2"/><ellipse cx="144" cy="98" rx="6.4" ry="9" fill="${skin}" stroke="${edge}" stroke-width="1.2"/>` +
      `<path d="${FACE}" fill="${skin}" stroke="${edge}" stroke-width="1.3" stroke-linejoin="round"/>` +
      // shadow the fringe throws on the forehead
      `<g clip-path="url(#${uid}f)"><g transform="translate(0 5)" fill="#7a3b2e" opacity=".16">${FRINGE({ fill: '#000', hi: '#000', lo: '#000', line: 'none' }).split('<path').slice(1, 2).map((p) => '<path' + p).join('')}</g></g>` +
      `<ellipse cx="69" cy="113" rx="9" ry="5" fill="#ff6f91" opacity=".32"/><ellipse cx="131" cy="113" rx="9" ry="5" fill="#ff6f91" opacity=".32"/>` +
      `<path d="M69 83 Q80 78 91 82 M109 82 Q120 78 131 83" stroke="${h.lo}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
      eyes(80, -1, uid) + eyes(120, 1, uid) +
      `<path d="M99 109 Q100 111.4 102 109.4" stroke="${shade(skin, -0.34)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
      mouth +
      (face.front ? face.front() : '') +
      hair.front(h) +
      (head.front ? head.front(head.color) : '') +
      (pet.emoji ? `<text x="32" y="244" font-size="46" text-anchor="middle">${pet.emoji}</text>` : '') +
      '</svg>'
    );
  };

  V.el = (cfg, vb) => U.html(V.svg(cfg, vb));

  // Which part of the picture to show when previewing one slot.
  V.VIEW = {
    hair: '30 6 140 140', hairColor: '30 6 140 140', head: '30 0 140 140', face: '30 44 140 140',
    eyes: '40 56 120 110', mouth: '40 70 120 110', skin: '30 30 140 140',
    top: '20 120 160 130', pet: '0 176 100 74', bg: '0 0 200 250',
  };
  V.HEAD_VIEW = '30 8 140 140';
})(window.A);
