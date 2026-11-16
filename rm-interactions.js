/* Review and monitoring page: 24-hour dial, seven-step burnt-area schematic, district map.
   Plain JavaScript, no libraries. Data comes from rm-data.js (window.RM_DATA). */
(() => {
  const D = window.RM_DATA;
  if (!D) return;
  const fmt = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
  const lerp = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const hex = (rgb) => "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
  const INK = "#102b40", BLUE = "#173b5c", RED = "#c93612", TEAL = "#5aa7a0", MUTED = "#526977", LINE = "#c8d4da";

  /* ---------- 1. Twenty-four-hour dial ---------- */
  const clockHost = document.getElementById("rm-clock");
  if (clockHost) {
    const cx = 480, cy = 380, r0 = 170, L = 110;
    const ang = (h) => (h / 24) * 2 * Math.PI - Math.PI / 2;
    const pt = (r, h) => [cx + r * Math.cos(ang(h)), cy + r * Math.sin(ang(h))];
    const n1 = (v) => v.toFixed(1);
    const wedge = (r1, r2, h1, h2) => {
      const [x1, y1] = pt(r1, h1), [x2, y2] = pt(r2, h1), [x3, y3] = pt(r2, h2), [x4, y4] = pt(r1, h2);
      return `M${n1(x1)} ${n1(y1)}L${n1(x2)} ${n1(y2)}A${r2} ${r2} 0 0 1 ${n1(x3)} ${n1(y3)}L${n1(x4)} ${n1(y4)}A${r1} ${r1} 0 0 0 ${n1(x1)} ${n1(y1)}Z`;
    };
    const hours = D.clock.hours;
    const maxHour = Math.max(...hours.map((h) => h.aqua + h.viirs));
    let s = "";
    // hour dividers behind the bars
    for (let h = 0; h < 24; h++) {
      const [a, b] = pt(r0, h), [c, d] = pt(r0 + L, h);
      s += `<line x1="${n1(a)}" y1="${n1(b)}" x2="${n1(c)}" y2="${n1(d)}" stroke="#e1e8eb" stroke-width="1"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="${r0}" fill="none" stroke="${LINE}"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r0 + L}" fill="none" stroke="${LINE}" stroke-dasharray="3 4"/>`;
    // Meteosat observation ticks (every 15 minutes)
    for (let i = 0; i < 96; i++) {
      const h = i / 4, [a, b] = pt(138, h), [c, d] = pt(148, h);
      s += `<line x1="${n1(a)}" y1="${n1(b)}" x2="${n1(c)}" y2="${n1(d)}" stroke="#23706e" stroke-width="1.2"/>`;
    }
    // bars, stacked by satellite family
    hours.forEach((o) => {
      const lv = (L * o.viirs) / maxHour, la = (L * o.aqua) / maxHour;
      const hv = o.viirs ? Math.max(lv, 1.6) : 0, ha = o.aqua ? Math.max(la, 1.6) : 0;
      if (o.viirs) s += `<path d="${wedge(r0, r0 + hv, o.h + 0.06, o.h + 0.94)}" fill="${TEAL}"/>`;
      if (o.aqua) s += `<path d="${wedge(r0 + hv, r0 + hv + ha, o.h + 0.06, o.h + 0.94)}" fill="${BLUE}"/>`;
      const tot = o.viirs + o.aqua;
      if (tot >= 100) {
        const [x, y] = pt(r0 + hv + ha + 20, o.h + 0.5);
        s += `<text x="${n1(x)}" y="${n1(y)}" text-anchor="middle" dominant-baseline="middle" font-size="17" font-weight="700" fill="${INK}" stroke="#fff" stroke-width="4" paint-order="stroke">${fmt(tot)}</text>`;
      }
    });
    // reported burning window, 16:00 to 22:00
    s += `<path d="${wedge(292, 306, 16, 22)}" fill="${RED}"/>`;
    // nominal pass markers (iFOREST methodology table)
    [[1.5, "NOAA-20 1:30 am", "start"], [10.5, "Terra 10:30 am", "start"], [13.5, "Aqua and NOAA-20 1:30 pm", "end"]].forEach(([h, t, anchor]) => {
      const [x, y] = pt(299, h), [tx, ty] = pt(352, h);
      s += `<circle cx="${n1(x)}" cy="${n1(y)}" r="7" fill="${BLUE}" stroke="#fff" stroke-width="2"/>`;
      s += `<text x="${n1(tx)}" y="${n1(ty)}" text-anchor="${anchor}" dominant-baseline="middle" font-size="16" font-weight="600" fill="${INK}">${t}</text>`;
    });
    // hour numerals
    for (let h = 0; h < 24; h += 3) {
      const [x, y] = pt(324, h);
      s += `<text x="${n1(x)}" y="${n1(y)}" text-anchor="middle" dominant-baseline="middle" font-size="15" font-family="DM Mono, monospace" fill="${MUTED}">${String(h).padStart(2, "0")}:00</text>`;
    }
    // scale labels on an empty spoke (06:00)
    s += `<text x="${cx + r0 + 4}" y="${cy + 18}" font-size="14" fill="${MUTED}">0</text>`;
    s += `<text x="${cx + r0 + L + 4}" y="${cy + 18}" font-size="14" fill="${MUTED}">${fmt(maxHour)}</text>`;
    s += `<text x="${cx + r0 + 4}" y="${cy - 8}" font-size="14" fill="${MUTED}">detections per hour</text>`;
    // night note with leader
    const [lx, ly] = pt(r0 + 6, 2.5);
    s += `<line x1="${n1(lx)}" y1="${n1(ly)}" x2="690" y2="108" stroke="${MUTED}" stroke-width="1"/>`;
    s += `<text x="694" y="92" font-size="16" font-weight="600" fill="${INK}">${D.clock.night} night-time</text><text x="694" y="113" font-size="16" font-weight="600" fill="${INK}">detections, 1 to 4 am</text>`;
    // burning window label
    s += `<text x="170" y="270" text-anchor="end" font-size="16" font-weight="600" fill="${RED}"><tspan x="170">Burning window</tspan><tspan x="170" dy="20">reported by farmers:</tspan><tspan x="170" dy="20">4 pm to 10 pm</tspan><tspan x="170" dy="20" font-weight="400" fill="${MUTED}">(Haryana survey)</tspan></text>`;
    // centre
    s += `<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="56" font-weight="700" letter-spacing="-2" fill="${INK}">${D.clock.last}</text>`;
    s += `<text x="${cx}" y="${cy + 22}" text-anchor="middle" font-size="15" fill="${MUTED}">latest detection time stamp</text>`;
    s += `<text x="${cx}" y="${cy + 40}" text-anchor="middle" font-size="15" fill="${MUTED}">in the CREAMS fire lists</text>`;
    clockHost.innerHTML = `<svg viewBox="0 24 900 716" role="img" aria-label="Twenty-four-hour dial. Satellite detections in CREAMS fire lists fall between 01:29 and 16:33. Farmers in a Haryana survey report burning from 4 pm to 10 pm.">${s}</svg>`;
    const tb = document.getElementById("rm-clock-table");
    if (tb) {
      tb.innerHTML = hours.filter((o) => o.aqua + o.viirs > 0).map((o) =>
        `<tr><td>${String(o.h).padStart(2, "0")}:00 to ${String(o.h).padStart(2, "0")}:59</td><td>${fmt(o.viirs)}</td><td>${fmt(o.aqua)}</td><td>${fmt(o.viirs + o.aqua)}</td></tr>`).join("") +
        `<tr><td><b>All hours</b></td><td><b>${fmt(hours.reduce((a, o) => a + o.viirs, 0))}</b></td><td><b>${fmt(hours.reduce((a, o) => a + o.aqua, 0))}</b></td><td><b>${fmt(D.clock.total)}</b></td></tr>`;
    }
  }

  /* ---------- 2. Seven-step burnt-area schematic ---------- */
  const stageHost = document.getElementById("rm-stage");
  if (stageHost) {
    const W = 12, H = 7;
    const hash = (c, r) => { const x = Math.sin(c * 127.1 + r * 311.7) * 43758.5453; return x - Math.floor(x); };
    const inField = (c, r) => (c >= 1 && c <= 3 && r >= 1 && r <= 4) || (c >= 7 && c <= 9 && r >= 3 && r <= 5);
    const isolated = (c, r) => (c === 11 && r === 5) || (c === 0 && r === 6);
    const nonCrop = (c, r) => c === 5 || (c >= 10 && r <= 1);
    const beforeCloud = (c, r) => (c <= 1 && r === 0);
    const afterCloud = (c, r) => (c >= 2 && c <= 4 && r <= 1);
    const masked = (c, r) => beforeCloud(c, r) || afterCloud(c, r);
    const dnbr = (c, r) => {
      if (inField(c, r)) return 0.55 + 0.35 * hash(c, r);
      if (isolated(c, r)) return 0.72;
      if ((c === 5 && (r === 2 || r === 3)) || (c === 10 && r === 1)) return 0.6;
      return 0.02 + 0.13 * hash(c + 9, r + 4);
    };
    const THRESH = 0.35; // schematic only: no real threshold is shown or implied
    const stops = [[0, [237, 243, 245]], [0.35, [243, 210, 154]], [0.7, [217, 85, 43]], [1, [122, 28, 6]]];
    const ramp = (v) => {
      for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) { const [t0, c0] = stops[i - 1], [t1, c1] = stops[i]; return hex(lerp(c0, c1, (v - t0) / (t1 - t0))); }
      return hex(stops[stops.length - 1][1]);
    };
    const field = (c, r, after) => {
      if (nonCrop(c, r)) return "#b9c3c8";
      if (after && (inField(c, r) || isolated(c, r))) return "#5b4a3c";
      const g = hash(c + 3, r + 1); return g > 0.5 ? "#b9cfa3" : "#a9c392";
    };
    const cell = (x, y, z, fill, extra = "") => `<rect x="${x}" y="${y}" width="${z - 1}" height="${z - 1}" fill="${fill}" ${extra}/>`;
    const hatch = (x, y, z) => `<rect x="${x}" y="${y}" width="${z - 1}" height="${z - 1}" fill="url(#rm-hatch)"/>`;
    const cloud = (x, y, z) => `<rect x="${x}" y="${y}" width="${z - 1}" height="${z - 1}" fill="#fff" stroke="#9fb0b9"/>`;
    let finalCount = 0;
    const survives = (c, r) => dnbr(c, r) >= THRESH && !masked(c, r) && !nonCrop(c, r) && !isolated(c, r);
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (survives(c, r)) finalCount++;
    const defs = `<defs><pattern id="rm-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#eef2f3"/><line x1="0" y1="0" x2="0" y2="6" stroke="#9fb0b9" stroke-width="2"/></pattern></defs>`;
    const txt = (x, y, t, o = "") => `<text x="${x}" y="${y}" font-size="13" fill="${INK}" ${o}>${t}</text>`;
    const bigGrid = (fn, x0 = 76, y0 = 16, z = 34) => {
      let g = "";
      for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) g += fn(c, r, x0 + c * z, y0 + r * z, z);
      return g;
    };
    const pairGrid = (fn) => {
      let g = "";
      [[16, "Before image", false], [296, "After image", true]].forEach(([x0, label, after]) => {
        g += txt(x0, 52, label, 'font-weight="700"');
        for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) g += fn(c, r, x0 + c * 22, 64 + r * 22, 22, after);
      });
      return g;
    };
    const steps = [
      { t: "Group images into 5 to 10 day windows", cap: "Sentinel-2 passes over the same ground about every five days, at about 10:30 am. The images are grouped into intervals of 5 to 10 days.", draw: () => {
        let g = `<g transform="translate(0,-60)"><line x1="30" y1="170" x2="530" y2="170" stroke="${LINE}" stroke-width="3"/>`;
        for (let i = 0; i < 7; i++) {
          const x = 50 + i * 75;
          g += `<rect x="${x - 17}" y="153" width="34" height="34" fill="#edf3f5" stroke="${BLUE}" stroke-width="1.5"/>`;
          if (i === 2 || i === 4) g += `<ellipse cx="${x}" cy="170" rx="13" ry="8" fill="#fff" stroke="#9fb0b9"/>`;
          if (i < 6) g += txt(x + 24, 208, "~5 days", `font-size="11" fill="${MUTED}"`);
        }
        g += `<path d="M33 138V128H215V138" fill="none" stroke="${RED}" stroke-width="2"/>` + txt(124, 114, "5 to 10 day interval", `text-anchor="middle" font-weight="600"`);
        g += `<path d="M333 138V128H515V138" fill="none" stroke="${RED}" stroke-width="2"/>` + txt(424, 114, "5 to 10 day interval", `text-anchor="middle" font-weight="600"`);
        g += txt(124, 98, "around the time before burning", `text-anchor="middle" font-size="12" fill="${MUTED}"`);
        g += txt(424, 98, "around the time after burning", `text-anchor="middle" font-size="12" fill="${MUTED}"`);
        g += txt(280, 250, "Schematic: acquisition dates are illustrative.", `text-anchor="middle" font-size="12" fill="${MUTED}"`);
        return g + "</g>";
      } },
      { t: "Pick the least-cloudy before and after images", cap: "From each interval, the least-cloudy valid observation is selected as the before image and the after image.", draw: () => pairGrid((c, r, x, y, z, after) => {
        const cl = after ? afterCloud(c, r) : beforeCloud(c, r);
        return cl ? cloud(x, y, z) : cell(x, y, z, field(c, r, after));
      }) + txt(280, 250, "Green: unburnt field. Brown: changed after burning. White: cloud.", `text-anchor="middle" font-size="12" fill="${MUTED}"`) },
      { t: "Remove clouds, shadows, cirrus and saturated pixels", cap: "Clouds, shadows, cirrus and saturated pixels are removed from the analysis. iFOREST does not name its masking method.", draw: () => pairGrid((c, r, x, y, z, after) => {
        const cl = after ? afterCloud(c, r) : beforeCloud(c, r);
        return cl ? hatch(x, y, z) : cell(x, y, z, field(c, r, after));
      }) + txt(280, 250, "Hatched pixels are excluded from every later step.", `text-anchor="middle" font-size="12" fill="${MUTED}"`) },
      { t: "Calculate dNBR at 20 m", cap: "For each 20 m pixel, the Normalized Burn Ratio is compared between the two images. That change is dNBR. A higher dNBR generally means a stronger burn-related change.", draw: () => bigGrid((c, r, x, y, z) => masked(c, r) ? hatch(x, y, z) : cell(x, y, z, ramp(dnbr(c, r)))) +
        `<rect x="156" y="262" width="150" height="10" fill="url(#rm-ramp)"/>` + txt(150, 271, "lower", `text-anchor="end" font-size="12" fill="${MUTED}"`) + txt(312, 271, "higher dNBR", `font-size="12" fill="${MUTED}"`) },
      { t: "Apply a state- and season-specific threshold", cap: "A threshold set for the state and the season sorts pixels into burnt and unburnt. iFOREST does not publish the numeric thresholds, so none is shown here.", draw: () => bigGrid((c, r, x, y, z) => masked(c, r) ? hatch(x, y, z) : cell(x, y, z, dnbr(c, r) >= THRESH ? RED : "#dbe5ea")) +
        cell(156, 262, 12, RED) + txt(174, 272, "above threshold: burnt", `font-size="12" fill="${MUTED}"`) + cell(320, 262, 12, "#dbe5ea") + txt(338, 272, "below: unburnt", `font-size="12" fill="${MUTED}"`) },
      { t: "Limit to cropland and remove small isolated pixels", cap: "Results are limited to cropland. Small isolated pixels are removed so that stray detections do not count as burnt area.", draw: () => bigGrid((c, r, x, y, z) => {
        if (masked(c, r)) return hatch(x, y, z);
        if (nonCrop(c, r)) return cell(x, y, z, "#b9c3c8");
        if (isolated(c, r)) return cell(x, y, z, "#fff", `stroke="${RED}" stroke-dasharray="3 3"`);
        return cell(x, y, z, dnbr(c, r) >= THRESH ? RED : "#dbe5ea");
      }) + cell(100, 262, 12, "#b9c3c8") + txt(118, 272, "not cropland", `font-size="12" fill="${MUTED}"`) + cell(232, 262, 12, "#fff", `stroke="${RED}" stroke-dasharray="3 3"`) + txt(250, 272, "isolated pixel, removed", `font-size="12" fill="${MUTED}"`) },
      { t: "Count each pixel once per season", cap: "Each pixel is counted once per season, so a persistent burn scar is not counted twice. Totals are reported in square kilometres and as a share of mapped cropland. At 20 m, one pixel covers 400 square metres.", draw: () => bigGrid((c, r, x, y, z) => masked(c, r) ? hatch(x, y, z) : cell(x, y, z, survives(c, r) ? RED : "#dbe5ea")) +
        txt(280, 268, `Illustrative total: ${finalCount} pixels × 400 m² = ${fmt(finalCount * 400)} m²`, `text-anchor="middle" font-weight="700"`) },
    ];
    const ramps = `<linearGradient id="rm-ramp" x1="0" x2="1"><stop offset="0" stop-color="#edf3f5"/><stop offset=".35" stop-color="#f3d29a"/><stop offset=".7" stop-color="#d9552b"/><stop offset="1" stop-color="#7a1c06"/></linearGradient>`;
    const list = document.getElementById("rm-steplist"), cap = document.getElementById("rm-cap");
    const prev = document.getElementById("rm-prev"), next = document.getElementById("rm-next"), play = document.getElementById("rm-play");
    let cur = 0, timer = null;
    list.innerHTML = steps.map((st, i) => `<li><button type="button" data-i="${i}"><b>${String(i + 1).padStart(2, "0")}</b><span>${st.t}</span></button></li>`).join("");
    const show = (i) => {
      cur = Math.max(0, Math.min(steps.length - 1, i));
      stageHost.innerHTML = `<svg viewBox="0 0 560 290" role="img" aria-label="Schematic of step ${cur + 1}: ${steps[cur].t}">${defs.replace("</defs>", ramps + "</defs>")}${steps[cur].draw()}</svg>`;
      cap.textContent = steps[cur].cap;
      list.querySelectorAll("button").forEach((b, k) => { if (k === cur) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
      prev.disabled = cur === 0; next.disabled = cur === steps.length - 1;
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } play.textContent = "Play all steps"; };
    list.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { stop(); show(+b.dataset.i); } });
    prev.addEventListener("click", () => { stop(); show(cur - 1); });
    next.addEventListener("click", () => { stop(); show(cur + 1); });
    play.addEventListener("click", () => {
      if (timer) return stop();
      if (cur === steps.length - 1) show(0);
      play.textContent = "Pause";
      timer = setInterval(() => { if (cur >= steps.length - 1) stop(); else show(cur + 1); }, 2800);
    });
    show(0);
  }

  /* ---------- 3. District map ---------- */
  const mapHost = document.getElementById("rm-map");
  if (mapHost) {
    const metrics = {
      fires: { label: "Active fire detections", note: "1 Oct to 31 Dec 2025", get: (d) => d.fires, f: (v) => fmt(v) },
      burnt: { label: "Burnt area (sq km)", note: "kharif 2025", get: (d) => d.burnt, f: (v) => fmt(v) },
      pct: { label: "Share of agricultural area burnt", note: "kharif 2025", get: (d) => d.pct, f: (v) => v.toFixed(0) + "%" },
    };
    let metric = "fires", sel = "Tarn Taran";
    const withData = D.districts.filter((x) => x.data);
    const bb = D.bbox;
    const vb = `${(bb[0] - 10).toFixed(0)} ${(bb[1] - 6).toFixed(0)} ${(bb[2] - bb[0] + 20).toFixed(0)} ${(bb[3] - bb[1] + 12).toFixed(0)}`;
    const mix = (t, red) => hex(lerp(red ? [250, 236, 230] : [230, 238, 242], red ? [150, 34, 8] : [23, 59, 92], t));
    const toggles = document.getElementById("rm-toggle"), rows = document.getElementById("rm-rows"), readout = document.getElementById("rm-readout"), scale = document.getElementById("rm-scale");
    toggles.innerHTML = Object.entries(metrics).map(([k, m]) => `<button type="button" data-k="${k}" aria-pressed="${k === metric}">${m.label}</button>`).join("");
    const draw = () => {
      const m = metrics[metric];
      const vals = withData.map((x) => m.get(x.data));
      const lo = Math.min(...vals), hi = Math.max(...vals);
      const t = (x) => (m.get(x.data) - lo) / (hi - lo);
      let s = `<defs><pattern id="rm-nd" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#f1f4f5"/><line x1="0" y1="0" x2="0" y2="6" stroke="#b9c3c8" stroke-width="1.5"/></pattern></defs>`;
      D.districts.forEach((x) => {
        const on = x.name === sel ? "true" : "false";
        if (x.data) s += `<path d="${x.d}" fill="${mix(t(x), metric !== "fires")}" tabindex="0" role="button" aria-pressed="${on}" data-n="${x.name}" aria-label="${x.name}: ${m.f(m.get(x.data))}, ${m.label.toLowerCase()}"/>`;
        else s += `<path d="${x.d}" fill="url(#rm-nd)" tabindex="0" role="button" aria-pressed="${on}" data-n="${x.name}" aria-label="${x.name}: no separate value in the iFOREST files"/>`;
      });
      D.districts.forEach((x) => {
        if (!x.lab) return;
        const dark = x.data && t(x) > 0.5;
        s += `<text x="${x.lab.x}" y="${x.lab.y}" font-size="${x.lab.fs}" text-anchor="middle" fill="${dark ? "#fff" : INK}">${x.lab.lines.map((ln, i) => `<tspan x="${x.lab.x}" dy="${i ? x.lab.fs + 1 : 0}">${ln}</tspan>`).join("")}</text>`;
      });
      mapHost.innerHTML = `<svg data-red="${metric !== "fires"}" viewBox="${vb}" role="group" aria-label="Map of Punjab districts shaded by ${m.label.toLowerCase()}">${s}</svg>`;
      const red = metric !== "fires";
      scale.innerHTML = `<span>${m.f(lo)}</span><i style="background:${red ? "linear-gradient(90deg,#faece6,#962208)" : ""}"></i><span>${m.f(hi)}</span><span>${m.label}, ${m.note}</span>`;
      const sorted = [...withData].sort((a, b) => m.get(b.data) - m.get(a.data));
      rows.innerHTML = sorted.map((x) => `<div class="rm-row" role="button" tabindex="0" aria-pressed="${x.name === sel}" data-n="${x.name}"><span>${x.name}</span><i style="width:${Math.max(1, (100 * m.get(x.data)) / hi).toFixed(1)}%;background:${red ? "#c93612" : ""}"></i><span>${m.f(m.get(x.data))}</span></div>`).join("");
      toggles.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === metric)));
      info();
    };
    const info = () => {
      const x = D.districts.find((d) => d.name === sel);
      if (!x) return;
      if (!x.data) { readout.innerHTML = `<h3>${x.name}</h3><p style="margin:0;font-size:15px">The iFOREST files list 22 districts and give no separate value for ${x.name}.</p>`; return; }
      const d = x.data;
      readout.innerHTML = `<h3>${x.name}</h3><dl><dt>Active fire detections, 1 Oct to 31 Dec 2025</dt><dd>${fmt(d.fires)}</dd><dt>Burnt area, kharif 2025</dt><dd>${fmt(d.burnt)} sq km</dd><dt>Share of agricultural area burnt</dt><dd>${d.pct.toFixed(0)}%</dd><dt>Hectares burnt per detection</dt><dd>${fmt((d.burnt * 100) / d.fires)}</dd></dl>`;
    };
    const pick = (name) => { sel = name; draw(); };
    toggles.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { metric = b.dataset.k; draw(); } });
    const act = (e) => { const t = e.target.closest("[data-n]"); if (t) pick(t.dataset.n); };
    mapHost.addEventListener("click", act); rows.addEventListener("click", act);
    const key = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(e); } };
    mapHost.addEventListener("keydown", key); rows.addEventListener("keydown", key);
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      mapHost.addEventListener("mouseover", (e) => { const t = e.target.closest("[data-n]"); if (t && t.dataset.n !== sel) { sel = t.dataset.n; info(); mapHost.querySelectorAll("path").forEach((p) => p.setAttribute("aria-pressed", String(p.dataset.n === sel))); rows.querySelectorAll(".rm-row").forEach((p) => p.setAttribute("aria-pressed", String(p.dataset.n === sel))); } });
    }
    draw();
  }
})();
