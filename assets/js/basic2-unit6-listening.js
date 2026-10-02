(() => {
  'use strict';
  const question = (prompt, answer, wrong, explanation) => ({prompt, answer, options:[answer,...wrong], explanation});
  window.Basic2FoodPractice = {listening:{review:'at-the-restaurant',questions:[
    question('What is different about the customer’s lunch today?', 'She is eating at a restaurant instead of bringing lunch from home.', ['She is taking restaurant food home instead of eating there.','She is bringing food from home to share at the restaurant.'], 'She usually brings lunch from home, but today she wants to eat out.'),
    question('Why does she decide not to order the vegetable soup?', 'She wants something without cream.', ['She wants something without potatoes.','She wants something without carrots.'], 'The soup contains a little cream. She says she would prefer something without cream; she does not mention an allergy.'),
    question('What does the grilled chicken normally come with?', 'Rice and a few roasted vegetables.', ['Rice and a bowl of vegetable soup.','Roasted vegetables and a fruit salad.'], 'The server confirms that the chicken comes with rice and a few roasted vegetables.'),
    question('How does she want the rice served?', 'With the chicken, but not in a large amount.', ['In a separate bowl instead of the chicken.','Not at all; she only wants vegetables.'], '“Not too much rice” asks for a limited amount, not for all the rice to be removed.'),
    question('Which drink matches her order?', 'A glass of water without ice.', ['A glass of water with a little ice.','A bottle of water without ice.'], 'She asks for “a glass of water” and then says “No ice.” Listen for both the container and the request.'),
    question('Which desserts does the server offer?', 'Chocolate cake and fruit salad.', ['Chocolate cake and banana cake.','Fruit salad and apple cake.'], 'The two options offered are chocolate cake and fruit salad.'),
    question('What does “I have a sweet tooth” tell us about the customer?', 'She enjoys sweet food.', ['She wants very little sugar in every meal.','She has a problem with one of her teeth.'], '“Have a sweet tooth” is an idiom meaning to enjoy sweet foods; it is not a dental problem.'),
    question('What does she check before choosing the fruit salad?', 'Whether it contains bananas.', ['Whether it contains cream.','Whether it contains strawberries.'], 'Her exact question is “Does the fruit salad have any bananas?” Cream was discussed earlier, in the soup.'),
    question('Which fruit combination is in the salad?', 'Apples, strawberries, and mango.', ['Apples, strawberries, and bananas.','Bananas, strawberries, and mango.'], 'The server says “No, just apples, strawberries, and mango.” There are no bananas.'),
    question('Why does she ask for two spoons with one fruit salad?', 'She is sharing the dessert with her friend.', ['She is ordering a separate dessert for her friend.','She needs one spoon for soup and one for dessert.'], 'She says she is sharing dessert. One fruit salad and two spoons let both people eat it; she did not order soup.')
  ]}};

  const $=id=>document.getElementById(id), audio=$('foodAudio');
  document.querySelectorAll('[data-speed]').forEach(button=>button.addEventListener('click',()=>{
    audio.playbackRate=Number(button.dataset.speed);
    document.querySelectorAll('[data-speed]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    $('speedStatus').textContent=audio.playbackRate===1?'Normal speed':'Slower playback';
  }));
  audio.addEventListener('error',()=>{$('audioError').hidden=false;});
  $('retryAudio').addEventListener('click',()=>{$('audioError').hidden=true;audio.load();});
  let accessRequest=0;
  const user=()=>window.JaraLinguaAuth?.getUser?.()||window.JaraLinguaCurrentUser;
  async function updateTranscriptAccess(){
    const request=++accessRequest;
    $('teacherTools').hidden=true;$('teacherTranscript').hidden=true;$('transcriptText').textContent='';
    $('transcriptToggle').setAttribute('aria-expanded','false');
    const account=user();if(!account?.credential)return;
    try{
      const response=await fetch('/api/basic2/unit6-maple-cafe/transcript',{cache:'no-store',headers:{Authorization:'Bearer '+account.credential,'X-Jaralingua-Auth-Provider':account.provider||'google'},signal:AbortSignal.timeout(12000)});
      if(!response.ok)return;
      const data=await response.json();
      if(request!==accessRequest||user()?.credential!==account.credential)return;
      if(typeof data.transcript==='string'&&data.transcript){$('transcriptText').textContent=data.transcript;$('teacherTools').hidden=false;}
    }catch(_){/* Fail closed: no transcript is embedded in public assets. */}
  }
  $('transcriptToggle').addEventListener('click',()=>{
    if(!user()?.credential){updateTranscriptAccess();return;}
    const open=$('teacherTranscript').hidden;$('teacherTranscript').hidden=!open;$('transcriptToggle').setAttribute('aria-expanded',String(open));
  });
  window.addEventListener('jaralingua:auth-changed',updateTranscriptAccess);
  window.addEventListener('storage',updateTranscriptAccess);
  window.addEventListener('focus',updateTranscriptAccess);
  updateTranscriptAccess();
})();
