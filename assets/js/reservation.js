/* Independent SSG-P Traders members parking reservation demo. */
(() => {
  'use strict';
  const STORAGE_KEY = 'ssgp_reservation_v1';
  // 점포별 예약 도면(시연용). 하남점은 현재 전체 만차(100%) 설정에 맞춰 예약할 수 없습니다.
  // 실제 주차/예약 시스템과 연동된 정보가 아닙니다.
  const STORES = {
    wolgye: { name:'트레이더스 월계점', floors:[{name:'4층',base:112,occupied:[1,3,5,8,11]}] },
    hanam: { name:'트레이더스 하남점', full:true, floors:[
      {name:'지하 2층',base:212,occupied:[1,3,5,8,10]},
      {name:'지하 3층',base:224,occupied:[0,2,4,7,11]}
    ] },
    ilsan: { name:'트레이더스 일산점', floors:[{name:'지하 2층',base:312,occupied:[1,4,6,9]}] }
  };
  const $ = id => document.getElementById(id);
  const storeId = localStorage.getItem('ssgp_store') === 'guseong' ? 'ilsan' : (localStorage.getItem('ssgp_store') || 'wolgye');
  const store = STORES[storeId] || STORES.wolgye;
  let chosen = null, modalMode = null;
  let floorIndex = 0;
  const floorData = () => store.floors[floorIndex];
  const readRecord = () => { try { const r=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');return r && r.storeId && r.space && r.plate ? r : null; } catch {return null;} };
  const readVehicle = () => { try { const x=JSON.parse(localStorage.getItem('ssgp_vehicle')||'null'); return x && typeof x==='object' ? x : null; } catch {return null;} };
  const plateText = (vehicle) => vehicle ? [vehicle.region,vehicle.front,vehicle.middle,vehicle.back].filter(Boolean).join('') : '';
  // 내 차량 찾기(vehicle-registered-ticket.js)와 같은 차량번호 표시 규칙.
  // '지역12나7890' -> '***나78**' (저장되는 원본 차량번호는 변경하지 않음).
  const maskPlate = (value) => {
    const full = String(value || '');
    const middle = (full.match(/[가-힣A-Za-z]/g) || []).slice(-1)[0] || '가';
    const suffix = (full.match(/(\d+)$/) || [,''])[1];
    return `***${middle}${suffix.slice(0, 2).padEnd(2, '*')}**`;
  };
  const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const samePlate = (record, plate) => !record || record.plate === plate;
  function details(r) {
    const fields=[['▣','예약 점포',r.storeName],['▱','예약 층',r.floor],['Ⓟ','예약 자리',r.space],['▰','등록 차량번호',maskPlate(r.plate)]];
    return fields.map(([icon,label,value],i)=>`<div class="reservation-detail-row"><span class="reservation-detail-icon">${icon}</span><span>${esc(label)}</span><strong class="${i===2?'emphasis':''}">${esc(value)}</strong></div>`).join('');
  }
  function makeLane() {
    const lane=document.createElement('div');lane.className='reservation-parking-lane';lane.setAttribute('aria-hidden','true');
    lane.innerHTML=`<svg viewBox="0 0 20 30" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 19 7-7 7 7M3 27l7-7 7 7"/></svg><svg viewBox="0 0 20 30" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 19 7-7 7 7M3 27l7-7 7 7"/></svg><span>주행로</span><svg viewBox="0 0 20 30" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 19 7-7 7 7M3 27l7-7 7 7"/></svg><svg viewBox="0 0 20 30" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 19 7-7 7 7M3 27l7-7 7 7"/></svg>`;
    return lane;
  }
  function renderFloorPicker() {
    const picker=$('reservationFloorPicker');
    if(!picker)return;
    picker.replaceChildren();
    store.floors.forEach((floor,index)=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='reservation-floor-option'+(floorIndex===index?' active':'');
      button.textContent=floor.name;
      button.setAttribute('aria-pressed',String(floorIndex===index));
      // 한 층만 있는 점포도 같은 디자인으로 표시하되 선택은 고정.
      if(store.floors.length===1)button.disabled=true;
      else button.addEventListener('click',()=>{
        if(floorIndex===index)return;
        floorIndex=index;
        chosen=null;
        renderFloorPicker();
        renderMap();
      });
      picker.append(button);
    });
  }
  function renderMap() {
    const floor=floorData();
    const isFull=Boolean(store.full);
    const map=$('reservationMap');map.replaceChildren();
    $('reservationFloorLabel').textContent=isFull ? `${floor.name} · 만차 (12면)` : `${floor.name} · 시연용 도면 (12면)`;
    const current=readRecord();
    map.append(makeLane());
    for(let i=0;i<12;i++) {
      const space=String(floor.base+i);
      const occupied=isFull || floor.occupied.includes(i);
      const reserved=current && current.storeId===storeId && current.space===space;
      const b=document.createElement('button');b.type='button';b.className='reservation-space';
      b.style.gridColumn=String(i%2===0?1:3);b.style.gridRow=String(Math.floor(i/2)+1);
      if(occupied){b.classList.add('occupied');b.disabled=true;b.setAttribute('aria-label',`${space}번 주차 중`);b.innerHTML='<img class="yellow-car" src="assets/images/reservation-yellow-car.png" alt="주차 중인 노란 자동차">';}
      else if(reserved){b.classList.add('reserved');b.disabled=true;b.setAttribute('aria-label',`${space}번 예약됨`);b.innerHTML='<span class="reserved-label">예약됨</span>';}
      else {b.innerHTML=`<span class="reservation-slot-number">${esc(space)}</span><span class="reservation-slot-subtitle">Available</span>`;b.setAttribute('aria-label',`${space}번 예약 가능`);b.setAttribute('aria-pressed',String(chosen===space));if(chosen===space)b.classList.add('selected');b.addEventListener('click',()=>{chosen=space;renderMap();});}
      map.append(b);
    }
    $('reservationSelectionText').innerHTML=isFull?'현재 만차로 예약 가능한 주차면이 없습니다.':chosen?`선택한 주차면: <strong>${esc(floor.name)} · ${esc(chosen)}</strong>`:'예약할 주차면을 선택해 주세요.';
    $('reservationOpenConfirm').disabled=isFull || !chosen;
  }
  function render() {
    const record=readRecord();
    $('reservationBooking').hidden=Boolean(record);
    $('reservationActive').hidden=!record;
    if(record){$('reservationActiveDetails').innerHTML=details(record);}
    if(!record){
      const intro=$('reservationBookingIntro');
      if(intro) {
        const instruction=intro.querySelector('.reservation-intro');
        if(instruction)instruction.textContent=store.full?'현재 하남점은 만차로 주차 예약을 이용할 수 없어요.':'비어 있는 주차면을 선택해 예약할 수 있어요.';
      }
      renderFloorPicker();renderMap();
    }
  }
  function showPanel(kind) {
    modalMode=kind;
    $('reservationModal').hidden=false;
    $('reservationConfirmPanel').hidden=kind!=='confirm';
    $('reservationDonePanel').hidden=kind!=='done';
    $('reservationCancelPanel').hidden=kind!=='cancel';
    document.body.classList.add('reservation-dialog-open');
    const target=kind==='confirm'?'reservationSubmit':kind==='done'?'reservationDoneClose':'reservationCancelBack';
    setTimeout(() => $(target).focus(),0);
  }
  function closePanel(){ $('reservationModal').hidden=true;document.body.classList.remove('reservation-dialog-open');modalMode=null; }
  function init() {
    if(document.body.dataset.page!=='reservation')return;
    $('reservationBack').addEventListener('click',()=>{if(history.length>1 && document.referrer && new URL(document.referrer).origin===location.origin)history.back();else location.href='ssgp-home.html';});
    $('reservationOpenConfirm').addEventListener('click',()=>{
      if(store.full || !chosen)return;
      if(readRecord()){render();return;}
      const vehicle=readVehicle();
      if(!vehicle){alert('주차 예약을 이용하려면 내 차량 찾기에서 차량번호를 먼저 등록해 주세요.');location.href='vehicle.html';return;}
      const plate=plateText(vehicle);
      if(!plate){alert('등록된 차량번호를 확인해 주세요.');return;}
      $('reservationConfirmDetails').innerHTML=details({storeName:store.name,floor:floorData().name,space:chosen,plate});
      showPanel('confirm');
    });
    $('reservationSubmit').addEventListener('click',()=>{
      if(store.full || !chosen || readRecord())return;
      const vehicle=readVehicle();const plate=plateText(vehicle);
      if(!plate){closePanel();alert('등록 차량번호가 없습니다. 먼저 차량번호를 등록해 주세요.');return;}
      const data={version:1,storeId,storeName:store.name,floor:floorData().name,space:chosen,plate,createdAt:new Date().toISOString()};
      localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
      $('reservationDoneDetails').innerHTML=details(data);
      showPanel('done');
    });
    $('reservationDoneClose').addEventListener('click',()=>{closePanel();chosen=null;render();});
    $('reservationCancel').addEventListener('click',()=>showPanel('cancel'));
    $('reservationCancelBack').addEventListener('click',closePanel);
    $('reservationCancelSubmit').addEventListener('click',()=>{localStorage.removeItem(STORAGE_KEY);chosen=null;closePanel();render();});
    $('reservationViewVehicle').addEventListener('click',()=>{location.href='vehicle.html';});
    document.querySelectorAll('[data-close-sheet]').forEach(x=>x.addEventListener('click',()=>{if(modalMode==='confirm')closePanel();}));
    document.addEventListener('keydown',e=>{if(e.key==='Escape' && modalMode==='confirm')closePanel();});
    render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
