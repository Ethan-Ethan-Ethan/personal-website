document.addEventListener('DOMContentLoaded', () => {
  const chartContainer = document.getElementById('tradingview-chart-container');
  const watchlistItems = document.querySelectorAll('.watchlist-item');
  if (!chartContainer) return;

  let widgetLoaded = false;
  let currentSymbol = 'BINANCE:BTCUSDT';

  function loadTradingViewWidget(symbol) {
    // Clear container
    chartContainer.innerHTML = '<div class="tradingview-widget-container__widget"></div>';

    // Create new script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.textContent = JSON.stringify({
      autosize: false,
      width: "100%",
      height: "300",
      symbol: symbol,
      interval: "15",
      timezone: "Asia/Taipei",
      theme: "dark",
      style: "1",
      locale: "zh_TW",
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com"
    });

    chartContainer.appendChild(script);
  }

  // Lazy load via IntersectionObserver — load when user scrolls near
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !widgetLoaded) {
        widgetLoaded = true;
        loadTradingViewWidget(currentSymbol);
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px' });

  observer.observe(chartContainer);

  // Bind click events for watchlist switching
  watchlistItems.forEach(item => {
    item.addEventListener('click', function () {
      const symbol = this.dataset.symbol;
      currentSymbol = symbol;

      // Update active state
      watchlistItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');

      if (widgetLoaded) {
        loadTradingViewWidget(symbol);
      }
      // If not yet loaded, IntersectionObserver will trigger load with currentSymbol already set
    });
  });
});
