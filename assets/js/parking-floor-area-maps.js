/* SSG-P 층별 상세보기 주차 구역 도면. 기존 점유율/상세보기 코드는 변경하지 않습니다. */
(() => {
  'use strict';
  if (document.body.dataset.page !== 'parking') return;
  const images = {
    wolgye: {
      '3층': ['wolgye_3f_area.png', '3층 주차구역 (가상 도면)'],
      '4층': ['wolgye_4f_area.png', '4층 주차구역 (가상 도면)'],
      '5층': ['wolgye_5f_area.png', '5층 옥상 주차구역 (가상 도면)']
    },
    hanam: {
      'B1': ['hanam_b1_area.png', '지하 1층 주차구역'],
      'B2': ['hanam_b2_area.png', '지하 2층 주차구역'],
      'B3': ['hanam_b3_area.png', '지하 3층 주차구역 (지하 ３층 주차구역 · 지하 ２층 도면 대체 시뮬레이션)'],
      '3층': ['hanam_3f_area.png', '3층 주차구역 · 주말 운영'],
      '4층': ['hanam_4f_area.png', '4층 주차구역 · 주말 운영'],
      '야외': ['hanam_outdoor_area.png', '야외주차장 주차구역']
    },
    ilsan: {
      'B2': ['ilsan_b2_area.png', '지하 2층 주차구역'],
      'B3': ['ilsan_b3_area.png', '지하 3층 주차구역'],
      '옥상': ['ilsan_roof_area.png', '옥상 주차장 주차구역 (가상 도면)']
    }
  };
  const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const store = () => {
    const id = localStorage.getItem('ssgp_store') || 'wolgye';
    return images[id === 'guseong' ? 'ilsan' : id] ? (id === 'guseong' ? 'ilsan' : id) : 'wolgye';
  };
  const imgPath = entry => 'assets/images/' + encodeURIComponent(entry[0]);
  function mapMarkup(floor, entry, overall = false) {
    const caption = entry[1];
    // 월계점 도면의 가상/시뮬레이션 안내를 이미지 위에도 명확하게 노출합니다.
    const simulationNotice = store() === 'wolgye'
      ? '<p class="ssgp-area-map-simulation-notice">※ 가상 도면 · 시뮬레이션</p>' : '';
    return `<figure class="ssgp-area-map ${overall ? 'ssgp-area-map-preview' : ''}">
      ${simulationNotice}
      <div class="ssgp-area-map-image-wrap"><img src="${imgPath(entry)}" alt="${escapeHTML(caption)} 안내 도면" loading="lazy" decoding="async"></div>
      <figcaption>${escapeHTML(caption)}</figcaption>
    </figure>`;
  }
  function attach() {
    const overlay = document.getElementById('ssgpFloorDetailSheet');
    const tabs = overlay?.querySelector('.ssgp-floor-sheet-tabs');
    const detail = overlay?.querySelector('.ssgp-floor-sheet-details');
    if (!tabs || !detail || detail.dataset.areaMapsBound === '1') return false;
    detail.dataset.areaMapsBound = '1';
    let rendering = false;
    function render() {
      if (rendering || overlay.hidden || detail.querySelector('.ssgp-area-maps')) return;
      const availableFloors = images[store()];
      const activeFloor = tabs.querySelector('.ssgp-floor-sheet-tab.active')?.dataset.sheetFloor || 'overall';
      const wrap = document.createElement('div');
      wrap.className = 'ssgp-area-maps';
      if (activeFloor === 'overall') {
        const valid = [...tabs.querySelectorAll('[data-sheet-floor]')]
          .map(button => ({id: button.dataset.sheetFloor, text: button.textContent.trim()}))
          .filter(x => availableFloors[x.id]);
        const heading = document.createElement('p');
        heading.className = 'ssgp-area-map-heading';
        heading.textContent = '층별 주차구역 안내도';
        wrap.append(heading);
        const gallery = document.createElement('div');
        gallery.className = 'ssgp-area-map-gallery';
        valid.forEach(({id,text}) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'ssgp-area-map-gallery-item';
          btn.setAttribute('aria-label', text + ' 주차구역 도면 보기');
          btn.innerHTML = mapMarkup(id, availableFloors[id], true);
          btn.addEventListener('click', () => tabs.querySelectorAll('[data-sheet-floor]').forEach(tab => {
            if (tab.dataset.sheetFloor === id) tab.click();
          }));
          gallery.append(btn);
        });
        wrap.append(gallery);
        const guide = document.createElement('p');
        guide.className = 'ssgp-area-map-guide';
        guide.textContent = '도면을 누르거나 위의 층을 선택하면 해당 층 도면을 크게 볼 수 있어요.';
        wrap.append(guide);
      } else if (availableFloors[activeFloor]) {
        wrap.innerHTML = mapMarkup(activeFloor, availableFloors[activeFloor]);
      } else {
        return;
      }
      rendering = true;
      detail.prepend(wrap); // 주차장 이름/점유율/잔여면수 위에 표시
      rendering = false;
    }
    const observer = new MutationObserver(() => render());
    observer.observe(detail, {childList:true});
    // 원본 바텀시트는 전체 탭으로 열리므로 열기 이벤트 이후에 삽입
    document.querySelector('.ssgp-floor-detail-open')?.addEventListener('click', () => queueMicrotask(render));
    render();
    return true;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();
