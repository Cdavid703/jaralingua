(() => {
  const scripts = {};
  const say = (file, text) => { scripts[file] = text; return {file, text}; };
  const question = (id, topic, text, options) => ({id, topic, text, audio:say(id+'.mp3',text).file, maxSeconds:30, ...options});
  const pattern = (label, value) => ({label, pattern:value});
  const questions = [
    question('nora-01','Hello','Hi, I’m Nora. What’s your name?',{
      frames:['Hi, Nora. My name is ___.','I’m ___. Nice to meet you.'], vocabulary:['my name is','I’m','nice to meet you'], grammar:'Introduce yourself. Your own name is welcome.', checks:[{label:'introduction',kind:'word-count',minMatches:1}],unitTerms:['hi','name','i am',"i'm"],minWords:1,maxSeconds:16,improved:'Hi, Nora. My name is Ana.',reaction:say('reply-name.mp3','Nice to meet you. It’s good to have a little time to chat.')
    }),
    question('nora-02','Today','How are you today?',{
      frames:['I’m well, thanks.','I’m a little ___ today.'],vocabulary:['well','tired','happy','excited','okay','not bad'],grammar:'Use I’m for how you feel now.',checks:[pattern('how you feel',"\\b(?:i am|i'm|well|fine|good|okay|ok|tired|happy|excited|sad|nervous|not bad)\\b")],unitTerms:['fine','well','tired',"i'm"],minWords:2,maxSeconds:18,improved:'I’m fine, thanks.',reaction:say('reply-today.mp3','Thanks for telling me. I’m enjoying a quiet moment with this photo album.'),reactionResponses:[{terms:['tired','not well','sad','sick','not good'],...say('reply-today-low.mp3','Thanks for telling me. We can take our time today.')}]
    }),
    question('nora-03','A memory','I found an old holiday photo this morning. Where were you on a day you remember well?',{
      frames:['I was at ___ last ___.','I was in ___ with ___.'],vocabulary:['at home','at the beach','in a village','last year','on my birthday'],grammar:'I was + place. Choose a real or imagined memory and keep it for the next questions.',checks:[pattern('past be and a place','\\b(?:i was|we were) (?:at|in|near|on|outside|inside|home|there|abroad)\\b')],unitTerms:['was','were','at','in','last'],minWords:3,improved:'I was at the beach last year.',reaction:say('reply-place.mp3','I’m picturing that day now. My photo was from a little village by the sea.')
    }),
    question('nora-04','People','Who was with you that day?',{
      frames:['My ___ was with me.','My ___ and ___ were there. / I was alone.'],vocabulary:['sister','friends','family','partner','alone','by myself'],grammar:'One person was; two or more people were. Alone is also a valid answer.',checks:[pattern('company or being alone','\\b(?:was|were|alone|by myself)\\b')],unitTerms:['was','were','with','alone'],minWords:3,improved:'My sister and my friends were with me.',reaction:say('reply-company.mp3','Thanks, that helps me picture the moment. My sister was with me on my trip.'),reactionResponses:[{terms:['alone','by myself','on my own','nobody','no one'],...say('reply-alone.mp3','A day on your own can be memorable too. My trip was with my sister, but I enjoy quiet time by myself.')}]
    }),
    question('nora-05','The place','What was the place like?',{
      frames:['It was ___, and I was ___.','The streets were ___ because ___.'],vocabulary:['quiet','crowded','sunny','peaceful','happy','nervous'],grammar:'Describe a past state with was/were, not did. You can add a feeling or a reason.',checks:[pattern('past description','\\b(?:was|were|wasn\'t|weren\'t)\\s+\\w+')],unitTerms:['was','were','because','quiet','sunny'],minWords:3,improved:'It was quiet and sunny. I was happy there.',reaction:say('reply-description.mp3','I can imagine it more clearly now. The village in my photo was quiet, with narrow streets.')
    }),
    question('nora-06','Not always perfect','Was everything perfect that day?',{
      frames:['No, it wasn’t. The ___ wasn’t ___.','The ___ weren’t ___, but ___. / Yes, it was.'],vocabulary:['wasn’t','weren’t','ready','open','comfortable','perfect','but'],grammar:'A negative answer uses wasn’t/weren’t. A positive answer is valid too; do not invent a problem.',checks:[pattern('yes or no with past be',"\\b(?:was|were|wasn't|weren't|was not|were not)\\b")],unitTerms:["wasn't","weren't",'was','were','but'],minWords:3,improved:'No, it wasn’t. The shops weren’t open, but the beach was lovely.',reaction:say('reply-not-perfect.mp3','Small problems can become part of the story. On my trip, the buses weren’t on time.'),reactionResponses:[{terms:['yes it was','everything was perfect','it was perfect','no problems'],...say('reply-perfect.mp3','That sounds like a day worth remembering. Mine wasn’t perfect: the buses were late.')}]
    }),
    question('nora-07','What happened','What happened later that day?',{
      frames:['We went back to ___. I had the time of my life.','I got over my fear of ___. It was ___.'],vocabulary:['went back — phrasal verb','got over — phrasal verb','got home — expression','had the time of my life — idiom'],grammar:'Use a completed past action. You can add one taught expression when it fits your memory.',checks:[pattern('past action','\\b(?:went|got|visited|played|walked|ate|met|saw|had|stayed|watched|cooked|talked|returned|rested|left|took|bought|arrived|slept|studied|read|sat|swam|danced|listened|drank)\\b')],unitTerms:['went back','got over','got home','time of my life','went','had'],minWords:4,maxSeconds:35,improved:'We went back to the beach. I had the time of my life.',reaction:say('reply-action.mp3','Thanks for sharing that part of your day. We went back to the sea before we got home.'),reactionResponses:[{terms:['got over'],...say('reply-fear.mp3','Getting over a fear can make a day especially memorable. I’m glad you shared that.') }]
    }),
    question('nora-08','Your turn','Now ask me one question about my trip.',{
      interaction:true,expectedQuestionCount:1,frames:['Where were you on your trip?','Was it sunny there? / Who was with you?'],vocabulary:['where','who','was','were','weather','trip'],grammar:'Ask ONE question with was or were. Nora will answer the topic she recognizes.',checks:[{label:'one question',kind:'question-starters',minMatches:1}],unitTerms:['was','were','where','who','trip'],minWords:3,maxSeconds:25,improved:'Was it sunny on your trip?'
    })
  ];
  const c = window.JaraLinguaConversationCoachConfig = {
    id:'english-basic-2-unit-5-nora-memories',language:'en',locale:'en-US',apiPath:'/api/english-basic/pronunciation-assessment',storageKey:'jaralingua:basic2:nora-memories:v1',courseLabel:'Basic English Course 2',unitLabel:'Unit 5',title:'A Memory with Nora',audioRoot:'audio/unit5/nora-coach/',attemptQuestionCount:8,maxRecordingSeconds:35,maxReactionResponses:1,maxInteractionResponses:1,
    character:{name:'Nora Bennett',role:'Your conversation partner',portrait:'../../assets/img/english-basic-2/unit-5-nora-coach.png',hero:'../../assets/img/english-basic-2/unit-5-nora-coach.png'},
    audio:{welcome:say('welcome.mp3','Hi, I’m Nora Bennett. Let’s get to know each other and talk about a day you remember.').file,instructions:say('instructions.mp3','Listen to one question, record a short answer, then listen to my reply. Open the help if you need an idea. You can record again as often as you like.').file,needDetail:say('need-detail.mp3','I caught part of that. Try the short answer frame, and add your own detail.'),noSpeech:say('no-speech.mp3','I couldn’t hear a clear answer. Check the microphone and try again.'),serviceRecovery:say('service-recovery.mp3','The analysis didn’t finish. Your recording is still here, so you can retry.'),closing:say('closing.mp3','Thanks for the chat. It was lovely sharing memories with you. Have a look at your feedback, and come back whenever you want to practice.')},
    selectionGroups:questions.map(q=>({id:q.id,count:1,questionIds:[q.id]})),mandatoryQuestionIds:[],questions,
    rubric:[{key:'task',label:'Meaning',description:'Answers the current question.'},{key:'interaction',label:'Interaction',description:'Follows the exchange and asks one question.'},{key:'language',label:'Unit language',description:'Uses past be and familiar past actions.'},{key:'fluency',label:'Flow',description:'Gives clear, short connected answers.'},{key:'clarity',label:'Clarity estimate',description:'Approximate transcription confidence, not a phonetic diagnosis.'}],
    usefulLanguage:['I was…','We were…','It wasn’t…','They weren’t…','We went back…','I had the time of my life.'],
    ui:{supportStartsClosed:true,floatingDock:false,compactFeedback:true,interactionRecordHelp:'Ask Nora ONE question about her trip.',preflightRecording:'Say a short sentence to test your microphone.',taskStrength:'You answered the question with relevant details.',interactionStrength:'You kept the conversation moving.',languageStrength:'You used useful past forms.',interactionPriority:'Answer the current question, or ask one clear question in the final turn.',languagePriority:'Check was/were and add a past action where it fits.',summaryLeadComplete:'You shared a memory and asked Nora about hers.'},
    feedbackRules:[
      {pattern:'\\b(?:i|he|she|it) were(?:n\'t)?\\b',explanation:'For this past memory, use I/he/she/it was or wasn’t, not were or weren’t.'},
      {pattern:'\\b(?:we|they|you) was(?:n\'t)?\\b',explanation:'Use we/they/you were or weren’t: “We were there,” not “We was there.”'},
      {pattern:'\\bdid (?:you|he|she|they|we|it) (?:was|were)\\b',explanation:'Past be makes its own question: “Were you there?” Do not add did.'},
      {pattern:'\\b(?:goed|getted)\\b',explanation:'Use went for go and got for get: “We went back” and “We got home.”'},
      {pattern:'\\b(?:was|were) (?:went|got|visited)\\b',explanation:'For a completed action, say “I went” or “We visited.” Do not put was/were before that past action.'}
    ],
    interactionResponses:[
      {terms:['weather','sunny','rainy','cold','hot'],...say('answer-weather.mp3','It was sunny and warm. We were lucky with the weather.')},
      {terms:['who','alone','with you'],...say('answer-company.mp3','My sister was with me. We were both excited about the trip.')},
      {terms:['where'],...say('answer-where.mp3','I was in a small village by the sea. We went back to the beach every afternoon.')},
      {terms:['when','long','many days'],...say('answer-when.mp3','It was last summer. We were there for three days.')},
      {terms:['happy','nervous','feel','fun','enjoy','like','good','perfect'],...say('answer-feeling.mp3','I was happy, although the buses were late. I still had the time of my life.')},
      {terms:['did','happened'],...say('answer-action.mp3','We walked by the sea, ate fresh fish, and went back to the beach. It was a lovely trip.')}
    ],
    defaultInteractionResponse:say('answer-clarify.mp3','I’m not sure which part you mean. Try asking where I was, who was with me, or what the weather was like.')
  };
  c.audioScripts=scripts;
})();
