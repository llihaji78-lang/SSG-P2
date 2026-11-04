
const STORE_DATA = [
  {id:"wolgye", name:"트레이더스 월계점"},
  {id:"hanam", name:"트레이더스 하남점"},
  {id:"guseong", name:"트레이더스 구성점"}
];

const PARKING = {
  wolgye:{
    overall:{rate:58, total:500, available:210, normal:188, disabled:18, ev:4},
    floors:{
      "3층":{rate:55, total:170, available:76, normal:70, disabled:6, ev:null},
      "4층":{rate:78, total:160, available:35, normal:27, disabled:4, ev:4},
      "5층":{rate:42, total:170, available:99, normal:92, disabled:7, ev:null}
    },
    prediction:[{m:10,rate:63,waitMin:0, waitMax:2},{m:20,rate:72,waitMin:2, waitMax:4},{m:30,rate:81,waitMin:4, waitMax:7}]
  },
  hanam:{
    overall:{rate:74,total:800,available:208,normal:187,disabled:13,ev:8},
    floors:{"B1":{rate:71,total:280,available:81,normal:73,disabled:5,ev:3},"B2":{rate:79,total:280,available:59,normal:51,disabled:4,ev:4},"B3":{rate:72,total:240,available:68,normal:61,disabled:4,ev:3}},
    prediction:[{m:10,rate:78,waitMin:3, waitMax:5},{m:20,rate:84,waitMin:5, waitMax:8},{m:30,rate:91,waitMin:8, waitMax:12}]
  },
  guseong:{
    overall:{rate:56,total:600,available:264,normal:244,disabled:12,ev:8},
    floors:{"B1":{rate:53,total:300,available:141,normal:131,disabled:6,ev:4},"B2":{rate:59,total:300,available:123,normal:113,disabled:6,ev:4}},
    prediction:[{m:10,rate:61,waitMin:0, waitMax:2},{m:20,rate:66,waitMin:1, waitMax:3},{m:30,rate:71,waitMin:2, waitMax:5}]
  }
};

const storeId = localStorage.getItem("ssgp_store") || "wolgye";
const currentStore = STORE_DATA.find(s=>s.id===storeId) || STORE_DATA[0];

function level(rate){
  if(rate>=100) return {name:"만차",cls:"level-red"};
  if(rate>=70) return {name:"혼잡",cls:"level-yellow"};
  return {name:"여유",cls:"level-green"};
}

function initCommon(){
  const nameEls=document.querySelectorAll("[data-store-name]");
  nameEls.forEach(el=>el.textContent=currentStore.name);
  const selectName=document.querySelector("#currentStoreName");
  if(selectName) selectName.textContent=currentStore.name;

  initStoreDrawer();
  initTabs();
  initAlertToggle();
}

function favorites(){
  try{return JSON.parse(localStorage.getItem("ssgp_favorites")||'["wolgye"]')}catch{return["wolgye"]}
}
function saveFavorites(a){localStorage.setItem("ssgp_favorites",JSON.stringify(a))}

function initStoreDrawer(){
  const drawer=document.querySelector("#storeDrawer"), overlay=document.querySelector("#drawerOverlay");
  const trigger=document.querySelector("#storeTrigger"), close=document.querySelector("#drawerClose");
  if(!drawer||!trigger)return;

  const render=()=>{
    const fav=favorites();
    const favBox=drawer.querySelector("#favoriteStores");
    const allBox=drawer.querySelector("#allStores");

    const row=(s)=>`<div class="store-item">
      <button class="favorite-btn ${fav.includes(s.id)?"on":""}" data-fav="${s.id}" aria-label="즐겨찾기">${fav.includes(s.id)?"★":"☆"}</button>
      <button class="store-name-btn" data-pick-store="${s.id}">${s.name}</button>
    </div>`;

    favBox.innerHTML=fav.length?STORE_DATA.filter(s=>fav.includes(s.id)).map(row).join(""):`<div class="note">☆을 눌러 자주 방문하는 점포를 추가해 보세요.</div>`;
    allBox.innerHTML=STORE_DATA.map(row).join("");

    drawer.querySelectorAll("[data-fav]").forEach(btn=>btn.onclick=(e)=>{
      e.stopPropagation();let arr=favorites(),id=btn.dataset.fav;
      arr=arr.includes(id)?arr.filter(x=>x!==id):[...arr,id];saveFavorites(arr);render();
    });
    drawer.querySelectorAll("[data-pick-store]").forEach(btn=>btn.onclick=()=>{
      localStorage.setItem("ssgp_store",btn.dataset.pickStore);location.reload();
    });
  };
  render();
  const open=()=>{drawer.classList.add("open");overlay.classList.add("open")};
  const hide=()=>{drawer.classList.remove("open");overlay.classList.remove("open")};
  trigger.onclick=open;close.onclick=hide;overlay.onclick=hide;
}

function initTabs(){
  document.querySelectorAll("[data-tab-group]").forEach(group=>{
    const buttons=group.querySelectorAll("[data-tab]");
    const targetName=group.dataset.tabGroup;
    const targets=document.querySelectorAll(`[data-tab-content-group="${targetName}"]`);
    buttons.forEach(btn=>btn.onclick=()=>{
      buttons.forEach(b=>b.classList.remove("active")); btn.classList.add("active");
      targets.forEach(t=>t.classList.toggle("active", t.dataset.tabContent===btn.dataset.tab));
    });
  });
}

function initAlertToggle(){
  const el=document.querySelector("#alertToggle");
  if(!el)return;
  const key=`ssgp_alert_${storeId}`;
  el.checked=localStorage.getItem(key)==="on";
  el.onchange=()=>{
    localStorage.setItem(key,el.checked?"on":"off");
    if(el.checked){
      const p=PARKING[storeId].overall; const l=level(p.rate);
      localStorage.setItem(`ssgp_alert_base_${storeId}`,JSON.stringify({rate:p.rate,level:l.name,started:Date.now()}));
      toast(`알림이 켜졌어요. 현재 ${l.name} ${p.rate}%를 기준으로 2시간 동안 확인합니다.`);
      if("Notification" in window && Notification.permission==="default") Notification.requestPermission();
    }else toast("혼잡도 변화 알림이 꺼졌어요.");
  };
}

function toast(msg){
  let t=document.createElement("div");t.textContent=msg;
  Object.assign(t.style,{position:"fixed",left:"50%",bottom:"92px",transform:"translateX(-50%)",zIndex:"999",background:"#231916",color:"#fff",padding:"11px 15px",borderRadius:"12px",fontSize:"12px",maxWidth:"88%",boxShadow:"0 10px 30px rgba(0,0,0,.2)"});
  document.body.appendChild(t);setTimeout(()=>t.remove(),2600)
}

function renderParking(){
  const p=PARKING[storeId]; if(!p)return;
  const o=p.overall,l=level(o.rate);

document.querySelector("#overallRate").textContent = o.rate + "%";
document.querySelector("#overallTotal").textContent = o.total + "면";

const availableEl = document.querySelector("#overallAvailable");
availableEl.textContent = o.available + "면";

// 현재 혼잡도에 따라 잔여 주차면 글자 색상 변경
if (o.rate >= 100) {
  availableEl.style.color = "#E3483F"; // 만차: 빨간색
} else if (o.rate >= 70) {
  availableEl.style.color = "#E5A000"; // 혼잡: 노란색
} else {
  availableEl.style.color = "#016922"; // 여유: 초록색
}

  const pill=document.querySelector("#overallLevel");pill.className=`siren-pill ${l.cls}`;pill.innerHTML=`<span class="siren-dot"></span>${l.name}`;
  const progress=document.querySelector("#overallProgress");progress.style.width=Math.min(o.rate,100)+"%"; progress.classList.toggle("is-yellow",o.rate>=70&&o.rate<100);progress.classList.toggle("is-red",o.rate>=100);
  document.querySelector("#overallNormal").textContent=o.normal+"면";
  document.querySelector("#overallDisabled").textContent=o.disabled+"면";
  document.querySelector("#overallEv").textContent=o.ev+"면";

  const tabs=document.querySelector("#floorTabs"),panels=document.querySelector("#floorPanels");
  tabs.innerHTML="";panels.innerHTML="";
  Object.entries(p.floors).forEach(([name,f],i)=>{
    const fl=level(f.rate);
    tabs.insertAdjacentHTML("beforeend",`<button class="floor-tab ${i===0?"active":""}" data-floor="${name}">${name}</button>`);
    panels.insertAdjacentHTML("beforeend",`<div class="floor-panel ${i===0?"active":""}" data-floor-panel="${name}">
      <div class="floor-summary">
        <div class="floor-summary-top"><div><h3>${name}</h3><p>점유율 ${f.rate}% · 잔여 ${f.available}면</p></div><div class="siren-pill ${fl.cls}"><span class="siren-dot"></span>${fl.name}</div></div>
        <div class="type-row" style="margin-top:14px">
          <div class="type-box"><span>일반주차구역</span><strong>${f.normal}면</strong></div>
          <div class="type-box"><span>장애인주차구역</span><strong>${f.disabled}면</strong></div>
          <div class="type-box"><span>전기차 충전구역</span><strong>${f.ev===null?"구역 없음":f.ev+"면"}</strong></div>
        </div>
      </div></div>`);
  });
  tabs.querySelectorAll("[data-floor]").forEach(btn=>btn.onclick=()=>{
    tabs.querySelectorAll(".floor-tab").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
    panels.querySelectorAll(".floor-panel").forEach(x=>x.classList.toggle("active",x.dataset.floorPanel===btn.dataset.floor));
  });

const pred = document.querySelector("#predictionGrid");

pred.innerHTML = p.prediction.map(x => {
  const ll = level(x.rate);

  return `
    <div class="pred">
      <span>${x.m}분 후</span>

      <div class="siren-pill ${ll.cls}"
           style="justify-content:center">
        <span class="siren-dot"></span>
        ${ll.name}
      </div>

      <strong>${x.rate}%</strong>

      <p style="font-size:11px; color:#74726f; margin:12px 0 4px;">
        예상 대기시간
      </p>

      <strong style="font-size:14px; color:#231916;">
        약 ${x.waitMin}~${x.waitMax}분
      </strong>
    </div>
  `;
}).join("");

  document.querySelector("#alertBaseText").textContent=`현재 기준 ${l.name} ${o.rate}% · 2시간 유지`;
}

function initVoice(){
  const mic=document.querySelector("#micBtn");if(!mic)return;
  const status=document.querySelector("#micStatus"), recText=document.querySelector("#recognized"),answer=document.querySelector("#answer"),replay=document.querySelector("#replay");
  let last="";
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){status.textContent="이 브라우저에서는 음성인식이 지원되지 않습니다. Chrome 사용을 권장합니다.";mic.disabled=true;return}
  const r=new SR();r.lang="ko-KR";r.interimResults=false;
  mic.onclick=()=>r.start();
  r.onstart=()=>{mic.classList.add("listening");status.textContent="듣고 있어요. 질문해 주세요."};
  r.onend=()=>{mic.classList.remove("listening");status.textContent="마이크 버튼을 눌러 다시 질문할 수 있어요."};
  r.onerror=()=>status.textContent="음성을 인식하지 못했습니다. 다시 시도해 주세요.";
  r.onresult=e=>{
    const q=e.results[0][0].transcript;recText.textContent=`“${q}”`;last=answerQuestion(q);answer.textContent=last;speak(last);replay.disabled=false
  };
  replay.onclick=()=>last&&speak(last);
}

function answerQuestion(q){
  const p=PARKING[storeId],store=currentStore.name;
  if(q.includes("전기차")||q.includes("충전")) return `현재 ${store} 전기차 충전 가능 주차구역은 ${p.overall.ev}면 남아 있습니다.`;
  const floor=Object.keys(p.floors).find(f=>q.includes(f));
  if(floor){const f=p.floors[floor],l=level(f.rate);return `현재 ${floor} 잔여 주차면은 ${f.available}면이며, 혼잡도는 ${l.name}입니다.`}
  if(q.includes("혼잡")||q.includes("주차장")||q.includes("자리")||q.includes("빈자리")){
    const o=p.overall,l=level(o.rate);return `현재 ${store} 주차장 혼잡도는 ${l.name}이며, 점유율은 ${o.rate}퍼센트, 잔여 주차면은 ${o.available}면입니다.`
  }
  return "현재는 전체 주차 현황, 층별 빈자리, 전기차 충전구역 질문을 안내할 수 있습니다.";
}
function speak(text){
  if(!("speechSynthesis" in window))return;
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="ko-KR";speechSynthesis.speak(u)
}


function initVehicle() {
  const floorBtns = document.querySelectorAll("[data-map-floor]");
  const img = document.querySelector("#floorMap");
  const label = document.querySelector("#floorMapLabel");
  const pin = document.querySelector("#carPin");

  const registered = localStorage.getItem("ssgp_vehicle");
  const locator = document.querySelector("#vehicleLocator");
  const msg = document.querySelector("#noVehicleMsg");

  // 차량 등록 전에는 위치 확인 영역을 숨김
  if (!registered) {
    if (locator) locator.hidden = true;
    if (msg) msg.hidden = false;
    return;
  }

  let reg;
  try {
    reg = JSON.parse(registered);
  } catch {
    reg = null;
  }

  if (!reg || !img || !pin) return;

  // 차량 등록 후 위치 확인 영역 표시
  if (locator) locator.hidden = false;
  if (msg) msg.hidden = true;

  const full =
    `${reg.region !== "지역 없음" ? reg.region + " " : ""}` +
    `${reg.front}${reg.middle}${reg.back}`;

  document.querySelectorAll("[data-vehicle-number]").forEach(el => {
    el.textContent = full;
  });

  // 시뮬레이션 차량 위치: 4층 한 곳으로 고정
  const fixedPosition = {
    floor: "4층",
    x: 0.545,
    y: 0.425
  };

  const spotName = document.querySelector("#selectedSpotName");

  if (spotName) {
    spotName.textContent = "4층 · 지정 주차면 (시뮬레이션)";
  }

  function changeFloor(floor) {
    floorBtns.forEach(btn => {
      btn.classList.toggle(
        "active",
        btn.dataset.mapFloor === floor
      );
    });

    // 5층은 3층 도면을 재사용
    const imageFloor = floor === "5층"
      ? "3"
      : floor.replace("층", "");

    img.src = `assets/images/floor${imageFloor}_cropped.png`;

    label.textContent = floor === "5층"
      ? "5층 옥상 · 3층 도면 기반 시뮬레이션"
      : `${floor} 주차장 도면`;

    // 지정된 4층에서만 차량 마커 표시
    if (floor === fixedPosition.floor) {
      pin.style.display = "grid";
      pin.style.left = (fixedPosition.x * 100) + "%";
      pin.style.top = (fixedPosition.y * 100) + "%";
    } else {
      pin.style.display = "none";
    }
  }

  // 층 선택은 가능하지만 차량 위치는 변경 불가
  floorBtns.forEach(btn => {
    btn.onclick = () => changeFloor(btn.dataset.mapFloor);
  });

  // 처음에는 4층 도면 표시
  changeFloor("4층");
}


function initRegister(){
  const form=document.querySelector("#vehicleForm");if(!form)return;
  form.onsubmit=e=>{
    e.preventDefault();
    const data={region:form.region.value,front:form.front.value,middle:form.middle.value,back:form.back.value};
    localStorage.setItem("ssgp_vehicle",JSON.stringify(data));
    toast("차량번호가 등록되었습니다.");
    setTimeout(()=>location.href="vehicle.html",700);
  };
}

document.addEventListener("DOMContentLoaded",()=>{
  initCommon();
  if(document.body.dataset.page==="parking")renderParking();
  if(document.body.dataset.page==="voice")initVoice();
  if(document.body.dataset.page==="vehicle")initVehicle();
  if(document.body.dataset.page==="register")initRegister();
});


if (!document.querySelector('script[src$="scheduled-alert.js"]')) {
  const script = document.createElement("script");
  script.src = "assets/js/scheduled-alert.js";
  document.body.appendChild(script);
}
