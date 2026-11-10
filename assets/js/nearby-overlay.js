/* 주변 주차장 전용 헤더 X 버튼. 공통 detail-header.js는 수정하지 않음. */
(() => {
  'use strict';
  if (document.body.dataset.page !== 'nearby') return;

  const xIcon = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

  function enhance() {
    const header = document.querySelector('.app > header.header');
    if (!header) return false;
    // detail-header.js가 공통 헤더를 생성한 이후에만 처리한다.
    if (!header.classList.contains('ssgp-detail-header')) return false;
    const top = header.querySelector('.ssgp-detail-top');
    if (!top) return false;
    if (top.querySelector('.ssgp-nearby-close')) return true;

    top.querySelector('.ssgp-detail-actions')?.remove();
    top.querySelector('.bell-btn')?.remove();
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'ssgp-detail-action ssgp-nearby-close';
    close.setAttribute('aria-label', '주변 주차장 닫기');
    close.innerHTML = xIcon;
    close.addEventListener('click', () => { window.location.href = 'parking.html'; });
    top.appendChild(close);
    document.querySelector('#ssgpNearbyBack')?.remove();
    return true;
  }

  function init() {
    if (enhance()) return;
    // main.js가 detail-header.js를 동적으로 불러오므로 DOM 변경 시점에 대응.
    const observer = new MutationObserver(() => {
      if (enhance()) observer.disconnect();
    });
    observer.observe(document.querySelector('.app') || document.body, {
      childList: true, subtree: true
    });
    window.addEventListener('load', enhance, {once:true});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else init();
})();
