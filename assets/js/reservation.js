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
  const POLICY_ITEMS = [
    '예약 입차는 10:00~21:00, 출차는 당일 22:00까지 가능합니다. (최대 3시간)',
    '예약 입차 예정 시각부터 1시간이 경과할 때까지 입차하지 않으면 노쇼로 예약이 취소됩니다.',
    '예약 출차 시각을 초과하면 초과 시간 10분당 1,000원의 페널티가 부과됩니다.'
  ];
  const pad = n => String(n).padStart(2, '0');
  const OPEN_ENTRY_START = 10 * 60; // 첫 입차 선택 시각: 10:00
  const OPEN_ENTRY_END = 21 * 60; // 마지막 입차 선택 시각: 21:00
  const STORE_CLOSE = 22 * 60; // 출차 마감: 같은 날 22:00
  const MAX_BOOKING_MINUTES = 180;
  const minuteOfDay = d => d.getHours() * 60 + d.getMinutes();
  const atMinutes = (date, minutes) => {
    const result = new Date(date);
    result.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return result;
  };
  const roundedFuture = () => new Date(Math.ceil((Date.now() + 60000) / 600000) * 600000);
  const defaultEntry = () => {
    const nearest = roundedFuture();
    if (minuteOfDay(nearest) < OPEN_ENTRY_START) return atMinutes(nearest, OPEN_ENTRY_START);
    if (minuteOfDay(nearest) <= OPEN_ENTRY_END) return nearest;
    const next = new Date(nearest);
    next.setDate(next.getDate() + 1);
    return atMinutes(next, OPEN_ENTRY_START);
  };
  const suggestedExit = entry => new Date(Math.min(entry.getTime() + MAX_BOOKING_MINUTES * 60000, atMinutes(entry, STORE_CLOSE).getTime()));
  const applySuggestedExit = () => {
    const entry = parseLocalDateTime($('reservationEntryDate').value, $('reservationEntryTime').value);
    if (!entry) return;
    const out = localParts(suggestedExit(entry));
    $('reservationExitDate').value = out.date;
    $('reservationExitTime').value = out.time;
    syncBookingPickerLabels();
  };
  const permittedSlots = inputId => {
    const entryMode = inputId.includes('Entry');
    const selectedDate = $(inputId.replace('Time','Date')).value;
    if (!selectedDate) return [];
    const result = [];
    const now = roundedFuture();
    const entry = parseLocalDateTime($('reservationEntryDate').value, $('reservationEntryTime').value);
    const lastExit = entry ? suggestedExit(entry) : null;
    for (let m=(entryMode ? OPEN_ENTRY_START : 0); m<= (entryMode ? OPEN_ENTRY_END : STORE_CLOSE); m+=10) {
      const d=parseLocalDateTime(selectedDate, `${pad(Math.floor(m/60))}:${pad(m%60)}`);
      if (!d) continue;
      if (entryMode && d < now) continue;
      if (!entryMode && (!entry || d <= entry || d > lastExit)) continue;
      result.push(`${pad(Math.floor(m/60))}:${pad(m%60)}`);
    }
    return result;
  };
  const localParts = date => ({date:`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`,time:`${pad(date.getHours())}:${pad(date.getMinutes())}`});
  const formatBookingTime = value => {
    if (!value) return '미설정 (기존 예약)';
    const d = new Date(value);
    if (!Number.isFinite(d.getTime())) return '일시 확인 필요';
    const parts=localParts(d);
    return `${parts.date} ${parts.time}`;
  };
  function policyBlock() {
    const section=document.createElement('section');
    section.className='reservation-policy';
    section.innerHTML='<h3>이용 안내</h3><ul></ul><p class="reservation-policy-demo">※ 시연용 안내입니다. 실제 입·출차 감지, 자동 취소 및 요금 부과와 연동되지 않습니다.</p>';
    const list=section.querySelector('ul');
    POLICY_ITEMS.forEach(item=>{const li=document.createElement('li');li.textContent=item;list.append(li);});
    return section;
  }
  function details(r) {
    const fields=[['▣','예약 점포',r.storeName],['▱','예약 층',r.floor],['Ⓟ','예약 자리',r.space],['▰','등록 차량번호',maskPlate(r.plate)]];
    if(r.entryAt || r.exitAt){fields.push(['▤','예약 입차 일시',formatBookingTime(r.entryAt)],['▤','예약 출차 일시',formatBookingTime(r.exitAt)]);}
    return fields.map(([icon,label,value],i)=>`<div class="reservation-detail-row"><span class="reservation-detail-icon">${icon}</span><span>${esc(label)}</span><strong class="${i===2?'emphasis':''}">${esc(value)}</strong></div>`).join('');
  }
  // 예약 확인창에만 날짜/시간 입력란 및 이용 안내를 삽입합니다.
  function setupBookingDateInputs() {
    const detailsNode=$('reservationConfirmDetails');
    if(!detailsNode || $('reservationBookingDates'))return;
    const section=document.createElement('section');section.id='reservationBookingDates';section.className='reservation-booking-dates';
    section.innerHTML=`<h3>예약 입·출차 일시</h3>
      <div class="reservation-time-field"><span class="reservation-time-label">예약 입차 일시</span><div class="reservation-time-controls"><button type="button" class="reservation-date-trigger" data-picker="reservationEntryDate" aria-label="예약 입차 날짜 선택"><span class="reservation-picker-value"></span><span aria-hidden="true">▦</span></button><button type="button" class="reservation-clock-trigger" data-picker="reservationEntryTime" aria-label="예약 입차 시간 선택"><span class="reservation-picker-value"></span><span aria-hidden="true">⌄</span></button><input id="reservationEntryDate" type="hidden"><input id="reservationEntryTime" type="hidden"></div></div>
      <div class="reservation-time-field"><span class="reservation-time-label">예약 출차 일시</span><div class="reservation-time-controls"><button type="button" class="reservation-date-trigger" data-picker="reservationExitDate" aria-label="예약 출차 날짜 선택"><span class="reservation-picker-value"></span><span aria-hidden="true">▦</span></button><button type="button" class="reservation-clock-trigger" data-picker="reservationExitTime" aria-label="예약 출차 시간 선택"><span class="reservation-picker-value"></span><span aria-hidden="true">⌄</span></button><input id="reservationExitDate" type="hidden"><input id="reservationExitTime" type="hidden"></div></div>
      <p class="reservation-time-error" id="reservationTimeError" role="alert" aria-live="polite" hidden></p>`;
    detailsNode.insertAdjacentElement('afterend', section);
    section.insertAdjacentElement('afterend',policyBlock());
    const ids=['reservationEntryDate','reservationEntryTime','reservationExitDate','reservationExitTime'];
    ids.forEach(id=>$(id).addEventListener('input',()=>{$('reservationTimeError').hidden=true;}));
    section.querySelectorAll('[data-picker]').forEach(button=>button.addEventListener('click',()=>openBookingPicker(button.dataset.picker)));
    syncBookingPickerLabels();
    ['reservationEntryDate','reservationEntryTime'].forEach(id=>$(id).addEventListener('change',()=>{
      // 입차 시각을 바꾸면 출차는 최대 3시간 뒤, 단 22시 이내로 자동 설정.
      const entry=parseLocalDateTime($('reservationEntryDate').value,$('reservationEntryTime').value);
      if (!entry) return;
      const next=roundedFuture();
      if (entry < next || minuteOfDay(entry)<OPEN_ENTRY_START || minuteOfDay(entry)>OPEN_ENTRY_END) {
        const valid=permittedSlots('reservationEntryTime');
        if (valid.length) $('reservationEntryTime').value=valid[0];
        else {
          const tomorrow = new Date($('reservationEntryDate').value+'T12:00:00');
          tomorrow.setDate(tomorrow.getDate()+1);
          $('reservationEntryDate').value=localParts(tomorrow).date;
          $('reservationEntryTime').value='10:00';
        }
      }
      applySuggestedExit();
    }));
  }
  function parseLocalDateTime(date,time) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))return null;
    const d=new Date(`${date}T${time}:00`);
    const v=localParts(d);
    return Number.isFinite(d.getTime()) && v.date===date && v.time===time ? d : null;
  }
  function initBookingDateInputs() {
    const next=defaultEntry();
    const exit=suggestedExit(next);
    const a=localParts(next),b=localParts(exit);
    $('reservationEntryDate').value=a.date;$('reservationEntryTime').value=a.time;
    $('reservationExitDate').value=b.date;$('reservationExitTime').value=b.time;
    $('reservationEntryDate').min=localParts(new Date()).date;
    $('reservationTimeError').hidden=true;
    syncBookingPickerLabels();
  }
  function checkedBookingTimes() {
    const entry=parseLocalDateTime($('reservationEntryDate').value,$('reservationEntryTime').value);
    const exit=parseLocalDateTime($('reservationExitDate').value,$('reservationExitTime').value);
    let message='';
    if(!entry||!exit)message='예약 입차·출차 날짜와 시간을 모두 선택해 주세요.';
    else if(entry.getTime()<Date.now()-60000)message='예약 입차 일시는 현재 이후로 선택해 주세요.';
    else if (entry.getMinutes()%10 || exit.getMinutes()%10) message='입차·출차 시간은 10분 단위로 선택해 주세요.';
    else if (minuteOfDay(entry) < OPEN_ENTRY_START || minuteOfDay(entry) > OPEN_ENTRY_END) message='예약 입차는 10:00~21:00 사이에 가능합니다.';
    else if (localParts(entry).date !== localParts(exit).date || minuteOfDay(exit) > STORE_CLOSE) message='예약 출차는 입차 당일 22:00까지 가능합니다.';
    else if(exit<=entry)message='예약 출차 일시는 입차 일시보다 늦어야 해요.';
    else if(exit-entry>MAX_BOOKING_MINUTES*60000)message='최대 예약 가능 시간은 3시간입니다.';
    if(message){const error=$('reservationTimeError');error.textContent=message;error.hidden=false;error.scrollIntoView({block:'nearest'});return null;}
    return {entryAt:entry.toISOString(),exitAt:exit.toISOString()};
  }
  // SSG-P 맞춤 날짜/시간 선택창. 저장되는 필드값은 기존과 동일하게 유지합니다.
  let bookingPicker = null;
  const MONTH_NAMES=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  function syncBookingPickerLabels() {
    document.querySelectorAll('#reservationBookingDates [data-picker]').forEach(button=>{
      const id=button.dataset.picker, value=$(id)?.value || '';
      const label=button.querySelector('.reservation-picker-value');
      if(!label)return;
      if(id.endsWith('Date')) {
        const m=value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        label.textContent=m?`${m[1]}.${m[2]}.${m[3]}`:'날짜 선택';
      } else {
        const parts=value.split(':');
        const hour=Number(parts[0]);
        label.textContent=value ? `${hour < 12 ? '오전' : '오후'} ${pad(hour % 12 || 12)}:${parts[1]}` : '시간 선택';
      }
    });
  }
  function closeBookingPicker() {
    if(!bookingPicker)return;
    const {overlay,trigger,onKey}=bookingPicker;
    document.removeEventListener('keydown',onKey,true);
    overlay.remove();bookingPicker=null;
    if(trigger?.isConnected)trigger.focus();
  }
  function openBookingPicker(inputId) {
    closeBookingPicker();
    const input=$(inputId), isDate=inputId.endsWith('Date');
    const trigger=document.querySelector(`#reservationBookingDates [data-picker="${inputId}"]`);
    if(!input||!trigger)return;
    const overlay=document.createElement('div');overlay.className='reservation-custom-picker-overlay';
    const dialog=document.createElement('div');dialog.className='reservation-custom-picker';
    dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
    dialog.setAttribute('aria-label',inputId.includes('Entry')?'예약 입차 '+(isDate?'날짜':'시간'):'예약 출차 '+(isDate?'날짜':'시간'));
    overlay.append(dialog);
    const title=document.createElement('div');title.className='reservation-picker-head';
    const heading=document.createElement('strong');heading.textContent=isDate?'날짜 선택':'시간 선택';
    const x=document.createElement('button');x.type='button';x.className='reservation-picker-close';x.textContent='×';x.setAttribute('aria-label','닫기');
    x.addEventListener('click',closeBookingPicker);title.append(heading,x);dialog.append(title);
    const body=document.createElement('div');dialog.append(body);
    const save=(value)=>{
      input.value=value;
      input.dispatchEvent(new Event('input',{bubbles:true}));
      input.dispatchEvent(new Event('change',{bubbles:true}));
      syncBookingPickerLabels();
      closeBookingPicker();
    };
    if(isDate) {
      let display = new Date((input.value||localParts(new Date()).date)+'T12:00:00');
      if(!Number.isFinite(display.getTime()))display=new Date();
      let y=display.getFullYear(), m=display.getMonth();
      const today=localParts(new Date()).date;
      const render=()=>{
        body.replaceChildren();
        const nav=document.createElement('div');nav.className='reservation-picker-month';
        const back=document.createElement('button');back.type='button';back.textContent='‹';back.setAttribute('aria-label','이전 달');
        const forward=document.createElement('button');forward.type='button';forward.textContent='›';forward.setAttribute('aria-label','다음 달');
        const label=document.createElement('strong');label.textContent=`${y}년 ${MONTH_NAMES[m]}`;
        back.onclick=()=>{m--;if(m<0){m=11;y--;}render();};
        forward.onclick=()=>{m++;if(m>11){m=0;y++;}render();};
        nav.append(back,label,forward);body.append(nav);
        const grid=document.createElement('div');grid.className='reservation-picker-calendar';
        ['일','월','화','수','목','금','토'].forEach(day=>{const d=document.createElement('span');d.className='reservation-picker-weekday';d.textContent=day;grid.append(d);});
        const first=new Date(y,m,1).getDay(),last=new Date(y,m+1,0).getDate();
        for(let i=0;i<first;i++){const empty=document.createElement('span');grid.append(empty);}
        for(let day=1;day<=last;day++){
          const date=`${y}-${pad(m+1)}-${pad(day)}`;
          const b=document.createElement('button');b.type='button';b.textContent=String(day);
          b.className='reservation-picker-day'+(date===input.value?' selected':'')+(date===today?' today':'');
          if(date<today){b.disabled=true;}else b.onclick=()=>save(date);
          grid.append(b);
        }
        body.append(grid);
        const footer=document.createElement('div');footer.className='reservation-picker-calendar-footer';
        const todayBtn=document.createElement('button');todayBtn.type='button';todayBtn.textContent='오늘';todayBtn.onclick=()=>save(today);
        footer.append(todayBtn);body.append(footer);
      };render();
    } else {
      const parts=(input.value||'14:00').split(':');let hour=Number(parts[0])||0,minute=Number(parts[1])||0;
      minute=Math.round(minute/10)*10;
      if(minute===60){hour=(hour+1)%24;minute=0;}
      const allowed=permittedSlots(inputId);
      if (allowed.length && !allowed.includes(`${pad(hour)}:${pad(minute)}`)) {
        [hour,minute]=allowed[0].split(':').map(Number);
      }
      const title=document.createElement('p');title.className='reservation-picker-time-help';
      title.textContent=inputId.includes('Entry')?'입차 시간은 10:00~21:00 사이에 선택할 수 있어요. (10분 단위)':'출차는 입차 후 최대 3시간, 당일 22:00까지 가능해요.';
      body.append(title);
      const fields=document.createElement('div');fields.className='reservation-picker-time-fields';body.append(fields);
      const hourWrap=document.createElement('div');hourWrap.className='reservation-picker-time-choice';
      const minWrap=document.createElement('div');minWrap.className='reservation-picker-time-choice';
      const hourLabel=document.createElement('strong');hourLabel.textContent='시';hourWrap.append(hourLabel);
      const minuteLabel=document.createElement('strong');minuteLabel.textContent='분';minWrap.append(minuteLabel);
      const hours=document.createElement('div');hours.className='reservation-picker-time-grid';
      const minutes=document.createElement('div');minutes.className='reservation-picker-minute-grid';
      function redraw() {
        hours.replaceChildren();minutes.replaceChildren();
        // 입차: 10~21시, 출차: 10~22시만 표시합니다.
        // 해당 범위 안에서 예약할 수 없는 시간은 회색 비활성화로 남깁니다.
        const lastHour = inputId.includes('Entry') ? 21 : 22;
        for(let h=10;h<=lastHour;h++){
          const b=document.createElement('button');b.type='button';b.className=h===hour?'selected':'';
          b.textContent=pad(h);b.setAttribute('aria-pressed',String(h===hour));
          const minutesForHour=allowed.filter(v=>Number(v.slice(0,2))===h);
          b.disabled=!minutesForHour.length;
          b.onclick=()=>{
            hour=h;
            if (!minutesForHour.includes(`${pad(hour)}:${pad(minute)}`)) minute=Number(minutesForHour[0].slice(3));
            redraw();
          };hours.append(b);
        }
        for(let v=0;v<60;v+=10){
          const b=document.createElement('button');b.type='button';b.textContent=pad(v);b.className=v===minute?'selected':'';
          b.setAttribute('aria-pressed',String(v===minute));
          b.disabled=!allowed.includes(`${pad(hour)}:${pad(v)}`);
          b.onclick=()=>{minute=v;redraw();};minutes.append(b);
        }
      }
      hourWrap.append(hours);minWrap.append(minutes);fields.append(hourWrap,minWrap);redraw();
      const okay=document.createElement('button');okay.type='button';okay.className='reservation-picker-done';okay.textContent='확인';okay.disabled=!allowed.length;
      okay.onclick=()=>{if(allowed.includes(`${pad(hour)}:${pad(minute)}`))save(`${pad(hour)}:${pad(minute)}`);};body.append(okay);
    }
    const onKey=e=>{
      if(e.key==='Escape'){e.preventDefault();closeBookingPicker();}
      else if(e.key==='Tab'){
        const focusable=[...dialog.querySelectorAll('button:not(:disabled)')];
        if(!focusable.length)return;
        const first=focusable[0],last=focusable[focusable.length-1];
        if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
      }
    };
    overlay.addEventListener('click',e=>{if(e.target===overlay)closeBookingPicker();});
    document.body.append(overlay);
    document.addEventListener('keydown',onKey,true);
    bookingPicker={overlay,trigger,onKey};x.focus();
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
  // 브라우저 alert 대신 SSG-P 전용 안내창 사용 (주소/「내용:」 표시 없음).
  function showReservationNotice(message, { goToVehicle = false } = {}) {
    const previousFocus = document.activeElement;
    const overlay = document.createElement('div');
    overlay.className = 'reservation-notice-overlay';
    overlay.innerHTML = `<section class="reservation-notice-card" role="alertdialog" aria-modal="true" aria-labelledby="reservationNoticeTitle" aria-describedby="reservationNoticeMessage">
      <div class="reservation-notice-mark" aria-hidden="true">!</div>
      <h2 id="reservationNoticeTitle">차량 등록 안내</h2>
      <p id="reservationNoticeMessage"></p>
      <button class="reservation-notice-confirm" type="button">확인</button>
    </section>`;
    overlay.querySelector('#reservationNoticeMessage').textContent = message;
    const button = overlay.querySelector('.reservation-notice-confirm');
    let dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      overlay.remove();
      document.removeEventListener('keydown', onKeydown, true);
      document.body.classList.remove('reservation-notice-open');
      if (goToVehicle) location.href = 'vehicle.html';
      else if (previousFocus && previousFocus.isConnected) previousFocus.focus();
    }
    function onKeydown(event) {
      if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
      if (event.key === 'Tab') { event.preventDefault(); button.focus(); }
    }
    button.addEventListener('click', dismiss);
    document.addEventListener('keydown', onKeydown, true);
    document.body.append(overlay);
    document.body.classList.add('reservation-notice-open');
    button.focus();
  }
  function init() {
    if(document.body.dataset.page!=='reservation')return;
    setupBookingDateInputs();
    $('reservationBack').addEventListener('click',()=>{if(history.length>1 && document.referrer && new URL(document.referrer).origin===location.origin)history.back();else location.href='ssgp-home.html';});
    $('reservationOpenConfirm').addEventListener('click',()=>{
      if(store.full || !chosen)return;
      if(readRecord()){render();return;}
      const vehicle=readVehicle();
      if(!vehicle){showReservationNotice('주차 예약을 이용하려면 내 차량 찾기에서 차량번호를 먼저 등록해 주세요.', {goToVehicle:true});return;}
      const plate=plateText(vehicle);
      if(!plate){showReservationNotice('등록된 차량번호를 확인해 주세요.');return;}
      $('reservationConfirmDetails').innerHTML=details({storeName:store.name,floor:floorData().name,space:chosen,plate});
      initBookingDateInputs();
      showPanel('confirm');
    });
    $('reservationSubmit').addEventListener('click',()=>{
      if(store.full || !chosen || readRecord())return;
      const vehicle=readVehicle();const plate=plateText(vehicle);
      if(!plate){closePanel();showReservationNotice('등록 차량번호가 없습니다. 먼저 차량번호를 등록해 주세요.', {goToVehicle:true});return;}
      const bookingTimes=checkedBookingTimes();
      if(!bookingTimes)return;
      const data={version:2,storeId,storeName:store.name,floor:floorData().name,space:chosen,plate,createdAt:new Date().toISOString(),...bookingTimes};
      localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
      $('reservationDoneDetails').innerHTML=details(data);
      showPanel('done');
    });
    $('reservationDoneClose').addEventListener('click',()=>{closePanel();chosen=null;render();});
    $('reservationCancel').addEventListener('click',()=>showPanel('cancel'));
    $('reservationCancelBack').addEventListener('click',closePanel);
    $('reservationCancelSubmit').addEventListener('click',()=>{localStorage.removeItem(STORAGE_KEY);chosen=null;closePanel();render();});
    $('reservationViewVehicle').addEventListener('click',()=>{location.href='vehicle.html?tab=reservation';});
    document.querySelectorAll('[data-close-sheet]').forEach(x=>x.addEventListener('click',()=>{if(modalMode==='confirm')closePanel();}));
    document.addEventListener('keydown',e=>{if(e.key==='Escape' && modalMode==='confirm')closePanel();});
    render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
