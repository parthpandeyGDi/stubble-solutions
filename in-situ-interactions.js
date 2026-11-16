/* Progressive enhancement: all evidence stays readable without JavaScript. */
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function accessibleTabs(buttons, activate) {
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => activate(index));
    button.addEventListener("keydown", event => {
      let next = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % buttons.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else return;
      event.preventDefault();
      activate(next);
      buttons[next].focus();
    });
  });
}

const explorer = document.querySelector("#machine-explorer");
if (explorer) {
  const rows = [...document.querySelectorAll(".is-table tbody tr")];
  const tabs = element("div", "is-machine-tabs");
  tabs.setAttribute("role", "tablist");
  tabs.setAttribute("aria-label", "Choose a crop-residue machine");
  tabs.setAttribute("aria-orientation", "vertical");
  const panel = element("div", "is-machine-panel");
  panel.id = "machine-detail";
  panel.setAttribute("role", "tabpanel");
  panel.tabIndex = 0;
  const buttons = rows.map((row, index) => {
    const name = row.querySelector("th").childNodes[0].textContent.trim();
    const button = element("button", "", name);
    button.type = "button";
    button.id = "machine-tab-" + index;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", panel.id);
    button.prepend(element("small", "", String(index + 1).padStart(2, "0")));
    tabs.append(button);
    return button;
  });
  function activate(index) {
    buttons.forEach((button, i) => {
      button.setAttribute("aria-selected", String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    const row = rows[index];
    const cells = [...row.querySelectorAll("td")];
    panel.setAttribute("aria-labelledby", buttons[index].id);
    panel.replaceChildren();
    panel.append(element("span", "is-machine-role", cells[1].textContent.trim()));
    panel.append(element("h3", "", row.querySelector("th").childNodes[0].textContent.trim()));
    const list = element("dl");
    [["What it does", cells[0].textContent], ["What to plan for", cells[2].textContent]].forEach(([label, value]) => {
      const item = element("div");
      item.append(element("dt", "", label), element("dd", "", value.trim()));
      list.append(item);
    });
    panel.append(list, element("p", "is-machine-next", "Explore another machine or open the full comparison below."));
  }
  explorer.append(tabs, panel);
  explorer.hidden = false;
  accessibleTabs(buttons, activate);
  activate(0);
  document.querySelector(".is-full-comparison").open = false;
}

const process = document.querySelector(".is-process");
if (process) {
  const steps = [...process.querySelectorAll("article")].map(article => ({
    label: article.querySelector("span").textContent,
    title: article.querySelector("h3").textContent,
    description: article.querySelector("p").textContent
  }));
  const result = element("div", "is-process-result");
  result.id = "process-detail";
  result.setAttribute("role", "tabpanel");
  result.tabIndex = 0;
  process.classList.add("is-enhanced");
  process.setAttribute("role", "tablist");
  process.setAttribute("aria-label", "Biodecomposer process steps");
  process.replaceChildren();
  const buttons = steps.map((step, i) => {
    const button = element("button", "is-process-button");
    button.type = "button";
    button.id = "process-tab-" + i;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", result.id);
    button.append(element("span", "", step.label), document.createTextNode(step.title));
    process.append(button);
    return button;
  });
  function activate(index) {
    buttons.forEach((button, i) => {
      button.setAttribute("aria-selected", String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    const copy = element("div");
    copy.append(element("h3", "", steps[index].title), element("p", "", steps[index].description));
    result.replaceChildren(element("span", "", String(index + 1).padStart(2, "0")), copy);
    result.setAttribute("aria-labelledby", buttons[index].id);
  }
  process.after(result);
  accessibleTabs(buttons, activate);
  activate(0);
}

document.querySelectorAll("[data-enlarge-photo]").forEach(button => {
  button.addEventListener("click", () => {
    const source = button.querySelector("img");
    const dialog = element("dialog", "is-photo-dialog");
    dialog.setAttribute("aria-label", "Enlarged field photograph");
    const close = element("button", "", "Close photograph ×");
    close.type = "button";
    const photo = element("img");
    photo.src = source.src;
    photo.alt = source.alt;
    dialog.append(close, photo, element("p", "", button.closest("figure").querySelector("figcaption").textContent));
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => { dialog.remove(); button.focus(); });
    document.body.append(dialog);
    dialog.showModal();
  });
});

