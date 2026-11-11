/* SSG-P: 층별 상세보기의 일반·경차·전기차 충전·장애인 주차 유형 아이콘 교체 */
(() => {
  'use strict';
  if (document.body?.dataset.page !== 'parking') return;

  const replacements = [
    [/일반/, 'assets/images/parking-type-general.png'],
    [/경차/, 'assets/images/parking-type-small.png'],
    [/장애인/, 'assets/images/parking-type-accessible.png'],
    [/전기차/, 'assets/images/parking-type-ev.png']
  ];

  function updateIcons(detail) {
    detail.querySelectorAll('.ssgp-floor-type-item').forEach(row => {
      const label = row.querySelector('.ssgp-floor-type-name')?.textContent?.trim() || '';
      const match = replacements.find(([pattern]) => pattern.test(label));
      if (!match) return;
      const holder = row.querySelector('.ssgp-floor-type-icon');
      if (!holder || holder.querySelector('img.ssgp-floor-type-custom-img')) return;
      const img = document.createElement('img');
      img.className = 'ssgp-floor-type-custom-img';
      img.src = match[1];
      img.alt = '';
      img.decoding = 'async';
      holder.replaceChildren(img);
      holder.classList.add('ssgp-floor-type-custom-icon');
    });
  }

  function bind() {
    const detail = document.querySelector('#ssgpFloorDetailSheet .ssgp-floor-sheet-details');
    if (!detail || detail.dataset.typeIconsBound === '1') return !!detail;
    detail.dataset.typeIconsBound = '1';
    updateIcons(detail);
    new MutationObserver(() => updateIcons(detail)).observe(detail, {childList:true,subtree:true});
    return true;
  }

  function init() {
    if (bind()) return;
    const observer = new MutationObserver(() => { if (bind()) observer.disconnect(); });
    observer.observe(document.body, {childList:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
