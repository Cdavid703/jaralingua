(() => {
 'use strict';
 const $=id=>document.getElementById('op-'+id),{OralClient,errorText}=window.Basic2OralAPI,client=new OralClient();
 const pair=new URLSearchParams(location.search).get('pair');let identity='',sources=[],index=0,page=1,load=0;
 function clearImage(){$('image').hidden=true;$('image').removeAttribute('src');}
 async function show(){const token=++load;clearImage();const source=sources[index];$('prev').disabled=page<=1;$('next').disabled=!source||page>=source.pages;$('count').textContent=source?page+' / '+source.pages:'';
  if(!source)return;$('status').textContent='Loading slide…';try{
   const blob=source.file?await client.request('file/'+source.file+'/'+page):null;if(token!==load)return;
   // The site allows data: images but blocks blob: images in its CSP.
   const image=blob?await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('The slide could not be read. Please try again.'));reader.readAsDataURL(blob);}):source.image;
   if(token!==load)return;$('image').src=image;$('image').alt=source.name+' · Slide '+page;
   await $('image').decode();if(token!==load)return;$('image').hidden=false;$('status').textContent=source.name;
  }catch(e){if(token===load)$('status').textContent=errorText(e);}
 }
 async function refresh(){if(!pair){$('status').textContent='Open this projector from a registered pair in the exam page.';return;}
  try{const team=await client.request('presentation/'+encodeURIComponent(pair));sources=[];
   $('title').textContent=team.members.map(m=>m.name).join(' + ');
   if(team.destination){const name=window.Basic2OralTravelContent.destinations.find(d=>d[0]===team.destination)?.[1]||team.destination;sources.push({name,pages:1,image:'/assets/img/english-basic-2/destination-detectives/'+team.destination+'.webp'});}
   for(const f of team.files)sources.push({name:f.name,pages:f.pages,file:f.id});
   $('source').replaceChildren();for(let i=0;i<sources.length;i++){const option=document.createElement('option');option.value=String(i);option.textContent=sources[i].name;$('source').append(option);}
   $('source').disabled=!sources.length;index=0;page=1;await show();if(!sources.length)$('status').textContent='This pair has not saved a picture or presentation yet. Save materials in the exam workspace, then refresh.';
  }catch(e){if(e.code==='account_changed')return;clearImage();sources=[];$('source').replaceChildren();$('source').disabled=true;$('prev').disabled=$('next').disabled=true;$('status').textContent=errorText(e);}
 }
 function move(step){const source=sources[index];if(!source)return;page=Math.max(1,Math.min(source.pages,page+step));show();}
 $('prev').onclick=()=>move(-1);$('next').onclick=()=>move(1);$('source').onchange=()=>{index=Number($('source').value);page=1;show();};$('refresh').onclick=refresh;
 $('full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('screen').requestFullscreen)await $('screen').requestFullscreen();else $('status').textContent='Use this large presentation view; full screen is unavailable in this browser.';}catch{$('status').textContent='Full screen could not start. The large presentation view is available.';}};
 document.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}});
 async function sync(){const user=window.JaraLinguaAuth?.getUser?.()||window.JaraLinguaCurrentUser||null,key=(user?.provider||'')+':'+(user?.credential||'');if(key===identity)return;identity=key;client.setUser(user);load++;clearImage();sources=[];$('title').textContent='Oral exam presentation';$('source').replaceChildren();$('source').disabled=true;$('prev').disabled=$('next').disabled=true;$('count').textContent='';$('status').textContent='Sign in with your course account to open the presentation.';if(user?.credential)await refresh();}
 const syncLogin=()=>{$('login').parentElement.hidden=Boolean(document.querySelector('.jaralingua-auth-nav .auth-trigger'));};new MutationObserver(syncLogin).observe(document.querySelector('.navbar'),{childList:true,subtree:true});syncLogin();
 window.addEventListener('jaralingua:auth-changed',sync);window.addEventListener('pagehide',()=>{load++;client.setUser(null);clearImage();});sync();setTimeout(sync,500);
})();
