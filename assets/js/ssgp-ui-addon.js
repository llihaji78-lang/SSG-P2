/* SSG-P portal integration / centred section titles / three-light congestion signals.
   Add-on only: does not replace parking, maps, vehicle registration or notification logic. */
function initSSGPPortalUI() {
  const page = document.body.dataset.page;
  const detailPages = ['parking', 'nearby', 'voice', 'vehicle'];
  if (!detailPages.includes(page)) return;

  if (!document.querySelector('#ssgpPortalStyles')) {
    const style = document.createElement('style');
    style.id = 'ssgpPortalStyles';
    style.textContent = `
      body[data-page="parking"] .logo-row,
      body[data-page="nearby"] .logo-row,
      body[data-page="voice"] .logo-row,
      body[data-page="vehicle"] .logo-row { display:none; }
      body[data-page="parking"] .header-inner,
      body[data-page="nearby"] .header-inner,
      body[data-page="voice"] .header-inner,
      body[data-page="vehicle"] .header-inner { padding-top:10px; }
      body[data-page="parking"] .title-line,
      body[data-page="nearby"] .title-line,
      body[data-page="voice"] .title-line,
      body[data-page="vehicle"] .title-line {
        display:grid; grid-template-columns:44px minmax(0,1fr) 44px;
        align-items:center; gap:8px; margin-top:8px;
      }
      body[data-page="parking"] .page-title,
      body[data-page="nearby"] .page-title,
      body[data-page="voice"] .page-title,
      body[data-page="vehicle"] .page-title {
        text-align:center; font-size:23px; line-height:1.25; white-space:nowrap;
      }
      .ssgp-portal-home-btn {
        width:42px; height:42px; display:grid; place-items:center;
        border:1px solid #dfe9e0; border-radius:13px; color:#016922; background:#fff;
      }
      .ssgp-portal-home-btn svg { width:22px; height:22px; }
      .title-line .bell-btn { justify-self:end; }
      .ssgp-traffic { display:flex; flex-direction:column; align-items:center; gap:7px; flex:0 0 auto; }
      .ssgp-traffic-body {
        background:#26312b; border:3px solid #102016; border-radius:999px;
        display:flex; flex-direction:row; align-items:center; gap:8px; padding:10px 13px;
        box-shadow:inset 0 3px 6px #0007, 0 7px 14px #0002;
      }
      .ssgp-traffic-lamp { width:46px; height:46px; border-radius:50%; position:relative;
        box-shadow:inset 0 3px 9px #0008; border:2px solid #202a24; }
      .ssgp-traffic-lamp.red { background:#4d2323; }
      .ssgp-traffic-lamp.yellow { background:#50451e; }
      .ssgp-traffic-lamp.green { background:#193e2a; }
      .ssgp-traffic-lamp.red.on { background:#f04438; box-shadow:inset 0 0 6px #fff7,0 0 17px 4px #f04438a8; border-color:#f67d75; }
      .ssgp-traffic-lamp.yellow.on { background:#ffd038; box-shadow:inset 0 0 6px #fff9,0 0 17px 4px #ffd038b0; border-color:#ffe88b; }
      .ssgp-traffic-lamp.green.on { background:#21c772; box-shadow:inset 0 0 6px #fff8,0 0 17px 4px #21c772a6; border-color:#a3f0c5; }
      .ssgp-traffic-state { font-weight:900; font-size:15px; line-height:1.3; text-align:center; color:#231916; }
      .ssgp-traffic-small .ssgp-traffic-body { padding:6px; gap:5px; border-radius:999px; border-width:2px; }
      .ssgp-traffic-small .ssgp-traffic-lamp { width:23px; height:23px; border-width:1px; }
      .ssgp-traffic-small .ssgp-traffic-state { font-size:11px; }
      .status-top > #overallLevel { display:none !important; }
      .floor-summary-top > .siren-pill { display:none !important; }
      .status-top { align-items:center; }
      @media(max-width:410px) {
        .ssgp-traffic-lamp { width:37px; height:37px; }
        .ssgp-traffic-body { padding:8px; border-radius:18px; gap:7px; }
        .status-count strong { font-size:30px; }
        .title-line .page-title { font-size:20px; }
      }
    `;
    document.head.appendChild(style);
  }

  const titleRow = document.querySelector('.title-line');
  if (titleRow && !titleRow.querySelector('.ssgp-portal-home-btn')) {
    const home = document.createElement('a');
    home.className = 'ssgp-portal-home-btn';
    home.href = 'traders.html';
    home.setAttribute('aria-label', '트레이더스 홈으로 이동');
    home.title = '트레이더스 홈';
    home.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-7h6v7"/></svg>`;
    titleRow.prepend(home);
  }

  if (page !== 'parking') return;
  function traffic(rate, compact=false) {
    const state = rate >= 100 ? '만차' : rate >= 70 ? '혼잡' : '여유';
    const active = rate >= 100 ? 'red' : rate >= 70 ? 'yellow' : 'green';
    const box = document.createElement('div');
    box.className = 'ssgp-traffic' + (compact ? ' ssgp-traffic-small' : '');
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', `주차장 혼잡도 ${state}, 점유율 ${rate}%`);
    box.innerHTML = `
      <div class="ssgp-traffic-body" aria-hidden="true">
        <span class="ssgp-traffic-lamp green ${active==='green'?'on':''}"></span>
        <span class="ssgp-traffic-lamp yellow ${active==='yellow'?'on':''}"></span>
        <span class="ssgp-traffic-lamp red ${active==='red'?'on':''}"></span>
      </div>
      <div class="ssgp-traffic-state">${state}</div>`;
    return box;
  }
  const p = typeof PARKING !== 'undefined' ? PARKING[storeId] : null;
  if (!p) return;
  const top = document.querySelector('.status-top');
  if (top && !top.querySelector('.ssgp-traffic')) top.append(traffic(p.overall.rate));
  document.querySelectorAll('[data-floor-panel]').forEach(panel => {
    const rate = p.floors[panel.dataset.floorPanel]?.rate;
    const row = panel.querySelector('.floor-summary-top');
    if (row && rate != null && !row.querySelector('.ssgp-traffic')) row.append(traffic(rate,true));
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSSGPPortalUI);
} else {
  initSSGPPortalUI();
}
