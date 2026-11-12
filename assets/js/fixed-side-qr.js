/* SSG-P: PC 전용 양쪽 고정 QR (모바일 기존 화면 유지) */
(() => {
  const css = `
    .ssgp-fixed-qr {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      width: 150px;
      height: 150px;
      z-index: 50;
      display: none;
      object-fit: contain;
      background: #fff;
    }
    @media (min-width: 1200px) {
      .ssgp-fixed-qr { display: block; }
      .ssgp-fixed-qr--left { left: calc(50% - 380px - 175px); }
      .ssgp-fixed-qr--right { right: calc(50% - 380px - 175px); }
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  ['left', 'right'].forEach(side => {
    const img = document.createElement('img');
    img.className = `ssgp-fixed-qr ssgp-fixed-qr--${side}`;
    img.src = 'assets/images/ssgp-qr.jpg';
    img.alt = `SSG-P QR코드 (${side === 'left' ? '왼쪽' : '오른쪽'})`;
    img.decoding = 'async';
    document.body.appendChild(img);
  });
})();
