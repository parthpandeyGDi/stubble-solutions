const setBoilerTabs = (buttons, activate) => {
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

const boilerProcess = document.querySelector("[data-boiler-process]");
if (boilerProcess) {
  const buttons = [...boilerProcess.querySelectorAll("[data-boiler-step]")];
  const panel = boilerProcess.querySelector(".boiler-process-panel");
  const initial = panel.innerHTML;
  const activate = index => {
    buttons.forEach((button, i) => {
      button.setAttribute("aria-selected", String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    panel.innerHTML = index === 0 ? initial : boilerProcess.querySelector(`[data-boiler-content="${index}"]`).innerHTML;
    panel.setAttribute("aria-labelledby", buttons[index].id);
  };
  buttons.forEach((button, index) => {
    button.id = `boiler-step-${index}`;
    button.setAttribute("aria-controls", "boiler-process-detail");
  });
  panel.id = "boiler-process-detail";
  setBoilerTabs(buttons, activate);
  activate(0);
}

const economics = document.querySelector("[data-boiler-economics]");
if (economics) {
  const cases = {
    "25": { paddy: "₹14.0 cr", rice: "₹9.0 cr", extra: "₹5.0 cr", daily: "₹1.95 lakh", payback: "256 days", annual: "Illustrative annual operating-cost saving: ₹5.85 crore at 24-hour operation for 300 days." },
    "6": { paddy: "₹1.6 cr", rice: "₹0.7 cr", extra: "₹0.9 cr", daily: "₹46,914", payback: "192 days", annual: "Illustrative annual operating-cost saving: approximately ₹1.4 crore at 24-hour operation for 300 days." }
  };
  const buttons = [...economics.querySelectorAll("[data-boiler-size]")];
  const update = button => {
    const data = cases[button.dataset.boilerSize];
    buttons.forEach(item => item.classList.toggle("active", item === button));
    economics.querySelector("[data-paddy-capex]").textContent = data.paddy;
    economics.querySelector("[data-rice-capex]").textContent = data.rice;
    economics.querySelector("[data-extra-capex]").textContent = data.extra;
    economics.querySelector("[data-daily-saving]").textContent = data.daily;
    economics.querySelector("[data-payback]").textContent = data.payback;
    economics.querySelector("[data-annual-saving]").textContent = data.annual;
  };
  buttons.forEach(button => button.addEventListener("click", () => update(button)));
}
