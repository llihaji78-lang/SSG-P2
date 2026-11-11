/* 내 차량 찾기: 하남점 일반 주차 위치 도면 이미지 교체 전용.
   다른 점포 / 예약 위치 탭 / 공통 main.js는 변경하지 않습니다. */
(function () {
  'use strict';
  function applyHanamMaps() {
    if (document.body.dataset.page !== 'vehicle') return;
    if (typeof VEHICLE_MAPS === 'undefined' || !VEHICLE_MAPS.hanam) return;

    var images = {
      'B1': ['hanam_b1.png', '하남점 지하 1층 주차장 도면'],
      'B2': ['hanam_b2.png', '하남점 지하 2층 주차장 도면'],
      'B3': ['hanam_b2.png', '하남점 지하 3층 · 지하 2층 도면으로 대체 표시 (시뮬레이션)'],
      '3층': ['hanam_3f.png', '하남점 3층 주차장 도면 · 주말 운영'],
      '4층': ['hanam_4f.png', '하남점 4층 주차장 도면 · 주말 운영'],
      '야외': ['hanam_outdoor.png', '하남점 야외주차장 도면']
    };
    var floors = VEHICLE_MAPS.hanam.floors;
    floors.forEach(function (floor) {
      var entry = images[floor.key];
      if (!entry) return;
      floor.image = 'assets/images/' + entry[0];
      floor.note = entry[1];
    });

    // main.js가 이미 첫 층을 표시했다면 같은 층 버튼을 다시 눌러 이미지를 갱신합니다.
    var active = document.querySelector('#vehicleLocator [data-map-floor].active');
    if (active) active.click();
    else {
      var floorMap = document.getElementById('floorMap');
      var selected = document.querySelector('#vehicleLocator [data-map-floor="B2"]');
      if (selected) selected.click();
      else if (floorMap && floorMap.src.indexOf('floor3_cropped.png') !== -1) {
        floorMap.src = 'assets/images/hanam_b2.png';
      }
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyHanamMaps);
  } else {
    applyHanamMaps();
  }
})();
