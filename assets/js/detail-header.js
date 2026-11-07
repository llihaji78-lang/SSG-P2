/* SSG-P header v3: centered logo on home, no logo on detail pages. */
(() => {
  'use strict';
  const page = document.body?.dataset?.page || '';
  const isHome = page === 'home' || /(^|\/)ssgp-home\.html$/.test(location.pathname);
  const detailPages = new Set(['parking', 'nearby', 'voice', 'vehicle', 'notifications']);
  if (!isHome && !detailPages.has(page)) return;

  // Keep the original script injection in main.js; replace this file only.
  const existingCss = document.querySelector('link[data-ssgp-detail-header]');
  if (existingCss) existingCss.href = 'assets/css/detail-header.css?v=20261107-5';
  else {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/css/detail-header.css?v=20261107-5';
    link.dataset.ssgpDetailHeader = 'true';
    document.head.appendChild(link);
  }

  const svg = {
    back: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
    home: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-7h6v7"/></svg>',
    bell: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
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
    if (!header || header.dataset.ssgpDetailEnhanced === 'v4') return;
    const trigger = header.querySelector('#storeTrigger');
    if (!trigger && page !== 'notifications') return;

    // Preserve, not recreate, the original logo and its existing link.
    const logoRow = header.querySelector('.logo-row');
    // Keep the logo link and direct its click to the SSG-P landing page.
    const logoAnchor = logoRow?.querySelector('a');
    if (logoAnchor) logoAnchor.href = 'ssgp-home.html';
    let title = header.querySelector('.page-title');
    let bell = header.querySelector('.bell-btn');
    const currentPageTitle = {parking:'주차현황', nearby:'주변 주차장', voice:'음성 서비스', vehicle:'내 차량 찾기', notifications:'알림함'};
    if (!title) {
      title = document.createElement('h1');
      title.className = 'page-title';
      title.textContent = isHome ? '홈' : (currentPageTitle[page] || 'SSG-P');
    } else if (currentPageTitle[page]) title.textContent = currentPageTitle[page];

    // On the SSG-P home page, use the actual logo instead of the '홈' heading.
    if (isHome) {
      title.classList.add('ssgp-home-logo-title');
      title.textContent = '';
      if (logoAnchor) {
        title.appendChild(logoAnchor);
      } else {
        const landing = document.createElement('a');
        landing.href = 'ssgp-home.html';
        landing.className = 'ssgp-home-text-logo';
        landing.textContent = 'SSG-P';
        title.appendChild(landing);
      }
    }

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
    if (page === 'notifications') {
      // 알림함: 중앙 제목과 오른쪽 X 버튼만 배치.
      title.textContent = '알림함';
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'ssgp-detail-action ssgp-notification-close';
      close.setAttribute('aria-label', '알림함 닫기');
      close.innerHTML = svg.close;
      close.addEventListener('click', () => {
        let sameOrigin = false;
        try {
          sameOrigin = Boolean(document.referrer) &&
            new URL(document.referrer).origin === location.origin &&
            new URL(document.referrer).pathname !== location.pathname;
        } catch (_) {}
        if (sameOrigin && history.length > 1) history.back();
        else location.href = 'ssgp-home.html';
      });
      top.append(title, close);
      header.replaceChildren(top);
      header.classList.add('ssgp-notifications-header');
      // 본문 중복 뒤로가기 링크는 제거; 알림 목록은 그대로 둡니다.
      document.querySelectorAll('body[data-page="notifications"] main .back-link').forEach(el => el.remove());
    } else {
      actions.append(navButton('back'), navButton('home'));
      top.append(actions, title, bell);
      const storeRow = document.createElement('div');
      storeRow.className = 'ssgp-detail-store-row';
      storeRow.append(trigger);
      // 원래 버튼을 이동하므로 점포 선택 이벤트와 알림 기능은 유지됩니다.
      header.replaceChildren(top, storeRow);
    }
    if (page === 'nearby') {
      // main.js가 생성하던 중복 뒤로가기 링크만 제거합니다.
      const removeNearbyBack = () => document.querySelector('#ssgpNearbyBack')?.remove();
      removeNearbyBack();
      requestAnimationFrame(removeNearbyBack);
    }
    header.classList.add('ssgp-detail-header');
    header.dataset.ssgpDetailEnhanced = 'v4';

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
