(() => {
  const header = document.querySelector("header.topbar");
  const nav = header?.querySelector(":scope > nav");
  if (!header || !nav) return;

  const buckets = [
    {
      code: "01",
      title: "In-Situ Management",
      note: "Manage residue in the field",
      links: [["Overview", "in-situ.html"], ["CRM Machinery", "crm.html"], ["Biodecomposers", "biodecomposer.html"]],
    },
    {
      code: "02",
      title: "Ex-Situ Management",
      note: "Collect, move and convert",
      links: [["Overview", "ex-situ.html"], ["Baling and Storage", "baling-storage.html"], ["Compressed Biogas", "cbg.html"], ["Industrial Boilers", "industrial-boilers.html"], ["Pellet-Based Solutions", "pellets.html"], ["Paddy-Based Biochar", "biochar.html"]],
    },
    {
      code: "03",
      title: "System Enablers",
      note: "Change incentives and choices",
      links: [["Agricultural Reforms", "agri-reforms.html"], ["Behaviour Change", "behaviour-change.html"], ["Review and Monitoring", "review-and-monitoring.html"]],
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
  nav.innerHTML = `<a href="index.html#why">The Crisis</a><a href="why-it-persists.html">Why It Persists</a><details class="pathway-menu"><summary class="pathway-trigger"><span>Pathway Library</span></summary><div class="pathway-panel"><span class="pathway-panel-label">Explore the complete framework</span>${bucketMarkup}</div></details>`;

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

  const trigger = menu.querySelector("summary");
  trigger.addEventListener("click", (event) => {
    // On desktop the menu already opens on hover; a click should keep it open, not close it.
    if (finePointer.matches && menu.hasAttribute("open")) {
      event.preventDefault();
    }
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
