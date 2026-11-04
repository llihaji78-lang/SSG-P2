/* SSG-P 혼잡도 변화 감시 + 자체 토스트 + 읽음/안읽음 알림함
   기존 scheduled-alert.js를 교체합니다. main.js/차량/지도 코드는 보존됩니다. */
(() => {
  'use strict';
  if (window.__SSGP_ALERTER_V4__) return;
  window.__SSGP_ALERTER_V4__ = true;

  const ACTIVE_KEY = 'ssgp_scheduled_alert';
  const LOG_KEY = 'ssgp_scheduled_alert_log';
  const CHANGE_POINT = 10;
  const DEMO_CHANGE_AFTER_MS = 15000;
  const CHECK_INTERVAL_MS = 2000;
  const MAX_LOG = 50;

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function log() { return read(LOG_KEY, []); }
  function storeId() { return localStorage.getItem('ssgp_store') || 'wolgye'; }
  function level(rate) { return rate >= 100 ? '만차' : rate >= 70 ? '혼잡' : '여유'; }
  function timeLabel(ms) { return new Date(ms).toLocaleString('ko-KR', {month:'numeric',day:'numeric',hour:'numeric',minute:'2-digit'}); }
  function targetStoreName(id) {
    if (typeof STORE_DATA !== 'undefined') return STORE_DATA.find(s => s.id === id)?.name || id;
    return id;
  }
  function getPrediction(id, minutes) {
    if (typeof PARKING === 'undefined' || !PARKING[id]) return null;
    const point = PARKING[id].prediction.find(p => p.m === minutes);
    return point ? Number(point.rate) : null;
  }
  function insertStyles() {
    if (document.getElementById('ssgp-notification-style')) return;
    const css = document.createElement('style');
    css.id = 'ssgp-notification-style';
    css.textContent = `
      .ssgp-toast{position:fixed;z-index:10000;top:18px;left:50%;transform:translateX(-50%);width:min(430px,calc(100% - 24px));background:#fff;border:1px solid #d8e7dc;border-left:5px solid #016922;border-radius:18px;box-shadow:0 15px 42px rgba(35,25,22,.18);padding:16px;animation:ssgpSlide .2s ease}
      .ssgp-toast-top{display:flex;align-items:center;gap:10px;margin-bottom:8px;color:#016922}
      .ssgp-toast-top strong{font-size:14px;flex:1;color:#231916}
      .ssgp-toast button{border:0;background:transparent;color:#777;cursor:pointer;font-size:21px;padding:0 4px}
      .ssgp-toast p{margin:0;color:#4d4946;font-size:12px;line-height:1.65}
      .ssgp-toast small{display:block;margin-top:8px;font-size:10px;color:#888}
      .notification[data-unread="true"]{background:#f0f8f2;border-color:#c4dfcd;cursor:pointer}
      .notification[data-unread="false"]{opacity:.75;cursor:pointer}
      .notification .ssgp-unread-dot{width:8px;height:8px;display:inline-block;background:#016922;border-radius:50%;margin-right:7px}
      .notification:focus-visible{outline:3px solid #016922;outline-offset:2px}
      @keyframes ssgpSlide{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}
    `;
    document.head.append(css);
  }
  function updateBadge() {
    const unread = log().filter(entry => !entry.read).length;
    document.querySelectorAll('.bell-btn .badge').forEach(badge => {
      badge.textContent = unread > 99 ? '99+' : String(unread);
      badge.style.display = unread ? 'grid' : 'none';
      badge.setAttribute('aria-label', `읽지 않은 알림 ${unread}개`);
    });
  }
  function showToast(title, body) {
    document.getElementById('ssgpCurrentToast')?.remove();
    const toast = document.createElement('aside');
    toast.id = 'ssgpCurrentToast'; toast.className = 'ssgp-toast';
    toast.setAttribute('role', 'alert');
    const head = document.createElement('div'); head.className = 'ssgp-toast-top';
    const icon = document.createElement('span'); icon.textContent = '🔔';
    const strong = document.createElement('strong'); strong.textContent = title;
    const close = document.createElement('button'); close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label','알림 닫기');
    close.onclick = () => toast.remove();
    head.append(icon,strong,close);
    const p = document.createElement('p'); p.textContent = body;
    const small = document.createElement('small'); small.textContent = 'SSG-P · 가상 예측 시뮬레이션';
    toast.append(head,p,small); document.body.append(toast);
    setTimeout(() => { if(toast.isConnected) toast.remove(); }, 6500);
  }
  function record(entry) {
    const entries = log();
    if (entries.some(i => String(i.id) === String(entry.id))) return;
    entries.unshift({...entry,read:false});
    localStorage.setItem(LOG_KEY,JSON.stringify(entries.slice(0,MAX_LOG)));
    updateBadge(); renderList();
  }
  function markRead(id) {
    const entries = log();
    let changed = false;
    entries.forEach(i => {
      if(String(i.id) === String(id) && !i.read) { i.read = true; changed = true; }
    });
    if (changed) localStorage.setItem(LOG_KEY,JSON.stringify(entries));
    updateBadge(); renderList();
  }
  function renderList() {
    const list = document.getElementById('scheduledNotificationList');
    if (!list) return;
    list.replaceChildren();
    const items = log();
    if(!items.length) {
      const box=document.createElement('div'); box.className='notification';
      const title=document.createElement('h3'); title.textContent='아직 혼잡도 변화 알림이 없습니다.';
      const para=document.createElement('p'); para.textContent='주차현황에서 도착 예정 시점을 선택하고 알림을 켜 보세요.';
      box.append(title,para);list.append(box);return;
    }
    items.forEach(item => {
      const box = document.createElement('article');
      box.className='notification'; box.dataset.unread=String(!item.read);
      box.setAttribute('role','button'); box.tabIndex=0;
      box.setAttribute('aria-label',`${item.read?'읽은 알림':'읽지 않은 알림'}: ${item.title}. 클릭하여 확인`);
      const time=document.createElement('time');time.textContent=timeLabel(item.at);
      const h3=document.createElement('h3');
      if(!item.read){ const dot=document.createElement('span');dot.className='ssgp-unread-dot';dot.setAttribute('aria-hidden','true');h3.append(dot); }
      h3.append(document.createTextNode(item.title || '혼잡도 변화 알림'));
      const p=document.createElement('p');p.textContent=item.body || '';
      const hint=document.createElement('small');hint.style.color='#7b7774';hint.textContent=item.read?'읽음':'클릭하여 읽음 처리';
      box.append(time,h3,p,hint);
      box.onclick=()=>markRead(item.id);
      box.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();markRead(item.id)}};
      list.append(box);
    });
  }
  function rewriteCopy() {
    const section=document.getElementById('scheduledAlertSection');
    if (!section) return;
    const h2=section.querySelector('h2'); if(h2) h2.textContent='도착 예정 시점의 혼잡도 변화 알림';
    const intro=section.querySelector('.section-head p');
    if (intro) intro.textContent='도착 예정 시점의 예상 혼잡도가 크게 달라지면 미리 알려드려요.';
    section.querySelectorAll('input[name="alertMinutes"]').forEach(radio => {
      const label=radio.closest('label');
      if(label) [...label.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).forEach(t=>t.textContent=` 지금부터 ${radio.value}분 뒤 도착`);
    });
    const btn=document.getElementById('scheduleAlertBtn');if(btn)btn.textContent='혼잡도 변화 알림 켜기';
    const cancel=document.getElementById('cancelScheduledAlertBtn');if(cancel)cancel.textContent='알림 감시 종료';
    const note=section.querySelector('.note');
    if(note) note.textContent='시연용: 최초 예측과 10%p 이상 달라지거나 여유·혼잡·만차 단계가 바뀌면 알려줍니다. 테스트에서는 약 15초 뒤 가상 변화가 발생합니다. 실제 데이터 또는 머신러닝 결과가 아닙니다.';
    if (!document.getElementById('demoAlertChangeBtn')) {
      const demo=document.createElement('button');demo.type='button';demo.id='demoAlertChangeBtn';demo.className='small-btn';demo.style.marginLeft='8px';demo.textContent='변화 즉시 시연';
      demo.onclick=()=>{
        const current=read(ACTIVE_KEY,null);
        if(!current || current.finished || Date.now() >= current.dueAt){showToast('알림 설정 필요','먼저 도착 예정 시간을 선택하고 알림을 켜 주세요.');return;}
        check(true);
      };
      const el=document.getElementById('scheduledAlertStatus');el?.before(demo);
    }
  }
  function updateStatus() {
    const el=document.getElementById('scheduledAlertStatus');if(!el)return;
    const a=read(ACTIVE_KEY,null);
    if(!a)el.textContent='도착 예정 시간을 선택하면 혼잡도 변화 감시를 시작할 수 있어요.';
    else if(!a.finished)el.textContent=`${a.storeName} · 도착 예정 ${timeLabel(a.dueAt)} · 처음 예상 ${a.baseRate}% (${level(a.baseRate)}) · 감시 중`;
    else if(a.notified)el.textContent='혼잡도 변화가 감지되어 알림함에 기록했어요.';
    else el.textContent='도착 예정 시간이 지나 감시가 종료됐어요.';
    const cancel=document.getElementById('cancelScheduledAlertBtn');if(cancel)cancel.hidden=!a||a.finished;
  }
  function changedRate(a) { const delta = a.baseRate > 88 ? -12 : 12;return Math.max(0,Math.min(100,a.baseRate+delta)); }
  function notify(a,changed) {
    const title='도착 예정 시점의 주차 혼잡도 변경';
    const body=`${a.storeName} · ${timeLabel(a.dueAt)} 예상 점유율 ${a.baseRate}% (${level(a.baseRate)}) → ${changed}% (${level(changed)})`;
    record({id:a.createdAt,at:Date.now(),title,body,storeId:a.storeId});
    localStorage.setItem(ACTIVE_KEY,JSON.stringify({...a,finished:true,notified:true,changedRate:changed}));
    showToast(title,body);
  }
  function check(force=false) {
    const a=read(ACTIVE_KEY,null);
    if(!a || a.finished){updateStatus();return;}
    if(Date.now()>=a.dueAt){localStorage.setItem(ACTIVE_KEY,JSON.stringify({...a,finished:true,notified:false}));updateStatus();return;}
    if(force||Date.now()-a.createdAt>=DEMO_CHANGE_AFTER_MS) {
      const rate=changedRate(a);
      if (Math.abs(rate-a.baseRate)>=CHANGE_POINT||level(rate)!==level(a.baseRate))notify(a,rate);
    }
    updateStatus();
  }
  function init() {
    insertStyles();
    updateBadge();renderList();rewriteCopy();
    const old=read(ACTIVE_KEY,null);
    if(old && old.baseRate===undefined)localStorage.removeItem(ACTIVE_KEY);
    document.getElementById('scheduleAlertBtn')?.addEventListener('click',()=>{
      const minutes=Number(document.querySelector('input[name="alertMinutes"]:checked')?.value||20);
      const id=storeId(),rate=getPrediction(id,minutes);
      if(rate===null){showToast('알림을 시작할 수 없어요','현재 선택한 점포의 예측 데이터가 없습니다.');return;}
      const now=Date.now();
      localStorage.setItem(ACTIVE_KEY,JSON.stringify({createdAt:now,dueAt:now+minutes*60000,minutes,storeId:id,storeName:targetStoreName(id),baseRate:rate,finished:false,notified:false}));
      updateStatus();showToast('혼잡도 변화 알림 시작',`${minutes}분 뒤 도착을 기준으로 예상 혼잡도를 감시합니다.`);
    });
    document.getElementById('cancelScheduledAlertBtn')?.addEventListener('click',()=>{localStorage.removeItem(ACTIVE_KEY);updateStatus();showToast('감시 종료','혼잡도 변화 알림 감시를 종료했습니다.');});
    check();
    setInterval(check,CHECK_INTERVAL_MS);
    window.addEventListener('storage',()=>{updateBadge();renderList();check();});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
