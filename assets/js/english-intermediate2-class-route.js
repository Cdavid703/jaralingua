/* Open the lesson route when reached from a hero button or another activity. */
(()=>{
 'use strict';
 function reveal(){
  if(location.hash==='#class-step-7'){location.replace('practice-lab.html#class-step-7');return;}
  if(location.hash!=='#class-september-17')return;
  const route=document.getElementById('class-september-17');
  if(!route)return;
  route.open=true;
  requestAnimationFrame(()=>route.scrollIntoView({block:'start'}));
 }
 window.addEventListener('hashchange',reveal);
 document.addEventListener('click',e=>{if(e.target.closest('a[href="#class-september-17"]'))requestAnimationFrame(reveal);});
 reveal();
})();
