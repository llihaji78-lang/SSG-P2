/* Vehicle map mobile alignment and store-specific DEMO spot labels.
   Add after other vehicle scripts; does not change the stored vehicle data. */
(() => {
  'use strict';
  if (document.body.dataset.page !== 'vehicle') return;

  const DEMO_SPOTS = {
    wolgye: { label: '4층 · K12', bay: 'K12' },
    hanam:  { label: '지하 2층 · B10', bay: 'B10' },
    ilsan:  { label: '지하 2층 · F4', bay: 'F4' }
  };

  function applyFixes() {
    const locator = document.getElementById('vehicleLocator');
    const box = document.getElementById('floorMapBox');
    const img = document.getElementById('floorMap');
    const pin = document.getElementById('carPin');
    if (!locator || !box || !img || !pin) return;

    // Keep the existing floor-image change and positioning logic, while
    // making pin coordinates relative to the actual displayed image.
    let wrap = box.querySelector('.ssgp-vehicle-map-image-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'ssgp-vehicle-map-image-wrap';
      box.insertBefore(wrap, img);
    }
    if (img.parentElement !== wrap) wrap.appendChild(img);
    if (pin.parentElement !== wrap) wrap.appendChild(pin);

    const storeId = (localStorage.getItem('ssgp_store') || 'wolgye').toLowerCase();
    const spot = DEMO_SPOTS[storeId === 'guseong' ? 'ilsan' : storeId];
    if (!spot) return;
    const saved = document.getElementById('selectedSpotName');
    if (saved) {
      saved.textContent = spot.label;
      saved.title = '실제 주차면 번호가 아닌 화면 시연용 위치입니다.';
    }
    pin.setAttribute('aria-label', `내 차량 위치: 시연용 ${spot.bay} 구역`);
    const note = document.getElementById('ssgpVehicleDemoNote');
    if (note) note.textContent = `※ ${spot.bay}는 시연용 위치이며 실제 주차면 번호와 일치하지 않을 수 있습니다.`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFixes);
  } else {
    applyFixes();
  }
})();
