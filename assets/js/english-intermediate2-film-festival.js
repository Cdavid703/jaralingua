
(() => {
  'use strict';
  const $=id=>document.getElementById(id),root='/api/intermediate2/film-festival/';
  let user=null,epoch=0,view=0,state=null,selectedImage='',requestId=null,currentCode='',gradeEntry=null,projectEntry=null;
  let urls=[],entryImages=new Map(),durations=new Map(),clock=null,elapsed=0,started=0,ownsFullscreen=false;
  const errors={
    class_not_found:'Class not found. Check the code or choose one of your classes.',
    submissions_closed:'The teacher has closed submissions for this class.',
    entry_already_reviewed:'This entry has already been evaluated and cannot be replaced.',
    entry_changed_refresh:'This entry changed. Refresh the class before continuing.',
    image_too_large:'Choose an image of 8 MB or less.',
    image_too_small_or_invalid:'Use a JPG, PNG or WebP image at least 320 × 240 pixels.',
    image_dimensions_too_large:'The image is too large in pixels. Export a smaller version.',
    invalid_image:'This file could not be read as an image.',
    use_png_jpeg_or_webp:'Choose a JPG, PNG or WebP image.',
    invalid_scores:'Rate every criterion from 0 to 5.',
    invalid_duration:'Enter the presentation duration in whole seconds.',
    invalid_text:'Check the title, description and class name lengths.',
    festival_temporarily_unavailable:'The festival is temporarily unavailable. Your form is still here; please try again.',
    teacher_required:'A teacher account is required for this action.',
    confirm_no_text:'Confirm that your image has no written text.',
    choose_required_expressions:'Choose one phrasal verb and one idiom.',
    missing_token:'Sign in to continue.'
  };
  function message(error,target='ff-message'){if(error.message!=='session_changed')$(target).textContent=errors[error.message]||error.message||'The request could not be completed. Try again.';}
  function headers(){return {Authorization:'Bearer '+user.credential,'X-Jaralingua-Auth-Provider':user.provider||'google'};}
  async function request(path,options={},binary=false){
    if(!user?.credential)throw new Error('Sign in to continue.');
    const ticket=epoch;
    const response=await fetch(path,{...options,headers:{...headers(),...(options.body?{'Content-Type':'application/json'}:{}),...options.headers},cache:'no-store'});
    if(ticket!==epoch)throw new Error('session_changed');
    if(!response.ok){
      let result={};try{result=await response.json();}catch{}
      throw new Error(result.error||(response.status===401?'Your session expired. Sign in again.':'The request failed. Please try again.'));
    }
    const result=await (binary?response.blob():response.json());
    if(ticket!==epoch)throw new Error('session_changed');
    return result;
  }
  const api=(action,payload)=>request(root+action,payload?{method:'POST',body:JSON.stringify(payload)}:{});
  const blobData=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
  function clearUrls(){urls.forEach(url=>URL.revokeObjectURL(url));urls=[];entryImages.clear();}
  async function privateImage(entry){
    const ticket=epoch;
    const blob=await request(entry.imageUrl,{},true);
    if(ticket!==epoch)throw new Error('session_changed');
    const url=URL.createObjectURL(blob);urls.push(url);entryImages.set(entry.id,url);return {url,blob};
  }
  function node(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
  function formatReview(review){
    const box=document.createDocumentFragment();
    box.append(node('h3','Teacher feedback'),node('p','Image: '+review.imageGrade.toFixed(2)+' / 5 · Live review: '+review.oralGrade.toFixed(2)+' / 5'),
      node('p','Duration: '+review.seconds+' seconds · '+(review.minimumMet?'60-second minimum met.':'Below the 60-second minimum.')),
      node('p','Phrasal verb: '+(review.phrasalObserved?'observed':'not yet demonstrated')+' · Idiom: '+(review.idiomObserved?'observed':'not yet demonstrated')));
    if(review.feedback)box.append(node('p',review.feedback));
    return box;
  }
  async function loadState(query={}){
    const ticket=epoch,screen=++view;
    const result=await api('state'+(Object.keys(query).length?'?'+new URLSearchParams(query):''));
    if(ticket!==epoch||screen!==view)return;
    state=result;
    const staff=['teacher','admin'].includes(result.role);
    $('ff-signin').hidden=true;$('ff-teacher').hidden=!staff;$('ff-student').hidden=staff;
    $('ff-message').textContent=staff?'Teacher workspace · '+result.name:'Signed in as '+result.name;
    if(staff)await renderTeacher(result,screen);else if(result.class)await renderStudent(result,screen);
  }
  async function renderStudent(result,screen){
    clearUrls();selectedImage='';
    $('ff-student-class').hidden=false;$('ff-class-name').textContent=result.class.name;
    const entry=result.entry;
    $('ff-fields').disabled=result.class.closed||Boolean(entry?.review);
    $('ff-student-status').textContent=entry?'Received: '+new Date(entry.submittedAt).toLocaleString()+'. Receipt: '+entry.receiptId: 'No entry submitted yet.';
    if(result.class.closed)$('ff-student-status').textContent+=' Submissions are closed.';
    if(entry?.review)$('ff-student-status').textContent+=' Your teacher has evaluated this entry.';
    $('ff-movie').value=entry?.movieTitle||'';$('ff-origin').value=entry?.origin||'ai';$('ff-description').value=entry?.description||'';
    $('ff-phrasal').value=entry?.phrasalVerb||'';$('ff-idiom').value=entry?.idiom||'';
    $('ff-file').value='';$('ff-no-text').checked=false;
    $('ff-preview').hidden=true;$('ff-preview').removeAttribute('src');
    $('ff-my-review').hidden=!entry?.review;$('ff-my-review').replaceChildren();
    if(entry?.review)$('ff-my-review').append(formatReview(entry.review));
    if(entry){
      const ticket=epoch,{url,blob}=await privateImage(entry);
      const data=await blobData(blob);if(ticket!==epoch||screen!==view)return;
      selectedImage=data;$('ff-preview').src=url;$('ff-preview').hidden=false;
    }
  }
  async function renderTeacher(result,screen){
    clearUrls();$('ff-gallery').replaceChildren();
    const select=$('ff-class-select');
    select.replaceChildren(new Option('Select a class',''));
    result.classes.forEach(room=>select.add(new Option(room.name+' ('+room.count+')',room.id)));
    select.value=result.class?.id||'';
    $('ff-toggle').hidden=!result.class;$('ff-class-info').hidden=!result.class;
    if(!result.class){$('ff-gallery-status').textContent='Create a class, then share its code with your students.';return;}
    $('ff-class-info').textContent=result.class.name+' · Student code: '+result.class.code+' · '+(result.class.closed?'Submissions closed':'Submissions open');
    $('ff-toggle').textContent=result.class.closed?'Reopen submissions':'Close submissions';
    $('ff-gallery-status').textContent=result.entries.length?result.entries.length+' student entries.':'No images yet. Share the class code and refresh after students submit.';
    const ticket=epoch;
    await Promise.all(result.entries.map(async entry=>{
      const card=node('article',undefined,'ff-entry'),project=node('button',undefined,'ff-entry-project');
      project.type='button';project.disabled=true;project.setAttribute('aria-label','Project '+entry.movieTitle+' by '+entry.studentName);
      const img=node('img');img.alt='Presentation image for '+entry.movieTitle;
      project.append(img,node('strong',entry.studentName),node('span',entry.movieTitle));project.addEventListener('click',()=>openProjection(entry));
      const note=node('p',entry.review?'Image '+entry.review.imageGrade.toFixed(2)+'/5 · Review '+entry.review.oralGrade.toFixed(2)+'/5':'Awaiting presentation');
      const evaluate=node('button','Evaluate','intermediate2-button');evaluate.type='button';evaluate.addEventListener('click',()=>openEvaluation(entry));
      card.append(project,note,evaluate);$('ff-gallery').append(card);
      try{const {url}=await privateImage(entry);if(ticket!==epoch||screen!==view)return;img.src=url;project.disabled=false;}
      catch(error){if(ticket===epoch)note.textContent='Image unavailable. Refresh the gallery to retry.';}
    }));
  }
  $('ff-signin').addEventListener('click',event=>{event.stopPropagation();window.JaraLinguaAuth?.openPanel();});
  $('ff-join').addEventListener('submit',async event=>{
    event.preventDefault();$('ff-student-class').hidden=true;currentCode=$('ff-code').value.trim().toUpperCase();$('ff-code').value=currentCode;
    try{await loadState({code:currentCode});}catch(error){message(error);}
  });
  $('ff-file').addEventListener('change',async()=>{
    requestId=null;const file=$('ff-file').files[0];if(!file)return;
    selectedImage='';$('ff-preview').hidden=true;$('ff-no-text').checked=false;
    try{
      if(file.size>8*1024*1024)throw new Error('image_too_large');
      if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('use_png_jpeg_or_webp');
      const ticket=epoch,data=await blobData(file),img=new Image();img.src=data;await img.decode();if(ticket!==epoch)return;
      if(img.naturalWidth<320||img.naturalHeight<240)throw new Error('image_too_small_or_invalid');
      if(img.naturalWidth*img.naturalHeight>20_000_000)throw new Error('image_dimensions_too_large');
      selectedImage=data;$('ff-preview').src=data;$('ff-preview').hidden=false;$('ff-no-text').checked=false;
      $('ff-student-status').textContent='Preview ready. Check the image for text before submitting.';
    }catch(error){selectedImage='';$('ff-preview').hidden=true;$('ff-file').value='';message(error,'ff-student-status');}
  });
  $('ff-submit').addEventListener('input',()=>requestId=null);
  $('ff-submit').addEventListener('submit',async event=>{
    event.preventDefault();if(!selectedImage){message(new Error('Choose your main image first.'),'ff-student-status');return;}
    if(!state?.class||state.role!=='student')return;
    const button=$('ff-send');button.disabled=true;$('ff-student-status').textContent='Uploading your entry…';
    requestId=requestId||crypto.randomUUID();
    try{
      await api('submit',{code:currentCode,clientSubmissionId:requestId,revision:state.entry?.revision||0,movieTitle:$('ff-movie').value,description:$('ff-description').value,origin:$('ff-origin').value,phrasalVerb:$('ff-phrasal').value,idiom:$('ff-idiom').value,textFreeConfirmed:$('ff-no-text').checked,imageDataUrl:selectedImage});
      requestId=null;await loadState({code:currentCode});
    }catch(error){message(error,'ff-student-status');}
    finally{button.disabled=false;}
  });
  $('ff-create').addEventListener('submit',async event=>{
    event.preventDefault();const button=event.submitter;button.disabled=true;
    try{const result=await api('classes',{name:$('ff-new-name').value});$('ff-new-name').value='';await loadState({classId:result.classId});}
    catch(error){message(error);}finally{button.disabled=false;}
  });
  $('ff-class-select').addEventListener('change',()=>loadState($('ff-class-select').value?{classId:$('ff-class-select').value}:{}).catch(message));
  $('ff-refresh').addEventListener('click',()=>loadState(state?.class?{classId:state.class.id}:{}).catch(message));
  $('ff-toggle').addEventListener('click',async()=>{
    if(!state?.class)return;const button=$('ff-toggle');button.disabled=true;
    try{await api('class-status',{classId:state.class.id,closed:!state.class.closed});await loadState({classId:state.class.id});}catch(error){message(error);}finally{button.disabled=false;}
  });
  function timerValue(){return elapsed+(started?performance.now()-started:0);}
  function tick(){
    const seconds=Math.floor(timerValue()/1000);$('ff-timer').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
    $('ff-timer-note').textContent=seconds>=60?'60-second minimum reached':'Minimum: 01:00';
  }
  function stopTimer(){if(started){elapsed+=performance.now()-started;started=0;}clearInterval(clock);clock=null;$('ff-timer-start').textContent='Resume timer';tick();}
  function openProjection(entry){
    projectEntry=entry;elapsed=0;started=0;clearInterval(clock);clock=null;
    $('ff-project-title').textContent=entry.movieTitle;$('ff-project-student').textContent=entry.studentName;
    $('ff-project-image').src=entryImages.get(entry.id);$('ff-project-image').alt='Presentation image for '+entry.movieTitle;
    $('ff-timer-start').textContent='Start timer';tick();$('ff-projector').showModal();document.documentElement.style.overflow='hidden';
  }
  $('ff-timer-start').addEventListener('click',()=>{
    if(started){stopTimer();return;}started=performance.now();clock=setInterval(tick,200);$('ff-timer-start').textContent='Pause timer';
  });
  $('ff-timer-reset').addEventListener('click',()=>{stopTimer();elapsed=0;tick();$('ff-timer-start').textContent='Start timer';});
  $('ff-project-close').addEventListener('click',()=>$('ff-projector').close());
  $('ff-projector').addEventListener('close',()=>{
    stopTimer();if(projectEntry&&elapsed>0)durations.set(projectEntry.id,Math.floor(elapsed/1000));
    projectEntry=null;document.documentElement.style.overflow='';
    if(ownsFullscreen&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});ownsFullscreen=false;
  });
  $('ff-fullscreen').hidden=!document.fullscreenEnabled;
  $('ff-fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement){await document.exitFullscreen();ownsFullscreen=false;}else{await document.documentElement.requestFullscreen();ownsFullscreen=true;}}catch{}});
  document.addEventListener('fullscreenchange',()=>$('ff-fullscreen').textContent=document.fullscreenElement?'Exit full screen':'Full screen');
  function scoreFields(target,criteria,values=[]){
    $(target).replaceChildren();
    criteria.forEach((criterion,index)=>{
      const label=node('label',criterion),select=node('select');select.required=true;select.name=target+'-'+index;
      select.add(new Option('Choose a score',''));for(let score=0;score<=5;score++)select.add(new Option(String(score),String(score)));
      select.value=values[index]===undefined?'':String(values[index]);label.append(select);$(target).append(label);
    });
  }
  function openEvaluation(entry){
    gradeEntry=entry;$('ff-evaluate-title').textContent=entry.studentName+' · '+entry.movieTitle;
    $('ff-evaluate-description').textContent='Image description / prompt: '+entry.description;
    $('ff-evaluate-expressions').textContent='Planned phrasal verb: '+entry.phrasalVerb+' · Planned idiom: '+entry.idiom;
    scoreFields('ff-image-scores',state.imageCriteria,entry.review?.imageScores);scoreFields('ff-oral-scores',state.oralCriteria,entry.review?.oralScores);
    $('ff-seconds').value=durations.get(entry.id)??entry.review?.seconds??'';
    $('ff-observed-phrasal').checked=entry.review?.phrasalObserved||false;$('ff-observed-idiom').checked=entry.review?.idiomObserved||false;$('ff-image-textfree').checked=entry.review?.textFreeImage||false;
    $('ff-feedback').value=entry.review?.feedback||'';$('ff-grade-status').textContent='';$('ff-evaluate').showModal();
  }
  $('ff-evaluate-close').addEventListener('click',()=>$('ff-evaluate').close());
  $('ff-grade').addEventListener('submit',async event=>{
    event.preventDefault();if(!gradeEntry)return;
    const button=$('ff-grade-save');button.disabled=true;
    try{
      await api('review',{entryId:gradeEntry.id,revision:gradeEntry.revision,imageScores:[...$('ff-image-scores').querySelectorAll('select')].map(e=>Number(e.value)),oralScores:[...$('ff-oral-scores').querySelectorAll('select')].map(e=>Number(e.value)),seconds:Number($('ff-seconds').value),phrasalObserved:$('ff-observed-phrasal').checked,idiomObserved:$('ff-observed-idiom').checked,textFreeImage:$('ff-image-textfree').checked,feedback:$('ff-feedback').value});
      $('ff-evaluate').close();await loadState({classId:state.class.id});$('ff-message').textContent='Evaluation saved.';
    }catch(error){message(error,'ff-grade-status');}finally{button.disabled=false;}
  });
  function authChanged(){
    epoch++;view++;user=window.JaraLinguaAuth?.getUser()||window.JaraLinguaCurrentUser||null;
    if($('ff-projector').open)$('ff-projector').close();if($('ff-evaluate').open)$('ff-evaluate').close();
    clearUrls();state=null;selectedImage='';currentCode='';requestId=null;gradeEntry=null;durations.clear();
    $('ff-gallery').replaceChildren();$('ff-my-review').replaceChildren();$('ff-grade').reset();
    ['ff-evaluate-title','ff-evaluate-description','ff-evaluate-expressions','ff-project-title','ff-project-student','ff-class-info','ff-class-name','ff-student-status'].forEach(id=>$(id).textContent='');
    $('ff-student').hidden=true;$('ff-teacher').hidden=true;$('ff-student-class').hidden=true;
    $('ff-submit').reset();$('ff-join').reset();$('ff-preview').removeAttribute('src');$('ff-project-image').removeAttribute('src');
    $('ff-signin').hidden=Boolean(user?.credential);
    $('ff-message').textContent=user?.credential?'Loading your festival workspace…':'Sign in to submit your image or open your teacher gallery.';
    if(user?.credential)loadState().catch(message);
  }
  window.addEventListener('jaralingua:auth-changed',authChanged);
  if(document.readyState!=='complete')window.addEventListener('load',authChanged,{once:true});
  authChanged();
})();
