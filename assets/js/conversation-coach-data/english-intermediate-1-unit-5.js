window.JaraLinguaConversationCoachConfig = {
  id: "english-intermediate-1-unit-5",
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:english-intermediate-1:conversation-coach:unit-5:v1",
  language: "en",
  locale: "en-US",
  courseLabel: "Intermediate English Course 1",
  unitLabel: "Unit 5",
  title: "Maya's Global Food Table",
  audioRoot: "audio/conversation-coach/unit-5/",
  attemptQuestionCount: 4,
  maxRecordingSeconds: 40,
  localUrl: "http://127.0.0.1:8025/ingles/intermediate/unit-conversation-coach-unit-5.html",
  character: {
    name: "Maya Brooks",
    role: "Global Food Conversation Coach",
    portrait: "../../assets/img/english-intermediate/unit-5/conversation-coach-maya-portrait-v1.webp",
    hero: "../../assets/img/english-intermediate/unit-5/conversation-coach-maya-hero-v1.webp"
  },
  audio: {
    welcome: "maya-welcome.mp3",
    instructions: "task-instructions.mp3",
    needDetail: {
      file: "reaction-need-detail.mp3",
      text: "You have a useful starting point. Add one precise ingredient, quantity, comparison, or cultural reason before you move on."
    },
    noSpeech: {
      file: "recovery-no-speech.mp3",
      text: "I could not hear a complete answer. Check your microphone, speak a little closer, and try again."
    },
    serviceRecovery: {
      file: "recovery-service.mp3",
      text: "Your recording is still available on this screen, but the transcription service did not answer. You can retry the analysis or record again."
    },
    closing: {
      file: "closing.mp3",
      text: "Thank you for sharing your ideas. Review your private report, then practice the questions that need more detail."
    }
  },
  selectionGroups: [
    { id: "ingredients", count: 1, questionIds: ["u5q1-dish", "u5q2-transformation"] },
    { id: "quantities", count: 1, questionIds: ["u5q3-meal", "u5q4-shopping"] },
    { id: "culture", count: 1, questionIds: ["u5q5-identity", "u5q6-comparison", "u5q7-review"] }
  ],
  mandatoryQuestionIds: ["u5q8-role-reversal"],
  rubric: [
    { key: "task", label: "Task completion", description: "Answers the exact food and culture prompt." },
    { key: "interaction", label: "Interaction", description: "Responds relevantly and asks Maya meaningful questions." },
    { key: "language", label: "Vocabulary and structures", description: "Uses Unit 5 language with useful detail." },
    { key: "fluency", label: "Fluency", description: "Develops a continuous answer at a workable pace." },
    { key: "clarity", label: "Pronunciation clarity", description: "Uses transcription confidence as an approximate signal." }
  ],
  usefulLanguage: [
    "It is made with...",
    "It is made from...",
    "We need a few...",
    "We need a little...",
    "A bottle of...",
    "It represents...",
    "Both dishes...",
    "I recommend it because..."
  ],
  interactionResponses: [
    {
      id: "preparation",
      terms: ["how do you make", "how do you prepare", "how is it prepared", "how do you cook"],
      file: "answer-preparation.mp3",
      text: "I prepare my rice bowl by cooking the rice first, grilling the vegetables, and mixing a fresh lime dressing. Then I arrange everything in one bowl."
    },
    {
      id: "quantities",
      terms: ["how much", "how many", "quantity", "quantities", "what amount"],
      file: "answer-quantities.mp3",
      text: "For four people, I use two cups of cooked rice, a can of beans, a few vegetables, and a little olive oil."
    },
    {
      id: "ingredients",
      terms: ["what is it made", "what ingredients", "which ingredients", "what does it contain"],
      file: "answer-ingredients.mp3",
      text: "My favorite bowl is made with rice, black beans, roasted vegetables, avocado, and a little lime dressing."
    },
    {
      id: "culture",
      terms: ["where is it from", "what culture", "cultural", "traditional", "why is it important", "what does it represent"],
      file: "answer-culture.mp3",
      text: "The dish is inspired by Latin American home cooking. For me, it represents sharing colorful food at the table with family and friends."
    },
    {
      id: "recommendation",
      terms: ["do you recommend", "would you recommend", "is it healthy", "is it good", "why do you like"],
      file: "answer-recommendation.mp3",
      text: "Yes, I recommend it because it is colorful, filling, and easy to adapt. It can also include plenty of vegetables."
    },
    {
      id: "favorite",
      terms: ["favorite dish", "favourite dish", "what dish do you like", "what food do you like", "what is your favorite"],
      file: "answer-favorite-dish.mp3",
      text: "My favorite dish is a roasted vegetable rice bowl because every person can choose different ingredients and quantities."
    }
  ],
  defaultInteractionResponse: {
    file: "answer-generic.mp3",
    text: "That is an interesting question. My favorite meals combine grains, vegetables, and a fresh dressing because they are easy to share and personalize."
  },
  questions: [
    {
      id: "u5q1-dish",
      group: "ingredients",
      topic: "Dish and ingredients",
      text: "Tell me about a dish you know well. What is it made with?",
      audio: "question-01.mp3",
      frames: [
        "A dish I know well is ______. It is made with ______.",
        "I would like to describe ______. It contains ______, and the main ingredient is ______."
      ],
      vocabulary: ["made with", "contains", "main ingredient", "rice", "beans", "vegetables", "chicken", "dressing", "spices"],
      grammar: "Use made with to introduce recipe ingredients. Use made of when visible components form the finished dish.",
      checks: [
        { label: "a dish", terms: ["dish", "salad", "soup", "rice", "bowl", "arepa", "pasta", "bread", "chicken", "fish", "dessert"] },
        { label: "an ingredient structure", terms: ["made with", "made of", "contains", "ingredient", "ingredients", "has"] }
      ],
      unitTerms: ["made with", "made of", "contains", "ingredient", "ingredients"],
      minWords: 12,
      maxSeconds: 30,
      improved: "A dish I know well is a Colombian-inspired rice bowl. It is made with rice, beans, grilled chicken, vegetables, and lime dressing.",
      reaction: {
        file: "reaction-q01-dish.mp3",
        text: "That sounds like a complete dish. Your ingredient description helps me imagine what is on the plate."
      }
    },
    {
      id: "u5q2-transformation",
      group: "ingredients",
      topic: "Source and transformation",
      text: "Choose one food product, such as chocolate, cheese, or tofu. What is it made from?",
      audio: "question-02.mp3",
      frames: [
        "______ is made from ______.",
        "The original ingredient is ______. It changes into ______ during production."
      ],
      vocabulary: ["made from", "cocoa beans", "milk", "soybeans", "corn", "wheat", "processed", "transformed"],
      grammar: "Use made from when the original material changes into a different product.",
      checks: [
        { label: "made from", terms: ["made from", "comes from", "produced from"] },
        { label: "a source material", terms: ["cocoa", "beans", "milk", "soybeans", "soy", "corn", "wheat", "flour", "fruit"] }
      ],
      unitTerms: ["made from", "processed", "transformed", "original ingredient"],
      minWords: 10,
      maxSeconds: 28,
      improved: "Chocolate is made from cocoa beans. The beans are roasted and processed before they become chocolate.",
      reaction: {
        file: "reaction-q02-source.mp3",
        text: "Good transformation example. You connected a finished food product with its original source."
      }
    },
    {
      id: "u5q3-meal",
      group: "quantities",
      topic: "Meal quantities",
      text: "You are preparing a balanced meal for four people. What ingredients and quantities do you need?",
      audio: "question-03.mp3",
      frames: [
        "For four people, we need ______, ______, and ______.",
        "I would use a few ______, a little ______, and ______ cups of ______."
      ],
      vocabulary: ["a few", "a little", "some", "two cups of", "a can of", "four pieces of", "for four people"],
      grammar: "Use a few with countable plural foods and a little with uncountable ingredients. Add a container or measure for exact amounts.",
      checks: [
        { label: "quantity language", terms: ["a few", "a little", "some", "cup", "cups", "can", "cans", "bottle", "pieces", "grams", "kilograms"] },
        { label: "at least two foods", minMatches: 2, terms: ["rice", "beans", "vegetables", "tomatoes", "avocados", "chicken", "fish", "oil", "water", "bread", "cheese", "fruit"] }
      ],
      unitTerms: ["a few", "a little", "some", "cups of", "can of", "pieces of"],
      minWords: 16,
      maxSeconds: 35,
      improved: "For four people, we need two cups of cooked rice, a can of beans, four pieces of chicken, a few tomatoes, and a little oil.",
      reaction: {
        file: "reaction-q03-quantities.mp3",
        text: "Those quantities sound practical for four people. You connected the number of guests with a realistic food plan."
      }
    },
    {
      id: "u5q4-shopping",
      group: "quantities",
      topic: "Containers and measures",
      text: "Imagine you are shopping for a healthy snack table. Which containers, measures, or partitives would you buy?",
      audio: "question-04.mp3",
      frames: [
        "I would buy a ______ of ______ and a ______ of ______.",
        "For the snack table, I need two ______ of ______, a few ______, and a little ______."
      ],
      vocabulary: ["a bottle of", "a carton of", "a bag of", "a bowl of", "a slice of", "a piece of", "a cup of"],
      grammar: "Use container or partitive + of + food. Make the container plural when the number is greater than one.",
      checks: [
        { label: "two container phrases", minMatches: 2, terms: ["bottle", "carton", "bag", "bowl", "slice", "piece", "cup", "box", "jar", "pack"] },
        { label: "snack food", terms: ["fruit", "water", "juice", "yogurt", "bread", "cheese", "nuts", "crackers", "vegetables", "cereal"] }
      ],
      unitTerms: ["bottle of", "carton of", "bag of", "bowl of", "slice of", "piece of", "cup of"],
      minWords: 14,
      maxSeconds: 32,
      improved: "I would buy two bottles of water, a carton of yogurt, a bag of nuts, a few apples, and some whole-grain crackers.",
      reaction: {
        file: "reaction-q04-containers.mp3",
        text: "That shopping list is clear. The containers and partitives make every amount easier to understand."
      }
    },
    {
      id: "u5q5-identity",
      group: "culture",
      topic: "Food and identity",
      text: "What dish represents your family, city, or region, and why is it important to you?",
      audio: "question-05.mp3",
      frames: [
        "______ represents my ______ because ______.",
        "An important dish in my family or region is ______. It reminds me of ______."
      ],
      vocabulary: ["represents", "traditional", "home cooking", "family gathering", "region", "reminds me of", "important because"],
      grammar: "Use the simple present for cultural meaning and because to explain why the dish matters.",
      checks: [
        { label: "family or regional identity", terms: ["family", "city", "region", "country", "Colombia", "Colombian", "home", "traditional", "culture"] },
        { label: "a personal reason", terms: ["because", "reminds me", "represents", "important", "memory", "memories", "gathering", "celebration"] }
      ],
      unitTerms: ["represents", "traditional", "reminds me of", "important because", "culture"],
      minWords: 16,
      maxSeconds: 35,
      improved: "Arepas represent my family because we prepare them together on weekends. They remind me of breakfast at my grandmother's home.",
      reaction: {
        file: "reaction-q05-culture.mp3",
        text: "Thank you for sharing that connection. Food becomes more meaningful when it carries family or regional memories."
      }
    },
    {
      id: "u5q6-comparison",
      group: "culture",
      topic: "Cultural comparison",
      text: "Compare a Colombian dish with a dish from another culture. What is similar, and what is different?",
      audio: "question-06.mp3",
      frames: [
        "Both ______ and ______ are made with ______, but ______.",
        "______ is similar to ______ because ______. However, ______."
      ],
      vocabulary: ["both", "similar", "different", "however", "while", "made with", "spicier", "lighter", "served with"],
      grammar: "Use both for a shared feature and but, while, or however for a difference.",
      checks: [
        { label: "a similarity", terms: ["both", "similar", "also", "in common", "same"] },
        { label: "a difference", terms: ["but", "however", "while", "different", "more", "less", "spicier", "lighter"] }
      ],
      unitTerms: ["both", "similar", "different", "however", "while", "made with"],
      minWords: 18,
      maxSeconds: 38,
      improved: "Both Colombian arepas and Mexican tortillas are made from corn. However, arepas are thicker, while tortillas are usually thinner and folded around other ingredients.",
      reaction: {
        file: "reaction-q06-comparison.mp3",
        text: "That comparison is respectful and specific. You explained a shared feature and a meaningful difference."
      }
    },
    {
      id: "u5q7-review",
      group: "culture",
      topic: "Global snack review",
      text: "Recommend a snack from any culture. Describe its ingredients, taste, and cultural connection.",
      audio: "question-07.mp3",
      frames: [
        "I recommend ______. It is made with ______, and it tastes ______.",
        "You should try ______ because ______. It comes from ______ and is usually eaten ______."
      ],
      vocabulary: ["I recommend", "made with", "sweet", "savory", "crispy", "soft", "traditional", "usually served", "cultural connection"],
      grammar: "Use recommend + noun and because for a reason. Add is made with for ingredients and an adjective for taste or texture.",
      checks: [
        { label: "a recommendation", terms: ["recommend", "should try", "you can try", "worth trying"] },
        { label: "taste or texture", terms: ["sweet", "savory", "salty", "spicy", "crispy", "crunchy", "soft", "creamy", "fresh", "delicious"] },
        { label: "ingredients or culture", terms: ["made with", "contains", "ingredient", "traditional", "culture", "comes from", "served"] }
      ],
      unitTerms: ["recommend", "made with", "traditional", "served", "sweet", "savory", "crispy", "creamy"],
      minWords: 18,
      maxSeconds: 38,
      improved: "I recommend Japanese onigiri. It is made with rice and different fillings, and it tastes soft and savory. It is a practical snack connected with Japanese everyday food culture.",
      reaction: {
        file: "reaction-q07-recommendation.mp3",
        text: "That recommendation gives me a real reason to try the snack. You connected ingredients, sensory language, and culture."
      }
    },
    {
      id: "u5q8-role-reversal",
      group: "interaction",
      topic: "Your questions for Maya",
      text: "Now interview me. Ask two questions about my favorite dish, its ingredients, quantities, preparation, or cultural meaning.",
      audio: "question-08.mp3",
      interaction: true,
      requiredQuestionCount: 2,
      frames: [
        "What is your favorite dish, and what is it made with?",
        "How do you prepare it, and why is it important to you?"
      ],
      vocabulary: ["What is...?", "What is it made with?", "How much...?", "How do you prepare...?", "Where is it from?", "Why do you recommend...?"],
      grammar: "Keep question word order: question word + auxiliary + subject + verb. Ask two different food questions.",
      checks: [
        { kind: "question-starters", label: "two clear question starters", minMatches: 2 },
        { label: "a food topic", terms: ["dish", "food", "ingredient", "ingredients", "made with", "made from", "prepare", "cook", "quantity", "how much", "how many", "culture", "traditional", "recommend"] }
      ],
      unitTerms: ["what is", "how do", "how much", "how many", "where is", "why do", "made with", "prepare"],
      minWords: 12,
      maxSeconds: 40,
      improved: "What is your favorite dish, and what is it made with? How do you prepare it, and why do you recommend it?"
    }
  ]
};
