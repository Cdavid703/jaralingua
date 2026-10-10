window.JaraLinguaConversationCoachConfig = {
  "id": "english-intermediate-2-unit-6-opinion",
  "language": "en",
  "locale": "en-US",
  "apiPath": "/api/english-intermediate/pronunciation-assessment",
  "storageKey": "jaralingua:intermediate2:opinion:v1",
  "persistHistory": false,
  "courseLabel": "Intermediate English Course 2",
  "unitLabel": "Unit 6",
  "title": "My opinion matters",
  "audioRoot": "audio/unit-6-opinion-coach/",
  "attemptQuestionCount": 16,
  "maxRecordingSeconds": 50,
  "character": {
    "name": "David Rivera",
    "role": "Your conversation coach",
    "portrait": "../../assets/img/english-intermediate-2/unit-5/david-coach/david.png"
  },
  "questions": [
    {
      "id": "hello",
      "sceneId": null,
      "kind": "hello",
      "topic": "Let’s meet",
      "text": "Hi! I'm David. It's good to see you! What's your name?",
      "audio": "hello.mp3",
      "frames": [
        "My name is ___. Nice to meet you!"
      ],
      "examples": [
        {
          "file": "hello-example-1.mp3",
          "text": "Hi, David! My name is Ana."
        }
      ],
      "vocabulary": [
        "nice to meet you"
      ],
      "grammar": "Your name is not assessed. You can correct the transcription.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "Hi, David! My name is Ana.",
      "minWords": 1,
      "maxSeconds": 20,
      "unscored": true
    },
    {
      "id": "s1-observe",
      "sceneId": 1,
      "kind": "observe",
      "topic": "Scene 1 · Observe",
      "text": "Let's look at our first picture! What can you see on the phone and in the full scene?",
      "audio": "s1-observe.mp3",
      "frames": [
        "I can see ___.",
        "There is / There are ___."
      ],
      "examples": [
        {
          "file": "s1-observe-example-1.mp3",
          "text": "I can see a man with boxes on the phone. In the full scene, a volunteer is receiving the boxes."
        },
        {
          "file": "s1-observe-example-2.mp3",
          "text": "There are families near a table with water and blankets."
        }
      ],
      "vocabulary": [
        "photo",
        "supplies",
        "volunteer",
        "evidence",
        "misleading"
      ],
      "grammar": "Describe visible people, objects and actions before guessing.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "I can see a man with boxes on the phone. In the full scene, a volunteer is receiving the boxes.",
      "minWords": 3,
      "maxSeconds": 50
    },
    {
      "id": "s1-interpret",
      "sceneId": 1,
      "kind": "interpret",
      "topic": "Scene 1 · Interpret",
      "text": "What does it look like the man is doing?",
      "audio": "s1-interpret.mp3",
      "frames": [
        "She / He looks ___ because ___.",
        "It looks like ___ is / are ___.",
        "They seem to be ___."
      ],
      "examples": [
        {
          "file": "s1-interpret-example-1.mp3",
          "text": "It looks like he is delivering supplies to the shelter."
        },
        {
          "file": "s1-interpret-example-2.mp3",
          "text": "He seems to be helping, but the cropped photo does not show the whole situation."
        }
      ],
      "vocabulary": [
        "photo",
        "supplies",
        "volunteer",
        "evidence",
        "misleading"
      ],
      "grammar": "Looks + adjective: she looks worried. Looks like + clause: it looks like she needs help. Seems to be + action: she seems to be waiting.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "It looks like he is delivering supplies to the shelter.",
      "minWords": 3,
      "maxSeconds": 50,
      "alternative": {
        "text": "Look at the boxes, the open van and the volunteer. Which detail supports your impression?",
        "audio": "s1-evidence.mp3"
      }
    },
    {
      "id": "s1-opinion",
      "sceneId": 1,
      "kind": "opinion",
      "topic": "Scene 1 · Opinion",
      "text": "Could this photo make people judge the man unfairly? Why or why not?",
      "audio": "s1-opinion.mp3",
      "frames": [
        "In my opinion, ___ because ___.",
        "It depends on ___. For example, ___."
      ],
      "examples": [
        {
          "file": "s1-opinion-example-1.mp3",
          "text": "I think the photo could mislead people because it hides the volunteer receiving the boxes."
        },
        {
          "file": "s1-opinion-example-2.mp3",
          "text": "I would not judge him from this photo because there is not enough evidence."
        }
      ],
      "vocabulary": [
        "photo",
        "supplies",
        "volunteer",
        "evidence",
        "misleading"
      ],
      "grammar": "Your position is yours. Give a reason, then an example. There is no single correct opinion.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "I think the photo could mislead people because it hides the volunteer receiving the boxes.",
      "minWords": 3,
      "maxSeconds": 50,
      "followUpSet": "1"
    },
    {
      "id": "s2-observe",
      "sceneId": 2,
      "kind": "observe",
      "topic": "Scene 2 · Observe",
      "text": "Here's a different situation. What can you see on the phone and the laptop?",
      "audio": "s2-observe.mp3",
      "frames": [
        "I can see ___.",
        "There is / There are ___."
      ],
      "examples": [
        {
          "file": "s2-observe-example-1.mp3",
          "text": "I can see a warning on a phone and a weather map on a laptop."
        },
        {
          "file": "s2-observe-example-2.mp3",
          "text": "Three students are looking at the screens, and it is raining outside."
        }
      ],
      "vocabulary": [
        "warning",
        "source",
        "share",
        "check",
        "worried"
      ],
      "grammar": "Describe visible people, objects and actions before guessing.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "I can see a warning on a phone and a weather map on a laptop.",
      "minWords": 3,
      "maxSeconds": 50
    },
    {
      "id": "s2-interpret",
      "sceneId": 2,
      "kind": "interpret",
      "topic": "Scene 2 · Interpret",
      "text": "Look at the student holding the phone. How does she seem to feel?",
      "audio": "s2-interpret.mp3",
      "frames": [
        "She / He looks ___ because ___.",
        "It looks like ___ is / are ___.",
        "They seem to be ___."
      ],
      "examples": [
        {
          "file": "s2-interpret-example-1.mp3",
          "text": "She looks worried because she is looking carefully at the warning."
        },
        {
          "file": "s2-interpret-example-2.mp3",
          "text": "She seems unsure about what to do next."
        }
      ],
      "vocabulary": [
        "warning",
        "source",
        "share",
        "check",
        "worried"
      ],
      "grammar": "Looks + adjective: she looks worried. Looks like + clause: it looks like she needs help. Seems to be + action: she seems to be waiting.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "She looks worried because she is looking carefully at the warning.",
      "minWords": 3,
      "maxSeconds": 50,
      "alternative": {
        "text": "Look at her face and the two screens. What visible detail supports your impression?",
        "audio": "s2-evidence.mp3"
      }
    },
    {
      "id": "s2-opinion",
      "sceneId": 2,
      "kind": "opinion",
      "topic": "Scene 2 · Opinion",
      "text": "Would you share this warning now or check it first? Explain your choice.",
      "audio": "s2-opinion.mp3",
      "frames": [
        "In my opinion, ___ because ___.",
        "It depends on ___. For example, ___."
      ],
      "examples": [
        {
          "file": "s2-opinion-example-1.mp3",
          "text": "I would check the source first because a false warning could frighten people."
        },
        {
          "file": "s2-opinion-example-2.mp3",
          "text": "I might share it with a clear note that it is unverified because people may need time to prepare."
        }
      ],
      "vocabulary": [
        "warning",
        "source",
        "share",
        "check",
        "worried"
      ],
      "grammar": "Your position is yours. Give a reason, then an example. There is no single correct opinion.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "I would check the source first because a false warning could frighten people.",
      "minWords": 3,
      "maxSeconds": 50,
      "followUpSet": "2"
    },
    {
      "id": "s3-observe",
      "sceneId": 3,
      "kind": "observe",
      "topic": "Scene 3 · Observe",
      "text": "Now we're outside. What are the people in this street doing?",
      "audio": "s3-observe.mp3",
      "frames": [
        "I can see ___.",
        "There is / There are ___."
      ],
      "examples": [
        {
          "file": "s3-observe-example-1.mp3",
          "text": "Some people are carrying a chair, and another person is filming."
        },
        {
          "file": "s3-observe-example-2.mp3",
          "text": "I can see muddy walls, bags and an older person sitting near a dog."
        }
      ],
      "vocabulary": [
        "film",
        "rescue crew",
        "damage",
        "help",
        "might"
      ],
      "grammar": "Describe visible people, objects and actions before guessing.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "Some people are carrying a chair, and another person is filming.",
      "minWords": 3,
      "maxSeconds": 50
    },
    {
      "id": "s3-interpret",
      "sceneId": 3,
      "kind": "interpret",
      "topic": "Scene 3 · Interpret",
      "text": "What does it look like the person in the yellow raincoat is trying to do?",
      "audio": "s3-interpret.mp3",
      "frames": [
        "She / He looks ___ because ___.",
        "It looks like ___ is / are ___.",
        "They seem to be ___."
      ],
      "examples": [
        {
          "file": "s3-interpret-example-1.mp3",
          "text": "It looks like the person is recording the damage."
        },
        {
          "file": "s3-interpret-example-2.mp3",
          "text": "They might be asking for help, but we cannot know that from the image alone."
        }
      ],
      "vocabulary": [
        "film",
        "rescue crew",
        "damage",
        "help",
        "might"
      ],
      "grammar": "Looks + adjective: she looks worried. Looks like + clause: it looks like she needs help. Seems to be + action: she seems to be waiting.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "It looks like the person is recording the damage.",
      "minWords": 3,
      "maxSeconds": 50,
      "alternative": {
        "text": "Which detail in the image supports your idea about the person filming?",
        "audio": "s3-evidence.mp3"
      }
    },
    {
      "id": "s3-opinion",
      "sceneId": 3,
      "kind": "opinion",
      "topic": "Scene 3 · Opinion",
      "text": "Do you think filming is useful or harmful in this situation? Explain your opinion.",
      "audio": "s3-opinion.mp3",
      "frames": [
        "In my opinion, ___ because ___.",
        "It depends on ___. For example, ___."
      ],
      "examples": [
        {
          "file": "s3-opinion-example-1.mp3",
          "text": "Filming could help show what the families need, as long as it does not get in the way."
        },
        {
          "file": "s3-opinion-example-2.mp3",
          "text": "I think helping directly is more useful here because the neighbors are carrying heavy things."
        }
      ],
      "vocabulary": [
        "film",
        "rescue crew",
        "damage",
        "help",
        "might"
      ],
      "grammar": "Your position is yours. Give a reason, then an example. There is no single correct opinion.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "Filming could help show what the families need, as long as it does not get in the way.",
      "minWords": 3,
      "maxSeconds": 50,
      "followUpSet": "3"
    },
    {
      "id": "s4-observe",
      "sceneId": 4,
      "kind": "observe",
      "topic": "Scene 4 · Observe",
      "text": "Let's step inside the shelter. What is on the table, and who is waiting?",
      "audio": "s4-observe.mp3",
      "frames": [
        "I can see ___.",
        "There is / There are ___."
      ],
      "examples": [
        {
          "file": "s4-observe-example-1.mp3",
          "text": "There are three small boxes, water bottles and blankets on the table. Several families are waiting."
        },
        {
          "file": "s4-observe-example-2.mp3",
          "text": "I can see a volunteer, a child, an older adult and a person in a wheelchair."
        }
      ],
      "vocabulary": [
        "shelter",
        "supplies",
        "blankets",
        "fairly",
        "seems"
      ],
      "grammar": "Describe visible people, objects and actions before guessing.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "There are three small boxes, water bottles and blankets on the table. Several families are waiting.",
      "minWords": 3,
      "maxSeconds": 50
    },
    {
      "id": "s4-interpret",
      "sceneId": 4,
      "kind": "interpret",
      "topic": "Scene 4 · Interpret",
      "text": "Look at the volunteer behind the table. How does she seem to feel?",
      "audio": "s4-interpret.mp3",
      "frames": [
        "She / He looks ___ because ___.",
        "It looks like ___ is / are ___.",
        "They seem to be ___."
      ],
      "examples": [
        {
          "file": "s4-interpret-example-1.mp3",
          "text": "She seems worried because there are few supplies and several people waiting."
        },
        {
          "file": "s4-interpret-example-2.mp3",
          "text": "She looks thoughtful. She might be planning how to share the supplies."
        }
      ],
      "vocabulary": [
        "shelter",
        "supplies",
        "blankets",
        "fairly",
        "seems"
      ],
      "grammar": "Looks + adjective: she looks worried. Looks like + clause: it looks like she needs help. Seems to be + action: she seems to be waiting.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "She seems worried because there are few supplies and several people waiting.",
      "minWords": 3,
      "maxSeconds": 50,
      "alternative": {
        "text": "What can you see in her expression or around the table that supports your impression?",
        "audio": "s4-evidence.mp3"
      }
    },
    {
      "id": "s4-opinion",
      "sceneId": 4,
      "kind": "opinion",
      "topic": "Scene 4 · Opinion",
      "text": "If you were this volunteer, how would you distribute the supplies fairly?",
      "audio": "s4-opinion.mp3",
      "frames": [
        "In my opinion, ___ because ___.",
        "It depends on ___. For example, ___."
      ],
      "examples": [
        {
          "file": "s4-opinion-example-1.mp3",
          "text": "I would ask what each person needs and explain how the supplies will be shared."
        },
        {
          "file": "s4-opinion-example-2.mp3",
          "text": "I would give everyone some water first, then check who needs extra support."
        }
      ],
      "vocabulary": [
        "shelter",
        "supplies",
        "blankets",
        "fairly",
        "seems"
      ],
      "grammar": "Your position is yours. Give a reason, then an example. There is no single correct opinion.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "I would ask what each person needs and explain how the supplies will be shared.",
      "minWords": 3,
      "maxSeconds": 50,
      "followUpSet": "4"
    },
    {
      "id": "s5-observe",
      "sceneId": 5,
      "kind": "observe",
      "topic": "Scene 5 · Observe",
      "text": "One last picture! What is similar, and what is different, between these communities?",
      "audio": "s5-observe.mp3",
      "frames": [
        "I can see ___.",
        "There is / There are ___."
      ],
      "examples": [
        {
          "file": "s5-observe-example-1.mp3",
          "text": "Both communities have flood damage, but only one has reporters."
        },
        {
          "file": "s5-observe-example-2.mp3",
          "text": "People are cleaning in both places. On the left, a camera operator is filming an interview."
        }
      ],
      "vocabulary": [
        "reporter",
        "attention",
        "community",
        "damage",
        "seems"
      ],
      "grammar": "Describe visible people, objects and actions before guessing.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "Both communities have flood damage, but only one has reporters.",
      "minWords": 3,
      "maxSeconds": 50
    },
    {
      "id": "s5-interpret",
      "sceneId": 5,
      "kind": "interpret",
      "topic": "Scene 5 · Interpret",
      "text": "How do you think the people without reporters might feel?",
      "audio": "s5-interpret.mp3",
      "frames": [
        "She / He looks ___ because ___.",
        "It looks like ___ is / are ___.",
        "They seem to be ___."
      ],
      "examples": [
        {
          "file": "s5-interpret-example-1.mp3",
          "text": "They might feel ignored because no reporters are there."
        },
        {
          "file": "s5-interpret-example-2.mp3",
          "text": "They may feel focused on cleaning. We cannot be sure of their feelings."
        }
      ],
      "vocabulary": [
        "reporter",
        "attention",
        "community",
        "damage",
        "seems"
      ],
      "grammar": "Looks + adjective: she looks worried. Looks like + clause: it looks like she needs help. Seems to be + action: she seems to be waiting.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "They might feel ignored because no reporters are there.",
      "minWords": 3,
      "maxSeconds": 50,
      "alternative": {
        "text": "Which detail supports your interpretation, and what can the image not tell us?",
        "audio": "s5-evidence.mp3"
      }
    },
    {
      "id": "s5-opinion",
      "sceneId": 5,
      "kind": "opinion",
      "topic": "Scene 5 · Opinion",
      "text": "Should reporters give these communities the same attention? Explain your view.",
      "audio": "s5-opinion.mp3",
      "frames": [
        "In my opinion, ___ because ___.",
        "It depends on ___. For example, ___."
      ],
      "examples": [
        {
          "file": "s5-opinion-example-1.mp3",
          "text": "I think both deserve attention because both communities need help."
        },
        {
          "file": "s5-opinion-example-2.mp3",
          "text": "I would compare their needs before deciding how much coverage each should receive."
        }
      ],
      "vocabulary": [
        "reporter",
        "attention",
        "community",
        "damage",
        "seems"
      ],
      "grammar": "Your position is yours. Give a reason, then an example. There is no single correct opinion.",
      "checks": [
        {
          "label": "your idea",
          "kind": "word-count",
          "minMatches": 3
        }
      ],
      "improved": "I think both deserve attention because both communities need help.",
      "minWords": 3,
      "maxSeconds": 50,
      "followUpSet": "5"
    }
  ],
  "followUpSets": {
    "1": {
      "reason": {
        "id": "s1-reason",
        "sceneId": 1,
        "kind": "reason",
        "topic": "Scene 1 · Reason",
        "text": "What is your main reason for that choice?",
        "audio": "s1-reason.mp3",
        "frames": [
          "My main reason is ___."
        ],
        "examples": [
          {
            "file": "s1-reason-example-1.mp3",
            "text": "My main reason is that the small photo leaves out important context."
          }
        ],
        "vocabulary": [
          "photo",
          "supplies",
          "volunteer",
          "evidence",
          "misleading"
        ],
        "grammar": "Explain your own idea. A prediction is a possibility, not a fact.",
        "checks": [
          {
            "label": "your idea",
            "kind": "word-count",
            "minMatches": 3
          }
        ],
        "improved": "My main reason is that the small photo leaves out important context.",
        "minWords": 3,
        "maxSeconds": 50
      },
      "prediction": {
        "id": "s1-prediction",
        "sceneId": 1,
        "kind": "prediction",
        "topic": "Scene 1 · Prediction",
        "text": "What might happen if someone shares only the cropped photo?",
        "audio": "s1-prediction.mp3",
        "frames": [
          "They might ___ because ___."
        ],
        "examples": [
          {
            "file": "s1-prediction-example-1.mp3",
            "text": "People might misunderstand the man and accuse him unfairly."
          }
        ],
        "vocabulary": [
          "photo",
          "supplies",
          "volunteer",
          "evidence",
          "misleading"
        ],
        "grammar": "Explain your own idea. A prediction is a possibility, not a fact.",
        "checks": [
          {
            "label": "your idea",
            "kind": "word-count",
            "minMatches": 3
          }
        ],
        "improved": "People might misunderstand the man and accuse him unfairly.",
        "minWords": 3,
        "maxSeconds": 50
      }
    },
    "2": {
      "reason": {
        "id": "s2-reason",
        "sceneId": 2,
        "kind": "reason",
        "topic": "Scene 2 · Reason",
        "text": "What is your main reason for that choice?",
        "audio": "s2-reason.mp3",
        "frames": [
          "My main reason is ___."
        ],
        "examples": [
          {
            "file": "s2-reason-example-1.mp3",
            "text": "My main reason is that people need reliable information."
          }
        ],
        "vocabulary": [
          "warning",
          "source",
          "share",
          "check",
          "worried"
        ],
        "grammar": "Explain your own idea. A prediction is a possibility, not a fact.",
        "checks": [
          {
            "label": "your idea",
            "kind": "word-count",
            "minMatches": 3
          }
        ],
        "improved": "My main reason is that people need reliable information.",
        "minWords": 3,
        "maxSeconds": 50
      },
      "prediction": {
        "id": "s2-prediction",
        "sceneId": 2,
        "kind": "prediction",
        "topic": "Scene 2 · Prediction",
        "text": "What might happen after the student makes that choice?",
        "audio": "s2-prediction.mp3",
        "frames": [
          "They might ___ because ___."
        ],
        "examples": [
          {
            "file": "s2-prediction-example-1.mp3",
            "text": "Some people might prepare for a flood, while others might check the source."
          }
        ],
        "vocabulary": [
          "warning",
          "source",
          "share",
          "check",
          "worried"
        ],
        "grammar": "Explain your own idea. A prediction is a possibility, not a fact.",
        "checks": [
          {
            "label": "your idea",
            "kind": "word-count",
            "minMatches": 3
          }
        ],
        "improved": "Some people might prepare for a flood, while others might check the source.",
        "minWords": 3,
        "maxSeconds": 50
      }
    },
    "3": {
      "reason": {
        "id": "s3-reason",
        "sceneId": 3,
        "kind": "reason",
        "topic": "Scene 3 · Reason",
        "text": "What is your main reason for that choice?",
        "audio": "s3-reason.mp3",
        "frames": [
          "My main reason is ___."
        ],
        "examples": [
          {
            "file": "s3-reason-example-1.mp3",
            "text": "My main reason is that filming can show what help is needed."
          }
        ],
        "vocabulary": [
          "film",
          "rescue crew",
          "damage",
          "help",
          "might"
        ],
        "grammar": "Explain your own idea. A prediction is a possibility, not a fact.",
        "checks": [
          {
            "label": "your idea",
            "kind": "word-count",
            "minMatches": 3
          }
        ],
        "improved": "My main reason is that filming can show what help is needed.",
        "minWords": 3,
        "maxSeconds": 50
      },
      "prediction": {
        "id": "s3-prediction",
        "sceneId": 3,
        "kind": "prediction",
        "topic": "Scene 3 · Prediction",
        "text": "What might change if the person puts the phone away?",
        "audio": "s3-prediction.mp3",
        "frames": [
          "They might ___ because ___."
        ],
        "examples": [
          {
            "file": "s3-prediction-example-1.mp3",
            "text": "The person might help carry the furniture instead."
          }
        ],
        "vocabulary": [
          "film",
          "rescue crew",
          "damage",
          "help",
          "might"
        ],
        "grammar": "Explain your own idea. A prediction is a possibility, not a fact.",
        "checks": [
          {
            "label": "your idea",
            "kind": "word-count",
            "minMatches": 3
          }
        ],
        "improved": "The person might help carry the furniture instead.",
        "minWords": 3,
        "maxSeconds": 50
      }
    },
    "4": {
      "reason": {
        "id": "s4-reason",
        "sceneId": 4,
        "kind": "reason",
        "topic": "Scene 4 · Reason",
        "text": "What is your main reason for that choice?",
        "audio": "s4-reason.mp3",
        "frames": [
          "My main reason is ___."
        ],
        "examples": [
          {
            "file": "s4-reason-example-1.mp3",
            "text": "My main reason is that everyone should have access to essential supplies."
          }
        ],
        "vocabulary": [
          "shelter",
          "supplies",
          "blankets",
          "fairly",
          "seems"
        ],
        "grammar": "Explain your own idea. A prediction is a possibility, not a fact.",
        "checks": [
          {
            "label": "your idea",
            "kind": "word-count",
            "minMatches": 3
          }
        ],
        "improved": "My main reason is that everyone should have access to essential supplies.",
        "minWords": 3,
        "maxSeconds": 50
      },
      "prediction": {
        "id": "s4-prediction",
        "sceneId": 4,
        "kind": "prediction",
        "topic": "Scene 4 · Prediction",
        "text": "How might the families react to your plan?",
        "audio": "s4-prediction.mp3",
        "frames": [
          "They might ___ because ___."
        ],
        "examples": [
          {
            "file": "s4-prediction-example-1.mp3",
            "text": "Some families might appreciate the plan, but others may ask for more supplies."
          }
        ],
        "vocabulary": [
          "shelter",
          "supplies",
          "blankets",
          "fairly",
          "seems"
        ],
        "grammar": "Explain your own idea. A prediction is a possibility, not a fact.",
        "checks": [
          {
            "label": "your idea",
            "kind": "word-count",
            "minMatches": 3
          }
        ],
        "improved": "Some families might appreciate the plan, but others may ask for more supplies.",
        "minWords": 3,
        "maxSeconds": 50
      }
    },
    "5": {
      "reason": {
        "id": "s5-reason",
        "sceneId": 5,
        "kind": "reason",
        "topic": "Scene 5 · Reason",
        "text": "What is your main reason for that choice?",
        "audio": "s5-reason.mp3",
        "frames": [
          "My main reason is ___."
        ],
        "examples": [
          {
            "file": "s5-reason-example-1.mp3",
            "text": "My main reason is that both communities need to be heard."
          }
        ],
        "vocabulary": [
          "reporter",
          "attention",
          "community",
          "damage",
          "seems"
        ],
        "grammar": "Explain your own idea. A prediction is a possibility, not a fact.",
        "checks": [
          {
            "label": "your idea",
            "kind": "word-count",
            "minMatches": 3
          }
        ],
        "improved": "My main reason is that both communities need to be heard.",
        "minWords": 3,
        "maxSeconds": 50
      },
      "prediction": {
        "id": "s5-prediction",
        "sceneId": 5,
        "kind": "prediction",
        "topic": "Scene 5 · Prediction",
        "text": "What might happen if one community remains out of the news?",
        "audio": "s5-prediction.mp3",
        "frames": [
          "They might ___ because ___."
        ],
        "examples": [
          {
            "file": "s5-prediction-example-1.mp3",
            "text": "The community might receive less support because fewer people hear its story."
          }
        ],
        "vocabulary": [
          "reporter",
          "attention",
          "community",
          "damage",
          "seems"
        ],
        "grammar": "Explain your own idea. A prediction is a possibility, not a fact.",
        "checks": [
          {
            "label": "your idea",
            "kind": "word-count",
            "minMatches": 3
          }
        ],
        "improved": "The community might receive less support because fewer people hear its story.",
        "minWords": 3,
        "maxSeconds": 50
      }
    }
  },
  "mandatoryQuestionIds": [
    "hello",
    "s1-observe",
    "s1-interpret",
    "s1-opinion",
    "s2-observe",
    "s2-interpret",
    "s2-opinion",
    "s3-observe",
    "s3-interpret",
    "s3-opinion",
    "s4-observe",
    "s4-interpret",
    "s4-opinion",
    "s5-observe",
    "s5-interpret",
    "s5-opinion"
  ],
  "selectionGroups": [],
  "scenes": [
    {
      "id": 1,
      "slug": "photo-context",
      "title": "The full picture",
      "alt": "A phone crops a man carrying boxes; the wider scene shows him handing supplies to a volunteer at a relief table.",
      "observe": "Let's look at our first picture! What can you see on the phone and in the full scene?",
      "interpret": "What does it look like the man is doing?",
      "opinion": "Could this photo make people judge the man unfairly? Why or why not?",
      "predict": "What might happen if someone shares only the cropped photo?",
      "terms": [
        "photo",
        "supplies",
        "volunteer",
        "evidence",
        "misleading"
      ],
      "examples": [
        [
          "I can see a man with boxes on the phone. In the full scene, a volunteer is receiving the boxes.",
          "There are families near a table with water and blankets."
        ],
        [
          "It looks like he is delivering supplies to the shelter.",
          "He seems to be helping, but the cropped photo does not show the whole situation."
        ],
        [
          "I think the photo could mislead people because it hides the volunteer receiving the boxes.",
          "I would not judge him from this photo because there is not enough evidence."
        ]
      ],
      "detail": "Look at the boxes, the open van and the volunteer. Which detail supports your impression?",
      "reaction": {
        "file": "s1-reaction.mp3",
        "text": "The small photo leaves out the people receiving the boxes. Your interpretation needs that wider context."
      },
      "image": "/assets/img/english-intermediate-2/unit-6/opinion-coach/photo-context-v1.webp"
    },
    {
      "id": 2,
      "slug": "unverified-warning",
      "title": "Before you share",
      "alt": "Three students look at an anonymous flood warning on a phone and a weather map on a laptop, with rain outside.",
      "observe": "Here's a different situation. What can you see on the phone and the laptop?",
      "interpret": "Look at the student holding the phone. How does she seem to feel?",
      "opinion": "Would you share this warning now or check it first? Explain your choice.",
      "predict": "What might happen after the student makes that choice?",
      "terms": [
        "warning",
        "source",
        "share",
        "check",
        "worried"
      ],
      "examples": [
        [
          "I can see a warning on a phone and a weather map on a laptop.",
          "Three students are looking at the screens, and it is raining outside."
        ],
        [
          "She looks worried because she is looking carefully at the warning.",
          "She seems unsure about what to do next."
        ],
        [
          "I would check the source first because a false warning could frighten people.",
          "I might share it with a clear note that it is unverified because people may need time to prepare."
        ]
      ],
      "detail": "Look at her face and the two screens. What visible detail supports your impression?",
      "reaction": {
        "file": "s2-reaction.mp3",
        "text": "We can see a warning, but the picture does not establish whether it is reliable."
      },
      "image": "/assets/img/english-intermediate-2/unit-6/opinion-coach/unverified-warning-v1.webp"
    },
    {
      "id": 3,
      "slug": "help-or-film",
      "title": "A phone in an emergency",
      "alt": "A person films while neighbors carry a chair and belongings out of a muddy home; an older adult sits safely nearby.",
      "observe": "Now we're outside. What are the people in this street doing?",
      "interpret": "What does it look like the person in the yellow raincoat is trying to do?",
      "opinion": "Do you think filming is useful or harmful in this situation? Explain your opinion.",
      "predict": "What might change if the person puts the phone away?",
      "terms": [
        "film",
        "rescue crew",
        "damage",
        "help",
        "might"
      ],
      "examples": [
        [
          "Some people are carrying a chair, and another person is filming.",
          "I can see muddy walls, bags and an older person sitting near a dog."
        ],
        [
          "It looks like the person is recording the damage.",
          "They might be asking for help, but we cannot know that from the image alone."
        ],
        [
          "Filming could help show what the families need, as long as it does not get in the way.",
          "I think helping directly is more useful here because the neighbors are carrying heavy things."
        ]
      ],
      "detail": "Which detail in the image supports your idea about the person filming?",
      "reaction": {
        "file": "s3-reaction.mp3",
        "text": "The phone is visible. The reason for filming is something we have to infer."
      },
      "image": "/assets/img/english-intermediate-2/unit-6/opinion-coach/help-or-film-v1.webp"
    },
    {
      "id": 4,
      "slug": "limited-supplies",
      "title": "Enough for everyone?",
      "alt": "A thoughtful volunteer stands behind three small supply boxes, water and blankets while families wait in a shelter with nearly empty shelves.",
      "observe": "Let's step inside the shelter. What is on the table, and who is waiting?",
      "interpret": "Look at the volunteer behind the table. How does she seem to feel?",
      "opinion": "If you were this volunteer, how would you distribute the supplies fairly?",
      "predict": "How might the families react to your plan?",
      "terms": [
        "shelter",
        "supplies",
        "blankets",
        "fairly",
        "seems"
      ],
      "examples": [
        [
          "There are three small boxes, water bottles and blankets on the table. Several families are waiting.",
          "I can see a volunteer, a child, an older adult and a person in a wheelchair."
        ],
        [
          "She seems worried because there are few supplies and several people waiting.",
          "She looks thoughtful. She might be planning how to share the supplies."
        ],
        [
          "I would ask what each person needs and explain how the supplies will be shared.",
          "I would give everyone some water first, then check who needs extra support."
        ]
      ],
      "detail": "What can you see in her expression or around the table that supports your impression?",
      "reaction": {
        "file": "s4-reaction.mp3",
        "text": "We can see limited supplies and several people waiting. Their exact needs are not all visible."
      },
      "image": "/assets/img/english-intermediate-2/unit-6/opinion-coach/limited-supplies-v1.webp"
    },
    {
      "id": 5,
      "slug": "unequal-coverage",
      "title": "Whose story gets heard?",
      "alt": "Two similarly flood-damaged communities side by side: reporters interview residents on the left; residents clean without reporters on the right.",
      "observe": "One last picture! What is similar, and what is different, between these communities?",
      "interpret": "How do you think the people without reporters might feel?",
      "opinion": "Should reporters give these communities the same attention? Explain your view.",
      "predict": "What might happen if one community remains out of the news?",
      "terms": [
        "reporter",
        "attention",
        "community",
        "damage",
        "seems"
      ],
      "examples": [
        [
          "Both communities have flood damage, but only one has reporters.",
          "People are cleaning in both places. On the left, a camera operator is filming an interview."
        ],
        [
          "They might feel ignored because no reporters are there.",
          "They may feel focused on cleaning. We cannot be sure of their feelings."
        ],
        [
          "I think both deserve attention because both communities need help.",
          "I would compare their needs before deciding how much coverage each should receive."
        ]
      ],
      "detail": "Which detail supports your interpretation, and what can the image not tell us?",
      "reaction": {
        "file": "s5-reaction.mp3",
        "text": "Both scenes show damage. The different coverage does not tell us the full needs of either community."
      },
      "image": "/assets/img/english-intermediate-2/unit-6/opinion-coach/unequal-coverage-v1.webp"
    }
  ],
  "wordHelp": {
    "photo": {
      "spanish": "foto",
      "audio": "audio/unit-6-opinion-coach/word-photo.mp3"
    },
    "supplies": {
      "spanish": "suministros",
      "audio": "/ingles/intermediate-2/audio/unit-6-explanation/word-supplies.mp3"
    },
    "volunteer": {
      "spanish": "voluntario o voluntaria",
      "audio": "audio/unit-6-opinion-coach/word-volunteer.mp3"
    },
    "evidence": {
      "spanish": "evidencia; pruebas",
      "audio": "/ingles/intermediate-2/audio/unit-6-explanation/word-evidence.mp3"
    },
    "misleading": {
      "spanish": "engañoso; que da una impresión equivocada",
      "audio": "audio/unit-6-opinion-coach/word-misleading.mp3"
    },
    "warning": {
      "spanish": "alerta; advertencia",
      "audio": "/ingles/intermediate-2/audio/unit-6-explanation/word-warning.mp3"
    },
    "source": {
      "spanish": "fuente de información",
      "audio": "/ingles/intermediate-2/audio/unit-6-explanation/word-source.mp3"
    },
    "share": {
      "spanish": "compartir",
      "audio": "audio/unit-6-opinion-coach/word-share.mp3"
    },
    "check": {
      "spanish": "comprobar; verificar",
      "audio": "audio/unit-6-opinion-coach/word-check.mp3"
    },
    "worried": {
      "spanish": "preocupado o preocupada",
      "audio": "audio/unit-6-opinion-coach/word-worried.mp3"
    },
    "film": {
      "spanish": "grabar un video",
      "audio": "audio/unit-6-opinion-coach/word-film.mp3"
    },
    "rescue crew": {
      "spanish": "equipo de rescate",
      "audio": "/ingles/intermediate-2/audio/unit-6-explanation/word-rescue-crew.mp3"
    },
    "damage": {
      "spanish": "daños",
      "audio": "/ingles/intermediate-2/audio/unit-6-explanation/word-damage.mp3"
    },
    "help": {
      "spanish": "ayudar; ayuda",
      "audio": "audio/unit-6-opinion-coach/word-help.mp3"
    },
    "might": {
      "spanish": "podría; expresa posibilidad",
      "audio": "audio/unit-6-opinion-coach/word-might.mp3"
    },
    "shelter": {
      "spanish": "refugio",
      "audio": "/ingles/intermediate-2/audio/unit-6-explanation/word-shelter.mp3"
    },
    "blankets": {
      "spanish": "mantas; cobijas",
      "audio": "audio/unit-6-opinion-coach/word-blankets.mp3"
    },
    "fairly": {
      "spanish": "de manera justa",
      "audio": "audio/unit-6-opinion-coach/word-fairly.mp3"
    },
    "seems": {
      "spanish": "parece",
      "audio": "audio/unit-6-opinion-coach/word-seems.mp3"
    },
    "reporter": {
      "spanish": "reportero o reportera",
      "audio": "/ingles/intermediate-2/audio/unit-6-explanation/word-reporter.mp3"
    },
    "attention": {
      "spanish": "atención",
      "audio": "audio/unit-6-opinion-coach/word-attention.mp3"
    },
    "community": {
      "spanish": "comunidad",
      "audio": "audio/unit-6-opinion-coach/word-community.mp3"
    },
    "nice to meet you": {
      "spanish": "mucho gusto",
      "audio": "audio/unit-6-opinion-coach/word-nice-to-meet-you.mp3"
    }
  },
  "replies": {
    "hello": {
      "file": "reply-hello.mp3",
      "text": "Nice to meet you! I'm glad you're here. Let's explore these pictures together!"
    },
    "observe": {
      "file": "reply-observe.mp3",
      "text": "Thanks for describing what you noticed. Let’s look a little more closely."
    },
    "inference": {
      "file": "reply-inference.mp3",
      "text": "That is one possible interpretation. Remember, an impression is not a fact."
    },
    "uncertain": {
      "file": "reply-uncertain.mp3",
      "text": "It's okay to be unsure! Try one possibility with, it looks like, or, it seems."
    },
    "reason": {
      "file": "reply-reason.mp3",
      "text": "You have given a reason for your view. Let’s think about what could happen next."
    },
    "opinion": {
      "file": "reply-opinion.mp3",
      "text": "I hear your point. Let’s explore the reason behind it."
    },
    "followup": {
      "file": "reply-followup.mp3",
      "text": "Thanks for developing your idea. You can bring that perspective to the round table!"
    },
    "clarify": {
      "file": "reply-clarify.mp3",
      "text": "I'm not sure I understood your idea about this picture. Try naming one visible detail, or open Help me answer."
    },
    "correction-looks": {
      "file": "reply-correction-looks.mp3",
      "text": "A small language tip: say, she looks worried, without like before the adjective. Try that pattern with your own idea."
    },
    "correction-agree": {
      "file": "reply-correction-agree.mp3",
      "text": "A small language tip: the phrase, I am agree, is not correct. Say, I agree. Your opinion can stay the same!"
    },
    "correction-seems": {
      "file": "reply-correction-seems.mp3",
      "text": "A small language tip: say, she seems to be helping. Use seems to be before an action ending in ing."
    },
    "not-worried": {
      "file": "reply-not-worried.mp3",
      "text": "You do not see worry in that expression. That is possible; a picture can support more than one interpretation."
    },
    "worried": {
      "file": "reply-worried.mp3",
      "text": "You mentioned worry. Remember to connect that impression to a detail you can see."
    },
    "share": {
      "file": "reply-share.mp3",
      "text": "Sharing quickly can have consequences. The source and the uncertainty are part of this decision."
    },
    "check": {
      "file": "reply-check.mp3",
      "text": "Checking a source takes time, and reliability matters. Think about how you would explain your choice."
    },
    "both": {
      "file": "reply-both.mp3",
      "text": "You are considering more than one possibility. That can help you explain a balanced opinion."
    },
    "question": {
      "file": "reply-question.mp3",
      "text": "For this activity, use the image and give your own opinion. You can open the help for language or listen to the question again."
    },
    "return": {
      "file": "reply-return.mp3",
      "text": "Now, let’s come back to the question on screen."
    },
    "no-speech": {
      "file": "reply-no-speech.mp3",
      "text": "I couldn't hear a clear answer. Check your microphone, and let's try again."
    },
    "service": {
      "file": "reply-service.mp3",
      "text": "I couldn't get your words this time. Please retry the analysis, or continue without feedback."
    },
    "closing": {
      "file": "reply-closing.mp3",
      "text": "Thanks for sharing your ideas! In the round table, listen to your classmates, explain your reasons, and remember: different opinions can help us think. See you soon!"
    },
    "welcome": {
      "file": "reply-welcome.mp3",
      "text": "Hi there! I'm David. Five pictures, five big questions, and your own ideas! We'll describe what we see, explore what it might mean, and share opinions. Ready? Let's talk!"
    },
    "instructions": {
      "file": "reply-instructions.mp3",
      "text": "Listen to one question at a time. Record your answer, then hear my reply. Open Help me answer if you need a start or an example. Click the picture to see more detail. You can skip a turn and come back later."
    }
  },
  "voice": {
    "id": "pv8WYYW60prEkDbDXyC0",
    "name": "David",
    "category": "cloned",
    "modelId": "eleven_v3"
  },
  "audio": {
    "welcome": "reply-welcome.mp3",
    "instructions": "reply-instructions.mp3",
    "needDetail": {
      "file": "reply-clarify.mp3",
      "text": "I'm not sure I understood your idea about this picture. Try naming one visible detail, or open Help me answer."
    },
    "noSpeech": {
      "file": "reply-no-speech.mp3",
      "text": "I couldn't hear a clear answer. Check your microphone, and let's try again."
    },
    "serviceRecovery": {
      "file": "reply-service.mp3",
      "text": "I couldn't get your words this time. Please retry the analysis, or continue without feedback."
    },
    "closing": {
      "file": "reply-closing.mp3",
      "text": "Thanks for sharing your ideas! In the round table, listen to your classmates, explain your reasons, and remember: different opinions can help us think. See you soon!"
    }
  },
  "returnToPrompt": {
    "file": "reply-return.mp3",
    "text": "Now, let’s come back to the question on screen."
  },
  "strictConfidence": true,
  "rubric": [],
  "feedbackRules": [],
  "ui": {
    "autoClosing": true,
    "alwaysAllowNext": true,
    "immediatePrompt": true,
    "supportStartsClosed": true,
    "hideRealSupport": true,
    "floatingDock": false,
    "compactFeedback": true,
    "collapseFeedback": true,
    "acknowledgeBeforeFollowUp": true,
    "supportLabel": "Sentence starters, examples and vocabulary",
    "summaryLeadComplete": "You explored five perspectives for the round table."
  }
};
