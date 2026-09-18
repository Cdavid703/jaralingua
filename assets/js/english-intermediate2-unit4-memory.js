
/* Unit 4 picture/word memory: explicit turns, reusable pronunciation, no graded score. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const board=$('memory-board'), topic=$('memory-topic'), size=$('memory-size');
  const status=$('memory-status'), next=$('memory-next');
  const review=$('memory-review'), complete=$('memory-complete');
  let vocabulary=[], deck=[], selected=[], matches=0, attempts=0, locked=false;
  let currentAudio=null, currentListen=null;
  const labels={film:'What makes a movie',genres:'Movie genres',music:'Music and media',mixed:'Mixed vocabulary'};
  function shuffle(items) {
    const result=[...items];
    for(let i=result.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [result[i],result[j]]=[result[j],result[i]];
    }
    return result;
  }
  function stopAudio() {
    if(currentAudio) currentAudio.pause();
    if(currentListen) currentListen.setAttribute('aria-pressed','false');
    currentAudio=null;currentListen=null;
  }
  function pronunciation(item) {
    const button=document.createElement('button');
    button.type='button';button.className='mm-listen';
    button.append(document.createTextNode(item.term+' '));
    const mark=document.createElement('span');mark.textContent='◖))';mark.setAttribute('aria-hidden','true');button.append(mark);
    button.setAttribute('aria-label','Listen at 0.75 speed: '+item.term);
    button.setAttribute('aria-pressed','false');
    button.addEventListener('click',async()=>{
      if(currentListen===button && currentAudio && !currentAudio.paused){stopAudio();return;}
      stopAudio();
      const audio=new Audio('audio/unit-4-explanation/'+item.audio);
      currentAudio=audio;currentListen=button;audio.playbackRate=.75;
      const sync=()=>button.setAttribute('aria-pressed',String(!audio.paused&&!audio.ended));
      ['play','pause','ended'].forEach(event=>audio.addEventListener(event,sync));
      $('memory-audio-status').textContent='';
      try{await audio.play();}
      catch(error){if(error.name!=='AbortError') $('memory-audio-status').textContent='Audio could not play. Tap the word to try again.';sync();}
    });
    return button;
  }
  function face(card,index) {
    const el=document.createElement('div');el.className='mm-face';el.hidden=true;el.tabIndex=-1;
    el.id='memory-face-'+index;
    if(card.kind==='picture'){
      el.classList.add('mm-picture');
      const crop=document.createElement('div');crop.className='u4-crop';
      for(const [key,value] of Object.entries({cols:card.item.cols,rows:card.item.rows,col:card.item.col,row:card.item.row})) crop.style.setProperty('--'+key,value);
      const img=document.createElement('img');
      img.src='../../assets/img/english-intermediate-2/unit-4/explanation/'+card.item.sheet;
      img.alt=card.item.definition;img.loading='eager';
      crop.append(img);el.append(crop);
      const clue=document.createElement('p');clue.textContent=card.item.definition;el.append(clue);
    }else{
      el.classList.add('mm-word');
      const kind=document.createElement('span');kind.className='mm-kind';kind.textContent='Word';el.append(kind,pronunciation(card.item));
    }
    return el;
  }
  function draw() {
    board.replaceChildren();
    deck.forEach((card,index)=>{
      const tile=document.createElement('article');tile.className='mm-card';tile.dataset.pair=card.item.id;tile.dataset.kind=card.kind;
      const cover=document.createElement('button');cover.type='button';cover.className='mm-cover';
      cover.setAttribute('aria-label','Reveal card '+(index+1));cover.setAttribute('aria-controls','memory-face-'+index);
      const number=document.createElement('strong');number.textContent=index+1;
      const back=document.createElement('span');back.textContent='MOVIES + MUSIC';
      cover.append(number,back);cover.addEventListener('click',()=>reveal(index));
      const front=face(card,index);tile.append(cover,front);board.append(tile);
      card.tile=tile;card.cover=cover;card.front=front;
    });
  }
  function counters() {$('memory-matches').textContent=matches+' / '+deck.length/2;$('memory-attempts').textContent=attempts;}
  function focusAvailable(){const available=deck.find(card=>!card.matched&&!card.open);if(available)available.cover.focus();}
  function addReview(item) {
    $('memory-review-empty').hidden=true;
    const card=document.createElement('article');card.className='mm-review-card';
    const title=document.createElement('h3');title.append(pronunciation(item));
    const meaning=document.createElement('p');meaning.textContent=item.definition;
    const example=document.createElement('blockquote');example.textContent=item.example;
    card.append(title,meaning,example);review.append(card);
  }
  function reveal(index) {
    const card=deck[index];
    if(locked||card.open||card.matched)return;
    card.open=true;card.cover.hidden=true;card.front.hidden=false;selected.push(index);
    (card.front.querySelector('button')||card.front).focus();
    if(selected.length===1){status.textContent='One card revealed. Find its picture or word partner.';return;}
    attempts++;
    const first=deck[selected[0]],second=card;
    if(first.item.id===second.item.id && first.kind!==second.kind){
      first.matched=second.matched=true;
      first.tile.classList.add('is-matched');second.tile.classList.add('is-matched');
      matches++;selected=[];addReview(card.item);counters();
      status.textContent='Match: '+card.item.term+'. Listen and say it, then find another pair.';
      if(matches===deck.length/2){
        complete.hidden=false;
        $('memory-result').textContent='You matched all '+matches+' pairs in '+attempts+' attempts.';
        status.textContent='Round complete! All '+matches+' pairs found.';
        complete.focus();
      }
    }else{
      locked=true;next.hidden=false;
      status.textContent='Not a pair. Compare the picture’s meaning with the word. Take your time, then try two more.';
      next.focus();counters();
    }
  }
  next.addEventListener('click',()=>{
    stopAudio();
    selected.forEach(index=>{const card=deck[index];card.open=false;card.front.hidden=true;card.cover.hidden=false;});
    selected=[];locked=false;next.hidden=true;status.textContent='Choose two cards.';focusAvailable();
  });
  function updateSize() {
    const available=topic.value==='mixed'?vocabulary.length:vocabulary.filter(item=>item.topic===topic.value).length;
    [...size.options].forEach(option=>option.disabled=Number(option.value)>available);
    if(Number(size.value)>available)size.value='8';
  }
  function start(focus=true) {
    stopAudio();
    const pool=topic.value==='mixed'?vocabulary:vocabulary.filter(item=>item.topic===topic.value);
    const chosen=shuffle(pool).slice(0,Number(size.value));
    deck=shuffle(chosen.flatMap(item=>[{item,kind:'picture'},{item,kind:'word'}]));
    selected=[];matches=0;attempts=0;locked=false;next.hidden=true;complete.hidden=true;
    review.replaceChildren();$('memory-review-empty').hidden=false;$('memory-audio-status').textContent='';
    $('memory-round').textContent=labels[topic.value]+' · '+chosen.length+' pairs';
    status.textContent='Choose two cards. Match a picture and its meaning with the word.';
    counters();draw();if(focus)focusAvailable();
  }
  topic.addEventListener('change',updateSize);
  $('memory-settings').addEventListener('submit',event=>{event.preventDefault();if(vocabulary.length)start();});
  $('memory-again').addEventListener('click',()=>start());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio();});
  fetch('../../assets/data/english-intermediate2-unit4-memory.json')
    .then(response=>{if(!response.ok)throw new Error('Vocabulary unavailable');return response.json();})
    .then(items=>{
      if(!Array.isArray(items)||items.length!==28||new Set(items.map(item=>item.id)).size!==28)throw new Error('Invalid vocabulary');
      vocabulary=items;updateSize();$('memory-start').disabled=false;start(false);
    }).catch(()=>{status.textContent='The vocabulary could not load. Refresh this page to try again, or open the Unit 4 language review below.';$('memory-round').textContent='Vocabulary unavailable';});
})();
