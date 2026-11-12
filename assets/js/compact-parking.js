/* SSG-P 경차구역 표시 패치: 원래 main.js를 변경하지 않고 주차현황 화면에 경차 면수를 추가합니다.
 * 수치는 사용자가 요청한 2~3면/층 가상 잔여면수이며, 실제 운영 데이터가 아닙니다.
 */
(function () {
  "use strict";
  const simulatedCompact = {
    wolgye: { "3층": 2, "4층": 0, "5층": 0, "5층(옥상)": 0 },
    hanam: { "B1": 2, "B2": 3, "B3": 2, "3층": 2, "4층": 3, "야외": 2, "야외주차장": 2,
      "지하 1층": 2, "지하 2층": 3, "지하 3층": 2, "지상 3층(주말 운영)": 2, "지상 4층(주말 운영)": 3 },
    ilsan: { "B2": 3, "B3": 2, "옥상": 0, "옥상주차장": 0, "지하 2층": 3, "지하 3층": 2 },
    guseong: { "B1": 2, "B2": 3 }
  };
  function numberFromStrong(element) {
    const match=(element?.textContent||"").replaceAll(",", "").match(/\d+/);
    return match?Number(match[0]):null;
  }
  function createCompactCard(value) {
    const node=document.createElement("div");
    node.className="type-box ssgp-compact-card";
    const label=document.createElement("span");
    label.textContent="경차구역";
    const strong=document.createElement("strong");
    strong.textContent=`${value}면`;
    node.append(label,strong);
    return node;
  }
  function apply() {
    if(document.body.dataset.page!=="parking")return;
    const id=localStorage.getItem("ssgp_store")||"wolgye";
    const config=simulatedCompact[id]||simulatedCompact.wolgye;
    const tabs=document.querySelector("#floorPanels");
    if(!tabs || !tabs.querySelector(".floor-panel"))return;
    const floorCards=Array.from(tabs.querySelectorAll(".floor-panel"));
    let total=0;
    for (const panel of floorCards) {
      const floor=panel.getAttribute("data-floor-panel")||"";
      const row=panel.querySelector(".type-row");
      if(!row || row.querySelector(".ssgp-compact-card"))continue;
      const normal=row.querySelector(".type-box strong");
      const initial=numberFromStrong(normal);
      const free=numberFromStrong(panel.querySelector(".floor-summary p"));
      // 만차 층의 경차 잔여면은 반드시 0면.
      const rateMatch=panel.querySelector(".floor-summary p")?.textContent.match(/점유율\s*(\d+)%/);
      const isFull=rateMatch && Number(rateMatch[1])>=100;
      const requested=Number(config[floor] ?? 2);
      const compact=isFull?0:Math.min(requested,Math.max(0,initial??0));
      if(initial!==null)normal.textContent=`${initial-compact}면`;
      row.appendChild(createCompactCard(compact));
      total+=compact;
    }
    const overallRow=document.querySelector(".status-hero > .type-row");
    if(overallRow && !overallRow.querySelector(".ssgp-compact-card")) {
      const normalStrong=document.querySelector("#overallNormal");
      const original=numberFromStrong(normalStrong);
      const compact=original==null?total:Math.min(total,original);
      if(original!==null)normalStrong.textContent=`${original-compact}면`;
      overallRow.appendChild(createCompactCard(compact));
      const info=document.createElement("p");
      info.className="ssgp-compact-notice";
      info.textContent="※ 경차구역 잔여면수는 층별로 0~3면을 설정한 시연용 수치입니다.";
      overallRow.after(info);
    }
  }
  const css=document.createElement('style');
  css.textContent=`
    body[data-page="parking"] .status-hero > .type-row,
    body[data-page="parking"] .floor-summary .type-row {
      display:grid !important;grid-template-columns:repeat(2,minmax(0,1fr)) !important;gap:9px !important;
    }
    body[data-page="parking"] .status-hero .type-box,
    body[data-page="parking"] .floor-summary .type-box {
      aspect-ratio:1.35 / 1;min-width:0;min-height:95px;display:flex;flex-direction:column;
      justify-content:center;gap:8px;box-sizing:border-box;
    }
    body[data-page="parking"] .ssgp-compact-notice {font-size:11px;color:#777;margin:10px 3px 0;line-height:1.5;}
    @media(max-width:380px) {body[data-page="parking"] .status-hero .type-box,
      body[data-page="parking"] .floor-summary .type-box{min-height:88px;padding:11px 9px;}}
  `;
  document.head.appendChild(css);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>queueMicrotask(apply));
  else queueMicrotask(apply);
})();