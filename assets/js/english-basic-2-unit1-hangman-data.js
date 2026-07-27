(function () {
  "use strict";

  window.JaraLinguaEnglishBasic2Hangman = {
    version: 1,
    expectedEntries: 40,
    categories: [
      {
        id: "basic2-unit1-weather-words",
        label: "Unit 1: Weather Words",
        unit: "Unit 1",
        icon: "bi-cloud-sun-fill",
        entries: [
          {
            answer: "sunny",
            meaning: "Bright weather with a lot of sun.",
            example: "It is sunny, so the class can meet outside.",
            usage: "Common weather adjective.",
            hints: ["This word describes a day with a lot of sun.", "The sky is bright and clear; it is _____.", "It begins with S and is connected to the sun."]
          },
          {
            answer: "cloudy",
            meaning: "Weather with many clouds in the sky.",
            example: "It is cloudy, but it is not raining yet.",
            usage: "Common weather adjective.",
            hints: ["This word describes a sky with many clouds.", "There is no blue sky today; it is _____.", "It begins with C and ends with Y."]
          },
          {
            answer: "windy",
            meaning: "Weather with a lot of wind.",
            example: "It is windy, so wear a jacket.",
            usage: "Common weather adjective.",
            hints: ["This word describes strong moving air.", "The trees are moving a lot; it is _____.", "It begins with W."]
          },
          {
            answer: "stormy",
            meaning: "Weather with a storm, often with heavy rain, wind, thunder, or lightning.",
            example: "It is stormy, so we are staying inside.",
            usage: "Common weather adjective.",
            hints: ["This word describes dangerous or intense weather.", "There is thunder and heavy rain; it is _____.", "It begins with S and has six letters."]
          },
          {
            answer: "foggy",
            meaning: "Weather with thick mist that makes it hard to see clearly.",
            example: "It is foggy this morning, so drive carefully.",
            usage: "Common weather adjective.",
            hints: ["This word describes air that makes places difficult to see.", "The road is not clear because it is _____.", "It begins with F."]
          },
          {
            answer: "humid",
            meaning: "Weather with a lot of moisture in the air.",
            example: "It feels humid after the rain.",
            usage: "Common weather adjective; often used in warm places.",
            hints: ["This word describes air that feels wet or heavy.", "The weather is hot and the air feels wet; it is _____.", "It begins with H."]
          },
          {
            answer: "chilly",
            meaning: "A little cold in a way that may feel uncomfortable.",
            example: "It is chilly tonight, so I am wearing a sweater.",
            usage: "Common informal adjective for mildly cold weather.",
            hints: ["This word means a little cold.", "It is not freezing, but it is _____.", "It begins with C and has double L."]
          },
          {
            answer: "freezing",
            meaning: "Extremely cold.",
            example: "It is freezing outside, so bring gloves.",
            usage: "Common emphatic adjective for very cold weather.",
            hints: ["This word means extremely cold.", "The temperature is very low; it is _____.", "It begins with F and ends in ING."]
          },
          {
            answer: "boiling",
            meaning: "Extremely hot.",
            example: "It is boiling in this room; can we open a window?",
            usage: "Common informal British English for very hot; in American English, people often say really hot.",
            hints: ["This word can mean extremely hot.", "In British English, people may say it is _____.", "It begins with B and ends in ING."]
          },
          {
            answer: "forecast",
            meaning: "A prediction about the weather.",
            example: "The forecast says it is going to rain tomorrow.",
            usage: "Common noun for weather reports.",
            hints: ["This word means a prediction about the weather.", "Check the _____ before you leave.", "It begins with F and has eight letters."]
          },
          {
            answer: "temperature",
            meaning: "How hot or cold something is.",
            example: "The temperature is low today.",
            usage: "Common noun in weather reports.",
            hints: ["This word tells how hot or cold it is.", "The _____ is thirty degrees today.", "It begins with T."]
          },
          {
            answer: "umbrella",
            meaning: "An object used to protect you from rain or strong sun.",
            example: "I am carrying an umbrella because it is raining.",
            usage: "Common countable noun.",
            hints: ["People use this when it rains.", "Take an _____; the sky is very dark.", "It begins with U."]
          }
        ]
      },
      {
        id: "basic2-unit1-weather-sentences",
        label: "Unit 1: Weather Sentences",
        unit: "Unit 1",
        icon: "bi-chat-dots-fill",
        entries: [
          {
            answer: "it's sunny",
            meaning: "A common way to say the weather has a lot of sun.",
            example: "It's sunny, so let's sit near the window.",
            usage: "Standard everyday weather sentence.",
            hints: ["Use this sentence when the day is bright.", "The short form of it is appears at the beginning.", "The final word is connected to the sun."]
          },
          {
            answer: "it's cloudy",
            meaning: "A common way to say there are many clouds in the sky.",
            example: "It's cloudy, but we can still walk outside.",
            usage: "Standard everyday weather sentence.",
            hints: ["Use this sentence when the sky has many clouds.", "The sentence starts with it's.", "The final word begins with C."]
          },
          {
            answer: "it's raining",
            meaning: "A common way to say rain is falling now.",
            example: "It's raining, so I am taking my umbrella.",
            usage: "Present continuous weather sentence.",
            hints: ["Use this sentence when water is falling from the sky now.", "The sentence uses it's plus an ING verb.", "The final word begins with R."]
          },
          {
            answer: "it's windy",
            meaning: "A common way to say there is a lot of wind.",
            example: "It's windy, so close the window.",
            usage: "Standard everyday weather sentence.",
            hints: ["Use this sentence when the air is moving a lot.", "The sentence starts with it's.", "The final word begins with W."]
          },
          {
            answer: "it's stormy",
            meaning: "A common way to say the weather has storm conditions.",
            example: "It's stormy, so the game is inside today.",
            usage: "Standard everyday weather sentence.",
            hints: ["Use this sentence for weather with thunder, lightning, wind, or heavy rain.", "The sentence starts with it's.", "The final word begins with S."]
          },
          {
            answer: "it's pouring",
            meaning: "A natural way to say it is raining very heavily.",
            example: "It's pouring, so wait inside for a few minutes.",
            usage: "Very common everyday expression; more casual than it is raining heavily.",
            hints: ["Use this sentence when the rain is very heavy.", "The final word has ING.", "It is stronger than it's raining."]
          },
          {
            answer: "it's freezing",
            meaning: "A common way to say the weather feels extremely cold.",
            example: "It's freezing, so I am wearing gloves.",
            usage: "Common emphatic sentence for very cold weather.",
            hints: ["Use this sentence when it feels extremely cold.", "The final word begins with F.", "The final word ends in ING."]
          },
          {
            answer: "it's really hot",
            meaning: "A very common American English way to say the weather is very hot.",
            example: "It's really hot, so I am drinking water.",
            usage: "Common American English; more neutral than it's boiling.",
            hints: ["Use this sentence when the temperature is very high.", "It has three words.", "The middle word makes hot stronger."]
          }
        ]
      },
      {
        id: "basic2-unit1-present-continuous",
        label: "Unit 1: Present Continuous Actions",
        unit: "Unit 1",
        icon: "bi-person-walking",
        entries: [
          {
            answer: "wearing a jacket",
            meaning: "Having a jacket on your body right now.",
            example: "I am wearing a jacket because it is chilly.",
            usage: "Present continuous action phrase.",
            hints: ["This phrase describes clothes on your body now.", "I am _____ because it is chilly.", "The first word ends in ING."]
          },
          {
            answer: "carrying an umbrella",
            meaning: "Holding or taking an umbrella with you now.",
            example: "She is carrying an umbrella because it is raining.",
            usage: "Present continuous action phrase.",
            hints: ["This phrase describes taking something for rain.", "She is _____ because it is raining.", "The object begins with U."]
          },
          {
            answer: "checking the weather",
            meaning: "Looking for information about the weather now.",
            example: "We are checking the weather before we leave.",
            usage: "Present continuous action phrase.",
            hints: ["This phrase describes looking at a forecast now.", "We are _____ before we leave.", "The first word begins with C and ends in ING."]
          },
          {
            answer: "walking outside",
            meaning: "Moving on foot outdoors now.",
            example: "They are walking outside because it is sunny.",
            usage: "Present continuous action phrase.",
            hints: ["This phrase describes moving on foot outdoors.", "They are _____ because it is sunny.", "The first word ends in ING."]
          },
          {
            answer: "staying inside",
            meaning: "Remaining indoors now.",
            example: "We are staying inside because it is stormy.",
            usage: "Present continuous action phrase.",
            hints: ["This phrase describes not going outdoors.", "We are _____ because it is stormy.", "The final word is the opposite of outside."]
          },
          {
            answer: "looking outside",
            meaning: "Watching or checking what is happening outdoors now.",
            example: "He is looking outside because the sky is dark.",
            usage: "Present continuous action phrase.",
            hints: ["This phrase describes watching the weather outdoors.", "He is _____ because the sky is dark.", "The first word begins with L."]
          },
          {
            answer: "opening an umbrella",
            meaning: "Making an umbrella ready to use now.",
            example: "I am opening an umbrella because it is pouring.",
            usage: "Present continuous action phrase.",
            hints: ["This phrase describes preparing an object for rain.", "I am _____ because it is pouring.", "The first word begins with O and ends in ING."]
          },
          {
            answer: "waiting inside",
            meaning: "Staying indoors for a period of time now.",
            example: "The students are waiting inside until the rain stops.",
            usage: "Present continuous action phrase.",
            hints: ["This phrase describes staying in a place for some time.", "The students are _____ until the rain stops.", "The second word is the opposite of outside."]
          },
          {
            answer: "getting cloudy",
            meaning: "Changing so that more clouds are appearing now.",
            example: "It is getting cloudy, so take your umbrella.",
            usage: "Present continuous change phrase with getting.",
            hints: ["This phrase describes the sky changing now.", "It is _____, so rain may come later.", "The phrase starts with getting."]
          },
          {
            answer: "getting windy",
            meaning: "Changing so that there is more wind now.",
            example: "It is getting windy, so close the door.",
            usage: "Present continuous change phrase with getting.",
            hints: ["This phrase describes the weather changing now.", "It is _____, so hold your papers.", "The phrase starts with getting."]
          }
        ]
      },
      {
        id: "basic2-unit1-weather-idioms",
        label: "Unit 1: Weather Idioms",
        unit: "Unit 1",
        icon: "bi-lightning-charge-fill",
        entries: [
          {
            answer: "under the weather",
            meaning: "Feeling sick or not feeling well.",
            example: "Mia is under the weather, so she is staying home today.",
            usage: "Common informal idiom; it does not describe the actual weather.",
            hints: ["This idiom means someone is not feeling well.", "Mia is _____, so she is resting.", "It has three words and starts with under."]
          },
          {
            answer: "raining cats and dogs",
            meaning: "Raining very heavily.",
            example: "It is raining cats and dogs, so the match is inside.",
            usage: "Traditional idiom; many learners know it, but in daily speech it's pouring is often more natural.",
            hints: ["This idiom means the rain is very heavy.", "It is _____, so take an umbrella.", "It mentions two animals."]
          },
          {
            answer: "rain or shine",
            meaning: "No matter what the weather is like.",
            example: "Practice starts at nine, rain or shine.",
            usage: "Common idiom for plans that continue in any weather.",
            hints: ["This idiom means a plan continues in any weather.", "The class meets every Friday, _____.", "It has three words."]
          },
          {
            answer: "beat the heat",
            meaning: "Avoid or reduce the effects of very hot weather.",
            example: "We drink water to beat the heat.",
            usage: "Common casual expression for hot weather.",
            hints: ["This expression means managing very hot weather.", "Drink water to _____.", "It has three words and starts with beat."]
          },
          {
            answer: "weather the storm",
            meaning: "Survive or manage a difficult situation.",
            example: "The team worked together to weather the storm.",
            usage: "Common idiom; it usually describes a problem, not real weather.",
            hints: ["This idiom means to get through a difficult situation.", "The team stayed calm to _____.", "It has three words and starts with weather."]
          },
          {
            answer: "save it for a rainy day",
            meaning: "Keep something, often money or energy, for a future time when it may be needed.",
            example: "I am saving part of my allowance for a rainy day.",
            usage: "Common idiom; rainy day means a possible future problem.",
            hints: ["This idiom means keeping something for a future need.", "Do not spend all your money; _____.", "It has six words and includes rainy day."]
          },
          {
            answer: "take a rain check",
            meaning: "Say no to an invitation now but suggest doing it another time.",
            example: "I can't go today. Can I take a rain check?",
            usage: "Common informal idiom in invitations.",
            hints: ["This idiom means postpone an invitation.", "I can't play today; can I _____?", "It has four words and includes rain."]
          },
          {
            answer: "on cloud nine",
            meaning: "Extremely happy.",
            example: "She is on cloud nine after passing the test.",
            usage: "Common idiom for happiness; it is not about actual clouds.",
            hints: ["This idiom means extremely happy.", "After winning the game, he was _____.", "It has three words and includes a number."]
          },
          {
            answer: "a breeze",
            meaning: "Something very easy to do.",
            example: "The spelling activity was a breeze for the class.",
            usage: "Common informal idiom; it is not about wind in this use.",
            hints: ["This idiom means something is very easy.", "The quiz was _____.", "It has two words."]
          },
          {
            answer: "storm in a teacup",
            meaning: "A lot of anger or worry about a small problem.",
            example: "The argument was a storm in a teacup.",
            usage: "Common in British English; American English often says tempest in a teapot.",
            hints: ["This idiom means a big reaction to a small problem.", "The argument was a _____.", "It mentions a storm and a small cup."]
          }
        ]
      }
    ]
  };

  window.JaraLinguaHangmanConfig = {
    data: window.JaraLinguaEnglishBasic2Hangman,
    storageKey: "english-basic-2-unit-1-hangman-game-v1",
    soundKey: "english-basic-2-hangman-sound-v1",
    sfxBase: "/ingles/intermediate/audio/sfx/hangman/",
    alphabetAudioBase: "/ingles/basico/audio/alphabet/",
    answerAudioBase: "/ingles/basico-2/audio/hangman/answers/",
    answerAudioEnabled: false,
    allowAllCategories: false,
    audioVersion: "?v=20260727-basic2-weather-hangman"
  };
})();
