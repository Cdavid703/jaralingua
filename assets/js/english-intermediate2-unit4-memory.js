
/* Unit 4 memory follows the course team-game pattern: two pictures, oral model, teacher point. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id),board=$('memory-board'),topic=$('memory-topic'),size=$('memory-size'),gate=$('memory-gate');
  const teams=[$('memoryTeam0'),$('memoryTeam1')],scores=[$('memoryScore0'),$('memoryScore1')];
  const labels={film:'What makes a movie',genres:'Movie genres',music:'Music and media',mixed:'Mixed vocabulary'};
  const imageRoot='../../assets/img/english-intermediate-2/unit-4/explanation/';
  let vocabulary=[],deck=[],selected=[],team=0,points=[0,0],matches=0,locked=false,pending=null,timer=null,audio=null,audioButton=null;
  const sheets=new Map();
  const teamName=i=>teams[i].value.trim()||'Team '+(i+1);
  function shuffle(items){
    const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;
  }
  function stopAudio(){if(audio)audio.pause();if(audioButton)audioButton.setAttribute('aria-pressed','false');audio=null;audioButton=null;}
  async function speak(item,button=null){
    if(button===audioButton&&audio&&!audio.paused){stopAudio();return;}
    stopAudio();const clip=new Audio('audio/unit-4-explanation/'+item.audio);audio=clip;audioButton=button;clip.playbackRate=.75;
    const sync=()=>button?.setAttribute('aria-pressed',String(!clip.paused&&!clip.ended));
    ['play','pause','ended'].forEach(event=>clip.addEventListener(event,sync));
    $('memory-audio-status').textContent='';$('memory-gate-status').textContent='';
    try{await clip.play();}catch(error){
      if(error.name!=='AbortError')(gate.open?$('memory-gate-status'):$('memory-audio-status')).textContent='Audio could not play. Tap the word to try again.';
      sync();
    }
  }
  function listen(item){
    const button=document.createElement('button');button.type='button';button.className='mm-listen';
    button.textContent=item.term+' ';const mark=document.createElement('span');mark.textContent='◖))';mark.setAttribute('aria-hidden','true');button.append(mark);
    button.setAttribute('aria-label','Listen at 0.75 speed: '+item.term);button.setAttribute('aria-pressed','false');
    button.addEventListener('click',()=>speak(item,button));return button;
  }
  function art(item,key){
    const image=sheets.get(item.sheet),w=image.naturalWidth/item.cols,h=image.naturalHeight/item.rows;
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox',[item.col*w,item.row*h,w,h].join(' '));svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.setAttribute('role','img');svg.setAttribute('aria-label',item.term);
    const defs=document.createElementNS(ns,'defs'),clip=document.createElementNS(ns,'clipPath'),rect=document.createElementNS(ns,'rect');
    clip.id='memory-image-'+key;rect.setAttribute('x',item.col*w);rect.setAttribute('y',item.row*h);rect.setAttribute('width',w);rect.setAttribute('height',h);
    clip.append(rect);defs.append(clip);
    const picture=document.createElementNS(ns,'image');picture.setAttribute('href',image.src);picture.setAttribute('width',image.naturalWidth);picture.setAttribute('height',image.naturalHeight);picture.setAttribute('clip-path','url(#'+clip.id+')');
    svg.append(defs,picture);
    const wrapper=document.createElement('span');wrapper.className='mm-art';wrapper.append(svg);return wrapper;
  }
  function status(text){
    $('memory-status').textContent=text;$('memoryTurn').textContent=teamName(team);
    teams.forEach((input,i)=>input.closest('.tg-team').classList.toggle('active',i===team));
    scores.forEach((el,i)=>el.textContent=points[i]);$('memory-matches').textContent=matches+' / '+deck.length/2;
  }
  function updateCard(card){
    card.button.classList.toggle('flip',card.open);card.button.classList.toggle('matched',card.matched);
    card.front.setAttribute('aria-hidden',String(!card.open&&!card.matched));
    card.back.setAttribute('aria-hidden',String(card.open||card.matched));
    card.button.setAttribute('aria-label',card.open||card.matched?card.item.term+'. Tap to listen.':'Hidden card '+(card.index+1));
  }
  function draw(){
    board.replaceChildren();
    deck.forEach((card,index)=>{
      card.index=index;
      const button=document.createElement('button');button.type='button';button.className='tg-card';button.dataset.pair=card.item.id;
      const back=document.createElement('span');back.className='tg-face tg-back';back.textContent='?';
      const front=document.createElement('span');front.className='tg-face tg-front';
      const visual=document.createElement('span');visual.className='tg-card-visual';
      const caption=document.createElement('strong');caption.className='tg-card-label';caption.textContent=card.item.term+' ◖))';
      visual.append(art(card.item,'card-'+index),caption);front.append(visual);button.append(back,front);board.append(button);
      card.button=button;card.front=front;card.back=back;updateCard(card);
      button.addEventListener('click',()=>choose(index));
    });
  }
  function focusAvailable(){deck.find(card=>!card.matched&&!card.open)?.button.focus();}
  function choose(index){
    const card=deck[index];
    if(locked)return;
    if(card.matched||card.open){speak(card.item);return;}
    card.open=true;selected.push(index);updateCard(card);speak(card.item);
    status(teamName(team)+' revealed '+card.item.term+'.');
    if(selected.length!==2)return;
    locked=true;
    const [a,b]=selected.map(i=>deck[i]);
    if(a.item.id===b.item.id){
      pending=a.item;
      $('memory-gate-image').replaceChildren(art(pending,'gate'));
      $('memory-gate-title').replaceChildren(listen(pending));
      $('memory-gate-meaning').textContent=pending.definition;
      $('memory-gate-example').textContent=pending.example;
      gate.showModal();speak(pending,$('memory-gate-title').querySelector('button'));
      status('Pair found. '+teamName(team)+' says the word and the example before the teacher awards the point.');
    }else{
      status('No match. Look at both pictures. The turn passes to '+teamName(1-team)+'.');
      timer=setTimeout(()=>{
        timer=null;selected.forEach(i=>{deck[i].open=false;updateCard(deck[i]);});selected=[];locked=false;team=1-team;stopAudio();
        status(teamName(team)+': choose two cards.');focusAvailable();
      },1600);
    }
  }
  function award(){
    if(!pending)return;
    const item=pending;
    selected.forEach(i=>{deck[i].matched=true;updateCard(deck[i]);});
    points[team]++;matches++;selected=[];pending=null;locked=false;stopAudio();gate.close();
    const history=$('memory-history');if(matches===1)history.replaceChildren();
    const li=document.createElement('li');li.append(document.createTextNode(teamName(team)+': '),listen(item));history.append(li);
    status(teamName(team)+' earns a point and plays again.');
    if(matches===deck.length/2){
      $('memory-complete').hidden=false;
      const outcome=points[0]===points[1]?'It is a tie!':teamName(points[0]>points[1]?0:1)+' wins!';
      $('memory-result').textContent=outcome+' '+teamName(0)+': '+points[0]+' · '+teamName(1)+': '+points[1]+'. All '+matches+' pairs found.';
      status('Game complete. '+outcome);$('memory-complete').focus();
    }else focusAvailable();
  }
  function retry(){
    if(!pending)return;
    selected.forEach(i=>{deck[i].open=false;updateCard(deck[i]);});pending=null;selected=[];locked=false;stopAudio();
    gate.close();status(teamName(team)+': try the pair again.');focusAvailable();
  }
  function updateSize(){
    const count=topic.value==='mixed'?vocabulary.length:vocabulary.filter(item=>item.topic===topic.value).length;
    [...size.options].forEach(option=>option.disabled=Number(option.value)>count);
    if(Number(size.value)>count)size.value='8';
  }
  function start(focus=true){
    clearTimeout(timer);timer=null;stopAudio();pending=null;if(gate.open)gate.close();
    const pool=topic.value==='mixed'?vocabulary:vocabulary.filter(item=>item.topic===topic.value);
    const chosen=shuffle(pool).slice(0,Number(size.value));
    deck=shuffle(chosen.flatMap(item=>[{item,open:false,matched:false},{item,open:false,matched:false}]));
    team=0;points=[0,0];matches=0;selected=[];locked=false;
    $('memory-history').replaceChildren(Object.assign(document.createElement('li'),{textContent:'No matched pair yet.'}));
    $('memory-complete').hidden=true;$('memory-audio-status').textContent='';
    $('memory-round').textContent=labels[topic.value]+' · '+chosen.length+' picture pairs';
    draw();status(teamName(team)+': choose two cards.');if(focus)focusAvailable();
  }
  $('memory-award').addEventListener('click',award);$('memory-retry').addEventListener('click',retry);
  gate.addEventListener('cancel',event=>{event.preventDefault();retry();});
  topic.addEventListener('change',updateSize);
  $('memory-settings').addEventListener('submit',event=>{event.preventDefault();if(vocabulary.length)start();});
  $('memory-again').addEventListener('click',()=>start());
  teams.forEach(input=>input.addEventListener('input',()=>status('Current turn: '+teamName(team)+'.')));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio();});
  fetch('../../assets/data/english-intermediate2-unit4-memory.json')
    .then(response=>{if(!response.ok)throw new Error('Vocabulary unavailable');return response.json();})
    .then(async items=>{
      if(!Array.isArray(items)||items.length!==28||new Set(items.map(i=>i.id)).size!==28)throw new Error('Invalid vocabulary');
      await Promise.all([...new Set(items.map(i=>i.sheet))].map(sheet=>new Promise((resolve,reject)=>{
        const image=new Image();image.onload=()=>{sheets.set(sheet,image);resolve();};image.onerror=reject;image.src=imageRoot+sheet;
      })));
      vocabulary=items;updateSize();$('memory-start').disabled=false;start(false);
    }).catch(()=>{$('memory-status').textContent='The pictures could not load. Refresh this page to try again.';});
})();
