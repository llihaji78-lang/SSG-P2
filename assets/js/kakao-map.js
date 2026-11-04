/* Real Kakao Maps SDK integration. No fabricated coordinates or walk times. */
(function(){
const store=localStorage.getItem('ssgp_store')||'wolgye';
const key=window.SSGP_KAKAO_JS_KEY;
const notice=document.getElementById('mapNotice');
const mapNode=document.getElementById('realMap');
if(!mapNode)return;
const storeAddresses = {
  wolgye: "서울 노원구 마들로3길 17",
  hanam: "경기 하남시 미사대로 750",
  guseong: "경기 용인시 기흥구 용구대로 2457"
};
const verified={
 wolgye:[{name:'석계역 공영주차장',query:'석계역 공영주차장 서울 월계동 50-9',fee:'유료',kind:'공영',source:'노원구시설관리공단 공식 요금표'},
 {name:'석계역앞 공영주차장',query:'석계역앞 공영주차장 월계동',fee:'유료',kind:'공영',source:'노원구 공영주차장 안내'},
 {name:'월계역주차장',query:'월계역주차장 월계동 320-1',fee:'요금 확인 필요',kind:'공영',source:'장소 정보'}],
 hanam:[],guseong:[]
};
const officialTransit={wolgye:[
 {name:'월계역',query:'월계역 2번출구',walk:'매장까지 공식 안내 약 15분',route:'1호선'},
 {name:'진아교통 종점',query:'진아교통 종점 월계동',walk:'매장 입구까지 도보 시간 확인 필요',route:'147, 1222'},
 {name:'석계역',query:'석계역',walk:'매장까지 직행 도보시간 미확인',route:'1·6호선, 연계버스 1135·1136·1132'}
 ],hanam:[],guseong:[]};
let map,places,markers=[],storePosition;
const parkingResults=document.getElementById('parkingResults');
const transportResults=document.getElementById('transportResults');
function message(s){notice.textContent=s}
if(!key){message('카카오 지도 API 키가 필요합니다. assets/js/map-config.js에 JavaScript 키를 입력하고 등록 도메인을 설정하세요.');
  mapNode.innerHTML='<div style="padding:25px;color:#016922;font-weight:800">카카오맵 JavaScript 키를 등록하면 실제 지도와 장소 마커가 표시됩니다.</div>';
  parkingResults.innerHTML='<div class="note">실제 확인한 후보: 석계역 공영주차장(유료), 석계역앞 공영주차장(유료), 월계역주차장(요금 확인 필요). 지도 검색 결과가 확인되면 목록에 연결됩니다.</div>';
  transportResults.innerHTML='<div class="note">월계역(1호선, 매장까지 공식 안내 도보 약 15분), 진아교통 종점(147·1222), 석계역(1·6호선, 연계버스 1135·1136·1132)</div>';
  return;
}
const script=document.createElement('script');script.src=`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&libraries=services&autoload=false`;
script.onload=()=>kakao.maps.load(init);
script.onerror=()=>message('카카오맵 SDK를 불러오지 못했습니다. 키 및 도메인 등록을 확인해 주세요.');
document.head.appendChild(script);
function marker(pos,title){const m=new kakao.maps.Marker({position:pos,title});m.setMap(map);markers.push(m);return m}
function distanceMeters(a,b){const R=6371000,rad=x=>x*Math.PI/180,dl=rad(b.getLat()-a.getLat()),dn=rad(b.getLng()-a.getLng());const u=Math.sin(dl/2)**2+Math.cos(rad(a.getLat()))*Math.cos(rad(b.getLat()))*Math.sin(dn/2)**2;return Math.round(2*R*Math.asin(Math.sqrt(u)))}
function locate(q,callback){places.keywordSearch(q,(results,status)=>{if(status===kakao.maps.services.Status.OK&&results.length){callback(results[0])}else{callback(null)}})}
function selected(pos){map.panTo(pos)}
function addCard(container,name,fee,extra,pos){const card=document.createElement('div');card.className='info-card';const btn=document.createElement('button');const h=document.createElement('h3');h.textContent=name;const p=document.createElement('p');p.textContent=extra;
const top=document.createElement('div');top.className='info-card-top';const left=document.createElement('div');left.append(h,p);const tag=document.createElement('span');tag.className='tag';tag.textContent=fee;top.append(left,tag);btn.append(top);card.append(btn);if(pos){btn.addEventListener('click',()=>selected(pos))}container.append(card)}
function init(){
 places=new kakao.maps.services.Places();const geocoder=new kakao.maps.services.Geocoder();
 map=new kakao.maps.Map(mapNode,{center:new kakao.maps.LatLng(37.624,127.065),level:5});
 geocoder.addressSearch(storeAddresses[store],(res,status)=>{
  if(status!==kakao.maps.services.Status.OK){message('매장 주소를 지도에 표시할 수 없습니다.');return}
  storePosition=new kakao.maps.LatLng(Number(res[0].y),Number(res[0].x));map.setCenter(storePosition);marker(storePosition,'선택 매장');
  message('실제 카카오맵에서 조회한 장소를 표시합니다. 목록을 누르면 해당 위치로 이동합니다.');renderParking();renderTransit();
 });
}
function renderParking(){
 parkingResults.innerHTML='';const data=verified[store]||[];
 if(data.length){data.forEach(row=>locate(row.query,result=>{
  if(!result){addCard(parkingResults,row.name,row.fee,'실제 장소 검색 결과가 없어 위치 미표시 · 도보 시간 확인 필요',null);return}
  const pos=new kakao.maps.LatLng(Number(result.y),Number(result.x));marker(pos,result.place_name);
  const straight=distanceMeters(storePosition,pos);
  addCard(parkingResults,result.place_name,row.fee,`${row.kind} · 직선거리 약 ${straight}m (도보시간 별도 검증 필요) · ${row.source}`,pos);
 }))}else{
  places.keywordSearch('공영주차장',(results,status)=>{
   if(status!==kakao.maps.services.Status.OK){addCard(parkingResults,'검색 실패','확인 필요','실제 장소를 찾지 못했습니다.',null);return}
   results.slice(0,8).forEach(r=>{
    const pos=new kakao.maps.LatLng(Number(r.y),Number(r.x));if(distanceMeters(storePosition,pos)>3000)return;
    marker(pos,r.place_name);addCard(parkingResults,r.place_name,'요금 확인 필요',`직선거리 약 ${distanceMeters(storePosition,pos)}m · 도보시간 확인 필요`,pos)
   })
  },{location:storePosition,radius:3000})
 }
}
function renderTransit(){
 transportResults.innerHTML='';const data=officialTransit[store]||[];
 if(data.length){data.forEach(row=>locate(row.query,result=>{
  if(!result){addCard(transportResults,row.name,row.route,`${row.walk} · 지도 위치 확인 필요`,null);return}
  const pos=new kakao.maps.LatLng(Number(result.y),Number(result.x));marker(pos,result.place_name);
  addCard(transportResults,row.name,row.route,row.walk,pos)
 }))}else{
 places.keywordSearch('지하철역',(results,status)=>{
  if(status!==kakao.maps.services.Status.OK)return;results.slice(0,6).forEach(r=>{const pos=new kakao.maps.LatLng(Number(r.y),Number(r.x));marker(pos,r.place_name);addCard(transportResults,r.place_name,'지하철',`도보 소요시간 별도 확인 필요`,pos)})
 },{location:storePosition,radius:3000})
 }
}
})();
