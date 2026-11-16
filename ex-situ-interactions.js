const setRovingTabs = (buttons, activate) => {
  buttons.forEach((button, index) => {
    button.tabIndex = index === 0 ? 0 : -1;
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
};

const methodExplorer = document.querySelector("[data-method-explorer]");
if (methodExplorer) {
  const buttons = [...methodExplorer.querySelectorAll("[data-method]")];
  const panels = [...methodExplorer.querySelectorAll("[data-method-panel]")];
  const activate = index => {
    buttons.forEach((button, i) => {
      button.setAttribute("aria-selected", String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
  };
  setRovingTabs(buttons, activate);
  activate(0);
}

const process = document.querySelector("[data-cbg-process]");
if (process) {
  const buttons = [...process.querySelectorAll("[data-step]")];
  const panel = process.querySelector(".cbg-process-panel");
  const initial = panel.innerHTML;
  const activate = index => {
    buttons.forEach((button, i) => {
      button.setAttribute("aria-selected", String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    panel.innerHTML = index === 0 ? initial : process.querySelector(`[data-step-content="${index}"]`).innerHTML;
    panel.setAttribute("aria-labelledby", buttons[index].id || `cbg-step-${index}`);
  };
  buttons.forEach((button, index) => { button.id = `cbg-step-${index}`; button.setAttribute("aria-controls", "cbg-process-detail"); });
  panel.id = "cbg-process-detail";
  setRovingTabs(buttons, activate);
  activate(0);
}

const priceButtons = [...document.querySelectorAll("[data-price]")];
if (priceButtons.length) {
  const revenue = document.querySelector("[data-econ-revenue]");
  const surplus = document.querySelector("[data-econ-surplus]");
  const note = document.querySelector("[data-econ-note]");
  priceButtons.forEach(button => button.addEventListener("click", () => {
    const policy = button.dataset.price === "105";
    priceButtons.forEach(item => item.classList.toggle("active", item === button));
    revenue.textContent = policy ? "₹17.7 cr" : "₹11.8 cr";
    surplus.textContent = policy ? "₹6.8 cr" : "₹0.98 cr";
    note.textContent = policy
      ? "Scenario applies the August 2026 announced equivalent price of ₹105/kg to the same output. It is not a guaranteed project realisation; eligibility and contract terms apply."
      : "The original workbook assumes 100% gas offtake at ₹70/kg. It excludes financing cost and tax.";
  }));
}
