/* SSG-P Kakao map: named markers, verified search targets and synchronized list selection. */
(function () {
  'use strict';

  const rawStore = localStorage.getItem('ssgp_store') || 'wolgye';
  const store = rawStore === 'guseong' ? 'ilsan' : rawStore;
  const key = window.SSGP_KAKAO_JS_KEY;
  const mapNode = document.getElementById('realMap');
  const notice = document.getElementById('mapNotice');
  const parkingResults = document.getElementById('parkingResults');
  const transportResults = document.getElementById('transportResults');
  if (!mapNode || !notice || !parkingResults || !transportResults) return;

  const storeNames = {
    wolgye: '트레이더스 월계점',
    hanam: '트레이더스 하남점',
    ilsan: '트레이더스 일산점'
  };

  const storeAddresses = {
    wolgye: '서울 노원구 마들로3길 17',
    hanam: '경기 하남시 미사대로 750',
    ilsan: '경기도 고양시 일산서구 킨텍스로 171'
  };

  // 이 후보 목록의 요금·도보 정보는 시연용 보조 데이터입니다.
  // 카카오 검색 결과가 맞지 않으면 다른 장소를 임의로 연결하지 않습니다.
  const verified = {
    wolgye: [
      { name: '석계역 공영주차장', query: '석계역 공영주차장', address: '서울 노원구 월계동 50-9', fee: '유료', kind: '공영', source: '서울시설공단 주소 기준' },
      { name: '석계역앞 공영주차장', query: '석계역 공영주차장(구)', address: '서울 노원구 월계동 60-1', fee: '유료', kind: '공영', source: '석계역 인근 후보 주소 기준' },
      { name: '월계역주차장', query: '월계역 주차장', address: '서울 노원구 월계동 320-1', fee: '요금 확인 필요', kind: '공영', source: '공공데이터 주소 기준' }
    ],
    hanam: [],
    ilsan: [
      { name: '킨텍스 제1전시장 주차장', query: '킨텍스 제1전시장 주차장', address: '경기도 고양시 일산서구 킨텍스로 217-60', fee: '요금 확인 필요', kind: '주차장', source: '운영 여부 확인 필요' },
      { name: '킨텍스 제2전시장 주차장', query: '킨텍스 제2전시장 주차장', address: '', fee: '요금 확인 필요', kind: '주차장', source: '운영 여부 확인 필요' },
      { name: '현대백화점 킨텍스점 주차장', query: '현대백화점 킨텍스점 주차장', address: '경기 고양시 일산서구 호수로 817', fee: '요금 확인 필요', kind: '상업시설', source: '운영 정보 확인 필요' }
    ]
  };

  const officialTransit = {
    wolgye: [
      { name: '월계역', query: '월계역', walk: '매장까지 공식 안내 약 15분', route: '1호선' },
      { name: '진아교통 종점', query: '진아교통', walk: '매장 입구까지 도보 시간 확인 필요', route: '147, 1222' },
      { name: '석계역', query: '석계역', walk: '매장까지 직행 도보시간 미확인', route: '1·6호선, 연계버스 별도 확인' }
    ],
    hanam: [
      { name: '스타필드 하남 정류장', query: '스타필드 하남 정류장', walk: '매장과 바로 연결되는 정류장', route: '9302, 9303, 81, 23 외' },
      { name: '창우초교·부영아파트 정류장', query: '창우초교 부영아파트', walk: '하차 후 공식 안내 도보 약 5분', route: '9301, 341, 30, 10 외' }
    ],
    ilsan: [
      { name: '대화역', query: '대화역', walk: '도보 시간 별도 확인 필요', route: '3호선' },
      { name: '현대백화점 킨텍스점', query: '현대백화점 킨텍스점', walk: '도보 시간 별도 확인 필요', route: '주변 버스정류장 연계' },
      { name: '킨텍스 제1전시장', query: '킨텍스 제1전시장', walk: '도보 시간 별도 확인 필요', route: '광역·시내버스 연계' }
    ]
  };

  let map, places, geocoder, storePosition, selectedCard = null;
  const markers = [];
  const labelStyle = document.createElement('style');
  labelStyle.textContent = `
    .ssgp-map-label { padding:5px 9px; background:#fff; color:#231916;
      border:1px solid #dfe8e0; border-radius:9px; box-shadow:0 3px 12px #0002;
      font-size:11px; font-weight:700; white-space:nowrap; max-width:180px;
      overflow:hidden; text-overflow:ellipsis; pointer-events:none; }
    .ssgp-map-label.store { border:2px solid #016922; color:#016922; }
    .ssgp-map-label.active { background:#016922; border-color:#016922; color:white; }
    #parkingResults .info-card.is-selected, #transportResults .info-card.is-selected {
      border:2px solid #016922; background:#f0f8f2; }
    #parkingResults .info-card button, #transportResults .info-card button { width:100%; text-align:left; cursor:pointer; }
    .ssgp-place-detail { font-size:12px; line-height:1.5; }
  `;
  document.head.appendChild(labelStyle);

  function message(s) { notice.textContent = s; }
  function norm(s) { return String(s).toLowerCase().replace(/[\s·._()\-]/g, ''); }
  function distanceMeters(a, b) {
    const rad = x => x * Math.PI / 180;
    const R = 6371000;
    const dLat = rad(b.getLat() - a.getLat());
    const dLng = rad(b.getLng() - a.getLng());
    const v = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.getLat())) * Math.cos(rad(b.getLat())) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(v)));
  }
  function positionOf(r) { return new kakao.maps.LatLng(Number(r.y), Number(r.x)); }

  function registerMarker(pos, name, kind) {
    const marker = new kakao.maps.Marker({ map, position: pos, title: name });
    const label = document.createElement('div');
    label.className = 'ssgp-map-label' + (kind === 'store' ? ' store' : '');
    label.textContent = name;
    const overlay = new kakao.maps.CustomOverlay({ map, position: pos, content: label, yAnchor: 2.2 });
    const item = { marker, overlay, label, pos, name, kind };
    markers.push(item);
    return item;
  }

  function choose(item, card) {
    if (selectedCard) selectedCard.classList.remove('is-selected');
    markers.forEach(m => m.label.classList.remove('active'));
    if (card) {
      card.classList.add('is-selected');
      selectedCard = card;
    }
    item.label.classList.add('active');
    map.setLevel(3);
    map.panTo(item.pos);
    mapNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function addCard(container, name, fee, extra, item, unavailableReason) {
    const card = document.createElement('div');
    card.className = 'info-card';
    const btn = document.createElement('button');
    btn.type = 'button';
    const top = document.createElement('div');
    top.className = 'info-card-top';
    const left = document.createElement('div');
    const h = document.createElement('h3');
    h.textContent = name;
    const p = document.createElement('p');
    p.textContent = unavailableReason || extra;
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = fee;
    left.append(h, p);
    top.append(left, tag);
    btn.append(top);
    card.append(btn);

    if (item) {
      btn.addEventListener('click', () => choose(item, card));
      kakao.maps.event.addListener(item.marker, 'click', () => choose(item, card));
      btn.setAttribute('aria-label', name + ' 지도에서 위치 확인');
    } else {
      btn.disabled = true;
      btn.style.cursor = 'not-allowed';
      btn.setAttribute('aria-label', name + ' 위치 검색 결과 확인 필요');
    }
    container.append(card);
    return card;
  }

  function locate(row, callback) {
    places.keywordSearch(row.query, (results, status) => {
      let matched = null;
      if (status === kakao.maps.services.Status.OK && results) {
        const close = results.filter(r => distanceMeters(storePosition, positionOf(r)) <= 7000);
        matched = close.find(r => {
          const addressText = norm((r.address_name || '') + ' ' + (r.road_address_name || ''));
          const lot = (row.address || '').match(/\d+(?:-\d+)?$/)?.[0];
          return lot && addressText.includes(norm(lot));
        });
        if (!matched) {
          const target = norm(row.name).replace(/공영|주차장|앞|점/g, '');
          matched = close.find(r => norm(r.place_name).replace(/공영|주차장|앞|점/g, '').includes(target));
        }
      }
      if (matched) {
        callback(matched, false);
        return;
      }
      if (!row.address) {
        callback(null, false);
        return;
      }
      geocoder.addressSearch(row.address, (addresses, addressStatus) => {
        if (addressStatus === kakao.maps.services.Status.OK && addresses?.length) {
          callback({
            x: addresses[0].x,
            y: addresses[0].y,
            place_name: row.name,
            id: 'address:' + row.address,
            address_name: row.address
          }, true);
        } else {
          callback(null, false);
        }
      });
    }, { location: storePosition, radius: 7000, size: 15 });
  }

  function showResult(container, row, result, kind, addressFallback = false, mount = null) {
    const targetContainer = mount || container;
    if (!result) {
      addCard(targetContainer, row.name, row.fee || row.route, '', null, '정확한 지도 위치를 찾지 못했습니다.');
      return;
    }

    const id = result.id || (result.x + ',' + result.y);
    let m = markers.find(entry => entry.kind === kind && entry.id === id);
    const pos = positionOf(result);
    if (!m) {
      m = registerMarker(pos, addressFallback ? row.name : result.place_name, kind);
      m.id = id;
      m.kind = kind;
    }

    const title = row.name;
    let extra;
    if (kind === 'parking') {
      extra = `${row.kind} · 매장과 직선거리 약 ${distanceMeters(storePosition, pos)}m · 도보시간 확인 필요`;
      if (addressFallback) extra += ' · 주소 기준 위치';
    } else {
      extra = row.walk;
    }
    addCard(targetContainer, title, row.fee || row.route, extra, m);
  }

  function renderParking() {
    parkingResults.innerHTML = '';
    const data = verified[store] || [];
    if (data.length) {
      data.forEach(row => {
        const slot = document.createElement('div');
        parkingResults.appendChild(slot);
        locate(row, (r, fallback) => showResult(parkingResults, row, r, 'parking', fallback, slot));
      });
      return;
    }

    places.keywordSearch('주차장', (results, status) => {
      if (status !== kakao.maps.services.Status.OK) {
        addCard(parkingResults, '검색 실패', '확인 필요', '', null, '주변 주차장 검색 결과가 없습니다.');
        return;
      }
      results
        .filter(r => distanceMeters(storePosition, positionOf(r)) <= 3000)
        .slice(0, 8)
        .forEach(r => {
          const pos = positionOf(r);
          const m = registerMarker(pos, r.place_name, 'parking');
          addCard(parkingResults, r.place_name, '요금 확인 필요', `직선거리 약 ${distanceMeters(storePosition, pos)}m · 도보시간 확인 필요`, m);
        });
    }, { location: storePosition, radius: 3000, size: 15 });
  }

  function renderTransit() {
    transportResults.innerHTML = '';
    const data = officialTransit[store] || [];
    if (data.length) {
      data.forEach(row => {
        places.keywordSearch(row.query, (results, status) => {
          if (status !== kakao.maps.services.Status.OK) {
            showResult(transportResults, row, null, 'transit');
            return;
          }
          const wanted = norm(row.name).replace(/종점/g, '');
          const matched = results
            .filter(r => distanceMeters(storePosition, positionOf(r)) <= 6000)
            .find(r => norm(r.place_name).includes(wanted) || wanted.includes(norm(r.place_name)));
          showResult(transportResults, row, matched || null, 'transit');
        }, { location: storePosition, radius: 6000, size: 15 });
      });
      return;
    }

    places.keywordSearch('지하철역', (results, status) => {
      if (status !== kakao.maps.services.Status.OK) return;
      results
        .filter(r => distanceMeters(storePosition, positionOf(r)) <= 3000)
        .slice(0, 6)
        .forEach(r => {
          const m = registerMarker(positionOf(r), r.place_name, 'transit');
          addCard(transportResults, r.place_name, '지하철', '도보 소요시간 확인 필요', m);
        });
    }, { location: storePosition, radius: 3000, size: 15 });
  }

  if (!key) {
    message('카카오맵 JavaScript 키를 assets/js/map-config.js에 등록해 주세요.');
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=' + encodeURIComponent(key) + '&libraries=services&autoload=false';
  script.onload = () => kakao.maps.load(() => {
    places = new kakao.maps.services.Places();
    geocoder = new kakao.maps.services.Geocoder();
    map = new kakao.maps.Map(mapNode, { center: new kakao.maps.LatLng(37.624, 127.065), level: 5 });
    geocoder.addressSearch(storeAddresses[store], (res, status) => {
      if (status !== kakao.maps.services.Status.OK || !res.length) {
        message('매장 위치를 검색하지 못했습니다.');
        return;
      }
      storePosition = positionOf(res[0]);
      map.setCenter(storePosition);
      const main = registerMarker(storePosition, storeNames[store], 'store');
      kakao.maps.event.addListener(main.marker, 'click', () => choose(main, null));
      message('지도 위 이름표와 목록이 연결됩니다. 아래 주차장을 누르면 해당 위치를 확대해 보여줍니다.');
      renderParking();
      renderTransit();
    });
  });
  script.onerror = () => message('카카오맵 SDK를 불러오지 못했습니다. 키와 등록 도메인을 확인해 주세요.');
  document.head.appendChild(script);
})();
