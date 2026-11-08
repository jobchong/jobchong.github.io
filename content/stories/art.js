/* art.js: pen-and-watercolour pictures, drawn as SVG.
 *
 * Every sprite lives in a 100 x 100 box and stands on y = 96.
 * Each one is drawn twice: once as a soft colour wash (no outlines) and
 * once as a wobbly ink line (no fills). The two passes don't quite line up,
 * which is what makes it look like an old picture book.
 *
 * Shape classes used inside sprites:
 *   solid : filled with ink in the line pass (eyes, spots); skipped in the wash
 *   nol   : colour only, no ink outline (cheeks, bellies, highlights)
 *   fine  : thinner ink line (whiskers, strings)
 *   label : ink text (words on the word tree)
 */
(function (global) {
  'use strict';

  const C = {
    ink: '#2a1f17', paper: '#f4ead3',
    red: '#c0462f', deepred: '#8e3324', brick: '#c98f6c', rose: '#d9786a', pink: '#eaa797',
    rust: '#c8692e', ginger: '#dc9450', orange: '#e48a3a',
    ochre: '#d9a23a', gold: '#d8a531', butter: '#f2d98b', cream: '#f3e6c8', white: '#fbf6ea',
    green: '#86a456', leaf: '#5d7f3e', pea: '#a9c862', moss: '#6f8f45',
    sky: '#b4cde0', blue: '#7fa3c4', navy: '#2f4a72', teal: '#5d938f',
    brown: '#8a5a3b', tan: '#c49a62', bark: '#7a5236', rabbit: '#a98463',
    grey: '#a39a90', rat: '#8c7d6e', silver: '#cfcac0', black: '#4a3d44', plum: '#5b3a5e'
  };

  /* ---------- little helpers ---------- */
  const f = (n) => Math.round(n * 10) / 10;
  function rng(seed) {
    let s = (seed >>> 0) || 1;
    return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  }
  // smooth closed curve through points (Catmull-Rom to Bezier)
  function smooth(p) {
    const n = p.length, g = (i) => p[(i + n) % n];
    let d = `M${f(p[0][0])} ${f(p[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ` +
        `${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + 'Z';
  }
  // scalloped "cloud" outline: treetops, bushes, hedges, sheep
  function cloud(cx, cy, rx, ry, n = 9, seed = 1) {
    const r = rng(seed), pts = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2, j = 0.88 + r() * 0.24;
      pts.push([cx + Math.cos(t) * rx * j, cy + Math.sin(t) * ry * j]);
    }
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 1; i <= n; i++) {
      const a = pts[i - 1], b = pts[i % n];
      const rr = (Math.hypot(b[0] - a[0], b[1] - a[1]) / 2) * (1.02 + r() * 0.25);
      d += `A${f(rr)} ${f(rr)} 0 0 1 ${f(b[0])} ${f(b[1])}`;
    }
    return d + 'Z';
  }
  // the irregular vignette that the background is painted inside
  function vignette(cx, cy, a, b, seed) {
    const r = rng(seed), pts = [], n = 30, ph = r() * 6;
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      const k = 1 + 0.035 * Math.sin(5 * t + ph) + 0.025 * Math.sin(11 * t + ph * 2) + (r() - 0.5) * 0.03;
      pts.push([cx + a * k * Math.sign(c) * Math.pow(Math.abs(c), 0.5), cy + b * k * Math.sign(s) * Math.pow(Math.abs(s), 0.5)]);
    }
    return smooth(pts);
  }
  const star5 = (cx, cy, R, r = R * 0.45) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + f(cx + Math.cos(a) * rad) + ' ' + f(cy + Math.sin(a) * rad);
    }
    return d + 'Z';
  };

  /* ---------- sprites ---------- */
  const S = {};
  const META = {}; // sky: no ground shadow; w: shadow width factor

  S.cat = (o = {}) => `
<path fill="${C.ginger}" d="M64 91C84 93 95 76 88 62C85 57 80 59 82 63C87 74 81 85 63 85Z"/>
<path fill="${C.ginger}" d="M30 96C22 74 32 52 50 52C68 52 78 74 70 96Z"/>
<ellipse class="nol" fill="${C.cream}" cx="50" cy="80" rx="11" ry="14"/>
<path fill="none" d="M32 70q5 2 8 0M30 80q5 2 8 0M68 70q-5 2-8 0M70 80q-5 2-8 0"/>
<path fill="${C.ginger}" d="M35 31L37 13L48 24Z"/><path fill="${C.ginger}" d="M65 31L63 13L52 24Z"/>
<path class="nol" fill="${C.pink}" d="M38 26L39 18L44 23Z"/><path class="nol" fill="${C.pink}" d="M62 26L61 18L56 23Z"/>
<circle fill="${C.ginger}" cx="50" cy="38" r="17"/>
<path fill="none" d="M45 23l1.5 5M50 22v6M55 23l-1.5 5"/>
${o.sleep || o.happy ? `<path fill="none" d="M41 37q3 2.5 6 0M53 37q3 2.5 6 0"/>`
      : `<ellipse class="solid" cx="44" cy="37" rx="2" ry="2.7"/><ellipse class="solid" cx="56" cy="37" rx="2" ry="2.7"/>`}
<circle class="nol" fill="${C.rose}" opacity=".45" cx="39" cy="44" r="3.5"/><circle class="nol" fill="${C.rose}" opacity=".45" cx="61" cy="44" r="3.5"/>
<path fill="${C.pink}" d="M47.5 42.5h5l-2.5 3z"/>
${o.sad ? `<path fill="none" d="M45 50q5-4 10 0"/>` : `<path fill="none" d="M50 45.5q-2 4-6 3M50 45.5q2 4 6 3"/>`}
<path class="fine" fill="none" d="M41 44L27 41M41 46.5L27 49M59 44L73 41M59 46.5L73 49"/>
<ellipse fill="${C.ginger}" cx="43" cy="94" rx="6" ry="3.5"/><ellipse fill="${C.ginger}" cx="57" cy="94" rx="6" ry="3.5"/>
${o.hat ? `<g transform="translate(31 -13) rotate(-10 19 30) scale(.38)">${S.hat()}</g>` : ''}`;

  S.dog = (o = {}) => `
<path fill="${C.brown}" d="M68 88C82 86 88 74 84 64C83 61 79 62 80 65C82 74 78 81 66 82Z"/>
<path fill="${C.tan}" d="M28 96C22 74 32 54 50 54C68 54 78 74 72 96Z"/>
<path class="nol" fill="${C.white}" d="M42 58C46 70 54 70 58 58C58 80 42 80 42 58Z"/>
<ellipse fill="${C.tan}" cx="50" cy="38" rx="18" ry="16"/>
<ellipse class="nol" fill="${C.brown}" cx="57.5" cy="33" rx="6" ry="5"/>
<path fill="${C.brown}" d="M35 27C24 29 21 44 26 52C30 56 35 50 37 40Z"/>
<path fill="${C.brown}" d="M65 27C76 29 79 44 74 52C70 56 65 50 63 40Z"/>
<ellipse fill="${C.white}" cx="50" cy="46" rx="9.5" ry="7"/>
${o.sad ? `<ellipse class="solid" cx="43" cy="35" rx="2" ry="2.4"/><ellipse class="solid" cx="57" cy="35" rx="2" ry="2.4"/>`
      : `<path fill="none" d="M40 35q3-3.5 6 0M54 35q3-3.5 6 0"/>`}
<ellipse class="solid" cx="50" cy="42" rx="3.4" ry="2.5"/>
${o.sad ? `<path fill="none" d="M45 51q5-3 10 0"/>` : `<path fill="${C.rose}" d="M43.5 47Q50 58 56.5 47Q50 50 43.5 47Z"/>`}
<ellipse fill="${C.tan}" cx="42" cy="94" rx="7" ry="3.5"/><ellipse fill="${C.tan}" cx="58" cy="94" rx="7" ry="3.5"/>`;

  S.cow = () => `
<path fill="none" d="M19 46C11 52 10 63 12 72"/><path fill="${C.black}" d="M12 69l-4 9 7-1z"/>
<rect fill="${C.cream}" x="24" y="64" width="8" height="30" rx="3"/><rect fill="${C.cream}" x="35" y="64" width="8" height="30" rx="3"/>
<rect fill="${C.cream}" x="62" y="64" width="8" height="30" rx="3"/><rect fill="${C.cream}" x="72" y="64" width="8" height="30" rx="3"/>
<path class="nol" fill="${C.black}" d="M24 90h8v4h-8zM35 90h8v4h-8zM62 90h8v4h-8zM72 90h8v4h-8z"/>
<path fill="${C.cream}" d="M18 48C18 36 30 34 50 34C68 34 78 36 80 46L80 64C80 72 72 74 50 74C28 74 18 72 18 64Z"/>
<path class="nol" fill="${C.black}" opacity=".85" d="M28 40C35 37 42 42 40 48C38 54 29 54 27 48Z"/>
<path class="nol" fill="${C.black}" opacity=".85" d="M55 51C62 49 68 53 66 59C62 66 53 62 55 51Z"/>
<path fill="${C.pink}" d="M53 73q4 7 9 0z"/>
<path fill="${C.cream}" d="M77 35l-9-3 6 7z"/>
<path fill="${C.butter}" d="M80 30q-3-7 2-10q-1 5 2 9z"/><path fill="${C.butter}" d="M88 29q1-7 6-8q-3 4-2 9z"/>
<path fill="${C.cream}" d="M76 36C79 27 92 26 95 37L97 49C97 56 87 58 82 52Z"/>
<ellipse fill="${C.pink}" cx="91" cy="52" rx="7.5" ry="5.5"/>
<circle class="solid" cx="88.5" cy="52" r="1.1"/><circle class="solid" cx="93.5" cy="52" r="1.1"/>
<circle class="solid" cx="86" cy="40" r="1.8"/>`;
  META.cow = { w: 1.3 };

  S.moon = (o = {}) => `
<path fill="${C.butter}" d="M62 10A42 42 0 1 0 62 90A50 50 0 0 1 62 10Z"/>
${o.face === false ? '' : `<path fill="none" d="M22 40q4 3 8 0"/>
<circle class="nol" fill="${C.rose}" opacity=".45" cx="27" cy="55" r="4"/>
<path fill="none" d="M20 63q6 5 12-1"/>`}`;
  META.moon = { sky: true };

  S.star = (o = {}) => `<path fill="${C.butter}" d="${star5(50, 52, 44)}"/>
${o.face ? `${o.sleep ? `<path fill="none" d="M39 50q3.5 3 7 0M54 50q3.5 3 7 0"/>` : `<ellipse class="solid" cx="43" cy="50" rx="2.2" ry="2.9"/><ellipse class="solid" cx="57" cy="50" rx="2.2" ry="2.9"/>`}
<circle class="nol" fill="${C.rose}" opacity=".5" cx="37" cy="59" r="3.6"/><circle class="nol" fill="${C.rose}" opacity=".5" cx="63" cy="59" r="3.6"/>
<path fill="none" d="M44 60q6 5.5 12 0"/>` : ''}`;
  META.star = { sky: true };

  S.sun = (o = {}) => {
    let rays = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, b = a + 0.17, c = a - 0.17;
      rays += `M${f(50 + Math.cos(c) * 30)} ${f(50 + Math.sin(c) * 30)}L${f(50 + Math.cos(a) * 47)} ${f(50 + Math.sin(a) * 47)}L${f(50 + Math.cos(b) * 30)} ${f(50 + Math.sin(b) * 30)}Z`;
    }
    return `<path fill="${C.ochre}" d="${rays}"/>
<circle fill="${C.butter}" cx="50" cy="50" r="29"/>
${o.face === false ? '' : o.wow ? `<circle fill="${C.white}" cx="42" cy="44" r="5"/><circle fill="${C.white}" cx="58" cy="44" r="5"/><circle class="solid" cx="42" cy="44.5" r="2.4"/><circle class="solid" cx="58" cy="44.5" r="2.4"/>
<path fill="none" d="M36 35q6-4 11 0M53 35q5-4 11 0"/><circle class="nol" fill="${C.rose}" opacity=".45" cx="35" cy="55" r="4"/><circle class="nol" fill="${C.rose}" opacity=".45" cx="65" cy="55" r="4"/>
<ellipse fill="${C.rose}" cx="50" cy="61" rx="4.5" ry="5.5"/>` : `<path fill="none" d="${o.sleep ? 'M38 46q4 3.5 8 0M54 46q4 3.5 8 0' : 'M38 45q4-4 8 0M54 45q4-4 8 0'}"/>
<circle class="nol" fill="${C.rose}" opacity=".45" cx="37" cy="56" r="4"/><circle class="nol" fill="${C.rose}" opacity=".45" cx="63" cy="56" r="4"/>
${o.sleep ? `<ellipse fill="${C.rose}" cx="50" cy="61" rx="3.2" ry="3.8"/>` : `<path fill="none" d="M41 60q9 8 18 0"/>`}`}`;
  };
  META.sun = { sky: true };

  S.dish = () => `
<path fill="none" d="M36 72l-7 15h-6M52 72l7 13 7-2"/>
<path fill="none" d="M22 48l-10-7M66 50l13-3"/>
<circle fill="${C.white}" cx="44" cy="48" r="24"/>
<path class="nol" fill="${C.blue}" fill-rule="evenodd" d="M25 48a19 19 0 1 0 38 0a19 19 0 1 0-38 0M29 48a15 15 0 1 0 30 0a15 15 0 1 0-30 0"/>
<circle fill="none" class="fine" cx="44" cy="48" r="15"/>
<ellipse class="solid" cx="38" cy="45" rx="1.8" ry="2.3"/><ellipse class="solid" cx="50" cy="45" rx="1.8" ry="2.3"/>
<path fill="none" d="M38 53q6 5 12 0"/>`;

  S.spoon = (o = {}) => `
${o.legs === false ? '' : `<path fill="none" d="M49 71l-7 15h-6M53 71l6 14 7-1"/><path fill="none" d="M45 50l-13 3M57 48l11-7"/>`}
<path fill="${C.silver}" d="M48 38L46 74Q51 78 56 74L54 38Z"/>
<ellipse fill="${C.silver}" cx="51" cy="25" rx="12.5" ry="16"/>
<ellipse class="nol" fill="${C.white}" cx="47" cy="19" rx="3" ry="6"/>
${o.legs === false ? '' : `<ellipse class="solid" cx="47" cy="25" rx="1.6" ry="2.1"/><ellipse class="solid" cx="55" cy="25" rx="1.6" ry="2.1"/>
<path fill="none" d="M46 31q5 4 10 0"/>`}`;

  S.fiddle = () => `
<path fill="none" d="M16 26L88 82"/>
<g transform="rotate(-35 50 50)">
<path fill="${C.rust}" d="M50 40C40 40 36 46 38 52C40 56 40 58 38 62C35 70 40 80 50 80C60 80 65 70 62 62C60 58 60 56 62 52C64 46 60 40 50 40Z"/>
<rect fill="${C.black}" x="47.5" y="14" width="5" height="32"/>
<circle fill="${C.rust}" cx="50" cy="12" r="3.5"/>
<path fill="none" class="fine" d="M44 55q-2 4 0 8M56 55q2 4 0 8"/>
<rect fill="${C.black}" x="46" y="66" width="8" height="12" rx="2"/>
<path fill="none" class="fine" d="M49 14V70M51 14V70"/>
</g>`;

  S.box = () => `
<path fill="#a97c48" d="M42 42L86 46L84 33L44 29Z"/>
<path fill="#5a3e28" d="M18 50L42 42L86 46L62 56Z"/>
<path fill="${C.tan}" d="M18 50L42 42L33 30L8 39Z"/>
<path fill="${C.tan}" d="M18 50L62 56L62 96L18 90Z"/>
<path fill="#a97c48" d="M62 56L86 46L86 84L62 96Z"/>
<path fill="#b88d58" d="M86 46L62 56L71 65L95 54Z"/>
<path fill="none" class="fine" d="M24 64l30 4M24 70l18 2.5"/>`;
  META.box = { w: 1.2 };

  S.frog = (o = {}) => `
<ellipse fill="${C.green}" cx="27" cy="86" rx="14" ry="9"/><ellipse fill="${C.green}" cx="73" cy="86" rx="14" ry="9"/>
<ellipse fill="${C.green}" cx="50" cy="72" rx="27" ry="21"/>
<ellipse class="nol" fill="${C.butter}" cx="50" cy="80" rx="15" ry="12"/>
<circle class="nol" fill="${C.leaf}" cx="34" cy="70" r="3"/><circle class="nol" fill="${C.leaf}" cx="66" cy="66" r="2.5"/>
<circle fill="${C.green}" cx="37" cy="53" r="9.5"/><circle fill="${C.green}" cx="63" cy="53" r="9.5"/>
<circle fill="${C.white}" cx="37" cy="52" r="6"/><circle fill="${C.white}" cx="63" cy="52" r="6"/>
<circle class="solid" cx="38" cy="53" r="2.8"/><circle class="solid" cx="62" cy="53" r="2.8"/>
<path fill="none" d="M33 67Q50 79 67 67"/>
<ellipse fill="${C.green}" cx="40" cy="94" rx="6" ry="2.6"/><ellipse fill="${C.green}" cx="60" cy="94" rx="6" ry="2.6"/>${o.crown ? `<path fill="${C.gold}" d="M40 47L38 33L44 39L50 30L56 39L62 33L60 47Z"/>` : ''}`;

  S.hat = () => `
<ellipse fill="${C.black}" cx="50" cy="88" rx="40" ry="8"/>
<path fill="${C.black}" d="M28 88L31 30Q50 24 69 30L72 88Q50 95 28 88Z"/>
<ellipse fill="#645461" cx="50" cy="30" rx="19" ry="5"/>
<path fill="${C.red}" d="M29.4 72Q50 78 70.6 72L71.2 82Q50 89 28.8 82Z"/>
<path class="nol" fill="#8a7a86" d="M36 36L38 70L41 70L40 36Z"/>`;
  META.hat = { w: 1.2 };

  S.mouse = (o = {}) => {
    const col = o.rat ? C.rat : C.grey;
    return `
<path fill="none" d="${o.rat ? 'M24 86C4 88-2 72 6 60' : 'M24 86C8 84 6 70 14 64'}"/>
<circle fill="${col}" cx="${o.rat ? 66 : 64}" cy="${o.rat ? 55 : 52}" r="${o.rat ? 8 : 10}"/>
<circle class="nol" fill="${C.pink}" cx="${o.rat ? 66 : 64}" cy="${o.rat ? 56 : 53}" r="${o.rat ? 4.5 : 6}"/>
<path fill="${col}" d="M22 90C18 70 34 58 52 60C66 62 72 74 70 90Z"/>
<path class="nol" fill="${C.cream}" opacity=".6" d="M40 88C40 78 50 72 60 76C64 80 64 86 62 88Z"/>
<path fill="${col}" d="M58 66C60 54 72 50 84 60C88 63 91 66 94 69C88 73 80 75 70 74Z"/>
<circle class="solid" cx="77" cy="62" r="1.9"/>
${o.rat ? `<path fill="none" d="M73 57.5l7 1.5"/>` : ''}
<circle fill="${C.pink}" cx="93.5" cy="69" r="2.3"/>
<path class="fine" fill="none" d="M88 69l10-4M88 71l10 2"/>
<ellipse fill="${C.pink}" cx="38" cy="92" rx="7" ry="3"/><ellipse fill="${C.pink}" cx="60" cy="92" rx="7" ry="3"/>`;
  };

  S.tub = () => `
<path fill="${C.gold}" d="M22 80l-5 13h9l3-11Z"/><path fill="${C.gold}" d="M78 80l5 13h-9l-3-11Z"/>
<circle fill="#e5eef2" cx="28" cy="44" r="7"/><circle fill="#e5eef2" cx="41" cy="40" r="9"/>
<circle fill="#e5eef2" cx="57" cy="43" r="7.5"/><circle fill="#e5eef2" cx="70" cy="41" r="8"/>
<circle fill="#e5eef2" cx="64" cy="30" r="3"/><circle fill="#e5eef2" cx="35" cy="28" r="2.5"/>
<path fill="${C.gold}" d="M85 48V35Q85 30 80 30H73V34.5H80.5V48Z"/>
<path fill="${C.teal}" d="M8 52L92 52C92 76 80 86 50 86C20 86 8 76 8 52Z"/>
<rect fill="${C.white}" x="4" y="47" width="92" height="7" rx="3.5"/>`;
  META.tub = { w: 1.4 };

  S.duck = () => `
<path fill="${C.orange}" d="M46 87l-1 7h-7l9 1.5ZM58 87l0 7h-7l9 1.5Z"/>
<path fill="${C.white}" d="M12 58L22 66C24 82 40 90 58 88C76 86 82 74 78 64C74 56 60 58 50 62C40 64 28 62 12 58Z"/>
<path fill="#e8decb" d="M33 68C42 61 58 63 64 72C56 80 41 80 33 68Z"/>
<path fill="none" class="fine" d="M40 70q8 3 16 2M42 74q7 2 13 1"/>
<path fill="${C.white}" d="M62 66C59 53 59 40 70 36C80 32 89 40 85 50C83 56 77 58 77 67Z"/>
<path fill="${C.orange}" d="M84 43L97 47L84 52Z"/>
<circle class="solid" cx="76" cy="42" r="2"/>`;

  // o.hare: a sandier coat and black-tipped ears
  const HARE = '#bf9260';
  S.rabbithead = (o = {}) => `
<path fill="${o.hare ? HARE : C.rabbit}" d="M40 32C33 18 33 4 40 4C47 4 47 18 45 32Z"/>
<path fill="${o.hare ? HARE : C.rabbit}" d="M60 32C67 18 67 4 60 4C53 4 53 18 55 32Z"/>
<path class="nol" fill="${C.pink}" d="M41 28C37 18 37 9 40 9C43 9 43 18 43 28Z"/>
<path class="nol" fill="${C.pink}" d="M59 28C63 18 63 9 60 9C57 9 57 18 57 28Z"/>
${o.hare ? `<path class="nol" fill="${C.black}" d="M35.4 11C35.8 6 37.6 4 40 4C42.6 4 44.4 6 44.8 11Q40 9 35.4 11ZM55.2 11C55.6 6 57.4 4 60 4C62.4 4 64.2 6 64.6 11Q60 9 55.2 11Z"/>` : ''}
<ellipse fill="${o.hare ? HARE : C.rabbit}" cx="50" cy="40" rx="15.5" ry="14"/>
<ellipse class="nol" fill="${C.cream}" cx="50" cy="46.5" rx="7.5" ry="5.5"/>
${o.sleep || o.laugh ? `<path fill="none" d="M41 38q3 2.5 6 0M53 38q3 2.5 6 0"/>`
      : `<ellipse class="solid" cx="44" cy="38" rx="2" ry="2.6"/><ellipse class="solid" cx="56" cy="38" rx="2" ry="2.6"/>`}
<circle class="nol" fill="${C.rose}" opacity=".45" cx="40" cy="45" r="3.2"/><circle class="nol" fill="${C.rose}" opacity=".45" cx="60" cy="45" r="3.2"/>
<path fill="${C.pink}" d="M48 43h4l-2 2.5z"/>
${o.laugh ? `<path fill="${C.rose}" d="M45 48Q50 56 55 48Z"/>` : `<path fill="none" d="M50 45.5v2M50 47.5q-2 2-4 1M50 47.5q2 2 4 1"/>`}
<path class="fine" fill="none" d="M42 46L30 44M42 48L30 50M58 46L70 44M58 48L70 50"/>`;

  S.rabbit = (o = {}) => {
    const fur = o.hare ? HARE : C.rabbit;
    return `
<ellipse fill="${fur}" cx="40" cy="93" rx="10" ry="4.5"/><ellipse fill="${fur}" cx="60" cy="93" rx="10" ry="4.5"/>
<path fill="${fur}" d="M34 92C28 70 36 52 50 52C64 52 72 70 66 92Z"/>
<ellipse class="nol" fill="${C.cream}" cx="50" cy="76" rx="9" ry="13"/>
${o.jacket ? `<path fill="${C.blue}" d="M35 90C30 70 36 56 44 54L50 72L56 54C64 56 70 70 65 90L58 90L56 70L50 80L44 70L42 90Z"/>
<circle class="nol" fill="${C.gold}" cx="45" cy="74" r="1.6"/><circle class="nol" fill="${C.gold}" cx="55" cy="74" r="1.6"/>` : ''}
<path fill="${o.jacket ? C.blue : fur}" d="M37 58C28 64 27 74 31 79C34 78 36 71 41 65Z"/>
<path fill="${o.jacket ? C.blue : fur}" d="M63 58C72 64 73 74 69 79C66 78 64 71 59 65Z"/>
<circle fill="${fur}" cx="31" cy="79" r="3.5"/><circle fill="${fur}" cx="69" cy="79" r="3.5"/>
${S.rabbithead(o)}`;
  };

  S.bed = (o = {}) => {
    const who = o.rabbit ? `<g transform="translate(15 33) scale(.42)">${S.rabbithead({ sleep: true })}</g>`
      : o.pip ? `<g transform="translate(18.5 44) scale(.42)">${S.piphead({ sleep: true })}</g>`
        : o.princess ? `<g transform="translate(10 39) scale(.44)">${S.princesshead({ sleep: o.princess !== 'awake', ...o.head })}</g>`
        : o.ears ? `<path fill="${C.rabbit}" d="M44 62C40 54 41 48 44 48C47 48 48 54 47 62Z"/><path fill="${C.rabbit}" d="M51 62C51 54 53 48 56 49C59 50 56 56 54 62Z"/>` : '';
    const frame = `<path fill="${C.brown}" d="M6 96V36Q14 26 22 36V96H17V60H11V96Z"/>
<path fill="${C.brown}" d="M86 96V54Q92 47 98 54V96H94V70H90V96Z"/>`;
    if (o.bare) return `${frame}<path fill="${C.tan}" d="M17 76H91V84H17Z"/><path fill="none" class="fine" d="M30 76v8M44 76v8M58 76v8M72 76v8"/><rect fill="${C.bark}" x="17" y="84" width="74" height="5"/>`;
    return `
${frame}
<ellipse fill="${C.white}" cx="30" cy="58" rx="13" ry="6.5"/>
${who}
<path fill="${C.red}" d="M20 64Q50 ${o.ears ? 54 : 59} 88 62V84H20Z"/>
<path class="nol" fill="${C.butter}" d="M32 66h12v8H32zM56 72h12v8H56z"/>
<path class="nol" fill="${C.blue}" opacity=".8" d="M44 74h12v8H44zM68 64h12v8H68z"/>
<path fill="none" class="fine" d="M32 66v16M44 64v20M56 64v20M68 63v21M20 74H88"/>
<rect fill="${C.bark}" x="17" y="84" width="74" height="5"/>`;
  };
  META.bed = { w: 1.5 };

  S.pig = (o = {}) => `
<path fill="none" d="M14 52c-7-1-7-8-2-8c4 0 3 6-1 5"/>
<rect fill="${C.pink}" x="25" y="68" width="9" height="26" rx="3"/><rect fill="${C.pink}" x="36" y="68" width="9" height="26" rx="3"/>
<rect fill="${C.pink}" x="58" y="68" width="9" height="26" rx="3"/><rect fill="${C.pink}" x="69" y="68" width="9" height="26" rx="3"/>
<path class="nol" fill="${C.rose}" d="M25 90h9v4h-9zM36 90h9v4h-9zM58 90h9v4h-9zM69 90h9v4h-9z"/>
<ellipse fill="${C.pink}" cx="47" cy="58" rx="36" ry="22"/>
<path class="nol" fill="${C.rose}" opacity=".35" d="M24 66C34 76 60 78 74 70C66 80 34 80 24 66Z"/>
<path fill="${C.pink}" d="M73 41L79 27L86 40Z"/>
<circle fill="${C.pink}" cx="80" cy="53" r="15"/>
<ellipse fill="${C.rose}" cx="94" cy="57" rx="5" ry="7"/>
<ellipse class="solid" cx="93" cy="54.5" rx=".9" ry="1.5"/><ellipse class="solid" cx="95.5" cy="58.5" rx=".9" ry="1.5"/>
<circle class="solid" cx="83" cy="48" r="1.9"/>
<path fill="none" d="M82 62q4 3 8 0"/>
${o.ring ? `<path fill="${C.gold}" fill-rule="evenodd" d="M90 69a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0-11 0M92.5 69a3 3 0 1 0 6 0a3 3 0 1 0-6 0"/>` : ''}`;
  META.pig = { w: 1.2 };

  S.hen = (o = {}) => `
<path fill="none" d="M44 86V95M39 96h9M56 86V95M51 96h9"/>
<path fill="${C.deepred}" d="M23 60C12 48 14 32 24 29C28 40 32 49 37 55Z"/>
<ellipse fill="${C.red}" cx="48" cy="66" rx="30" ry="22"/>
<path fill="${C.red}" d="M60 56C58 44 60 32 70 30C80 28 84 38 80 46C78 52 76 56 78 62Z"/>
<path fill="#de4b3a" d="M64 31q1-7 5-3q2-7 5-1q3-6 6 1q-6 3-16 3z"/>
<path fill="#de4b3a" d="M79 43q4 6-1 9q-3-5 1-9z"/>
<path fill="${C.ochre}" d="M80 37L89 40.5L80 44Z"/>
<circle class="solid" cx="74" cy="37" r="2"/>
<path fill="#a33a26" d="M34 64C43 55 62 57 67 68C58 79 43 78 34 64Z"/>
<path fill="none" class="fine" d="M42 66q7 4 15 2M45 70q6 3 12 1"/>
${o.apron ? `<path fill="${C.white}" d="M56 70C62 74 74 72 77 64C78 76 70 84 60 84C56 80 55 76 56 70Z"/>` : ''}`;

  S.barn = () => `
<path fill="${C.red}" d="M14 96V50L30 31H70L86 50V96Z"/>
<path fill="${C.black}" d="M7 53L28 25H72L93 53H86L69 33H31L14 53Z"/>
<rect fill="${C.butter}" x="43" y="40" width="14" height="12"/>
<path fill="none" class="fine" d="M50 40v12M43 46h14"/>
<rect fill="${C.deepred}" x="35" y="62" width="30" height="34"/>
<path fill="none" d="M35 62L65 96M65 62L35 96M50 62V96"/>
<path class="nol" fill="${C.deepred}" opacity=".5" d="M14 60h21v3H14zM65 60h21v3H65zM14 76h21v3H14zM65 76h21v3H65z"/>`;
  META.barn = { w: 1.4 };

  S.wheat = (o = {}) => {
    const n = o.n || 5; let stems = '', heads = '';
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1) - 0.5, bx = 50 + t * 10, tx = 50 + t * 46, ty = 22 + Math.abs(t) * 18;
      stems += `M${f(bx)} 96Q${f((bx + tx) / 2)} 60 ${f(tx)} ${f(ty)}`;
      const ang = Math.atan2(ty - 60, tx - bx) * 180 / Math.PI + 90;
      for (let k = 0; k < 5; k++) {
        const hx = tx + (bx - tx) * k * 0.045, hy = ty + (96 - ty) * k * 0.045;
        heads += `<ellipse fill="${C.ochre}" cx="${f(hx - 2.6)}" cy="${f(hy + 1)}" rx="2" ry="4.2" transform="rotate(${f(ang - 28)} ${f(hx - 2.6)} ${f(hy + 1)})"/>` +
          `<ellipse fill="${C.ochre}" cx="${f(hx + 2.6)}" cy="${f(hy + 1)}" rx="2" ry="4.2" transform="rotate(${f(ang + 28)} ${f(hx + 2.6)} ${f(hy + 1)})"/>`;
      }
      heads += `<ellipse fill="${C.ochre}" cx="${f(tx)}" cy="${f(ty - 3)}" rx="2" ry="4" transform="rotate(${f(ang)} ${f(tx)} ${f(ty - 3)})"/>`;
    }
    return `<path fill="none" d="${stems}"/>${heads}`;
  };

  S.bread = () => `
<path fill="#d79b55" d="M8 88C6 62 26 46 50 46C74 46 94 62 92 88Q50 94 8 88Z"/>
<path class="nol" fill="${C.butter}" opacity=".55" d="M20 66C24 56 36 50 46 50C34 54 26 60 20 66Z"/>
<path fill="none" d="M28 58q5 8 3 17M46 52q5 10 3 21M64 54q5 9 3 19"/>`;
  META.bread = { w: 1.3 };

  const foxHead = (o) => `<path fill="${C.rust}" d="M55 34L55 15L64 28Z"/><path fill="${C.rust}" d="M63 29L68 13L72 31Z"/>
<path class="nol" fill="${C.black}" d="M57 30L57 20L61 27ZM65 28L68 18L70 30Z"/>
<path fill="${C.rust}" d="M52 40C52 28 64 24 72 30L91 40C86 45 78 47 70 47C62 49 54 46 52 40Z"/>
<path class="nol" fill="${C.white}" d="M69 41L88 41.5C82 46.5 74 46.5 67 45Z"/>
<circle class="solid" cx="90.5" cy="40" r="2.3"/>
${o.happy ? `<path fill="none" d="M62 34q3-3 6 0"/>` : o.cross ? `<path fill="none" d="M61 31l7 2"/><circle class="solid" cx="65" cy="35" r="1.8"/>` : `<path class="solid" d="M62 35q3.5-3 7 0q-3.5 1.5-7 0z"/>`}
${o.cross ? `<path fill="none" d="M74 46q4-2 8 0"/>` : `<path fill="none" d="M74 44q4 2.5 9-1"/>`}`;
  // o.low: lying flat on his belly, chin on his paws
  S.fox = (o = {}) => o.low ? `
<path fill="${C.rust}" d="M30 93C14 97 2 93 4 87C6 81 14 83 18 87C22 90 28 89 34 88Z"/>
<path fill="${C.white}" d="M4 87C5 83 10 82 12 85C10 89 6 90 4 87Z"/>
<path fill="${C.rust}" d="M22 95C20 82 34 74 52 74C64 74 72 80 72 92L70 95Z"/>
<path fill="${C.rust}" d="M60 90H90Q94 90 94 93Q94 96 90 96H60Z"/><path class="nol" fill="${C.black}" d="M87 90h3q4 0 4 3q0 3-4 3h-3z"/>
<g transform="translate(4 46)">${foxHead(o)}</g>`
    : `<path fill="${C.rust}" d="M30 90C6 92 0 70 10 58C16 52 22 60 20 68C18 78 26 84 36 84Z"/>
<path fill="${C.white}" d="M10 58C14 53 21 55 20 62C16 65 11 63 10 58Z"/>
<path fill="${C.rust}" d="M30 92C26 70 36 52 54 48C64 46 70 54 68 66C68 78 66 88 64 92Z"/>
<path class="nol" fill="${C.white}" d="M58 52C66 56 66 74 60 84C56 74 54 62 58 52Z"/>
${foxHead(o)}
<path fill="${C.rust}" d="M55 68L52 94H60L62 72Z"/><path class="nol" fill="${C.black}" d="M52.5 88L52 94H60L60.6 88Z"/>`;

  S.pot = (o = {}) => `
${o.fire === false ? '' : `<path fill="${C.orange}" d="M30 96C26 88 32 84 34 78C36 84 40 86 40 92C42 88 44 84 48 80C50 86 54 88 54 94C56 90 60 86 62 82C64 88 70 90 68 96Z"/>
<path class="nol" fill="${C.butter}" d="M40 96C40 92 44 90 46 87C48 91 52 93 52 96Z"/>`}
<path fill="none" d="M26 80l-4 9M74 80l4 9"/>
<path fill="${C.black}" d="M16 46H84C86 70 72 86 50 86C28 86 14 70 16 46Z"/>
<path class="nol" fill="#8a7d86" opacity=".7" d="M24 52C24 64 30 74 38 78C30 70 28 60 28 52Z"/>
<ellipse fill="#6b5e68" cx="50" cy="46" rx="36" ry="7"/>
<ellipse class="nol" fill="#2f2730" cx="50" cy="46" rx="30" ry="4.4"/>
${o.lid ? `<path fill="#6b5e68" d="M15 46Q50 29 85 46Q50 53 15 46Z"/><circle fill="#6b5e68" cx="50" cy="35.5" r="3.5"/>` : ''}
<path fill="none" d="M18 47C14 18 86 18 82 47"/>
<path fill="none" class="fine" d="M40 34q-4-5 0-10t0-10M56 34q-4-5 0-10t0-10"/>`;
  META.pot = { w: 1.1 };

  S.mud = () => `
<path fill="#7a5a3c" d="M8 88C10 78 30 76 44 80C56 72 82 74 92 84C96 92 80 96 60 95C40 98 12 96 8 88Z"/>
<path class="nol" fill="#a07a52" opacity=".7" d="M24 84C34 80 46 82 54 84C46 86 34 86 24 84Z"/>
<circle fill="#7a5a3c" cx="20" cy="70" r="3"/><circle fill="#7a5a3c" cx="80" cy="64" r="3.5"/><circle fill="#7a5a3c" cx="52" cy="62" r="2.4"/><circle fill="#7a5a3c" cx="66" cy="70" r="2"/>`;
  META.mud = { w: 1.4 };

  S.briar = () => {
    const thorns = (pts) => pts.map(([x, y, a]) => `M${x} ${y}l${f(Math.cos(a) * 4)} ${f(Math.sin(a) * 4)}`).join('');
    return `
<path fill="${C.moss}" d="${cloud(50, 66, 46, 30, 11, 7)}"/>
<path class="nol" fill="${C.leaf}" opacity=".6" d="${cloud(38, 74, 26, 16, 8, 3)}"/>
<path fill="none" d="M6 94C14 62 34 44 58 40C70 38 80 44 82 54M30 94C30 72 50 58 70 62C80 64 90 72 92 86M60 94C52 74 30 62 14 70"/>
<path fill="none" class="fine" d="${thorns([[16, 70, -2.2], [24, 56, -2], [36, 46, -1.8], [50, 41, -1.5], [64, 39, -1], [76, 45, -0.4], [36, 68, -2], [52, 60, -1.4], [74, 63, -0.8], [86, 72, -0.2], [44, 72, -2.6], [28, 64, -2.8]])}"/>
<path fill="${C.leaf}" d="M22 52q8-6 12 2q-8 4-12-2zM70 50q6-8 12-2q-6 6-12 2zM44 34q4-8 10-4q-4 7-10 4zM84 64q6-4 9 2q-5 4-9-2z"/>
<circle fill="${C.plum}" cx="30" cy="62" r="3.2"/><circle fill="${C.plum}" cx="34" cy="59" r="3"/><circle fill="${C.plum}" cx="60" cy="52" r="3.2"/>
<circle fill="${C.plum}" cx="64" cy="56" r="3"/><circle fill="${C.red}" cx="78" cy="76" r="2.8"/><circle fill="${C.plum}" cx="48" cy="78" r="3"/>`;
  };
  META.briar = { w: 1.5 };

  S.owl = (o = {}) => `
<path fill="${C.brown}" d="M30 30L32 13L42 24Q50 22 58 24L68 13L70 30C80 46 78 80 66 90C58 96 42 96 34 90C22 80 20 46 30 30Z"/>
<path class="nol" fill="${C.cream}" d="M38 56C40 48 60 48 62 56C64 72 58 86 50 88C42 86 36 72 38 56Z"/>
<path fill="none" class="fine" d="M44 60l3 3 3-3M50 60l3 3 3-3M41 68l3 3 3-3M47 68l3 3 3-3M53 68l3 3 3-3M44 76l3 3 3-3M50 76l3 3 3-3"/>
<path fill="#dcbb8c" d="M29 38C29 27 46 25 50 34C54 25 71 27 71 38C71 50 56 52 50 46C44 52 29 50 29 38Z"/>
<circle fill="${C.butter}" cx="41" cy="38" r="7.2"/><circle fill="${C.butter}" cx="59" cy="38" r="7.2"/>
${o.sleep ? `<path fill="none" d="M36 38q5 3 10 0M54 38q5 3 10 0"/>` : `<circle class="solid" cx="41.5" cy="38.5" r="3.3"/><circle class="solid" cx="58.5" cy="38.5" r="3.3"/>`}
<path fill="${C.ochre}" d="M47 44L53 44L50 50Z"/>
<path fill="#734a30" d="M28 50C19 60 21 78 32 87C32 72 34 60 37 52Z"/>
<path fill="#734a30" d="M72 50C81 60 79 78 68 87C68 72 66 60 63 52Z"/>
<path fill="none" d="M41 92l-3 4M43 92v5M45 92l3 4M55 92l-3 4M57 92v5M59 92l3 4"/>`;

  S.boatsail = () => `
<rect fill="${C.bark}" x="48.5" y="10" width="3" height="80"/>
<path fill="${C.white}" d="M53 12L53 66L86 66Z"/>
<path class="nol" fill="${C.rose}" opacity=".6" d="M53 30L66 30L72 40L53 40ZM53 52L80 52L83 58L53 58Z"/>`;
  META.boatsail = { sky: true };

  S.boat = () => `
<path fill="${C.pea}" d="M2 68H98L87 90C70 96 30 96 13 90Z"/>
<path class="nol" fill="${C.butter}" d="M2 68H98L96 73H4Z"/>
<path fill="none" class="fine" d="M8 79Q50 84 92 79M12 86Q50 91 88 86"/>`;
  META.boat = { sky: true };

  S.waves = () => {
    let d = 'M0 100V78', ink = '';
    for (let x = 0; x <= 100; x += 12.5) d += `Q${x + 6.25} 70 ${x + 12.5} 78`;
    d += 'V100Z';
    for (let x = 0; x < 100; x += 12.5) ink += `M${x + 2} 77q4.25-5 8.5 0`;
    return `<path class="nol" fill="${C.blue}" d="${d}"/><path fill="none" d="${ink}"/>`;
  };
  META.waves = { sky: true };

  S.ring = () => `
<path fill="${C.gold}" fill-rule="evenodd" d="M24 64a26 26 0 1 0 52 0a26 26 0 1 0-52 0M31 64a19 19 0 1 0 38 0a19 19 0 1 0-38 0"/>
<path fill="#d2475a" d="M40 34L60 34L65 41L50 52L35 41Z"/>
<path fill="none" class="fine" d="M35 41H65M45 34L50 52L55 34"/>
<path fill="none" d="M82 18v12M76 24h12M16 30v8M12 34h8M80 76v8M76 80h8"/>`;
  META.ring = { sky: true };

  S.bongtree = () => {
    let leaves = '';
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI + (i / 8) * Math.PI, ex = 50 + Math.cos(a) * 36, ey = 24 + Math.sin(a) * 18 + 10;
      leaves += `<path fill="${i % 2 ? C.leaf : C.green}" d="M50 24Q${f((50 + ex) / 2 + Math.sin(a) * 8)} ${f((24 + ey) / 2 - 10)} ${f(ex)} ${f(ey)}Q${f((50 + ex) / 2)} ${f((24 + ey) / 2 + 2)} 50 26Z"/>`;
    }
    return `<path fill="${C.bark}" d="M47 96C45 70 52 50 47.5 24L52.5 24C57 50 51 70 54 96Z"/>
<path fill="none" class="fine" d="M48 40l5 2M49 52l5 2M48 64l6 2M49 76l6 2M50 88l5 2"/>${leaves}
<circle fill="${C.ochre}" cx="50" cy="24" r="4"/>`;
  };

  S.turkey = () => {
    let fan = '';
    const cols = [C.brown, C.rust, C.bark, C.ochre];
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + (i / 8) * Math.PI, x1 = 50 + Math.cos(a - 0.17) * 40, y1 = 66 + Math.sin(a - 0.17) * 40, x2 = 50 + Math.cos(a + 0.17) * 40, y2 = 66 + Math.sin(a + 0.17) * 40;
      fan += `<path fill="${cols[i % 4]}" d="M50 66L${f(x1)} ${f(y1)}Q${f(50 + Math.cos(a) * 46)} ${f(66 + Math.sin(a) * 46)} ${f(x2)} ${f(y2)}Z"/>`;
    }
    return `${fan}
<path fill="none" d="M44 84V95M40 96h8M56 84V95M52 96h8"/>
<ellipse fill="${C.bark}" cx="50" cy="72" rx="17" ry="15"/>
<path fill="#b9b7c9" d="M54 64C56 54 56 46 60 44C66 42 68 48 64 52C61 55 60 60 61 66Z"/>
<path fill="#de4b3a" d="M62 50q2 7-2 9q-2-5 2-9z"/>
<path fill="${C.ochre}" d="M65 46L71 48L65 50Z"/>
<circle class="solid" cx="62" cy="46.5" r="1.5"/>`;
  };

  S.tree = (o = {}) => `
<path fill="${C.bark}" d="M43 96C46 82 46 70 44 60L48 62L50 52L53 62L57 58C55 70 55 82 59 96Z"/>
<path fill="${o.color || C.green}" d="${cloud(50, 38, 40, 30, 10, o.seed || 4)}"/>
<path class="nol" fill="${C.leaf}" opacity=".5" d="${cloud(42, 46, 22, 14, 7, (o.seed || 4) + 2)}"/>`;

  // the tree whose fruit is words; o.words lists which tags still hang on it
  const TAGS = { in: [24, 34, -8], cat: [30, 50, 6], hat: [50, 24, -4], sun: [73, 44, 8], bug: [42, 66, -6], jam: [64, 62, 5], bed: [80, 26, -7] };
  S.wordtree = (o = {}) => {
    const words = o.words || Object.keys(TAGS);
    const tags = words.filter((w) => TAGS[w]).map((w) => {
      const [x, y, a] = TAGS[w], wd = 4 + w.length * 4.2;
      return `<path fill="none" class="fine" d="M${x} ${y - 9}v5"/>
<g transform="rotate(${a} ${x} ${y})"><rect fill="${C.cream}" x="${f(x - wd / 2)}" y="${y - 4}" width="${f(wd)}" height="9" rx="1.6"/>
<text class="label" x="${x}" y="${y + 3}" text-anchor="middle" font-size="7.5">${w}</text></g>`;
    }).join('');
    return `
<path fill="${C.bark}" d="M42 96C45 84 45 74 42 64L47 66L49 56L53 66L60 61C56 74 56 84 60 96Z"/>
<path fill="${C.green}" d="${cloud(52, 40, 46, 32, 12, 11)}"/>
<path class="nol" fill="${C.leaf}" opacity=".45" d="${cloud(40, 50, 26, 15, 8, 5)}"/>
<path fill="none" class="fine" d="M30 28q6-3 12 0M60 20q6-3 12 0M78 52q5-3 10 0M22 48q5-3 10 0"/>${tags}`;
  };
  META.wordtree = { w: 1.4 };

  S.door = () => {
    let bricks = '';
    for (let y = 36, row = 0; y < 96; y += 8, row++) {
      bricks += `M0 ${y}H100`;
      for (let x = row % 2 ? 6 : 0; x < 100; x += 12) if (x < 30 || x > 70) bricks += `M${x} ${y}v8`;
    }
    return `
<path fill="${C.brick}" d="M0 30H100V96H0Z"/>
<path fill="none" class="fine" d="${bricks}"/>
<path fill="${C.butter}" d="M33 96V52C33 37 67 37 67 52V96Z"/>
<path class="nol" fill="${C.green}" opacity=".8" d="M40 96C44 86 56 86 60 96Z"/>
<path fill="${C.leaf}" d="M33 96V52C33 41 41 38 47 40L47 98Z"/>
<circle class="solid" cx="43.5" cy="70" r="1.6"/>
<path class="nol" fill="${C.moss}" d="${cloud(10, 34, 14, 8, 7, 2)}"/><path class="nol" fill="${C.moss}" d="${cloud(90, 40, 14, 10, 7, 9)}"/>
<path fill="${C.leaf}" d="M4 34q4-5 8 0q-4 4-8 0zM14 30q4-5 8 0q-4 4-8 0zM86 38q4-5 8 0q-4 4-8 0zM90 46q4-5 8 0q-4 4-8 0z"/>`;
  };
  META.door = { w: 1.6 };

  S.piphead = (o = {}) => o.back ? `<circle fill="#f2cfae" cx="37.5" cy="40" r="2.6"/><circle fill="#f2cfae" cx="62.5" cy="40" r="2.6"/><circle fill="#7a4a2a" cx="50" cy="38" r="12.5"/>` : `
<circle fill="#f2cfae" cx="50" cy="38" r="12.5"/>
${o.ear ? `<ellipse fill="${C.red}" cx="37" cy="40" rx="3.6" ry="5"/>` : ''}
<path fill="#7a4a2a" d="M37.5 38C35 26 45 21 51 23C57 21 66 27 62.5 38C61 32 56 29.5 50 30.5C44 29.5 40 33 37.5 38Z"/>
<path fill="#7a4a2a" d="M48 24q2-6 7-5q-4 2-4 6z"/>
${o.sleep ? `<path fill="none" d="M43 39q2.5 2 5 0M52 39q2.5 2 5 0"/>` : `<circle class="solid" cx="45.5" cy="39" r="1.6"/><circle class="solid" cx="54.5" cy="39" r="1.6"/>`}
<circle class="nol" fill="${C.rose}" opacity=".55" cx="42" cy="44" r="2.8"/><circle class="nol" fill="${C.rose}" opacity=".55" cx="58" cy="44" r="2.8"/>
${o.sneeze ? `<ellipse fill="${C.rose}" cx="50" cy="46.5" rx="2.2" ry="2.6"/>` : `<path fill="none" d="M46 45.5q4 3.5 8 0"/>`}`;

  S.pip = (o = {}) => `
<rect fill="${C.navy}" x="42" y="78" width="6" height="15"/><rect fill="${C.navy}" x="52" y="78" width="6" height="15"/>
<ellipse fill="${C.black}" cx="44" cy="94" rx="6.5" ry="3.5"/><ellipse fill="${C.black}" cx="56" cy="94" rx="6.5" ry="3.5"/>
<path fill="${o.shirt || C.red}" d="M35 82L40 51C44 47 56 47 60 51L65 82Q50 86 35 82Z"/>
<path class="nol" fill="${C.cream}" d="M48 58h4v2h-4zM48 66h4v2h-4zM48 74h4v2h-4z"/>
<path fill="none" class="fine" d="M50 52V84"/>
<path fill="${o.shirt || C.red}" d="M40 53C33 59 31 67 33 73L38 73C38 67 40 61 43 57Z"/>
${o.tag ? `<path fill="${o.shirt || C.red}" d="${stick(58, 55, 70, 40, 6.5)}"/><circle fill="#f2cfae" cx="70.5" cy="39" r="3.2"/>` : `<path fill="${o.shirt || C.red}" d="M60 53C67 59 69 67 67 73L62 73C62 67 60 61 57 57Z"/>`}
<circle fill="#f2cfae" cx="35.5" cy="75" r="3.2"/>${o.tag ? '' : `<circle fill="#f2cfae" cx="64.5" cy="75" r="3.2"/>`}
<path fill="${C.ochre}" d="M41 49H59V54H41ZM53 54L56 66L60 65L57 54Z"/>
${S.piphead(o)}
${o.tag ? `<path fill="none" class="fine" d="M70.5 36v-4"/><g transform="rotate(-6 76 26)"><rect fill="${C.cream}" x="${f(76 - (8 + o.tag.length * 7.6) / 2)}" y="16" width="${f(8 + o.tag.length * 7.6)}" height="17" rx="2.5"/>
<text class="label" x="76" y="29" text-anchor="middle" font-size="14">${o.tag}</text></g>` : ''}`;

  S.bug = () => `
<path fill="none" d="M28 48l-12-6M26 60H12M28 72l-12 7M72 48l12-6M74 60H88M72 72l12 7"/>
<path fill="none" class="fine" d="M44 24q-6-10-12-12M56 24q6-10 12-12"/>
<circle class="solid" cx="32" cy="12" r="2"/><circle class="solid" cx="68" cy="12" r="2"/>
<ellipse fill="${C.black}" cx="50" cy="30" rx="13" ry="9"/>
<circle class="nol" fill="${C.white}" cx="45" cy="28" r="2.2"/><circle class="nol" fill="${C.white}" cx="55" cy="28" r="2.2"/>
<ellipse fill="${C.red}" cx="50" cy="58" rx="25" ry="28"/>
<path fill="none" d="M50 31V86"/>
<circle class="solid" cx="39" cy="46" r="4.5"/><circle class="solid" cx="61" cy="46" r="4.5"/>
<circle class="solid" cx="37" cy="65" r="5"/><circle class="solid" cx="63" cy="65" r="5"/><circle class="solid" cx="50" cy="79" r="3.5"/>`;
  META.bug = { w: 0.8 };

  S.jam = () => `
<path fill="#b8323f" d="M24 40H76V86C76 92 70 96 64 96H36C30 96 24 92 24 86Z"/>
<path class="nol" fill="${C.white}" opacity=".45" d="M30 46h4v40h-4z"/>
<rect fill="${C.cream}" x="34" y="58" width="32" height="20" rx="2"/>
<text class="label" x="50" y="72.5" text-anchor="middle" font-size="12">jam</text>
<path fill="${C.white}" d="M17 41C22 30 78 30 83 41C80 46 72 43 69 47C60 43 40 43 31 47C28 43 20 46 17 41Z"/>
<path class="nol" fill="${C.red}" opacity=".7" d="M28 36h5v4h-5zM40 34h5v4h-5zM52 34h5v4h-5zM64 35h5v4h-5zM34 40h5v3h-5zM58 40h5v3h-5z"/>
<path fill="none" d="M22 42Q50 48 78 42"/>`;

  // a tall grandfather clock: ten to one, or o.one for one o'clock; o.bong shakes it
  S.clock = (o = {}) => {
    const hand = (deg, len) => { const a = (deg - 90) * Math.PI / 180; return `M50 24L${f(50 + Math.cos(a) * len)} ${f(24 + Math.sin(a) * len)}`; };
    let ticks = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ticks += `M${f(50 + Math.sin(a) * 9.5)} ${f(24 - Math.cos(a) * 9.5)}L${f(50 + Math.sin(a) * 11.5)} ${f(24 - Math.cos(a) * 11.5)}`;
    }
    return `
<path fill="${C.bark}" d="M32 96V87H68V96Z"/>
<path fill="${C.brown}" d="M36 88V46H64V88Z"/>
<rect fill="#5f3f29" x="42" y="52" width="16" height="30" rx="8"/>
<path fill="none" class="fine" d="M50 52V71"/>
<circle fill="${C.gold}" cx="50" cy="75" r="4.5"/>
<path fill="${C.bark}" d="M30 49V43H70V49Z"/>
<path fill="${C.brown}" d="M32 44V14C32 4 68 4 68 14V44Z"/>
<circle fill="${C.gold}" cx="50" cy="4" r="3"/>
<circle fill="${C.cream}" cx="50" cy="24" r="13"/>
<path fill="none" class="fine" d="${ticks}"/>
<path fill="none" d="${o.midnight ? hand(0, 10) : o.one ? hand(30, 6.5) + hand(0, 10) : hand(25, 6.5) + hand(300, 10)}"/>
<circle class="solid" cx="50" cy="24" r="1.5"/>
${o.bong ? `<path fill="none" d="M25 13q-5 10 0 22M18 9q-7 15 0 32M75 13q5 10 0 22M82 9q7 15 0 32"/>` : ''}`;
  };
  META.clock = { w: 0.9 };

  // a lily pad for frogs to sit on (the top of the pad is at about y = 82)
  S.lily = () => `
<path fill="${C.green}" d="M50 88L58 81C76 80.5 92 84 92 89C92 94 72 97 50 97C28 97 8 94 8 89C8 84 26 80.5 43 81Z"/>
<path fill="none" class="fine" d="M50 88L28 91M50 88L50 95M50 88L73 92"/>`;
  META.lily = { sky: true };

  // the big bad wolf; o.blow puffs his cheeks out, o.ouch is after the hot pot
  S.wolf = (o = {}) => {
    const fur = '#8f8a8e', dark = '#5e5a5f';
    return `
<path fill="${fur}" d="M30 90C6 96-2 76 8 62C12 56 20 58 20 66C20 78 28 84 38 84Z"/>
<path class="nol" fill="${C.silver}" d="M8 62C12 56 18 58 18 64C14 66 10 66 8 62Z"/>
<path fill="${fur}" d="M28 94C22 70 32 48 54 44C66 42 74 52 72 66C72 80 70 90 68 94Z"/>
<path class="nol" fill="${C.silver}" d="M58 48C68 52 68 74 62 86C57 74 54 60 58 48Z"/>
<path fill="none" class="fine" d="M36 60l4 4M33 70l4 3M40 78l3 3"/>
<path fill="${fur}" d="M52 32L52 12L62 26Z"/><path fill="${fur}" d="M62 27L68 9L72 30Z"/>
<path class="nol" fill="${dark}" d="M54 28L54 17L59 25ZM64 26L67.5 15L70 29Z"/>
<path fill="${fur}" d="M50 38C50 26 62 22 72 28L96 39C94 46 84 49 72 49C62 51 52 46 50 38Z"/>
<path class="nol" fill="${C.silver}" d="M70 42L92 43C86 48 76 49 68 47Z"/>
${o.blow ? `<circle fill="${fur}" cx="75" cy="41" r="8"/><circle class="nol" fill="${C.rose}" opacity=".5" cx="75" cy="42" r="4"/>` : ''}
<circle class="solid" cx="95.5" cy="39" r="2.6"/>
${o.ouch ? `<path fill="none" d="M59 30l6 3-6 3"/>` : `<path fill="none" d="M58 30l9 2.5"/><circle class="solid" cx="63" cy="34.5" r="1.9"/>`}
${o.blow ? `<circle fill="none" cx="91" cy="47" r="2.4"/><path fill="none" class="fine" d="M100 40q9-3 18 1M100 46q11 0 22 4M99 52q9 2 16 9"/>`
      : o.ouch ? `<path fill="${C.deepred}" d="M75 46Q84 57 93 47Q84 50 75 46Z"/>`
        : `<path fill="none" d="M72 46q10 4 22-2"/><path fill="${C.white}" d="M78 47l1.5 3.5 2-3.2zM86 46.4l1.5 3.4 2-3.4z"/>`}
<path fill="${fur}" d="M55 66L51 94H60L63 70Z"/><path class="nol" fill="${dark}" d="M51.5 88L51 94H60L60.7 88Z"/>`;
  };
  META.wolf = { w: 1.1 };

  // the three little pigs' houses: o.kind is straw, sticks or brick;
  // o.down is the heap that is left after the wolf has blown it in
  const stick = (x1, y1, x2, y2, w = 2.8) => {
    const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2, dx = (Math.cos(a) * w) / 2, dy = (Math.sin(a) * w) / 2;
    return `M${f(x1 + dx)} ${f(y1 + dy)}L${f(x2 + dx)} ${f(y2 + dy)}L${f(x2 - dx)} ${f(y2 - dy)}L${f(x1 - dx)} ${f(y1 - dy)}Z`;
  };
  S.house = (o = {}) => {
    const k = o.kind || 'straw';
    if (o.down && k === 'straw') {
      return `<path fill="${C.butter}" d="M4 96C8 84 28 77 50 80C72 77 94 86 96 96Z"/>
<path fill="${C.ochre}" d="M30 84C38 76 56 74 66 80C56 82 42 84 30 84Z"/>
<path fill="none" class="fine" d="M12 93l6-8M22 95l4-12M34 94l2-13M47 95V82M60 95l-2-13M72 94l-4-12M84 95l-6-9M28 86l10 3M56 83l12 5M40 79l-4-7M62 78l5-6"/>`;
    }
    if (o.down) {
      const sticks = [[6, 94, 50, 82], [18, 96, 70, 86], [40, 95, 94, 90], [30, 82, 82, 96], [12, 88, 58, 95], [52, 80, 92, 93], [62, 84, 28, 96], [44, 78, 62, 96], [70, 80, 86, 96], [24, 90, 40, 76]];
      return `<path fill="${C.tan}" d="${sticks.map((s) => stick(...s)).join('')}"/>`;
    }
    const wall = { straw: C.butter, sticks: C.tan, brick: C.red }[k];
    const roof = { straw: C.ochre, sticks: C.brown, brick: '#6a5560' }[k];
    const holes = [[24, 59, 37, 72], [63, 59, 76, 72], [41, 70, 59, 96]];
    const free = (x, y) => !holes.some(([a, b, c, d]) => x > a - 2 && x < c + 2 && y > b - 2 && y < d + 2);
    const r = rng(k.length * 17 + 3);
    let tex = '';
    if (k === 'straw') {
      for (let i = 0; i < 60; i++) { const x = 20 + r() * 60, y = 52 + r() * 40; if (free(x, y) && free(x, y + 6)) tex += `M${f(x)} ${f(y)}q1.2 3 0 6`; }
    } else if (k === 'sticks') {
      for (let y = 55; y < 96; y += 6) for (let x = 19 + (y % 4); x < 80; x += 12) if (free(x, y) && free(x + 10, y)) tex += `M${f(x)} ${y}h${f(8 + r() * 3)}`;
    } else {
      for (let y = 55, row = 0; y < 96; y += 5, row++) {
        for (let x = 18 + (row % 2) * 4; x < 82; x += 8) {
          if (free(x + 4, y)) tex += `M${x} ${y}h8`;
          if (x > 18 && free(x, y + 2.5)) tex += `M${x} ${y}v5`;
        }
      }
    }
    const rooftex = {
      straw: 'M50 18L22 52M50 18L36 53M50 18L64 53M50 18L78 52M11 54l2 4M18 54l2 4M25 54l1 4M32 54l1 4M68 54l-1 4M75 54l-1 4M82 54l-2 4M89 54l-2 4',
      sticks: 'M16 49L50 20M24 52L50 29M76 52L50 29M84 49L50 20M30 46h40M40 37h20',
      brick: 'M26 46h48M18 52h64M34 39h32M42 32h16M30 46v6M42 46v6M54 46v6M66 46v6M38 39v7M50 39v7M62 39v7M46 32v7M54 32v7'
    }[k];
    return `
${k === 'brick' ? `<path fill="${C.red}" d="M66 42V19H76V42Z"/><path fill="${C.deepred}" d="M64 16H78V20H64Z"/>` : ''}
${o.smoke && k === 'brick' ? `<path fill="none" class="fine" d="M71 14q-4-4 0-8t0-8"/>` : ''}
<path fill="${wall}" d="M18 96V50H82V96Z"/>
<path fill="none" class="fine" d="${tex}"/>
<path fill="${roof}" d="M8 54L50 16L92 54Z"/>
<path fill="none" class="fine" d="${rooftex}"/>
<path fill="${k === 'brick' ? C.bark : roof}" d="M42 96V78C42 69 58 69 58 78V96Z"/>
<circle class="solid" cx="54.5" cy="84" r="1.3"/>
<rect fill="${C.butter}" x="25" y="60" width="11" height="11"/><rect fill="${C.butter}" x="64" y="60" width="11" height="11"/>
<path fill="none" class="fine" d="M30.5 60v11M25 65.5h11M69.5 60v11M64 65.5h11"/>`;
  };
  META.house = { w: 1.4 };

  // the Tar-Baby: a lump of tar and turpentine with a hat on (no face: it is only tar)
  S.tarbaby = (o = {}) => {
    const tar = '#3b3438', gloss = '#8a8088';
    return `
<ellipse fill="${tar}" cx="50" cy="93" rx="24" ry="4"/>
<path fill="${tar}" d="M31 70C22 72 18 80 21 86L28 84C28 80 30 77 35 76Z"/>
<path fill="${tar}" d="M69 70C78 72 82 80 79 86L72 84C72 80 70 77 65 76Z"/>
<path fill="${tar}" d="M30 94C24 80 30 64 50 63C70 64 76 80 70 94Z"/>
<path class="nol" fill="${gloss}" opacity=".55" d="M37 82C37 75 41 70 46 68C42 72 40 77 40 83Z"/>
<circle fill="${tar}" cx="50" cy="48" r="17"/>
<path class="nol" fill="${gloss}" opacity=".6" d="M39 45C39 39 43 35 49 34C44 37 42 41 42 46Z"/>
<path fill="${tar}" d="M56 94v-5q2.5-3 5 0v5zM40 94v-4q2-2.5 4 0v4z"/>
${o.goo ? `<path fill="${tar}" d="M24 78C16 76 8 72 0 70L0 75C8 77 16 81 25 83ZM34 54C24 52 16 52 6 54L6 59C16 57 24 57 34 59ZM30 92C22 91 14 92 6 95L8 98C16 96 22 95 30 96Z"/>` : ''}
<path fill="${C.tan}" d="M37 34C37 20 63 20 63 34Z"/>
<path fill="${C.deepred}" d="M37.4 30H62.6V34H37.4Z"/>
<ellipse fill="${C.tan}" cx="50" cy="34.5" rx="23" ry="4.5"/>`;
  };

  // a bush to hide behind
  S.bush = () => `
<path fill="${C.moss}" d="${cloud(50, 72, 46, 26, 10, 21)}"/>
<path class="nol" fill="${C.leaf}" opacity=".6" d="${cloud(40, 80, 24, 12, 7, 8)}"/>
<path fill="none" class="fine" d="M24 70q5-3 10 0M58 60q5-3 10 0M70 80q5-3 10 0"/>`;
  META.bush = { w: 1.5 };

  // a log lying on the ground, end on to the right
  S.log = () => `
<path fill="${C.bark}" d="M8 96V76Q8 70 14 70H84V96Z"/>
<ellipse fill="${C.tan}" cx="84" cy="83" rx="8" ry="13"/>
<ellipse fill="none" class="fine" cx="84" cy="83" rx="4" ry="7"/>
<path fill="none" class="fine" d="M18 78h22M30 86h30M50 76h20M16 90h14"/>`;
  META.log = { w: 1.5 };

  // a billy goat (side on, facing right)
  S.goat = (o = {}) => {
    const c = o.color || '#efe6d2', horn = '#b59a72';
    return `
<path fill="${c}" d="M22 52C15 46 13 39 17 37C19 43 23 47 26 48Z"/>
<rect fill="${c}" x="24" y="64" width="7" height="30" rx="3"/><rect fill="${c}" x="34" y="66" width="7" height="28" rx="3"/>
<rect fill="${c}" x="56" y="66" width="7" height="28" rx="3"/><rect fill="${c}" x="66" y="64" width="7" height="30" rx="3"/>
<path class="nol" fill="${C.black}" d="M24 90h7v4h-7zM34 90h7v4h-7zM56 90h7v4h-7zM66 90h7v4h-7z"/>
<path fill="${c}" d="${o.fat ? 'M15 57C15 40 30 33 48 33C66 33 79 41 79 56C79 73 67 78 48 78C28 78 15 73 15 57Z' : 'M20 56C20 45 30 41 48 41C63 41 73 45 75 55C75 66 67 72 48 72C30 72 20 67 20 56Z'}"/>
<path fill="none" class="fine" d="M30 50q4 3 8 1M50 47q4 3 8 1M40 58q4 3 8 1"/>
<path fill="${c}" d="M62 50C64 40 68 32 74 27L84 34C80 40 77 50 75 58Z"/>
<path fill="${horn}" d="M75 24C71 11 61 7 54 13C61 13 67 17 71 27Z"/>
<path fill="${horn}" d="M80 22C78 9 70 3 63 7C69 9 74 15 76 24Z"/>
<path fill="${c}" d="M71 27C73 18 84 16 88 23L96 38C97 42 94 45 90 44L80 40C75 38 71 33 71 27Z"/>
<path fill="${c}" d="M73 29C67 30 62 33 59 37C65 37 70 35 75 32Z"/>
<path fill="${horn}" d="M86 44L84 55L90 45Z"/>
${o.happy ? `<path fill="none" d="M81 28q2.5-2.5 5 0"/>` : `<circle class="solid" cx="83" cy="28" r="1.9"/>`}
<circle class="solid" cx="94.2" cy="38.5" r=".9"/>
<path fill="none" d="M88 42.5q3 1 6-1"/>`;
  };
  META.goat = { w: 1.1 };

  // the Troll under the bridge, with eyes as big as saucers and a nose as long as a poker
  S.troll = (o = {}) => {
    const skin = '#9aa57a', hair = '#5d6b3a';
    return `
<path fill="${skin}" d="M30 66C17 66 9 74 10 84C14 85 20 79 31 75Z"/>
<path fill="${skin}" d="M70 66C83 66 91 74 90 84C86 85 80 79 69 75Z"/>
<circle fill="${skin}" cx="11" cy="85" r="4.5"/><circle fill="${skin}" cx="89" cy="85" r="4.5"/>
<path fill="${skin}" d="M24 96C18 78 24 58 50 58C76 58 82 78 76 96Z"/>
<path fill="#7d6a4a" d="M25 86Q50 92 75 86L76 96H24Z"/>
<path fill="none" class="fine" d="M34 88l3 8M46 90l1 6M58 90l-1 6M68 88l-3 8"/>
<ellipse class="nol" fill="#b8c094" cx="50" cy="74" rx="14" ry="10"/>
${o.bib ? `<path fill="${C.white}" d="M34 56H66L60 82L50 76L40 82Z"/>` : ''}
<path fill="${skin}" d="M26 36L6 26L24 46Z"/><path fill="${skin}" d="M74 36L94 26L76 46Z"/>
<ellipse fill="${skin}" cx="50" cy="38" rx="27" ry="23"/>
<path fill="${hair}" d="${cloud(50, 17, 22, 8, 8, 13)}"/>
<circle fill="${C.white}" cx="39" cy="32" r="8"/><circle fill="${C.white}" cx="61" cy="32" r="8"/>
${o.wet ? `<path fill="none" d="M34 33q5 3 10 0M56 33q5 3 10 0"/>` : `<circle class="solid" cx="40" cy="33" r="2.8"/><circle class="solid" cx="60" cy="33" r="2.8"/>`}
${o.wet ? '' : `<path fill="none" d="M29 22l13 4M71 22l-13 4"/>`}
${o.roar ? `<path fill="${C.deepred}" d="M32 48Q50 72 68 48Q50 54 32 48Z"/><path fill="${C.white}" d="M38 50l2.5 5 3-4.5zM62 50l-2.5 5-3-4.5z"/>`
      : `<path fill="none" d="${o.wet ? 'M34 56Q50 48 66 56' : 'M32 50Q50 60 68 50'}"/>`}
<path fill="#c48f72" d="M46 34C43 44 41 56 45 62C49 66 56 63 55 54C54 46 54 40 54 34Z"/>
<circle class="nol" fill="${C.rose}" opacity=".45" cx="30" cy="44" r="4"/><circle class="nol" fill="${C.rose}" opacity=".45" cx="70" cy="44" r="4"/>`;
  };

  // a wooden footbridge; the top of the deck is at about y = 55 in the middle
  S.bridge = () => {
    const band = (a, b) => `M-2 ${60 - a}Q50 ${50 - a} 102 ${60 - a}L102 ${60 - b}Q50 ${50 - b} -2 ${60 - b}Z`;
    const top = (x) => { const t = (x + 2) / 104; return 60 - 20 * t * (1 - t); };
    let planks = '', posts = '';
    for (let x = 4; x < 100; x += 6.5) planks += `M${f(x)} ${f(top(x) + 0.8)}V${f(top(x) + 5.2)}`;
    for (const x of [1, 25.5, 50, 74.5, 99]) posts += `<rect fill="${C.bark}" x="${f(x - 1.6)}" y="${f(top(x) - 14)}" width="3.2" height="14.5"/>`;
    return `
<path fill="${C.bark}" d="M4 64L2 96H9L11 64ZM15 63L17 96H24L21 63ZM96 64L98 96H91L89 64ZM85 63L83 96H76L79 63Z"/>
<path fill="none" class="fine" d="M8 70L20 86M20 70L8 86M80 70L92 86M92 70L80 86"/>
${posts}
<path fill="${C.tan}" d="${band(14, 11.5)}"/>
<path fill="${C.tan}" d="${band(0, -6)}"/>
<path fill="none" class="fine" d="${planks}"/>`;
  };
  META.bridge = { sky: true };

  // a splash of water
  S.splash = () => `
<path fill="#a9c8da" d="M8 96C14 88 22 84 25 70C29 80 33 84 38 72C42 82 46 84 50 60C54 84 58 82 62 72C67 84 71 80 75 70C78 84 86 88 92 96Z"/>
<circle fill="#a9c8da" cx="24" cy="56" r="3"/><circle fill="#a9c8da" cx="38" cy="58" r="2.4"/><circle fill="#a9c8da" cx="50" cy="44" r="3.4"/>
<circle fill="#a9c8da" cx="63" cy="57" r="2.4"/><circle fill="#a9c8da" cx="77" cy="55" r="3"/>`;
  META.splash = { sky: true };

  // a tortoise (side on, facing right)
  S.tortoise = (o = {}) => {
    const skin = '#a9ad6a', shell = '#8b7a3e';
    return `
<path fill="${skin}" d="M20 76L9 82L22 82Z"/>
<path fill="${skin}" d="M24 78L21 94H32L34 80Z"/><path fill="${skin}" d="M62 78L62 94H73L72 80Z"/>
<path class="nol" fill="#7f8550" d="M38 80L37 92H46L46 80ZM50 80L51 92H59L58 80Z"/>
<path fill="${skin}" d="M74 70C76 58 86 52 94 56C100 60 98 70 90 72L80 76Z"/>
${o.happy || o.sleep ? `<path fill="none" d="M86 61q3 ${o.sleep ? 2.5 : -3} 6 0"/>` : `<circle class="solid" cx="89" cy="60.5" r="2"/>`}
<path fill="none" d="M88 67q4 2.5 8-1"/>
<path fill="${shell}" d="M18 78C18 54 34 42 50 42C66 42 82 54 82 78Z"/>
<path class="nol" fill="${C.ochre}" opacity=".5" d="M41 54H59L64 66H36Z"/>
<path fill="none" class="fine" d="M50 42V54M38 46L41 54M62 46L59 54M41 54H59L64 66H36ZM41 54L29 61M59 54L71 61M36 66L27 77M64 66L73 77M50 66V77"/>
<path fill="#c2a55d" d="M14 76H86Q86 82 80 82H20Q14 82 14 76Z"/>`;
  };
  META.tortoise = { w: 1.2 };

  // a flag on a pole (for the start and the finish of a race)
  S.flag = (o = {}) => `
<rect fill="${C.bark}" x="47" y="12" width="3.6" height="84"/>
<circle fill="${C.gold}" cx="48.8" cy="10" r="3.2"/>
<path fill="${o.color || C.red}" d="M50.6 15C62 11 72 21 88 17L83 29L88 41C72 45 62 35 50.6 39Z"/>`;
  META.flag = { w: 0.35 };

  /* ---------- little pictures inside other pictures ---------- */
  // nest([[sprite, x, y, size, opts], ...]) draws sprites inside another sprite's 100 x 100 box,
  // the way a story page places them. Their ink lines stay a little lighter than the page's.
  const nest = (art) => art.map(([n, x, y, s = 1, o = {}]) => (S[n]
    ? `<g class="nest" style="--nk:${f(0.8 / s)}" transform="translate(${x} ${y})${o.rot ? ` rotate(${o.rot})` : ''} scale(${o.flip ? -s : s} ${s}) translate(-50 -96)">${S[n](o)}</g>`
    : '')).join('');

  // a thought bubble: what someone is thinking of. o.art is the picture inside (see nest);
  // o.tail 'right' puts the little trail of dots on the right instead of the left
  S.think = (o = {}) => {
    const r = o.tail === 'right';
    return `<circle fill="${C.white}" cx="${r ? 80 : 20}" cy="86" r="4.8"/><circle fill="${C.white}" cx="${r ? 90 : 10}" cy="95" r="2.8"/>
<path fill="${C.white}" d="${cloud(50, 42, 46, 36, 11, 5)}"/>${nest(o.art || [])}`;
  };
  META.think = { sky: true };

  // a speech bubble with a picture in it: what someone is talking about
  S.say = (o = {}) => `<path fill="${C.white}" d="${o.tail === 'right'
    ? 'M70 70.6L84 95L56 73.7A46 34 0 1 1 70 70.6Z' : 'M30 70.6L16 95L44 73.7A46 34 0 1 0 30 70.6Z'}"/>${nest(o.art || [])}`;
  META.say = { sky: true };

  /* ---------- marks that show what is happening ---------- */
  S.zzz = () => `<path fill="none" d="M12 80h12L12 92h12M36 54h16L36 70h16M64 20h22L64 42h22"/>`;
  META.zzz = { sky: true };

  // speed lines: something has just whizzed off to the right
  S.lines = () => `<path fill="none" d="M10 40H56M24 54H76M6 68H50M26 82H64"/>`;
  META.lines = { sky: true };

  S.dust = () => `<path fill="${C.cream}" d="${cloud(30, 84, 16, 10, 7, 3)}"/><path fill="${C.cream}" d="${cloud(64, 80, 22, 14, 8, 6)}"/>`;
  META.dust = { sky: true };

  const heart = (x, y, s) => `M${x} ${f(y + s * 0.9)}C${f(x - s * 1.7)} ${f(y - s * 0.2)} ${f(x - s * 0.7)} ${f(y - s * 1.4)} ${x} ${f(y - s * 0.4)}` +
    `C${f(x + s * 0.7)} ${f(y - s * 1.4)} ${f(x + s * 1.7)} ${f(y - s * 0.2)} ${x} ${f(y + s * 0.9)}Z`;
  S.hearts = (o = {}) => o.one ? `<path fill="${C.red}" d="${heart(50, 62, 30)}"/>`
    : `<path fill="${C.red}" d="${heart(30, 74, 14)}"/><path fill="${C.rose}" d="${heart(70, 50, 12)}"/><path fill="${C.red}" d="${heart(38, 28, 9)}"/>`;
  META.hearts = { sky: true };

  S.notes = () => `<ellipse class="solid" cx="22" cy="80" rx="6.5" ry="4.6" transform="rotate(-20 22 80)"/><path fill="none" d="M28 78V44q8 4 10 12"/>
<ellipse class="solid" cx="56" cy="62" rx="6.5" ry="4.6" transform="rotate(-20 56 62)"/><ellipse class="solid" cx="82" cy="54" rx="6.5" ry="4.6" transform="rotate(-20 82 54)"/>
<path fill="none" d="M62 60V28L88 20V52"/>`;
  META.notes = { sky: true };

  // a bang: two things have bumped together hard
  S.burst = () => {
    const r = rng(23); let d = '', e = '';
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2, R = i % 2 ? 22 + r() * 6 : 42 + r() * 6;
      d += (i ? 'L' : 'M') + f(50 + Math.cos(a) * R) + ' ' + f(54 + Math.sin(a) * R * 0.9);
      e += (i ? 'L' : 'M') + f(50 + Math.cos(a) * R * 0.55) + ' ' + f(54 + Math.sin(a) * R * 0.5);
    }
    return `<path fill="${C.butter}" d="${d}Z"/><path class="nol" fill="${C.orange}" opacity=".7" d="${e}Z"/>`;
  };
  META.burst = { sky: true };

  const drop = (x, y, s) => `M${x} ${f(y - s * 2)}C${f(x + s * 0.4)} ${f(y - s)} ${f(x + s * 1.2)} ${f(y - s * 0.2)} ${f(x + s * 1.2)} ${f(y + s * 0.4)}` +
    `A${f(s * 1.2)} ${f(s * 1.2)} 0 0 1 ${f(x - s * 1.2)} ${f(y + s * 0.4)}C${f(x - s * 1.2)} ${f(y - s * 0.2)} ${f(x - s * 0.4)} ${f(y - s)} ${x} ${f(y - s * 2)}Z`;
  // drops of sweat, or of rain off someone wet through
  S.drops = () => `<path fill="#a9c8da" d="${drop(20, 70, 7)}${drop(52, 40, 8)}${drop(82, 72, 6)}"/>`;
  META.drops = { sky: true };

  // a dashed arrow, curving from left to right (rotate it to point anywhere)
  S.arrow = (o = {}) => o.up ? `<path fill="none" stroke-dasharray="7 6" d="M50 94Q40 56 50 16"/><path fill="none" d="M38 28L50 10L62 28"/>`
    : `<path fill="none" stroke-dasharray="7 6" d="M8 84Q46 34 84 66"/><path fill="none" d="M70 68L88 70L84 52"/>`;
  META.arrow = { sky: true };

  // footprints in a row
  S.steps = () => {
    let s = '';
    for (let i = 0; i < 5; i++) s += `<ellipse fill="#7f8550" opacity=".8" cx="${12 + i * 19}" cy="${i % 2 ? 86 : 93}" rx="5" ry="2.6"/>`;
    return s;
  };
  META.steps = { sky: true };

  // lines that spring out round someone who has just had a fright
  S.alarm = () => `<path fill="none" d="M24 58L8 44M34 40L24 18M50 34V8M66 40L76 18M76 58L92 44"/>`;
  META.alarm = { sky: true };

  // the trip-trap of hooves on a bridge
  S.sound = () => `<path fill="none" d="M26 82l-12-8M24 92H8M74 82l12-8M76 92h16"/>`;
  META.sound = { sky: true };

  // a sprinkle of magic
  const twinkle = (x, y, s) => `M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`;
  S.sparkle = () => `<path fill="${C.butter}" d="${twinkle(26, 70, 14)}${twinkle(70, 40, 18)}${twinkle(40, 22, 8)}${twinkle(80, 80, 9)}"/>`;
  META.sparkle = { sky: true };

  S.crack = () => `<path fill="none" d="M50 56L36 44L42 36L28 20M50 56L66 46L60 38L76 24M50 56L44 72L54 80L48 94M50 56L70 66"/>`;
  META.crack = { sky: true };

  // a big gust of breath or wind, blowing to the right
  S.gust = () => `<path fill="none" d="M4 50Q40 40 70 50Q88 57 80 68Q72 74 66 64M10 72Q40 64 62 74M12 30Q44 22 66 30Q80 36 74 44Q68 48 64 42"/>`;
  META.gust = { sky: true };

  /* ---------- things ---------- */
  S.fire = () => `
<path fill="${C.bark}" d="${stick(12, 95, 88, 84, 7)}${stick(14, 84, 86, 95, 7)}"/>
<path fill="${C.orange}" d="M20 90C12 70 26 62 30 44C34 56 40 58 40 70C42 56 48 44 50 18C56 38 62 50 60 66C64 58 66 52 72 44C80 60 84 76 78 90Z"/>
<path class="nol" fill="${C.butter}" d="M32 90C28 80 34 72 40 64C42 72 46 74 46 80C48 74 52 68 54 58C60 70 66 80 64 90Z"/>`;
  META.fire = { w: 0.9 };

  // a bucket of tar, with the brush left in it
  S.bucket = () => `
<path fill="${C.bark}" d="${stick(58, 46, 80, 6, 4.5)}"/>
<path fill="none" d="M24 46Q50 14 76 46"/>
<path fill="${C.silver}" d="M24 44H76L70 94H30Z"/>
<path fill="none" class="fine" d="M27 62H73M29 80H71"/>
<ellipse fill="#3b3438" cx="50" cy="44" rx="26" ry="6"/>
<path fill="#3b3438" d="M31 46q1 16 5 16q4 0 4-15M58 48q1 22 5 22q4 0 3-23"/>`;

  // a branch with a rope hanging from it
  S.rope = () => `
<path fill="${C.bark}" d="M0 24Q40 14 100 22L100 30Q40 23 0 33Z"/>
<path fill="${C.leaf}" d="M82 21q8-10 16-4q-8 8-16 4zM10 24q-2-12 8-12q2 10-8 12z"/>
<path fill="${C.tan}" d="${stick(58, 26, 58, 60, 3.6)}"/>
<path fill="${C.tan}" fill-rule="evenodd" d="M48 72a10 12 0 1 0 20 0a10 12 0 1 0-20 0M52 72a6 8 0 1 0 12 0a6 8 0 1 0-12 0"/>`;

  // a rabbit skin pegged out flat to dry
  S.pelt = () => `
<path fill="${C.rabbit}" d="M40 32C35 18 37 4 42 4C47 4 48 18 46 30L54 30C52 18 53 4 58 4C63 4 65 18 60 32C69 36 71 44 70 52L86 48L86 58L70 62C72 72 70 80 66 84L76 94L64 96L57 88H43L36 96L24 94L34 84C30 80 28 72 30 62L14 58L14 48L30 52C29 44 31 36 40 32Z"/>
<path class="nol" fill="${C.cream}" opacity=".6" d="M42 46C46 42 54 42 58 46C60 60 56 76 50 80C44 76 40 60 42 46Z"/>
<path fill="none" class="fine" d="M88 46l4-4M88 60l4 4M12 46l-4-4M12 60l-4 4M24 98l-3 3M76 98l3 3M38 8l-2-4M62 8l2-4"/>`;

  // a heap of earth, the hole it came out of, and the spade that dug it
  S.dig = () => `
<path fill="#7a5a3c" d="M4 94C8 78 26 72 42 78C48 82 50 88 52 94Z"/>
<circle fill="#7a5a3c" cx="22" cy="58" r="3"/><circle fill="#7a5a3c" cx="38" cy="50" r="2.4"/><circle fill="#7a5a3c" cx="12" cy="66" r="2"/>
<ellipse fill="#4a3628" cx="74" cy="91" rx="20" ry="5.5"/>
<path fill="${C.bark}" d="${stick(46, 26, 62, 76, 4.5)}M38 24L54 19L55.5 23L39.5 28Z"/>
<path fill="${C.silver}" d="M57 72L69 67L78 86L66 92Z"/>
<circle fill="${C.ochre}" cx="80" cy="90" r="1.6"/><circle fill="${C.ochre}" cx="72" cy="92" r="1.6"/>`;
  META.dig = { w: 1.2 };

  S.sickle = () => `<path fill="${C.bark}" d="${stick(40, 94, 48, 64, 6)}"/><path fill="${C.silver}" d="M47 66C38 40 56 14 86 16C66 24 56 40 54 63Z"/>`;
  META.sickle = { sky: true };

  // a knife and fork, for eating
  S.cutlery = () => `
<path fill="${C.silver}" d="${stick(30, 94, 30, 46, 5)}M22 46H38V36H22ZM22 36V10H25V36ZM28.5 36V10H31.5V36ZM35 36V10H38V36Z"/>
<path fill="${C.silver}" d="${stick(68, 94, 68, 58, 5)}M64.5 58C62 40 64 18 72 8V58Z"/>`;
  META.cutlery = { sky: true };

  // a bowl of hot soup with a spoon in it
  S.bowl = () => `
<path fill="${C.silver}" d="${stick(60, 66, 84, 30, 4)}"/><ellipse fill="${C.silver}" cx="86" cy="26" rx="6" ry="8" transform="rotate(34 86 26)"/>
<path fill="${C.blue}" d="M12 66H88C88 84 72 94 50 94C28 94 12 84 12 66Z"/>
<ellipse fill="${C.ochre}" cx="50" cy="66" rx="38" ry="6.5"/>
<path fill="none" class="fine" d="M30 56q-4-6 0-12t0-12M48 54q-4-6 0-12t0-12M66 56q-4-6 0-12"/>`;
  META.bowl = { w: 1.1 };

  S.crumbs = () => `<path fill="#d79b55" d="M30 94C28 84 36 80 44 82L46 94Z"/>
<circle fill="#d79b55" cx="58" cy="92" r="2.6"/><circle fill="#d79b55" cx="68" cy="94" r="2"/><circle fill="#d79b55" cx="76" cy="90" r="2.4"/><circle fill="#d79b55" cx="20" cy="93" r="2"/><circle fill="#d79b55" cx="86" cy="94" r="1.8"/>`;
  META.crumbs = { w: 1 };

  // a bale of straw
  S.bale = () => {
    const r = rng(41); let d = '';
    for (let i = 0; i < 26; i++) { const x = 14 + r() * 72, y = 56 + r() * 34; d += `M${f(x)} ${f(y)}l${f(r() * 6 - 3)} 5`; }
    return `<path fill="${C.butter}" d="M10 54H88V94H10Z"/><path fill="${C.ochre}" d="M10 54L20 44H98L88 54Z"/><path fill="#c9a24a" d="M88 54L98 44V84L88 94Z"/>
<path fill="none" class="fine" d="${d}"/><path fill="none" d="M32 54V94M66 54V94M42 44L32 54M76 44L66 54"/>`;
  };
  META.bale = { w: 1.3 };

  // a pig's face, front on, with the hairs on its chinny chin chin
  S.pighead = () => `
<path fill="${C.pink}" d="M20 34L24 8L42 22Z"/><path fill="${C.pink}" d="M80 34L76 8L58 22Z"/>
<ellipse fill="${C.pink}" cx="50" cy="50" rx="32" ry="30"/>
<circle class="solid" cx="38" cy="40" r="2.8"/><circle class="solid" cx="62" cy="40" r="2.8"/>
<circle class="nol" fill="${C.rose}" opacity=".5" cx="30" cy="54" r="5"/><circle class="nol" fill="${C.rose}" opacity=".5" cx="70" cy="54" r="5"/>
<ellipse fill="${C.rose}" cx="50" cy="56" rx="13" ry="9"/>
<ellipse class="solid" cx="45" cy="56" rx="2" ry="3"/><ellipse class="solid" cx="55" cy="56" rx="2" ry="3"/>
<path fill="none" d="M42 70q8 5 16 0"/>
<path fill="none" d="M42 79l-2 9M47 80l-1 10M53 80l1 10M58 79l2 9"/>`;
  META.pighead = { sky: true };

  S.bones = () => `
<path fill="${C.cream}" d="${stick(24, 28, 76, 84, 9)}${stick(76, 28, 24, 84, 9)}"/>
<circle fill="${C.cream}" cx="16" cy="28" r="7"/><circle fill="${C.cream}" cx="24" cy="20" r="7"/><circle fill="${C.cream}" cx="84" cy="28" r="7"/><circle fill="${C.cream}" cx="76" cy="20" r="7"/>
<circle fill="${C.cream}" cx="16" cy="84" r="7"/><circle fill="${C.cream}" cx="24" cy="92" r="7"/><circle fill="${C.cream}" cx="84" cy="84" r="7"/><circle fill="${C.cream}" cx="76" cy="92" r="7"/>`;
  META.bones = { sky: true };

  S.snail = () => `
<path fill="#c4b48a" d="M8 94C10 87 18 85 28 85H70C78 85 82 76 84 66C86 59 94 59 94 66C94 78 88 94 70 94Z"/>
<path fill="none" d="M86 61l-4-14M91 61l4-14"/><circle class="solid" cx="82" cy="46" r="2.2"/><circle class="solid" cx="95" cy="46" r="2.2"/>
<circle fill="${C.rust}" cx="46" cy="62" r="24"/>
<path fill="none" d="M46 62a3 3 0 1 1 6 0a6 6 0 1 1-12 0a9 9 0 1 1 18 0a12 12 0 1 1-24 0a15 15 0 1 1 30 0"/>`;
  META.snail = { w: 0.9 };

  // a prize rosette for the winner
  S.rosette = () => `
<path fill="${C.blue}" d="M42 56L30 94L42 87L48 96L54 58Z"/><path fill="${C.blue}" d="M58 56L70 94L58 87L52 96L46 58Z"/>
<path fill="${C.red}" d="${cloud(50, 40, 27, 27, 12, 4)}"/>
<circle fill="${C.gold}" cx="50" cy="40" r="16"/>
<text class="label" x="50" y="46" text-anchor="middle" font-size="17">1</text>`;
  META.rosette = { sky: true };

  /* ---------- people (front on, like Pip, but grown up) ---------- */
  const SKIN = '#f2cfae';
  // where the hands go, [left, right], for each way of holding the arms
  const POSE = {
    down: [[37, 66], [63, 66]], hold: [[44, 55], [56, 55]], up: [[30, 16], [70, 16]],
    point: [[37, 66], [83, 34]], throw: [[37, 66], [72, 10]], wave: [[37, 66], [71, 22]],
    reach: [[37, 66], [81, 54]], offer: [[30, 50], [70, 50]], face: [[45, 33], [55, 33]]
  };
  const HAIR = {
    fringe: 'M40 27C39 15 61 15 60 27Q57 20 50 22.5Q43 20 40 27Z',
    short: 'M40 27C38 14 62 14 60 27Q58 20.5 51 21.5Q45 20 40 27Z',
    thin: 'M40.5 26C42 17 58 17 59.5 26Q56 21.5 50 21.5Q44 21.5 40.5 26Z'
  };
  const BODY = {
    mermaid: () => `<path fill="${SKIN}" d="M41 38Q50 35 59 38L58 57H42Z"/>
<path fill="${C.plum}" d="M40 41Q46 38 50 44Q56 38 61 42L58 48H42Z"/>
<path fill="${C.teal}" d="M41 55Q50 59 59 55Q66 78 41 86L29 88Q27 76 15 76Q16 89 29 91Q16 93 15 99Q30 101 38 93Q55 92 62 82Q73 65 59 54Z"/>`,
    trousers: (c) => `<path fill="${c}" d="M40 38Q50 35 60 38L61 57Q72 74 61 89H53L50 69L47 89H39Q28 75 39 57Z"/>
<path fill="${C.gold}" d="M39 56H61V60H39Z"/><path fill="${C.brown}" d="M39 89H47V95H34Q32 92 39 89ZM53 89H61L67 93V95H53Z"/>`,
    gown: (c) => `<path fill="${c}" d="M42.5 38Q50 36 57.5 38L59 51Q67 71 76 93Q50 99 24 93Q33 71 41 51Z"/>
<path fill="none" class="fine" d="M41 51Q50 54 59 51M37 76l-4 15M50 62v32M63 76l4 15"/>`,
    tunic: (c, o) => `<rect fill="${o.legs || C.navy}" x="43" y="70" width="6" height="22"/><rect fill="${o.legs || C.navy}" x="51" y="70" width="6" height="22"/>
<ellipse fill="${C.black}" cx="45" cy="93.5" rx="5.5" ry="3"/><ellipse fill="${C.black}" cx="55" cy="93.5" rx="5.5" ry="3"/>
<path fill="${c}" d="M40 38Q50 35.5 60 38L63 73Q50 77 37 73Z"/>
${o.apron ? `<path class="nol" fill="${C.white}" d="M42 58H58L60 74Q50 77 40 74Z"/>` : ''}
<path fill="${C.bark}" d="M38.6 56H61.4V60H38.6Z"/>`,
    robe: (c) => `<path fill="${c}" d="M41 38Q50 35.5 59 38L62 52Q68 72 72 94H28Q32 72 38 52Z"/>
<path fill="${C.white}" d="M28.4 88H71.6L72 94H28Z"/>
<path class="solid" d="M34 90h1.6v2.4H34zM44 90h1.6v2.4H44zM54 90h1.6v2.4H54zM64 90h1.6v2.4H64z"/>`,
    cloak: (c) => `<path fill="${c}" d="M39 37Q50 33 61 37Q69 64 74 94H26Q31 64 39 37Z"/>
<path fill="none" class="fine" d="M44 46l-6 46M56 46l6 46"/>`
  };
  // a head, face on. o.hair colour, o.style (fringe, short, thin), o.sleep, o.cry, o.cross, o.mouth,
  // o.beard colour, o.crown, o.hat colour, o.chef, o.hood colour
  function head(o = {}) {
    const hair = o.hair || C.ochre;
    const eyes = o.sleep ? `<path fill="none" d="M43 27.5q2.5 2 5 0M52 27.5q2.5 2 5 0"/>`
      : `${o.cross ? `<path fill="none" d="M42 23l6 2.4M58 23l-6 2.4"/>` : ''}<circle class="solid" cx="45.5" cy="27.5" r="1.5"/><circle class="solid" cx="54.5" cy="27.5" r="1.5"/>`;
    const m = o.mouth || (o.cry || o.cross ? 'sad' : 'smile');
    const mouth = {
      smile: `<path fill="none" d="M46.5 32q3.5 3 7 0"/>`, sad: `<path fill="none" d="M46.5 34q3.5-2.6 7 0"/>`,
      o: `<ellipse fill="${C.rose}" cx="50" cy="33" rx="1.8" ry="2.3"/>`, grin: `<path fill="${C.rose}" d="M45.5 31.5Q50 37.5 54.5 31.5Z"/>`
    }[m] || '';
    return `<circle fill="${o.skin || SKIN}" cx="50" cy="28" r="10"/>
${eyes}<circle class="nol" fill="${C.rose}" opacity=".5" cx="42.8" cy="31.2" r="2.4"/><circle class="nol" fill="${C.rose}" opacity=".5" cx="57.2" cy="31.2" r="2.4"/>
${mouth}
${o.cry ? `<path fill="#a9c8da" d="${drop(44.5, 33, 1.6)}${drop(55.5, 33, 1.6)}${drop(42, 40, 1.4)}"/>` : ''}
${o.beard ? `<path fill="${o.beard}" d="M41 30.5Q41 46 50 48Q59 46 59 30.5Q56 35 50 35.5Q44 35 41 30.5Z"/><path fill="none" d="M45 33q2.5-1.6 5 0q2.5-1.6 5 0"/>` : ''}
${HAIR[o.style] ? `<path fill="${hair}" d="${HAIR[o.style]}"/>` : ''}
${o.hood ? `<path fill="${o.hood}" d="M38.5 31C36 11 64 11 61.5 31C59 19 41 19 38.5 31Z"/>` : ''}
${o.hat ? `<path fill="${o.hat}" d="M38 23C38 12 62 12 62 23Q50 19 38 23Z"/><path fill="${C.white}" d="M58 16q10-9 15-5q-6 2-13 8z"/>` : ''}
${o.chef ? `<path fill="${C.white}" d="M41 21L41 14C34 14 34 4 42 6C44 0 56 0 58 6C66 4 66 14 59 14L59 21Z"/>` : ''}
${o.crown ? `<path fill="${C.gold}" d="M41.5 20L41 11L45.5 15L50 9L54.5 15L59 11L58.5 20Z"/><circle class="nol" fill="${C.red}" cx="50" cy="16.5" r="1.4"/>` : ''}`;
  }
  // a whole person: o.body (gown, tunic, robe, cloak), o.col its colour, o.arms (see POSE),
  // o.long long hair, o.cape colour, o.legs colour, o.apron, plus everything head() takes
  function person(o = {}) {
    const col = o.col || C.rose, [[lx, ly], [rx, ry]] = POSE[o.arms || 'down'];
    return `
${o.cape ? `<path fill="${o.cape}" d="M40 39L27 93Q50 97 73 93L60 39Z"/>` : ''}
${o.hood ? `<path fill="${o.hood}" d="M36 36C31 8 69 8 64 36L68 46H32Z"/>` : ''}
${o.long ? `<path fill="${o.hair || C.ochre}" d="M39.5 27C36 12 64 12 60.5 27C62 36 67 46 66 54Q60 52 57 44H43Q40 52 34 54C33 46 38 36 39.5 27Z"/>` : ''}
${BODY[o.body || 'gown'](col, o)}
<path fill="${o.sleeve || col}" d="${stick(41.5, 41, lx, ly, 6.5)}${stick(58.5, 41, rx, ry, 6.5)}"/>
<circle fill="${o.skin || SKIN}" cx="${lx}" cy="${ly}" r="3.2"/><circle fill="${o.skin || SKIN}" cx="${rx}" cy="${ry}" r="3.2"/>
${head(o)}`;
  }

  S.princess = (o = {}) => person({ col: C.rose, hair: C.gold, long: true, style: 'fringe', crown: true, ...o });
  S.elsa = (o = {}) => S.princess({ col: C.sky, hair: C.cream, crown: false, ...o });
  S.anna = (o = {}) => S.princess({ col: C.pea, hair: C.rust, crown: false, ...o });
  S.snowball = () => `<circle fill="${C.white}" cx="50" cy="55" r="37"/>
<path fill="none" class="fine" d="M24 61q4 15 19 18"/>`;
  S.olaf = () => `<path fill="none" d="M39 59L18 45l-4-9m4 9-9-3m52 17 21-14 4-9m-4 9 9-3"/>
<ellipse fill="${C.white}" cx="50" cy="80" rx="22" ry="15"/><ellipse fill="${C.white}" cx="50" cy="57" rx="16" ry="13"/>
<path fill="none" d="M49 19l-5-12m6 13 4-15"/><path fill="${C.white}" d="M31 25Q31 14 49 16Q71 13 69 31Q66 49 51 49Q33 46 31 25Z"/>
<circle class="solid" cx="44" cy="25" r="2"/><circle class="solid" cx="54" cy="25" r="2"/>
<path fill="${C.orange}" d="M48 28l25 2-24 5Z"/><path fill="none" d="M40 36q9 10 19 1"/>
<circle class="solid" cx="50" cy="56" r="3"/><circle class="solid" cx="50" cy="75" r="3"/>`;
  S.aurora = (o = {}) => S.princess({ col: C.grey, sleeve: C.cream, crown: false, ...o });
  S.owlprince = () => `${S.owl()}
<path fill="${C.red}" d="M24 25Q36 20 46 7Q58 7 73 24Q51 19 24 25Z"/>
<path fill="${C.deepred}" d="M32 51Q47 56 67 51L80 91Q59 98 38 92L45 58L24 89Z"/>`;
  S.prince = (o = {}) => person({ body: 'tunic', col: C.blue, hair: C.brown, style: 'short', crown: true, cape: C.red, ...o });
  S.belle = (o = {}) => S.princess({ col: C.leaf, hair: C.brown, crown: false, ...o });
  S.cinderella = (o = {}) => S.princess({ col: C.sky, long: false, crown: false, ...o });
  S.rapunzel = (o = {}) => `<path fill="${C.gold}" d="M44 28Q32 33 36 59T21 85Q34 91 42 69L51 39Z"/>${S.princess({ col: '#ad85af', crown: false, ...o })}`;
  S.flynn = (o = {}) => person({ body: 'tunic', col: C.teal, sleeve: C.cream, hair: C.brown, style: 'short', ...o });
  S.eric = (o = {}) => person({ body: 'tunic', col: C.white, legs: C.navy, hair: C.black, style: 'short', ...o });
  S.ariel = (o = {}) => person({ body: 'mermaid', hair: C.rust, long: true, style: 'fringe', sleeve: SKIN, ...o });
  S.beast = () => `<path fill="${C.plum}" d="M29 43Q48 35 71 44L82 93Q51 102 18 92Z"/>
<path fill="${C.navy}" d="M29 45Q50 39 71 45L66 72Q50 79 34 72Z"/>
<path fill="${C.gold}" d="M40 45L50 52L61 45L52 62Z"/>
<path fill="${C.tan}" d="M34 73H46L44 91Q40 96 28 94L30 90ZM55 73H66L70 89Q78 95 57 94Z"/>
<path fill="${C.brown}" d="M26 21L34 20Q49 5 67 18L78 16L72 31L75 39L68 38L70 46L61 43L58 52L51 48L46 54L40 46L33 48L32 41L24 42L28 32Z"/>
<path fill="${C.cream}" d="M35 22Q23 18 27 5Q29 15 40 16ZM59 17Q70 14 71 4Q78 17 65 22Z"/>
<ellipse fill="${C.tan}" cx="50" cy="34" rx="15" ry="9"/><ellipse fill="${C.black}" cx="51" cy="29" rx="5.5" ry="3.1"/>
<circle class="solid" cx="40" cy="24" r="2"/><circle class="solid" cx="60" cy="24" r="2"/>
<path fill="${C.cream}" d="M36 39l-1-7 5 6ZM60 38l5-6-2 7Z"/><path fill="none" d="M43 38q7 4 14-1"/>`;
  S.jasmine = (o = {}) => `${person({ body: 'trousers', col: '#65b9b3', skin: '#bf8259', hair: C.black, long: true, style: 'fringe', ...o })}
<path fill="${C.teal}" d="M39 21Q48 11 61 21L60 24Q51 16 40 24Z"/><circle fill="${C.sky}" cx="50" cy="18" r="2.8"/>`;
  S.aladdin = (o = {}) => `${person({ body: 'trousers', col: C.cream, skin: '#bd8055', hair: C.black, style: 'short', cape: C.white, ...o })}
<path fill="${C.cream}" d="M37 22Q32 9 46 10Q57 3 64 14L63 22Q52 19 37 24Z"/>
<path fill="${C.plum}" d="M49 19Q47 7 54 1Q57 10 52 19Z"/><circle fill="${C.red}" cx="50" cy="20" r="2.6"/>`;

  S.slipper = () => `<path fill="#c3e2e7" d="M12 52Q21 71 39 67L66 48Q72 45 75 56Q79 66 90 68Q95 76 84 80H54Q44 80 35 72L24 72L23 86H17Z"/>
<path fill="none" class="fine" d="M35 68Q49 75 61 74M71 54l4 7"/>`;
  S.slipperfoot = () => `<path fill="${SKIN}" d="M31 10L52 11L47 55Q48 64 68 69L76 74L34 73Q25 68 30 58Z"/>
<path fill="${C.cream}" d="M16 6H68L61 28Q51 34 43 27Q33 35 20 29Z"/>
<g transform="translate(8 11) scale(.86)">${S.slipper()}</g>`;
  S.pumpkin = () => `<path fill="${C.leaf}" d="M47 42Q50 25 57 23L61 28Q53 32 54 42Z"/>
<path fill="${C.orange}" d="M50 39C20 24 3 52 12 76Q20 96 50 91Q80 97 89 75C99 49 75 24 50 39Z"/>
<path fill="none" d="M42 40Q22 61 39 89M55 40Q74 63 59 90"/>`;
  S.stepslab = () => `<path fill="#c9bda8" d="M5 94V74H33V55H61V36H93V94Z"/><path fill="none" d="M33 74H93M61 55H93"/>`;
  S.lantern = () => `<path fill="#f6cb77" d="M21 19Q47 12 79 19L73 77Q48 86 27 77Z"/>
<ellipse fill="${C.butter}" cx="50" cy="78" rx="23" ry="4"/><path fill="${C.orange}" d="M45 77Q43 68 51 60Q49 68 55 72L54 78Z"/>`;
  META.lantern = { sky: true };
  S.bookcase = () => {
    const colors = [C.rust, C.teal, C.gold, C.navy, C.leaf, C.plum];
    let books = '';
    for (let row = 0; row < 4; row++) {
      const y = 26 + row * 20;
      for (let i = 0; i < 10; i++) {
        const x = 13 + i * 7.4, h = 11 + (i * 3 + row) % 7;
        books += `<rect fill="${colors[(row + i) % colors.length]}" x="${x}" y="${y - h}" width="6.8" height="${h}"/>`;
      }
      books += `<path fill="${C.tan}" d="M9 ${y}h82v3H9Z"/>`;
    }
    return `<path fill="${C.brown}" d="M7 4H93V94H7Z"/>${books}`;
  };
  S.carpet = () => `<path fill="${C.plum}" d="M4 68Q26 73 52 65T96 60L82 84Q60 77 37 86L12 87Z"/>
<path fill="none" stroke="${C.butter}" d="M12 72Q35 75 53 69T87 65L80 79Q61 75 39 82L17 84Z"/>
<path fill="${C.gold}" d="M43 77l9-7 9 2-10 7Z"/><path fill="none" d="M9 85l-4 8m9-7-3 8m71-11 4 8m5-29 6 4"/>`;
  META.carpet = { sky: true };
  S.roof = () => `<path fill="${C.teal}" d="M3 76Q30 80 50 45Q70 80 97 76Q78 92 50 68Q27 94 3 76Z"/>
<path fill="${C.deepred}" d="M23 83L50 67L78 83V96H23Z"/>`;
  S.firework = () => {
    let rays = '';
    for (let angle = 0; angle < 360; angle += 30) {
      rays += `<g transform="rotate(${angle} 50 50)"><path fill="${angle % 60 ? C.butter : C.pink}" d="M49 40Q46 24 50 16Q49 32 52 38Z"/><circle fill="${C.gold}" cx="50" cy="10" r="2.3"/></g>`;
    }
    return rays;
  };
  META.firework = { sky: true };
  S.king = (o = {}) => person({ body: 'robe', col: C.red, hair: C.silver, style: 'short', beard: C.silver, crown: true, ...o });
  S.queen = (o = {}) => person({ col: C.plum, hair: C.brown, long: true, style: 'fringe', crown: true, ...o });
  // a Wise Woman, in a hooded cloak; o.wicked for the thirteenth
  S.wise = (o = {}) => person({ body: 'cloak', col: o.wicked ? C.black : C.teal, hood: o.wicked ? '#3a2f36' : '#4f807c', hair: C.silver, cross: o.wicked, ...o });
  S.oldwoman = (o = {}) => person({ body: 'cloak', col: C.brown, hood: C.grey, hair: C.silver, style: 'thin', ...o });
  S.henry = (o = {}) => person({ body: 'tunic', col: C.green, legs: C.brown, hair: C.brown, style: 'short', hat: C.leaf, ...o });
  S.cook = (o = {}) => person({ body: 'tunic', col: C.cream, legs: C.brown, apron: true, hair: C.bark, style: 'short', beard: C.bark, chef: true, ...o });
  // just a head (for tucking up in bed)
  S.princesshead = (o = {}) => `<path fill="${o.hair || C.gold}" d="M39.5 27C36 12 64 12 60.5 27C62 32 63 36 60 38H40C37 36 38 32 39.5 27Z"/>${head({ hair: C.gold, style: 'fringe', crown: true, ...o })}`;

  /* ---------- castles and things in them ---------- */
  S.castle = (o = {}) => {
    const stone = '#d6cbb4', roof = o.roof || C.blue;
    const merlons = (x0, x1, y) => { let d = ''; for (let x = x0; x < x1; x += 6) d += `M${x} ${y}h3.4v-4.4h-3.4z`; return d; };
    return `
<path fill="${C.red}" d="M19 -6L19 -14L28 -10ZM81 -6L81 -14L90 -10Z"/><path fill="none" class="fine" d="M19 4V-14M81 4V-14"/>
<path fill="${stone}" d="M30 96V40H70V96Z"/>
<path fill="${stone}" d="${merlons(30, 70, 40)}"/>
<path fill="${stone}" d="M8 96V30H30V96ZM70 96V30H92V96Z"/>
<path fill="${roof}" d="M5 31L19 2L33 31ZM67 31L81 2L95 31Z"/>
<path fill="${C.bark}" d="M41 96V76C41 66 59 66 59 76V96Z"/>
<path fill="none" class="fine" d="M50 68V96M41 80H59M8 48H30M8 66H30M8 84H30M70 48H92M70 66H92M70 84H92M30 56H70M15 30v18M23 48v18M15 66v18M77 30v18M85 48v18M77 66v18"/>
<path fill="${C.butter}" d="M16 50V42C16 38 22 38 22 42V50ZM78 50V42C78 38 84 38 84 42V50ZM46 58V50C46 46 54 46 54 50V58Z"/>`;
  };
  META.castle = { w: 1.5 };

  // one tall tower with a little window at the top
  S.tower = () => `
<path fill="#d6cbb4" d="M34 96V22H66V96Z"/>
<path fill="${C.blue}" d="M29 24L50 -16L71 24Z"/>
<path fill="none" class="fine" d="M34 36H66M34 52H66M34 68H66M34 84H66M42 22v14M58 36v16M44 52v16M56 68v16M42 84v12"/>
<path fill="${C.butter}" d="M45 34V27C45 23 55 23 55 27V34Z"/>
<path fill="${C.bark}" d="M44 96V84C44 79 56 79 56 84V96Z"/>`;
  META.tower = { w: 0.7 };

  // a big arched castle door; o.open swings it open
  S.castledoor = (o = {}) => `
<path fill="#bfb39b" d="M14 96V44C14 10 86 10 86 44V96Z"/>
<path fill="none" class="fine" d="M14 50H24M76 50H86M14 70H24M76 70H86M14 88H24M76 88H86M30 20l5 6M70 20l-5 6M50 12v7"/>
${o.open ? `<path fill="#3e3238" d="M24 96V46C24 20 76 20 76 46V96Z"/><path fill="${C.brown}" d="M24 96V46L8 52V98Z"/>`
    : `<path fill="${C.brown}" d="M24 96V46C24 20 76 20 76 46V96Z"/>
<path fill="none" class="fine" d="M37 96V24M50 96V20M63 96V24"/>
<path fill="${C.black}" d="M24 40H46V44H24ZM24 76H46V80H24Z"/>
<path fill="none" d="M62 58a4.5 4.5 0 1 0 0.1 0"/>`}`;
  META.castledoor = { w: 1.3 };

  S.well = () => `
<path fill="${C.bark}" d="M19 66V20H25V66ZM75 66V20H81V66Z"/>
<path fill="${C.brown}" d="M8 24L50 2L92 24L86 28L50 10L14 28Z"/>
<path fill="${C.bark}" d="M22 38H78V42H22Z"/>
<path fill="none" class="fine" d="M50 42V52"/>
<path fill="${C.tan}" d="M44 52H56L54 61H46Z"/>
<path fill="${C.grey}" d="M12 64H88V94H12Z"/>
<path fill="none" class="fine" d="M12 74H88M12 84H88M24 64v10M44 64v10M64 64v10M82 64v10M18 74v10M36 74v10M56 74v10M74 74v10M28 84v10M48 84v10M68 84v10"/>
<ellipse fill="${C.silver}" cx="50" cy="64" rx="39" ry="6.5"/>
<ellipse class="nol" fill="#3d5068" cx="50" cy="64" rx="33" ry="4"/>`;
  META.well = { w: 1.4 };

  S.ball = () => `<circle fill="${C.gold}" cx="50" cy="78" r="17"/><circle class="nol" fill="${C.butter}" cx="44" cy="72" r="5"/><path fill="none" class="fine" d="M34 77q16 8 32 0"/>`;
  META.ball = { w: 0.5 };

  S.crown = () => `
<path fill="${C.gold}" d="M18 86L12 38L32 60L50 28L68 60L88 38L82 86Z"/>
<path fill="${C.ochre}" d="M18 86H82V94H18Z"/>
<circle fill="${C.red}" cx="50" cy="70" r="5"/><circle fill="${C.blue}" cx="32" cy="74" r="3.6"/><circle fill="${C.blue}" cx="68" cy="74" r="3.6"/>
<circle fill="${C.gold}" cx="12" cy="36" r="3.4"/><circle fill="${C.gold}" cx="50" cy="26" r="3.4"/><circle fill="${C.gold}" cx="88" cy="36" r="3.4"/>`;
  META.crown = { sky: true };

  S.cup = () => `<path fill="${C.gold}" d="M28 30H72Q72 62 56 66V84H66V92H34V84H44V66Q28 62 28 30Z"/><path class="nol" fill="${C.butter}" d="M34 36h5v20h-5z"/><ellipse fill="${C.ochre}" cx="50" cy="30" rx="22" ry="4"/>`;
  META.cup = { w: 0.6 };

  S.plate = () => `<ellipse fill="${C.gold}" cx="50" cy="84" rx="44" ry="11"/><ellipse fill="${C.butter}" cx="50" cy="83" rx="30" ry="6.5"/>`;
  META.plate = { sky: true };

  // a table with a cloth on it; o.plates lays that many golden plates along it
  S.table = (o = {}) => {
    let plates = '';
    const n = o.plates || 0;
    for (let i = 0; i < n; i++) { const x = 9 + (i + 0.5) * (82 / n); plates += `<ellipse fill="${C.gold}" cx="${f(x)}" cy="52" rx="${f(Math.min(5.5, 34 / n))}" ry="2"/>`; }
    return `
<path fill="${C.bark}" d="M12 76H17V96H12ZM83 76H88V96H83Z"/>
<path fill="${C.white}" d="M4 50H96L94 78Q88 74 82 78Q76 74 70 78Q64 74 58 78Q52 74 46 78Q40 74 34 78Q28 74 22 78Q16 74 10 78Q8 74 6 78Z"/>
<path fill="none" class="fine" d="M4 56H96"/>${plates}`;
  };
  META.table = { w: 1.5 };

  // a pile of mattresses and feather beds on a bedstead; o.n layers,
  // o.peas shows the three peas underneath, o.princess puts her on top
  S.mattresses = (o = {}) => {
    const n = o.n || 16, h = 4.6, cols = [C.red, C.butter, C.blue, C.cream, C.rose, C.green, C.white, C.ochre, C.teal, C.pink];
    const r = rng(7); let layers = '';
    for (let i = 0; i < n; i++) {
      const y = 84 - i * h, dx = f((r() - 0.5) * 6), w = f(22 + r() * 3);
      layers += `<path fill="${cols[i % cols.length]}" d="M${f(50 - w + +dx)} ${f(y)}Q${f(50 - w - 2 + +dx)} ${f(y - h / 2)} ${f(50 - w + +dx)} ${f(y - h)}H${f(50 + w + +dx)}Q${f(50 + w + 2 + +dx)} ${f(y - h / 2)} ${f(50 + w + +dx)} ${f(y)}Z"/>`;
    }
    const top = 84 - n * h;
    return `
<path fill="${C.brown}" d="M17 96V58Q21.5 52 26 58V96Z"/><path fill="${C.brown}" d="M74 96V70Q78 64 82 70V96Z"/>
<rect fill="${C.bark}" x="20" y="84" width="60" height="6"/>
${o.peas ? `<circle fill="${C.pea}" cx="36" cy="84" r="2.6"/><circle fill="${C.pea}" cx="50" cy="84.5" r="2.6"/><circle fill="${C.pea}" cx="63" cy="84" r="2.6"/>` : ''}
${layers}
${o.princess ? `<ellipse fill="${C.white}" cx="36" cy="${f(top - 2.5)}" rx="9" ry="4"/>
<g transform="translate(15 ${f(top - 20)}) scale(.42)">${S.princesshead({ sleep: o.princess === 'sleep', mouth: o.princess === 'sleep' ? 'smile' : 'sad' })}</g>
<path fill="${C.rose}" d="M38 ${f(top - 1)}Q56 ${f(top - 8)} 76 ${f(top - 3)}V${f(top)}H38Z"/>` : ''}`;
  };
  META.mattresses = { w: 1 };

  S.pea = () => `<circle fill="${C.pea}" cx="50" cy="80" r="16"/><circle class="nol" fill="${C.white}" opacity=".6" cx="44" cy="74" r="4.5"/>`;
  META.pea = { w: 0.45 };

  // the glass case the peas were kept in
  S.glasscase = () => `
<path fill="${C.bark}" d="M24 96V70H30V96ZM70 96V70H76V96Z"/>
<path fill="${C.brown}" d="M18 66H82V72H18Z"/>
<path fill="#d9e8ef" opacity=".7" d="M22 66V22H78V66Z"/>
<path fill="${C.brown}" d="M18 22H82V16H18Z"/>
<path fill="${C.deepred}" d="M32 66C32 56 68 56 68 66Z"/>
<circle fill="${C.pea}" cx="42" cy="56" r="4"/><circle fill="${C.pea}" cx="50" cy="54" r="4"/><circle fill="${C.pea}" cx="58" cy="56" r="4"/>
<path class="nol" fill="${C.white}" opacity=".8" d="M28 28L34 28L28 44Z"/>`;
  META.glasscase = { w: 1 };

  // a baby asleep in a rocking cradle
  S.cradle = () => `
<path fill="${C.bark}" d="M8 90Q50 100 92 90L92 95Q50 105 8 95Z"/>
<path fill="${C.tan}" d="M14 52H86L80 88Q50 94 20 88Z"/>
<path fill="none" class="fine" d="M18 62H84M20 74H82"/>
<circle fill="${SKIN}" cx="56" cy="46" r="10"/>
<path fill="none" d="M52 46q2 1.6 4 0M59 46q2 1.6 4 0"/><circle class="nol" fill="${C.rose}" opacity=".5" cx="54" cy="51" r="2"/>
<path fill="${C.gold}" d="M50 38Q56 33 62 38Q56 36 50 38Z"/>
<path fill="${C.pink}" d="M34 54Q58 46 84 54L82 64H32Z"/>
<path fill="${C.tan}" d="M12 54C10 30 26 22 38 24L40 54Z"/>`;
  META.cradle = { w: 1.2 };

  S.spindle = () => `
<path fill="${C.tan}" d="M48.6 92L49.2 16L50 4L50.8 16L51.4 92Z"/>
<ellipse fill="${C.cream}" cx="50" cy="50" rx="9" ry="17"/>
<path fill="none" class="fine" d="M42 44l16-6M41 52l18-6M42 60l16-6"/>
<ellipse fill="${C.bark}" cx="50" cy="84" rx="12" ry="4.5"/>`;
  META.spindle = { w: 0.3 };

  // a heart with iron bands round it, to keep it from bursting; o.n bands still on, o.crack
  S.ironheart = (o = {}) => {
    const n = o.n === undefined ? 3 : o.n, band = (y) => `M14 ${y}Q50 ${y + 6} 86 ${y}L86 ${y + 6}Q50 ${y + 12} 14 ${y + 6}Z`;
    return `<path fill="${C.red}" d="${heart(50, 58, 30)}"/>
<path fill="#6b5e68" d="${[34, 50, 66].slice(0, n).map(band).join('')}"/>
${o.crack ? `<path fill="#6b5e68" d="M70 20L92 10L94 15L72 25Z"/><path fill="none" d="M84 34l10-6M88 44l10 0M80 26l4-10"/>` : ''}`;
  };
  META.ironheart = { sky: true };

  // a golden carriage, side on
  S.coach = () => `
<path fill="${C.deepred}" d="M24 22H80L76 32H28Z"/><circle fill="${C.gold}" cx="52" cy="18" r="3"/>
<path fill="${C.gold}" d="M16 74C12 50 22 32 32 32H74C84 32 92 50 88 74Z"/>
<path fill="${C.cream}" d="M38 40H58V58H38Z"/><path fill="none" class="fine" d="M48 40V58M38 49H58M22 66H84"/>
<circle fill="${C.bark}" cx="28" cy="80" r="14"/><circle fill="${C.bark}" cx="78" cy="80" r="14"/>
<circle class="nol" fill="${C.tan}" cx="28" cy="80" r="10"/><circle class="nol" fill="${C.tan}" cx="78" cy="80" r="10"/>
<path fill="none" class="fine" d="M18 80H38M28 70V90M21 73L35 87M35 73L21 87M68 80H88M78 70V90M71 73L85 87M85 73L71 87"/>`;
  META.coach = { w: 1.3 };

  // a white horse with a feather on its head
  S.horse = () => {
    const c = C.white;
    return `
<path fill="${c}" d="M20 50C10 56 8 70 12 80C14 74 16 64 22 58Z"/>
<rect fill="${c}" x="22" y="62" width="7" height="32" rx="3"/><rect fill="${c}" x="32" y="64" width="7" height="30" rx="3"/>
<rect fill="${c}" x="62" y="64" width="7" height="30" rx="3"/><rect fill="${c}" x="71" y="62" width="7" height="32" rx="3"/>
<path class="nol" fill="${C.grey}" d="M22 90h7v4h-7zM32 90h7v4h-7zM62 90h7v4h-7zM71 90h7v4h-7z"/>
<path fill="${c}" d="M18 54C18 44 30 40 48 40C62 40 74 42 78 52C80 62 74 70 50 70C30 70 18 66 18 54Z"/>
<path fill="${c}" d="M68 50C68 38 72 26 78 20L90 30C86 36 82 46 80 56Z"/>
<path fill="${c}" d="M76 22C78 14 88 12 92 18L98 32C99 36 96 38 92 37L84 34Z"/>
<path fill="${C.grey}" d="M76 22C70 26 66 36 66 46L70 44C70 36 74 28 80 22Z"/>
<path fill="${C.white}" d="M84 14q-6-12 2-14q4 8-2 14z"/>
<circle class="solid" cx="88" cy="22" r="1.8"/><circle class="solid" cx="95.5" cy="33" r=".9"/>
<path fill="${C.gold}" d="M80 26L94 34L93 36L79 28Z"/>`;
  };
  META.horse = { w: 1.3 };

  // a thick hedge of thorny branches; o.roses covers it in flowers
  const HEDGE = [
    [[6, 96], [10, 74], [20, 54], [34, 36], [46, 24]],
    [[26, 96], [30, 76], [42, 58], [58, 44], [74, 34], [90, 30]],
    [[52, 96], [56, 78], [68, 62], [84, 52], [98, 52]],
    [[76, 96], [64, 82], [46, 72], [28, 66], [6, 68]],
    [[96, 94], [86, 80], [72, 74], [58, 76]]
  ];
  S.hedge = (o = {}) => {
    const r = rng(61);
    let wood = '', thorns = '', roses = '', k = 0;
    for (const b of HEDGE) {
      for (let i = 0; i < b.length - 1; i++) {
        const [x1, y1] = b[i], [x2, y2] = b[i + 1], a = Math.atan2(y2 - y1, x2 - x1);
        wood += stick(x1, y1, x2, y2, 3);
        for (const t of [0.3, 0.75]) {
          const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t, n = a + (k++ % 2 ? 1 : -1) * Math.PI / 2;
          thorns += `M${f(x - Math.cos(a) * 2.4)} ${f(y - Math.sin(a) * 2.4)}L${f(x + Math.cos(n) * 7 + Math.cos(a) * 2)} ${f(y + Math.sin(n) * 7 + Math.sin(a) * 2)}L${f(x + Math.cos(a) * 2.4)} ${f(y + Math.sin(a) * 2.4)}Z`;
        }
      }
    }
    if (o.roses) {
      for (let i = 0; i < 12; i++) {
        const x = 12 + r() * 76, y = 22 + r() * 62, s = 4.5 + r() * 2.5;
        roses += `<circle fill="${i % 3 ? C.rose : C.red}" cx="${f(x)}" cy="${f(y)}" r="${f(s)}"/><path fill="none" class="fine" d="M${f(x - s * 0.4)} ${f(y)}a${f(s * 0.4)} ${f(s * 0.4)} 0 1 1 ${f(s * 0.6)} ${f(s * 0.3)}"/>`;
      }
    }
    return `<path fill="${C.moss}" d="${cloud(50, 58, 48, 42, 13, 9)}"/>
<path class="nol" fill="${C.leaf}" opacity=".55" d="${cloud(42, 70, 30, 22, 9, 4)}"/>
<path fill="${C.bark}" d="${wood}${thorns}"/>${roses}`;
  };
  META.hedge = { w: 1.5 };

  /* ---------- backgrounds ---------- */
  const W = 300, H = 360;
  const sky = (c) => `<rect fill="${c}" x="-20" y="-20" width="${W + 40}" height="${H + 40}"/>`;
  const ground = (c, h, bump = 14) => `<path fill="${c}" d="M-20 ${h}Q75 ${h - bump} 150 ${h - 4}T320 ${h - 8}V380H-20Z"/>`;
  function tufts(r, h, n = 14) {
    let d = '';
    for (let i = 0; i < n; i++) {
      const x = 15 + r() * 270, y = h + 18 + r() * (H - h - 30);
      d += `M${f(x)} ${f(y)}l2-6M${f(x + 3)} ${f(y)}l1-7M${f(x + 6)} ${f(y)}l-1-5`;
    }
    return `<path fill="none" class="fine" d="${d}"/>`;
  }
  function twinkles(r, n, ymax) {
    let s = '';
    for (let i = 0; i < n; i++) s += `<path fill="${C.butter}" d="${star5(f(20 + r() * 260), f(20 + r() * ymax), f(3 + r() * 4))}"/>`;
    return s;
  }
  const clouds = (r) => `<path fill="#f7f2e6" d="${cloud(70 + r() * 30, 60 + r() * 20, 38, 14, 8, 3)}"/><path fill="#f7f2e6" d="${cloud(220 + r() * 30, 40 + r() * 30, 30, 11, 7, 5)}"/>`;
  function wavesBg(top, col, r, rows = 5) {
    let d = `M-20 ${top}`, ink = '';
    for (let x = -20; x < 320; x += 25) d += `Q${x + 12.5} ${top - 8} ${x + 25} ${top}`;
    d += 'V380H-20Z';
    for (let row = 0; row < rows; row++) {
      const y = top + 18 + row * 22;
      for (let x = (row % 2) * 20 + r() * 10; x < 300; x += 40 + r() * 20) ink += `M${f(x)} ${f(y)}q6-6 12 0`;
    }
    return { wash: `<path fill="${col}" d="${d}"/>`, ink: `<path fill="none" class="fine" d="${ink}"/>` };
  }

  const BG = {
    none: () => null,
    day: (r) => ({ wash: sky(C.sky) + clouds(r) + ground(C.green, 262), ink: tufts(r, 262) }),
    farm: (r) => {
      let posts = '', ink = '';
      for (let x = 12; x < 300; x += 36) { posts += `<rect fill="#c9ab7e" x="${x}" y="226" width="6" height="34"/>`; }
      ink = `<path fill="none" d="M0 236H300M0 250H300${[...Array(9)].map((_, i) => `M${12 + i * 36} 226v34M${18 + i * 36} 226v34`).join('')}"/>`;
      return { wash: sky(C.sky) + clouds(r) + `<path fill="#c9ab7e" d="M0 233h300v5H0zM0 247h300v5H0z"/>` + posts + ground(C.green, 262), ink: ink + tufts(r, 262) };
    },
    night: (r) => ({ wash: sky('#3d5280') + twinkles(r, 9, 170) + ground('#506c42', 266), ink: tufts(r, 266, 8) }),
    indoor: (r) => {
      let stripes = '', boards = '';
      for (let x = 0; x < 300; x += 28) stripes += `<rect class="nol" fill="#e3c992" x="${x}" y="-20" width="11" height="300"/>`;
      for (let y = 280; y < 370; y += 18) boards += `M-20 ${y}H320`;
      for (let i = 0; i < 9; i++) boards += `M${f(r() * 300)} ${280 + Math.floor(r() * 5) * 18}v18`;
      return {
        wash: sky('#ecd8a8') + stripes + `<rect fill="#b38a5e" x="-20" y="262" width="340" height="120"/><rect fill="#8f6640" x="-20" y="256" width="340" height="9"/>`,
        ink: `<path fill="none" d="M-20 256H320M-20 265H320"/><path fill="none" class="fine" d="${boards}"/>`
      };
    },
    sea: (r) => { const w = wavesBg(236, '#6f9db2', r); return { wash: sky('#c4d6df') + clouds(r) + w.wash, ink: w.ink }; },
    beach: (r) => {
      const w = wavesBg(213, '#87b0c1', r, 2);
      return { wash: sky('#edcaac') + w.wash + '<path fill="#ddc596" d="M-20 265Q104 242 320 259V380H-20Z"/>', ink: w.ink };
    },
    desert: () => ({
      wash: sky('#526484') + '<path fill="#dcbe8d" d="M-20 238Q86 202 170 232T320 220V380H-20Z"/><path fill="#c69a63" d="M70 260L132 163L189 258ZM169 245L211 186L256 246Z"/><path fill="#997653" d="M132 163L145 251L189 258ZM211 186L220 242L256 246Z"/>',
      ink: '<path fill="none" class="fine" d="M25 292q50-11 78-2m60 28q48-10 84-1"/>'
    }),
    nightsea: (r) => { const w = wavesBg(240, '#3d6581', r); return { wash: sky('#34476f') + twinkles(r, 11, 180) + w.wash, ink: w.ink }; },
    nightbeach: (r) => {
      const w = wavesBg(212, '#3d6581', r, 2), shore = 'M-20 266Q80 254 150 260T320 256';
      return { wash: sky('#34476f') + twinkles(r, 11, 160) + w.wash + `<path fill="#d9c08b" d="${shore}V380H-20Z"/>`, ink: w.ink + `<path fill="none" d="${shore}"/>` };
    },
    wood: (r) => {
      let back = '';
      for (let i = 0; i < 4; i++) {
        const x = 20 + i * 80 + r() * 30;
        back += `<rect class="nol" fill="#a3936f" x="${f(x)}" y="80" width="${f(10 + r() * 6)}" height="190"/><path class="nol" fill="#9db06d" d="${cloud(x + 6, 70 + r() * 30, 46, 34, 9, i + 2)}"/>`;
      }
      return { wash: sky('#dbe3c2') + back + ground('#7f9852', 262), ink: tufts(r, 262) };
    },
    garden: (r) => ({
      wash: sky(C.sky) + clouds(r) + `<path fill="#5f7f45" d="${cloud(60, 240, 90, 26, 10, 4)}"/><path fill="#5f7f45" d="${cloud(240, 236, 90, 28, 10, 6)}"/>` + ground(C.green, 262),
      ink: tufts(r, 262) + `<path fill="none" class="fine" d="M20 230q5-4 10 0M90 222q5-4 10 0M200 220q5-4 10 0M260 232q5-4 10 0"/>`
    }),
    hill: (r) => ({
      wash: sky(C.sky) + clouds(r) + `<path fill="#94b264" d="M-20 300C40 300 70 150 150 150S260 300 320 300V380H-20Z"/>` + ground(C.green, 290, 6),
      ink: tufts(r, 290, 8) + `<path fill="none" d="M-20 300C40 300 70 150 150 150S260 300 320 300"/>`
    }),
    // sunset: a warm sky, the first stars coming out
    dusk: (r) => ({
      wash: sky('#efc18f') + `<rect fill="#e79f7f" opacity=".6" x="-20" y="150" width="340" height="120"/>` + twinkles(r, 3, 80) +
        `<path fill="#f6d9b0" d="${cloud(70 + r() * 30, 80, 40, 11, 8, 3)}"/>` + ground('#7d8f4f', 262),
      ink: tufts(r, 262, 10)
    }),
    // a pond with reeds at each end
    pond: (r) => ({
      wash: sky(C.sky) + clouds(r) + ground(C.green, 262) + `<ellipse fill="#86aec4" cx="150" cy="314" rx="134" ry="40"/>` +
        `<path fill="#6f8f45" d="M14 306q10-34 22 0zM262 304q10-32 22 0z"/><ellipse fill="${C.brown}" cx="27" cy="262" rx="2.6" ry="7"/><ellipse fill="${C.brown}" cx="275" cy="266" rx="2.6" ry="7"/>`,
      ink: tufts(r, 262, 6) + `<ellipse fill="none" cx="150" cy="314" rx="134" ry="40"/>` +
        `<path fill="none" class="fine" d="M80 302q8-4 16 0M190 326q8-4 16 0M118 340q8-4 16 0M214 298q6-3 12 0"/>` +
        `<path fill="none" d="M22 304q-2-22 2-34M27 304q0-20 0-35M33 304q3-16 0-26M268 302q-3-20 3-30M275 302q0-18 0-29M281 302q3-14 6-22"/>`
    }),
    // a dark and stormy night: rain, and a flash of lightning
    storm: (r) => {
      let rain = '';
      for (let i = 0; i < 70; i++) { const x = r() * 320 - 10, y = r() * 360; rain += `M${f(x)} ${f(y)}l-5 14`; }
      return {
        wash: sky('#3a4566') + `<path fill="#556080" d="${cloud(90, 40, 110, 40, 10, 3)}"/><path fill="#4b5675" d="${cloud(240, 60, 90, 36, 9, 8)}"/>` +
          `<path fill="${C.butter}" d="M232 70L210 128H228L206 186L250 116H232L252 70Z"/>` + ground('#4f6243', 268),
        ink: `<path fill="none" class="fine" d="${rain}"/>`
      };
    },
    // a hall of stone blocks inside a castle, with a flagstone floor
    hall: (r) => {
      let stones = '';
      for (let y = 20, row = 0; y < 262; y += 22, row++) {
        stones += `M-20 ${y}H320`;
        for (let x = (row % 2) * 24 - 10; x < 310; x += 48) stones += `M${x} ${y}v22`;
      }
      let flags = 'M-20 300H320M-20 336H320';
      for (let x = 10; x < 300; x += 54) flags += `M${f(x + r() * 10)} 266v34M${f(x + 24 + r() * 10)} 300v36M${f(x + r() * 10)} 336v30`;
      return {
        wash: sky('#cbbfa6') + `<rect class="nol" fill="#b9ac91" x="-20" y="190" width="340" height="80"/><rect fill="#9c8e74" x="-20" y="262" width="340" height="120"/>`,
        ink: `<path fill="none" class="fine" d="${stones}"/><path fill="none" d="M-20 262H320"/><path fill="none" class="fine" d="${flags}"/>`
      };
    },
    // a river running towards us, for a bridge to cross
    river: (r) => {
      let grass = '';
      for (let i = 0; i < 10; i++) {
        const right = i % 2, y = 280 + r() * 80, x = right ? 220 + r() * 60 + (y - 280) * 0.5 : 20 + r() * 60 - (y - 280) * 0.25;
        grass += `M${f(x)} ${f(y)}l2-6M${f(x + 3)} ${f(y)}l1-7M${f(x + 6)} ${f(y)}l-1-5`;
      }
      const banks = 'M128 258C120 292 88 334 30 380M172 258C180 292 212 334 270 380';
      return {
        wash: sky(C.sky) + clouds(r) + `<path fill="#94b264" d="M-20 270C40 222 110 232 170 256L-20 280Z"/><path fill="#9db06d" d="M150 260C200 232 270 226 320 250V270Z"/>` +
          ground(C.green, 262, 6) + `<path fill="#86aec4" d="M128 258C120 292 88 334 30 380H270C212 334 180 292 172 258Z"/>`,
        ink: `<path fill="none" class="fine" d="${grass}"/><path fill="none" d="${banks}"/>` +
          `<path fill="none" class="fine" d="M142 282q6-3 12 0M148 304q8-4 16 0M118 334q8-4 16 0M172 348q8-4 16 0M132 368q8-4 16 0"/>`
      };
    }
  };

  /* ---------- composing a picture ---------- */
  let uid = 0;
  function place(item) {
    const [name, x, y, s = 1, o = {}] = item;
    const fn = S[name];
    if (!fn) return '';
    const body = fn(o), meta = META[name] || {};
    const tr = `translate(${x} ${y})${o.rot ? ` rotate(${o.rot})` : ''} scale(${o.flip ? -s : s} ${s}) translate(-50 -96)`;
    const shadow = meta.sky || o.noShadow ? '' :
      `<g class="ink-pass"><ellipse class="hatch" cx="${x}" cy="${f(y + s)}" rx="${f(30 * s * (meta.w || 1))}" ry="${f(4.5 * s)}"/></g>`;
    const g = `${shadow}<g transform="${tr}" style="--sw:${(1.7 / s).toFixed(2)}" class="sprite">` +
      `<g class="wash-pass" filter="url(#wash)">${body}</g><g class="ink-pass" filter="url(#ink)">${body}</g></g>`;
    return o.pop ? `<g class="pop">${g}</g>` : g;
  }

  function scene(spec = {}, cls = '') {
    if (spec.image) return `<img class="scene ${cls}" src="${spec.image}" alt="">`;
    const id = 'v' + (++uid);
    const seed = spec.seed || 7;
    const bgFn = BG[spec.bg || 'day'] || BG.day;
    const bg = bgFn(rng(seed * 31));
    const clip = vignette(150, 180, 140, 168, seed);
    const back = bg ? `<defs><clipPath id="${id}"><path d="${clip}"/></clipPath></defs>
<g class="bg wash-pass" filter="url(#washbg)"><g clip-path="url(#${id})">${bg.wash}</g></g>
<g class="bg ink-pass" style="--sw:1.4" filter="url(#ink)"><g clip-path="url(#${id})">${bg.ink}</g></g>` : '';
    return `<svg class="scene ${cls}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${back}${(spec.art || []).map(place).join('')}</svg>`;
  }

  global.ART = { scene, sprites: S, colors: C };
})(window);
