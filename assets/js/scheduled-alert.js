/* SSG-P 예약 알림: GitHub Pages 정적 웹 시연용 */
(() => {
  'use strict';
  const KEY = 'ssgp_scheduled_alert';
  const LOG_KEY = 'ssgp_scheduled_alert_log';
  const getJSON = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  const statusFor = rate => rate >= 100 ? '만차' : rate >= 70 ? '혼잡' : '여유';
  const fmt = t => new Date(t).toLocaleString('ko-KR', {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  const activeStoreId = () => localStorage.getItem('ssgp_store') || 'wolgye';

  function fireDue() {
    const alert = getJSON(KEY,null);
    if (!alert || alert.fired || Date.now() < alert.dueAt) return;
    const entry={
      id: alert.createdAt,
      at:Date.now(),
      title:`${alert.minutes}분 후 주차 알림`,
      body:`${alert.storeName}: 예상 잔여 ${alert.available}면 / 전체 ${alert.total}면 (점유율 ${alert.rate}%, ${statusFor(alert.rate)})`,
    };
    const records=getJSON(LOG_KEY,[]);
    if(!records.some(x=>x.id===entry.id)) {
      records.unshift(entry);
      localStorage.setItem(LOG_KEY,JSON.stringify(records.slice(0,50)));
    }
    localStorage.setItem(KEY,JSON.stringify({...alert,fired:true}));
    if ('Notification' in window && Notification.permission==='granted') {
      try { new Notification(entry.title, {body:entry.body}); } catch (e) { /* 브라우저 제약 */ }
    }
    if (document.body.dataset.page==='parking') window.alert(`${entry.title}\n${entry.body}`);
    refresh();
  }

  function refresh() {
    const el=document.getElementById('scheduledAlertStatus');
    const cancel=document.getElementById('cancelScheduledAlertBtn');
    const alert=getJSON(KEY,null);
    if(el){
      el.textContent=!alert ? '알림 시간이 설정되지 않았습니다.' : alert.fired
        ? `마지막 예약 알림: ${fmt(alert.dueAt)}에 예정되었으며 알림함에 기록됐습니다.`
        : `${alert.minutes}분 후 알림 예약 완료 · ${fmt(alert.dueAt)} 예정 · ${alert.storeName}`;
    }
    if(cancel)cancel.hidden=!alert || alert.fired;
    const list=document.getElementById('scheduledNotificationList');
    if(list){
      const rows=getJSON(LOG_KEY,[]);
      list.replaceChildren();
      if(rows.length===0){
        const d=document.createElement('div');d.className='notification';
        d.textContent='예약 알림이 없습니다. 주차현황에서 10·20·30분 중 하나를 선택하세요.';
        list.append(d);
      }
      rows.forEach(item=>{
        const d=document.createElement('div');d.className='notification';
        const time=document.createElement('time');time.textContent=fmt(item.at);
        const title=document.createElement('h3');title.textContent=item.title;
        const p=document.createElement('p');p.textContent=item.body;
        d.append(time,title,p);list.append(d);
      });
    }
  }

  function init() {
    const schedule=document.getElementById('scheduleAlertBtn');
    if(schedule) schedule.addEventListener('click',async()=>{
      const minutes=Number(document.querySelector('input[name="alertMinutes"]:checked')?.value || '20');
      const id=activeStoreId();
      // 기존 main.js의 PARKING/STORE_DATA를 참조 (임의로 실측값 생성하지 않음)
      const data=(typeof PARKING!=='undefined') ? PARKING[id] : null;
      const store=(typeof STORE_DATA!=='undefined') ? STORE_DATA.find(s=>s.id===id) : null;
      if(!data){window.alert('주차 예측 데이터를 찾지 못했습니다.');return;}
      const item=data.prediction.find(x=>x.m===minutes);
      if(!item){window.alert('해당 시간의 예측값이 없습니다.');return;}
      const total=data.overall.total;
      const available=Math.max(0,total-Math.round(total*item.rate/100));
      const createdAt=Date.now();
      localStorage.setItem(KEY,JSON.stringify({
        createdAt, dueAt:createdAt+minutes*60*1000, minutes,
        storeName:store?.name || id,rate:item.rate,total,available,fired:false
      }));
      // 권한은 사용자 클릭 시에만 요청
      if('Notification' in window && Notification.permission==='default' && window.isSecureContext){
        try{await Notification.requestPermission();}catch(e){}
      }
      refresh();
    });
    const cancel=document.getElementById('cancelScheduledAlertBtn');
    if(cancel)cancel.addEventListener('click',()=>{localStorage.removeItem(KEY);refresh();});
    fireDue();refresh();
    // 페이지가 열려 있는 동안만 동작. 열린 다른 SSG-P 탭 사이의 재조회도 지원
    setInterval(fireDue, 1000);
    window.addEventListener('storage',refresh);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)fireDue();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
