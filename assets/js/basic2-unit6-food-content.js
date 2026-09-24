/* Canonical teaching content and individual audio inventory: Basic 2, Unit 6. */
(() => {
  'use strict';
  const base = '/ingles/basico-2/audio/unit6/fabulous-food/';
  const img = '/assets/img/english-basic-2/unit-6-fabulous-food/';
  const audios = {};
  const escape = s => String(s).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const reusedWords = new Set(['butter','cereal','cucumber','flour','grapes','mushroom','onion','pepper','pineapple','potato','soup','watermelon']);
  function say(text, key, reuse) {
    const id = key || slug(text);
    const path = reuse || (reusedWords.has(text) ? `/ingles/intermediate/audio/unit-5-food-memory/${text}-word.mp3` : base + id + '.mp3');
    audios[id] = {text, path, reused: !path.startsWith(base)};
    return `<button type="button" class="food-say" data-food-audio="${escape(path)}" aria-label="Listen: ${escape(text)}">${escape(text)} <span aria-hidden="true">♪</span></button>`;
  }
  const box = (title, body) => `<article class="food-card"><h3>${title}</h3>${body}</article>`;
  const grid = (...items) => `<div class="food-grid">${items.join('')}</div>`;
  const note = text => `<p class="food-note">${text}</p>`;
  const flow = (...steps) => `<div class="food-flow">${steps.map((s,i) => `${i ? '<span aria-hidden="true">→</span>' : ''}<div>${s}</div>`).join('')}</div>`;
  const visual = (file, alt, caption) => { const src=file.startsWith('/')?file:img+file; return `<figure class="food-visual"><button type="button" data-food-zoom="${src}" aria-label="Enlarge: ${escape(alt)}"><img loading="lazy" src="${src}" alt="${escape(alt)}"></button><figcaption>${caption} · Tap to enlarge.</figcaption></figure>`; };
  const more = (title, text) => `<details class="food-more"><summary>${title}</summary><div>${text}</div></details>`;
  const controls = () => '<div class="food-audio-controls"><strong>Speed</strong><button type="button" data-food-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-food-speed="1" aria-pressed="true">1×</button><button type="button" data-food-stop>Stop audio</button><span data-food-status role="status">Tap a word or sentence to listen.</span></div>';
  const sections = [];
  const section = (id,title,goal,body) => sections.push({id,title,goal,body});
  const vocabulary = [
    ['Vegetables','cucumber','onion','potato','pepper','mushroom','carrot'],
    ['Fruit','pineapple','grapes','watermelon','apple','pear','avocado'],
    ['Ingredients','flour','butter','rice','cheese','bread','egg'],
    ['Meals and dishes','cereal','soup','salad','grilled chicken','noodles','dessert']
  ];
  section('food-words','Food in everyday life','Name everyday foods and distinguish food, a meal, and a dish.',
    grid(...vocabulary.map(([title,...words]) => box(title, `<div class="food-word-list">${words.map(w=>say(w)).join('')}</div>`))) +
    grid(box('Food', '<p>The general word for what we eat: <b>There is some food on the table.</b> Usually uncountable in this meaning.</p>'), box('A meal', '<p>An eating occasion: <b>breakfast, lunch, dinner</b>. Lunch is a meal; rice can be part of that meal.</p>'), box('A dish', '<p>A particular prepared food: <b>vegetable soup, chicken curry</b>. Here, “dish” means the food, not the plate.</p>')) + controls());
  section('eating-habits','Eating habits and preferences','Describe routines and preferences without confusing choice with allergy.',
    grid(box('Routine', say('I usually have breakfast at seven.')+'<p><b>Usually / sometimes / never</b> tells us how often. This is a habit, not only today.</p>'), box('Preference',say('I prefer rice to pasta.')+'<p><b>prefer A to B</b> compares preferences. It does not mean that B is bad.</p>'), box('A dietary choice',say('I do not eat meat.')+'<p>A vegetarian does not eat meat. Do not assume that this means the person dislikes its taste.</p>'))+
    grid(box('Camila', '<p>She has cereal for breakfast and sometimes eats out on Saturdays. These are <b>habits</b>.</p>'),box('Leo','<p>He is vegetarian and chooses vegetable dishes. This is a <b>dietary choice</b>.</p>'),box('Eva','<p>She has a peanut allergy and asks the staff to check ingredients. This is an <b>allergy</b>, not just a preference.</p>')));
  section('countable-food','Countable and uncountable food','Decide whether we count separate items or describe a food amount.',
    visual('portions.png','Two apples, rice in a bowl and measuring cup, and bread with two slices','Items → amounts → portions')+
    grid(box('Countable: separate items',flow('an apple','two apples')+'<p>Singular: <b>a / an + noun</b>. Plural: a number + plural noun.</p><p>an egg → two eggs · a tomato → three tomatoes</p>'),box('Uncountable: food as an amount',flow('rice / milk / bread','some rice / some milk / some bread')+'<p>In these meanings, do not add <b>a</b> or a plural <b>-s</b>: some bread, not “a bread” or “two breads”.</p>'))+
    note('It is about the meaning of the noun, not whether the food is solid or liquid. Bread is solid but normally uncountable as food.')+
    more('When the meaning changes',grid(box('chicken', '<p><b>a chicken</b> = one animal; <b>some chicken</b> = meat as food.</p>'),box('coffee','<p><b>coffee</b> = the drink; <b>a coffee</b> = one serving in a café. “Two coffees” is natural when ordering two servings.</p>'))));
  section('food-portions','Portions and containers','Count portions when the food itself is uncountable.',
    flow('bread',say('a slice of bread','a-slice-of-bread','/ingles/intermediate/audio/unit-5-market-basket/a-slice-of-bread.mp3'),'two <b>slices</b> of bread')+
    grid(box('A portion',say('a bowl of soup')+say('a piece of cheese')+'<p>two <b>bowls</b> of soup · three <b>pieces</b> of cheese</p>'),box('A container',say('a glass of water')+say('a bottle of juice')+'<p>two <b>glasses</b> of water · two <b>bottles</b> of juice</p>'),box('A measure',say('a cup of rice','a-cup-of-rice','/ingles/intermediate/audio/unit-5-market-basket/a-cup-of-rice.mp3')+'<p>three <b>cups</b> of rice</p><p><b>cup</b> is countable. <b>Rice</b> stays uncountable.</p>'))+
    note('<b>Build it:</b> number + portion/container + of + food. The plural goes on the portion: two <b>slices</b> of bread, not two slice of breads.'));
  section('food-quantities','Talking about quantities','Choose quantity words according to the noun and the situation.',
    grid(box('some: an unspecified amount','<p>We have <b>some rice</b>. There are <b>some tomatoes</b>.</p><p>Also natural in offers and requests:</p>'+say('Would you like some soup?')+say('Can I have some water, please?')),box('any: questions and negatives','<p>Do we have <b>any eggs</b>? We do not have <b>any milk</b>.</p><p>Use it to ask whether something is available or say there is none. “Some” is not forbidden in questions: offers and requests often use it.</p>'))+
    grid(box('How many + plural items',say('How many tomatoes do we need?')+'<p>Three tomatoes. Count the items.</p>'),box('How much + uncountable food',say('How much rice do we need?')+'<p>Two cups. Measure the amount.</p>'),box('Quantity is not price','<p><b>How much rice do you want?</b> asks for an amount.</p><p><b>How much is the rice?</b> asks for a price.</p>'))+
    grid(box('a few','<p>A small positive number of <b>plural countable</b> items: a few apples.</p>'),box('a little','<p>A small positive amount of <b>uncountable</b> food: a little oil.</p>'),box('a lot of','<p>Works with both: a lot of apples / a lot of rice. Natural in affirmative conversation.</p>'))+
    more('Too much, too many, and enough',grid(box('More than needed','<p>There is <b>too much salt</b> in the soup.</p><p>There are <b>too many plates</b> on this small table.</p>'),box('Sufficient for a purpose','<p>We have <b>enough rice for four people</b>.</p><p>We do not have <b>enough eggs for the cake</b>.</p>'))));
  const adjectiveGroups = [
    ['Taste', [['sweet','like sugar'],['salty','with a noticeable salt taste'],['sour','like lemon'],['bitter','like unsweetened cocoa'],['spicy','with a hot chili taste']]],
    ['Texture', [['crunchy','firm and noisy when you bite: a carrot'],['crispy','a thin, crisp surface: a potato chip'],['creamy','smooth and rich: a creamy soup'],['tender','easy to bite or cut: tender meat'],['chewy','needs repeated chewing: a chewy candy']]],
    ['Temperature and preparation', [['hot','high temperature; sometimes also spicy'],['warm','moderately hot'],['cold','low temperature'],['grilled','cooked on a grill'],['fried','cooked in hot oil'],['baked','cooked in an oven'],['steamed','cooked with steam']]],
    ['Opinion', [['tasty','pleasant flavor'],['bland','little flavor'],['greasy','unpleasantly oily'],['fresh','recently prepared or not stale, depending on the food']]]
  ];
  section('describing-food','Describing food','Describe taste, texture, temperature, and preparation precisely.',
    grid(...adjectiveGroups.map(([title,words])=>box(title,words.map(([w,d])=>`<p>${say(w)} <span>${d}</span></p>`).join(''))))+
    flow('adjective + noun: <b>creamy soup</b>','food + is: <b>The soup is creamy.</b>','food + tastes: <b>The soup tastes salty.</b>')+
    note('<b>Hot or spicy?</b> Soup can be hot in temperature but not spicy. Ask “Do you mean hot in temperature or spicy?” <b>Seasoned</b> means herbs, salt, or spices were added; it does not necessarily mean chili-hot. Crispy and crunchy can overlap; the examples describe typical textures, not absolute rules.'));
  section('ingredients-preparation','Ingredients and simple preparation','Explain what is in a dish and the order of a simple preparation.',
    grid(visual('/assets/img/english-intermediate/unit-5/market-basket-foods/carrots.webp','Whole carrots','An ingredient: carrots'),visual('/assets/img/english-intermediate/unit-5/quantity-mission-foods-v2/vegetable-soup.webp','A pot of vegetable soup','A prepared dish: vegetable soup'))+
    grid(box('What is in it?',say('This soup contains potatoes and carrots.')+'<p><b>contains + ingredients</b>. The ingredients are the foods used to prepare a dish.</p>'),box('What do we do?',`<div class="food-word-list">${['wash','peel','cut','mix','add','cook','serve'].map(w=>say(w)).join('')}</div>`+'<p>Preparation verbs describe actions. Recipe instructions usually start directly with the verb: <b>Wash the tomatoes.</b></p>'))+
    flow('<b>First</b><br>Wash a cucumber and two tomatoes.','<b>Then</b><br>Cut up the vegetables.','<b>After that</b><br>Add a little oil and mix.','<b>Finally</b><br>Serve the salad.')+note('This is a worked explanation, not a cooking assignment. Ingredients say <b>what is in the dish</b>; preparation says <b>what to do with them</b>.'));
  section('offering-food','Offering food and drinks','Make an offer and accept or decline politely.',
    grid(box('A general preference',say('Do you like coffee?')+'<p>Meaning: Is coffee something you enjoy in general?</p><p>Yes, I do. / No, I do not.</p>'),box('An offer now',say('Would you like some coffee?')+'<p>Meaning: Can I offer you coffee now?</p>'+say('Yes, please.')+say('No, thank you. I would prefer water.')))+
    flow('Would you like','some + food/drink','?')+note('You can like coffee in general but decline a cup now. An offer and a preference question do different jobs.'));
  const dialogue = [
    ['Customer','A table for two, please.'],['Server','Of course. Here is the menu.'],
    ['Customer','What does the vegetable soup contain?'],['Server','It contains potatoes, carrots, and onions.'],
    ['Customer','I would like the grilled chicken, please. Can I have it without onions?'],['Server','Let me check with the kitchen. Would you like rice or a salad?'],
    ['Customer','A salad, please, and a glass of water.'],['Server','Certainly.'],
    ['Customer','Could we have the check, please?'],['Server','Of course. Here is your check.']
  ];
  section('at-the-restaurant','At the restaurant','Follow a natural restaurant exchange, from arrival to payment.',
    visual('hero.png','A server speaking with two diners at a restaurant table','The customer asks; the server confirms and checks')+
    flow('Arrive','Read the menu','Ask and order','Make a request','Pay')+
    '<div class="food-dialogue">'+dialogue.map(([role,line],i)=>`<article class="food-line ${role.toLowerCase()}"><b>${role}</b>${say(line,`restaurant-${i+1}`)}</article>`).join('')+'</div>'+
    grid(box('I would like / I’d like','<p><b>I’d like + noun:</b> I’d like a salad.</p><p><b>I’d like to + verb:</b> I’d like to order.</p><p>“I want” can sound too direct when ordering. “I’d like… please” is a useful polite choice.</p>'),box('Check or bill?','<p><b>the check</b> is common in American English; <b>the bill</b> is common in British English. Both are understood.</p><p>“Can I have…?” is a normal polite request when said with a friendly tone and “please”.</p>')));
  section('dietary-needs','Dietary needs and clear requests','Ask about ingredients and make dietary needs explicit.',
    grid(box('Preference',say('Can I have it without onions, please?')+'<p>This states a preference. It does not communicate an allergy.</p>'),box('Allergy',say('I am allergic to peanuts. Could you check with the kitchen?')+'<p>State the allergy clearly, then ask staff to check ingredients and possible cross-contact.</p>'),box('Dietary choice',say('Do you have a vegetarian option?')+'<p>Ask about ingredients if you are unsure. Do not assume that a vegetable dish contains no meat-based stock.</p>'))+
    note('Simply removing an ingredient does not guarantee that food is safe for someone with an allergy. The language goal is to communicate the need clearly and request a kitchen check, not to make safety promises.')+
    box('Helpful staff responses',say('Let me check with the kitchen.')+say('This dish contains milk.')+say('We have a vegetable soup.')));
  section('restaurant-opinions','Restaurants and comparisons','Give a specific opinion and support a comparison with information.',
    visual('restaurants.png','A quiet small restaurant on the left and a crowded restaurant on the right','Two fictional restaurants; use the facts below, not guesses from appearances')+
    grid(box('Garden Table · left','<p>Atmosphere: quiet and cozy.<br>Lunch: <b>25,000 Colombian pesos</b>.<br>Typical wait: <b>25 minutes</b>.</p>'),box('City Kitchen · right','<p>Atmosphere: lively and crowded.<br>Lunch: <b>35,000 Colombian pesos</b>.<br>Typical wait: <b>10 minutes</b>.</p>'))+
    say('Garden Table is quieter and cheaper than City Kitchen, but its service is slower.')+
    grid(box('Food','<p>tasty · bland · greasy</p><p>The soup is tasty because it has plenty of flavor.</p>'),box('Service','<p>friendly · helpful · slow</p><p>The server is helpful: she checks our questions with the kitchen.</p>'),box('Atmosphere and value','<p>cozy · noisy · crowded · affordable · good value</p><p>“Good value” compares what you receive with what you pay; it does not only mean cheap.</p>'))+
    note('A crowded restaurant is not automatically better or worse. Explain your own preference and the evidence. Comparative forms are a connection to Unit 3, not a new tense lesson.'));
  section('restaurant-review','A short restaurant review','See how a review connects the visit, food, service, and recommendation.',
    grid(box('1 · Visit and setting','<p>Yesterday, we visited Garden Table. It was quiet and cozy.</p>'),box('2 · Food and detail','<p>I ordered grilled chicken with a salad. The chicken was tender, and the vegetables were crunchy.</p>'),box('3 · Service and balance','<p>The server was friendly, but our food took twenty-five minutes.</p>'),box('4 · Recommendation','<p>The meal was good value. I recommend this restaurant for a relaxed lunch, but not for a quick break.</p>'))+
    note('<b>Why this works:</b> it gives concrete details, includes a limitation, and says who might enjoy the place. <b>Was / were / ordered</b> refer to this past visit; <b>I recommend</b> gives the writer’s opinion now. No new tense is needed.'));
  const expressions = [
    ['Phrasal verb','eat out','comer fuera / en un restaurante','Eat a meal away from home, especially at a restaurant.','Everyday, neutral','We sometimes eat out on Fridays.'],
    ['Phrasal verb','heat up','calentar','Make food warmer. With a pronoun, say “heat it up”, not “heat up it”.','Everyday, neutral','Heat up the soup before lunch.'],
    ['Phrasal verb','cut up','cortar en trozos','Cut something into smaller pieces. “Cut them up” is the pronoun pattern.','Everyday, neutral','Cut up the vegetables for the salad.'],
    ['Phrasal verb','run out of','quedarse sin','Have no more of something left. Past form: ran out of.','Everyday, neutral','We ran out of milk this morning.'],
    ['Phrasal verb','cut down on','reducir el consumo de','Consume or do less of something. Keep “on” before the thing reduced.','Everyday, neutral','I am cutting down on sugary drinks.'],
    ['Idiom','have a sweet tooth','gustarle mucho lo dulce','Enjoy sweet food. Keep the article: “a sweet tooth”.','Everyday, conversational','I have a sweet tooth, so I love desserts.'],
    ['Idiom',"make someone's mouth water",'hacer que se le haga agua la boca','Make someone want to eat something because it looks, smells, or sounds delicious.','Everyday, conversational','The smell of fresh bread makes my mouth water.'],
    ['Idiom',"not someone's cup of tea",'no ser lo suyo / no gustarle mucho','Not be someone’s preference. It can describe food, activities, or other things; not literal tea.','Informal, common','Very spicy food is not my cup of tea.'],
    ['Idiom','a piece of cake','pan comido / muy fácil','Describe an easy task, not a literal slice of dessert.','Informal, common','Making this simple salad is a piece of cake.'],
    ['Idiom','the icing on the cake','la guinda del pastel / un beneficio extra','An extra good thing that makes an already pleasant situation better.','Conversational','The meal was wonderful, and the free dessert was the icing on the cake.']
  ];
  function expressionHTML() {
    return ['Phrasal verb','Idiom'].map(type=>more(type === 'Idiom' ? 'Idioms · figurative meanings' : 'Phrasal verbs · verbs with particles',grid(...expressions.filter(e=>e[0]===type).map(([kind,phrase,spanish,meaning,register,example])=>box(`${kind}: ${say(phrase)}`,`<p class="food-spanish">${spanish}</p><p>${meaning}</p><p><b>Use:</b> ${register}.</p><p><b>In context:</b> ${say(example)}</p>`))))).join('');
  }
  const expressionsHTML = expressionHTML();
  section('food-expressions','Phrasal verbs and idioms','Distinguish literal multiword verbs from figurative expressions and hear them in context.',
    note('<b>Phrasal verbs</b> combine a verb with one or more particles. <b>Idioms</b> have a conventional meaning that cannot be understood only from their individual words. The Spanish line is an approximation, not a word-for-word translation.')+controls()+expressionsHTML);
  section('food-pronunciation','Pronunciation and unit summary','Hear useful food words and polite phrases clearly, then connect the unit’s ideas.',
    grid(box('Listen to the whole word',say('vegetables')+say('recipe')+say('lettuce')+say('juice')+'<p><b>RE-ci-pe</b> has three syllables, with stress at the beginning. <b>LE-ttuce</b> has two. These capitals show stress, not phonetic spelling.</p>'),box('Do not confuse these',say('soup')+say('soap')+'<p><b>Soup</b> has the vowel in “blue”; <b>soap</b> has the vowel in “go”. Soap is for washing, not eating.</p>'+say('dessert')+say('desert','desert-place')+'<p><b>de-SSERT</b> = sweet food after a meal. <b>DE-sert</b> = a dry region. Here “desert” is the place noun, not the verb.</p>'),box('Polite speech',say("I'd like a salad, please.")+say('Could we have some water, please?')+'<p><b>I’d</b> is the contraction of <b>I would</b> here. Listen to the whole phrase and its friendly rhythm, not only separate words.</p>'))+
    controls()+flow('Name the food','Describe it','Give an amount','Offer or order','Give an opinion')+
    box('By the end of the unit…','<ul><li>I can name foods and describe eating habits.</li><li>I can count items and measure portions.</li><li>I can offer food and order politely.</li><li>I can explain dietary needs clearly.</li><li>I can support a restaurant opinion with details.</li></ul>'));
  window.Basic2FoodLesson = {sections, audios, expressions, expressionsHTML, controls};
})();
