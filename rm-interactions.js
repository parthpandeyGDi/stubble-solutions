/* Review and monitoring page: 24-hour dial, seven-step burnt-area schematic, district map.
   Plain JavaScript, no libraries. Data comes from rm-data.js (window.RM_DATA). */
(() => {
  const D = window.RM_DATA;
  if (!D) return;
  const fmt = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
  const lerp = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const hex = (rgb) => "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
  const INK = "#102b40", BLUE = "#173b5c", RED = "#c93612", TEAL = "#5aa7a0", MUTED = "#526977", LINE = "#c8d4da";

  /* ---------- 1. Twenty-four-hour timeline ---------- */
  const clockHost = document.getElementById("rm-clock");
  if (clockHost) {
    const hours = D.clock.hours;
    const X0 = 64, W = 792, SW = W / 24, BASE = 300, H = 210;
    const maxHour = Math.max(...hours.map((h) => h.aqua + h.viirs));
    const y = (v) => BASE - (v / maxHour) * H;
    const hx = (h) => X0 + h * SW;
    let s = "";
    // reported burning window, behind the bars
    s += `<rect x="${hx(16)}" y="34" width="${6 * SW}" height="${BASE - 34}" fill="${RED}" opacity=".10"/>`;
    s += `<rect x="${hx(16)}" y="34" width="${6 * SW}" height="5" fill="${RED}"/>`;
    s += `<text x="${hx(16) + 8}" y="64" font-size="19" font-weight="600" fill="${RED}">Farmers report</text>`;
    s += `<text x="${hx(16) + 8}" y="86" font-size="19" font-weight="600" fill="${RED}">burning 4 pm to 10 pm</text>`;
    s += `<text x="${hx(16) + 8}" y="108" font-size="17" fill="${MUTED}">(Haryana survey)</text>`;
    s += `<text x="${hx(17) + 4}" y="190" font-size="17" fill="${INK}">No detections are</text>`;
    s += `<text x="${hx(17) + 4}" y="210" font-size="17" fill="${INK}">time-stamped after</text>`;
    s += `<text x="${hx(17) + 4}" y="230" font-size="17" fill="${INK}">16:33 in these lists</text>`;
    // gridlines and axis
    s += `<line x1="${X0}" y1="${BASE}" x2="${X0 + W}" y2="${BASE}" stroke="${LINE}" stroke-width="1.5"/>`;
    for (let h = 0; h <= 24; h++) s += `<line x1="${hx(h)}" y1="${BASE}" x2="${hx(h)}" y2="${BASE + (h % 3 === 0 ? 8 : 4)}" stroke="${LINE}"/>`;
    for (let h = 0; h <= 24; h += 3) {
      const lab = h === 24 ? "24:00" : String(h).padStart(2, "0") + ":00";
      s += `<text x="${hx(h)}" y="${BASE + 34}" text-anchor="middle" font-size="19" font-family="DM Mono, monospace" fill="${MUTED}">${lab}</text>`;
    }
    // stacked bars: VIIRS at the base, Aqua above
    hours.forEach((o) => {
      const tot = o.aqua + o.viirs;
      if (!tot) return;
      const bx = hx(o.h) + 5, bw = SW - 10;
      const yv = y(o.viirs), yt = y(tot);
      if (o.viirs) s += `<rect x="${bx.toFixed(1)}" y="${yv.toFixed(1)}" width="${bw.toFixed(1)}" height="${(BASE - yv).toFixed(1)}" fill="${TEAL}"/>`;
      if (o.aqua) s += `<rect x="${bx.toFixed(1)}" y="${yt.toFixed(1)}" width="${bw.toFixed(1)}" height="${(yv - yt).toFixed(1)}" fill="${BLUE}"/>`;
      if (tot >= 100) s += `<text x="${(bx + bw / 2).toFixed(1)}" y="${(yt - 8).toFixed(1)}" text-anchor="middle" font-size="20" font-weight="700" fill="${INK}" stroke="#fff" stroke-width="4" paint-order="stroke">${fmt(tot)}</text>`;
    });
    // night note
    s += `<text x="${hx(0) + 4}" y="${BASE - 58}" font-size="19" font-weight="600" fill="${INK}">${D.clock.night} night-time</text>`;
    s += `<text x="${hx(0) + 4}" y="${BASE - 34}" font-size="19" font-weight="600" fill="${INK}">detections, 1 to 4 am</text>`;
    s += `<text x="${X0 - 8}" y="${BASE + 5}" text-anchor="end" font-size="18" fill="${MUTED}">0</text>`;
    s += `<text x="${X0 - 8}" y="${(y(maxHour) + 5).toFixed(0)}" text-anchor="end" font-size="18" fill="${MUTED}">${fmt(maxHour)}</text>`;
    clockHost.innerHTML = `<svg viewBox="0 0 900 360" role="img" aria-label="Timeline of detections by hour of day. Detections in CREAMS fire lists fall between 01:29 and 16:33. Farmers in a Haryana survey report burning between 4 pm and 10 pm.">${s}</svg>`;
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
