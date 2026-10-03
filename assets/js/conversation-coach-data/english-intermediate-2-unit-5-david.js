(() => {
  'use strict';
  const scripts = {};
  const say = (id, text) => { const file = id + '.mp3'; scripts[file] = text; return {file, text}; };
  const check = (label, pattern) => ({label, pattern});
  const future = "\\b(?:will|going to|plan|planning|would|want to|hope to|i'll)\\b";
  const reason = "\\b(?:because|so|since|to make|to show|to feel|to avoid|to help)\\b";
  const feelings = "\\b(?:nervous|anxious|worried|excited|happy|relaxed|calm|confident|afraid|scared|curious|comfortable|uncomfortable|unsure|shy|overwhelmed)\\b";
  const q = (id, topic, text, frames, vocabulary, grammar, checks, improved, options = {}) => ({
    id,topic,text,audio:say(id,text).file,frames,vocabulary,grammar,checks,improved,
    minWords:8,maxSeconds:55,unitTerms:vocabulary,...options
  });
  const reply = (id,text,pattern,exclude) => ({...say(id,text),pattern,exclude});
  const questions = [
    q('david-01','Let’s meet',"Hi! I'm David, your conversation coach. What's your name?",
      ['My name is ___.','I’m ___. Nice to meet you.'],['my name is','nice to meet you'],
      'Your name is welcome in any language. You can correct its transcription; this introduction is not scored.',
      [{label:'your introduction',kind:'word-count',minMatches:1}], 'Hi, David. My name is Ana.',
      {minWords:1,maxSeconds:20,unscored:true,reaction:say('reply-name',"Nice to meet you! I'm glad you're here. Let's get ready for that first visit.")}),
    q('david-02','Before the visit',"Imagine you're meeting your partner's family for the first time this coming weekend. How are you feeling, and why?",
      ['I’m feeling ___ because ___.','I’m a little nervous because I want to make a good impression.'],
      ['nervous','excited','relaxed','because'],'Describe your feelings now about a future visit. An imagined situation is fine.',
      [check('a feeling',feelings),check('a reason',reason)],'I’m excited because I want to get to know them, but I’m a little nervous too.',
      {followUpSet:'feelings',reaction:say('reply-feelings',"Thanks for telling me how you feel. First meetings can bring up different emotions."),reactionResponses:[
        reply('reply-mixed',"Feeling excited and nervous at the same time makes sense. Let's take it one step at a time.","\\bexcited\\b.*\\b(?:nervous|worried)\\b|\\b(?:nervous|worried)\\b.*\\bexcited\\b","\\b(?:not|never|hardly)\\b"),
        reply('reply-calm',"It sounds as though you're feeling fairly calm. That can help you listen and enjoy getting to know them.","\\b(?:relaxed|calm|confident|not (?:very |really |too |at all )?(?:nervous|worried|anxious))\\b","\\b(?:not|never) (?:very |really |too )?(?:relaxed|calm|confident)\\b"),
        reply('reply-nervous',"You mentioned feeling nervous or worried. That's understandable before meeting people who matter to you.","\\b(?:nervous|worried|anxious|scared|afraid)\\b","\\b(?:not|never|hardly|isn't|aren't) (?:very |really |too |at all )?(?:nervous|worried|anxious|scared|afraid)\\b"),
        reply('reply-excited',"You sound excited about the visit. It's a chance to get to know people who are important to your partner.","\\b(?:excited|happy|curious)\\b","\\bnot (?:very |really )?(?:excited|happy|curious)\\b")]}),
    q('david-03','What’s on your mind?',"What worries you most about the visit? If nothing worries you, tell me what helps you feel confident.",
      ['I’m worried that ___ because ___.','I’m not worried because my partner ___.'],['worried','confident','conversation','because'],
      'Explain one concern, or explain why you feel confident. You do not have to invent a worry.',
      [check('a concern or confidence',"\\b(?:worr|nervous|afraid|fear|anxious|confident|calm|relaxed|nothing|saying|silence|impression)"),check('explanation',reason)],
      'I’m worried about running out of things to say because I don’t know their interests yet.',
      {reaction:say('reply-worries',"Thanks for explaining. You don't have to be perfect. Listening and asking a simple question can help.")}),
    q('david-04','Getting ready',"What are you planning to do before the visit to make a good first impression?",
      ['First, I’m going to ___. Then, I’ll ___.','I’ll ask my partner about their interests and check the arrival time.'],['first','then','ask','prepare','going to'],
      'Use going to, will, or I’m planning to. Keep this visit in the future.',
      [check('a future plan',future),check('a preparation',"\\b(?:ask|check|prepare|buy|bring|find|learn|practice|choose|arrive|read|plan|gift|time|cook)\\b")],
      'First, I’m going to ask about their interests. Then, I’ll check the time and plan my journey.',
      {followUpSet:'preparation',reaction:say('reply-preparation',"Let's think about how that preparation could make the visit easier for everyone."),reactionResponses:[
        reply('reply-gift',"You mentioned a gift or something to bring. Checking what the family would enjoy is a thoughtful next step.","\\b(?:gift|flowers|dessert|bring|chocolate)\\b","\\b(?:not|won't|never) (?:bring|buy)\\b"),
        reply('reply-ask-partner',"Asking your partner can give you useful context. Families have different routines and preferences.","\\bask\\b.*\\bpartner\\b","\\b(?:not|won't) ask\\b")]}),
    q('david-05','Appearance',"What will you wear, and why will it suit this visit?",
      ['I’ll wear ___ because ___.','I’m going to wear a clean shirt and comfortable trousers.'],['wear','comfortable','clean','casual','because'],
      'Explain your choice. There is no single correct outfit; consider the setting and your comfort.',
      [check('clothes or appearance',"\\b(?:wear|shirt|dress|jeans|trousers|pants|shoes|outfit|clothes|jacket|sweater|skirt)\\b"),check('a reason',reason)],
      'I’ll wear a clean shirt and comfortable jeans because we’re having a relaxed lunch at home.',
      {reaction:say('reply-appearance',"Your clothes can help you feel comfortable. Matching the occasion matters more than dressing to impress at any cost.")}),
    q('david-06','Thoughtful behaviour',"How will you show that you're polite and interested while you're with the family? Give me two things you'll do.",
      ['I’ll ___, and I’ll also ___.','I’ll listen carefully and offer to help after lunch.'],['listen','thank','offer','help','also'],
      'Plan two observable actions. For example, listen, ask questions, thank the hosts, or put your phone away.',
      [check('thoughtful behaviour',"\\b(?:listen|thank|help|offer|polite|respect|ask|phone|interrupt|smile)\\b"),check('connected actions',"\\b(?:and|also|then|first|second)\\b")],
      'I’ll listen without interrupting, and I’ll also offer to help clear the table.',
      {reaction:say('reply-behaviour',"Small actions can show interest and respect. Let the family's preferences guide you too."),reactionResponses:[
        reply('reply-phone',"Putting your phone away can help you give people your attention. You can still explain if you're expecting an urgent call.","\\b(?:put|leave|keep|turn)\\b.*\\bphone\\b")]}),
    q('david-07','Starting a conversation',"Which topics could you talk about? Choose one and say the actual question you might ask the family.",
      ['We could talk about ___. I might ask, “___?”','We could talk about hobbies. What do you enjoy doing at weekends?'],['hobbies','food','travel','weekends','could'],
      'Name a suitable topic and ask an open question. Show interest without assuming what they like.',
      [check('a possible topic',"\\b(?:hobb|food|cook|travel|weekend|pet|sport|music|film|movie|book|work|garden|family|interest)"),{label:'an actual question',kind:'question-starters',minMatches:1}],
      'We could talk about food. I might ask, “What do you enjoy cooking at home?”',
      {followUpSet:'topics',reaction:say('reply-topics',"An open question gives the other person room to share. Listening to the answer will help you choose what to say next.")}),
    q('david-08','Sensitive topics',"Are there any topics you would avoid at a first meeting, or approach carefully? Why?",
      ['I would avoid asking about ___ because ___.','I’d be careful with ___ until I know them better.'],['avoid','private','sensitive','careful','because'],
      'Explain your judgement for this family and situation. Topics are not universally forbidden.',
      [check('a topic or boundary',"\\b(?:politic|religio|money|salar|income|personal|private|health|relationship|argument|sensitive|avoid|nothing)"),check('a reason',reason)],
      'I would avoid questions about salaries because they might feel too personal at a first meeting.',
      {followUpSet:'boundaries',reaction:say('reply-boundaries',"People have different boundaries. Paying attention to their comfort is a useful guide."),reactionResponses:[
        reply('reply-money',"Questions about money or salary can feel personal. You could let them decide whether to bring that up.","\\b(?:money|salary|salaries|income)\\b")]}),
    q('david-09','At the door',"Let's role-play. I'm one of your partner's relatives. Hello! It's lovely to meet you. Come in! What do you say?",
      ['Hello! It’s lovely to meet you too. Thank you for ___.','Hi! Thanks for inviting me. Your home looks lovely.'],['hello','lovely','thank you','inviting'],
      'Respond as a guest now. A friendly greeting and thanks are enough; do not narrate the greeting.',
      [check('a greeting',"\\b(?:hi|hello|nice|lovely|pleased|good)\\b"),check('thanks',"\\b(?:thank|thanks)\\b")],
      'Hello! It’s lovely to meet you too. Thank you for inviting me.',
      {minWords:5,reaction:say('reply-door',"You're very welcome! Please make yourself comfortable. We're glad you could come.")}),
    q('david-10','An awkward moment',"During lunch, you don't understand something I say. How could you ask me politely to repeat it?",
      ['Sorry, could you ___, please?','I’m sorry, I didn’t catch that. Could you say it again?'],['sorry','could you','repeat','again','please'],
      'Speak directly to the person. A polite request is more useful than pretending to understand.',
      [check('a request to repeat',"\\b(?:repeat|again|catch|understand|pardon|slowly)\\b"),check('politeness',"\\b(?:sorry|please|could|would|pardon|excuse)\\b")],
      'Sorry, I didn’t catch that. Could you say it again, please?',
      {minWords:5,reaction:say('reply-repeat',"Of course! I was asking what you like to do at weekends. It's always okay to ask me to repeat something.")}),
    q('david-11','Ask David',"Now ask me one question about making a good first impression. You can ask about clothes, feelings, preparation, or conversation.",
      ['What would you ___? / How can I ___?','What would you wear to a relaxed family lunch?'],['what','how','would','should','could'],
      'Ask one question. David answers familiar topics and asks for clarification if he cannot identify yours.',
      [{label:'a question to David',kind:'question-starters',minMatches:1}],
      'How can I keep the conversation going if I feel nervous?',{interaction:true,expectedQuestionCount:1,minWords:4}),
    q('david-12','A message to your best friend',"Before the visit, send your best friend an imaginary voice message. Greet your friend, explain your feelings and plans, mention topics to discuss or avoid, and finish warmly. Use your own ideas from our conversation.",
      ['Hi ___! This weekend I’m going to ___. I feel ___ because ___.','First, ___. Then, ___. Also, ___. However, ___. Wish me luck! Talk soon.'],
      ['first','then','also','however','wish me luck','talk soon'],
      'Speak BEFORE the visit. Organise your own ideas; this is not a written answer to memorise. Up to three minutes.',
      [check('a friendly greeting',"\\b(?:hi|hey|hello|dear)\\b"),check('feelings',feelings),check('future plans',future),check('preparation or appearance',"\\b(?:wear|clothes|shirt|dress|prepare|ask my partner|bring|gift|check|arrive)\\b"),check('behaviour',"\\b(?:listen|thank|help|polite|phone|respect|offer)\\b"),check('conversation topics',"\\b(?:talk|topic|discuss|avoid|ask them|conversation)\\b"),check('connectors',"\\b(?:first|then|also|however)\\b"),check('a friendly ending',"\\b(?:bye|talk soon|see you|wish me luck|write soon|take care|lots of love|let you know)\\b")],
      'Build your own message from your answers: greeting → feelings → preparation and appearance → behaviour → topics → friendly closing.',
      {minWords:55,maxSeconds:180,reaction:say('reply-message',"Thank you for sharing your message with me. Keep your own voice and ideas when you write. Your feedback can help you decide what to practise next.")})
  ];
  const follow = (id,text,frames,vocabulary,grammar,checks,improved,options={}) => q(id,'Follow-up',text,frames,vocabulary,grammar,checks,improved,{minWords:6,maxSeconds:40,...options});
  const followUpSets = {
    feelings: {
      incomplete:follow('feelings-help','What makes you feel that way about this meeting?',['I feel this way because ___.','I don’t know them yet, so I feel a little unsure.'],['because','meeting','unsure'],'Add one reason, in your own words.',[check('a reason',reason)],'I feel nervous because I don’t know what they will think of me.'),
      complete:follow('feelings-extend','What could help you enjoy the meeting, whatever emotions you feel?',['It might help to ___.','I could take a breath and ask a friendly question.'],['could','help','relax'],'Suggest one helpful action.',[check('a helpful action',"\\b(?:could|might|help|ask|listen|breathe|breath|relax|talk)\\b")],'I could ask about their hobbies and listen carefully.'),
      calm:follow('feelings-calm','How could you help someone else feel comfortable at the meeting?',['I could help them by ___.','I could include them in the conversation.'],['include','listen','smile'],'Think about another person’s comfort.',[check('a supportive action',"\\b(?:ask|help|listen|include|smile|talk|offer)\\b")],'I could smile and include them in the conversation.')
    },
    preparation:{
      incomplete:follow('preparation-help','Choose one thing to prepare. What will you do, and when?',['I’ll ___ before ___.','I’ll check the journey the night before the visit.'],['will','before','check'],'Make one concrete future plan.',[check('a future plan',future),check('timing',"\\b(?:before|night|morning|friday|saturday|tomorrow|today|early)\\b")],'I’ll ask my partner about the family’s routine before Saturday.'),
      complete:follow('preparation-extend','Suppose your plans change at the last minute. How will you let the family know?',['If ___, I’ll ___.','I’ll call to explain and apologise if I’m delayed.'],['call','message','explain','if'],'Use if + present, then will for the result.',[check('a way to communicate',"\\b(?:call|message|text|phone|tell|explain|contact)\\b")],'If my bus is late, I’ll call to explain and apologise.')
    },
    topics:{
      incomplete:follow('topics-help','Imagine you want to learn about their hobbies. What question could you ask?',['What do you enjoy ___?','What do you like doing in your free time?'],['what','enjoy','free time'],'Ask directly with question word + auxiliary + subject.',[{label:'a question',kind:'question-starters',minMatches:1}],'What do you enjoy doing at weekends?'),
      complete:follow('topics-extend',"I tell you, 'I love cooking with my family.' What would you ask me next?",['What do you like ___?','What’s your favourite dish to cook together?'],['dish','favourite','cook'],'Use the detail you heard to keep the exchange going.',[{label:'a follow-up question',kind:'question-starters',minMatches:1},check('the cooking detail',"\\b(?:cook|dish|food|recipe|meal|kitchen|family|together)\\b")],'What’s your favourite dish to cook together?')
    },
    boundaries:{
      incomplete:follow('boundaries-help','Why might that topic make someone uncomfortable at a first meeting?',['They might feel ___ because ___.','It could feel too personal because we don’t know each other yet.'],['might','personal','because'],'Explain the possible effect, without claiming everyone feels the same.',[check('a possible reason',reason)],'It might feel too personal because we don’t know each other yet.'),
      complete:follow('boundaries-extend','If someone brings up a topic you prefer not to discuss, what could you say politely?',['I’d rather not discuss ___, but ___.','I’d prefer to keep that private. Could we talk about something else?'],['prefer','private','rather','could'],'Set a respectful boundary; you do not have to answer personal questions.',[check('a polite boundary',"\\b(?:prefer|rather|private|could|sorry|comfortable)\\b")],'I’d prefer to keep that private. Could we talk about your garden instead?')
    }
  };
  const interactionResponses = [
    reply('answer-clothes',"I'd choose something clean and comfortable that suits the occasion. For a relaxed lunch, I'd probably wear a simple shirt and jeans.","\\b(?:wear|clothes|outfit|dress|appearance)\\b"),
    reply('answer-nerves',"I'd take a slow breath and focus on getting to know one person at a time. You don't have to impress everyone with a perfect answer.","\\b(?:nervous|anxious|worr|calm|relax|feel|confident)"),
    reply('answer-topics',"I'd start with hobbies, food, or something they enjoy. Then I'd ask a follow-up based on what they actually said.","\\b(?:topic|conversation|talk|discuss|silence|quiet|hobbies)\\b"),
    reply('answer-avoid',"I'd be careful with very personal questions until I knew them better. Different families are comfortable discussing different things.","\\b(?:avoid|politics|religion|money|salary|personal|private)\\b"),
    reply('answer-prepare',"I'd ask my partner about the family's routine, check the arrival time, and ask whether I could bring anything.","\\b(?:prepare|preparation|bring|gift|arrive|before|time)\\b"),
    reply('answer-behaviour',"I'd greet everyone, listen with interest, and offer to help. I'd also thank the family before leaving.","\\b(?:behav|polite|manners|help|respect|greet|impression)"),
    reply('answer-name',"I'm David, your conversation coach. I'm here to help you practise for that first meeting.","\\b(?:your name|who are you)\\b")
  ];
  // Specific boundaries take precedence over general conversation vocabulary.
  [interactionResponses[2],interactionResponses[3]]=[interactionResponses[3],interactionResponses[2]];
  const c = window.JaraLinguaConversationCoachConfig = {
    id:'english-intermediate-2-unit-5-david',language:'en',locale:'en-US',
    apiPath:'/api/english-intermediate/pronunciation-assessment',storageKey:'jaralingua:intermediate2:david-first-impression:v1',
    courseLabel:'Intermediate English Course 2',unitLabel:'Unit 5',title:'A Good First Impression',audioRoot:'audio/unit-5-david-coach/',
    attemptQuestionCount:12,maxRecordingSeconds:55,maxReactionResponses:1,maxInteractionResponses:1,
    character:{name:'David Rivera',role:'Your conversation coach · fictional portrait',portrait:'../../assets/img/english-intermediate-2/unit-5/david-coach/david.png'},
    voice:{id:'pv8WYYW60prEkDbDXyC0',name:'David',category:'cloned',modelId:'eleven_multilingual_v2'},
    questions,followUpSets,mandatoryQuestionIds:questions.map(item=>item.id),selectionGroups:[],interactionResponses,
    defaultInteractionResponse:say('answer-clarify',"I'm not sure which topic you mean. Could you ask me about clothes, feelings, preparation, polite behaviour, or conversation?"),
    audio:{
      welcome:say('welcome',"Hi, I'm David. We'll practise for a first meeting with your partner's family this coming weekend. We'll talk about your feelings, your plans, and what you could say.").file,
      instructions:say('instructions',"Listen, record your answer, and hear my response. Open Help me answer if you need an idea. Some answers lead to a follow-up question. At the end, use your own ideas in a voice message to your best friend.").file,
      needDetail:say('need-detail',"I'm not sure I caught the detail this question needs. You can open the help and try again, or continue practising."),
      noSpeech:say('no-speech',"I couldn't hear a clear answer. Please check your microphone and try again."),
      serviceRecovery:say('service-recovery',"The analysis didn't finish, so I can't respond to your words yet. You can retry or continue without feedback for this answer."),
      closing:say('closing',"Thanks for the conversation! For your written task, imagine the visit is still ahead of you. Write to your best friend, connect your own ideas, and keep a warm, friendly tone. See you next time!")
    },
    cookingAnswer:say('reply-cooking',"In this role-play, my favourite dish is vegetable pasta. We choose the vegetables together, and everyone helps prepare the meal."),
    followUpReaction:say('reply-followup',"Thanks for adding that. Let's keep building your plan for the visit."),
    returnToPrompt:say('return-to-prompt',"Now, let's come back to your answer to the question on screen."),
    rubric:[{key:'task',label:'Task',description:'Evidence of the current communicative purpose.'},{key:'interaction',label:'Interaction',description:'Relevant replies and questions.'},{key:'language',label:'Language',description:'Future plans, feelings and connectors.'},{key:'fluency',label:'Flow',description:'Approximate development and pace.'},{key:'clarity',label:'Clarity estimate',description:'Transcription confidence only, not a phonetic diagnosis.'}],
    feedbackRules:[{pattern:"\\bi am agree\\b",explanation:'Say “I agree”, without am.'},{pattern:"\\bwill to\\b",explanation:'Use will + base verb: “I will wear…”'},{pattern:"\\bgoing to (?:wore|went|brought)\\b",explanation:'Use going to + base verb: wear, go, bring.'}],
    ui:{alwaysAllowNext:true,immediatePrompt:true,supportStartsClosed:true,hideRealSupport:true,floatingDock:true,compactFeedback:true,collapseFeedback:true,acknowledgeBeforeFollowUp:true,
      supportLabel:'A frame and one possible answer',interactionRecordHelp:'Ask David ONE question about a good first impression.',
      preflightRecording:'Say a short sentence and play it back.',summaryLeadComplete:'You rehearsed your own ideas for a friendly message BEFORE the visit.',
      languageStrength:'You used language for feelings, plans and connected ideas.',languagePriority:'Keep future plans clear and connect ideas with first, then, also or however.',interactionPriority:'Answer the question and use the other person’s detail in your next question.'},
    strictConfidence:true,audioScripts:scripts
  };
  const norm = text => String(text||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’]/g,"'");
  const matches = (entry,text) => new RegExp(entry.pattern,'i').test(text) && (!entry.exclude || !new RegExp(entry.exclude,'i').test(text));
  c.isStudentQuestion = (text,question,prompt) => !question.interaction && !['david-01','david-07','david-09','david-10'].includes(question.id) && !prompt.id.startsWith('topics-') && /^(?:hey david[, ]*|david[, ]*)?(?:what (?:would|should|do|can) (?:you|i)|how (?:can|do|would|should) (?:you|i)|could you tell|can you tell|who are you|what'?s your name)/i.test(norm(text).trim());
  c.responseResolver = (answer,question,prompt) => {
    const text=norm(answer.transcript);
    if(question.interaction) {
      if(question.id==='david-11' && !answer.analysis.checks.every(item=>item.met))return [c.defaultInteractionResponse];
      return [interactionResponses.find(entry=>matches(entry,text)) || c.defaultInteractionResponse];
    }
    if(question.unscored) return [question.reaction];
    if(prompt.id==='topics-extend' && answer.analysis.checks.every(item=>item.met))return [c.cookingAnswer];
    if(prompt.id!==question.id) return [answer.analysis.checks.every(item=>item.met) ? c.followUpReaction : c.audio.needDetail];
    const matched=(question.reactionResponses||[]).find(entry=>matches(entry,text));
    if(matched) return [matched];
    return [answer.analysis.checks.some(item=>item.met) ? question.reaction || c.audio.needDetail : c.audio.needDetail];
  };
  c.followUpResolver = (answer,question,set) => {
    if(question.id==='david-02' && answer && matches(questions[1].reactionResponses[1],norm(answer.transcript)))return set.calm;
    return answer?.analysis?.checks.every(item=>item.met) && answer.analysis.wordCount>=question.minWords ? set.complete : set.incomplete;
  };
})();
