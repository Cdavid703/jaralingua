/* Countable-only visual upgrade. Keep the shared question/scoring engine intact. */
(() => {
 'use strict';
 if(document.body.dataset.foodPractice!=='countable')return;
 const activity=window.Basic2FoodPractice?.countable;
 if(!activity)return;
 const base='/assets/img/english-basic-2/countable-food/';
 const pictures=[
  ['two-tomatoes.png','Two whole tomatoes on a plate'],
  [null,'A bowl of rice'],
  [null,'Bread cut into slices'],
  ['one-egg.png','One whole egg on a plate'],
  [null,'Three whole apples'],
  ['oil-in-pan.png','A small amount of oil being poured into a pan'],
  ['two-avocados.png','Two whole avocados'],
  [null,'A piece of cheese'],
  [null,'Cooked chicken meat on a plate'],
  [null,'Four separate carrots'],
  ['water.png','Clear water pouring into a glass'],
  ['two-coffees.png','Two cups of coffee on a cafe table'],
  ['one-hen.png','One living hen in a farmyard'],
  [null,'Rice in a bowl'],
  ['two-cups-rice.png','Two measuring cups filled with rice']
 ];
 pictures.forEach(([file],i)=>{if(file)activity.questions[i].image=base+file;});
 document.addEventListener('DOMContentLoaded',()=>{
  const root=document.getElementById('foodPractice');
  const dialog=document.createElement('dialog');dialog.className='cq-image-dialog';dialog.setAttribute('aria-label','Enlarged food picture');
  dialog.innerHTML='<button type="button" class="cq-close">Close ✕</button><figure><img alt=""><figcaption></figcaption></figure>';
  document.body.append(dialog);
  const large=dialog.querySelector('img'),caption=dialog.querySelector('figcaption');let opener=null,oldOverflow='';
  function enhance(){
   root.querySelectorAll('.fp-question').forEach(field=>{
    if(field.querySelector('.cq-picture'))return;
    const i=Number(field.dataset.question),img=field.querySelector('.fp-question-image'),choices=field.querySelector('.fp-choices');
    if(!img||!choices)return;
    const layout=document.createElement('div');layout.className='cq-answer-layout';
    const button=document.createElement('button');button.type='button';button.className='cq-picture';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-label','Enlarge picture: '+pictures[i][1]);
    img.className='cq-food-image';img.alt=pictures[i][1];img.decoding='async';
    choices.before(layout);button.append(img);const hint=document.createElement('span');hint.textContent='Enlarge ↗';hint.className='cq-zoom-hint';button.append(hint);layout.append(button,choices);
   });
  }
  enhance();new MutationObserver(enhance).observe(root,{childList:true});
  root.addEventListener('click',event=>{
   const button=event.target.closest('.cq-picture');if(!button)return;
   const img=button.querySelector('img');opener=button;oldOverflow=document.body.style.overflow;
   large.src=img.src;large.alt=img.alt;caption.textContent='Question '+(Number(button.closest('.fp-question').dataset.question)+1);
   dialog.showModal();document.body.style.overflow='hidden';
  });
  dialog.querySelector('.cq-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;opener?.focus({preventScroll:true});});
 });
})();
