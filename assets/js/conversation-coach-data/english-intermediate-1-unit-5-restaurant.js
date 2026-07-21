window.JaraLinguaRestaurantCoachConfig = {
  id: "english-intermediate-1-unit-5-restaurant",
  apiPath: "/api/english-intermediate/pronunciation-assessment",
  storageKey: "jaralingua:english-intermediate-1:conversation-coach:unit-5-restaurant:v1",
  language: "en",
  locale: "en-US",
  courseLabel: "Intermediate English Course 1",
  unitLabel: "Unit 5",
  title: "Dinner at Cedar & Stone",
  audioRoot: "audio/conversation-coach/unit-5-restaurant/",
  imageRoot: "../../assets/img/english-intermediate/unit-5/restaurant-coach/",
  maxRecordingSeconds: 35,
  character: {
    name: "Ethan Cole",
    role: "Cedar & Stone waiter",
    portrait: "../../assets/img/english-intermediate/unit-5/restaurant-coach/ethan-cole-portrait-v1.webp",
    hero: "../../assets/img/english-intermediate/unit-5/restaurant-coach/cedar-stone-hero-v1.webp"
  },
  audio: {
    welcome: "ethan-welcome.mp3",
    instructions: "task-instructions.mp3",
    noSpeech: {
      file: "recovery-no-speech.mp3",
      text: "I could not hear a complete answer. Check your microphone, speak a little closer, and try again."
    },
    serviceRecovery: {
      file: "recovery-service.mp3",
      text: "Your recording is still available on this screen, but the transcription service did not answer. You can retry the analysis or record again."
    }
  },
  rubric: [
    { key: "task", label: "Task completion", description: "Completes the restaurant purpose of each exchange." },
    { key: "interaction", label: "Interaction", description: "Responds to Ethan and keeps the service exchange moving." },
    { key: "language", label: "Unit 5 language", description: "Uses food, quantity, container, and made with/from language meaningfully." },
    { key: "fluency", label: "Fluency", description: "Develops a continuous response at a workable pace." },
    { key: "clarity", label: "Pronunciation clarity", description: "Uses transcription confidence as an approximate signal." }
  ],
  dishes: [
    {
      id: "beet-salad",
      name: "Roasted Beet and Goat Cheese Salad",
      category: "Starter",
      price: "$12",
      image: "roasted-beet-goat-cheese-salad-v1.webp",
      audio: "dish-beet-salad.mp3",
      description: "Roasted beets, goat cheese, arugula, walnuts, and citrus dressing.",
      terms: ["beet", "beets", "goat cheese", "salad"],
      response: {
        file: "stage-03-dish-beet-salad.mp3",
        text: "The roasted beet and goat cheese salad is made with roasted beets, goat cheese, arugula, walnuts, and a citrus dressing. The beets are roasted until tender, so the salad tastes earthy, fresh, and slightly sweet. Would you like to order it? Please tell me exactly what you would like, include a quantity or serving expression, and make one polite modification if needed."
      }
    },
    {
      id: "squash-soup",
      name: "Butternut Squash Soup",
      category: "Starter",
      price: "$10",
      image: "butternut-squash-soup-v1.webp",
      audio: "dish-squash-soup.mp3",
      description: "Roasted squash, vegetable stock, cream, pumpkin seeds, and herbs.",
      terms: ["butternut", "squash", "soup"],
      response: {
        file: "stage-03-dish-squash-soup.mp3",
        text: "The butternut squash soup is made with roasted squash, vegetable stock, a little cream, pumpkin seeds, and fresh herbs. The squash is roasted and blended, so the soup is smooth, warm, and slightly sweet. Would you like to order it? Please tell me exactly what you would like, include a quantity or serving expression, and make one polite modification if needed."
      }
    },
    {
      id: "salmon",
      name: "Lemon-Herb Salmon with Wild Rice",
      category: "Main",
      price: "$24",
      image: "lemon-herb-salmon-wild-rice-v1.webp",
      audio: "dish-salmon.mp3",
      description: "Grilled salmon, lemon, herbs, wild rice, and seasonal vegetables.",
      terms: ["lemon herb salmon", "salmon", "wild rice"],
      response: {
        file: "stage-03-dish-salmon.mp3",
        text: "The lemon-herb salmon is made with a grilled salmon fillet, lemon, fresh herbs, wild rice, and seasonal vegetables. The fish is grilled until tender, so it tastes fresh, savory, and bright. Would you like to order it? Please tell me exactly what you would like, include a quantity or serving expression, and make one polite modification if needed."
      }
    },
    {
      id: "risotto",
      name: "Mushroom and Spinach Risotto",
      category: "Main",
      price: "$19",
      image: "mushroom-spinach-risotto-v1.webp",
      audio: "dish-risotto.mp3",
      description: "Arborio rice, mushrooms, spinach, vegetable stock, and Parmesan.",
      terms: ["mushroom", "spinach", "risotto"],
      response: {
        file: "stage-03-dish-risotto.mp3",
        text: "The mushroom and spinach risotto is made with arborio rice, mushrooms, spinach, vegetable stock, and Parmesan. The rice slowly absorbs the stock, so the final dish is creamy, savory, and filling. Would you like to order it? Please tell me exactly what you would like, include a quantity or serving expression, and make one polite modification if needed."
      }
    },
    {
      id: "flatbread",
      name: "Grilled Chicken Flatbread",
      category: "Main",
      price: "$18",
      image: "grilled-chicken-flatbread-v1.webp",
      audio: "dish-flatbread.mp3",
      description: "Wheat flatbread, grilled chicken, peppers, red onion, greens, and herb sauce.",
      terms: ["grilled chicken", "chicken flatbread", "flatbread"],
      response: {
        file: "stage-03-dish-flatbread.mp3",
        text: "The flatbread base is made from wheat flour, and the dish is made with grilled chicken, roasted peppers, red onion, fresh greens, and herb sauce. It is crisp, savory, and easy to share. Would you like to order it? Please tell me exactly what you would like, include a quantity or serving expression, and make one polite modification if needed."
      }
    },
    {
      id: "pear-tart",
      name: "Pear and Almond Tart",
      category: "Dessert",
      price: "$11",
      image: "pear-almond-tart-v1.webp",
      audio: "dish-pear-tart.mp3",
      description: "Pear, almond filling, wheat pastry, toasted almonds, and cream.",
      terms: ["pear", "almond", "tart"],
      response: {
        file: "stage-03-dish-pear-tart.mp3",
        text: "The pastry is made from wheat flour, and the tart is made with sliced pears, almond filling, toasted almonds, and a little cream. It is crisp around the edge, soft in the center, and gently sweet. Would you like to order it? Please tell me exactly what you would like, include a quantity or serving expression, and make one polite modification if needed."
      }
    }
  ],
  incidents: [
    {
      id: "wrong-side",
      file: "stage-04-incident-wrong-side.mp3",
      text: "Thank you. I have placed your order. A few minutes later, I bring your plate, but it has fries instead of wild rice. How would you politely explain the problem and tell me what you ordered?",
      prompt: "Your plate has fries instead of wild rice. Politely explain the problem and state what you ordered.",
      terms: ["fries", "wild rice", "side", "instead", "ordered"]
    },
    {
      id: "missing-drink",
      file: "stage-04-incident-missing-drink.mp3",
      text: "Thank you. I have placed your order. Your meal has arrived, but the sparkling water you ordered is missing. How would you politely ask me to bring it?",
      prompt: "Your sparkling water is missing. Politely explain the problem and ask Ethan to bring it.",
      terms: ["sparkling water", "water", "drink", "missing", "bring"]
    },
    {
      id: "unwanted-ingredient",
      file: "stage-04-incident-unwanted-ingredient.mp3",
      text: "Thank you. I have placed your order. Your dish has red onion, although you asked for no onion. How would you politely explain the problem and request a correction?",
      prompt: "Your dish has red onion although you requested no onion. Politely explain the problem and request a correction.",
      terms: ["onion", "red onion", "asked for", "requested", "without", "remove", "correct"]
    }
  ],
  stages: [
    {
      id: "arrival",
      topic: "Arrival and table",
      prompt: "Good evening. Welcome to Cedar & Stone. Do you have a reservation, and how many people are in your party?",
      entryAudio: "stage-01-arrival.mp3",
      frames: ["Good evening. I have a reservation under ______ for ______ people.", "We do not have a reservation. Could we have a table for ______, please?"],
      vocabulary: ["a reservation under", "a table for", "party of", "we booked", "we do not have a reservation"],
      grammar: "Use have for a reservation and for + number of people for the table size.",
      checks: [
        { label: "reservation status", terms: ["reservation", "booked", "booking", "do not have", "don't have", "no reservation"] },
        { label: "party or table size", terms: ["one person", "two people", "three people", "four people", "five people", "six people", "party of", "table for"] }
      ],
      unitTerms: ["reservation", "booked", "party of", "table for"],
      minWords: 8,
      maxSeconds: 25,
      improved: "Good evening. I have a reservation under Lopez for two people.",
      complete: {
        file: "stage-01-complete.mp3",
        text: "Thank you. I have your table ready. Before you order, do you have any allergies or dietary preferences I should know about?"
      },
      clarify: {
        file: "stage-01-clarify.mp3",
        text: "I can help with that. Please tell me whether you have a reservation and how many people need a table."
      }
    },
    {
      id: "preferences",
      topic: "Preferences and allergies",
      prompt: "Before you order, do you have any allergies or dietary preferences I should know about?",
      frames: ["I am allergic to ______, so I need a dish without ______.", "I do not have any allergies, but I prefer ______ food."],
      vocabulary: ["allergic to", "a dish without", "vegetarian", "dairy-free", "gluten-free", "no allergies"],
      grammar: "Use allergic to + noun. Use without + ingredient for a restriction and prefer + noun for a preference.",
      checks: [
        { label: "allergy information", terms: ["allergic", "allergy", "allergies", "no allergies", "not allergic"] },
        { label: "a restriction or preference", terms: ["without", "prefer", "vegetarian", "vegan", "dairy", "gluten", "nuts", "seafood", "no preference"] }
      ],
      unitTerms: ["allergic to", "without", "prefer", "vegetarian", "dairy-free", "gluten-free"],
      minWords: 9,
      maxSeconds: 28,
      improved: "I do not have any allergies, but I prefer a dish with plenty of vegetables and only a little cream.",
      complete: {
        file: "stage-02-complete.mp3",
        text: "Thank you. I will keep that in mind. Please choose one dish from the visual menu. Then ask me what it is made with or made from, and ask one question about its flavor or preparation."
      },
      clarify: {
        file: "stage-02-clarify.mp3",
        text: "Before we look at the menu, please tell me clearly whether you have an allergy and mention one dietary preference or restriction."
      }
    },
    {
      id: "menu-question",
      topic: "Ask about the menu",
      prompt: "Choose one dish from the visual menu. Ask what it is made with or made from, and ask one question about its flavor or preparation.",
      requiresDish: true,
      frames: ["What is the ______ made with, and how is it prepared?", "Is the ______ made from ______? What does it taste like?"],
      vocabulary: ["made with", "made from", "What does it taste like?", "How is it prepared?", "Does it contain...?"],
      grammar: "Use made with for recipe ingredients and made from when the original material changes. Ask two connected menu questions.",
      checks: [
        { label: "the selected dish", kind: "selected-dish" },
        { label: "an ingredient or source question", terms: ["made with", "made from", "contain", "ingredient", "ingredients", "what is in"] },
        { label: "a flavor or preparation question", terms: ["taste", "flavor", "prepared", "cooked", "grilled", "roasted", "how do you make", "how is it made"] }
      ],
      unitTerms: ["made with", "made from", "ingredients", "taste", "flavor", "prepared"],
      minWords: 10,
      maxSeconds: 30,
      improved: "What is the mushroom and spinach risotto made with, and how is the rice prepared?",
      clarify: {
        file: "stage-03-clarify.mp3",
        text: "Choose one menu item by name. Then ask what it is made with or made from, and ask one more question about its flavor or preparation."
      }
    },
    {
      id: "order",
      topic: "Place the order",
      prompt: "Tell me exactly what you would like, include a quantity or serving expression, and make one polite modification if needed.",
      frames: ["I would like one ______ with a side of ______, please. Could I have it without ______?", "We will have two ______ and a bottle of ______. Could you put the ______ on the side?"],
      vocabulary: ["I would like", "I will have", "one bowl of", "two portions of", "a side of", "without", "on the side"],
      grammar: "Use would like or will have for an order. Add a number, container, measure, or partitive and one polite change.",
      checks: [
        { label: "a clear order", terms: ["would like", "i'll have", "i will have", "we'll have", "we will have", "can i have", "could i have"] },
        { label: "the dish you selected", kind: "selected-dish" },
        { label: "a quantity or serving expression", terms: ["one", "two", "three", "bowl of", "portion", "portions", "slice", "slices", "side of", "bottle of", "glass of", "cup of"] },
        { label: "a polite modification", terms: ["without", "on the side", "instead of", "could you", "please", "a little", "no onion", "no cream"] }
      ],
      unitTerms: ["would like", "bowl of", "portion of", "side of", "bottle of", "without", "instead of"],
      minWords: 12,
      maxSeconds: 32,
      improved: "I would like one portion of salmon with wild rice, please. Could I have the dressing on the side and a glass of water?",
      clarify: {
        file: "stage-04-clarify.mp3",
        text: "Before I place the order, please name the dish, include a quantity or serving expression, and make one polite modification."
      }
    },
    {
      id: "service-problem",
      topic: "Solve a service problem",
      prompt: "Politely explain the service problem and request the correct item.",
      frames: ["Excuse me, I ordered ______, but I received ______. Could you please ______?", "I am sorry, but ______ is missing. Could you bring it, please?"],
      vocabulary: ["Excuse me", "I ordered", "I asked for", "instead of", "is missing", "Could you please...?"],
      grammar: "State the expected item and the problem, then use could you please for a respectful correction.",
      checks: [
        { label: "a polite opening or request", terms: ["excuse me", "sorry", "could you", "would you", "please"] },
        { label: "the service problem", kind: "incident" },
        { label: "a correction request", terms: ["bring", "change", "replace", "remove", "correct", "could i have", "can i have", "instead"] }
      ],
      unitTerms: ["ordered", "asked for", "instead of", "missing", "could you please"],
      minWords: 11,
      maxSeconds: 30,
      improved: "Excuse me, I ordered wild rice, but I received fries. Could you please bring the correct side?",
      complete: {
        file: "stage-05-complete.mp3",
        text: "Thank you for telling me, and I am sorry about that. I will correct it right away. After the meal, how would you politely ask for the check and tell me whether you want it together or separately?"
      },
      clarify: {
        file: "stage-05-clarify.mp3",
        text: "Please explain what is wrong, say what you expected, and use a polite request to ask me to correct it."
      }
    },
    {
      id: "bill",
      topic: "Ask for the check",
      prompt: "Politely ask for the check and say whether you would like it together or separately.",
      frames: ["Could we have the check, please? We would like to pay ______.", "Could you bring me the check, please? One check is fine."],
      vocabulary: ["the check", "the bill", "together", "separately", "separate checks", "pay by card"],
      grammar: "Use could we have for a polite request. Use together, separately, or separate checks to explain payment.",
      checks: [
        { label: "a polite check request", terms: ["could we have", "could i have", "can we have", "can i have", "bring the check", "bring the bill", "check please", "bill please"] },
        { label: "payment arrangement", terms: ["together", "separately", "separate check", "separate checks", "one check", "split the bill", "split the check"] }
      ],
      unitTerms: ["check", "bill", "together", "separately", "separate checks"],
      minWords: 8,
      maxSeconds: 25,
      improved: "Could we have the check, please? We would like separate checks and I will pay by card.",
      complete: {
        file: "stage-06-complete.mp3",
        text: "Of course. I will bring the check right away. You handled the full restaurant conversation from arrival to payment. Review your private report, then repeat any stage that needs more precise language. Thank you for dining at Cedar & Stone."
      },
      clarify: {
        file: "stage-06-clarify.mp3",
        text: "Before we finish, please ask for the check politely and say whether you would like one check or separate checks."
      }
    }
  ]
};
