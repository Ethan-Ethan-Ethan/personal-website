document.addEventListener('DOMContentLoaded', () => {
  const domainRenewalAt = new Date('2026-11-12T09:00:00+08:00');

  function updateDomainCountdown() {
    const diffMs = domainRenewalAt.getTime() - Date.now();
    const daysLeft = Math.max(0, Math.ceil(diffMs / 86400000));
    document.querySelectorAll('[data-domain-days]').forEach((element) => {
      element.textContent = String(daysLeft);
    });
  }

  updateDomainCountdown();
});
