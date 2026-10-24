/* Flower World — original, resolution-independent storybook artwork. */
const TAU = Math.PI * 2;
const PALETTES = {
  meadow: { sky: '#bde6e5', horizon: '#f4f3d7', distant: '#b6d0ce', mountain: '#91c4bb', forest: '#73a994', leaf: '#759f69', dark: '#3e7460', light: '#aec485', grass: '#b7cc82', soil: '#b89872', soilDark: '#94795f', glow: '#fff2ae' },
  forest: { sky: '#bed9d5', horizon: '#e1ebc6', distant: '#9abbb2', mountain: '#77a59a', forest: '#548779', leaf: '#5f966f', dark: '#315e58', light: '#9fbe81', grass: '#94b479', soil: '#a48d71', soilDark: '#796b58', glow: '#c9f1cf' },
  ruins: { sky: '#d2cce6', horizon: '#f5e2d2', distant: '#b8accb', mountain: '#a395bc', forest: '#7f8aa7', leaf: '#858fa7', dark: '#555e7b', light: '#b5b1be', grass: '#b4b49d', soil: '#aaa090', soilDark: '#847c78', glow: '#f9e6ac' },
};

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function ellipse(c, x, y, rx, ry, color, stroke, width = 1) { c.beginPath(); c.ellipse(x, y, Math.max(.01, rx), Math.max(.01, ry), 0, 0, TAU); c.fillStyle = color; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.stroke(); } }
function line(c, points, color, width = 1) { c.beginPath(); c.moveTo(points[0], points[1]); for (let i = 2; i < points.length; i += 2) c.lineTo(points[i], points[i + 1]); c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
function shape(c, color, stroke, width, draw) { c.beginPath(); draw(c); c.fillStyle = color; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = width || 1; c.lineJoin = 'round'; c.stroke(); } }
function rounded(c, x, y, w, h, r, fill, stroke) { c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.stroke(); } }
function text(c, value, x, y, color = '#fffdf2', size = 12, weight = 600, align = 'center') { c.font = `${weight} ${size}px "Noto Sans KR", "Malgun Gothic", sans-serif`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = color; c.fillText(value, x, y); }
function flower(c, x, y, size, color, bend = 0) {
  line(c, [x, y, x + bend, y - size * 1.7], '#718958', Math.max(.7, size * .15));
  c.save(); c.translate(x + bend, y - size * 1.7);
  for (let i = 0; i < 5; i++) { let a = i * TAU / 5; ellipse(c, Math.cos(a) * size * .45, Math.sin(a) * size * .45, size * .45, size * .4, color); }
  ellipse(c, 0, 0, size * .24, size * .24, '#e9c56e'); c.restore();
  ellipse(c, x + size * .4, y - size * .65, size * .48, size * .19, '#7e9b65');
}

function cloud(c, x, y, scale, opacity = .7) {
  c.save(); c.translate(x, y); c.scale(scale, scale); c.globalAlpha = opacity;
  shape(c, '#fffef0', null, 0, p => { p.moveTo(-63, 13); p.bezierCurveTo(-73, -2, -56, -17, -40, -12); p.bezierCurveTo(-36, -45, 7, -45, 15, -19); p.bezierCurveTo(39, -31, 57, -14, 56, -1); p.bezierCurveTo(82, -3, 82, 18, 60, 20); p.lineTo(-53, 20); p.closePath(); });
  c.restore();
}

function bush(c, x, y, size, p, seed = 1) {
  const rand = rng(seed); c.save(); c.translate(x, y);
  for (let i = 0; i < 8; i++) {
    const bx = (rand() - .5) * size * 1.3, by = -rand() * size * .4;
    ellipse(c, bx, by, size * (.25 + rand() * .2), size * (.23 + rand() * .18), i < 4 ? p.dark : p.leaf);
  }
  for (let i = 0; i < 14; i++) { const bx = (rand() - .5) * size, by = -rand() * size * .6; ellipse(c, bx, by, 2.2, 1.2, p.light); }
  c.restore();
}

function tree(c, x, ground, scale, p, seed, flowering = false) {
  const rand = rng(seed); c.save(); c.translate(x, ground); c.scale(scale, scale);
  shape(c, '#8f8968', '#747b5c', 2, q => { q.moveTo(-32, 0); q.bezierCurveTo(-17, -33, -11, -95, -17, -166); q.lineTo(-54, -205); q.lineTo(-39, -216); q.lineTo(-7, -188); q.lineTo(5, -255); q.lineTo(22, -243); q.lineTo(20, -178); q.lineTo(53, -215); q.lineTo(65, -201); q.lineTo(29, -151); q.bezierCurveTo(28, -101, 19, -43, 45, 0); q.bezierCurveTo(14, -10, -6, -9, -32, 0); });
  shape(c, '#b0a17c', null, 0, q => { q.moveTo(-8, -4); q.bezierCurveTo(4, -63, -3, -123, 7, -170); q.lineTo(13, -165); q.bezierCurveTo(9, -94, 13, -34, 22, -2); q.closePath(); });
  line(c, [-13, -21, -6, -73, -7, -119], '#7a8060', 2);
  line(c, [25, -5, 17, -48, 19, -84], '#7a8060', 2);
  for (let i = 0; i < 22; i++) {
    const a = rand() * TAU, r = Math.sqrt(rand()), px = Math.cos(a) * 104 * r, py = -221 + Math.sin(a) * 67 * r;
    ellipse(c, px, py, 48 + rand() * 22, 38 + rand() * 17, i < 8 ? p.dark : i < 15 ? p.leaf : p.light);
  }
  for (let i = 0; i < 85; i++) {
    const a = rand() * TAU, r = Math.sqrt(rand()), px = Math.cos(a) * 124 * r, py = -226 + Math.sin(a) * 75 * r;
    c.globalAlpha = .18 + rand() * .18; ellipse(c, px, py, 4 + rand() * 8, 3 + rand() * 5, rand() > .5 ? '#edf0bd' : p.dark);
  }
  c.globalAlpha = 1;
  if (flowering) for (let i = 0; i < 23; i++) { const a = rand() * TAU, r = Math.sqrt(rand()); flower(c, Math.cos(a) * 112 * r, -220 + Math.sin(a) * 65 * r, 3.5, '#ffe6d8'); }
  // Hanging seed-lanterns and curling vines.
  for (let i = 0; i < 3; i++) { const lx = -79 + i * 74, ly = -162 + i % 2 * 17; line(c, [lx, ly, lx - 5, ly + 28], '#72865e', 1); ellipse(c, lx - 5, ly + 32, 4, 7, '#e5db99'); }
  bush(c, -18, -3, 36, p, seed + 33); bush(c, 33, -2, 25, p, seed + 11);
  c.restore();
}

function cottage(c, x, y, scale, p) {
  c.save(); c.translate(x, y); c.scale(scale, scale);
  ellipse(c, 0, 2, 114, 13, '#5b795b25');
  // Warm little plaster cottage with a tall curved, tiled coral roof.
  shape(c, '#f3e3b6', '#bda882', 2, q => { q.moveTo(-75, 0); q.lineTo(-79, -112); q.quadraticCurveTo(0, -153, 77, -112); q.lineTo(73, 0); q.closePath(); });
  shape(c, '#ddc99c', null, 0, q => { q.moveTo(43, -124); q.lineTo(77, -112); q.lineTo(73, 0); q.lineTo(43, 0); q.closePath(); });
  rounded(c, 33, -189, 21, 56, 3, '#d6c09a', '#af9c7e'); rounded(c, 29, -193, 29, 10, 2, '#a99477');
  line(c, [38, -178, 49, -178], '#b69e7b', 2); line(c, [34, -163, 44, -163], '#b69e7b', 2);
  shape(c, '#b66354', '#9c6656', 2, q => { q.moveTo(-101, -104); q.bezierCurveTo(-93, -157, -49, -207, 1, -211); q.bezierCurveTo(44, -204, 91, -166, 105, -113); q.bezierCurveTo(73, -91, 38, -98, 11, -103); q.bezierCurveTo(-19, -91, -57, -91, -101, -104); });
  shape(c, '#d6866a', null, 0, q => { q.moveTo(-97, -114); q.bezierCurveTo(-78, -164, -43, -200, 0, -208); q.bezierCurveTo(29, -199, 66, -175, 85, -133); q.bezierCurveTo(12, -144, -38, -131, -97, -114); });
  shape(c, '#e9a181', null, 0, q => { q.moveTo(-78, -147); q.bezierCurveTo(-57, -179, -24, -205, 1, -208); q.bezierCurveTo(14, -202, 27, -193, 39, -185); q.bezierCurveTo(-3, -186, -44, -164, -78, -147); });
  for (let row = 0; row < 3; row++) {
    const yy = -127 - row * 23, span = 82 - row * 17;
    c.beginPath(); c.moveTo(-span, yy + 7); c.quadraticCurveTo(0, yy - 12, span, yy + 4); c.strokeStyle = '#ad6656'; c.lineWidth = 1.6; c.stroke();
    for (let j = -2; j <= 2; j++) { const xx = j * 27 + (row % 2) * 12; if (Math.abs(xx) < span - 7) line(c, [xx, yy - 7, xx - 5, yy + 13], '#b56c58', 1.2); }
  }
  // Arched oak door and circular leaded windows.
  shape(c, '#8e9d78', '#788565', 2, q => { q.moveTo(-19, 0); q.lineTo(-19, -59); q.bezierCurveTo(-19, -86, 21, -86, 21, -59); q.lineTo(21, 0); q.closePath(); });
  line(c, [-6, -65, -6, -1], '#708166', 1); line(c, [8, -65, 8, -1], '#708166', 1);
  ellipse(c, 11, -35, 2.3, 2.3, '#e6cb81');
  for (const xx of [-49, 49]) { ellipse(c, xx, -65, 17, 20, '#d6b887', '#a89473', 3); ellipse(c, xx, -65, 12, 15, '#8faea0'); line(c, [xx - 11, -65, xx + 11, -65], '#ead4a8', 2); line(c, [xx, -79, xx, -50], '#ead4a8', 2); rounded(c, xx - 21, -46, 42, 6, 2, '#a79671'); }
  rounded(c, -26, -2, 54, 8, 3, '#c6b597'); rounded(c, -31, 5, 64, 5, 2, '#d6c9aa');
  // Window boxes, climbing ivy, a hand-painted garden sign.
  for (const xx of [-49, 49]) { rounded(c, xx - 18, -39, 36, 10, 2, '#b68a65'); for (let i = 0; i < 5; i++) flower(c, xx - 14 + i * 7, -36, 4, i % 2 ? '#faf0d7' : '#e9b0a1'); }
  line(c, [-70, -5, -78, -35, -69, -63, -76, -95], '#839265', 2);
  for (let i = 0; i < 8; i++) ellipse(c, -72 + Math.sin(i * 2) * 7, -12 - i * 11, 7, 4, p.leaf);
  line(c, [98, 0, 98, -42], '#9e8b66', 4); rounded(c, 78, -48, 42, 20, 4, '#e6d7ad', '#b7a27c'); text(c, '꽃집', 99, -38, '#697f61', 9, 700);
  bush(c, -83, 0, 29, p, 22); bush(c, 77, 0, 24, p, 39);
  c.restore();
}

function ruins(c, x, y, scale, p) {
  c.save(); c.translate(x, y); c.scale(scale, scale);
  for (const side of [-1, 1]) {
    let xx = side * 67;
    rounded(c, xx - 19, -150, 38, 150, 5, '#adaeb0', '#90999f');
    for (let k = 0; k < 5; k++) line(c, [xx - 17, -k * 30, xx + 17, -k * 30], '#919c9d', 1);
    rounded(c, xx - 24, -158, 48, 13, 3, '#c5c3b8'); rounded(c, xx - 25, -11, 50, 11, 2, '#bdbcb2');
    for (let k = 0; k < 3; k++) line(c, [xx - 9 + k * 9, -138, xx - 9 + k * 9, -20], '#c4c4bb', 2);
  }
  shape(c, '#b6b6af', '#969d9e', 2, q => { q.moveTo(-89, -151); q.bezierCurveTo(-90, -258, 90, -258, 89, -151); q.lineTo(49, -151); q.bezierCurveTo(49, -211, -49, -211, -49, -151); q.closePath(); });
  for (let i = 0; i < 6; i++) { const a = Math.PI + i / 5 * Math.PI; line(c, [Math.cos(a) * 54, -151 + Math.sin(a) * 56, Math.cos(a) * 86, -151 + Math.sin(a) * 88], '#929b9b', 1.5); }
  for (let i = 0; i < 12; i++) ellipse(c, -70 + Math.sin(i) * 12, -12 - i * 15, 10, 6, p.leaf);
  bush(c, -66, -3, 32, p, 37); bush(c, 69, -2, 26, p, 41); c.restore();
}

function platform(c, item, p, seed) {
  const { x, y, w, h = 30 } = item; const r = rng(seed);
  shape(c, p.soil, p.soilDark, 1.3, q => { q.moveTo(x, y + 3); q.lineTo(x + w, y + 3); q.lineTo(x + w - 8, y + h * .65); q.lineTo(x + w - 28, y + h + 4); q.lineTo(x + w * .62, y + h + 11); q.lineTo(x + w * .35, y + h + 6); q.lineTo(x + 19, y + h - 4); q.lineTo(x + 5, y + h * .55); q.closePath(); });
  for (let i = 0; i < w / 16; i++) { const px = x + 10 + r() * (w - 20), py = y + 13 + r() * h * .6; ellipse(c, px, py, 3 + r() * 5, 2 + r() * 3, r() > .5 ? p.soilDark : '#dac5a2'); }
  rounded(c, x - 2, y - 2, w + 4, 12, 6, p.dark); rounded(c, x - 3, y - 5, w + 6, 10, 5, p.grass);
  for (let i = 0; i < w / 12; i++) { const px = x + i * 12; line(c, [px, y, px - 3, y - 7, px + 2, y - 4], p.light, 1.5); }
  if (w > 90) { flower(c, x + 18, y - 2, 3, '#fff7dc'); flower(c, x + w - 28, y - 2, 3.3, '#e4c5b3'); }
  // Small roots and trailing ivy make suspended ledges feel organic.
  c.beginPath(); c.moveTo(x + w * .75, y + 10); c.bezierCurveTo(x + w * .78, y + 33, x + w * .65, y + 39, x + w * .72, y + 54); c.strokeStyle = p.leaf; c.lineWidth = 2; c.stroke();
  for (let i = 0; i < 4; i++) ellipse(c, x + w * .73 + Math.sin(i) * 5, y + 17 + i * 9, 4, 2.5, p.leaf);
}

export function drawHero(c, x, y, scale = 1, facing = 1, time = 0, attack = 0, walking = false) {
  c.save(); c.translate(x + 18 * scale, y + 56 * scale); c.scale(scale * facing, scale);
  const bounce = walking ? Math.sin(time * 15) * 1.6 : Math.sin(time * 2) * .6;
  c.translate(0, bounce);
  const step = walking ? Math.sin(time * 15) * 4 : 0;
  // Boots, linen shirt, travelling cloak and little leather satchel.
  rounded(c, -11, -11 - step, 9, 12, 3, '#735c49', '#584c3e'); rounded(c, 3, -11 + step, 9, 12, 3, '#735c49', '#584c3e');
  shape(c, '#63896e', '#466e5c', 1.5, q => { q.moveTo(-12, -38); q.bezierCurveTo(-17, -29, -14, -20, -21, -9); q.quadraticCurveTo(-7, -8, 1, -19); q.lineTo(12, -35); q.closePath(); });
  rounded(c, -10, -34, 23, 23, 6, '#e6d6aa', '#7e7b5c');
  rounded(c, -11, -20, 25, 5, 2, '#8a7656'); rounded(c, 0, -20, 5, 5, 1, '#d6b96a');
  line(c, [-6, -33, 10, -14], '#9d7950', 3); rounded(c, -15, -19, 10, 11, 3, '#b19362', '#846f51');
  ellipse(c, -13, -27, 5, 6, '#f1cba6', '#a78b68');
  // Face and softly rounded chestnut hair.
  ellipse(c, 0, -42, 16, 15, '#edc69e', '#8a7050', 1.3);
  ellipse(c, 14, -41, 3.5, 4, '#f2ccaa');
  shape(c, '#795c41', '#654e39', 1.3, q => { q.moveTo(-16, -39); q.bezierCurveTo(-21, -54, -12, -63, 0, -60); q.bezierCurveTo(9, -65, 22, -53, 17, -41); q.lineTo(10, -47); q.lineTo(7, -42); q.lineTo(1, -49); q.lineTo(-4, -43); q.lineTo(-7, -49); q.lineTo(-13, -38); q.closePath(); });
  shape(c, '#a77d50', null, 0, q => { q.moveTo(-12, -54); q.bezierCurveTo(-2, -61, 8, -58, 13, -51); q.bezierCurveTo(3, -56, -5, -53, -12, -50); q.closePath(); });
  ellipse(c, 4, -41, 1.8, 2.5, '#4a4c3e'); ellipse(c, 12, -41, 1.4, 2.1, '#4a4c3e');
  ellipse(c, 1, -36, 3, 1.3, '#dc9f87'); ellipse(c, 14, -36, 2, 1.2, '#dc9f87'); line(c, [7, -35, 9, -35], '#9b6c55', 1);
  // Leaf clasp and a small feather tucked into the hair.
  ellipse(c, -9, -34, 4, 3, '#a9b974');
  c.save(); c.translate(-11, -55); c.rotate(-.6); ellipse(c, 0, -5, 3, 9, '#8ea37a'); line(c, [0, 1, 0, -11], '#5e7a5c', .7); c.restore();
  // Arm follows sword swing.
  c.save(); c.translate(12, -27); c.rotate(attack > 0 ? -.95 + Math.sin(attack * 15) * .7 : .25);
  ellipse(c, 3, 3, 5, 4, '#efc9a5', '#a68e6b');
  line(c, [7, 6, 7, -4], '#8c7050', 3); line(c, [1, -4, 13, -4], '#c4a663', 3);
  shape(c, '#e8eee3', '#8faaa0', 1, q => { q.moveTo(4, -6); q.lineTo(4, -25); q.lineTo(7, -31); q.lineTo(10, -25); q.lineTo(10, -6); q.closePath(); });
  line(c, [7, -27, 7, -8], '#fff9e5', 1); c.restore();
  c.restore();
}

function gardener(c, x, y, time) {
  c.save(); c.translate(x + 17, y + 56); const b = Math.sin(time * 2) * .6; c.translate(0, b);
  ellipse(c, 0, 2, 22, 5, '#46674825');
  rounded(c, -11, -7, 8, 8, 3, '#836c55'); rounded(c, 4, -7, 8, 8, 3, '#836c55');
  shape(c, '#b3a16b', '#8b8d62', 1, q => { q.moveTo(-11, -35); q.lineTo(11, -35); q.lineTo(20, -7); q.quadraticCurveTo(0, -2, -19, -7); q.closePath(); });
  shape(c, '#eee0b7', '#b8ac83', 1, q => { q.moveTo(-6, -31); q.lineTo(6, -31); q.lineTo(11, -10); q.lineTo(-10, -10); q.closePath(); });
  ellipse(c, 0, -43, 14, 14, '#f0cda9', '#ab8d68');
  ellipse(c, -13, -42, 5, 12, '#d2a56b'); ellipse(c, 12, -42, 5, 12, '#d2a56b');
  ellipse(c, -4, -42, 1.3, 1.8, '#655b48'); ellipse(c, 5, -42, 1.3, 1.8, '#655b48');
  line(c, [-2, -37, 2, -36, 5, -38], '#b68768', 1);
  shape(c, '#d9b680', '#a58b64', 1.3, q => { q.moveTo(-24, -51); q.quadraticCurveTo(-22, -55, -13, -57); q.lineTo(-5, -76); q.quadraticCurveTo(8, -67, 13, -55); q.quadraticCurveTo(30, -50, 24, -47); q.quadraticCurveTo(0, -40, -24, -51); });
  line(c, [-13, -56, 11, -55], '#8e9d70', 5); flower(c, 12, -50, 4, '#f6e7cc');
  ellipse(c, -16, -24, 4, 5, '#eac5a0'); ellipse(c, 15, -25, 4, 5, '#eac5a0');
  rounded(c, 14, -25, 14, 15, 4, '#b9c1a0', '#8c9c79'); line(c, [27, -22, 35, -29], '#97a586', 4); c.restore();
}

function enemy(c, e, time) {
  const w = e.w || 42, h = e.h || 34, cx = e.x + w / 2, bottom = e.y + h;
  const b = Math.sin(time * 4 + e.x) * 2;
  c.save(); c.translate(cx, bottom); if (e.hitTimer > 0) c.globalAlpha = .55 + Math.sin(time * 60) * .25;
  ellipse(c, 0, 1, w * .44, 4, '#3c685329'); c.translate(0, b);
  if (e.type === 'mushroom') {
    ellipse(c, -8, -3, 7, 4, '#ddcaa2'); ellipse(c, 8, -3, 7, 4, '#ddcaa2');
    shape(c, '#f3deb7', '#a58c67', 1.2, q => { q.moveTo(-w * .29, -h * .66); q.lineTo(w * .29, -h * .66); q.lineTo(w * .3, -8); q.quadraticCurveTo(0, 1, -w * .3, -8); q.closePath(); });
    shape(c, '#d89670', '#ae7a58', 1.2, q => { q.moveTo(-w * .53, -h * .43); q.bezierCurveTo(-w * .55, -h * 1.15, w * .51, -h * 1.16, w * .55, -h * .43); q.quadraticCurveTo(0, -h * .28, -w * .53, -h * .43); });
    ellipse(c, -w * .22, -h * .72, 6, 4, '#f8e6ba'); ellipse(c, w * .23, -h * .65, 4, 3, '#f8e6ba'); ellipse(c, w * .02, -h * .91, 4, 2, '#f8e6ba');
    ellipse(c, -5, -h * .27, 1.5, 2, '#665c44'); ellipse(c, 5, -h * .27, 1.5, 2, '#665c44');
  } else if (e.type === 'boss') {
    const s = w / 74; c.scale(s, s);
    shape(c, '#a99c91', '#6e7974', 2, q => { q.moveTo(-31, -4); q.lineTo(-38, -40); q.lineTo(-25, -68); q.lineTo(14, -75); q.lineTo(36, -53); q.lineTo(34, -11); q.lineTo(19, 1); q.closePath(); });
    line(c, [-32, -42, -12, -34, 1, -50, 32, -43], '#7a8276', 3); line(c, [1, -50, 5, -68], '#7a8276', 2);
    rounded(c, -20, -45, 11, 8, 3, '#e5dda2'); rounded(c, 10, -45, 11, 8, 3, '#e5dda2');
    bush(c, -10, -70, 28, PALETTES.forest, 3); flower(c, 3, -79, 7, '#edc6b1');
  } else {
    shape(c, '#a4c38b', '#789a6c', 1.3, q => { q.moveTo(-w * .45, -3); q.bezierCurveTo(-w * .6, -h * .55, -w * .25, -h * .96, 0, -h * .88); q.bezierCurveTo(w * .38, -h * .98, w * .59, -h * .46, w * .45, -3); q.quadraticCurveTo(0, 5, -w * .45, -3); });
    ellipse(c, -w * .12, -h * .66, w * .17, h * .1, '#c5d89f');
    line(c, [0, -h * .86, 1, -h * 1.13], '#6c8a5c', 2);
    c.save(); c.translate(0, -h); c.rotate(-.4); ellipse(c, -6, -3, 8, 3.5, '#7eaa6b'); c.rotate(.8); ellipse(c, 7, -4, 8, 3.5, '#b8cc88'); c.restore();
    ellipse(c, -w * .15, -h * .39, 1.8, 2.5, '#52674e'); ellipse(c, w * .15, -h * .39, 1.8, 2.5, '#52674e');
    ellipse(c, -w * .28, -h * .25, 4, 1.8, '#d8b3a0'); ellipse(c, w * .28, -h * .25, 4, 1.8, '#d8b3a0');
  }
  c.restore();
  if (e.hp < e.maxHp) { rounded(c, cx - 20, e.y - 12, 40, 4, 2, '#58756144'); rounded(c, cx - 20, e.y - 12, 40 * Math.max(0, e.hp / e.maxHp), 4, 2, '#d78b70'); }
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.cameraX = 0; this.viewWidth = 1067; this.scale = 1; this.cache = new Map(); this.lastRegion = null;
    this.resize(); this.observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => this.resize()) : null; this.observer?.observe(canvas);
  }
  resize() {
    const rect = this.canvas.getBoundingClientRect(), width = Math.max(1, rect.width || 1067), height = Math.max(1, rect.height || 600), dpr = Math.min(2, globalThis.devicePixelRatio || 1);
    this.canvas.width = Math.round(width * dpr); this.canvas.height = Math.round(height * dpr); this.scale = this.canvas.height / 600; this.viewWidth = this.canvas.width / this.scale;
  }
  scenery(state) {
    const key = `${state.region}:${state.worldWidth}`;
    if (this.cache.has(key)) return this.cache.get(key);
    const layer = document.createElement('canvas'); layer.width = state.worldWidth || 3200; layer.height = 600; const c = layer.getContext('2d'); const p = PALETTES[state.region] || PALETTES.meadow, rand = rng(994);
    // A complete illustrated landscape, cached once per region.
    if (state.region === 'ruins') { ruins(c, 540, 480, 1.1, p); ruins(c, 1910, 480, 1.45, p); tree(c, 30, 480, 1.15, p, 6); tree(c, 1330, 480, 1.2, p, 8); }
    else { tree(c, 60, 480, 1.6, p, 46, state.region === 'meadow'); cottage(c, 570, 480, 1.05, p); tree(c, 1440, 480, 1.35, p, 84, state.region === 'meadow'); tree(c, 2210, 480, 1.7, p, 92, state.region === 'meadow'); cottage(c, 2820, 480, .78, p); }
    for (let x = 120; x < layer.width; x += 113 + rand() * 92) { if (x > 390 && x < 700) continue; bush(c, x, 480, 20 + rand() * 24, p, Math.round(x)); }
    // Beneath the grass, soft ochre earth dotted with stones and fine roots.
    const earth = c.createLinearGradient(0, 480, 0, 600); earth.addColorStop(0, p.soil); earth.addColorStop(1, '#cbbb99'); c.fillStyle = earth; c.fillRect(0, 480, layer.width, 120);
    c.fillStyle = p.soilDark; c.globalAlpha = .22; c.fillRect(0, 489, layer.width, 11); c.globalAlpha = 1;
    for (let i = 0; i < layer.width / 9; i++) { const xx = rand() * layer.width, yy = 502 + rand() * 96; ellipse(c, xx, yy, 1.5 + rand() * 5, 1 + rand() * 2, rand() > .6 ? '#e1d2b0' : `${p.soilDark}59`); }
    for (let x = 18; x < layer.width; x += 73 + rand() * 80) { c.beginPath(); c.moveTo(x, 495); c.bezierCurveTo(x - 3, 505, x + 12, 514, x + 7, 524); c.strokeStyle = `${p.soilDark}66`; c.lineWidth = 1; c.stroke(); }
    // Scalloped moss gives the ground a physical edge.
    for (let x = -5; x < layer.width + 10; x += 15) ellipse(c, x, 484, 12, 7 + rand() * 4, p.dark);
    c.fillStyle = p.grass; c.fillRect(0, 474, layer.width, 9);
    for (let x = -5; x < layer.width + 10; x += 12) ellipse(c, x, 476, 10, 5 + rand() * 3, p.grass);
    for (let x = 2; x < layer.width; x += 7 + rand() * 10) {
      const yy = 477, h = 4 + rand() * 10; line(c, [x - 3, yy, x - 5, yy - h, x, yy - 3, x + 3, yy - h * .8], rand() > .5 ? p.light : '#8da56f', 1.1);
      if (rand() > .80) flower(c, x, 478, 2.5 + rand() * 2.2, ['#f7eed1', '#f0d6bd', '#e7c0b3', '#d7dee0'][Math.floor(rand() * 4)], rand() * 2);
    }
    // Small round paving stones beside the florist's door.
    if (state.region !== 'ruins') for (let i = 0; i < 5; i++) ellipse(c, 560 + (i - 2) * 19, 486 + (i % 2) * 3, 9, 3, '#dad0b1', '#baa98a');
    this.cache.set(key, layer); return layer;
  }
  sky(state) {
    const c = this.ctx, width = this.viewWidth, p = PALETTES[state.region] || PALETTES.meadow, time = state.time || 0;
    const sky = c.createLinearGradient(0, 0, 0, 485); sky.addColorStop(0, p.sky); sky.addColorStop(.72, p.horizon); sky.addColorStop(1, '#ede9c8'); c.fillStyle = sky; c.fillRect(0, 0, width, 600);
    const sunX = width * .7 - this.cameraX * .025, sunY = 96;
    const halo = c.createRadialGradient(sunX, sunY, 15, sunX, sunY, 160); halo.addColorStop(0, '#fffbd9b0'); halo.addColorStop(1, '#fffbd900'); c.fillStyle = halo; c.fillRect(sunX - 160, sunY - 160, 320, 320); ellipse(c, sunX, sunY, 30, 30, '#fff8db');
    // Long warm light shafts are deliberately subtle.
    c.globalAlpha = .095; for (let i = 0; i < 3; i++) shape(c, '#fffbea', null, 0, q => { q.moveTo(sunX + i * 22, sunY); q.lineTo(sunX - 150 + i * 55, 480); q.lineTo(sunX - 80 + i * 55, 480); q.closePath(); }); c.globalAlpha = 1;
    for (let i = -1; i < 7; i++) cloud(c, i * 270 - (this.cameraX * .08) % 270 + Math.sin(time * .025) * 9, 88 + Math.sin(i * 2.4) * 32, .65 + (i % 3) * .18, .56);
    const mountain = (color, y, amplitude, factor, seed) => {
      const rand = rng(seed), offset = this.cameraX * factor;
      shape(c, color, null, 0, q => { q.moveTo(-400, 490); q.lineTo(-400, y); for (let x = -400; x < width + 500; x += 185) { let yy = y - rand() * amplitude; q.quadraticCurveTo(x + 90, yy - 70, x + 185, y + rand() * 24); } q.lineTo(width + 500, 490); q.closePath(); });
    };
    c.save(); c.translate(-((this.cameraX * .09) % 200), 0); mountain(p.distant, 299, 62, .09, 82); c.restore();
    c.save(); c.translate(-((this.cameraX * .18) % 240), 0); mountain(p.mountain, 357, 64, .18, 69); c.restore();
    // Tiny village silhouettes nestled in the far hillside.
    c.save(); c.translate(-this.cameraX * .18, 0); c.globalAlpha = .35;
    for (let i = 0; i < 12; i++) { const xx = 120 + i * 190, yy = 346 + Math.sin(i * 1.7) * 12; rounded(c, xx, yy, 24, 31, 2, '#e7e5c6'); shape(c, p.dark, null, 0, q => { q.moveTo(xx - 4, yy); q.lineTo(xx + 12, yy - 22); q.lineTo(xx + 28, yy); q.closePath(); }); }
    c.restore();
    // Layered distant woodland. The broad rounded shapes match foreground trees.
    c.save(); c.translate(-((this.cameraX * .32) % 130), 0);
    for (let i = -1; i < width / 115 + 3; i++) { const xx = i * 115, yy = 391 + Math.sin(i * 3) * 17; ellipse(c, xx, yy, 80, 58, p.forest); ellipse(c, xx - 27, yy - 29, 39, 43, p.forest); line(c, [xx, yy - 19, xx + 4, 477], `${p.dark}40`, 5); }
    c.restore();
    const mist = c.createLinearGradient(0, 360, 0, 475); mist.addColorStop(0, '#eef1d000'); mist.addColorStop(1, '#eef1d05c'); c.fillStyle = mist; c.fillRect(0, 350, width, 125);
  }
  render(state, dt = 1 / 60) {
    if (!state?.player || !this.ctx) return;
    const c = this.ctx, p = PALETTES[state.region] || PALETTES.meadow, pl = state.player, time = state.time || 0;
    const target = Math.max(0, Math.min((state.worldWidth || 3200) - this.viewWidth, pl.x - this.viewWidth * .39));
    if (this.lastRegion !== state.region || Math.abs(target - this.cameraX) > this.viewWidth) { this.cameraX = target; this.lastRegion = state.region; }
    else this.cameraX += (target - this.cameraX) * Math.min(1, Math.max(0, dt) * 7);
    c.setTransform(this.scale, 0, 0, this.scale, 0, 0); c.clearRect(0, 0, this.viewWidth, 600); this.sky(state);
    c.save(); c.translate(-this.cameraX, 0); c.drawImage(this.scenery(state), 0, 0);
    for (const ledge of state.platforms || []) { if (ledge.y >= 475 || ledge.x + ledge.w < this.cameraX - 60 || ledge.x > this.cameraX + this.viewWidth + 60) continue; platform(c, ledge, p, Math.round(ledge.x)); }
    // Ribbon of light at the edge of the world.
    if (state.portal) {
      const portal = state.portal, px = portal.x + 24, py = (portal.y ?? 390) + 42;
      c.save(); c.translate(px, py); const glow = c.createRadialGradient(0, 0, 9, 0, 0, 75); glow.addColorStop(0, '#fff0bb88'); glow.addColorStop(1, '#fff0bb00'); c.fillStyle = glow; c.fillRect(-75, -75, 150, 150);
      c.beginPath(); c.ellipse(0, 0, 23 + Math.sin(time * 2) * 2, 43, 0, 0, TAU); c.strokeStyle = '#fff5c8'; c.lineWidth = 4; c.stroke(); c.beginPath(); c.ellipse(0, 0, 17, 36, 0, 0, TAU); c.strokeStyle = '#d8e9bb'; c.lineWidth = 2; c.stroke();
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + time * .5; ellipse(c, Math.cos(a) * 24, Math.sin(a) * 44, 1.7, 1.7, '#fff9db'); }
      rounded(c, -42, 53, 84, 21, 10, '#46674dc4'); text(c, '다음 지역  E', 0, 64, '#f9f6df', 10); c.restore();
    }
    for (const e of state.enemies || []) if (e.alive !== false && e.hp > 0 && e.x > this.cameraX - 80 && e.x < this.cameraX + this.viewWidth + 80) enemy(c, e, time);
    if (state.npc) {
      gardener(c, state.npc.x, state.npc.y, time);
      const nx = state.npc.x + 17, ny = state.npc.y;
      rounded(c, nx - 31, ny - 47, 62, 20, 10, '#fff7e8ec'); text(c, state.npc.name || '정원사 루미', nx, ny - 37, '#637755', 9, 700);
      const ready = state.quest && !state.quest.claimed && state.quest.kills >= state.quest.target;
      ellipse(c, nx, ny - 68 + Math.sin(time * 3) * 3, 9, 11, ready ? '#ecd178' : '#f0e3bc', '#d5bd81', 1); text(c, ready ? '✓' : '!', nx, ny - 68 + Math.sin(time * 3) * 3, '#826e47', 12, 800);
      if (Math.abs(pl.x - state.npc.x) < 100 && state.started) { rounded(c, nx - 39, state.npc.y + 65, 78, 20, 7, '#fff9e9eb'); text(c, 'E  대화하기', nx, state.npc.y + 75, '#66764e', 10, 700); }
    }
    ellipse(c, pl.x + pl.w / 2, Math.min(484, pl.y + pl.h + 2), 20, 4, '#33583e2b');
    c.save(); if (pl.invincible > 0) c.globalAlpha = .6 + Math.sin(time * 35) * .25;
    drawHero(c, pl.x, pl.y + pl.h - 56, 1, pl.facing, time, pl.attackTimer || 0, Math.abs(pl.vx || 0) > 5 && pl.grounded); c.restore();
    rounded(c, pl.x + pl.w / 2 - 36, pl.y - 21, 72, 17, 8, '#fdfbefdb'); text(c, '새싹 모험가', pl.x + pl.w / 2, pl.y - 12, '#5c7455', 9, 700);
    if (pl.attackTimer > 0) {
      c.save(); c.translate(pl.x + pl.w / 2, pl.y + pl.h * .55); c.scale(pl.facing, 1); c.globalAlpha = Math.min(1, pl.attackTimer * 6);
      c.beginPath(); c.arc(0, 0, 62, -.95, .75); c.strokeStyle = '#fff9d5'; c.lineWidth = 9; c.stroke(); c.beginPath(); c.arc(2, 0, 70, -.8, .5); c.strokeStyle = '#e6d893aa'; c.lineWidth = 3; c.stroke(); c.restore();
    }
    if (pl.skillTimer > 0) { c.save(); c.globalAlpha = Math.min(.6, pl.skillTimer * .4); c.beginPath(); c.ellipse(pl.x + pl.w / 2, pl.y + pl.h, 48, 10, 0, 0, TAU); c.strokeStyle = '#d5efbc'; c.lineWidth = 3; c.stroke(); c.restore(); }
    for (const part of state.particles || []) { c.save(); c.globalAlpha = Math.max(0, Math.min(1, part.life / (part.maxLife || 1))); ellipse(c, part.x, part.y, part.size || 3, part.size || 3, part.color || '#fff2b6'); c.restore(); }
    for (const floater of state.floaters || []) { c.save(); c.globalAlpha = Math.max(0, Math.min(1, floater.life * 2)); c.shadowColor = '#55534055'; c.shadowBlur = 3; text(c, floater.text, floater.x, floater.y, floater.color || '#fff8d9', 18, 800); c.restore(); }
    c.restore();
    // Windblown petals, butterflies and seed lights bring the landscape to life.
    for (let i = 0; i < 16; i++) {
      const xx = ((i * 143 + time * (4 + i % 4) - this.cameraX * .45) % (this.viewWidth + 70) + this.viewWidth + 70) % (this.viewWidth + 70) - 35;
      const yy = 130 + (i * 67) % 310 + Math.sin(time * .7 + i) * 15;
      c.save(); c.translate(xx, yy); c.rotate(Math.sin(time + i) * .8); c.globalAlpha = .35 + Math.sin(time * 1.5 + i) * .2; ellipse(c, 0, 0, i % 3 === 0 ? 3 : 1.4, i % 3 === 0 ? 1.3 : 1.4, i % 3 === 0 ? '#fff0dd' : '#fffde0'); c.restore();
    }
    for (let i = 0; i < 3; i++) {
      const xx = ((270 + i * 353 + Math.sin(time * .35 + i) * 80 - this.cameraX * .8) % (this.viewWidth + 60) + this.viewWidth + 60) % (this.viewWidth + 60), yy = 354 + Math.sin(time * .8 + i) * 24;
      const flap = .4 + Math.abs(Math.sin(time * 8 + i)) * .6; ellipse(c, xx - 3, yy, 4 * flap, 3, '#f2e6be'); ellipse(c, xx + 3, yy, 4 * flap, 3, '#fff8d8'); line(c, [xx, yy - 2, xx, yy + 3], '#8d9875', .7);
    }
    // A vignette grounds the warm palette without darkening the playfield.
    const bottom = c.createLinearGradient(0, 560, 0, 600); bottom.addColorStop(0, '#7c785400'); bottom.addColorStop(1, '#7c785414'); c.fillStyle = bottom; c.fillRect(0, 560, this.viewWidth, 40);
    c.setTransform(1, 0, 0, 1, 0, 0);
  }
  destroy() { this.observer?.disconnect(); this.cache.clear(); }
}
