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
    ['darkbrown', 'Dark brown', '#3b2a25', 0], ['black', 'Black', '#1f1d24', 0], ['brown', 'Brown', '#6a4535', 0],
    ['lightbrown', 'Light brown', '#9a7458', 0], ['blonde', 'Blond', '#e8cf8a', 0], ['auburn', 'Ginger', '#b5432a', 0],
    ['pink', 'Pink', '#eea0b9', 25], ['blue', 'Navy', '#34437e', 25], ['silver', 'Silver', '#c9ccd6', 25],
  ].map(([id, name, color, price]) => ({ id, name, price, color }));
  // the eyes stay brown whatever the hair colour, as on the design sheet
  const IRIS = '#7a5445';

  // sleeves: t = how far down the arm the sleeve reaches (0 = shoulder, 1 = wrist); optional w (width), cuff, band, line, flower
  // pants: colour of the lower part (trousers or skirt) that shows under the top
  // front(c, skinShade, uid, skin) draws the torso; back(...) is drawn behind the body.
  const body = (c, d = TORSO) => `<path d="${d}" fill="${c}" ${ln(c)}/>`;
  const neckline = (sk, w = 14) => `<path d="M${100 - w} 151 Q100 ${(151 + w * 1.5).toFixed(1)} ${100 + w} 151 Z" fill="${sk}" ${ln(sk, 1)}/>`;
  const hoodBack = (c) => `<path d="M60 170 C54 126 146 126 140 170 Z" fill="${shade(c, -0.16)}" ${ln(c)}/>`;
  const straps = (c = '#34343c') =>
    `<path d="M76 153 Q70 182 73 216 M124 153 Q130 182 127 216" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`;
  const catFace = (x, y, c = '#fff', ink = '#4a3a3a') =>
    `<path d="M${x - 6} ${y - 2} L${x - 5.4} ${y - 8} L${x - 1} ${y - 5} M${x + 6} ${y - 2} L${x + 5.4} ${y - 8} L${x + 1} ${y - 5}" fill="${c}" stroke="${ink}" stroke-width="1"/>` +
    `<ellipse cx="${x}" cy="${y}" rx="6.6" ry="5.4" fill="${c}" stroke="${ink}" stroke-width="1"/>` +
    `<circle cx="${x - 2.4}" cy="${y - 0.6}" r=".9" fill="${ink}"/><circle cx="${x + 2.4}" cy="${y - 0.6}" r=".9" fill="${ink}"/><path d="M${x - 1} ${y + 1.6} h2" stroke="${ink}" stroke-width=".8"/>`;
  const knit = (c) =>
    `<path d="M70 176 Q74 188 70 200 Q66 212 70 226 M82 172 Q86 186 82 200 Q78 214 82 230 M118 172 Q114 186 118 200 Q122 214 118 230 M130 176 Q126 188 130 200 Q134 212 130 226" fill="none" stroke="${shade(c, -0.14)}" stroke-width="2" stroke-linecap="round"/>`;
  // a scarf round the neck with one end hanging down the chest
  const scarf = (c) =>
    `<path d="M76 147 Q100 172 124 147 L128 160 Q100 188 72 160 Z" fill="${c}" ${ln(c)}/>` +
    `<path d="M104 168 L124 164 L130 218 L110 224 Z" fill="${shade(c, -0.1)}" ${ln(c)}/>` +
    `<path d="M112 176 L116 214 M120 172 L124 212 M82 156 Q100 176 118 156" fill="none" stroke="${shade(c, -0.25)}" stroke-width="1.6" stroke-linecap="round"/>` +
    `<path d="M112 224 V232 M117 223 V231 M122 222 V230 M127 221 V229" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`;
  // a kimono-style top: crossed collar, sash, flowers
  const kimonoLike = (id, name, price, c, o) => ({
    id, name, price, color: c, sleeve: { t: 0.94, w: 19, cuff: o.cuff, flower: o.flower },
    front: (_c, sk, uid) => {
      const d = shade(c, o.dark ? 0.1 : -0.16);
      const flower = (x, y, r) => {
        let p = '';
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 - 1.2;
          p += `<circle cx="${(x + Math.cos(a) * r * 0.6).toFixed(1)}" cy="${(y + Math.sin(a) * r * 0.6).toFixed(1)}" r="${(r * 0.55).toFixed(1)}" fill="${o.flower}"/>`;
        }
        return p + `<circle cx="${x}" cy="${y}" r="${(r * 0.28).toFixed(1)}" fill="#ffe08a"/>`;
      };
      return `<pattern id="${uid}k" width="13" height="11" patternUnits="userSpaceOnUse"><path d="M6.5 1 L11 3.5 V7.5 L6.5 10 L2 7.5 V3.5 Z" fill="none" stroke="${d}" stroke-width="1"/><circle cx="6.5" cy="5.5" r="1.2" fill="${d}"/></pattern>` +
        body(c, TORSO_LONG) + `<path d="${TORSO_LONG}" fill="url(#${uid}k)"/>` +
        `<path d="M88 151 L112 151 L100 184 Z" fill="${sk}"/>` +
        `<path d="M86 150 L100 186 L114 150" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>` +
        `<path d="M81 151 L100 194 L119 151" fill="none" stroke="${o.trim}" stroke-width="2.6" stroke-linejoin="round"/>` +
        `<path d="M100 194 L78 250 M100 194 L122 250" fill="none" stroke="${shade(c, -0.3)}" stroke-width="1.2" opacity=".6"/>` +
        `<rect x="57" y="208" width="86" height="18" fill="${o.obi}" ${ln(o.obi)}/><path d="M57 214 H143" stroke="${shade(o.obi, 0.25)}" stroke-width="1.4" opacity=".7"/>` +
        flower(72, 190, 9) + flower(130, 238, 10) + flower(76, 242, 8);
    },
  });

  CAT.top = [
    kimonoLike('kimono', 'Kimono', 0, '#8f9fc2', { cuff: '#e8ecf6', flower: '#f08a6a', trim: '#d9453f', obi: '#c8453f' }),
    {
      id: 'casual', name: 'Cat hoodie & jeans', price: 0, color: '#f1e4cf', pants: '#4a6fa5', sleeve: { t: 0.92, cuff: '#d8c8ae' },
      back: hoodBack,
      front: (c, sk) =>
        body(c) + neckline(sk, 12) +
        `<path d="M91 153 Q100 166 109 153 L112 156 Q100 176 88 156 Z" fill="${shade(c, -0.1)}"/>` +
        `<path d="M94 166 V190 M106 166 V190" stroke="#b9a98f" stroke-width="2.4" stroke-linecap="round"/>` +
        catFace(116, 194) +
        `<path d="M72 208 L128 208 L134 234 L66 234 Z" fill="${shade(c, -0.07)}" ${ln(c, 1.1)}/>` +
        `<path d="M62 232 H138 V238 H62 Z" fill="${shade(c, -0.14)}"/>` + straps(),
    },
    {
      id: 'school', name: 'School uniform', price: 0, color: '#27345e', pants: '#3a3f5c', sleeve: { t: 0.92, cuff: '#ffffff' },
      front: (c, sk) =>
        body(c) +
        `<path d="M84 150 L100 198 L116 150 Z" fill="#fff"/><path d="M91 151 L109 151 L100 168 Z" fill="${sk}"/>` +
        `<path d="M91 151 L76 172 L92 184 L100 198 Z M109 151 L124 172 L108 184 L100 198 Z" fill="${shade(c, -0.12)}" ${ln(c, 1.2)}/>` +
        `<path d="M100 160 L84 151 L85 169 Z M100 160 L116 151 L115 169 Z" fill="#c0392b" ${ln('#c0392b', 1)}/><rect x="96" y="156" width="8" height="9" rx="2" fill="#a02e22"/>` +
        `<path d="M100 198 V238" stroke="${shade(c, -0.3)}" stroke-width="1.4"/><circle cx="104" cy="210" r="2.2" fill="#d9b44a"/><circle cx="104" cy="224" r="2.2" fill="#d9b44a"/>` +
        `<path d="M110 196 L128 196 L128 204 L110 204 Z" fill="none" stroke="${shade(c, -0.3)}" stroke-width="1.1"/><path d="M68 190 q5 -4 10 0 v8 q-5 4 -10 0 Z" fill="#c0392b" opacity=".85"/>`,
    },
    {
      id: 'sporty', name: 'Tracksuit', price: 25, color: '#8f949d', pants: '#5e626d', sleeve: { t: 0.94, cuff: '#6f737c', line: '#ffffff' },
      back: hoodBack,
      front: (c, sk) =>
        body(c) + neckline(sk, 10) +
        `<path d="M91 153 Q100 164 109 153 L113 157 Q100 174 87 157 Z" fill="${shade(c, -0.14)}"/>` +
        `<path d="M100 170 V238" stroke="${shade(c, -0.3)}" stroke-width="1.6"/><rect x="98" y="168" width="4" height="7" rx="1.5" fill="#d8dae0"/>` +
        `<path d="M64 170 L59 238 M136 170 L141 238" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M62 232 H138 V238 H62 Z" fill="${shade(c, -0.16)}"/>` + straps('#2d2d33'),
    },
    {
      id: 'coat', name: 'Winter coat', price: 40, color: '#d8b898', sleeve: { t: 0.94, cuff: '#c2a07e' },
      front: (c, sk) =>
        body(c) + `<path d="M90 151 L110 151 L108 238 L92 238 Z" fill="#3b3f63"/>` +
        `<path d="M91 151 L78 170 L92 182 Z M109 151 L122 170 L108 182 Z" fill="${shade(c, -0.1)}" ${ln(c, 1.2)}/>` +
        `<path d="M90 151 L92 238 M110 151 L108 238" stroke="${shade(c, -0.3)}" stroke-width="1.3"/>` +
        `<circle cx="82" cy="196" r="2.4" fill="#8a6a4a"/><circle cx="82" cy="216" r="2.4" fill="#8a6a4a"/><circle cx="118" cy="196" r="2.4" fill="#8a6a4a"/><circle cx="118" cy="216" r="2.4" fill="#8a6a4a"/>` +
        scarf('#b02a30'),
    },
    {
      id: 'sundress', name: 'Summer dress', price: 25, color: '#bfe0f5', pants: '#bfe0f5',
      front: (c, sk, uid, skin) => {
        let dots = '';
        for (const [x, y, k] of [[72, 196, 0], [90, 210, 1], [110, 200, 0], [128, 214, 1], [78, 232, 1], [100, 236, 0], [122, 238, 0], [66, 214, 0]]) {
          dots += `<circle cx="${x}" cy="${y}" r="3.4" fill="${k ? '#f5a3c0' : '#fff'}"/><circle cx="${x}" cy="${y}" r="1.1" fill="#ffd23f"/>`;
        }
        return `<path d="${TORSO}" fill="${skin}" ${ln(skin, 1)}/>` +
          `<path d="M66 178 Q84 172 100 184 Q116 172 134 178 L142 250 L58 250 Z" fill="${c}" ${ln('#7fb0d4')}/>` + dots +
          `<path d="M78 176 L82 152 M122 176 L118 152" stroke="${c}" stroke-width="5" stroke-linecap="round"/>` +
          `<path d="M66 182 Q84 176 100 188 Q116 176 134 182" fill="none" stroke="#fff" stroke-width="2"/>`;
      },
    },
    {
      id: 'sweaterskirt', name: 'Sweater & skirt', price: 30, color: '#f1e6d0', pants: '#2d3a5a', sleeve: { t: 0.9, cuff: '#e2d3b5' },
      front: (c, sk) =>
        body(c) + neckline(sk, 11) + knit(c) +
        `<path d="M90 151 Q100 160 110 151 L114 155 Q100 168 86 155 Z" fill="${shade(c, -0.08)}"/>` +
        `<path d="M58 212 H142 L150 250 H50 Z" fill="#2d3a5a" ${ln('#2d3a5a')}/>` +
        `<path d="M78 212 L72 250 M100 212 V250 M122 212 L128 250 M52 232 H148" stroke="#51648f" stroke-width="1.4"/>` +
        `<path d="M58 208 H142 V214 H58 Z" fill="${shade(c, -0.12)}"/>`,
    },
    {
      id: 'raincoat', name: 'Raincoat', price: 30, color: '#f5c518', pants: '#3b3f63', sleeve: { t: 0.94, cuff: '#d9a90f' },
      back: hoodBack,
      front: (c, sk) =>
        body(c) + neckline(sk, 9) +
        `<path d="M92 153 Q100 164 108 153 L112 157 Q100 172 88 157 Z" fill="${shade(c, -0.14)}"/>` +
        `<path d="M100 170 V238" stroke="${shade(c, -0.3)}" stroke-width="1.6"/>` +
        `<path d="M92 170 V238 M108 170 V238" stroke="${shade(c, -0.18)}" stroke-width="1"/>` +
        `<circle cx="96" cy="186" r="2.2" fill="#b58a0b"/><circle cx="96" cy="204" r="2.2" fill="#b58a0b"/><circle cx="96" cy="222" r="2.2" fill="#b58a0b"/>` +
        `<path d="M68 210 L88 210 L88 230 L68 230 Z M112 210 L132 210 L132 230 L112 230 Z" fill="${shade(c, -0.08)}" ${ln(c, 1)}/>` + straps('#2d2d33'),
    },
    kimonoLike('haori', 'Haori', 60, '#26212b', { cuff: '#c0392b', flower: '#e8574f', trim: '#c0392b', obi: '#b3322b', dark: true }),
    {
      id: 'outdoor', name: 'Outdoor jacket', price: 50, color: '#6d3fc0', pants: '#33323f', sleeve: { t: 0.94, cuff: '#4f2a94' },
      back: hoodBack,
      front: (c, sk) =>
        body(c) + neckline(sk, 9) +
        `<path d="M92 153 Q100 164 108 153 L113 157 Q100 174 87 157 Z" fill="${shade(c, -0.16)}"/>` +
        `<path d="M100 170 V238" stroke="${shade(c, -0.3)}" stroke-width="1.6"/>` +
        `<path d="M72 168 L74 196 M128 168 L126 196" stroke="#2f2f3a" stroke-width="4" stroke-linecap="round"/><rect x="70" y="190" width="9" height="6" rx="1.5" fill="#d9b44a"/><rect x="121" y="190" width="9" height="6" rx="1.5" fill="#d9b44a"/>` +
        `<path d="M66 208 L88 208 L88 232 L66 232 Z M112 208 L134 208 L134 232 L112 232 Z" fill="${shade(c, -0.1)}" ${ln(c, 1)}/>`,
    },
    {
      id: 'blazer', name: 'Smart blazer', price: 45, color: '#c9ae8f', pants: '#5a4a40', sleeve: { t: 0.94, cuff: '#ffffff' },
      front: (c, sk) =>
        body(c) +
        `<path d="M84 150 L100 200 L116 150 Z" fill="#fff"/><path d="M91 151 L109 151 L100 166 Z" fill="${sk}"/>` +
        `<path d="M84 150 L92 162 L100 156 L108 162 L116 150" fill="#fff" stroke="#d9d4cc" stroke-width="1" stroke-linejoin="round"/>` +
        `<path d="M91 151 L76 174 L90 186 L100 200 Z M109 151 L124 174 L110 186 L100 200 Z" fill="${shade(c, -0.1)}" ${ln(c, 1.2)}/>` +
        `<path d="M100 200 V238" stroke="${shade(c, -0.3)}" stroke-width="1.3"/><circle cx="104" cy="214" r="2.2" fill="#8a6a4a"/>` +
        `<path d="M66 158 L132 232" stroke="#4a3426" stroke-width="6" stroke-linecap="round"/>`,
    },
    {
      id: 'wintersweater', name: 'Sweater & scarf', price: 40, color: '#efe4d0', sleeve: { t: 0.92, cuff: '#dccdb0' },
      front: (c) => body(c) + knit(c) + scarf('#3a5a9a') + `<path d="M62 232 H138 V238 H62 Z" fill="${shade(c, -0.12)}"/>`,
    },
    {
      id: 'oversized', name: 'Big black hoodie', price: 30, color: '#27252d', pants: '#4a4a55', sleeve: { t: 0.98, w: 18, cuff: '#1d1b22' },
      back: hoodBack,
      front: (c, sk) =>
        body(c) + neckline(sk, 11) +
        `<path d="M90 153 Q100 166 110 153 L113 157 Q100 174 87 157 Z" fill="${shade(c, 0.1)}"/>` +
        `<path d="M94 166 V188 M106 166 V188" stroke="#c9c9d2" stroke-width="2.2" stroke-linecap="round"/>` +
        `<circle cx="100" cy="206" r="10" fill="none" stroke="#e6e6ee" stroke-width="1.6"/><path d="M93 206 H107 M100 199 V213 M95 201 L105 211 M105 201 L95 211" stroke="#e6e6ee" stroke-width="1.2"/>` +
        `<path d="M62 232 H138 V238 H62 Z" fill="${shade(c, 0.08)}"/>`,
    },
    {
      id: 'pajamas', name: 'Pajamas', price: 30, color: '#f4b8cf', pants: '#f4b8cf', sleeve: { t: 0.92, cuff: '#ffffff' },
      front: (c, sk) =>
        body(c) +
        `<path d="M88 151 L112 151 L100 176 Z" fill="${sk}"/>` +
        `<path d="M86 150 L100 180 L114 150 L108 150 L100 166 L92 150 Z" fill="#fff" stroke="#e8c9d6" stroke-width="1"/>` +
        `<path d="M100 180 V238" stroke="#fff" stroke-width="1.6"/><circle cx="104" cy="196" r="2" fill="#fff"/><circle cx="104" cy="214" r="2" fill="#fff"/>` +
        catFace(118, 196, '#fff', '#8a5a6a') +
        `<g fill="#fff" opacity=".7"><circle cx="72" cy="196" r="1.6"/><circle cx="80" cy="214" r="1.6"/><circle cx="70" cy="224" r="1.6"/><circle cx="130" cy="222" r="1.6"/></g>`,
    },
    {
      id: 'ninja', name: 'Ninja outfit', price: 80, color: '#1f1d24', pants: '#1f1d24', sleeve: { t: 0.94, cuff: '#b3322b' },
      back: () =>
        `<path d="M132 152 L160 96" stroke="#2a2830" stroke-width="7" stroke-linecap="round"/>` +
        `<path d="M156 104 L163 90" stroke="#b3322b" stroke-width="7" stroke-linecap="round"/><path d="M154 108 L161 108 M158 100 L165 99" stroke="#e0d8d0" stroke-width="1.4"/>`,
      front: (c, sk) =>
        body(c) + `<path d="M84 150 Q100 162 116 150 L116 158 Q100 170 84 158 Z" fill="${shade(c, 0.1)}" ${ln(c, 1)}/>` +
        `<path d="M91 151 L109 151 L100 163 Z" fill="${sk}"/>` +
        `<path d="M84 154 L122 224 M116 154 L78 224" stroke="#b3322b" stroke-width="7" stroke-linecap="round" opacity=".95"/>` +
        `<rect x="58" y="216" width="84" height="12" fill="#b3322b" ${ln('#b3322b')}/>` +
        `<path d="M62 232 H138 V238 H62 Z" fill="${shade(c, 0.1)}"/>`,
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
  V.REFUND = {
    'head:cap-red': 20, 'head:cap-blue': 20, 'head:beanie-yellow': 25, 'head:beanie-green': 25, 'head:party': 45,
    'top:tee-pink': 15, 'top:tee-yellow': 15, 'top:tee-green': 15, 'top:hoodie-gray': 30, 'top:hoodie-pink': 35,
    'top:hoodie-teal': 35, 'top:stripes-navy': 40, 'top:stripes-red': 40, 'top:denim': 60, 'top:overalls': 60, 'top:cape': 120,
    'hairColor:purple': 25, 'hairColor:mint': 25, 'hair:curly': 15,
  };

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

  // a plait: overlapping loops from (x0,y0) to (x1,y1), tied with a ribbon at the end
  const plait = (h, x0, y0, x1, y1, bend) => {
    let out = '';
    const n = 7;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = x0 + (x1 - x0) * t + Math.sin(t * Math.PI) * bend;
      const y = y0 + (y1 - y0) * t;
      const r = 6.6 - t * 2;
      out += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r + 2.6).toFixed(1)}" transform="rotate(${i % 2 ? 24 : -24} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${h.fill}" stroke="${h.line}" stroke-width="1"/>`;
    }
    return out + `<ellipse cx="${x1}" cy="${y1 + 4}" rx="4.4" ry="3" fill="#e05a5a" stroke="#a63a3a" stroke-width="1"/>`;
  };
  const BUN = (h, x, y, r) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${h.fill}" stroke="${h.line}" stroke-width="1.3"/>` +
    `<path d="M${x - r * 0.5} ${y - r * 0.3} Q${x} ${y - r * 0.8} ${x + r * 0.5} ${y - r * 0.25} M${x - r * 0.55} ${y + r * 0.3} Q${x} ${y - r * 0.1} ${x + r * 0.55} ${y + r * 0.35}" fill="none" stroke="${h.line}" stroke-width="1" opacity=".7"/>` +
    `<path d="M${x - r * 0.45} ${y - r * 0.55} Q${x} ${y - r * 0.95} ${x + r * 0.45} ${y - r * 0.55}" fill="none" stroke="${h.hi}" stroke-width="3" stroke-linecap="round" opacity=".9"/>`;
  const LONG_BACK = (h) =>
    `<path d="M43 104 C37 52 64 20 100 20 C136 20 163 52 157 104 L168 190 C170 214 162 232 152 240 C142 226 120 232 100 238 C80 232 58 226 48 240 C38 232 30 214 32 190 Z" fill="${h.fill}" stroke="${h.line}" stroke-width="1.2" stroke-linejoin="round"/>` +
    `<path d="M54 140 C52 176 50 204 52 226 M146 140 C148 176 150 204 148 226 M100 150 V232" fill="none" stroke="${h.lo}" stroke-width="1.2" stroke-linecap="round" opacity=".45"/>`;
  const LONG_MID = (h) => strand(h, both('M56 110 C48 140 46 172 52 204 C60 190 66 160 64 120 Z'));
  const NAPE = (h) =>
    `<path d="M48 100 C46 112 52 124 64 128 L136 128 C148 124 154 112 152 100 Z" fill="${h.fill}" stroke="${h.line}" stroke-width="1.2" stroke-linejoin="round"/>`;

  const HAIR = {
    topknot: {
      back: (h) => BACKCAP(h) + BUN(h, 100, 24, 18),
      mid: () => '',
      front: (h) => BANGS(h) + CROWN(h) + SIDE(h, 140) + WISPS(h),
    },
    ballerina: {
      back: (h) => BACKCAP(h) + BUN(h, 100, 15, 13.5),
      mid: () => '',
      front: (h) => BANGS(h) + CROWN(h) + SIDE(h, 126),
    },
    long: {
      back: LONG_BACK, mid: LONG_MID,
      front: (h) => BANGS(h) + CROWN(h) + SIDE(h, 150),
    },
    halfup: {
      back: (h) => LONG_BACK(h) + BUN(h, 100, 17, 12.5), mid: LONG_MID,
      front: (h) => BANGS(h) + CROWN(h) + SIDE(h, 150),
    },
    buns: {
      back: (h) => BACKCAP(h) + BUN(h, 64, 30, 15) + BUN(h, 136, 30, 15),
      mid: () => '',
      front: (h) =>
        BANGS(h) + CROWN(h) + SIDE(h, 130) +
        [76, 124].map((x) => `<ellipse cx="${x}" cy="40" rx="5" ry="3" fill="#e05a5a" stroke="#a63a3a" stroke-width="1"/>`).join(''),
    },
    braid: {
      back: (h) => NAPE(h) + BACKCAP(h),
      mid: (h) => plait(h, 138, 116, 148, 214, 5),
      front: (h) => BANGS(h) + CROWN(h) + SIDE(h, 130),
    },
    lowtail: {
      back: (h) => NAPE(h) + BACKCAP(h),
      mid: (h) =>
        strand(h, 'M62 126 C48 150 46 186 54 216 C62 198 70 170 72 134 Z') +
        `<path d="M58 160 C54 176 54 194 56 206" fill="none" stroke="${h.lo}" stroke-width="1" opacity=".5"/>` +
        `<ellipse cx="66" cy="128" rx="6" ry="4" fill="#e05a5a" stroke="#a63a3a" stroke-width="1.1"/>`,
      front: (h) => BANGS(h) + CROWN(h) + SIDE(h, 124),
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
    braids: {
      back: (h) => NAPE(h) + BACKCAP(h),
      mid: (h) => plait(h, 62, 116, 54, 214, -5) + plait(h, 138, 116, 146, 214, 5),
      front: (h) => BANGS(h) + CROWN(h) + SIDE(h, 126),
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
        if (sleeve.line) out += seg(a, 0.08, sleeve.t - 0.02, 2.6, sleeve.line, 'butt');
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
    cfg: { skin: 'skin0', eyes: 'round', mouth: 'smile', hair: 'topknot', hairColor: 'darkbrown', top: 'kimono', head: 'none', face: 'none', pet: 'none', bg: 'paper' },
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
      hi: hairItem.id === 'black' ? '#5b4b50' : shade(hc, 0.28),
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
    const iris = IRIS;
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
      `<path d="M58 228 H142 L146 250 H54 Z" fill="${top.pants || '#3b3f63'}" stroke="${shade(top.pants || '#3b3f63', -0.4)}" stroke-width="1.4" stroke-linejoin="round"/><path d="M100 232 V250" stroke="${shade(top.pants || '#3b3f63', -0.4)}" stroke-width="1.4"/>` +
      // neck, with a shadow under the chin
      `<path d="M91 124 H109 V156 Q100 164 91 156 Z" fill="${skinD}"/>` +
      `<path d="M91 128 H109 V146 Q100 152 91 146 Z" fill="${shade(skin, -0.28)}" opacity=".5"/>` +
      top.front(top.color, skinD, uid, skin) +
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
