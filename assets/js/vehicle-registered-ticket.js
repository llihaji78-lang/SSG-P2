/* SSG-P registered vehicle and demo-ticket UI, additive patch.
   Load after main.js, vehicle-ui-patch.js and vehicle-fix-hanam-dialog.js.
   Existing parking data, map, form persistence, and pins are untouched. */
(() => {
  'use strict';
  const page = document.body.dataset.page;
  if (page !== 'vehicle' && page !== 'register') return;

  const styles = `
    body[data-page="vehicle"] .ssgp-reg-promo.ssgp-registered-plate-section { background:#fff; }
    body[data-page="vehicle"] .ssgp-registered-plate-section .ssgp-reg-promo-top { display:grid; }
    body[data-page="vehicle"] .ssgp-plate-group {margin-top:22px;width:100%;}
    body[data-page="vehicle"] .ssgp-plate-face {
      position:relative;display:flex;align-items:center;justify-content:center;
      width:100%;min-height:56px;padding:10px 16px;border-radius:13px;background:#373737;
      color:#fff;text-align:center;font-size:clamp(22px,4vw,30px);font-weight:850;
      letter-spacing:1px;font-variant-numeric:tabular-nums;
    }
    body[data-page="vehicle"] .ssgp-plate-face::before,
    body[data-page="vehicle"] .ssgp-plate-face::after {
      content:"";position:absolute;width:6px;height:6px;border:1.5px solid #646464;
      border-radius:50%;top:11px;
    }
    body[data-page="vehicle"] .ssgp-plate-face::before {left:20px;}
    body[data-page="vehicle"] .ssgp-plate-face::after {right:20px;}
    body[data-page="vehicle"] .ssgp-plate-actions {
      display:flex;justify-content:flex-end;align-items:center;gap:12px;margin:10px 0 0;
    }
    body[data-page="vehicle"] .ssgp-plate-actions a,
    body[data-page="vehicle"] .ssgp-plate-actions button {
      border:0;background:transparent;color:#555;font:inherit;font-size:14px;
      font-weight:600;padding:8px 4px;cursor:pointer;text-decoration:underline;
      text-underline-offset:3px;
    }
    body[data-page="vehicle"] .ssgp-plate-actions .ssgp-action-separator {color:#ddd;}
    body[data-page="vehicle"] .ssgp-registered-ticket-section {padding:20px 18px 24px;background:#fff;}
    body[data-page="vehicle"] .ssgp-registered-ticket-section h2 {
      font-size:20px;line-height:1.3;margin:0 0 16px;font-weight:850;
    }
    body[data-page="vehicle"] .ssgp-ticket-preview {
      display:block;width:100%;padding:0;background:none;border:0;text-align:left;cursor:pointer;
    }
    body[data-page="vehicle"] .ssgp-ticket-preview:focus-visible {
      outline:3px solid #016922;outline-offset:4px;border-radius:20px;
    }
    .ssgp-ticket-card {
      position:relative;display:flex;flex-direction:column;justify-content:space-between;
      min-height:190px;padding:23px 23px 26px;background:#fff;
      border:2px solid #e8e8e8;border-radius:24px;overflow:hidden;
    }
    .ssgp-ticket-card:before,.ssgp-ticket-card:after {
      content:"";position:absolute;width:22px;height:28px;border:2px solid #e8e8e8;
      background:#fff;border-radius:50%;top:60%;transform:translateY(-50%);
    }
    .ssgp-ticket-card:before {left:-15px;}
    .ssgp-ticket-card:after {right:-15px;}
    .ssgp-ticket-card-top {display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
    .ssgp-ticket-badge {
      display:inline-flex;align-items:center;justify-content:center;
      padding:4px 12px;border-radius:100px;background:#f72b2b;color:white;
      font-size:15px;font-weight:850;line-height:1.3;
    }
    .ssgp-ticket-mark {display:grid;place-items:center;width:49px;height:49px;
      border-radius:50%;background:#f5f5f5;color:#242424;font-size:23px;font-weight:850;}
    .ssgp-ticket-card-body strong {display:block;font-size:clamp(26px,5vw,36px);font-weight:700;color:#292929;line-height:1.2;}
    .ssgp-ticket-card-body small {display:block;margin-top:8px;color:#888;font-size:14px;}
    .ssgp-ticket-preview-hint {margin:10px 0 0;color:#777;font-size:12px;text-align:center;}
    .ssgp-ticket-backdrop {position:fixed;top:0;bottom:0;left:50%;transform:translateX(-50%);width:min(760px,100%);max-width:100%;z-index:11000;background:#fff;display:flex;flex-direction:column;box-shadow:0 0 0 100vmax #ffffff;}
    .ssgp-ticket-backdrop[hidden] {display:none!important;}
    .ssgp-ticket-dialog-top {
      display:grid;grid-template-columns:44px 1fr 44px;align-items:center;
      padding:11px 15px;border-bottom:1px solid #eee;background:#fff;flex:0 0 auto;
    }
    .ssgp-ticket-dialog-top h2 {margin:0;text-align:center;font-size:19px;font-weight:850;}
    .ssgp-ticket-dialog-close {grid-column:3;border:1px solid #e9e7e4;background:#fff;
      border-radius:12px;font-size:26px;width:42px;height:42px;cursor:pointer;}
    .ssgp-ticket-dialog-body {overflow:auto;flex:1;min-height:0;width:100%;max-width:100%;box-sizing:border-box;padding:22px clamp(16px,4vw,28px) 60px;color:#333;}
    .ssgp-ticket-detail-heading {display:flex;flex-direction:column;align-items:center;text-align:center;gap:20px;padding:18px 0 32px;}
    .ssgp-ticket-detail-heading .ssgp-ticket-badge {font-size:14px;}
    .ssgp-ticket-detail-heading strong {font-size:34px;font-weight:500;line-height:1.3;}
    .ssgp-ticket-detail-heading p {margin:0;color:#888;font-size:16px;}
    .ssgp-ticket-use {
      display:block;width:100%;padding:18px;background:#016922;border:0;border-radius:11px;
      font-size:19px;font-weight:850;color:#fff;cursor:not-allowed;opacity:1;
    }
    .ssgp-ticket-use:disabled {background:#016922;color:#fff;opacity:1;}
    .ssgp-ticket-notice {margin:14px 0 34px;font-size:13px;line-height:1.6;color:#888;}
    .ssgp-ticket-detail-info {border-top:8px solid #f6f6f6;padding-top:28px;}
    .ssgp-ticket-detail-info section {margin:0 0 33px;}
    .ssgp-ticket-detail-info h3 {font-size:17px;font-weight:800;margin:0 0 15px;}
    .ssgp-ticket-detail-info p {margin:0;color:#555;font-size:15px;line-height:1.8;}
    .ssgp-vehicle-modal {position:fixed;inset:0;z-index:12000;background:rgba(24,32,26,.46);
      display:flex;align-items:center;justify-content:center;padding:20px;}
    .ssgp-vehicle-modal[hidden] {display:none!important;}
    .ssgp-vehicle-modal-panel {background:#fff;border-radius:22px;padding:26px 22px 20px;
      width:min(100%,380px);text-align:center;box-shadow:0 20px 65px rgba(0,0,0,.2);}
    .ssgp-vehicle-modal-icon {display:grid;place-items:center;width:48px;height:48px;margin:0 auto 13px;
      border-radius:50%;background:#edf7f0;color:#016922;}
    .ssgp-vehicle-modal-panel h2 {font-size:19px;line-height:1.4;margin:0 0 9px;}
    .ssgp-vehicle-modal-panel p {font-size:13px;color:#74726f;line-height:1.65;margin:0 0 22px;}
    .ssgp-vehicle-modal-buttons {display:grid;grid-template-columns:1fr 1fr;gap:10px;}
    .ssgp-vehicle-modal-buttons button {min-height:46px;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;}
    .ssgp-vehicle-modal-cancel {background:#fff;border:1px solid #dfe5df;color:#231916;}
    .ssgp-vehicle-modal-confirm {background:#016922;border:1px solid #016922;color:#fff;}
    @media(max-width:430px) {
      body[data-page="vehicle"] .ssgp-plate-face {min-height:52px;font-size:24px;padding:9px 12px;}
      body[data-page="vehicle"] .ssgp-registered-ticket-section {padding-top:12px;}
      .ssgp-ticket-card {min-height:175px;padding:18px 20px 23px;}
      .ssgp-ticket-dialog-body {padding:20px 22px 55px;}
    }
  `;

  function styleOnce() {
    if (document.getElementById('ssgpRegisteredTicketStyles')) return;
    const s = document.createElement('style');
    s.id = 'ssgpRegisteredTicketStyles';
    s.textContent = styles;
    document.head.appendChild(s);
  }

  function registration() {
    try {
      const stored = JSON.parse(localStorage.getItem('ssgp_vehicle') || 'null');
      return stored && typeof stored === 'object' && stored.middle && stored.back ? stored : null;
    } catch { return null; }
  }
  function maskedPlate(data) {
    const middle = String(data.middle || '').replace(/[^가-힣A-Za-z]/g, '').slice(0, 1);
    const suffix = String(data.back || '').replace(/[^0-9]/g, '');
    return `***${middle || '가'}${suffix.slice(0, 2).padEnd(2, '*')}**`;
  }
  let deleteLayer = null;
  function deleteDialog() {
    let priorFocus = document.activeElement;
    if (!deleteLayer) {
      deleteLayer = document.createElement('div');
      deleteLayer.className = 'ssgp-vehicle-modal';
      deleteLayer.hidden = true;
      deleteLayer.innerHTML = `
        <section class="ssgp-vehicle-modal-panel" role="dialog" aria-modal="true"
          aria-labelledby="ssgpVehDeleteTitle" aria-describedby="ssgpVehDeleteDesc">
          <div class="ssgp-vehicle-modal-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6"/></svg>
          </div>
          <h2 id="ssgpVehDeleteTitle">차량 등록을 해제할까요?</h2>
          <p id="ssgpVehDeleteDesc">등록한 차량번호가 삭제되고<br>차량 위치 정보가 초기화됩니다.</p>
          <div class="ssgp-vehicle-modal-buttons">
            <button type="button" class="ssgp-vehicle-modal-cancel">취소</button>
            <button type="button" class="ssgp-vehicle-modal-confirm">등록 해제</button>
          </div>
        </section>`;
      document.body.appendChild(deleteLayer);
      const close = () => { deleteLayer.hidden = true; document.body.style.overflow = ''; priorFocus?.focus?.(); };
      deleteLayer.querySelector('.ssgp-vehicle-modal-cancel').addEventListener('click', close);
      deleteLayer.querySelector('.ssgp-vehicle-modal-confirm').addEventListener('click', () => {
        localStorage.removeItem('ssgp_vehicle');
        window.location.reload();
      });
      deleteLayer.addEventListener('click', ev => {if (ev.target === deleteLayer) close();});
      deleteLayer.addEventListener('keydown', ev => {
        if (ev.key === 'Escape') {ev.preventDefault();close();}
        if (ev.key === 'Tab') {
          const first = deleteLayer.querySelector('.ssgp-vehicle-modal-cancel');
          const last = deleteLayer.querySelector('.ssgp-vehicle-modal-confirm');
          if (ev.shiftKey && document.activeElement === first) {ev.preventDefault();last.focus();}
          else if (!ev.shiftKey && document.activeElement === last) {ev.preventDefault();first.focus();}
        }
      });
    }
    deleteLayer.hidden = false;
    document.body.style.overflow = 'hidden';
    deleteLayer.querySelector('.ssgp-vehicle-modal-cancel').focus();
  }

  function ticketDialog() {
    const existing = document.getElementById('ssgpTicketDetail');
    if (existing) {
      existing.hidden = false;
      document.body.style.overflow = 'hidden';
      existing.querySelector('.ssgp-ticket-dialog-close').focus();
      return;
    }
    const layer = document.createElement('div');
    layer.id = 'ssgpTicketDetail';
    layer.className = 'ssgp-ticket-backdrop';
    layer.setAttribute('role','dialog');
    layer.setAttribute('aria-modal','true');
    layer.setAttribute('aria-label','나의 주차권 상세 화면');
    layer.innerHTML = `
      <div class="ssgp-ticket-dialog-top"><span></span><h2>나의 주차권</h2>
        <button type="button" class="ssgp-ticket-dialog-close" aria-label="닫기">×</button></div>
      <div class="ssgp-ticket-dialog-body">
        <div class="ssgp-ticket-detail-heading">
          <span class="ssgp-ticket-badge">D-23</span>
          <strong>2시간 무료</strong>
          <p>11월 이마트앱 고객 전용 주차권</p>
        </div>
        <button type="button" class="ssgp-ticket-use" disabled aria-disabled="true">주차권 사용하기</button>
        <p class="ssgp-ticket-notice">※ 사용완료 처리된 주차권은 재발행이나 복원이 불가합니다</p>
        <div class="ssgp-ticket-detail-info">
          <section><h3>사용기간</h3><p>11/1(일)~11/30(월)</p></section>
          <section><h3>사용조건</h3><p>출차 5분 전에 사용</p></section>
          <section><h3>사용가능 점포</h3><p>이마트 및 이마트 트레이더스 대상점포<br>※ 아래 꼭 확인하세요 참조</p></section>
        </div>
      </div>`;
    document.body.appendChild(layer);
    const close = () => { layer.hidden = true; document.body.style.overflow = ''; };
    layer.querySelector('.ssgp-ticket-dialog-close').addEventListener('click',close);
    layer.addEventListener('keydown', e => { if(e.key === 'Escape') {e.preventDefault();close();} });
    document.body.style.overflow = 'hidden';
    layer.querySelector('.ssgp-ticket-dialog-close').focus();
  }


  function vehiclePage() {
    const vehicle = registration();
    if (!vehicle) return;
    const intro = document.querySelector('.vehicle-intro');
    if (!intro || intro.dataset.ssgpRegisteredUi === 'v2') return;
    intro.dataset.ssgpRegisteredUi = 'v2';
    intro.classList.add('ssgp-registered-plate-section');

    // Keep the existing headline, parking-gate illustration and supporting text.
    const oldRegister = intro.querySelector('.ssgp-reg-action, a[href*="vehicle-register"]');
    if (oldRegister) oldRegister.remove();

    const plateGroup = document.createElement('div');
    plateGroup.className = 'ssgp-plate-group';
    const plate = document.createElement('div');
    plate.className = 'ssgp-plate-face';
    plate.textContent = maskedPlate(vehicle);
    plate.setAttribute('aria-label','등록된 차량번호 일부 가림 표시');
    const actions = document.createElement('div');
    actions.className = 'ssgp-plate-actions';
    const edit = document.createElement('a');
    edit.href = 'vehicle-register.html?edit=1';
    edit.textContent = '수정';
    const separator = document.createElement('span');
    separator.className = 'ssgp-action-separator';
    separator.textContent = '|';
    separator.setAttribute('aria-hidden','true');
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '삭제';
    del.addEventListener('click',deleteDialog);
    actions.append(edit,separator,del);
    plateGroup.append(plate,actions);
    intro.appendChild(plateGroup);

    const oldDelete = document.getElementById('deleteVehicleBtn');
    if (oldDelete) oldDelete.hidden = true;

    let ticket = document.getElementById('ssgpRegisteredTicket');
    if (!ticket) {
      ticket = document.createElement('section');
      ticket.id = 'ssgpRegisteredTicket';
      ticket.className = 'ssgp-registered-ticket-section';
      ticket.innerHTML = `<h2>나의 주차권</h2>
        <button type="button" class="ssgp-ticket-preview" aria-label="2시간 주차권 상세 보기">
          <span class="ssgp-ticket-card">
            <span class="ssgp-ticket-card-top"><span class="ssgp-ticket-badge">D-23</span>
              <span class="ssgp-ticket-mark" aria-hidden="true">P</span></span>
            <span class="ssgp-ticket-card-body"><strong>2시간 무료</strong>
              <small>11월 이마트앱 고객 전용 주차권</small></span>
          </span>
        </button>
        <p class="ssgp-ticket-preview-hint">주차권을 누르면 상세 안내를 확인할 수 있습니다.</p>`;
      ticket.querySelector('button').addEventListener('click',ticketDialog);
      intro.insertAdjacentElement('afterend',ticket);
    }
  }


  function registerPage() {
    const q = new URLSearchParams(window.location.search);
    if (q.get('edit') !== '1') return;
    const data = registration();
    if (!data) return;
    const form = document.getElementById('vehicleForm');
    if (!form) return;
    const heading = document.querySelector('.modal-top h1');
    if (heading) heading.textContent = '차량번호 수정';
    const region = form.querySelector('[name="region"]');
    if (region) {
      region.value = data.region || '지역 없음';
      region.dispatchEvent(new Event('change', {bubbles:true}));
      const trigger = document.querySelector('.region-picker-trigger');
      if (trigger) {
        const label = trigger.querySelector('span:first-child');
        if (label) label.textContent = region.value;
      }
    }
    for (const part of ['front','middle','back']) {
      const input = form.querySelector(`[name="${part}"]`);
      if (input) input.value = data[part] || '';
    }
    const submit = form.querySelector('button[type="submit"]');
    if (submit) submit.textContent = '차량번호 수정 완료';
  }

  function start() {
    styleOnce();
    if (page === 'vehicle') vehiclePage();
    if (page === 'register') registerPage();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
