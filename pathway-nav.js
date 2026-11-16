(() => {
  const header = document.querySelector("header.topbar");
  const nav = header?.querySelector(":scope > nav");
  if (!header || !nav) return;

  const buckets = [
    {
      code: "01",
      title: "In-situ management",
      note: "Manage residue in the field",
      links: [["Overview", "in-situ.html"], ["CRM machinery", "crm.html"], ["Biodecomposers", "biodecomposer.html"]],
    },
    {
      code: "02",
      title: "Ex-situ management",
      note: "Collect, move and convert",
      links: [["Overview", "ex-situ.html"], ["Baling and storage", "baling-storage.html"], ["Compressed biogas", "cbg.html"], ["Industrial boilers", "industrial-boilers.html"], ["Pellet-based solutions", "pellets.html"], ["Paddy-based biochar", "biochar.html"]],
    },
    {
      code: "03",
      title: "System enablers",
      note: "Change incentives and choices",
      links: [["Agricultural reforms", "agri-reforms.html"], ["Behaviour change", "behaviour-change.html"], ["Review and monitoring", "review-and-monitoring.html"]],
    },
  ];

  const currentFile = location.pathname.split("/").pop() || "index.html";
  const bucketMarkup = buckets.map((bucket) => {
    const links = bucket.links.map(([label, href]) => {
      const targetFile = href.split("#")[0];
      const current = targetFile === currentFile ? ' aria-current="page"' : "";
      return `<a href="${href}"${current}><span>${label}</span></a>`;
    }).join("");
    return `<details class="pathway-bucket"><summary><b>${bucket.code}</b><span><strong>${bucket.title}</strong><small>${bucket.note}</small></span><i aria-hidden="true">›</i></summary><div class="pathway-submenu">${links}</div></details>`;
  }).join("");

  nav.className = "pathway-nav";
  nav.setAttribute("aria-label", "Pathway navigation");
  nav.innerHTML = `<a href="index.html#why">The crisis</a><a href="why-it-persists.html">Why it persists</a><details class="pathway-menu"><summary class="pathway-trigger"><span>Pathway Library</span></summary><div class="pathway-panel"><span class="pathway-panel-label">Explore the complete framework</span>${bucketMarkup}</div></details>`;

  const oldCta = header.querySelector(":scope > .top-cta");
  if (oldCta) {
    oldCta.remove();
  }

  const menu = nav.querySelector(".pathway-menu");
  const bucketsEls = [...nav.querySelectorAll(".pathway-bucket")];
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  const closeBuckets = (except) => bucketsEls.forEach((bucket) => {
    if (bucket !== except) bucket.removeAttribute("open");
  });

  if (finePointer.matches) {
    menu.addEventListener("mouseenter", () => menu.setAttribute("open", ""));
    menu.addEventListener("mouseleave", () => {
      if (!menu.contains(document.activeElement)) {
        menu.removeAttribute("open");
        closeBuckets();
      }
    });
    bucketsEls.forEach((bucket) => {
      bucket.addEventListener("mouseenter", () => {
        closeBuckets(bucket);
        bucket.setAttribute("open", "");
      });
    });
  }

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) {
      menu.removeAttribute("open");
      closeBuckets();
    }
  });

  nav.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      menu.removeAttribute("open");
      closeBuckets();
      menu.querySelector("summary")?.focus();
    }
  });
})();
