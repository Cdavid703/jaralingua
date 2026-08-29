(() => {
  "use strict";
  window.JaraIntermediate2PronunciationConfig = {
    stages: [
      { label: "Technical problem sounds", shortLabel: "1", audio: "audio/pronunciation/unit-3-intermediate2/section-1.mp3", text: "My screen keeps freezing, and the app crashes whenever I connect to the network." },
      { label: "Embedded-question rhythm", shortLabel: "2", audio: "audio/pronunciation/unit-3-intermediate2/section-2.mp3", text: "Could you tell me where the settings are and whether the update is available?" },
      { label: "Phrasal-verb links", shortLabel: "3", audio: "audio/pronunciation/unit-3-intermediate2/section-3.mp3", text: "First, hook up the monitor, look up the error code, and turn the volume down." },
      { label: "Digital-safety stress", shortLabel: "4", audio: "audio/pronunciation/unit-3-intermediate2/section-4.mp3", text: "Identity theft is a serious security risk, so if a suspicious message asks for sensitive information, you mustn't share your password." },
      { label: "Final challenge", shortLabel: "Final", final: true, audio: "audio/pronunciation/unit-3-intermediate2/sound-clear-in-tech-support-model-us.mp3", text: "My screen keeps freezing, and the app crashes whenever I connect to the network. Could you tell me where the settings are and whether the update is available? First, hook up the monitor, look up the error code, and turn the volume down. Identity theft is a serious security risk, so if a suspicious message asks for sensitive information, you mustn't share your password." }
    ],
    apiPath: "/api/english-intermediate/pronunciation-assessment",
    submitPath: "/api/intermediate2/unit3-pronunciation/submit",
    inboxPath: "/api/intermediate2/unit3-pronunciation/submissions",
    audioPath: "/api/intermediate2/unit3-pronunciation/audio",
    storageKey: "jaralingua:english-intermediate2:pronunciation-unit3:v1",
    submissionPrefix: "ie2-u3",
    activityTitle: "Unit 3 Pronunciation - Sound Clear in Tech Support",
    product: "complete technology-support and digital-safety message",
    wordAudioBase: "audio/pronunciation/unit-3-intermediate2/words",
    speechEquivalences: [["cannot", "can't"], ["must not", "mustn't"]],
    tips: {
      "screen": "Begin with the /skr/ cluster without adding a vowel: SCREEN.",
      "freezing": "Stress FREE and finish with the ng sound: FREE-zing.",
      "crashes": "Keep two syllables: CRASH-es. The final sound is /iz/.",
      "whenever": "Stress the second syllable: when-EV-er.",
      "connect": "Stress the second syllable: con-NECT, then link connect_to.",
      "network": "Stress the first syllable: NET-work.",
      "could": "Keep could short before you; could_you often links with a /dzh/ sound.",
      "settings": "Stress SET and keep the final /ngz/ sound clear.",
      "whether": "Use a voiced th and a smooth final r: WHE-ther.",
      "update": "As a noun, stress the first syllable: UP-date.",
      "available": "Stress the second syllable: a-VAIL-a-ble.",
      "first": "Use a smooth American r and finish the /st/ cluster clearly.",
      "hook": "Keep the vowel short, then connect hook_up without a pause.",
      "monitor": "Stress the first syllable: MON-i-tor.",
      "look": "Keep the vowel short, then connect look_up.",
      "error": "Stress the first syllable and use a smooth final r: ER-ror.",
      "volume": "Stress the first syllable: VOL-ume.",
      "identity": "Stress the second syllable: i-DEN-ti-ty.",
      "theft": "Finish with both consonants in /ft/ without adding a vowel.",
      "serious": "Stress the first syllable: SE-ri-ous.",
      "security": "Stress the second syllable: se-CU-ri-ty.",
      "suspicious": "Stress the second syllable: sus-PI-cious.",
      "message": "Stress the first syllable: MES-sage.",
      "sensitive": "Stress the first syllable: SEN-si-tive.",
      "information": "Stress the third syllable: in-for-MA-tion.",
      "mustn't": "Keep the reduction compact: MUS-nt. Do not add an extra syllable.",
      "password": "Stress the first part: PASS-word, with a smooth final r sound."
    }
  };
})();
