const STORE_DATA = [
  { id: "wolgye", name: "트레이더스 월계점" },
  { id: "hanam", name: "트레이더스 하남점" },
  { id: "ilsan", name: "트레이더스 일산점" }
];

const PARKING = {

wolgye: {
  overall: {
    rate: 84,
    total: 1274,
    available: 206,
    normal: 199,
    disabled: 3,
    ev: 4
  },

  floors: {
    "3층": {
      rate: 94,
      total: 430,
      available: 24,
      normal: 21,
      disabled: 3,
      ev: null
    },

    "4층": {
      rate: 95,
      total: 420,
      available: 22,
      normal: 18,
      disabled: 0,
      ev: 4
    },

    "5층": {
      rate: 62,
      total: 424,
      available: 160,
      normal: 160,
      disabled: 0,
      ev: null
    }
  },

  prediction: [
    { m: 10, rate: 86, waitMin: 2, waitMax: 5 },
    { m: 20, rate: 89, waitMin: 4, waitMax: 7 },
    { m: 30, rate: 92, waitMin: 6, waitMax: 10 }
  ]
},

  hanam: {
    // 전체 6,200면 및 층 구성은 사용자 제공 정보, 점유율과 층별 배정은 시연용입니다.
    // 전기차 94면은 충전구역 총 규모이며 잔여 면수가 아닙니다.
    evInstalledTotal: 94,
    overall: { rate: 100, total: 6200, available: 0, normal: 0, disabled: 0, ev: 0 },
    floors: {
      "B1": { rate: 100, total: 1000, available: 0, normal: 0, disabled: 0, ev: 0 },
      "B2": { rate: 100, total: 1150, available: 0, normal: 0, disabled: 0, ev: 0 },
      "B3": { rate: 100, total: 1100, available: 0, normal: 0, disabled: 0, ev: 0 },
      "3층": { rate: 100, total: 1225, available: 0, normal: 0, disabled: 0, ev: 0 },
      "4층": { rate: 100, total: 1125, available: 0, normal: 0, disabled: 0, ev: 0 },
      "야외": { rate: 100, total: 600, available: 0, normal: 0, disabled: 0, ev: 0 }
    },
    prediction: [
      { m: 10, rate: 100, waitMin: 12, waitMax: 18 },
      { m: 20, rate: 100, waitMin: 15, waitMax: 22 },
      { m: 30, rate: 100, waitMin: 18, waitMax: 25 }
    ]
  },
  ilsan: {
    overall: { rate: 61, total: 1374, available: 536, normal: 512, disabled: 12, ev: 12 },
    floors: {
      "B2": { rate: 58, total: 520, available: 218, normal: 210, disabled: 8, ev: null },
      "B3": { rate: 68, total: 504, available: 162, normal: 146, disabled: 4, ev: 12 },
      "옥상": { rate: 55, total: 350, available: 156, normal: 156, disabled: 0, ev: null }
    },
    prediction: [
      { m: 10, rate: 65, waitMin: 0, waitMax: 2 },
      { m: 20, rate: 70, waitMin: 1, waitMax: 3 },
      { m: 30, rate: 76, waitMin: 2, waitMax: 5 }
    ]
  }
};

const VEHICLE_MAPS = {
  wolgye: {
    floors: [
      { key: "3층", label: "3층", image: "assets/images/floor3_cropped.png", note: "월계점 3층 · 가상 도면으로 대체 표시(시뮬레이션)" },
      { key: "4층", label: "4층", image: "assets/images/floor4_cropped.png", note: "월계점 4층 · 가상 도면으로 대체 표시(시뮬레이션)" },
      { key: "5층", label: "5층(옥상)", image: "assets/images/wolgye_5f_area.png", note: "5층 옥상 · 가상 도면으로 대체 표시(시뮬레이션)" }
    ],
    pin: { floor: "4층", x: 0.545, y: 0.415 },
    spotName: "4층 · 지정 주차면 (시뮬레이션)"
  },
  hanam: {
    floors: [
      { key: "B1", label: "지하 1층", image: "assets/images/floor3_cropped.png", note: "하남점 지하 1층 · 시뮬레이션 배치도" },
      { key: "B2", label: "지하 2층", image: "assets/images/floor3_cropped.png", note: "하남점 지하 2층 · 시뮬레이션 배치도" },
      { key: "B3", label: "지하 3층", image: "assets/images/floor3_cropped.png", note: "하남점 지하 3층 · 시뮬레이션 배치도" },
      { key: "3층", label: "3층(주말 운영)", image: "assets/images/floor3_cropped.png", note: "하남점 3층 · 시뮬레이션 배치도" },
      { key: "4층", label: "4층(주말 운영)", image: "assets/images/floor3_cropped.png", note: "하남점 4층 · 시뮬레이션 배치도" },
      { key: "야외", label: "야외주차장", image: "assets/images/floor3_cropped.png", note: "하남점 야외주차장 · 시뮬레이션 배치도" }
    ],

    pin: { floor: "B2", x: 0.588, y: 0.654 },
    spotName: "지하 2층 · 지정 주차면 (시뮬레이션)"
  },
  ilsan: {
    floors: [
      { key: "B2", label: "지하 2층", image: "assets/images/ilsan_b2.png", note: "일산점 지하 2층 주차장 도면" },
      { key: "B3", label: "지하 3층", image: "assets/images/ilsan_b2.png", note: "일산점 지하 3층 · 지하 2층 도면 기반 시뮬레이션" },
      { key: "옥상", label: "3층(옥상)", image: "assets/images/ilsan_roof_area.png", note: "일산점 옥상 · 가상 도면 기반 시뮬레이션" }
    ],
    pin: { floor: "B2", x: 0.58, y: 0.63 },
    spotName: "지하 2층 · 지정 주차면 (시뮬레이션)"
  }
};

function normalizeStoreId(id) {
  return id === "guseong" ? "ilsan" : id;
}

const rawStoredStoreId = localStorage.getItem("ssgp_store") || "wolgye";
const storeId = normalizeStoreId(rawStoredStoreId);
if (rawStoredStoreId !== storeId) {
  localStorage.setItem("ssgp_store", storeId);
}
const currentStore = STORE_DATA.find(s => s.id === storeId) || STORE_DATA[0];

function level(rate) {
  if (rate >= 100) return { name: "만차", cls: "level-red" };
  if (rate >= 70) return { name: "혼잡", cls: "level-yellow" };
  return { name: "여유", cls: "level-green" };
}
function getSignalColor(rate){
  if(rate >= 100) return "red";
  if(rate >= 70) return "yellow";
  return "green";
}

function renderOverallTraffic(rate){
  const wrap = document.querySelector("#overallTrafficLight");
  const text = document.querySelector("#overallTrafficText");
  if(!wrap || !text) return;

  const green = wrap.querySelector(".green");
  const yellow = wrap.querySelector(".yellow");
  const red = wrap.querySelector(".red");

  green.className = "light green";
  yellow.className = "light yellow";
  red.className = "light red";
  text.className = "traffic-label";

  const l = level(rate);
  const color = getSignalColor(rate);

  if(color === "green"){
    green.classList.add("on", "green");
    text.classList.add("green");
  }else if(color === "yellow"){
    yellow.classList.add("on", "yellow");
    text.classList.add("yellow");
  }else{
    red.classList.add("on", "red");
    text.classList.add("red");
  }

  text.textContent = l.name;
}

function miniSignalHTML(rate){
  const l = level(rate);
  const color = getSignalColor(rate);

  return `
    <div class="mini-signal ${color}" aria-label="${l.name}">
      <span class="mini-light"></span>
      <span>${l.name}</span>
    </div>
  `;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function displayFloorLabel(store, floorName) {
  if (store === "wolgye" && floorName === "5층") return "5층(옥상)";
  if (store === "hanam" && (floorName === "3층" || floorName === "4층")) return ` ${floorName} · 주말 운영`;
  if (store === "hanam" && floorName === "야외") return "야외주차장";
  if (store === "ilsan" && floorName === "옥상") return "3층(옥상)";
  return floorName;
}

function initCommon() {
  const nameEls = document.querySelectorAll("[data-store-name]");
  nameEls.forEach(el => el.textContent = currentStore.name);
  const selectName = document.querySelector("#currentStoreName");
  if (selectName) selectName.textContent = currentStore.name;

  improveStoreTriggerUI();
  initStoreDrawer();
  initTabs();
  initAlertToggle();
}

function improveStoreTriggerUI() {
  const chev = document.querySelector(".store-trigger .chev");
  if (chev) chev.textContent = "▾";

  if (document.querySelector("#ssgpStoreTriggerStyle")) return;
  const css = document.createElement("style");
  css.id = "ssgpStoreTriggerStyle";
  css.textContent = `
    .store-trigger { display:inline-flex; align-items:center; gap:10px; }
    .store-trigger .store-icon { display:inline-flex; align-items:center; justify-content:center; flex:0 0 auto; }
    .store-trigger #currentStoreName { display:inline-flex; align-items:center; line-height:1.15; }
    .store-trigger .chev { display:inline-flex; align-items:center; justify-content:center; margin-left:1px; font-size:14px; line-height:1; color:#8a8682; transform:translateY(-1px); }
  `;
  document.head.appendChild(css);
}

function favorites() {
  try {
    const list = JSON.parse(localStorage.getItem("ssgp_favorites") || '["wolgye"]');
    const migrated = list.map(normalizeStoreId).filter((id, idx, arr) => arr.indexOf(id) === idx);
    localStorage.setItem("ssgp_favorites", JSON.stringify(migrated));
    return migrated;
  } catch {
    return ["wolgye"];
  }
}

function saveFavorites(arr) {
  localStorage.setItem("ssgp_favorites", JSON.stringify(arr));
}

function initStoreDrawer() {
  const drawer = document.querySelector("#storeDrawer");
  const overlay = document.querySelector("#drawerOverlay");
  const trigger = document.querySelector("#storeTrigger");
  const close = document.querySelector("#drawerClose");
  if (!drawer || !trigger) return;

  const render = () => {
    const fav = favorites();
    const favBox = drawer.querySelector("#favoriteStores");
    const allBox = drawer.querySelector("#allStores");

    const row = s => `
      <div class="store-item">
        <button class="favorite-btn ${fav.includes(s.id) ? "on" : ""}" data-fav="${s.id}" aria-label="즐겨찾기">
          ${fav.includes(s.id) ? "★" : "☆"}
        </button>
        <button class="store-name-btn" data-pick-store="${s.id}">${escapeHtml(s.name)}</button>
      </div>`;

    favBox.innerHTML = fav.length
      ? STORE_DATA.filter(s => fav.includes(s.id)).map(row).join("")
      : `<div class="note">☆을 눌러 자주 방문하는 점포를 추가해 보세요.</div>`;

    allBox.innerHTML = STORE_DATA.map(row).join("");

    drawer.querySelectorAll("[data-fav]").forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        let arr = favorites();
        const id = btn.dataset.fav;
        arr = arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id];
        saveFavorites(arr);
        render();
      };
    });

    drawer.querySelectorAll("[data-pick-store]").forEach(btn => {
      btn.onclick = () => {
        localStorage.setItem("ssgp_store", btn.dataset.pickStore);
        location.reload();
      };
    });
  };

  render();
  const open = () => {
    drawer.classList.add("open");
    overlay.classList.add("open");
  };
  const hide = () => {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
  };
  trigger.onclick = open;
  if (close) close.onclick = hide;
  if (overlay) overlay.onclick = hide;
}

function initTabs() {
  document.querySelectorAll("[data-tab-group]").forEach(group => {
    const buttons = group.querySelectorAll("[data-tab]");
    const targetName = group.dataset.tabGroup;
    const targets = document.querySelectorAll(`[data-tab-content-group="${targetName}"]`);
    buttons.forEach(btn => {
      btn.onclick = () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        targets.forEach(t => t.classList.toggle("active", t.dataset.tabContent === btn.dataset.tab));
      };
    });
  });
}

function initAlertToggle() {
  const el = document.querySelector("#alertToggle");
  if (!el) return;
  const key = `ssgp_alert_${storeId}`;
  el.checked = localStorage.getItem(key) === "on";
  el.onchange = () => {
    localStorage.setItem(key, el.checked ? "on" : "off");
    if (el.checked) {
      const p = PARKING[storeId].overall;
      const l = level(p.rate);
      localStorage.setItem(`ssgp_alert_base_${storeId}`, JSON.stringify({ rate: p.rate, level: l.name, started: Date.now() }));
      toast(`알림이 켜졌어요. 현재 ${l.name} ${p.rate}%를 기준으로 2시간 동안 확인합니다.`);
      if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
    } else {
      toast("혼잡도 변화 알림이 꺼졌어요.");
    }
  };
}

function toast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  Object.assign(t.style, {
    position: "fixed",
    left: "50%",
    bottom: "92px",
    transform: "translateX(-50%)",
    zIndex: "999",
    background: "#231916",
    color: "#fff",
    padding: "11px 15px",
    borderRadius: "12px",
    fontSize: "12px",
    maxWidth: "88%",
    boxShadow: "0 10px 30px rgba(0,0,0,.2)"
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

function renderParking() {
  const p = PARKING[storeId];
  if (!p) return;
  const o = p.overall;
  const l = level(o.rate);

  document.querySelector("#overallRate").textContent = o.rate + "%";
  document.querySelector("#overallTotal").textContent = o.total + "면";

  const availableEl = document.querySelector("#overallAvailable");
  availableEl.textContent = o.available + "면";
  if (o.rate >= 100) availableEl.style.color = "#E3483F";
  else if (o.rate >= 70) availableEl.style.color = "#E5A000";
  else availableEl.style.color = "#016922";

  renderOverallTraffic(o.rate);

  const progress = document.querySelector("#overallProgress");
  progress.style.width = Math.min(o.rate, 100) + "%";
  progress.classList.toggle("is-yellow", o.rate >= 70 && o.rate < 100);
  progress.classList.toggle("is-red", o.rate >= 100);

  document.querySelector("#overallNormal").textContent = o.normal + "면";
  document.querySelector("#overallDisabled").textContent = o.disabled + "면";
  document.querySelector("#overallEv").textContent = o.ev === null ? "확인 필요" : o.ev + "면";

  const tabs = document.querySelector("#floorTabs");
  const panels = document.querySelector("#floorPanels");
  tabs.innerHTML = "";
  panels.innerHTML = "";

  Object.entries(p.floors).forEach(([name, f], i) => {
    const fl = level(f.rate);
    const label = displayFloorLabel(storeId, name);
    const weekendNote = storeId === "hanam" && (name === "3층" || name === "4층") ? " · 주말 운영" : "";
    tabs.insertAdjacentHTML("beforeend", `<button class="floor-tab ${i === 0 ? "active" : ""}" data-floor="${name}">${label}</button>`);
    panels.insertAdjacentHTML("beforeend", `
      <div class="floor-panel ${i === 0 ? "active" : ""}" data-floor-panel="${name}">
        <div class="floor-summary">
          <div class="floor-summary-top">
            <div>
              <h3>${label}</h3>
              <p>점유율 ${f.rate}% · 잔여 ${f.available}면${weekendNote}</p>
            </div>
            ${miniSignalHTML(f.rate)}
          </div>
          <div class="type-row" style="margin-top:14px">
            <div class="type-box"><span>일반주차구역</span><strong>${f.normal}면</strong></div>
            <div class="type-box"><span>장애인주차구역</span><strong>${f.disabled}면</strong></div>
            <div class="type-box"><span>전기차 충전구역</span><strong>${f.ev === null ? "확인 필요" : f.ev + "면"}</strong></div>
          </div>
        </div>
      </div>`);
  });

  tabs.querySelectorAll("[data-floor]").forEach(btn => {
    btn.onclick = () => {
      tabs.querySelectorAll(".floor-tab").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      panels.querySelectorAll(".floor-panel").forEach(x => x.classList.toggle("active", x.dataset.floorPanel === btn.dataset.floor));
    };
  });

  const pred = document.querySelector("#predictionGrid");
  pred.innerHTML = p.prediction.map(x => {
    const ll = level(x.rate);
    return `
      <div class="pred">
        <span>${x.m}분 후</span>
        <div class="siren-pill ${ll.cls}" style="justify-content:center">
          <span class="siren-dot"></span>${ll.name}
        </div>
        <strong>${x.rate}%</strong>
        <p style="font-size:11px; color:#74726f; margin:12px 0 4px;">예상 대기시간</p>
        <strong style="font-size:14px; color:#231916;">약 ${x.waitMin}~${x.waitMax}분</strong>
      </div>`;
  }).join("");


const alertBaseText = document.querySelector("#alertBaseText");

if (alertBaseText) {
  alertBaseText.textContent =
    `현재 기준 ${l.name} ${o.rate}% · 2시간 유지`;
}

}

function initVoice() {
  const mic = document.querySelector("#micBtn");
  if (!mic) return;
  const status = document.querySelector("#micStatus");
  const recText = document.querySelector("#recognized");
  const answer = document.querySelector("#answer");
  const replay = document.querySelector("#replay");
  let last = "";
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    status.textContent = "이 브라우저에서는 음성인식이 지원되지 않습니다. Chrome 사용을 권장합니다.";
    mic.disabled = true;
    return;
  }
  const r = new SR();
  r.lang = "ko-KR";
  r.interimResults = false;
  mic.onclick = () => r.start();
  r.onstart = () => {
    mic.classList.add("listening");
    status.textContent = "듣고 있어요. 질문해 주세요.";
  };
  r.onend = () => {
    mic.classList.remove("listening");
    status.textContent = "마이크 버튼을 눌러 다시 질문할 수 있어요.";
  };
  r.onerror = () => status.textContent = "음성을 인식하지 못했습니다. 다시 시도해 주세요.";
  r.onresult = e => {
    const q = e.results[0][0].transcript;
    recText.textContent = `“${q}”`;
    last = answerQuestion(q);
    answer.textContent = last;
    speak(last);
    replay.disabled = false;
  };
  replay.onclick = () => last && speak(last);
}

function answerQuestion(q) {
  const p = PARKING[storeId];
  const store = currentStore.name;
  if (q.includes("전기차") || q.includes("충전")) {
    return `현재 ${store} 전기차 충전 가능 주차구역은 ${p.overall.ev === null ? 0 : p.overall.ev}면 남아 있습니다.`;
  }
  const floor = Object.keys(p.floors).find(f => q.includes(f));
  if (floor) {
    const f = p.floors[floor];
    const l = level(f.rate);
    return `현재 ${displayFloorLabel(storeId, floor)} 잔여 주차면은 ${f.available}면이며, 혼잡도는 ${l.name}입니다.`;
  }
  if (q.includes("혼잡") || q.includes("주차장") || q.includes("자리") || q.includes("빈자리")) {
    const o = p.overall;
    const l = level(o.rate);
    return `현재 ${store} 주차장 혼잡도는 ${l.name}이며, 점유율은 ${o.rate}퍼센트, 잔여 주차면은 ${o.available}면입니다.`;
  }
  return "현재는 전체 주차 현황, 층별 빈자리, 전기차 충전구역 질문을 안내할 수 있습니다.";
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;

  speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";

  // 밝고 친절한 안내 목소리
  u.rate = 1.05;     // 말하는 속도
  u.pitch = 1.15;    // 목소리 높낮이
  u.volume = 1.0;    // 음량

  // 사용 가능한 한국어 여성 음성을 우선 선택
  const voices = speechSynthesis.getVoices();
  const koreanVoices = voices.filter(v =>
    v.lang.toLowerCase().startsWith("ko")
  );

  const preferredVoice = koreanVoices.find(v =>
    /sunhi|heami|yuna|female|여성/i.test(v.name)
  );

  if (preferredVoice) {
    u.voice = preferredVoice;
  } else if (koreanVoices.length > 0) {
    u.voice = koreanVoices[0];
  }

  speechSynthesis.speak(u);
}

function initVehicle() {
  const img = document.querySelector("#floorMap");
  const label = document.querySelector("#floorMapLabel");
  const pin = document.querySelector("#carPin");
  const locator = document.querySelector("#vehicleLocator");
  const msg = document.querySelector("#noVehicleMsg");
  const tabsWrap = document.querySelector(".floor-tabs");
  const spotName = document.querySelector("#selectedSpotName");

  const registered = localStorage.getItem("ssgp_vehicle");
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

  if (locator) locator.hidden = false;
  if (msg) msg.hidden = true;

  const full = `${reg.region !== "지역 없음" ? reg.region + " " : ""}${reg.front}${reg.middle}${reg.back}`;
  document.querySelectorAll("[data-vehicle-number]").forEach(el => {
    el.textContent = full;
  });

  const config = VEHICLE_MAPS[storeId] || VEHICLE_MAPS.wolgye;
  if (spotName) {
    spotName.textContent = config.spotName;
  }

  if (tabsWrap) {
    tabsWrap.innerHTML = config.floors.map((floor, idx) => {
      return `<button class="floor-tab ${idx === 0 ? "active" : ""}" data-map-floor="${floor.key}">${floor.label}</button>`;
    }).join("");
  }

  const floorBtns = document.querySelectorAll("[data-map-floor]");

  function changeFloor(floorKey) {
    const floorInfo = config.floors.find(item => item.key === floorKey) || config.floors[0];
    floorBtns.forEach(btn => btn.classList.toggle("active", btn.dataset.mapFloor === floorKey));
    img.src = floorInfo.image;
    if (label) label.textContent = floorInfo.note;

    if (config.pin.floor === floorKey) {
      pin.style.display = "grid";
      pin.style.left = (config.pin.x * 100) + "%";
      pin.style.top = (config.pin.y * 100) + "%";
    } else {
      pin.style.display = "none";
    }
  }

  floorBtns.forEach(btn => {
    btn.onclick = () => changeFloor(btn.dataset.mapFloor);
  });

  changeFloor(config.pin.floor);
}

function initRegionPicker() {
  const select = document.querySelector('#vehicleForm select[name="region"]');
  if (!select) return;
  if (document.querySelector(".region-picker")) return;

  select.classList.add("region-native-select");

  const picker = document.createElement("div");
  picker.className = "region-picker";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "region-picker-trigger";
  trigger.setAttribute("aria-expanded", "false");

  const menu = document.createElement("div");
  menu.className = "region-picker-menu";
  menu.hidden = true;

  function closeMenu() {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    picker.classList.remove("open");
  }

  function openMenu() {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    picker.classList.add("open");
  }

  function updateTrigger() {
    trigger.innerHTML = "";
    const label = document.createElement("span");
    label.textContent = select.value;
    const arrow = document.createElement("span");
    arrow.textContent = "▾";
    arrow.className = "region-picker-arrow";
    trigger.append(label, arrow);
  }

  Array.from(select.options).forEach(option => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "region-picker-option";
    item.textContent = option.textContent;
    item.addEventListener("click", () => {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      updateTrigger();
      closeMenu();
      trigger.focus();
    });
    menu.appendChild(item);
  });

  trigger.addEventListener("click", () => {
    menu.hidden ? openMenu() : closeMenu();
  });
  trigger.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMenu();
    if (e.key === "ArrowDown" && menu.hidden) {
      e.preventDefault();
      openMenu();
      menu.querySelector("button")?.focus();
    }
  });
  menu.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeMenu();
      trigger.focus();
    }
  });
  document.addEventListener("click", e => {
    if (!picker.contains(e.target)) closeMenu();
  });

  picker.append(trigger, menu);
  select.insertAdjacentElement("afterend", picker);
  updateTrigger();
}

function initRegister() {
  const form = document.querySelector("#vehicleForm");
  if (!form) return;
  form.onsubmit = e => {
    e.preventDefault();
    const data = {
      region: form.region.value,
      front: form.front.value,
      middle: form.middle.value,
      back: form.back.value
    };
    localStorage.setItem("ssgp_vehicle", JSON.stringify(data));
    toast("차량번호가 등록되었습니다.");
    setTimeout(() => location.href = "vehicle.html", 700);
  };
}

function initVehicleDelete() {
  const btn = document.querySelector("#deleteVehicleBtn");
  if (!btn) return;
  btn.hidden = !localStorage.getItem("ssgp_vehicle");
  btn.addEventListener("click", () => {
    const confirmed = confirm("등록된 차량을 해제하시겠습니까?");
    if (!confirmed) return;
    localStorage.removeItem("ssgp_vehicle");
    window.location.reload();
  });
}

function initNearbyNavigation() {
  const page = document.body.dataset.page;
  if (page !== "parking" && page !== "nearby") return;

  if (!document.querySelector("#ssgpNearbyNavStyle")) {
    const css = document.createElement("style");
    css.id = "ssgpNearbyNavStyle";
    css.textContent = `
      .ssgp-nearby-callout { margin:18px 0 22px; padding:18px; border:1px solid #e9e7e4; border-radius:18px; background:#f8faf8; }
      .ssgp-nearby-callout h3 { margin:0 0 7px; color:#231916; font-size:17px; }
      .ssgp-nearby-callout p { margin:0 0 13px; font-size:12.5px; color:#74726f; line-height:1.65; }
      .ssgp-nearby-link { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; min-height:50px; border-radius:14px; background:#016922; color:#fff; text-decoration:none; font-weight:800; padding:12px 16px; border:2px solid transparent; }
      .ssgp-nearby-link:focus-visible, .ssgp-nearby-back:focus-visible { outline:3px solid #79b78d; outline-offset:3px; }
      .ssgp-nearby-callout.is-imminent { background:#fff4e7; border-color:#efb279; }
      .ssgp-nearby-callout.is-imminent .ssgp-nearby-link { background:#E87919; animation:ssgpBlinkOrange 1.15s ease-in-out infinite; }
      .ssgp-nearby-callout.is-full { background:#fff5f4; border-color:#ef8b84; }
      .ssgp-nearby-callout.is-full .ssgp-nearby-link { background:#d63d33; animation:ssgpBlinkRed 1s ease-in-out infinite; }
      .ssgp-nearby-back { display:inline-flex; align-items:center; gap:6px; margin:4px 0 16px; padding:10px 14px; border-radius:999px; background:#f4f7f5; color:#016922; text-decoration:none; font-weight:700; border:1px solid #dfe8e0; }
      @keyframes ssgpBlinkOrange { 0%, 100% { background:#E87919; box-shadow:0 0 0 0 rgba(232,121,25,.08); } 50% { background:#F5A13F; box-shadow:0 0 0 6px rgba(232,121,25,.25); } }
      @keyframes ssgpBlinkRed { 0%, 100% { background:#d63d33; box-shadow:0 0 0 0 rgba(214,61,51,.08); } 50% { background:#f05b4f; box-shadow:0 0 0 6px rgba(214,61,51,.25); } }
      @media (prefers-reduced-motion:reduce) {
        .ssgp-nearby-callout.is-imminent .ssgp-nearby-link,
        .ssgp-nearby-callout.is-full .ssgp-nearby-link { animation:none; outline:3px solid #efb326; }
      }
    `;
    document.head.appendChild(css);
  }

  if (page === "nearby") {
    const main = document.querySelector("main");
    if (main && !document.querySelector("#ssgpNearbyBack")) {
      const back = document.createElement("a");
      back.id = "ssgpNearbyBack";
      back.className = "ssgp-nearby-back";
      back.href = "parking.html";
      back.textContent = "← 주차현황으로 돌아가기";
      main.prepend(back);
    }
    return;
  }

  const current = PARKING[storeId]?.overall;
  if (!current || document.querySelector("#ssgpNearbyCallout")) return;
  const rate = current.rate;
  const imminent = rate >= 90 && rate < 100;
  const full = rate >= 100;

  const box = document.createElement("section");
  box.id = "ssgpNearbyCallout";
  box.className = `ssgp-nearby-callout${imminent ? " is-imminent" : ""}${full ? " is-full" : ""}`;

  const heading = document.createElement("h3");
  const detail = document.createElement("p");
  const link = document.createElement("a");
  link.href = "nearby.html";
  link.className = "ssgp-nearby-link";
  link.textContent = "주변 주차장 확인하기  →";

  if (full) {
    heading.textContent = "현재 만차 · 주변 주차장을 확인하세요";
    detail.textContent = "주차 가능한 면이 없습니다. 대체 주차장 위치를 확인해 보세요.";
  } else if (imminent) {
    heading.textContent = "만차 임박 · 주변 주차장을 확인하세요";
    detail.textContent = `현재 점유율 ${rate}% · 잔여 ${current.available}면. 만차 임박 기준은 90% 이상입니다.`;
  } else {
    heading.textContent = "주변 주차장도 확인해 보세요";
    detail.textContent = "주차 공간이 부족할 경우 주변 주차장을 확인할 수 있어요.";
  }

  box.append(heading, detail, link);
  const alertSection = document.querySelector("#scheduledAlertSection");

if (alertSection) {
  alertSection.insertAdjacentElement("afterend", box);
} else {
  document.querySelector("main")?.appendChild(box);
}
}

document.addEventListener("DOMContentLoaded", () => {
  initCommon();

  if (document.body.dataset.page === "parking") renderParking();
  if (document.body.dataset.page === "voice") initVoice();
  if (document.body.dataset.page === "vehicle") {
    initVehicle();
    initVehicleDelete();
  }
  if (document.body.dataset.page === "register") {
    initRegister();
    initRegionPicker();
  }

});

// 다른 주차·음성 기능의 초기화 오류와 무관하게 이동 버튼을 표시합니다.
document.addEventListener("DOMContentLoaded", initNearbyNavigation);

if (!document.querySelector('script[src$="scheduled-alert.js"]')) {
  const script = document.createElement("script");
  script.src = "assets/js/scheduled-alert.js";
  document.body.appendChild(script);
}

(function(){const s=document.createElement('script');s.src='assets/js/detail-header.js?v=20261107-1';document.body.appendChild(s)})();
