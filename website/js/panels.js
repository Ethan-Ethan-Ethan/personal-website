document.addEventListener('DOMContentLoaded', () => {
  const viewPanels = [...document.querySelectorAll('.view-panel')];

  // Show a panel by ID using the existing .active class mechanism
  function showPanel(panelId, shouldScroll = true) {
    // Get the trigger card that maps to this panel
    const triggers = document.querySelectorAll('[data-view-target]');

    viewPanels.forEach((panel) => {
      panel.classList.toggle('active', panel.id === panelId);
      panel.setAttribute('aria-hidden', panel.id !== panelId ? 'true' : 'false');
    });

    // Update aria-selected on trigger cards
    triggers.forEach((item) => {
      item.setAttribute('aria-selected', String(item.dataset.viewTarget === panelId));
    });

    if (shouldScroll) {
      const element = document.getElementById(panelId);
      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY - 92;
        window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
      }
    }
  }

  // Handle clicks on data-view-target elements (event delegation)
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-view-target]');
    if (!trigger) return;
    event.preventDefault();
    const target = trigger.dataset.viewTarget;
    showPanel(target);
    // Update URL without reload
    history.pushState({ panel: target }, '', `#${target}`);
  });

  // Handle browser back/forward
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.panel) {
      showPanel(e.state.panel);
    } else {
      const hash = window.location.hash.slice(1);
      if (hash) showPanel(hash);
    }
  });

  // On load, check URL hash to restore the correct panel
  const initialHash = window.location.hash.slice(1);
  if (initialHash) {
    showPanel(initialHash);
  }
});
