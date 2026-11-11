/* SSG-P vehicle page: simulated parking position / members-only reserved position.
   Add after all existing vehicle scripts. Does NOT alter existing vehicle map logic. */
(() => {
  'use strict';
  if (document.body.dataset.page !== 'vehicle') return;

  const BOOKING_KEY = 'ssgp_reservation_v1';
  const VEHICLE_KEY = 'ssgp_vehicle';
  // Support both current reservation.js numbering and reservations saved by earlier builds.
  // Do not rewrite stored bookings or change the unrelated ordinary parking-position map.
  const FLOOR_DATA = {
    wolgye: [
      {name:'３층',base:112,occupied:[1,3,5,8,11]}, // current reservation page (full-width ３)
      {name:'3층',base:112,occupied:[1,3,5,8,11]},  // normalized name
      {name:'4층',base:112,occupied:[1,3,5,8,11]}   // previous reservation page
    ],
    hanam: [
      {name:'지하 1층',base:212,occupied:[1,3,5,8,10]}, // current reservation page
      {name:'지하 2층',base:224,occupied:[0,2,4,7,11]}, // current reservation page
      {name:'지하 2층',base:212,occupied:[1,3,5,8,10]}, // previous reservation page
      {name:'지하 3층',base:224,occupied:[0,2,4,7,11]}  // previous reservation page
    ],
    ilsan: [{name:'지하 2층',base:312,occupied:[1,4,6,9]}]
  };
  const $ = id => document.getElementById(id);
  const jsonStorage = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
  const vehiclePlate = vehicle => vehicle && typeof vehicle === 'object'
    ? [vehicle.region,vehicle.front,vehicle.middle,vehicle.back].filter(Boolean).join('') : '';
  const maskPlate = vehicle => {
    const middle = String(vehicle.middle || '').replace(/[^가-힣A-Za-z]/g, '').slice(0,1);
    const suffix = String(vehicle.back || '').replace(/[^0-9]/g,'');
    return `***${middle || '가'}${suffix.slice(0,2).padEnd(2,'*')}**`;
  };
  const make = (tag, cls, content) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (content !== undefined) node.textContent = content;
    return node;
  };

  const POLICY_ITEMS = [
    '예약 가능한 주차 시간은 최대 3시간입니다.',
    '예약 입차 예정 시각부터 1시간이 경과할 때까지 입차하지 않으면 노쇼로 예약이 취소됩니다.',
    '예약 출차 시각을 초과하면 초과 시간 10분당 1,000원의 페널티가 부과됩니다.'
  ];
  const fmt = value => {
    if(!value)return '미설정 (기존 예약)';
    const d=new Date(value);if(!Number.isFinite(d.getTime()))return '일시 확인 필요';
    const pad=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  function appendPolicy(target) {
    const section=make('section','ssgp-reservation-policy');
    section.append(make('h3','','이용 안내'));
    const ul=make('ul','');
    POLICY_ITEMS.forEach(item=>ul.append(make('li','',item)));
    section.append(ul,make('p','ssgp-reservation-policy-demo','※ 시연용 안내입니다. 실제 입·출차 감지, 자동 취소 및 요금 부과와 연동되지 않습니다.'));
    target.append(section);
  }
  function buildMap(map, booking) {
    map.replaceChildren();
    const storeId = booking.storeId === 'guseong' ? 'ilsan' : booking.storeId;
    const floors = FLOOR_DATA[storeId] || [];
    const floor = floors.find(f => f.name === booking.floor && Number(booking.space) >= f.base && Number(booking.space) < f.base + 12);
    if (!floor) {
      const note = make('p','ssgp-reservation-empty-message','저장된 예약 주차면의 도면 정보를 확인할 수 없어요. 예약 페이지에서 예약 내용을 확인해 주세요.');
      map.replaceWith(note);
      return;
    }

    const lane = make('div', 'ssgp-reservation-lane');
    lane.setAttribute('aria-hidden','true');
    const arrow = '<svg viewBox="0 0 20 30" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 19 7-7 7 7M3 27l7-7 7 7"/></svg>';
    lane.innerHTML = `${arrow}${arrow}<span>주행로</span>${arrow}${arrow}`;
    map.append(lane);
    for(let i=0;i<12;i++) {
      const number=String(floor.base+i);
      const reserved=number===String(booking.space);
      const occupied=floor.occupied.includes(i) && !reserved;
      const spot=make('div','ssgp-reservation-slot'+(reserved?' is-reserved':'')+(occupied?' is-occupied':''));
      spot.style.gridColumn=String(i%2===0?1:3);
      spot.style.gridRow=String(Math.floor(i/2)+1);
      if(reserved){
        spot.setAttribute('aria-label', `${number}번 예약됨`);
        spot.append(make('strong','ssgp-reservation-slot-number',number),make('span','ssgp-reservation-slot-tag','예약됨'));
      } else if(occupied){
        spot.setAttribute('aria-label', `${number}번 주차 중 (시연용)`);
        spot.append(
          make('strong','ssgp-reservation-slot-number',number),
          make('span','ssgp-reservation-occupied-tag','주차 중')
        );
      } else {
        spot.setAttribute('aria-label',`${number}번 빈 주차면 (시연용)`);
        spot.append(make('strong','ssgp-reservation-slot-number',number),make('span','ssgp-reservation-slot-available','Available'));
      }
      map.append(spot);
    }
  }

  function buildReservationView(target) {
    target.replaceChildren();
    const vehicle=jsonStorage(VEHICLE_KEY);
    const booking=jsonStorage(BOOKING_KEY);
    const actualPlate=vehiclePlate(vehicle);
    if(!booking || !booking.storeId || !booking.floor || !booking.space || !booking.plate) {
      target.append(make('p','ssgp-reservation-empty-message','예약한 주차자리가 없어요.'));
      return;
    }
    if(!actualPlate || actualPlate !== booking.plate){
      target.append(make('p','ssgp-reservation-empty-message','현재 등록된 차량과 예약 차량번호가 일치하지 않아 예약 위치를 표시할 수 없어요.'));
      return;
    }
    const info=make('div','ssgp-reservation-info');
    const entries=[['예약 점포',booking.storeName || booking.storeId],['예약 층',booking.floor],['예약 자리',String(booking.space)],['차량번호',maskPlate(vehicle)],['예약 입차 일시',fmt(booking.entryAt)],['예약 출차 일시',fmt(booking.exitAt)]];
    for(const [label,value] of entries){
      const cell=make('div','ssgp-reservation-info-cell');
      cell.append(make('span','',label),make('strong','',value));info.append(cell);
    }
    target.append(info);
    const heading=make('div','ssgp-reservation-map-title');
    heading.append(make('h3','', '예약 주차면 도면'),make('span','',`${booking.floor} · 12면`));
    target.append(heading);
    target.append(make('p','ssgp-position-simulation-note','※ 아래 도면은 트레이더스 BIZ 회원 전용 고객의 주차 예약 위치 찾기 시뮬레이션입니다.'));
    const map=make('div','ssgp-reservation-floor-map');
    map.setAttribute('aria-label',`${booking.floor} 예약 주차면 위치`);
    target.append(map);buildMap(map,booking);
    appendPolicy(target);
  }

  function init(){
    const locator=$('vehicleLocator');
    const vehicle=jsonStorage(VEHICLE_KEY);
    if(!locator || !vehicle || !vehiclePlate(vehicle) || $('ssgpVehiclePositionTabs')) return;

    const heading=locator.querySelector('.section-head');
    const originalHeading=heading?.querySelector('h2');
    const title=originalHeading?.textContent || '내 차량 위치 확인';
    const tabs=make('div','ssgp-position-tabs');
    tabs.id='ssgpVehiclePositionTabs';
    tabs.setAttribute('role','tablist');
    tabs.setAttribute('aria-label','주차 위치 종류');

    const normalButton=make('button','ssgp-position-tab is-active','주차 위치');
    const bookingButton=make('button','ssgp-position-tab','예약 위치');
    for(const [button,id] of [[normalButton,'ssgpNormalParkingPanel'],[bookingButton,'ssgpReservedParkingPanel']]){
      button.type='button';button.setAttribute('role','tab');button.setAttribute('aria-controls',id);
    }
    normalButton.id='ssgpNormalParkingTab';
    bookingButton.id='ssgpReservedParkingTab';
    tabs.append(normalButton,bookingButton);

    const normal=make('div','ssgp-position-normal');normal.id='ssgpNormalParkingPanel';
    normal.setAttribute('role','tabpanel');normal.setAttribute('aria-labelledby',normalButton.id);
    const reserved=make('div','ssgp-position-reserved');reserved.id='ssgpReservedParkingPanel';
    reserved.setAttribute('role','tabpanel');reserved.setAttribute('aria-labelledby',bookingButton.id);
    reserved.hidden=true;

    // Relocate, never recreate, existing locator elements to preserve attached event listeners.
    const oldNodes=Array.from(locator.children).filter(child=>child!==heading);
    oldNodes.forEach(child=>normal.append(child));
    const note=make('p','ssgp-position-simulation-note','※ 아래 도면은 일반 고객의 주차 위치 찾기 시뮬레이션입니다. 실제 차량 위치 정보가 아니에요.');
    normal.insertBefore(note,normal.firstChild);

    // Display the selected store in the ordinary parking-position simulation.
    // This follows the store selector; it is not a verified parking record.
    const vehicleSummary = normal.querySelector('.vehicle-summary');
    const selectedStoreLabel = $('currentStoreName');
    if (vehicleSummary && selectedStoreLabel && !vehicleSummary.querySelector('#ssgpNormalParkingStore')) {
      const storeRow = make('div', 'ssgp-normal-parking-store');
      storeRow.id = 'ssgpNormalParkingStore';
      const storeValue = make('strong', '', '');
      storeRow.append(make('span', '', '주차 점포'), storeValue);
      const updateStore = () => {
        storeValue.textContent = selectedStoreLabel.textContent.trim() || '선택된 점포 없음';
      };
      updateStore();
      // Insert alongside the existing registration and parking-position details.
      vehicleSummary.insertBefore(storeRow, vehicleSummary.firstChild);
      new MutationObserver(updateStore).observe(selectedStoreLabel, {
        childList: true, characterData: true, subtree: true
      });
    }
    if(heading) heading.insertAdjacentElement('afterend',tabs);
    else locator.prepend(tabs);
    locator.append(normal,reserved);

    function activate(mode){
      const isReservation=mode==='reservation';
      normal.hidden=isReservation;reserved.hidden=!isReservation;
      normalButton.classList.toggle('is-active',!isReservation);
      bookingButton.classList.toggle('is-active',isReservation);
      normalButton.setAttribute('aria-selected',String(!isReservation));
      bookingButton.setAttribute('aria-selected',String(isReservation));
      normalButton.tabIndex=isReservation?-1:0;
      bookingButton.tabIndex=isReservation?0:-1;
      if(originalHeading) originalHeading.textContent=isReservation?'예약 주차면 확인':title;
      if(isReservation) buildReservationView(reserved);
    }
    normalButton.addEventListener('click',()=>activate('normal'));
    bookingButton.addEventListener('click',()=>activate('reservation'));
    tabs.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
      event.preventDefault();const next=event.key==='ArrowLeft'?normalButton:bookingButton;
      next.click();next.focus();
    });
    activate(new URLSearchParams(location.search).get('tab')==='reservation'?'reservation':'normal');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
