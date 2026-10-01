/* Original A2 retelling of the traditional folktale. Not copied from a modern edition. */
window.StoneSoup = {
  version: '20260930-1',
  title: 'Stone Soup',
  pages: [
    {title:'A hungry traveller',alt:'A traveller asks an elderly woman at her cottage door for something to eat.',turns:[
      ['Narrator','One cool afternoon, a hungry traveller arrived in a village. He asked for something to eat, but everyone stayed inside.'],
      ['Villager',"We don't have much food."],
      ['Narrator','The traveller smiled.'],
      ['Traveller','Could I borrow a large pot?']
    ]},
    {title:'A surprising soup',alt:'The traveller puts a single stone into a pot of clear water while the woman watches.',turns:[
      ['Narrator','He filled the pot with water and put a clean stone inside.'],
      ['Traveller',"I'm making stone soup."],
      ['Narrator','The woman looked into the pot.'],
      ['Villager',"There aren't any vegetables!"],
      ['Traveller','Not yet. It needs a few carrots.']
    ]},
    {title:'A few ingredients',alt:'The woman brings carrots and a farmer brings potatoes and an onion to prepare together.',turns:[
      ['Narrator','The woman brought two carrots. A farmer arrived with two potatoes and an onion.'],
      ['Traveller','Please cut up the vegetables.'],
      ['Narrator','They washed and cut them, then added them to the pot. Now the square was full of curious neighbours.']
    ]},
    {title:'Just a little salt',alt:'The traveller tastes the soup while a baker offers a little salt and bread.',turns:[
      ['Narrator','The soup smelled delicious, but the traveller tasted it carefully.'],
      ['Traveller','It needs a little salt.'],
      ['Narrator','The baker brought salt and some bread. She asked:'],
      ['Baker','How much salt?'],
      ['Traveller',"Just a little. We don't want the soup to be too salty."]
    ]},
    {title:'A bowl for everyone',alt:'The traveller serves vegetable soup and bread to the villagers at a shared table.',turns:[
      ['Narrator',"Soon, the vegetables were tender. The smell made everyone's mouth water."],
      ['Villager',"I'd like a bowl of soup, please."],
      ['Narrator','With a ladle, the traveller served everyone. There was enough soup for the whole village, and each person had a slice of bread.']
    ]},
    {title:'The real magic',alt:'After the meal, the traveller shows the ordinary stone while the villagers smile and share bread.',turns:[
      ['Narrator','After the meal, the woman asked:'],
      ['Villager','Was the stone really magic?'],
      ['Traveller','No. You brought the ingredients. We made this meal together.'],
      ['Narrator','The villagers laughed and shared the last bread. The next day, they invited him to eat with them again.']
    ]}
  ],
  vocabulary: [
    ['traveller','Someone who goes from one place to another.'],
    ['borrow','Use something and give it back later.'],
    ['pot','A deep container used for cooking.'],
    ['stone','A small, hard piece of rock.'],
    ['ingredients','The foods used to make a dish.'],
    ['neighbours','People who live near each other.'],
    ['ladle','A large, deep spoon for serving soup.'],
    ['tender','Soft and easy to bite or cut.'],
    ['serve','Give people their food or drink.'],
    ['share','Use or enjoy something with other people.']
  ],
  // The first option is the canonical correct choice, shuffled before display.
  questions:[
    {q:'Why did the traveller ask for something to eat?',options:['He was hungry after travelling.','He wanted to sell food in the village.','He was collecting ingredients for another village.'],page:1,why:'He arrived hungry and asked for food. He did not offer food for sale.'},
    {q:'What was in the pot before anyone brought vegetables?',options:['Water and a clean stone.','Water and a little salt.','Water and some bread.'],page:2,why:'The traveller started with water and a stone. Salt and bread arrived later.'},
    {q:'Which contribution came from the farmer?',options:['Two potatoes and an onion.','Two carrots and an onion.','Some bread and a little salt.'],page:3,why:'The woman brought the carrots; the farmer brought two potatoes and an onion.'},
    {q:'What did they do before adding the vegetables to the pot?',options:['They washed and cut them.','They served them with bread.','They tasted them in the soup.'],page:3,why:'The story says they washed and cut the vegetables, then added them to the pot.'},
    {q:'Why did the traveller ask for only a little salt?',options:['He did not want the soup to be too salty.','He wanted to save all the salt for the bread.','He thought the vegetables were already too salty.'],page:4,why:'He explicitly says that they do not want the soup to be too salty.'},
    {q:'Which sentence asks for a serving of the finished food?',options:["I'd like a bowl of soup, please.",'Could I borrow a large pot?','How much salt?'],page:5,why:'A bowl of soup is a serving. The other questions concern equipment and an ingredient.'},
    {q:'The smell “made everyone’s mouth water.” What does this mean?',options:['The smell made them want to eat the soup.','The soup needed more water before they could eat it.','They wanted water instead of soup.'],page:5,why:'This idiom means the food seemed so delicious that people wanted to eat it.'},
    {q:'How did the villagers change during the story?',options:['At first they stayed inside; later they contributed and shared.','At first they shared bread; later they kept their food inside.','At first they cooked together; later they waited for the traveller to bring food.'],page:6,why:'Compare the closed beginning with the shared meal. The neighbours become willing to contribute.'},
    {q:'What made a meal for the whole village possible?',options:['People combined their ingredients and helped each other.','The traveller had enough hidden food in his bag.','The stone produced new vegetables inside the pot.'],page:6,why:'The traveller explains that the villagers brought the ingredients and made the meal together.'},
    {q:'Which sequence matches the story?',options:['Borrow a pot → add vegetables → serve the soup.','Add vegetables → borrow a pot → serve the soup.','Borrow a pot → serve the soup → add vegetables.'],page:6,why:'He asks for a pot first, the neighbours contribute vegetables, and everyone eats after the soup is ready.'}
  ]
};
