(() => {
  "use strict";

  window.JaraIntermediate2PronunciationConfig = {
    stages: [
      { label: "I'd = I would", shortLabel: "1", audio: "audio/pronunciation/unit-2-intermediate2/section-1.mp3", text: "If I were at a crossroads, I'd think the decision over before I answered." },
      { label: "I'd = I had", shortLabel: "2", audio: "audio/pronunciation/unit-2-intermediate2/section-2.mp3", text: "I wish I'd asked for more information before I turned that opportunity down." },
      { label: "Should've + thought groups", shortLabel: "3", audio: "audio/pronunciation/unit-2-intermediate2/section-3.mp3", text: "I should've weighed the consequences and worked out a compromise, but I learned the hard way." },
      { label: "Would you + advice / advise", shortLabel: "4", audio: "audio/pronunciation/unit-2-intermediate2/section-4.mp3", text: "Would you advise me to step up or hand the project over? I need clear advice before I decide." },
      { label: "Final challenge", shortLabel: "Final", final: true, audio: "audio/pronunciation/unit-2-intermediate2/the-choice-id-make-differently-model-us.mp3", text: "If I were at a crossroads, I'd think the decision over before I answered. I wish I'd asked for more information before I turned that opportunity down. I should've weighed the consequences and worked out a compromise, but I learned the hard way. Would you advise me to step up or hand the project over? I need clear advice before I decide." }
    ],
    apiPath: "/api/english-intermediate/pronunciation-assessment",
    submitPath: "/api/intermediate2/unit2-pronunciation/submit",
    inboxPath: "/api/intermediate2/unit2-pronunciation/submissions",
    audioPath: "/api/intermediate2/unit2-pronunciation/audio",
    storageKey: "jaralingua:english-intermediate2:pronunciation-unit2:v1",
    submissionPrefix: "ie2-u2",
    activityTitle: "Unit 2 Pronunciation - The Choice I'd Make Differently",
    product: "complete reflection about a decision, advice and regret",
    wordAudioBase: "audio/pronunciation/unit-2-intermediate2/words",
    speechEquivalences: [
      ["I would", "I'd"],
      ["I had", "I'd"],
      ["should have", "should've"]
    ],
    tips: {
      "crossroads": "Stress the first syllable: CROSS-roads. Keep the final /dz/ sound clear.",
      "i'd": "Listen to the next verb. Before a base verb, I'd means I would; before a past participle, it means I had.",
      "decision": "Stress the second syllable: de-CI-sion.",
      "answered": "Keep two syllables: AN-swered. Do not pronounce the written w.",
      "asked": "Finish with /skt/ without adding an extra vowel.",
      "information": "Stress the third syllable: in-for-MA-tion.",
      "opportunity": "Stress the third syllable: op-por-TU-ni-ty.",
      "should've": "Reduce should have to SHOULD-uv. The spelling is never should of.",
      "weighed": "Say /weɪd/, like wade. The gh is silent.",
      "consequences": "Stress the first syllable: CON-se-quen-ces.",
      "compromise": "As a noun, stress the first syllable: COM-pro-mise.",
      "advise": "The verb advise ends with a voiced /z/ sound: ad-VIZE.",
      "advice": "The noun advice ends with an unvoiced /s/ sound: ad-VICE.",
      "decide": "Stress the second syllable: de-CIDE."
    }
  };
})();
