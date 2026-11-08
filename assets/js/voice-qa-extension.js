/* SSG-P voice Q&A extension: does not replace or edit main.js.
 * Data comes from existing PARKING/STORE_DATA in main.js and represents app demonstration values.
 */
(function () {
  'use strict';
  if (document.body.dataset.page !== 'voice') return;

  const norm = s => String(s || '').toLowerCase().replace(/[\s.,?!~·]/g, '');
  const stores = {wolgye:'월계점', hanam:'하남점', ilsan:'일산점'};
  const aliases = {
    wolgye:['월계','월계점'], hanam:['하남','하남점'], ilsan:['일산','일산점']
  };
  const present = k => stores[k] || '선택한 점포';
  const status = rate => rate >= 100 ? '만차' : rate >= 70 ? '혼잡' : '여유';
  const yes = (q, words) => words.some(w => q.includes(norm(w)));
  const fmtFloor = f => f === 'B1' ? '지하 1층' : f === 'B2' ? '지하 2층' : f === 'B3' ? '지하 3층' : f === '옥상' ? '옥상' : f;
  const floorWords = f => {
    const v = [f, fmtFloor(f)];
    if (f === 'B1') v.push('지하일층','지하1층','비원','비1');
    if (f === 'B2') v.push('지하이층','지하2층','비투','비2');
    if (f === 'B3') v.push('지하삼층','지하3층','비쓰리','비3');
    if (f === '3층') v.push('삼층','3층');
    if (f === '4층') v.push('사층','4층');
    if (f === '5층') v.push('오층','5층','옥상');
    if (f === '옥상') v.push('옥상','루프탑');
    return v.map(norm);
  };
  function storeForQuestion(q) {
    for (const [id, arr] of Object.entries(aliases)) {
      if (arr.some(a => q.includes(norm(a)))) return id;
    }
    return typeof storeId !== 'undefined' ? storeId : (localStorage.getItem('ssgp_store') || 'wolgye');
  }
  function inferredFloor(q, floors) {
    return Object.keys(floors).find(f => floorWords(f).some(w => q.includes(w)));
  }
  // An explicitly named but unsupported store must NEVER fall back to the selected store.
  // Examples: "수원점 주차장 혼잡해?" / "수원점 주차장 알려줘".
  function unsupportedStore(q) {
    const mentions = [...q.matchAll(/([가-힣]{2,12})점/g)];
    for (const match of mentions) {
      const name = match[1];
      const supported = Object.values(aliases).some(names =>
        names.some(alias => alias.endsWith('점') && name.endsWith(norm(alias.slice(0, -1))))
      );
      if (!supported) {
        // Remove common query prefix when it is joined to the branch name by normalization.
        const bare = name.replace(/^(?:지금|현재|혹시|그럼|여기|저기|오늘|내일|이번에|그러면|지금은|현재는)+/, '');
        return (bare || name) + '점';
      }
    }
    return null;
  }
  function reply(raw) {
    const q = norm(raw);
    if (!q) return '질문이 들리지 않았어요. 마이크 버튼을 눌러 다시 질문해 주세요.';
    const unknownStore = unsupportedStore(q);
    if (unknownStore) return `${unknownStore}은 현재 SSG-P 음성 안내에서 지원하지 않는 점포예요. 월계점, 하남점, 일산점 주차 정보만 안내할 수 있어요.`;
    const id = storeForQuestion(q);
    const p = typeof PARKING !== 'undefined' && PARKING[id];
    const store = present(id);
    if (!q) return '질문이 들리지 않았어요. 마이크 버튼을 눌러 다시 질문해 주세요.';
    if (!p) return '해당 점포의 주차 정보가 준비되지 않았어요. 월계점, 하남점, 일산점 중에서 선택해 주세요.';
    const o = p.overall;
    const floor = inferredFloor(q, p.floors);
    const isFuture = yes(q, ['10분','십분','20분','이십분','30분','삼십분','뒤','후','예상','예측','미래']);
    const note = '현재 앱에 설정된 시연용 주차 데이터를 기준으로 안내합니다.';

    // Unknown/out-of-scope topics are checked before broad words like "주차장".
    if (yes(q, ['영업시간','몇시까지','몇시에열','몇시에닫','운영시간','휴무','휴점','전화번호','연락처','주소','위치가어디','가는길','주차요금','주차비','무료주차','주차할인','정산','출차요금','주차권발급','예약가능','예약해','결제','환불'])) {
      return `${store}의 영업시간, 요금, 할인, 정산이나 예약 정보는 현재 음성서비스에서 확인할 수 없어요. 정확한 내용은 해당 점포의 공식 안내를 확인해 주세요.`;
    }
    if (yes(q, ['날씨','기온','맛집','메뉴','상품','가격','주식','뉴스','노래','음악','농담','시간몇시'])) {
      return '그 질문은 현재 주차 음성안내 범위에 포함되어 있지 않아요. 주차 혼잡도, 층별 빈자리, 전기차·장애인 주차면, 10분·20분·30분 뒤 예상 혼잡도를 물어봐 주세요.';
    }
    if (yes(q, ['안녕','안녕하세요','도움','뭐물어','질문목록','무엇을물어','사용방법','어떻게질문'])) {
      return '안녕하세요. SSG-P 음성 안내입니다. 예를 들어 월계점 주차장 혼잡해, 지하 2층 빈자리 있어, 20분 뒤 혼잡도 알려줘라고 질문해 주세요.';
    }
    if (yes(q, ['내차','내차량','차량위치','차어디','차찾','주차위치','차량등록','번호판'])) {
      return '화면 아래 내 차량 찾기 메뉴에서 차량 등록 또는 등록한 차량의 주차 위치를 확인할 수 있어요. 현재 음성안내는 등록 차량의 실제 위치를 직접 조회하지는 않습니다.';
    }
    if (yes(q, ['알림','알려줘나중','푸시','통지','알람설정'])) {
      return '주차현황 페이지에서 10분, 20분, 30분 후 혼잡도 변화 알림을 설정할 수 있어요. 이 음성 질문만으로 알림이 설정되지는 않습니다.';
    }
    if (yes(q, ['주변주차장','다른주차장','대체주차장','근처주차장','인근주차장','공영주차장','주변에주차'])) {
      return '화면 아래 주변 주차장 메뉴에서 다른 주차장을 확인할 수 있어요. 실제 잔여 면수와 이용 가능 여부는 해당 주차장에 확인해 주세요.';
    }
    if (yes(q, ['충전기','충전가능','충전중','충전소']) && !yes(q, ['전기차자리','전기차주차면','전기차주차구역'])) {
      return `${store}의 충전기 실제 사용 가능 여부는 현재 데이터로 확인할 수 없어요. 다만 앱에 표시된 전기차용 잔여 주차면은 ${o.ev ?? '확인 불가'}면입니다. ${note}`;
    }
    if (yes(q, ['전기차','전기자동차','전기차량','충전구역','ev'])) {
      const floorPart = floor ? p.floors[floor] : null;
      if (floorPart) return `${store} ${fmtFloor(floor)}의 전기차용 잔여 주차면은 ${floorPart.ev == null ? '별도로 집계되지 않았어요' : `${floorPart.ev}면이에요`}. 실제 충전기 가동 여부는 확인할 수 없어요. ${note}`;
      return `${store}의 전기차용 잔여 주차면은 ${o.ev == null ? '별도로 집계되지 않았어요' : `${o.ev}면이에요`}. 실제 충전기 가동 여부는 확인할 수 없어요. ${note}`;
    }
    if (yes(q, ['장애인','장애인전용','장애인주차'])) {
      const x = floor ? p.floors[floor] : o;
      return `${store}${floor ? ` ${fmtFloor(floor)}` : ''}의 장애인 주차 잔여 면수는 ${x.disabled == null ? '확인할 수 없어요' : `${x.disabled}면이에요`}. ${note}`;
    }
    if (yes(q, ['경차','소형차'])) {
      return `${store}의 경차 전용 잔여 면수는 현재 음성서비스 데이터에서 별도로 확인할 수 없어요. 주차현황 페이지의 층별 상세보기를 확인해 주세요.`;
    }
    if (isFuture) {
      const minute = yes(q, ['30분','삼십분']) ? 30 : yes(q, ['20분','이십분']) ? 20 : yes(q, ['10분','십분']) ? 10 : null;
      if (minute === null) return '현재는 10분, 20분, 30분 뒤 예상 혼잡도만 안내할 수 있어요. 몇 분 뒤인지 말씀해 주세요.';
      const data = p.prediction.find(x => x.m === minute);
      if (!data) return '해당 시간대의 예상 혼잡도 데이터가 없어요.';
      return `${store}의 ${minute}분 뒤 예상 점유율은 ${data.rate}퍼센트이며, 혼잡 상태는 ${status(data.rate)}로 예상돼요. 예측값은 실제 상황과 다를 수 있어요.`;
    }
    if (yes(q, ['가장여유','어느층','추천층','빈자리많','제일널널','덜혼잡','주차추천','어디에주차'])) {
      const eligible = Object.entries(p.floors).filter(([_, f]) => typeof f.available === 'number');
      if (!eligible.length) return `${store}의 층별 잔여 주차 정보가 없어요.`;
      eligible.sort((a,b) => b[1].available - a[1].available);
      const [f, data] = eligible[0];
      if (data.available === 0) return `${store}는 현재 모든 등록된 층의 잔여 주차면이 0면으로 표시됩니다. 주변 주차장 메뉴를 확인해 주세요. ${note}`;
      return `${store}에서는 ${fmtFloor(f)}에 ${data.available}면이 남아 있어 현재 데이터상 잔여 주차면이 가장 많아요. ${note}`;
    }
    if (floor) {
      const x = p.floors[floor];
      if (yes(q, ['일반','보통주차'])) return `${store} ${fmtFloor(floor)}의 일반 주차 잔여 면수는 ${x.normal ?? '확인 불가'}면이에요. ${note}`;
      return `${store} ${fmtFloor(floor)}은 현재 ${status(x.rate)} 상태이고, 잔여 주차면은 ${x.available}면, 점유율은 ${x.rate}퍼센트예요. ${note}`;
    }
    if (yes(q, ['전체','혼잡','만차','주차장','자리','빈곳','빈자리','여유','주차가능','몇대','몇면','남았','현황','주차율','점유율','주차공간'])) {
      return `${store} 주차장은 현재 ${status(o.rate)} 상태입니다. 점유율 ${o.rate}퍼센트, 전체 ${o.total}면 중 잔여 주차면은 ${o.available}면이에요. ${note}`;
    }
    return '죄송해요. 그 질문은 아직 이해하지 못했어요. 예를 들어 주차장 혼잡해, 4층에 빈자리 있어, 전기차 자리 있어, 20분 뒤 혼잡도 알려줘라고 말씀해 주세요.';
  }

  // main.js initVoice() resolves answerQuestion when a speech result arrives.
  // Override only the Q&A function; keep recognition, replay and speech synthesis intact.
  window.answerQuestion = reply;
  document.addEventListener('DOMContentLoaded', () => {
    const rows = document.querySelectorAll('.guide .guide-row p');
    const id = typeof storeId !== 'undefined' ? storeId : 'wolgye';
    const floor = id === 'ilsan' ? '지하 2층' : id === 'hanam' ? '지하 1층' : '4층';
    if (rows[0]) rows[0].textContent = `“${present(id)} 지금 주차장 혼잡해?”`;
    if (rows[1]) rows[1].textContent = `“${floor}에 빈자리 있어?”`;
    if (rows[2]) rows[2].textContent = '“전기차 주차면 남았어?”';
  });
})();
