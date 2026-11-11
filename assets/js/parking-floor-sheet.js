/* SSG-P floor sheet v2: use the DOM rendered by existing main.js / compact-parking.js.
   No changes to original store numbers or application events. */
(() => {
  'use strict';
  if (document.body?.dataset.page !== 'parking') return;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const types = [
    {test:/일반/, name:'일반', sign:'P'},
    {test:/경차/, name:'경차', sign:'S'},
    {test:/장애인/, name:'장애인', sign:'♿'},
    {test:/여성/, name:'여성전용', sign:'W'},
    {test:/전기차/, name:'전기차 충전', sign:'ϟ'}
  ];
  function parseTypes(row) {
    if (!row) return [];
    const cards = Array.from(row.querySelectorAll('.type-box'));
    return cards.map(card => {
      const label = card.querySelector('span')?.textContent?.trim() || '';
      const def = types.find(t => t.test.test(label));
      const rawAvailable = card.querySelector('strong')?.textContent?.trim() || '확인 필요';
      // 전기차 충전구역의 미확인 잔여면수는 층별 상세보기에서만 0면으로 표시합니다.
      const available = def?.name === '전기차 충전' && rawAvailable === '확인 필요' ? '0면' : rawAvailable;
      return {name: def?.name || label, sign: def?.sign || 'P', available};
    });
  }
  function listHTML(entries) {
    return `<div class="ssgp-floor-type-labels"><span>주차 유형</span><span>잔여면수</span></div><div class="ssgp-floor-type-list">${entries.map(t => `<div class="ssgp-floor-type-item"><span class="ssgp-floor-type-icon" aria-hidden="true">${esc(t.sign)}</span><span class="ssgp-floor-type-name">${esc(t.name)}</span><strong class="ssgp-floor-type-available">${esc(t.available)}</strong></div>`).join('')}</div>`;
  }
  function init() {
    if (document.getElementById('ssgpFloorDetailSheet')) return;
    const hero = document.querySelector('.status-hero');
    const progress = hero?.querySelector('.progress');
    const overallTypes = hero?.querySelector(':scope > .type-row');
    const floorTabs = document.getElementById('floorTabs');
    const floorPanels = document.getElementById('floorPanels');
    const floorSection = floorTabs?.closest('section');
    if (!hero || !progress || !overallTypes || !floorTabs || !floorPanels || !floorSection) return;
    hero.classList.add('ssgp-floor-details-enabled');
    floorSection.classList.add('ssgp-original-floor-hidden');
    const opener = document.createElement('button');
    opener.className = 'ssgp-floor-detail-open';
    opener.type = 'button';
    opener.setAttribute('aria-haspopup','dialog');
    opener.innerHTML = '<span>층별 상세보기</span><span aria-hidden="true">↗</span>';
    progress.insertAdjacentElement('afterend',opener);
    const overlay = document.createElement('div');
    overlay.id = 'ssgpFloorDetailSheet';
    overlay.className = 'ssgp-floor-sheet-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `<div class="ssgp-floor-sheet-backdrop" data-sheet-close></div><section class="ssgp-floor-sheet" role="dialog" aria-modal="true" aria-labelledby="ssgpFloorSheetTitle" tabindex="-1"><div class="ssgp-floor-sheet-grip"></div><div class="ssgp-floor-sheet-head"><h2 id="ssgpFloorSheetTitle">층별 상세보기</h2><button type="button" class="ssgp-floor-sheet-close" data-sheet-close aria-label="닫기">×</button></div><div class="ssgp-floor-sheet-content"><div class="ssgp-floor-sheet-tabs" role="tablist" aria-label="주차장 층 선택"></div><div class="ssgp-floor-sheet-details" aria-live="polite"></div><p class="ssgp-floor-sheet-note">표시된 잔여면수와 혼잡도는 프로젝트 시뮬레이션 데이터입니다. 경차 잔여면수도 시연용으로 설정된 값입니다.</p></div></section>`;
    document.body.appendChild(overlay);
    const tabBar = overlay.querySelector('.ssgp-floor-sheet-tabs');
    const detail = overlay.querySelector('.ssgp-floor-sheet-details');
    const dialog = overlay.querySelector('.ssgp-floor-sheet');
    let active = 'overall', lastFocus, oldOverflow = '';
    function selectedFloor(id) {
      active = id;
      tabBar.querySelectorAll('[data-sheet-floor]').forEach(b => {
        const on = b.dataset.sheetFloor === id;
        b.classList.toggle('active',on);
        b.setAttribute('aria-selected',String(on));
      });
      if (id === 'overall') {
        const available = document.getElementById('overallAvailable')?.textContent?.trim() || '--면';
        const total = document.getElementById('overallTotal')?.textContent?.trim() || '--면';
        const rate = document.getElementById('overallRate')?.textContent?.trim() || '--%';
        const rows = parseTypes(overallTypes);
        detail.innerHTML = `<div class="ssgp-floor-overview"><div><div class="ssgp-floor-overview-title">전체 주차장</div><div class="ssgp-floor-overview-sub">점유율 ${esc(rate)}</div></div><div class="ssgp-floor-overview-count">${esc(available)} <small>/ ${esc(total)}</small></div></div>${listHTML(rows)}`;
      } else {
        const panel = Array.from(floorPanels.querySelectorAll('[data-floor-panel]')).find(p => p.dataset.floorPanel === id);
        const btn = Array.from(floorTabs.querySelectorAll('[data-floor]')).find(b => b.dataset.floor === id);
        // Keep existing floor button's selection behavior intact.
        btn?.click();
        const label = btn?.textContent.trim() || id;
        const summary = panel?.querySelector('.floor-summary p')?.textContent || '';
        const found = summary.match(/잔여\s*([\d,]+)\s*면/);
        const rate = summary.match(/점유율\s*(\d+%)/);
        const rows = parseTypes(panel?.querySelector('.type-row'));
        detail.innerHTML = `<div class="ssgp-floor-overview"><div><div class="ssgp-floor-overview-title">${esc(label)}</div><div class="ssgp-floor-overview-sub">점유율 ${esc(rate?.[1] || '확인 필요')}</div></div><div class="ssgp-floor-overview-count">${esc(found ? found[1]+'면' : '확인 필요')} <small>잔여</small></div></div>${listHTML(rows)}`;
      }
    }
    function showTabs() {
      const data = [{id:'overall', label:'전체'}, ...Array.from(floorTabs.querySelectorAll('[data-floor]'), b => ({id:b.dataset.floor, label:b.textContent.trim()}))];
      if (!data.some(t=>t.id===active)) active='overall';
      tabBar.replaceChildren();
      data.forEach(t=>{
        const b = document.createElement('button');
        b.type='button'; b.className='ssgp-floor-sheet-tab'; b.dataset.sheetFloor=t.id;
        b.textContent=t.label; b.setAttribute('role','tab');
        b.addEventListener('click',()=>selectedFloor(t.id)); tabBar.appendChild(b);
      });
      selectedFloor(active);
    }
    function open() {lastFocus=document.activeElement; oldOverflow=document.body.style.overflow; active='overall'; overlay.hidden=false; showTabs(); document.body.style.overflow='hidden';dialog.focus();}
    function close() {overlay.hidden=true;document.body.style.overflow=oldOverflow;lastFocus?.focus?.();}
    opener.addEventListener('click',open);
    overlay.querySelectorAll('[data-sheet-close]').forEach(el=>el.addEventListener('click',close));
    document.addEventListener('keydown',ev=>{
      if (overlay.hidden) return;
      if (ev.key==='Escape') {ev.preventDefault();close();}
      if (ev.key==='Tab') {
        const f=Array.from(dialog.querySelectorAll('button:not([disabled])')).filter(el=>el.getClientRects().length);
        if (f.length && ev.shiftKey && document.activeElement===f[0]) {ev.preventDefault();f[f.length-1].focus();}
        else if (f.length && !ev.shiftKey && document.activeElement===f[f.length-1]) {ev.preventDefault();f[0].focus();}
      }
    });
    const observer=new MutationObserver(()=>{if (!overlay.hidden) {active='overall';showTabs();}});
    observer.observe(floorTabs,{childList:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
