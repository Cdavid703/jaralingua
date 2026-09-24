/* A2 adaptations of Intermediate 1 food practice. Originals remain unchanged. */
(() => {
  const images='/assets/img/english-intermediate/unit-5/';
  const foodImage=name=>images+'market-basket-foods/'+name+'.webp';
  const q=(prompt,answer,wrong1,wrong2,explanation,image)=>({prompt,answer,options:[answer,wrong1,wrong2],explanation,image:image?foodImage(image):null});
  const activities={
    countable:{title:'Countable or Uncountable?',file:'practice-unit-6-countable-uncountable-food.html',type:'Grammar',hero:images+'market-basket-challenge.png',description:'Choose the right food form in a clear everyday context.',objective:'Recognize countable items and uncountable food amounts, and use them in a sentence.',review:'countable-food',questions:[
      q('For a salad, I need two ___.','tomatoes','tomato','some tomatoes','Two counts individual items, so use the plural tomatoes. “Some” cannot follow “two” here.','tomatoes'),
      q('We are talking about rice as food, not individual grains. Which description is correct?','Uncountable: some rice','Countable: a rice','Countable: three rices','Rice is uncountable as food in this context. To give a number, name a unit: three cups of rice.','rice'),
      q('There is ___ on the plate. We mean bread as food.','some bread','a bread','three breads','Use some bread for an amount of this food. To count portions, say a slice or three slices of bread.','bread'),
      q('I need one whole ___ for breakfast.','egg','eggs','some egg','One refers to a single item, so use the singular egg. “Some egg” describes an amount, not one whole item.','eggs'),
      q('Which sentence counts whole fruit correctly?','There are three apples.','There is three apples.','There are three apple.','Three requires the plural apples, and a plural subject takes are.','apples'),
      q('The chef adds ___ to the pan. It is a small amount of oil.','a little oil','a few oil','an oil','Oil as an ingredient is uncountable. A little describes a small amount; a few needs plural countable items.','oil'),
      q('Choose a phrase for two whole avocados.','two avocados','two avocado','two some avocados','A number directly before countable fruit takes the plural: two avocados.','avocados'),
      q('The word cheese describes food here. Which phrase is correct?','some cheese','a cheese','three cheese','Some cheese names an amount. A countable portion would be a piece of cheese.','cheese'),
      q('We are eating chicken meat, not counting animals. We have ___.','some chicken','a chicken meat','three chicken','Chicken as meat is uncountable. “A chicken” can mean one animal or a whole chicken, but that is not the intended meaning here.','chicken'),
      q('Which sentence correctly counts separate carrots?','There are four carrots.','There is four carrots.','There are four carrot.','Individual carrots are countable. Four takes the plural carrots and the verb are.','carrots'),
      q('The noun is water, not its container. Choose the matching description.','Uncountable: some water','Countable: a water','Countable: many water','Water as a substance is uncountable. In a restaurant, “a water” can mean a serving, but this question explicitly asks about the substance.','water'),
      q('At a café, the server says “Two coffees?” What does this mean?','Two servings of coffee','Two kinds of coffee are always required','The word coffee can never be counted','In a café order, a coffee can mean one serving. Context changes the meaning; coffee in general is uncountable.'),
      q('A farmer has one ___ in the yard. We mean a living animal.','chicken','some chicken','chickens','A chicken is one animal. Some chicken usually describes an amount of meat in a food context.'),
      q('Rice is solid. Does that make the food noun countable?','No. Rice is uncountable as food.','Yes. All solid food nouns are countable.','No. Only liquids can be uncountable.','Countability is about how English uses a noun, not whether an ingredient is solid or liquid. Bread and rice are solid but uncountable as food.','rice'),
      q('Which phrase counts the container rather than the food?','two cups of rice','two rices','two cup of rice','Cups is a countable unit and becomes plural after two. Rice remains unchanged.','rice')
    ]},
    quantities:{title:'Food Quantities',file:'practice-unit-6-food-quantities.html',type:'Grammar',hero:images+'practice-quantifiers-gap-fill.png',description:'Choose quantities for recipes, offers, and everyday meals.',objective:'Use some, any, much, many, a few, a little, and a lot of with food nouns.',review:'food-quantities',questions:[
      q('We need ___ rice for lunch.','some','many','a few','Rice is uncountable here. Some introduces an unspecified amount; many and a few require plural countable nouns.','rice'),
      q('Do we have ___ tomatoes for the salad?','any','much','a little','Any is natural when checking availability. Much and a little do not fit plural tomatoes.','tomatoes'),
      q('There is not ___ oil left in this bottle.','much','many','a few','Oil is uncountable. Much is natural in a negative sentence about an amount.','oil'),
      q('Please buy ___ carrots — just three or four.','a few','a little','much','Carrots are countable and the context specifies a small positive number.','carrots'),
      q('How ___ apples are in the basket?','many','much','some','How many asks for a number of plural countable items. How much asks for an uncountable amount.','apples'),
      q('Add ___ butter, not a large amount.','a little','a few','many','Butter is uncountable as an ingredient. A little is a small positive amount.'),
      q('We do not have ___ bread at all.','any','many','a few','Any works in this negative sentence meaning none. Bread as food is uncountable.','bread'),
      q('How ___ water do we need for the soup?','much','many','a few','Water is uncountable in this question, so use how much.','water'),
      q('There are ___ avocados on the table.','some','a little','much','Some works with plural countable nouns. A little and much describe uncountable amounts.','avocados'),
      q('Would you like ___ soup?','some','many','a few','Some is natural in an offer, even though the sentence is a question. Soup is an uncountable amount here.'),
      q('The salad needs ___ cheese.','a little','a few','many','Cheese as an ingredient is uncountable. A little describes an amount.','cheese'),
      q('Can I have ___ water, please?','some','many','a few','Some is natural in this polite request. It is not limited to affirmative statements.','water'),
      q('We cooked ___ rice for the large family meal.','a lot of','many','a few','A lot of works with uncountable rice and with countable plural nouns. Many and a few do not fit rice.','rice'),
      q('How ___ cups of rice do we need?','many','much','a little','The question counts cups, not rice directly. Cups is plural and countable, so use how many.','rice'),
      q('There are ___ eggs in the box: only two.','a few','a little','much','A few fits a small number of countable eggs. A little and much describe amounts of uncountable nouns.','eggs')
    ]},
    portions:{title:'Containers and Portions',file:'practice-unit-6-containers-portions.html',type:'Grammar · Vocabulary',hero:images+'food-fair-quantity-mission-v3.webp',description:'Build natural phrases for food portions and containers.',objective:'Put numbers, plural portion words, of, and food nouns in the right order.',review:'food-portions',questions:[
      q('Put two ___ of bread on the plate.','slices','slice','slices of','The number two makes slice plural. The prompt already includes of, so do not add a second of.','bread'),
      q('The recipe needs three cups ___ rice.','of','with','for','Use the quantity pattern: number + measure + of + food.','rice'),
      q('Choose the correct phrase for one portion of cheese.','a piece of cheese','a pieces of cheese','a piece cheese','Use a + singular portion word + of + food.','cheese'),
      q('We need two ___ of water.','glasses','glass','glasses of','Two requires the plural glasses. The sentence already supplies of.','water'),
      q('The server brings one ___ of soup.','bowl','bowls','bowl of','One takes singular bowl. Do not repeat of.'),
      q('Which phrase counts bread portions correctly?','three slices of bread','three slice of breads','three slices bread','Slices is plural; of connects the portion to bread, which stays unchanged.','bread'),
      q('Choose a complete phrase for two containers of juice.','two bottles of juice','two bottle of juice','two bottles juice','Bottles is the countable unit, so it becomes plural and is followed by of.'),
      q('There are four ___ of rice on the table.','cups','cup','cups of','Four counts cups. Rice remains uncountable. The prompt already includes of.','rice'),
      q('How many ___ of cheese do we need?','pieces','piece','pieces of','How many needs a plural countable noun. Do not repeat of.','cheese'),
      q('Choose a complete phrase for a single serving of water.','a glass of water','a glasses of water','a glass water','A takes singular glass, then of connects the container and its contents.','water'),
      q('We ordered two bowls of soup. Which word carries the plural ending?','bowls','soup','both bowls and soup','The bowls are counted; soup names their contents. Pluralize the container, not the food amount.'),
      q('One cup of rice becomes ___.','two cups of rice','two cup of rices','two cups rice','Only the countable unit cup becomes plural. Keep of and leave rice unchanged.','rice')
    ]},
    memory:{title:'Food Vocabulary Memory',file:'practice-unit-6-food-vocabulary-memory.html',type:'Vocabulary · Two teams',hero:images+'food-vocabulary-memory-game-professional-v1.webp',description:'Find food pairs, listen, and say each word aloud.',objective:'Recognize and pronounce Unit 6 foods through a two-team memory game.',review:'food-words',foods:[
      ['apple','apples','apple'],['carrot','carrots','carrot'],['avocado','avocados','avocado'],['egg','eggs','egg'],['rice','rice','rice'],['cheese','cheese','cheese'],['bread','bread','bread'],['chicken','chicken','chicken'],
      ['cucumber','/quantity-mission-foods-v2/cucumber-slices.webp','cucumber'],['soup','/quantity-mission-foods-v2/vegetable-soup.webp','soup'],['flour','/quantity-mission-foods-v2/flour.webp','flour'],['mushroom','/quantity-mission-foods-v2/mushrooms.webp','mushroom']
    ].map(([word,picture,audio])=>({word,image:picture.startsWith('/')?images+picture.slice(1):foodImage(picture),audio:['cucumber','soup','flour','mushroom'].includes(audio)?'/ingles/intermediate/audio/unit-5-food-memory/'+audio+'-word.mp3':'/ingles/basico-2/audio/unit6/fabulous-food/'+audio+'.mp3'}))}
  };
  activities.memory.foods.find(f=>f.word==='chicken').audio='/ingles/basico-2/audio/unit6/restaurant-coach/chicken.mp3';
  window.Basic2FoodPractice=activities;
})();
