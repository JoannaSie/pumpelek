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

  const INK = '#2b2023';
  // thin darker outline, the "line art" of the anime look
  const ln = (c, w = 1.3) => `stroke="${shade(c, -0.4)}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

  const TORSO = 'M91 151 C78 152 64 155 61 166 L56 238 L144 238 L139 166 C136 155 122 152 109 151 Q100 160 91 151 Z';
  const TORSO_LONG = 'M91 151 C78 152 64 155 61 166 L56 250 L144 250 L139 166 C136 155 122 152 109 151 Q100 160 91 151 Z';
  const FACE = 'M59 84 C59 56 78 40 100 40 C122 40 141 56 141 84 C141 108 128 130 112 138 Q100 144 88 138 C72 130 59 108 59 84 Z';

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
    { id: 'topknot', name: 'Top bun', price: 0 },
    { id: 'bob', name: 'Bob', price: 0 },
    { id: 'short', name: 'Short', price: 0 },
    { id: 'long', name: 'Long', price: 0 },
    { id: 'ponytail', name: 'Ponytail', price: 0 },
    { id: 'buns', name: 'Buns', price: 15 },
    { id: 'curly', name: 'Curly', price: 15 },
  ];
  CAT.hairColor = [
    ['black', '#2d2328', 0], ['brown', '#6a4128', 0], ['auburn', '#a5482a', 0], ['blonde', '#e9c46a', 0],
    ['pink', '#ff7eb6', 25], ['blue', '#4aa8ff', 25], ['purple', '#9b5de5', 25], ['mint', '#48d6a8', 25], ['silver', '#cfd3dd', 25],
  ].map(([id, color, price]) => ({ id, name: id[0].toUpperCase() + id.slice(1), price, color }));
  // big anime eyes get an iris colour that goes with the hair
  const IRIS = {
    black: '#7d5b49', brown: '#a8672f', auburn: '#2f9a6a', blonde: '#3c8de0', pink: '#d6458f',
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
    {
      id: 'kimono', name: 'Kimono', price: 80, color: '#8f9fc2', sleeve: { t: 0.94, w: 19, cuff: '#e8ecf6', flower: true },
      front: (c, sk, uid) => {
        const d = shade(c, -0.16);
        const flower = (x, y, r) => {
          let p = '';
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 - 1.2;
            p += `<circle cx="${(x + Math.cos(a) * r * 0.6).toFixed(1)}" cy="${(y + Math.sin(a) * r * 0.6).toFixed(1)}" r="${(r * 0.55).toFixed(1)}" fill="#f08a6a"/>`;
          }
          return p + `<circle cx="${x}" cy="${y}" r="${(r * 0.28).toFixed(1)}" fill="#ffe08a"/>`;
        };
        return `<pattern id="${uid}k" width="13" height="11" patternUnits="userSpaceOnUse"><path d="M6.5 1 L11 3.5 V7.5 L6.5 10 L2 7.5 V3.5 Z" fill="none" stroke="${d}" stroke-width="1"/><circle cx="6.5" cy="5.5" r="1.2" fill="${d}"/></pattern>` +
          `<path d="${TORSO_LONG}" fill="${c}" ${ln(c)}/><path d="${TORSO_LONG}" fill="url(#${uid}k)"/>` +
          `<path d="M88 151 L112 151 L100 184 Z" fill="${sk}"/>` +
          `<path d="M86 150 L100 186 L114 150" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>` +
          `<path d="M81 151 L100 194 L119 151" fill="none" stroke="#d9453f" stroke-width="2.6" stroke-linejoin="round"/>` +
          `<path d="M100 194 L78 250 M100 194 L122 250" fill="none" stroke="${shade(c, -0.3)}" stroke-width="1.2" opacity=".6"/>` +
          `<rect x="57" y="208" width="86" height="18" fill="#c8453f" ${ln('#c8453f')}/><path d="M57 214 H143" stroke="#e8776f" stroke-width="1.4" opacity=".7"/>` +
          flower(72, 190, 9) + flower(130, 238, 10) + flower(76, 242, 8);
      },
    },
  ];

  // Hair accessories only (no caps or hats). They sit on the hair, not floating above it.
  CAT.head = [
    { id: 'none', name: 'None', price: 0 },
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
      id: 'kanzashi', name: 'Hair stick', price: 30, color: '#e05a5a',
      front: () =>
        `<path d="M158 24 L112 60" stroke="#d9a441" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M158 24 L170 16" stroke="#b8862c" stroke-width="2" stroke-linecap="round"/>` +
        [0, 1, 2, 3, 4].map((k) => { const a = (k / 5) * Math.PI * 2; return `<circle cx="${(160 + Math.cos(a) * 6).toFixed(1)}" cy="${(24 + Math.sin(a) * 6).toFixed(1)}" r="4.6" fill="#f08a6a" stroke="#c9604a" stroke-width="1"/>`; }).join('') +
        `<circle cx="160" cy="24" r="3.2" fill="#ffd23f"/><path d="M158 31 Q154 42 150 46" stroke="#d9a441" stroke-width="1.4" fill="none"/><circle cx="150" cy="47" r="2.4" fill="#e05a5a"/>`,
    },
    {
      id: 'ears', name: 'Cat ears', price: 40, color: '#2b2233',
      front: (c) =>
        `<path d="M56 54 Q100 -12 144 54" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M50 58 L52 2 L92 32 Z M150 58 L148 2 L108 32 Z" fill="${c}" ${ln('#7b6a96', 1.2)}/>` +
        `<path d="M58 48 L58 16 L82 33 Z M142 48 L142 16 L118 33 Z" fill="#ffb3c7"/>`,
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
        `<g transform="translate(0 -10)">` +
        `<path d="M60 62 L62 24 L82 44 L100 14 L118 44 L138 24 L140 62 Q100 74 60 62 Z" fill="${c}" stroke="#d99a00" stroke-width="2" stroke-linejoin="round"/>` +
        `<path d="M62 56 Q100 68 138 56" fill="none" stroke="#e6a700" stroke-width="2"/>` +
        `<circle cx="100" cy="46" r="4.4" fill="#ff5964" stroke="#a82a35" stroke-width="1"/><circle cx="78" cy="55" r="3.2" fill="#37a8ff"/><circle cx="122" cy="55" r="3.2" fill="#37a8ff"/>` +
        `<circle cx="62" cy="22" r="3.4" fill="#fff" stroke="#d99a00" stroke-width="1.2"/><circle cx="100" cy="12" r="3.6" fill="#fff" stroke="#d99a00" stroke-width="1.2"/><circle cx="138" cy="22" r="3.4" fill="#fff" stroke="#d99a00" stroke-width="1.2"/></g>`,
    },
  ];
  // Hats that used to be in the shop: if she bought one, she gets the coins back (see store.sanitize).
  V.REFUND = { 'head:cap-red': 20, 'head:cap-blue': 20, 'head:beanie-yellow': 25, 'head:beanie-green': 25, 'head:party': 45 };

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

  // ---- drawing --------------------------------------------------------------
  // Flat, cel-shaded colours with thin line art. Hair: `back` sits behind head and body, `mid` hangs in front of the
  // shoulders, `front` is the bangs, the top of the head and the strands beside the face.
  // h = { fill, hi, lo, line } colours for this hair colour.
  const mirror = (d) => d.replace(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, (m, x, y) => 200 - x + ' ' + y);
  const both = (d) => d + ' ' + mirror(d);
  const strand = (h, d) => `<path d="${d}" fill="${h.fill}" stroke="${h.line}" stroke-width="1" stroke-linejoin="round"/>`;

  // blunt bangs made of single strands: the tips are uneven so the forehead shows through between them
  const BANG_X = [64, 72, 80, 88, 96, 104, 112, 120, 128, 136];
  const BANG_Y = [76, 72, 80, 77, 71, 78, 81, 74, 79, 70];
  const BANGS = (h) =>
    BANG_X.map((a, i) => {
      const ty = BANG_Y[i];
      const t = a + (a - 100) * 0.06;
      const my = (54 + ty) / 2;
      return strand(h, `M${a - 8} 54 L${a + 8} 54 Q${a + 7.4} ${my} ${t + 2.6} ${ty} L${t - 2.6} ${ty} Q${a - 7.4} ${my} ${a - 8} 54 Z`);
    }).join('');
  const TOP =
    'M53 90 C45 50 68 22 100 22 C132 22 155 50 147 90 C144 76 140 66 134 58 C118 64 82 64 66 58 C60 66 56 76 53 90 Z';
  const TOP_LINE = 'M53 90 C45 50 68 22 100 22 C132 22 155 50 147 90';
  const CROWN = (h) =>
    `<path d="${TOP}" fill="${h.fill}"/><path d="${TOP_LINE}" fill="none" stroke="${h.line}" stroke-width="1.3" stroke-linecap="round"/>` +
    // the lighter band across the top of the head
    `<path d="M62 52 C68 36 84 29 100 29 C116 29 132 36 138 52 C126 42 114 38 100 38 C86 38 74 42 62 52 Z" fill="${h.hi}" opacity=".85"/>` +
    `<path d="M100 22 C98 34 94 46 90 58 M100 22 C102 34 106 46 110 58" fill="none" stroke="${h.line}" stroke-width=".9" opacity=".6"/>`;
  // long thin locks beside the face; len = where they end
  const SIDE = (h, len) =>
    strand(h, both(`M59 64 C53 86 54 ${len - 22} 59 ${len} C62 ${len - 26} 64 92 64 68 Z`)) +
    strand(h, both(`M64 70 C62 92 63 ${len - 44} 66 ${len - 24} C69 ${len - 44} 69 94 68 72 Z`));
  const BACKCAP = (h) =>
    `<path d="M49 102 C41 52 66 20 100 20 C134 20 159 52 151 102 Z" fill="${h.fill}" stroke="${h.line}" stroke-width="1.2" stroke-linejoin="round"/>`;
  const WISPS = (h) =>
    `<path d="${both('M56 76 C49 94 49 112 54 126 M61 66 C52 70 45 84 45 98')}" fill="none" stroke="${h.line}" stroke-width="1" stroke-linecap="round"/>`;

  const HAIR = {
    topknot: {
      back: (h) =>
        BACKCAP(h) +
        `<circle cx="100" cy="21" r="18.5" fill="${h.fill}" stroke="${h.line}" stroke-width="1.3"/>` +
        `<path d="M88 14 Q100 8 112 15 M86 24 Q100 17 114 25" fill="none" stroke="${h.line}" stroke-width="1" opacity=".7"/>` +
        `<path d="M90 11 Q100 5 110 11" fill="none" stroke="${h.hi}" stroke-width="3" stroke-linecap="round" opacity=".9"/>`,
      mid: () => '',
      front: (h) => BANGS(h) + CROWN(h) + SIDE(h, 140) + WISPS(h),
    },
    short: {
      back: BACKCAP, mid: () => '',
      front: (h) => BANGS(h) + CROWN(h) + SIDE(h, 124),
    },
    bob: {
      back: (h) =>
        `<path d="M44 104 C38 52 64 20 100 20 C136 20 162 52 156 104 L158 140 C158 152 148 156 140 150 L60 150 C52 156 42 152 42 140 Z" fill="${h.fill}" stroke="${h.line}" stroke-width="1.2" stroke-linejoin="round"/>`,
      mid: () => '',
      front: (h) => BANGS(h) + CROWN(h) + SIDE(h, 142),
    },
    long: {
      back: (h) =>
        `<path d="M43 104 C37 52 64 20 100 20 C136 20 163 52 157 104 L168 190 C170 214 162 232 152 240 C142 226 120 232 100 238 C80 232 58 226 48 240 C38 232 30 214 32 190 Z" fill="${h.fill}" stroke="${h.line}" stroke-width="1.2" stroke-linejoin="round"/>` +
        `<path d="M54 140 C52 176 50 204 52 226 M146 140 C148 176 150 204 148 226 M100 150 V232" fill="none" stroke="${h.lo}" stroke-width="1.2" stroke-linecap="round" opacity=".45"/>`,
      mid: (h) =>
        strand(h, both('M56 110 C48 140 46 172 52 204 C60 190 66 160 64 120 Z')),
      front: (h) => BANGS(h) + CROWN(h) + SIDE(h, 150),
    },
    ponytail: {
      back: (h) =>
        BACKCAP(h) +
        `<path d="M140 46 C180 40 202 86 190 132 C186 156 172 174 158 182 C166 154 166 132 160 112 C156 92 150 76 140 64 Z" fill="${h.fill}" stroke="${h.line}" stroke-width="1.2" stroke-linejoin="round"/>` +
        `<path d="M156 66 C176 84 180 118 170 156" fill="none" stroke="${h.hi}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`,
      mid: () => '',
      front: (h) =>
        BANGS(h) + CROWN(h) + SIDE(h, 128) +
        `<ellipse cx="144" cy="54" rx="6" ry="9" transform="rotate(-20 144 54)" fill="#e05a5a" stroke="#a63a3a" stroke-width="1.1"/>`,
    },
    buns: {
      back: (h) =>
        BACKCAP(h) +
        [62, 138].map((x) => `<circle cx="${x}" cy="32" r="14" fill="${h.fill}" stroke="${h.line}" stroke-width="1.2"/><path d="M${x - 7} 28 Q${x} 23 ${x + 7} 29" fill="none" stroke="${h.line}" stroke-width="1" opacity=".7"/>`).join(''),
      mid: () => '',
      front: (h) =>
        BANGS(h) + CROWN(h) + SIDE(h, 130) +
        [76, 124].map((x) => `<ellipse cx="${x}" cy="40" rx="5" ry="3" fill="#e05a5a" stroke="#a63a3a" stroke-width="1"/>`).join(''),
    },
    curly: {
      back: (h) =>
        [[48, 74], [54, 46], [78, 28], [100, 22], [122, 28], [146, 46], [152, 74], [46, 102], [154, 102], [50, 128], [150, 128]]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="19" fill="${h.fill}" stroke="${h.line}" stroke-width="1.2"/>`).join('') +
        `<ellipse cx="100" cy="74" rx="50" ry="52" fill="${h.fill}"/>`,
      mid: () => '',
      front: (h) =>
        BANGS(h) + CROWN(h) + SIDE(h, 124) +
        [[57, 132], [143, 132], [66, 40], [134, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="${h.fill}" stroke="${h.line}" stroke-width="1.1"/>`).join(''),
    },
  };

  // eyes: x = centre, s = -1 for the left eye and +1 for the right (the outer corner gets a little flick)
  const bigEye = (x, s, uid, sparkle) =>
    `<ellipse cx="${x}" cy="100" rx="10.8" ry="11.6" fill="#fff"/>` +
    `<ellipse cx="${x}" cy="101" rx="8.8" ry="10.2" fill="url(#${uid}i)"/>` +
    `<ellipse cx="${x}" cy="101.6" rx="4.4" ry="5.6" fill="#1b1318"/>` +
    `<path d="M${x - 12} 100.6 C${x - 12} 85 ${x + 12} 85 ${x + 12} 100.6 C${x + 8.4} 92.6 ${x - 8.4} 92.6 ${x - 12} 100.6 Z" fill="${INK}"/>` +
    `<path d="M${x + s * 11.6} 98 Q${x + s * 14.6} 95.4 ${x + s * 15.6} 91" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
    `<path d="M${x - 8} 110.6 Q${x} 113.6 ${x + 8} 110.6" stroke="#9a6a58" stroke-width="1" fill="none" opacity=".7"/>` +
    (sparkle
      ? `<path d="M${x - 3.6} 93 L${x - 2.4} 96.6 L${x + 1} 97.8 L${x - 2.4} 99 L${x - 3.6} 102.6 L${x - 4.8} 99 L${x - 8.2} 97.8 L${x - 4.8} 96.6 Z" fill="#fff"/>` +
        `<circle cx="${x + 4.2}" cy="106" r="1.6" fill="#fff"/>`
      : `<circle cx="${x - 3.2}" cy="96.8" r="2.7" fill="#fff"/><circle cx="${x + 3.6}" cy="106.2" r="1.3" fill="#fff"/>`);
  const happyEye = (x, s) =>
    `<path d="M${x - 9.6} 102 Q${x} 89 ${x + 9.6} 102" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>` +
    `<path d="M${x + s * 9.6} 101.4 L${x + s * 13.6} 98" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
  const EYES = {
    round: (x, s, uid) => bigEye(x, s, uid, false),
    sparkle: (x, s, uid) => bigEye(x, s, uid, true),
    happy: happyEye,
    sleepy: (x, s) =>
      `<path d="M${x - 9.6} 98 Q${x} 106 ${x + 9.6} 98" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>` +
      `<path d="M${x - 6} 102.6 L${x - 7} 105.8 M${x} 104.4 V107.6 M${x + 6} 102.6 L${x + 7} 105.8" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>`,
    wink: (x, s, uid) => (s < 0 ? bigEye(x, s, uid, false) : happyEye(x, s)),
  };
  const LIP = '#b9575c';
  const MOUTH = {
    smile: `<path d="M93.4 124 Q100 128.4 106.6 124" stroke="${LIP}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
    grin: `<path d="M91 122.4 Q100 136 109 122.4 Z" fill="#8f3a45" stroke="${LIP}" stroke-width="1.4" stroke-linejoin="round"/><path d="M92 122.6 H108 Q100 126.6 92 122.6 Z" fill="#fff"/><path d="M96 130 Q100 127 104 130 Q100 134 96 130 Z" fill="#ff8aa1"/>`,
    cat: `<path d="M92 123.6 Q96 129 100 123.6 Q104 129 108 123.6" stroke="${LIP}" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    open: `<ellipse cx="100" cy="126" rx="4" ry="5.4" fill="#8f3a45" stroke="${LIP}" stroke-width="1.4"/><ellipse cx="100" cy="128.4" rx="2.3" ry="1.9" fill="#ff8aa1"/>`,
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
  const ARM = { L: { s: [66, 167], h: [53, 226] }, R: { s: [134, 167], h: [147, 226] } };
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
      out += seg(a, 0, 1, 14.6, edge) + seg(a, 0, 1, 12.4, skin);
      // hand: palm, thumb, finger lines
      out +=
        `<ellipse cx="${hx}" cy="${hy + 3}" rx="6.8" ry="8.4" fill="${skin}" stroke="${edge}" stroke-width="1.1"/>` +
        `<ellipse cx="${hx + dir * 5}" cy="${hy + 1}" rx="2.5" ry="5" transform="rotate(${dir * -18} ${hx + dir * 5} ${hy + 1})" fill="${skin}" stroke="${edge}" stroke-width="1"/>` +
        `<path d="M${hx - 2.2} ${hy + 8} V${hy + 10.8} M${hx + 1.6} ${hy + 8.4} V${hy + 11.2}" stroke="${edge}" stroke-width=".9" stroke-linecap="round" fill="none"/>`;
      if (sleeve) {
        const c = sleeve.color;
        const w = sleeve.w || (sleeve.t < 0.6 ? 15.6 : 15);
        out += seg(a, 0, sleeve.t, w + 2.2, shade(c, -0.4), 'butt') + seg(a, 0, 0, w + 2.2, shade(c, -0.4)) +
          seg(a, 0, sleeve.t, w, c, 'butt') + seg(a, 0, 0, w, c);
        if (sleeve.cuff) out += seg(a, sleeve.t - 0.09, sleeve.t, w + 1.4, sleeve.cuff, 'butt');
        if (sleeve.band) out += seg(a, sleeve.t - 0.13, sleeve.t - 0.06, w, sleeve.band, 'butt');
        if (sleeve.flower) {
          const [fx, fy] = at(a, 0.62);
          for (let i = 0; i < 5; i++) {
            const an = (i / 5) * Math.PI * 2 - 1.2;
            out += `<circle cx="${(+fx + Math.cos(an) * 3.6).toFixed(1)}" cy="${(+fy + Math.sin(an) * 3.6).toFixed(1)}" r="3.4" fill="#f08a6a"/>`;
          }
          out += `<circle cx="${fx}" cy="${fy}" r="1.8" fill="#ffe08a"/>`;
        }
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
    cfg: { skin: 'skin0', eyes: 'round', mouth: 'smile', hair: 'topknot', hairColor: 'black', top: 'tee-purple', head: 'none', face: 'none', pet: 'none', bg: 'paper' },
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
    const h = {
      fill: hc,
      hi: hairItem.id === 'black' ? '#74503f' : shade(hc, 0.3),
      lo: shade(hc, -0.3),
      line: shade(hc, -0.62),
    };
    const hair = HAIR[get('hair', cfg.hair).id];
    const top = get('top', cfg.top);
    const head = get('head', cfg.head);
    const face = get('face', cfg.face);
    const pet = get('pet', cfg.pet);
    const bg = get('bg', cfg.bg);
    const eyes = EYES[get('eyes', cfg.eyes).id];
    const mouth = MOUTH[get('mouth', cfg.mouth).id];
    const iris = IRIS[hairItem.id] || '#7d5b49';
    const edge = shade(skin, -0.32);
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb || '0 0 200 250'}" aria-hidden="true">` +
      bgSvg(bg, uid) +
      `<defs>` +
      `<linearGradient id="${uid}i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(iris, -0.5)}"/><stop offset=".6" stop-color="${iris}"/><stop offset="1" stop-color="${shade(iris, 0.4)}"/></linearGradient>` +
      `<clipPath id="${uid}f"><path d="${FACE}"/></clipPath>` +
      `</defs>` +
      (top.back ? top.back(top.color, skinD, uid) : '') +
      hair.back(h) +
      // legs / trousers under the top
      `<path d="M58 228 H142 L146 250 H54 Z" fill="#3b3f63" stroke="#272a45" stroke-width="1.4" stroke-linejoin="round"/><path d="M100 232 V250" stroke="#272a45" stroke-width="1.4"/>` +
      // neck, with a shadow under the chin
      `<path d="M91 124 H109 V156 Q100 164 91 156 Z" fill="${skinD}"/>` +
      `<path d="M91 128 H109 V146 Q100 152 91 146 Z" fill="${shade(skin, -0.28)}" opacity=".5"/>` +
      top.front(top.color, skinD, uid) +
      arms(skin, top.sleeve ? Object.assign({ color: top.color }, top.sleeve) : null) +
      hair.mid(h) +
      // ears, head
      [[57, 1], [143, -1]].map(([x, d]) => `<ellipse cx="${x}" cy="101" rx="6.6" ry="9.6" fill="${skin}" stroke="${edge}" stroke-width="1.1"/><path d="M${x + d * 1} 96 Q${x - d * 2.6} 101 ${x + d * 1} 106" fill="none" stroke="${edge}" stroke-width="1" opacity=".8"/>`).join('') +
      `<path d="${FACE}" fill="${skin}" stroke="${edge}" stroke-width="1.2" stroke-linejoin="round"/>` +
      // soft shadow under the bangs
      `<g clip-path="url(#${uid}f)"><path d="M59 54 H141 V70 Q100 92 59 70 Z" fill="#b8745f" opacity=".2"/></g>` +
      `<ellipse cx="70" cy="114" rx="8" ry="4.4" fill="#ff7a8a" opacity=".22"/><ellipse cx="130" cy="114" rx="8" ry="4.4" fill="#ff7a8a" opacity=".22"/>` +
      `<path d="M67 89 Q79 82 92 86 M108 86 Q121 82 133 89" stroke="${h.lo}" stroke-width="3" fill="none" stroke-linecap="round"/>` +
      eyes(80, -1, uid) + eyes(120, 1, uid) +
      `<ellipse cx="100" cy="113" rx="3.8" ry="2.4" fill="#e59a8a" opacity=".65"/>` +
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
    hair: '30 0 140 140', hairColor: '30 0 140 140', head: '30 0 140 140', face: '30 44 140 140',
    eyes: '40 56 120 110', mouth: '40 70 120 110', skin: '30 30 140 140',
    top: '20 120 160 130', pet: '0 176 100 74', bg: '0 0 200 250',
  };
  V.HEAD_VIEW = '30 4 140 140';
})(window.A);
