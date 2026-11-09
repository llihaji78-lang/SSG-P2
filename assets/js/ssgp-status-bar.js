/* SSG-P demo status bar. Visual indicator only, not actual device network/battery info. */
(() => {
  // 'live': device local time; 'fixed': demo scenario time.
  const TIME_MODE = 'fixed';
  const DEMO_TIME = '14:38';

  function init() {
  

  if (document.querySelector('.ssgp-status-bar')) return;
    const root =
  document.querySelector('.app') ||
  document.querySelector('.app-frame') ||
  document.body;
    const bar = document.createElement('div');
    bar.className = 'ssgp-status-bar';
    bar.setAttribute('aria-label', '시연용 모바일 상태 표시줄');
    bar.innerHTML = `
      <span class="ssgp-status-time" aria-label="시각"></span>
      <div class="ssgp-status-icons" aria-hidden="true">
        <svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor"><rect x="0" y="10" width="3" height="4" rx=".6"/><rect x="5" y="7" width="3" height="7" rx=".6"/><rect x="10" y="4" width="3" height="10" rx=".6"/><rect x="15" y="1" width="3" height="13" rx=".6"/></svg>
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1.3 4.8C5.5 1 12.5 1 16.7 4.8"/><path d="M4.4 8c2.5-2.1 6.7-2.1 9.2 0"/><path d="M8.4 11.5h1.2"/></svg>
        <svg width="27" height="14" viewBox="0 0 27 14" fill="currentColor"><rect x=".8" y="1.3" width="22" height="11.4" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="3.2" y="3.8" width="16.3" height="6.4" rx="1.4"/><path d="M24.5 4.5v5c1.5-.4 2.2-1.2 2.2-2.5s-.7-2.1-2.2-2.5"/></svg>
      </div>`;
    root.prepend(bar);
    const timeEl = bar.querySelector('.ssgp-status-time');
    function updateTime() {
      timeEl.textContent = TIME_MODE === 'fixed'
        ? DEMO_TIME
        : new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    updateTime();
    if (TIME_MODE === 'live') setInterval(updateTime, 15000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
