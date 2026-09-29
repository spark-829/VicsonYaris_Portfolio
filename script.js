/* =========================================================
   Data — figures from the Olist Power BI report
   (monthly revenue recomputed from the source CSVs: sum of item price by purchase month)
   ========================================================= */
const DATA = {
  revenue: [
    ['2017-01', 120313], ['2017-02', 247303], ['2017-03', 374344], ['2017-04', 359927],
    ['2017-05', 506071], ['2017-06', 433039], ['2017-07', 498031], ['2017-08', 573972],
    ['2017-09', 624402], ['2017-10', 664219], ['2017-11', 1010271], ['2017-12', 743914],
    ['2018-01', 950030], ['2018-02', 844179], ['2018-03', 983213], ['2018-04', 996648],
    ['2018-05', 996518], ['2018-06', 865124], ['2018-07', 895507], ['2018-08', 854686]
  ],
  ltv: [
    { label: 'Repeat', value: 259.87, cls: 'm-s1' },
    { label: 'One-time', value: 137.63, cls: 'm-mute' }
  ],
  deciles: [5.6, 2.1, 1.5, 1.2, 0.9, 0.7, 0.6, 0.4, 0.3, 0.2].map((v, i) => ({
    label: 'D' + (i + 1), value: v, cls: i === 0 ? 'm-s1' : 'm-mute'
  })),
  reviews: [
    { label: 'Early', value: 4.30, cls: 'm-s1' },
    { label: 'On|time', value: 4.13, cls: 'm-s1' },
    { label: 'Late|1–3 d', value: 3.76, cls: 'm-s1' },
    { label: 'Late|4–7 d', value: 2.32, cls: 'm-bad' },
    { label: 'Late|8+ d', value: 1.73, cls: 'm-bad' },
    { label: 'Not|delivered', value: 1.75, cls: 'm-bad' }
  ],
  days: [
    { label: 'North', a: 3.3, b: 19.2 },
    { label: 'Northeast', a: 3.4, b: 16.6 },
    { label: 'Central-West', a: 3.2, b: 11.9 },
    { label: 'South', a: 3.2, b: 10.8 },
    { label: 'Southeast', a: 3.2, b: 7.5 }
  ],
  freight: [
    ['Under R$ 25', 78.1], ['R$ 25–50', 41.6], ['R$ 50–75', 29.2], ['R$ 75–100', 22.6], ['R$ 100–150', 19.1],
    ['R$ 150–200', 15.1], ['R$ 200–300', 13.2], ['R$ 300–500', 10.3], ['R$ 500+', 6.2]
  ].map(([label, value]) => ({ label, value, cls: value > 20 ? 'm-bad' : 'm-s1' })),
  repeat: [
    ['bed_bath_table', 4.32], ['furniture_decor', 4.20], ['sports_leisure', 3.46], ['housewares', 3.20],
    ['computers_accessories', 3.03], ['health_beauty', 2.78], ['watches_gifts', 2.54], ['cool_stuff', 1.52]
  ].map(([label, value]) => ({ label, value, cls: value > 2.85 ? 'm-s1' : 'm-mute' }))
};

/* =========================================================
   Tiny SVG chart kit
   ========================================================= */
const NS = 'http://www.w3.org/2000/svg';
const tip = document.getElementById('tooltip');

function el(name, attrs = {}, parent) {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
function text(parent, x, y, str, cls, anchor = 'start', extra = {}) {
  const t = el('text', { x, y, class: cls, 'text-anchor': anchor, ...extra }, parent);
  t.textContent = str;
  return t;
}
function svgFor(host, h) {
  host.innerHTML = '';
  const w = Math.max(host.clientWidth, 260);
  const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: 'img' }, host);
  return { svg, w, h };
}
function niceMax(v) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}
function showTip(evt, html) {
  tip.innerHTML = html;
  tip.hidden = false;
  const pad = 14, r = tip.getBoundingClientRect();
  let x = evt.clientX + pad, y = evt.clientY + pad;
  if (x + r.width > window.innerWidth - 8) x = evt.clientX - r.width - pad;
  if (y + r.height > window.innerHeight - 8) y = evt.clientY - r.height - pad;
  tip.style.left = x + 'px';
  tip.style.top = y + 'px';
}
function hideTip() { tip.hidden = true; }

/* Path for a bar with 4px rounded data-end, square at baseline */
function barPath(x, y, w, h, dir) {
  const r = Math.min(4, dir === 'up' ? w / 2 : h / 2, dir === 'up' ? h : w);
  if (dir === 'up') {
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }
  return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
}

/* Horizontal bars */
function hbar(host, rows, { fmt, max, ref, labelW = 90, tipFmt } = {}) {
  const band = 30, top = 4, bottom = ref ? 22 : 6;
  const { svg, w } = svgFor(host, top + rows.length * band + bottom);
  const valW = 64, plotW = w - labelW - valW;
  const m = max || niceMax(Math.max(...rows.map(r => r.value)));
  const sx = v => labelW + (v / m) * plotW;
  el('line', { x1: labelW, x2: labelW, y1: top, y2: top + rows.length * band, class: 'base-line' }, svg);
  rows.forEach((r, i) => {
    const y = top + i * band, bh = Math.min(20, band - 8), by = y + (band - bh) / 2;
    text(svg, labelW - 8, y + band / 2 + 4, r.label, 'lbl-2', 'end');
    const bar = el('path', { d: barPath(labelW, by, Math.max(sx(r.value) - labelW, 1), bh, 'right'), class: r.cls }, svg);
    text(svg, sx(r.value) + 6, y + band / 2 + 4, fmt(r.value), 'lbl');
    const hit = el('rect', { x: 0, y, width: w, height: band, class: 'hit' }, svg);
    hit.addEventListener('pointermove', e => { bar.classList.add('bar-hover'); showTip(e, tipFmt ? tipFmt(r) : `<b>${r.label}</b><br>${fmt(r.value)}`); });
    hit.addEventListener('pointerleave', () => { bar.classList.remove('bar-hover'); hideTip(); });
  });
  if (ref) {
    const x = sx(ref.value), y2 = top + rows.length * band;
    el('line', { x1: x, x2: x, y1: top, y2, class: 'ref-line' }, svg);
    text(svg, x, y2 + 15, ref.label, 'tick', 'middle');
  }
}

/* Vertical columns */
function vbar(host, rows, { fmt, height = 240, yFmt } = {}) {
  const { svg, w, h } = svgFor(host, height);
  const L = 34, R = 8, T = 18, B = 44;
  const pw = w - L - R, ph = h - T - B;
  const m = niceMax(Math.max(...rows.map(r => r.value)));
  const sy = v => T + ph - (v / m) * ph;
  for (let k = 0; k <= 4; k++) {
    const v = (m / 4) * k, y = sy(v);
    el('line', { x1: L, x2: w - R, y1: y, y2: y, class: k ? 'grid-line' : 'base-line' }, svg);
    text(svg, L - 6, y + 4, yFmt(v), 'tick', 'end');
  }
  const band = pw / rows.length, bw = Math.min(24, band - 6);
  rows.forEach((r, i) => {
    const cx = L + band * i + band / 2, y = sy(r.value);
    const bar = el('path', { d: barPath(cx - bw / 2, y, bw, T + ph - y, 'up'), class: r.cls }, svg);
    text(svg, cx, y - 5, fmt(r.value), 'lbl', 'middle');
    r.label.split('|').forEach((ln, j) => text(svg, cx, h - B + 16 + j * 13, ln, 'tick', 'middle'));
    const hit = el('rect', { x: cx - band / 2, y: T, width: band, height: ph + B, class: 'hit' }, svg);
    hit.addEventListener('pointermove', e => { bar.classList.add('bar-hover'); showTip(e, `<b>${r.label.replace('|', ' ')}</b><br>${fmt(r.value)}`); });
    hit.addEventListener('pointerleave', () => { bar.classList.remove('bar-hover'); hideTip(); });
  });
}

/* Stacked horizontal bars (two parts) */
function stacked(host, rows, { names, labelW = 92 }) {
  const band = 34, top = 4, bottom = 22;
  const { svg, w } = svgFor(host, top + rows.length * band + bottom);
  const valW = 44, plotW = w - labelW - valW;
  const m = niceMax(Math.max(...rows.map(r => r.a + r.b)));
  const sx = v => (v / m) * plotW;
  for (let k = 0; k <= 5; k++) {
    const x = labelW + sx((m / 5) * k);
    el('line', { x1: x, x2: x, y1: top, y2: top + rows.length * band, class: k ? 'grid-line' : 'base-line' }, svg);
    text(svg, x, top + rows.length * band + 15, String((m / 5) * k), 'tick', 'middle');
  }
  rows.forEach((r, i) => {
    const y = top + i * band, bh = 20, by = y + (band - bh) / 2;
    text(svg, labelW - 8, y + band / 2 + 4, r.label, 'lbl-2', 'end');
    const wa = sx(r.a), wb = sx(r.b);
    const g = el('g', {}, svg);
    el('rect', { x: labelW, y: by, width: wa, height: bh, class: 'm-s1' }, g);
    el('path', { d: barPath(labelW + wa + 2, by, wb - 2, bh, 'right'), class: 'm-s2' }, g);
    text(svg, labelW + wa + wb + 6, y + band / 2 + 4, (r.a + r.b).toFixed(1) + 'd', 'lbl');
    const hit = el('rect', { x: 0, y, width: w, height: band, class: 'hit' }, svg);
    hit.addEventListener('pointermove', e => {
      g.classList.add('bar-hover');
      showTip(e, `<b>${r.label}</b><br>${names[0]}: ${r.a.toFixed(1)} days<br>${names[1]}: ${r.b.toFixed(1)} days`);
    });
    hit.addEventListener('pointerleave', () => { g.classList.remove('bar-hover'); hideTip(); });
  });
  host.insertAdjacentHTML('beforeend',
    `<div class="legend"><span><i class="m-s1-bg"></i>${names[0]}</span><span><i class="m-s2-bg"></i>${names[1]}</span></div>`);
}

/* Line: revenue + 3-month moving average, crosshair tooltip */
function revenueLine(host, series) {
  const { svg, w, h } = svgFor(host, 270);
  const L = 50, R = 12, T = 12, B = 28;
  const pw = w - L - R, ph = h - T - B;
  const vals = series.map(d => d[1]);
  const avg = vals.map((_, i) => i < 2 ? null : (vals[i] + vals[i - 1] + vals[i - 2]) / 3);
  const m = 1200000;
  const sx = i => L + (i / (series.length - 1)) * pw;
  const sy = v => T + ph - (v / m) * ph;
  const money = v => 'R$ ' + (v / 1e6).toFixed(2) + 'M';
  for (let k = 0; k <= 4; k++) {
    const v = (m / 4) * k, y = sy(v);
    el('line', { x1: L, x2: w - R, y1: y, y2: y, class: k ? 'grid-line' : 'base-line' }, svg);
    text(svg, L - 6, y + 4, 'R$ ' + (v / 1e6).toFixed(1) + 'M', 'tick', 'end');
  }
  const monthName = s => new Date(s + '-01T00:00:00').toLocaleString('en', { month: 'short' });
  series.forEach((d, i) => {
    const mo = d[0].slice(5);
    if (mo === '01' || mo === '07' || i === series.length - 1) {
      text(svg, sx(i), h - 8, monthName(d[0]) + (mo === '01' ? ' ' + d[0].slice(0, 4) : ''), 'tick', 'middle');
    }
  });
  // plateau shading from Mar 2018
  const pi = series.findIndex(d => d[0] === '2018-03');
  el('rect', { x: sx(pi), y: T, width: sx(series.length - 1) - sx(pi), height: ph, fill: 'var(--surface-2)' }, svg);
  text(svg, (sx(pi) + sx(series.length - 1)) / 2, T + 14, 'Plateau', 'tick', 'middle');

  const pts = vals.map((v, i) => `${sx(i)},${sy(v)}`);
  el('path', { d: `M${sx(0)},${sy(0)}L${pts.join('L')}L${sx(vals.length - 1)},${sy(0)}Z`, class: 'area-s1' }, svg);
  el('path', { d: 'M' + pts.join('L'), class: 'ln-s1' }, svg);
  el('path', { d: 'M' + avg.map((v, i) => v == null ? null : `${sx(i)},${sy(v)}`).filter(Boolean).join('L'), class: 'ln-s2' }, svg);

  const last = vals.length - 1;
  el('circle', { cx: sx(last), cy: sy(vals[last]), r: 4, class: 'm-s1 hover-dot' }, svg);

  const cross = el('line', { y1: T, y2: T + ph, class: 'crosshair', visibility: 'hidden' }, svg);
  const d1 = el('circle', { r: 4.5, class: 'm-s1 hover-dot', visibility: 'hidden' }, svg);
  const d2 = el('circle', { r: 4.5, class: 'm-s2 hover-dot', visibility: 'hidden' }, svg);
  const hit = el('rect', { x: L, y: T, width: pw, height: ph, class: 'hit' }, svg);
  hit.addEventListener('pointermove', e => {
    const box = svg.getBoundingClientRect();
    const x = (e.clientX - box.left) * (w / box.width);
    const i = Math.max(0, Math.min(last, Math.round(((x - L) / pw) * last)));
    cross.setAttribute('x1', sx(i)); cross.setAttribute('x2', sx(i));
    d1.setAttribute('cx', sx(i)); d1.setAttribute('cy', sy(vals[i]));
    [cross, d1].forEach(n => n.setAttribute('visibility', 'visible'));
    if (avg[i] != null) { d2.setAttribute('cx', sx(i)); d2.setAttribute('cy', sy(avg[i])); d2.setAttribute('visibility', 'visible'); }
    else d2.setAttribute('visibility', 'hidden');
    const label = new Date(series[i][0] + '-01T00:00:00').toLocaleString('en', { month: 'long', year: 'numeric' });
    showTip(e, `<b>${label}</b><br>Revenue: ${money(vals[i])}` + (avg[i] != null ? `<br>3M avg: ${money(avg[i])}` : ''));
  });
  hit.addEventListener('pointerleave', () => {
    [cross, d1, d2].forEach(n => n.setAttribute('visibility', 'hidden'));
    hideTip();
  });
  host.insertAdjacentHTML('beforeend',
    '<div class="legend"><span><i class="sw-line m-s1-bg"></i>Monthly revenue</span><span><i class="sw-line m-s2-bg"></i>3-month moving average</span></div>');
}

/* =========================================================
   Render
   ========================================================= */
const pct = v => v.toFixed(1) + '%';
const CHARTS = {
  overview: () => revenueLine(document.getElementById('chart-revenue'), DATA.revenue),
  customers: () => {
    hbar(document.getElementById('chart-ltv'), DATA.ltv, { fmt: v => 'R$ ' + v.toFixed(2), labelW: 70, max: 300 });
    hbar(document.getElementById('chart-deciles'), DATA.deciles, {
      fmt: v => 'R$ ' + v.toFixed(1) + 'M', labelW: 34,
      tipFmt: r => `<b>Decile ${r.label.slice(1)}</b><br>R$ ${r.value.toFixed(1)}M · ${Math.round(r.value / 13.59 * 100)}% of revenue`
    });
  },
  delivery: () => {
    vbar(document.getElementById('chart-reviews'), DATA.reviews, { fmt: v => v.toFixed(2), yFmt: v => v.toFixed(0) });
    stacked(document.getElementById('chart-days'), DATA.days, { names: ['Seller handling', 'Carrier transit'] });
  },
  products: () => {
    hbar(document.getElementById('chart-freight'), DATA.freight, {
      fmt: v => v.toFixed(1) + '%', labelW: 92, max: 80, ref: { value: 20, label: '20% break-even' }
    });
    hbar(document.getElementById('chart-repeat'), DATA.repeat, {
      fmt: v => v.toFixed(2) + '%', labelW: 150, max: 5, ref: { value: 2.85, label: '2.85% site avg' }
    });
  }
};

let active = 'overview';
function renderActive() { CHARTS[active](); }

/* Tabs (WAI-ARIA pattern with arrow-key support) */
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab, focus) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  if (focus) tab.focus();
  active = tab.id.replace('tab-', '');
  hideTip();
  renderActive();
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', e => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (d) { e.preventDefault(); selectTab(tabs[(i + d + tabs.length) % tabs.length], true); }
  });
});

let rt;
let lastW = window.innerWidth;
window.addEventListener('resize', () => {
  if (window.innerWidth === lastW) return;
  lastW = window.innerWidth;
  clearTimeout(rt); rt = setTimeout(renderActive, 120);
});
renderActive();

/* Screenshots: hide the slot until a PNG exists in assets/dashboard/ */
document.querySelectorAll('.shot img').forEach(img => {
  const fig = img.closest('figure');
  const fail = () => { fig.hidden = true; };
  if (img.complete && img.naturalWidth === 0) fail();
  img.addEventListener('error', fail);
});

/* =========================================================
   Chrome: theme, mobile menu, active nav link
   ========================================================= */
const root = document.documentElement;
document.getElementById('theme-toggle').addEventListener('click', () => {
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
});

const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
navLinks.addEventListener('click', e => {
  if (e.target.closest('a')) { navLinks.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }
});

const links = [...navLinks.querySelectorAll('a')];
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(s => io.observe(s));

document.getElementById('year').textContent = new Date().getFullYear();
