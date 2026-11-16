document.querySelectorAll('[data-path-tabs]').forEach((widget) => {
  const buttons = [...widget.querySelectorAll('[data-path-tab]')];
  const panels = [...widget.querySelectorAll('[data-path-panel]')];
  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((item) => item.setAttribute('aria-selected', String(item === button)));
    panels.forEach((panel) => { panel.hidden = panel.dataset.pathPanel !== button.dataset.pathTab; });
  }));
});
