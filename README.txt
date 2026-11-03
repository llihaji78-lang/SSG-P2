SSG-P v3 — GitHub Pages 정적 웹앱

실행: index.html을 Chrome으로 열거나 PyCharm 내장 웹 서버를 사용하세요.

필수 1: assets/images/로고.png 파일 배치 (본인 소유 로고).
필수 2: 실제 카카오맵 지도: assets/js/map-config.js 에 JavaScript 키 입력.
          developers.kakao.com 에서 GitHub Pages 도메인(https://사용자명.github.io)과 로컬 테스트 도메인을 등록하세요.
          실제 지도/장소 검색은 키 발급 전에는 실행되지 않습니다.

도면: 3F/4F 첨부 이미지에서 주차장 부분만 잘라낸 assets/images/floor3_cropped.png, floor4_cropped.png 사용.
5F는 4F 잘라낸 도면 복제한 시뮬레이션. 개별 주차면 번호는 원본에 없어 실제 번호를 검증할 수 없습니다.

차량 등록: 등록 이전에는 차량 위치를 표시하지 않습니다. 등록하면 위치 확인이 나타나며 도면을 클릭해 시연 위치를 지정·저장합니다.
저장 장소: 브라우저 localStorage (다른 기기와 동기화하지 않음).

주차 현황 및 미래 예측은 가상 데이터이며 실제 CCTV나 매장 데이터와 연결되지 않습니다.
혼잡도 알림 ON/OFF는 로컬 브라우저 상태만 저장하며 실제 변화 감지 및 백그라운드 푸시는 아직 개발되지 않았습니다.

주변 주차장: 검색된 실제 카카오맵 장소만 지도에 표시. 서울 월계점의 석계역 공영 등 확인한 후보를 우선 검색합니다.
요금: 노원구시설관리공단 공식 요금안내를 기반으로 공영주차장 유료 여부를 표기합니다. 기타 요금은 확인 필요로 표시.
도보 시간: 공식 자료로 확인된 월계역→매장 15분만 확정 표시. 기타 정확한 도보 경로는 검증되지 않아 표기하지 않습니다.
버스: 스타필드 마켓 월계점 공식 교통 안내를 따릅니다.

GitHub Pages: repo root에 파일 올리기 → Settings / Pages → Deploy from branch / main / root.
GitHub Pages는 정적 호스팅이므로 Python 머신러닝 API는 별도 서버 필요.
