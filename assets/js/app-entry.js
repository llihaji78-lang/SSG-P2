(()=>{
  'use strict';
  const trigger=document.getElementById('brandToggle');
  const menu=document.getElementById('brandMenu');
  if(trigger&&menu){
    const close=()=>{menu.hidden=true;trigger.setAttribute('aria-expanded','false');};
    trigger.addEventListener('click',e=>{
      e.stopPropagation();
      menu.hidden=!menu.hidden;
      trigger.setAttribute('aria-expanded',String(!menu.hidden));
    });
    document.addEventListener('click',e=>{if(!menu.contains(e.target)&&e.target!==trigger)close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  }
  const carousel=document.getElementById('tradersCarousel');
  if(!carousel)return;
  const update=index=>{
    carousel.dataset.slide=String(index);
    carousel.querySelector('.carousel-counter').textContent=`${index+1} / 2`;
  };
  const next=carousel.querySelector('[data-next]');
  const prev=carousel.querySelector('[data-prev]');
  next?.addEventListener('click',()=>update(1));
  prev?.addEventListener('click',()=>update(0));
  // Also support swipe on touch devices.
  let startX=null;
  carousel.addEventListener('touchstart',e=>{startX=e.touches[0]?.clientX??null;},{passive:true});
  carousel.addEventListener('touchend',e=>{
    if(startX===null)return;
    const endX=e.changedTouches[0]?.clientX??startX;
    const delta=endX-startX;
    if(Math.abs(delta)>45)update(delta<0?1:0);
    startX=null;
  },{passive:true});
})();
