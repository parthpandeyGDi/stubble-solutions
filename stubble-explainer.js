/* "What is stubble?" animated explainer – no external assets */
(function () {
  var root = document.getElementById('se-player');
  if (!root) return;
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 960, H = 440, GROUND = 340;
  var SCENES = [
    { t: 0, name: 'Harvest', cap: 'Autumn in Punjab: the paddy crop is ready for harvest.' },
    { t: 5, name: 'Combine', cap: 'A combine harvester cuts the crop and keeps only the grain.' },
    { t: 12, name: 'Stubble', cap: 'Two things are left behind: stubble, the short stalks still rooted in the soil, and paddy straw, the loose cut straw spread across the field.' },
    { t: 18, name: 'Deadline', cap: 'Wheat has to be sown within a few weeks, so the field must be cleared fast.' },
    { t: 24, name: 'Choice', cap: 'Burning clears the stubble and straw in hours but fills the air with smoke. Managing them keeps the residue as mulch or sends the straw to industry.' }
  ];
  var T = 31;

  var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'se-stage', role: 'img', 'aria-label': 'Animated explainer: what is paddy stubble' });
  root.insertBefore(svg, root.firstChild);
  var defs = el('defs', {}, svg);
  var sky = el('linearGradient', { id: 'se-sky', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': '#bcd9ea' }, sky); el('stop', { offset: .75, 'stop-color': '#f7e9cf' }, sky);
  var soil = el('linearGradient', { id: 'se-soil', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': '#8d6b3c' }, soil); el('stop', { offset: 1, 'stop-color': '#5f4524' }, soil);
  var haze = el('linearGradient', { id: 'se-haze', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': '#8f9599', 'stop-opacity': .0 }, haze); el('stop', { offset: 1, 'stop-color': '#8f9599', 'stop-opacity': .55 }, haze);
  var clip = el('clipPath', { id: 'se-left' }, defs); el('rect', { x: 0, y: 0, width: W / 2, height: H }, clip);
  var clip2 = el('clipPath', { id: 'se-right' }, defs); el('rect', { x: W / 2, y: 0, width: W / 2, height: H }, clip2);

  el('rect', { width: W, height: H, fill: 'url(#se-sky)' }, svg);
  var sun = el('circle', { cx: 790, cy: 120, r: 38, fill: '#f6c65b', opacity: .9 }, svg);
  var hills = el('path', { d: 'M0 300 Q120 255 250 290 T520 280 T780 285 T960 270 V340 H0Z', fill: '#c9d6b0', opacity: .7 }, svg);

  /* ---------- field (zoomable) ---------- */
  var field = el('g', {}, svg);
  el('rect', { x: -200, y: GROUND, width: W + 400, height: H - GROUND + 40, fill: 'url(#se-soil)' }, field);
  el('rect', { x: -200, y: GROUND, width: W + 400, height: 6, fill: '#4f391d', opacity: .5 }, field);
  var strawLayer = el('g', {}, field);
  var stalks = [];
  var N = 46;
  for (var i = 0; i < N; i++) {
    var x = 14 + i * (W - 28) / (N - 1) + (i % 2 ? 4 : -4);
    var h = 120 + ((i * 37) % 26);
    var g = el('g', {}, field);
    var stem = el('path', { stroke: '#b98c2c', 'stroke-width': 3.2, fill: 'none', 'stroke-linecap': 'round' }, g);
    var leaf = el('path', { stroke: '#a7a34b', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, g);
    var head = el('ellipse', { rx: 5, ry: 15, fill: '#e3b545' }, g);
    stalks.push({ x: x, h: h, g: g, stem: stem, leaf: leaf, head: head, phase: i * .7, cut: false, straw: null });
  }

  /* ---------- combine harvester ---------- */
  var combine = el('g', {}, field);
  el('rect', { x: 0, y: 214, width: 170, height: 84, rx: 10, fill: '#c63f25' }, combine);
  el('rect', { x: 70, y: 160, width: 74, height: 58, rx: 6, fill: '#d85a3e' }, combine);
  el('rect', { x: 80, y: 170, width: 54, height: 34, rx: 4, fill: '#cde7f2' }, combine);
  el('rect', { x: 8, y: 186, width: 50, height: 30, rx: 4, fill: '#a83420' }, combine);
  el('path', { d: 'M20 186 L-20 168 L-26 176 L14 196Z', fill: '#8d2b19' }, combine); // spout
  el('rect', { x: 168, y: 250, width: 70, height: 34, fill: '#6f7c82' }, combine); // header
  var reel = el('g', { transform: 'translate(214 252)' }, combine);
  el('circle', { r: 26, fill: 'none', stroke: '#e2e6e8', 'stroke-width': 3 }, reel);
  for (var r = 0; r < 6; r++) el('line', { x1: 0, y1: 0, x2: 0, y2: -26, stroke: '#e2e6e8', 'stroke-width': 3, transform: 'rotate(' + r * 60 + ')' }, reel);
  var w1 = el('g', { transform: 'translate(40 304)' }, combine);
  el('circle', { r: 34, fill: '#222' }, w1); el('circle', { r: 13, fill: '#8a8a8a' }, w1);
  for (r = 0; r < 4; r++) el('rect', { x: -3, y: -33, width: 6, height: 12, fill: '#444', transform: 'rotate(' + r * 90 + ')' }, w1);
  var w2 = el('g', { transform: 'translate(136 312)' }, combine);
  el('circle', { r: 26, fill: '#222' }, w2); el('circle', { r: 10, fill: '#8a8a8a' }, w2);
  var dust = el('g', {}, field);

  /* ---------- zoom labels (not scaled, anchors follow the zoom) ---------- */
  var labels = el('g', { opacity: 0 }, svg);
  function tag(text, sub, fill, tx, ty) {
    var g = el('g', {}, labels);
    var line = el('path', { stroke: '#16314a', 'stroke-width': 2, 'stroke-dasharray': '5 5', fill: 'none' }, g);
    var ring = el('circle', { r: 9, fill: 'none', stroke: fill, 'stroke-width': 3 }, g);
    var dot = el('circle', { r: 4, fill: fill }, g);
    var w = Math.max(text.length * 10.2, sub.length * 7.4) + 36;
    el('rect', { x: tx - w / 2, y: ty - 26, width: w, height: 54, rx: 8, fill: fill }, g);
    var t1 = el('text', { x: tx, y: ty - 2, 'text-anchor': 'middle', class: 'se-t' }, g); t1.textContent = text;
    var t2 = el('text', { x: tx, y: ty + 18, 'text-anchor': 'middle', class: 'se-sub' }, g); t2.textContent = sub;
    return { g: g, line: line, ring: ring, dot: dot, tx: tx, ty: ty };
  }
  var tagA = tag('Stubble', 'stalks still rooted in the soil', '#16314a', 250, 150);
  var tagB = tag('Paddy straw', 'loose straw cut by the combine', '#cb3200', 690, 150);
  function placeTag(tg, x, y, s, z) {
    var X = 480 + (x - 480) * s, Y = (GROUND - GROUND * s + z * 60) + y * s;
    tg.ring.setAttribute('cx', X); tg.ring.setAttribute('cy', Y);
    tg.dot.setAttribute('cx', X); tg.dot.setAttribute('cy', Y);
    tg.line.setAttribute('d', 'M' + tg.tx + ' ' + (tg.ty + 28) + ' L' + X + ' ' + (Y - 10));
  }

  /* ---------- deadline overlay ---------- */
  var dl = el('g', { opacity: 0 }, svg);
  el('rect', { x: 110, y: 90, width: 740, height: 230, rx: 14, fill: '#fff', opacity: .96 }, dl);
  var dlt = el('text', { x: 480, y: 140, 'text-anchor': 'middle', class: 'se-h' }, dl); dlt.textContent = 'The clock is ticking';
  el('rect', { x: 160, y: 190, width: 640, height: 18, rx: 9, fill: '#eef1f3' }, dl);
  var dlFill = el('rect', { x: 160, y: 190, width: 0, height: 18, rx: 9, fill: '#cb3200' }, dl);
  var a = el('text', { x: 160, y: 245, class: 'se-s' }, dl); a.textContent = 'Paddy harvest';
  var b = el('text', { x: 800, y: 245, 'text-anchor': 'end', class: 'se-s' }, dl); b.textContent = 'Wheat sowing';
  var mid = el('text', { x: 480, y: 290, 'text-anchor': 'middle', class: 'se-r' }, dl); mid.textContent = 'Only a few weeks to clear the field';
  var clock = el('g', { transform: 'translate(480 245)' }, dl);
  el('circle', { r: 22, fill: '#fff', stroke: '#16314a', 'stroke-width': 3 }, clock);
  var hand = el('line', { x1: 0, y1: 0, x2: 0, y2: -15, stroke: '#cb3200', 'stroke-width': 3, 'stroke-linecap': 'round' }, clock);

  /* ---------- choice (split) ---------- */
  var choice = el('g', { opacity: 0 }, svg);
  var L = el('g', { 'clip-path': 'url(#se-left)' }, choice);
  el('rect', { x: 0, y: 0, width: W / 2, height: H, fill: '#d9d4c9' }, L);
  el('rect', { x: 0, y: GROUND, width: W / 2, height: H - GROUND, fill: '#3e2d18' }, L);
  var hazeR = el('rect', { x: 0, y: 0, width: W / 2, height: GROUND, fill: 'url(#se-haze)', opacity: 0 }, L);
  var flames = [], smoke = [];
  for (i = 0; i < 9; i++) flames.push(el('path', { fill: i % 2 ? '#f08a2c' : '#e2531f', opacity: .95 }, L));
  for (i = 0; i < 16; i++) smoke.push({ c: el('circle', { fill: '#7f878b', opacity: 0 }, L), seed: i * 1.37 });
  var R = el('g', { 'clip-path': 'url(#se-right)' }, choice);
  el('rect', { x: W / 2, y: 0, width: W / 2, height: GROUND, fill: '#cfe5ee' }, R);
  el('rect', { x: W / 2, y: GROUND, width: W / 2, height: H - GROUND, fill: '#6e5230' }, R);
  for (i = 0; i < 26; i++) el('path', { d: 'M' + (W / 2 + 12 + i * 18) + ' ' + (GROUND + 2) + ' l16 -5', stroke: '#d8b35a', 'stroke-width': 3, 'stroke-linecap': 'round' }, R);
  var sprouts = [];
  for (i = 0; i < 22; i++) sprouts.push(el('path', { stroke: '#4f9a3a', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, R));
  el('line', { x1: W / 2, y1: 0, x2: W / 2, y2: H, stroke: '#fff', 'stroke-width': 4 }, choice);
  function badge(x, text, fill) {
    var w = text.length * 9 + 30;
    el('rect', { x: x - w / 2, y: 40, width: w, height: 38, rx: 19, fill: fill }, choice);
    var t = el('text', { x: x, y: 65, 'text-anchor': 'middle', class: 'se-t' }, choice); t.textContent = text;
  }
  badge(W / 4, 'Burn: fast, costly for everyone', '#cb3200');
  badge(3 * W / 4, 'Manage: straw becomes a resource', '#2f7d6d');

  /* ---------- UI ---------- */
  var cap = root.querySelector('.se-caption'), btn = root.querySelector('.se-play');
  var track = root.querySelector('.se-track'), fill = root.querySelector('.se-fill'), marks = root.querySelector('.se-marks');
  SCENES.forEach(function (s, k) {
    var m = document.createElement('button'); m.type = 'button'; m.textContent = s.name;
    m.style.left = (s.t / T * 100) + '%';
    m.onclick = function () { seek(s.t + .01); };
    marks.appendChild(m);
  });

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(v) { v = clamp(v, 0, 1); return v < .5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2; }
  function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }

  var t = 0, playing = !reduce, last = null, started = false;
  function render(time) {
    /* sun */
    sun.setAttribute('cy', 150 - ease(seg(time, 0, 5)) * 40);
    /* combine position */
    var cx = -260 + ease(seg(time, 5, 11.5)) * 1300;
    combine.setAttribute('transform', 'translate(' + cx + ' 0)');
    var spin = time * 260;
    reel.setAttribute('transform', 'translate(214 252) rotate(' + spin + ')');
    w1.setAttribute('transform', 'translate(40 304) rotate(' + spin + ')');
    w2.setAttribute('transform', 'translate(136 312) rotate(' + spin * 1.3 + ')');
    var cutX = cx + 236;
    /* stalks */
    stalks.forEach(function (s, k) {
      var cut = time >= 5 && s.x < cutX;
      var sway = Math.sin(time * 1.6 + s.phase) * (cut ? 0 : 5);
      var hh = cut ? 30 : s.h;
      var top = GROUND - hh;
      s.stem.setAttribute('d', 'M' + s.x + ' ' + GROUND + ' Q' + (s.x + sway * .3) + ' ' + (GROUND - hh / 2) + ' ' + (s.x + sway) + ' ' + top);
      s.leaf.setAttribute('d', cut ? '' : 'M' + s.x + ' ' + (GROUND - hh * .45) + ' q' + (14 + sway) + ' -18 ' + (28 + sway) + ' -16');
      s.head.setAttribute('cx', s.x + sway + 4); s.head.setAttribute('cy', top - 4);
      s.head.setAttribute('transform', 'rotate(' + (18 + sway) + ' ' + (s.x + sway + 4) + ' ' + (top - 4) + ')');
      s.head.setAttribute('opacity', cut ? 0 : 1);
      if (cut && !s.straw) {
        s.straw = el('path', { stroke: '#e6c46c', 'stroke-width': 3.4, 'stroke-linecap': 'round', d: 'M' + (s.x + 3) + ' ' + (GROUND - 2 - (k % 2) * 2) + ' l' + (14 + (k % 3) * 2) + ' ' + (-(1 + k % 2)) }, strawLayer);
      }
      if (!cut && s.straw) { strawLayer.removeChild(s.straw); s.straw = null; }
    });
    /* dust/straw spray behind combine */
    while (dust.firstChild) dust.removeChild(dust.firstChild);
    if (time > 5 && time < 11.5) {
      for (var p = 0; p < 10; p++) {
        var ph = (time * 3 + p * .37) % 1;
        el('line', { x1: cx - 20 - ph * 70, y1: 180 + ph * 150 + (p % 3) * 6, x2: cx - 10 - ph * 70, y2: 176 + ph * 150 + (p % 3) * 6, stroke: '#e1c06a', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 1 - ph }, dust);
      }
    }
    /* zoom on stubble */
    var z = ease(seg(time, 12, 13.5)) * (1 - ease(seg(time, 17.2, 18)));
    var s = 1 + z * .9;
    field.setAttribute('transform', 'translate(' + (480 - 480 * s) + ' ' + (GROUND - GROUND * s + z * 60) + ') scale(' + s + ')');
    hills.setAttribute('opacity', .7 * (1 - z));
    labels.setAttribute('opacity', ease(seg(time, 13.4, 14.2)) * (1 - seg(time, 17.2, 17.8)));
    var sa = stalks[18], sb = stalks[26];
    placeTag(tagA, sa.x, GROUND - 18, s, z);
    placeTag(tagB, sb.x + 11, GROUND - 4, s, z);
    tagA.g.setAttribute('opacity', ease(seg(time, 13.4, 14)));
    tagB.g.setAttribute('opacity', ease(seg(time, 14.6, 15.2)));
    /* deadline */
    var dlo = ease(seg(time, 18, 18.7)) * (1 - ease(seg(time, 23.3, 24)));
    dl.setAttribute('opacity', dlo);
    dl.setAttribute('transform', 'translate(0 ' + (1 - dlo) * 20 + ')');
    var prog = ease(seg(time, 18.6, 22.5));
    dlFill.setAttribute('width', 640 * prog);
    hand.setAttribute('transform', 'rotate(' + prog * 720 + ')');
    /* choice */
    var co = ease(seg(time, 24, 24.8));
    choice.setAttribute('opacity', co);
    var ct = time - 24;
    flames.forEach(function (f, k) {
      var fx = 40 + k * 48, fh = 40 + 26 * Math.abs(Math.sin(time * 5 + k)) + (k % 3) * 8;
      f.setAttribute('d', 'M' + (fx - 18) + ' ' + GROUND + ' Q' + (fx - 12) + ' ' + (GROUND - fh * .6) + ' ' + (fx + Math.sin(time * 6 + k) * 6) + ' ' + (GROUND - fh) + ' Q' + (fx + 12) + ' ' + (GROUND - fh * .6) + ' ' + (fx + 18) + ' ' + GROUND + 'Z');
    });
    smoke.forEach(function (sm) {
      var ph = ((ct * .35 + sm.seed) % 1 + 1) % 1;
      sm.c.setAttribute('cx', 40 + (sm.seed * 97) % 400 + ph * 60);
      sm.c.setAttribute('cy', GROUND - 40 - ph * 260);
      sm.c.setAttribute('r', 14 + ph * 34);
      sm.c.setAttribute('opacity', ct > 0 ? .5 * (1 - ph) : 0);
    });
    hazeR.setAttribute('opacity', clamp(ct / 4, 0, 1));
    sprouts.forEach(function (sp, k) {
      var x = W / 2 + 22 + k * 20, gh = 10 + 26 * ease(seg(time, 25 + (k % 5) * .25, 28 + (k % 5) * .25));
      sp.setAttribute('d', 'M' + x + ' ' + GROUND + ' q-3 ' + (-gh / 2) + ' 2 ' + (-gh) + ' M' + x + ' ' + (GROUND - gh * .4) + ' q8 -6 12 -4');
    });
    /* ui */
    var idx = 0; SCENES.forEach(function (sc, k) { if (time >= sc.t) idx = k; });
    if (cap.dataset.i !== String(idx)) { cap.dataset.i = idx; cap.classList.remove('in'); void cap.offsetWidth; cap.textContent = SCENES[idx].cap; cap.classList.add('in'); }
    [].forEach.call(marks.children, function (m, k) { m.classList.toggle('on', k === idx); });
    fill.style.width = (time / T * 100) + '%';
  }
  function loop(now) {
    if (last === null) last = now;
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    if (playing) { t += dt; if (t >= T) t = 0; render(t); }
    requestAnimationFrame(loop);
  }
  function seek(v) { t = clamp(v, 0, T - .01); render(t); }
  function setPlay(v) { playing = v; btn.textContent = v ? '❚❚' : '▶'; btn.setAttribute('aria-label', v ? 'Pause' : 'Play'); }
  btn.onclick = function () { setPlay(!playing); };
  var dragging = false;
  function fromEvent(e) { var r = track.getBoundingClientRect(); var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left; seek(x / r.width * T); }
  track.addEventListener('pointerdown', function (e) { dragging = true; fromEvent(e); track.setPointerCapture(e.pointerId); });
  track.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
  track.addEventListener('pointerup', function () { dragging = false; });

  if (reduce) { seek(14.8); setPlay(false); }
  else render(0);
  /* start when visible */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting && !started) { started = true; last = null; requestAnimationFrame(loop); } });
  }, { threshold: .35 }) : null;
  if (io) io.observe(root); else requestAnimationFrame(loop);
  root.seTime = function (v) { setPlay(false); seek(v); }; /* used for testing */
})();
