/* SSG-P vehicle UI v4: presentation only. Keep main.js and existing page functionality. */
(() => {
  'use strict';
  const page = document.body.dataset.page;
  if (page !== 'vehicle' && page !== 'register') return;

  const css = `
    /* Vehicle registration promotion (prototype, no actual ticket issuance) */
    body[data-page="vehicle"] .ssgp-reg-promo {
      padding: 28px 22px 24px; border: 1px solid #eeeae3; border-radius: 22px;
      background: #fff; text-align: left; box-shadow: 0 8px 24px rgba(0,0,0,.035);
    }
    body[data-page="vehicle"] .ssgp-reg-promo-top {
      display: grid; grid-template-columns: minmax(0,1fr) 116px; align-items: center;
      column-gap: 10px; min-height: 172px;
    }
    body[data-page="vehicle"] .ssgp-reg-promo h2 {
      font-size: clamp(19px, 4vw, 28px); line-height: 1.42; letter-spacing: -.85px;
      margin: 0 0 14px; font-weight: 850; color: #292929;
    }
    body[data-page="vehicle"] .ssgp-reg-promo p {
      color: #777; line-height: 1.5; font-size: clamp(12px, 2.7vw, 16px); margin: 0;
    }
    body[data-page="vehicle"] .ssgp-reg-promo-icon { width: 116px; max-width: 100%; height: auto; }
    body[data-page="vehicle"] .ssgp-reg-promo .ssgp-reg-action {
      display: flex; align-items: center; justify-content: center; width: 100%;
      margin-top: 22px; min-height: 56px; border-radius: 13px; padding: 13px 16px;
      color: #fff; font-size: 18px; font-weight: 850; background: #016922;
      text-decoration: none; border: 0;
    }
    body[data-page="vehicle"] #noVehicleMsg.ssgp-empty-car {
      margin-top: 16px; padding: 23px 20px 18px; border-radius: 20px;
      border: 1px solid #e9e7e4; background: white; text-align: center;
    }
    body[data-page="vehicle"] #noVehicleMsg.ssgp-empty-car h3 {
      text-align: left; font-size: 19px; font-weight: 850; margin: 0 0 10px;
    }
    body[data-page="vehicle"] .ssgp-empty-rule { height: 1px; background: #333; margin: 14px 0 22px; opacity:.45; }
    body[data-page="vehicle"] .ssgp-empty-center { padding: 26px 8px 30px; color:#8b8b8b; }
    body[data-page="vehicle"] .ssgp-empty-center svg { display:block; margin:0 auto 15px; }
    body[data-page="vehicle"] .ssgp-empty-center strong { display:block; font-size: 18px; font-weight: 750; color:#777; }
    body[data-page="vehicle"] .ssgp-empty-center p { margin: 10px auto 0; max-width:460px; font-size: 14px; line-height:1.65; }
    body[data-page="vehicle"] .ssgp-empty-perk { border-top: 1px solid #e4e4e4; padding-top: 18px; text-align:left; }
    body[data-page="vehicle"] .ssgp-empty-perk strong { display:block; color:#276b38; font-size:15px; margin-bottom:6px; }
    body[data-page="vehicle"] .ssgp-empty-perk p { font-size:12px; line-height:1.65; color:#888; margin:0; }
    body[data-page="vehicle"] #carPin.ssgp-car-pin {
      width: 26px !important; height: 32px !important; min-width:26px !important;
      min-height:32px !important; max-width:26px !important; max-height:32px !important;
      padding:0 !important; background:transparent !important; border:0 !important;
      border-radius:0 !important; box-shadow:none !important; display:grid; place-items:center;
      transform:translate(-50%,-100%) !important; pointer-events:none; z-index:2;
    }
    body[data-page="vehicle"] #carPin.ssgp-car-pin svg {
      width:26px !important; height:32px !important; display:block !important;
      overflow:visible; filter:drop-shadow(0 1px 2px rgba(0,0,0,.18));
    }
    body[data-page="vehicle"] .ssgp-vehicle-heading-row {
      display:flex; justify-content:space-between; align-items:flex-start;
      gap:12px; flex-wrap:wrap;
    }
    body[data-page="vehicle"] .ssgp-vehicle-heading-row > div:first-child {flex:1 1 180px; min-width:0;}
    body[data-page="vehicle"] .ssgp-vehicle-delete {
      flex:0 0 auto; margin:0 !important; white-space:nowrap;
      min-height:38px; padding:8px 11px; border:1px solid #dfe6df;
      border-radius:11px; background:#fff; color:#016922; font-weight:800; font-size:12px;
    }
    body[data-page="vehicle"] .ssgp-vehicle-demo-note { margin:9px 0 0; color:#74726f; font-size:11px; line-height:1.55; }
    /* Hide only native select when a replacement has actually been generated. */
    body[data-page="register"] #vehicleForm select#region.region-native-select:has(+ .region-picker) {
      position:absolute !important; width:1px !important; height:1px !important;
      overflow:hidden !important; clip-path:inset(50%) !important;
      opacity:0 !important; pointer-events:none !important;
    }
    body[data-page="register"] .region-picker {
      position:relative; width:100%; max-width:100%; display:block;
      font-size:15px; z-index:10;
    }
    body[data-page="register"] .region-picker-trigger {
      display:flex; align-items:center; justify-content:space-between; gap:10px;
      width:100%; min-height:50px; padding:10px 15px;
      background:#fff; color:#231916; border:1px solid #dcdad6;
      border-radius:14px; font-size:15px; font-weight:600; text-align:left;
    }
    body[data-page="register"] .region-picker-trigger:focus-visible {
      outline:3px solid rgba(1,105,34,.22); outline-offset:2px;
    }
    body[data-page="register"] .region-picker-arrow { color:#666; font-size:16px; }
    body[data-page="register"] .region-picker-menu {
      position:absolute; left:0; right:0; top:calc(100% + 5px); z-index:110;
      max-height:230px; overflow-y:auto; padding:5px;
      border:1px solid #dededb; border-radius:13px; background:#fff;
      box-shadow:0 14px 28px rgba(0,0,0,.13);
    }
    body[data-page="register"] .region-picker-menu[hidden] { display:none !important; }
    body[data-page="register"] .region-picker-option {
      display:block; width:100%; padding:11px 13px; border:0; border-radius:8px;
      background:#fff; color:#231916; font-size:14px; text-align:left;
    }
    body[data-page="register"] .region-picker-option:hover,
    body[data-page="register"] .region-picker-option:focus-visible {background:#edf7f0; outline:none;}
    body[data-page="vehicle"] .ssgp-reg-promo-icon img {
      display:block; width:100%; height:auto; object-fit:contain;
    }
    body[data-page="vehicle"] .ssgp-reg-promo .ssgp-reg-action:hover {
      background:#075f28;
    }
    body[data-page="vehicle"] .ssgp-parking-ticket-visual {
      display:block; width:100%; max-width:470px; height:auto;
      margin:0 auto; object-fit:contain;
    }
    body[data-page="vehicle"] .ssgp-empty-perk {
      text-align:center; padding-top:16px;
    }
    body[data-page="vehicle"] .ssgp-parking-ticket-disclaimer {
      text-align:center; margin:12px auto 0; max-width:480px;
      color:#777; font-size:11px; line-height:1.6;
    }
    @media(max-width:430px) {
      body[data-page="vehicle"] .ssgp-reg-promo {padding:22px 17px;}
      body[data-page="vehicle"] .ssgp-reg-promo-top {grid-template-columns:minmax(0,1fr) 85px; min-height:158px;}
      body[data-page="vehicle"] .ssgp-reg-promo-icon {width:85px;}
      body[data-page="vehicle"] .ssgp-reg-promo .ssgp-reg-action {font-size:16px; min-height:52px;}
      body[data-page="vehicle"] #carPin.ssgp-car-pin {width:23px !important;height:29px !important;min-width:23px !important;min-height:29px !important;max-width:23px !important;max-height:29px !important;}
      body[data-page="vehicle"] #carPin.ssgp-car-pin svg {width:23px !important;height:29px !important;}
      body[data-page="vehicle"] .ssgp-vehicle-heading-row > div:first-child {flex-basis:160px;}
    }
  `;
  function addStyle() {
    if (document.getElementById('ssgpVehicleUiPatchStyle')) {
      document.getElementById('ssgpVehicleUiPatchStyle').textContent = css;
    } else {
      const style = document.createElement('style');
      style.id = 'ssgpVehicleUiPatchStyle'; style.textContent = css;
      document.head.appendChild(style);
    }
  }
  function vehiclePage() {
    const intro = document.querySelector('.vehicle-intro');
    const locator = document.querySelector('#vehicleLocator');
    if (!intro || !locator) return;
    intro.classList.add('ssgp-reg-promo');
    // Preserve the existing registration link, so destination and event flow stay intact.
    let link = intro.querySelector('a[href*="vehicle-register"]');
    if (!link) return;
    link.textContent = '차량번호 등록하기';
    link.className = 'ssgp-reg-action';
    intro.replaceChildren();
    const hero = document.createElement('div');
    hero.className = 'ssgp-reg-promo-top';
    const content = document.createElement('div');
    const headline = document.createElement('h2');
    headline.innerHTML = '쇼핑하고 결제할 때<br>신세계포인트 적립하면<br>주차비 자동정산!';
    const sub = document.createElement('p');
    sub.textContent = '차량번호 등록하고 빠르게 출차하세요';
    content.append(headline, sub);
    const image = document.createElement('div');
    image.className = 'ssgp-reg-promo-icon';
    const parkingIllustration = document.createElement('img');
    parkingIllustration.src = 'assets/images/vehicle-parking-gate.jpg';
    parkingIllustration.alt = '주차 차단기와 차량 그림';
    parkingIllustration.loading = 'lazy';
    parkingIllustration.decoding = 'async';
    image.appendChild(parkingIllustration);
    hero.append(content,image);
    intro.append(hero,link);

    intro.insertAdjacentElement('afterend', locator);
    const empty = document.querySelector('#noVehicleMsg');
    if (empty) {
      locator.insertAdjacentElement('afterend', empty);
      empty.classList.add('ssgp-empty-car');
      empty.innerHTML = `<h3>실시간 차량 확인</h3><div class="ssgp-empty-rule"></div>
        <div class="ssgp-empty-center">
          <svg viewBox="0 0 60 50" width="54" height="45" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 18L18 8h24l7 10 4 7v14H7V25l5-7Z" fill="#e1e1e1"/><rect x="13" y="20" width="35" height="15" rx="4" fill="#dedede"/><circle cx="16" cy="30" r="3.4" fill="#fff"/><circle cx="44" cy="30" r="3.4" fill="#fff"/><path d="M15 39v5M46 39v5" stroke="#e1e1e1" stroke-width="5" stroke-linecap="round"/>
          </svg>
          <strong>등록된 차량이 없습니다</strong>
          <p>※ 차량번호를 등록하면 실시간 차량 확인 및 무료주차 가능 시간을 확인할 수 있습니다.</p>
        </div>
        <div class="ssgp-empty-perk">
          <img class="ssgp-parking-ticket-visual" src="assets/images/vehicle-parking-ticket.jpg" alt="차량 번호 등록 시 2시간 주차권 증정. 발급된 무료 주차권은 주차 메뉴의 나의 주차권에서 확인 가능하다는 안내 이미지" loading="lazy" decoding="async">
          
        </div>`;
    }
    const pin = document.querySelector('#carPin');
    if (pin) {
      pin.classList.add('ssgp-car-pin');
      pin.innerHTML = `<svg viewBox="0 0 24 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 1.7C6.2 1.7 1.5 6.4 1.5 12.2c0 7.2 10.5 16.1 10.5 16.1s10.5-8.9 10.5-16.1C22.5 6.4 17.8 1.7 12 1.7Z" fill="#fff" stroke="#016922" stroke-width="2.4" stroke-linejoin="round"/><circle cx="12" cy="12" r="4.1" fill="none" stroke="#016922" stroke-width="2.4"/></svg>`;
      pin.setAttribute('aria-label', '내 차량 위치 (시연용 K12 구역)');
    }
    const store = localStorage.getItem('ssgp_store') || 'wolgye';
    const spot = document.querySelector('#selectedSpotName');
    if (spot) {
      spot.textContent = `${store === 'wolgye' ? '4층' : '지하 2층'} · K12`;
      spot.title = 'K12는 시연용으로 지정한 구역이며 실제 주차면 번호와 일치하지 않을 수 있습니다.';
      const summary = spot.closest('.vehicle-summary');
      if (summary && !document.getElementById('ssgpVehicleDemoNote')) {
        const note = document.createElement('p');
        note.id = 'ssgpVehicleDemoNote'; note.className = 'ssgp-vehicle-demo-note';
        note.textContent = '※ K12는 시연용으로 지정한 번호이며 실제 도면의 주차면 번호와 일치하지 않을 수 있습니다.';
        summary.insertAdjacentElement('afterend', note);
      }
    }
    const heading = locator.querySelector('.section-head');
    if (heading) {
      heading.classList.add('ssgp-vehicle-heading-row');
      let del = document.getElementById('deleteVehicleBtn');
      if (!del) {
        del = document.createElement('button');
        del.type = 'button'; del.id = 'deleteVehicleBtn';
        del.textContent = '차량 등록 해제';
        del.hidden = !localStorage.getItem('ssgp_vehicle');
        del.addEventListener('click', () => {
          if (!window.confirm('등록된 차량을 해제할까요?')) return;
          localStorage.removeItem('ssgp_vehicle'); window.location.reload();
        });
      }
      del.classList.add('ssgp-vehicle-delete'); heading.appendChild(del);
    }
  }
  function registerPage() {
    // main.js initializes the custom region picker before this enhancement executes.
    // Its original select remains the actual submitted form value.
    const select = document.querySelector('#vehicleForm select#region');
    if (!select) return;
    const picker = select.nextElementSibling;
    if (picker && picker.classList.contains('region-picker')) {
      select.classList.add('region-native-select');
      picker.querySelector('.region-picker-trigger')?.setAttribute('aria-label','지역 선택');
    }
  }
  function start() {
    addStyle();
    if (page === 'vehicle') vehiclePage();
    if (page === 'register') registerPage();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
