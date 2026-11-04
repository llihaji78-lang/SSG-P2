/* SSG-P 도착예정시간 기준 혼잡도 변화 알림 (시뮬레이션).
 * 기존 assets/js/scheduled-alert.js를 교체하면 됩니다.
 * 서버/ML 없는 정적 웹: 지도/차량위치/기타 JS 변경 없음.
 */
(() => {
  'use strict';
  const ACTIVE_KEY = 'ssgp_scheduled_alert';
  const LOG_KEY = 'ssgp_scheduled_alert_log';
  const CHANGE_POINT = 10; // 최초 예측과 10%p 이상 달라지면 알림
  const CHECK_INTERVAL = 2000;
  const DEMO_CHANGE_AFTER_MS = 15000; // 시연용: 15초 경과 후 가상 예측값 변경

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function status(rate) {
    return rate >= 100 ? '만차' : rate >= 70 ? '혼잡' : '여유';
  }
  function fmt(t) {
    return new Date(t).toLocaleString('ko-KR', {hour:'numeric',minute:'2-digit'});
  }
  function storeId() {
    return localStorage.getItem('ssgp_store') || 'wolgye';
  }
  function prediction(id, minutes) {
    if (typeof PARKING === 'undefined' || !PARKING[id]) return null;
    const points = PARKING[id].prediction;
    const selected = points.find(p => p.m === minutes);
    return selected ? selected.rate : null;
  }
  function storeName(id) {
    if (typeof STORE_DATA === 'undefined') return id;
    return STORE_DATA.find(s => s.id === id)?.name || id;
  }
  function record(entry) {
    const items = read(LOG_KEY, []);
    if (items.some(row => row.id === entry.id)) return;
    items.unshift(entry);
    localStorage.setItem(LOG_KEY, JSON.stringify(items.slice(0,50)));
  }
  function updateText() {
    const section = document.getElementById('scheduledAlertSection');
    if (!section) return;
    const h2 = section.querySelector('h2');
    const intro = section.querySelector('.section-head p');
    if (h2) h2.textContent = '도착 예정 시점의 혼잡도 변화 알림';
    if (intro) intro.textContent = '도착 예정 시간을 고르면, 그 시점의 예상 혼잡도가 크게 달라질 때 미리 알려드려요.';
    for (const radio of section.querySelectorAll('input[name="alertMinutes"]')) {
      const label = radio.closest('label');
      if (label) {
        const text = [...label.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
        if (text) text.textContent = ` 지금부터 ${radio.value}분 뒤 도착`;
      }
    }
    const button = document.getElementById('scheduleAlertBtn');
    if (button) button.textContent = '혼잡도 변화 알림 켜기';
    const cancel = document.getElementById('cancelScheduledAlertBtn');
    if (cancel) cancel.textContent = '알림 감시 종료';
    const note = section.querySelector('.note');
    if (note) note.textContent = '시연용 기능: 최초 예측 대비 점유율 10%p 이상 변화하거나 혼잡도 단계가 달라지면 도착 예정 시각 전에 알립니다. 테스트를 위해 시작 약 15초 후 가상 예측값이 한 번 변경됩니다. 실제 주차장·머신러닝 결과가 아니며, 웹페이지를 닫으면 제시간 알림을 보장할 수 없습니다.';
    if (!document.getElementById('demoAlertChangeBtn')) {
      const demo = document.createElement('button');
      demo.id = 'demoAlertChangeBtn';
      demo.type = 'button';
      demo.className = 'small-btn';
      demo.style.marginLeft = '8px';
      demo.textContent = '변화 즉시 시연';
      demo.addEventListener('click', () => {
        const a = read(ACTIVE_KEY,null);
        if (!a || a.finished || Date.now() >= a.dueAt) {
          window.alert('먼저 도착 예정 시간을 선택하고 알림을 켜 주세요.');
          return;
        }
        check(true);
      });
      const statusEl = document.getElementById('scheduledAlertStatus');
      if (statusEl) statusEl.before(demo);
      else section.append(demo);
    }
  }
  function simulateChangedRate(a) {
    // 확정 도착 시각의 재예측 값이 변한 상황을 시연한다.
    // 예측값이 포화 상태(90% 초과)이면 감소 방향으로 바꿔
    // 10%p 변화가 충분히 나타나도록 한다.
    const delta = a.baseRate > 88 ? -12 : 12;
    return Math.max(0,Math.min(100,a.baseRate + delta));
  }
  function notify(a, changed) {
    const title = '도착 예정 시각의 주차 혼잡도 변경';
    const body = `${a.storeName}: ${fmt(a.dueAt)} 예상 점유율 ${a.baseRate}% (${status(a.baseRate)}) → ${changed}% (${status(changed)}) · 가상 예측 시연`;
    record({id:a.createdAt, at:Date.now(), title, body});
    localStorage.setItem(ACTIVE_KEY,JSON.stringify({...a,finished:true,notified:true,changedRate:changed}));
    if ('Notification' in window && Notification.permission === 'granted') {
      try { new Notification(title, {body}); } catch(e) { /* 권한/브라우저 제한 */ }
    }
    if (document.body.dataset.page === 'parking') window.alert(`${title}\n${body}`);
  }
  function check(force = false) {
    const a = read(ACTIVE_KEY,null);
    if (!a || a.finished) { refresh(); return; }
    const now = Date.now();
    if (now >= a.dueAt) {
      // 기한이 지났어도 변화가 없으면 '변화 알림'을 보내지 않는다.
      localStorage.setItem(ACTIVE_KEY,JSON.stringify({...a,finished:true,notified:false}));
      refresh(); return;
    }
    // 모델 및 실시간 데이터 미연결: 테스트에서는 15초 후 변화를 한 번 생성.
    if (force || now - a.createdAt >= DEMO_CHANGE_AFTER_MS) {
      const changed = simulateChangedRate(a);
      const changedCategory = status(a.baseRate) !== status(changed);
      const changedEnough = Math.abs(changed - a.baseRate) >= CHANGE_POINT;
      if (changedCategory || changedEnough) notify(a,changed);
    }
    refresh();
  }
  function refresh() {
    const a = read(ACTIVE_KEY,null);
    const s = document.getElementById('scheduledAlertStatus');
    if (s) {
      if (!a) s.textContent = '도착 예정 시간을 선택하면 혼잡도 변화 감시를 시작할 수 있어요.';
      else if (!a.finished) s.textContent = `${a.storeName} · 도착 예정 ${fmt(a.dueAt)} · 처음 예상 ${a.baseRate}% (${status(a.baseRate)}) · 변화 감시 중`;
      else if (a.notified) s.textContent = '예상 혼잡도가 변경되어 알림을 보냈어요. 알림함에서 확인할 수 있어요.';
      else s.textContent = '도착 예정 시간이 지나 변화 감시가 종료됐어요.';
    }
    const cancel = document.getElementById('cancelScheduledAlertBtn');
    if (cancel) cancel.hidden = !a || a.finished;
    const list = document.getElementById('scheduledNotificationList');
    if (list) {
      const rows = read(LOG_KEY,[]);
      list.replaceChildren();
      if (!rows.length) {
        const p=document.createElement('div');p.className='notification';
        p.textContent='아직 혼잡도 변화 알림이 없습니다.';
        list.append(p);
      }
      rows.forEach(item=>{
        const box=document.createElement('div');box.className='notification';
        const time=document.createElement('time');time.textContent=fmt(item.at);
        const title=document.createElement('h3');title.textContent=item.title;
        const desc=document.createElement('p');desc.textContent=item.body;
        box.append(time,title,desc);list.append(box);
      });
    }
  }
  function init() {
    updateText();
    // 과거 '정해진 시간에 발생' 방식의 미완료 예약을 새 방식으로 처리하지 않음.
    const old = read(ACTIVE_KEY,null);
    if (old && old.baseRate === undefined) localStorage.removeItem(ACTIVE_KEY);

    const button = document.getElementById('scheduleAlertBtn');
    if (button) button.addEventListener('click',async()=>{
      const minutes = Number(document.querySelector('input[name="alertMinutes"]:checked')?.value || '20');
      const id = storeId();
      const baseRate = prediction(id,minutes);
      if (baseRate === null) {window.alert('예측 데이터가 없어 알림을 시작하지 못했습니다.');return;}
      const createdAt=Date.now();
      localStorage.setItem(ACTIVE_KEY,JSON.stringify({
        createdAt,dueAt:createdAt + minutes*60000,minutes,
        storeId:id,storeName:storeName(id),baseRate,finished:false,notified:false
      }));
      if ('Notification' in window && Notification.permission === 'default' && window.isSecureContext) {
        try {await Notification.requestPermission();} catch(e) { /* 브라우저 제약 */ }
      }
      refresh();
    });
    const cancel = document.getElementById('cancelScheduledAlertBtn');
    if (cancel) cancel.addEventListener('click',()=>{localStorage.removeItem(ACTIVE_KEY);refresh();});
    check();refresh();
    setInterval(check,CHECK_INTERVAL);
    window.addEventListener('storage',refresh);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
