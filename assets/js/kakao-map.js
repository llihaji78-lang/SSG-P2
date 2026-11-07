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

  // 점포 자체 주차장과 사용자가 제외한 시설은 대체 주차장 목록에 넣지 않습니다.
  // 요금·도보시간은 사용자 제공 안내값이며 현장 조건에 따라 바뀔 수 있습니다.
  const verified = {
    wolgye: [
      { name: '석계역 공영주차장', query: '석계역 공영주차장', address: '서울 노원구 월계동 50-9', kind: '공영', walk: '약 36분', feeLines: [
        '30분: 1,680원', '60분: 3,360원', '120분: 6,720원', '240분: 13,440원'
      ]},
      { name: '광운대역 주차장', query: '광운대역 주차장', address: '서울 노원구 석계로 98-2', kind: '역 주차장', walk: '약 28분', feeLines: [
        '무료 회차: 5분',
        '단기주차: 기본 30분 1,800원',
        '추가요금: 10분마다 600원',
        '1일 주차: 12,000원',
        '월정기주차: 130,000원'
      ]},
      { name: '월계도서관주차장', query: '월계도서관 주차장', address: '', kind: '도서관 주차장', walk: '약 22분', fee: '확인 필요' }
    ],
    hanam: [
      { name: '하남유니온파크 주차장', query: '하남 유니온파크 주차장', address: '경기 하남시 미사대로 710', kind: '시설 주차장', walk: '약 8분', feeLines: [
        '기본 2시간 무료',
        '2시간 초과: 10분마다 200원',
        '유료 운영시간: 09:00~19:00',
        '운영시간 외: 무료'
      ]},
      { name: '신장동공영주차장', query: '신장동 공영주차장', address: '', kind: '공영', walk: '약 17분', feeLines: [
        '30분: 800원', '60분: 1,700원', '120분: 3,500원', '240분: 7,000원'
      ]},
      { name: '하남도시공사/주렁주렁 주차장', query: '하남도시공사 주렁주렁 주차장', address: '경기 하남시 하남유니온로 120', kind: '상업시설', walk: '약 3분', feeLines: [
        '30분: 1,000원', '60분: 4,000원', '120분: 10,000원', '240분: 22,000원'
      ], note: '해당 시설의 주차장 이용 조건과 별도 진입 가능 여부를 확인해 주세요.' }
    ],
    ilsan: [
      { name: '킨텍스 주차장', query: '킨텍스 제2전시장 지하주차장', address: '경기도 고양시 일산서구 킨텍스로 217-59', kind: '전시장', walk: '약 15분', feeLines: [
        '기본 20분: 1,240원', '이후 10분마다 620원'
      ], note: '킨텍스 제2전시장 지하주차장 기준 요금이며, 다른 주차장·임시주차장은 요금이 다를 수 있습니다.' }
    ]
  };

  // 노선·도보시간은 사용자가 제공한 참고값입니다. 운행 여부는 현장·운수사 확인이 필요합니다.
  // 방향별 정류장은 카카오맵에서 방향별 위치가 확인된 경우에만 핀과 직선거리를 표시합니다.
  const officialTransit = {
    wolgye: [
      { name: '석계역', query: '석계역', walk: '약 29분', subway: ['수도권 전철 1호선', '서울 지하철 6호선'], buses: { '연계 버스': ['1131', '1132', '1135', '1136', '1222'] } },
      { name: '월계역', query: '월계역', walk: '약 15분', subway: ['수도권 전철 1호선'], buses: { '연계 버스': ['1131', '147'] } },
      { name: '진아교통 종점', query: '진아교통 종점', walk: '약 3분', buses: { '서울 버스': ['1132', '1135', '1222', '147'] } }
    ],
    hanam: [
      { name: '스타필드 하남 정류장', direction: '유니온·에일린의뜰 방면', query: '스타필드 하남 정류장', walk: '약 2분', directionSpecific: true, buses: {
        '지선버스': ['38-52', '81', '87'], '광역버스': ['9302', '9302-1', '9303', '9303-1'], '마을버스': ['22', '50', '100']
      } },
      { name: '스타필드 하남 정류장', direction: '스타필드 하남 주차장 방면', query: '스타필드 하남 정류장', walk: '약 4분', directionSpecific: true, buses: {
        '지선버스': ['87', '81'], '광역버스': ['9302', '9302-1', '9303', '9303-1'], '마을버스': ['22', '50', '100']
      } },
      { name: '하남검단산역', query: '하남검단산역', walk: '확인 필요', subway: ['서울 지하철 5호선'] }
    ],
    ilsan: [
      { name: '킨텍스 제1전시장', direction: '대화중학교·종합운동장 방면', query: '킨텍스 제1전시장', walk: '약 25분', directionSpecific: true, buses: {
        '지선버스(제공 정보 기준)': ['33-2', '83', '98', '2000'], '공항버스': ['5600']
      } },
      { name: '킨텍스 제1전시장', direction: '일산디엠시티스카이뷰·현대백화점 방면', query: '킨텍스 제1전시장', walk: '약 23분', directionSpecific: true, buses: {
        '지선버스(제공 정보 기준)': ['2000', '83', '98'], '공항버스': ['5600'], '간선버스': ['941'], '광역버스': ['8407']
      } },
      { name: '대화역', query: '대화역', walk: '약 35분', subway: ['수도권 전철 3호선'] }
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
    .ssgp-place-detail { font-size:12px; line-height:1.7; }
    #parkingResults .ssgp-parking-card { padding:14px 15px; }
    #parkingResults .ssgp-parking-card-header { display:flex; justify-content:space-between; align-items:center; gap:12px; }
    #parkingResults .ssgp-parking-card-header h3 { margin:0; min-width:0; overflow-wrap:anywhere; font-size:15px; }
    #parkingResults .ssgp-parking-detail-toggle { flex:0 0 auto; width:auto !important; padding:9px 11px; border-radius:10px; border:1px solid #d8e9dc; background:#f0f8f2; color:#016922; font-weight:800; font-size:12px; text-align:center !important; }
    #parkingResults .ssgp-parking-detail-toggle[aria-expanded="true"] { background:#e5f2e8; }
    #parkingResults .ssgp-parking-detail { margin-top:14px; padding-top:12px; border-top:1px solid #e8eee8; }
    #parkingResults .ssgp-parking-detail p { margin:5px 0; color:#555; overflow-wrap:anywhere; }
    #parkingResults .ssgp-parking-detail strong { color:#231916; }
    #parkingResults .ssgp-parking-detail ul { padding-left:17px; margin:5px 0 12px; line-height:1.75; }
    #parkingResults .ssgp-parking-map-btn { margin-top:9px; width:100%; padding:10px; border:1px solid #016922; border-radius:10px; background:#fff; color:#016922; font-weight:800; text-align:center !important; }
    #parkingResults .ssgp-parking-map-btn:disabled { color:#999; border-color:#ddd; background:#f7f7f7; cursor:not-allowed; }
    #parkingResults .ssgp-parking-note { font-size:11px; color:#7b7671; line-height:1.55; }
    #transportResults .ssgp-transit-card { padding:14px 15px; }
    #transportResults .ssgp-transit-card-header { display:flex; align-items:center; justify-content:space-between; gap:10px; }
    #transportResults .ssgp-transit-card-title { margin:0; min-width:0; font-size:15px; overflow-wrap:anywhere; }
    #transportResults .ssgp-transit-direction { margin:5px 0 0; font-size:12px; color:#68645f; line-height:1.45; }
    #transportResults .ssgp-transit-detail-toggle { width:auto !important; flex:0 0 auto; padding:9px 11px; border-radius:10px; background:#f0f8f2; border:1px solid #d8e9dc; color:#016922; text-align:center !important; font-size:12px; font-weight:800; }
    #transportResults .ssgp-transit-detail { margin-top:14px; padding-top:12px; border-top:1px solid #e8eee8; font-size:12px; line-height:1.7; }
    #transportResults .ssgp-transit-detail p { margin:5px 0; color:#555; }
    #transportResults .ssgp-transit-detail strong { color:#231916; }
    #transportResults .ssgp-transit-detail ul { padding-left:18px; margin:5px 0 11px; }
    #transportResults .ssgp-transit-map-btn { width:100% !important; margin-top:9px; padding:10px; border:1px solid #016922; border-radius:10px; color:#016922; background:#fff; font-weight:800; text-align:center !important; }
    #transportResults .ssgp-transit-map-btn:disabled { color:#999; border-color:#ddd; background:#f7f7f7; cursor:not-allowed; }
    #transportResults .ssgp-transit-note { font-size:11px; color:#7b7671 !important; }
    @media(max-width:360px){#parkingResults .ssgp-parking-card-header h3,#transportResults .ssgp-transit-card-title{font-size:13px;}#parkingResults .ssgp-parking-detail-toggle,#transportResults .ssgp-transit-detail-toggle{font-size:11px;padding:8px;}}
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

  // 주차장 카드는 이름만 먼저 보여주고, 상세를 펼치면 요금·도보시간·직선거리가 나옵니다.
  function addParkingDetailCard(container, row, result, marker, addressFallback) {
    const card = document.createElement('div');
    card.className = 'info-card ssgp-parking-card';
    const head = document.createElement('div');
    head.className = 'ssgp-parking-card-header';
    const name = document.createElement('h3');
    name.textContent = row.name;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'ssgp-parking-detail-toggle';
    toggle.textContent = '자세히 보기 ▾';
    toggle.setAttribute('aria-expanded', 'false');
    const detail = document.createElement('div');
    detail.className = 'ssgp-parking-detail';
    detail.hidden = true;
    const line = (label, value) => {
      const p = document.createElement('p');
      const bold = document.createElement('strong');
      bold.textContent = label + ': ';
      p.append(bold, document.createTextNode(value));
      detail.append(p);
    };
    line('도보시간', row.walk || '확인 필요');
    line('매장과의 직선거리', result
      ? '약 ' + distanceMeters(storePosition, positionOf(result)).toLocaleString('ko-KR') + 'm'
      : '지도 위치 확인 필요');
    const feeTitle = document.createElement('p');
    const feeStrong = document.createElement('strong');
    feeStrong.textContent = '이용료';
    feeTitle.append(feeStrong);
    detail.append(feeTitle);
    if (row.feeLines?.length) {
      const list = document.createElement('ul');
      row.feeLines.forEach(fee => {
        const li = document.createElement('li');
        li.textContent = fee;
        list.append(li);
      });
      detail.append(list);
    } else {
      const p = document.createElement('p');
      p.textContent = row.fee || '확인 필요';
      detail.append(p);
    }
    if (row.note) {
      const p = document.createElement('p');
      p.className = 'ssgp-parking-note';
      p.textContent = row.note;
      detail.append(p);
    }
    const caution = document.createElement('p');
    caution.className = 'ssgp-parking-note';
    caution.textContent = '도보시간은 제공된 참고값이며 실제 동선·요금·운영시간은 방문 전에 확인해 주세요.';
    detail.append(caution);
    if (addressFallback) {
      const p = document.createElement('p');
      p.className = 'ssgp-parking-note';
      p.textContent = '지도 표시는 주차장 명칭이 아닌 확인된 주소 기준입니다.';
      detail.append(p);
    }
    const mapBtn = document.createElement('button');
    mapBtn.className = 'ssgp-parking-map-btn';
    mapBtn.type = 'button';
    mapBtn.textContent = marker ? '지도에서 위치 보기' : '지도 위치 확인 필요';
    mapBtn.disabled = !marker;
    if (marker) {
      mapBtn.addEventListener('click', () => choose(marker, card));
      kakao.maps.event.addListener(marker.marker, 'click', () => {
        detail.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        toggle.textContent = '접기 ▴';
        choose(marker, card);
      });
    }
    detail.append(mapBtn);
    toggle.addEventListener('click', () => {
      detail.hidden = !detail.hidden;
      const expanded = !detail.hidden;
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.textContent = expanded ? '접기 ▴' : '자세히 보기 ▾';
    });
    head.append(name, toggle);
    card.append(head, detail);
    container.append(card);
    return card;
  }

  // 대중교통도 이름 위주로 표시하고, 자세히 보기에서 노선·도보·직선거리를 제공합니다.
  function addTransitDetailCard(container, row, result, marker) {
    const card = document.createElement('div');
    card.className = 'info-card ssgp-transit-card';
    const head = document.createElement('div');
    head.className = 'ssgp-transit-card-header';
    const titleWrap = document.createElement('div');
    const title = document.createElement('h3');
    title.className = 'ssgp-transit-card-title';
    title.textContent = row.name;
    titleWrap.append(title);
    if (row.direction) {
      const direction = document.createElement('p');
      direction.className = 'ssgp-transit-direction';
      direction.textContent = row.direction;
      titleWrap.append(direction);
    }
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'ssgp-transit-detail-toggle';
    toggle.textContent = '자세히 보기 ▾';
    toggle.setAttribute('aria-expanded', 'false');
    const detail = document.createElement('div');
    detail.className = 'ssgp-transit-detail';
    detail.hidden = true;
    const line = (label, value) => {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = label + ': ';
      p.append(strong, document.createTextNode(value));
      detail.append(p);
    };
    line('매장까지 도보', row.walk || '확인 필요');
    line('매장과의 직선거리', result
      ? '약 ' + distanceMeters(storePosition, positionOf(result)).toLocaleString('ko-KR') + 'm'
      : '정류장 위치 확인 필요');
    if (row.subway?.length) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = '이용 가능한 지하철 노선';
      p.append(strong);
      detail.append(p);
      const ul = document.createElement('ul');
      row.subway.forEach(route => { const li = document.createElement('li'); li.textContent = route; ul.append(li); });
      detail.append(ul);
    }
    if (row.buses) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = '이용 가능한 버스';
      p.append(strong);
      detail.append(p);
      const ul = document.createElement('ul');
      Object.entries(row.buses).forEach(([category, routes]) => {
        const li = document.createElement('li');
        li.textContent = category + ': ' + routes.map(r => r + '번').join(', ');
        ul.append(li);
      });
      detail.append(ul);
    }
    const note = document.createElement('p');
    note.className = 'ssgp-transit-note';
    note.textContent = row.directionSpecific
      ? '방향별 정류장 위치를 확인하지 못하면 직선거리와 지도 핀을 표시하지 않습니다. 버스 번호와 도보시간은 제공된 참고값입니다.'
      : '노선과 도보시간은 제공된 참고값입니다. 실제 노선·정차 여부는 교통정보 서비스에서 확인해 주세요.';
    detail.append(note);
    const mapBtn = document.createElement('button');
    mapBtn.type = 'button';
    mapBtn.className = 'ssgp-transit-map-btn';
    mapBtn.textContent = marker ? '지도에서 위치 보기' : '지도 위치 확인 필요';
    mapBtn.disabled = !marker;
    if (marker) {
      mapBtn.addEventListener('click', () => choose(marker, card));
      kakao.maps.event.addListener(marker.marker, 'click', () => {
        detail.hidden = false;
        toggle.setAttribute('aria-expanded','true');
        toggle.textContent = '접기 ▴';
        choose(marker, card);
      });
    }
    detail.append(mapBtn);
    toggle.addEventListener('click', () => {
      detail.hidden = !detail.hidden;
      toggle.setAttribute('aria-expanded', String(!detail.hidden));
      toggle.textContent = detail.hidden ? '자세히 보기 ▾' : '접기 ▴';
    });
    head.append(titleWrap, toggle);
    card.append(head, detail);
    container.append(card);
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
          matched = close.find(r => target.length >= 3 && norm(r.place_name).replace(/공영|주차장|앞|점/g, '').includes(target));
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
    if (kind === 'transit') {
      if (!result) { addTransitDetailCard(targetContainer, row, null, null); return; }
      const id = result.id || (result.x + ',' + result.y);
      let marker = markers.find(entry => entry.kind === 'transit' && entry.id === id);
      if (!marker) {
        marker = registerMarker(positionOf(result), row.name, 'transit');
        marker.id = id;
      }
      addTransitDetailCard(targetContainer, row, result, marker);
      return;
    }
    if (!result) {
      if (kind === 'parking') addParkingDetailCard(targetContainer, row, null, null, false);
      else addCard(targetContainer, row.name, row.fee || row.route, '', null, '정확한 지도 위치를 찾지 못했습니다.');
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

    if (kind === 'parking') {
      addParkingDetailCard(targetContainer, row, result, m, addressFallback);
      return;
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
    data.forEach(row => {
      // 각 항목마다 별도의 자리 확보: 검색 응답 순서에 따라 목록 순서가 바뀌지 않게 합니다.
      const slot = document.createElement('div');
      transportResults.append(slot);
      places.keywordSearch(row.query, (results, status) => {
        if (status !== kakao.maps.services.Status.OK || !results?.length) {
          showResult(transportResults, row, null, 'transit', false, slot);
          return;
        }
        const nearby = results.filter(r => distanceMeters(storePosition, positionOf(r)) <= 7000);
        let matched = null;
        if (row.directionSpecific) {
          // 일반 정류장 검색만으로는 도로 양쪽의 승차 방향을 구분할 수 없습니다.
          // 정확한 방향 설명이 검색 결과에 명시된 경우에만 위치를 확정합니다.
          const tokens = row.direction.split(/[·\s]+/).filter(t => t.length >= 3);
          matched = nearby.find(r => {
            const candidate = norm(r.place_name + ' ' + (r.address_name || ''));
            return norm(r.place_name).includes(norm(row.name)) && tokens.some(t => candidate.includes(norm(t)));
          }) || null;
        } else {
          const wanted = norm(row.name).replace(/종점/g, '');
          matched = nearby.find(r => {
            const found = norm(r.place_name);
            return found.includes(wanted) || (found.length >= 3 && wanted.includes(found));
          }) || null;
        }
        showResult(transportResults, row, matched, 'transit', false, slot);
      }, { location: storePosition, radius: 7000, size: 15 });
    });
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
