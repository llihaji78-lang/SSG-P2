
const ICONS = {

  parking: `<img src="assets/images/icon-parking.png" alt="" class="ssgp-image-icon">`,



  pin: `<img src="assets/images/icon-nearby.png" alt="" class="ssgp-image-icon">`,


  mic: `<img src="assets/images/icon-mic.png" alt="" class="ssgp-image-icon">`,

  car: `<img src="assets/images/icon-car.png" alt="" class="ssgp-image-icon">`,

  bell: `<svg viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.8">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>
    <path d="M10 21h4"/>
  </svg>`
};

document.querySelectorAll("[data-icon]").forEach(el => {
  const k = el.dataset.icon;
  if (ICONS[k]) el.innerHTML = ICONS[k];
});
