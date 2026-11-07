/* SSG-P header v2: preserve logo on all pages; home + four detail pages. */
(() => {
  'use strict';
  const page = document.body?.dataset?.page || '';
  const isHome = page === 'home' || /(^|\/)ssgp-home\.html$/.test(location.pathname);
  const detailPages = new Set(['parking', 'nearby', 'voice', 'vehicle']);
  if (!isHome && !detailPages.has(page)) return;

  // Keep the original script injection in main.js; replace this file only.
  const existingCss = document.querySelector('link[data-ssgp-detail-header]');
  if (existingCss) existingCss.href = 'assets/css/detail-header.css?v=20261107-2';
  else {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/css/detail-header.css?v=20261107-2';
    link.dataset.ssgpDetailHeader = 'true';
    document.head.appendChild(link);
  }

  const svg = {
    back: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
    home: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-7h6v7"/></svg>',
    bell: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>'
  };
  function navButton(kind) {
    if (kind === 'back') {
      const back = document.createElement('button');
      back.className = 'ssgp-detail-action';
      back.type = 'button';
      back.setAttribute('aria-label','뒤로가기');
      back.innerHTML = svg.back;
      back.addEventListener('click', () => {
        let sameOrigin = false;
        try { sameOrigin = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (_) {}
        if (sameOrigin && history.length > 1) history.back();
        else location.href = isHome ? 'traders.html' : 'ssgp-home.html';
      });
      return back;
    }
    const home = document.createElement('a');
    home.className = 'ssgp-detail-action';
    home.href = 'traders.html';
    home.setAttribute('aria-label','트레이더스 앱 홈으로 이동');
    home.innerHTML = svg.home;
    return home;
  }
  function enhance() {
    const header = document.querySelector('.app > header.header, header.header');
    if (!header || header.dataset.ssgpDetailEnhanced === 'v2') return;
    const trigger = header.querySelector('#storeTrigger');
    if (!trigger) return;

    // Preserve, not recreate, the original logo and its existing link.
    const logoRow = header.querySelector('.logo-row');
    let title = header.querySelector('.page-title');
    let bell = header.querySelector('.bell-btn');
    const currentPageTitle = {parking:'주차현황', nearby:'주변 주차장', voice:'음성 서비스', vehicle:'내 차량 찾기'};
    if (!title) {
      title = document.createElement('h1');
      title.className = 'page-title';
      title.textContent = isHome ? '홈' : (currentPageTitle[page] || 'SSG-P');
    } else if (currentPageTitle[page]) title.textContent = currentPageTitle[page];

    if (!bell) {
      bell = document.createElement('a');
      bell.className = 'bell-btn';
      bell.href = 'notifications.html';
      bell.setAttribute('aria-label','알림함');
      bell.innerHTML = svg.bell + '<span class="badge" style="display:none">0</span>';
    }
    const top = document.createElement('div');
    top.className = 'ssgp-detail-top';
    const actions = document.createElement('div');
    actions.className = 'ssgp-detail-actions';
    actions.append(navButton('back'), navButton('home'));
    top.append(actions, title, bell);

    const storeRow = document.createElement('div');
    storeRow.className = 'ssgp-detail-store-row';
    storeRow.append(trigger);

    // Relocate existing nodes to retain store drawer and bell listeners.
    // Keep the logo row at the very top, also on detailed pages.
    header.replaceChildren(...(logoRow ? [logoRow] : []), top, storeRow);
    header.classList.add('ssgp-detail-header');
    header.dataset.ssgpDetailEnhanced = 'v2';

    // Sync newly-created homepage badge with the existing count when available.
    if (isHome) {
      const badge = bell.querySelector('.badge');
      if (badge) {
        const count = Number(localStorage.getItem('ssgp_notification_count') || '0');
        badge.textContent = String(count);
        badge.style.display = count > 0 ? 'grid' : 'none';
      }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance);
  else enhance();
})();
