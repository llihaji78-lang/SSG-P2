/* SSG-P: Hanam B2 demo-pin alignment and branded vehicle removal dialog.
   Add after vehicle-ui-patch.js in vehicle.html. Does not modify main.js. */
(() => {
  'use strict';
  if (document.body.dataset.page !== 'vehicle') return;

  const STYLE_ID = 'ssgp-vehicle-dialog-v1-css';
  function initStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      .ssgp-confirm-backdrop { position:fixed;inset:0;z-index:10000;background:rgba(24,32,26,.46);display:flex;align-items:center;justify-content:center;padding:20px; }
      .ssgp-confirm-backdrop[hidden] {display:none !important;}
      .ssgp-confirm-panel { box-sizing:border-box;width:min(100%,380px);padding:26px 22px 20px;border-radius:22px;background:#fff;box-shadow:0 20px 65px rgba(0,0,0,.2);text-align:center;color:#231916; }
      .ssgp-confirm-icon { width:48px;height:48px;margin:0 auto 13px;display:grid;place-items:center;border-radius:50%;background:#edf7f0;color:#016922; }
      .ssgp-confirm-panel h2 {margin:0 0 9px;font-size:19px;line-height:1.4;font-weight:850;}
      .ssgp-confirm-panel p {margin:0 0 22px;font-size:13px;line-height:1.65;color:#74726f;}
      .ssgp-confirm-buttons {display:grid;grid-template-columns:1fr 1fr;gap:10px;}
      .ssgp-confirm-buttons button {min-height:46px;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;}
      .ssgp-confirm-cancel {border:1px solid #dfe5df;background:#fff;color:#231916;}
      .ssgp-confirm-accept {border:1px solid #016922;background:#016922;color:white;}
      .ssgp-confirm-buttons button:focus-visible {outline:3px solid rgba(1,105,34,.26);outline-offset:2px;}
      @media(max-width:430px) {.ssgp-confirm-panel {padding:23px 18px 18px;}}
    `;
    document.head.appendChild(s);
  }

  function adjustHanamPin() {
    const store = localStorage.getItem('ssgp_store') || 'wolgye';
    if (store !== 'hanam') return;
    const pin = document.getElementById('carPin');
    if (!pin || pin.style.display === 'none') return;
    const selected = document.querySelector('.floor-tab.active[data-map-floor]');
    if (selected && selected.dataset.mapFloor !== 'B2') return;
    // Simulation coordinate: place pin tip inside a drawn B2 stall, not the drive aisle.
    pin.style.left = '58.5%';
    pin.style.top = '52%';
  }

  let dialog;
  let lastFocused;
  function closeDialog() {
    if (dialog) dialog.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }
  function showDialog() {
    initStyles();
    lastFocused = document.activeElement;
    if (!dialog) {
      dialog = document.createElement('div');
      dialog.className = 'ssgp-confirm-backdrop';
      dialog.hidden = true;
      dialog.innerHTML = `
        <section class="ssgp-confirm-panel" role="dialog" aria-modal="true" aria-labelledby="ssgpConfirmTitle" aria-describedby="ssgpConfirmDesc">
          <div class="ssgp-confirm-icon" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6"/></svg></div>
          <h2 id="ssgpConfirmTitle">차량 등록을 해제할까요?</h2>
          <p id="ssgpConfirmDesc">등록한 차량번호가 삭제되고<br>차량 위치 정보가 초기화됩니다.</p>
          <div class="ssgp-confirm-buttons"><button type="button" class="ssgp-confirm-cancel">취소</button><button type="button" class="ssgp-confirm-accept">등록 해제</button></div>
        </section>`;
      document.body.appendChild(dialog);
      dialog.querySelector('.ssgp-confirm-cancel').addEventListener('click', closeDialog);
      dialog.querySelector('.ssgp-confirm-accept').addEventListener('click', () => {
        localStorage.removeItem('ssgp_vehicle');
        window.location.reload();
      });
      dialog.addEventListener('click', e => { if (e.target === dialog) closeDialog(); });
      dialog.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.preventDefault(); closeDialog(); }
        if (e.key === 'Tab') {
          const first = dialog.querySelector('.ssgp-confirm-cancel');
          const last = dialog.querySelector('.ssgp-confirm-accept');
          if (e.shiftKey && document.activeElement === first) {e.preventDefault();last.focus();}
          else if (!e.shiftKey && document.activeElement === last) {e.preventDefault();first.focus();}
        }
      });
    }
    dialog.hidden = false;
    document.body.style.overflow = 'hidden';
    dialog.querySelector('.ssgp-confirm-cancel').focus();
  }

  function start() {
    initStyles();
    adjustHanamPin();
    // Intercept before existing main.js button handlers call window.confirm().
    document.addEventListener('click', event => {
      const button = event.target.closest && event.target.closest('#deleteVehicleBtn');
      if (!button || button.hidden || !localStorage.getItem('ssgp_vehicle')) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      showDialog();
    }, true);
    document.addEventListener('click', event => {
      const floorButton = event.target.closest && event.target.closest('[data-map-floor]');
      if (!floorButton) return;
      requestAnimationFrame(adjustHanamPin);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
