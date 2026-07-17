(function (root, factory) {
  "use strict";

  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.JaraFrench8PronunciationAssessment = api;
})(typeof window !== "undefined" ? window : null, function (root) {
  "use strict";

  const API_PATH = "/api/french8/pronunciation-assessment";
  const ACCEPTED_COST = 0.45;
  const WHOLE_WORD_HOMOPHONES = {
    "0": "zero",
    "1": "un",
    "2": "deux",
    "3": "trois",
    "4": "quatre",
    "5": "cinq",
    "6": "six",
    "7": "sept",
    "8": "huit",
    "9": "neuf",
    "10": "dix",
    "11": "onze",
    "12": "douze",
    "13": "treize",
    "14": "quatorze",
    "15": "quinze",
    "16": "seize",
    "20": "vingt",
    "30": "trente",
    "40": "quarante",
    "50": "cinquante",
    "60": "soixante",
    a: "a",
    ai: "e-open",
    ais: "e-open",
    ait: "e-open",
    aient: "e-open",
    es: "e-open",
    est: "e-open",
    et: "e-open",
    ces: "se",
    ses: "se",
    sais: "se",
    sait: "se",
    cest: "se",
    sest: "se",
    la: "la",
    las: "la",
    ou: "ou",
    on: "on",
    ont: "on",
    son: "son",
    sont: "son",
    leur: "leur",
    leurs: "leur",
    quel: "kel",
    quels: "kel",
    quelle: "kel",
    quelles: "kel"
  };

  function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Math.round(Number(value) || 0)));
  }

  function finiteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function normalizeWord(value) {
    return String(value || "")
      .toLocaleLowerCase("fr-FR")
      .replace(/[\u2018\u2019]/g, "'")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/œ/g, "oe")
      .replace(/æ/g, "ae")
      .replace(/[^a-z0-9'-]/g, "")
      .replace(/^[-']+|[-']+$/g, "");
  }

  function tokens(value) {
    return String(value || "")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[^\p{L}\p{N}'-]+/gu, " ")
      .trim()
      .split(/\s+/)
      .map(normalizeWord)
      .filter(Boolean);
  }

  function phoneticBase(value) {
    let word = normalizeWord(value).replace(/'/g, "");
    if (!word) return "";
    if (WHOLE_WORD_HOMOPHONES[word]) return WHOLE_WORD_HOMOPHONES[word];
    word = word
      .replace(/eaux/g, "o")
      .replace(/eau|au/g, "o")
      .replace(/ph/g, "f")
      .replace(/th/g, "t")
      .replace(/gn/g, "n")
      .replace(/ill/g, "y")
      .replace(/qu/g, "k")
      .replace(/ck/g, "k")
      .replace(/ch/g, "sh")
      .replace(/h/g, "")
      .replace(/([aeiouy])\1+/g, "$1");
    return word;
  }

  function phoneticVariants(value) {
    const original = phoneticBase(value);
    const variants = new Set([original]);
    if (!original) return variants;

    const withoutPlural = original.length > 3 ? original.replace(/[sxz]$/, "") : original;
    variants.add(withoutPlural);
    if (/(aient|ais|ait|ai|est|es|et)$/.test(withoutPlural)) {
      variants.add(withoutPlural.replace(/(aient|ais|ait|ai|est|es|et)$/, "e-open"));
    }
    if (withoutPlural.length > 4 && /(ees|ee|es|e|er|ez)$/.test(withoutPlural)) {
      variants.add(withoutPlural.replace(/(ees|ee|es|e|er|ez)$/, "e-close"));
    }
    if (withoutPlural.length > 4 && /ent$/.test(withoutPlural)) {
      variants.add(withoutPlural.replace(/ent$/, ""));
    }
    if (withoutPlural.length > 3 && /[dtpg]$/.test(withoutPlural)) {
      variants.add(withoutPlural.slice(0, -1));
    }
    return variants;
  }

  function levenshtein(left, right) {
    const a = String(left || "");
    const b = String(right || "");
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    const current = Array(b.length + 1).fill(0);
    for (let row = 1; row <= a.length; row += 1) {
      current[0] = row;
      for (let column = 1; column <= b.length; column += 1) {
        current[column] = Math.min(
          previous[column] + 1,
          current[column - 1] + 1,
          previous[column - 1] + (a[row - 1] === b[column - 1] ? 0 : 1)
        );
      }
      for (let column = 0; column <= b.length; column += 1) previous[column] = current[column];
    }
    return previous[b.length];
  }

  function characterSimilarity(left, right) {
    const a = phoneticBase(left);
    const b = phoneticBase(right);
    if (!a || !b) return 0;
    return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
  }

  function substitutionCost(referenceWord, spokenWord) {
    const reference = normalizeWord(referenceWord);
    const spoken = normalizeWord(spokenWord);
    if (reference === spoken) return 0;
    const referenceVariants = phoneticVariants(reference);
    const spokenVariants = phoneticVariants(spoken);
    if ([...referenceVariants].some((variant) => spokenVariants.has(variant))) return 0.12;
    const similarity = characterSimilarity(reference, spoken);
    const sameOpening = phoneticBase(reference).slice(0, 1) === phoneticBase(spoken).slice(0, 1);
    if (sameOpening && similarity >= 0.88) return 0.2;
    if (sameOpening && similarity >= 0.75) return 0.4;
    if (sameOpening && similarity >= 0.64) return 0.62;
    return 1;
  }

  function phraseAliases(words) {
    const joined = words.map(normalizeWord).join("").replace(/'/g, "");
    const reduced = joined
      .replace(/^ilya$/, "ya")
      .replace(/^tuas$/, "tas")
      .replace(/^jesais$/, "jsais")
      .replace(/^jenesais$/, "jnesais");
    const aliases = new Set([joined, reduced, phoneticBase(joined), phoneticBase(reduced)]);
    const clockTime = clockTimeAlias(words);
    if (clockTime) aliases.add(clockTime);
    phoneticVariants(joined).forEach((variant) => aliases.add(variant));
    phoneticVariants(reduced).forEach((variant) => aliases.add(variant));
    aliases.delete("");
    return aliases;
  }

  function frenchNumberValue(values) {
    const units = {
      zero: 0, un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5,
      six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11,
      douze: 12, treize: 13, quatorze: 14, quinze: 15, seize: 16
    };
    const tens = { vingt: 20, trente: 30, quarante: 40, cinquante: 50, soixante: 60 };
    const parts = values
      .flatMap((value) => normalizeWord(value).split("-"))
      .filter((value) => value && value !== "et");
    if (parts.length === 1 && /^\d{1,2}$/.test(parts[0])) return Number(parts[0]);
    if (parts.length === 1 && Object.prototype.hasOwnProperty.call(units, parts[0])) return units[parts[0]];
    if (parts.length === 1 && Object.prototype.hasOwnProperty.call(tens, parts[0])) return tens[parts[0]];
    if (parts.length === 2 && Object.prototype.hasOwnProperty.call(tens, parts[0]) && Object.prototype.hasOwnProperty.call(units, parts[1])) {
      return tens[parts[0]] + units[parts[1]];
    }
    return null;
  }

  function clockTimeAlias(words) {
    const normalized = words.map(normalizeWord).filter(Boolean);
    if (normalized.length === 1) {
      const numeric = normalized[0].match(/^(\d{1,2})h(\d{1,2})$/);
      if (numeric) return `clock-${Number(numeric[1])}-${Number(numeric[2])}`;
    }
    const hourIndex = normalized.findIndex((word) => word === "heure" || word === "heures");
    if (hourIndex < 1 || hourIndex >= normalized.length - 1) return "";
    const hours = frenchNumberValue(normalized.slice(0, hourIndex));
    const minutes = frenchNumberValue(normalized.slice(hourIndex + 1));
    return hours === null || minutes === null ? "" : `clock-${hours}-${minutes}`;
  }

  function groupedSubstitutionCost(referenceWords, spokenWords) {
    const referenceAliases = phraseAliases(referenceWords);
    const spokenAliases = phraseAliases(spokenWords);
    if ([...referenceAliases].some((variant) => spokenAliases.has(variant))) return 0.12;
    const joinedReference = referenceWords.join("");
    const joinedSpoken = spokenWords.join("");
    return Math.min(1, substitutionCost(joinedReference, joinedSpoken) + 0.08);
  }

  function align(reference, spoken) {
    const rows = reference.length + 1;
    const columns = spoken.length + 1;
    const matrix = Array.from({ length: rows }, () => Array(columns).fill(0));
    const back = Array.from({ length: rows }, () => Array(columns).fill(null));
    for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
    for (let column = 0; column < columns; column += 1) matrix[0][column] = column;
    for (let row = 1; row < rows; row += 1) back[row][0] = { row: row - 1, column: 0, referenceCount: 1, spokenCount: 0, cost: 1 };
    for (let column = 1; column < columns; column += 1) back[0][column] = { row: 0, column: column - 1, referenceCount: 0, spokenCount: 1, cost: 1 };
    for (let row = 1; row < rows; row += 1) {
      for (let column = 1; column < columns; column += 1) {
        const candidates = [
          { value: matrix[row - 1][column] + 1, row: row - 1, column, referenceCount: 1, spokenCount: 0, cost: 1 },
          { value: matrix[row][column - 1] + 1, row, column: column - 1, referenceCount: 0, spokenCount: 1, cost: 1 },
          { value: matrix[row - 1][column - 1] + substitutionCost(reference[row - 1], spoken[column - 1]), row: row - 1, column: column - 1, referenceCount: 1, spokenCount: 1, cost: substitutionCost(reference[row - 1], spoken[column - 1]) }
        ];
        for (let referenceCount = 1; referenceCount <= Math.min(3, row); referenceCount += 1) {
          for (let spokenCount = 1; spokenCount <= Math.min(3, column); spokenCount += 1) {
            if (referenceCount === spokenCount || (referenceCount > 1 && spokenCount > 1)) continue;
            const cost = groupedSubstitutionCost(
              reference.slice(row - referenceCount, row),
              spoken.slice(column - spokenCount, column)
            );
            candidates.push({
              value: matrix[row - referenceCount][column - spokenCount] + cost,
              row: row - referenceCount,
              column: column - spokenCount,
              referenceCount,
              spokenCount,
              cost
            });
          }
        }
        const best = candidates.reduce((winner, candidate) => candidate.value < winner.value ? candidate : winner);
        matrix[row][column] = best.value;
        back[row][column] = best;
      }
    }

    let row = reference.length;
    let column = spoken.length;
    let matches = 0;
    let accepted = 0;
    const states = Array(reference.length).fill("is-missed");
    while (row > 0 || column > 0) {
      const step = back[row][column];
      if (!step) break;
      if (step.referenceCount > 0 && step.spokenCount > 0) {
        const firstReference = row - step.referenceCount;
        if (step.cost === 0 && step.referenceCount === 1 && step.spokenCount === 1) {
          states[firstReference] = "is-correct";
          matches += 1;
        } else if (step.cost <= ACCEPTED_COST) {
          for (let index = firstReference; index < row; index += 1) states[index] = "is-accepted";
          matches += step.referenceCount;
          accepted += step.referenceCount;
        }
      }
      row = step.row;
      column = step.column;
    }
    return { distance: matrix[reference.length][spoken.length], matches, accepted, states };
  }

  function wordTimings(words) {
    return (Array.isArray(words) ? words : [])
      .map((word) => ({
        start: finiteNumber(word && word.start),
        end: finiteNumber(word && word.end),
        probability: finiteNumber(word && word.probability),
        text: String((word && (word.text || word.word)) || "").trim()
      }))
      .filter((word) => word.text && word.start !== null && word.end !== null && word.end >= word.start);
  }

  function speechDurationSeconds(words, recordedDurationMs) {
    const timed = wordTimings(words);
    if (timed.length) {
      const first = Math.min(...timed.map((word) => word.start));
      const last = Math.max(...timed.map((word) => word.end));
      if (last - first >= 0.5) return last - first;
    }
    return Math.max(1, (Number(recordedDurationMs) || 1000) / 1000);
  }

  function rhythmScore(wordsPerMinute) {
    const wpm = Number(wordsPerMinute) || 0;
    if (wpm >= 85 && wpm <= 190) return 100;
    if (wpm >= 65 && wpm < 85) return clamp(70 + ((wpm - 65) / 20) * 30);
    if (wpm >= 45 && wpm < 65) return clamp(45 + ((wpm - 45) / 20) * 25);
    if (wpm > 190 && wpm <= 220) return clamp(100 - ((wpm - 190) / 30) * 25);
    if (wpm > 220 && wpm <= 260) return clamp(75 - ((wpm - 220) / 40) * 25);
    return 45;
  }

  function confidenceSummary(words) {
    const probabilities = (Array.isArray(words) ? words : [])
      .map((word) => finiteNumber(word && word.probability))
      .filter((value) => value !== null && value >= 0 && value <= 1);
    if (!probabilities.length) return { average: null, lowShare: null };
    return {
      average: probabilities.reduce((sum, value) => sum + value, 0) / probabilities.length,
      lowShare: probabilities.filter((value) => value < 0.48).length / probabilities.length
    };
  }

  function assess(options) {
    const referenceText = String(options && options.referenceText || "");
    const transcript = String(options && options.transcript || "").trim();
    const referenceWords = tokens(referenceText);
    const spoken = tokens(transcript);
    const words = Array.isArray(options && options.words) ? options.words : [];
    const audio = options && options.audio || {};
    const durationSeconds = finiteNumber(audio.duration_seconds);
    const rms = finiteNumber(audio.rms);
    const peak = finiteNumber(audio.peak);
    const clientInputLevel = finiteNumber(options && options.maxInputLevel);
    const languageProbability = finiteNumber(options && options.languageProbability);
    const confidence = confidenceSummary(words);
    const coverage = referenceWords.length ? spoken.length / referenceWords.length : 0;
    const uncertaintyReasons = [];
    const flagUncertainty = (reason, message) => {
      if (!uncertaintyReasons.some((item) => item.reason === reason)) {
        uncertaintyReasons.push({ reason, message });
      }
    };
    const quality = {
      averageConfidence: confidence.average === null ? null : clamp(confidence.average * 100),
      languageProbability: languageProbability === null ? null : clamp(languageProbability * 100),
      rms,
      peak,
      clientInputLevel,
      durationSeconds,
      speechDurationSeconds: null
    };

    if (!spoken.length) {
      flagUncertainty("no_speech", "aucun mot français n'a été reconnu");
    }
    if (durationSeconds !== null && durationSeconds < 0.9) {
      flagUncertainty("too_short", "l'enregistrement est très court");
    }
    if ((rms !== null && rms < 0.0025) || (peak !== null && peak < 0.012)) {
      flagUncertainty("weak_signal", "le signal du microphone est faible");
    }
    if (rms === null && peak === null && clientInputLevel !== null && clientInputLevel < 0.004) {
      flagUncertainty("weak_signal", "le navigateur a détecté un signal faible");
    }
    if (languageProbability !== null && languageProbability < 0.35) {
      flagUncertainty("language_uncertain", "le français a été identifié avec peu de certitude");
    }

    const aligned = align(referenceWords, spoken);
    const rawAccuracy = referenceWords.length || spoken.length
      ? 1 - aligned.distance / Math.max(referenceWords.length, spoken.length)
      : 0;
    if (confidence.average !== null && confidence.average < 0.34) {
      flagUncertainty("recognition_uncertain", "la transcription automatique a une faible confiance");
    }
    if (confidence.average !== null && confidence.lowShare > 0.65 && rawAccuracy < 0.42) {
      flagUncertainty("recognition_uncertain", "plusieurs mots ont été reconnus avec une faible confiance");
    }
    if (referenceWords.length >= 6 && coverage < 0.22 && confidence.average !== null && confidence.average < 0.58) {
      flagUncertainty("insufficient_evidence", "seule une petite partie de la lecture a été reconnue");
    }

    const speechSeconds = speechDurationSeconds(words, options && options.recordedDurationMs);
    quality.speechDurationSeconds = Math.round(speechSeconds * 100) / 100;
    const wpm = spoken.length / Math.max(1 / 60, speechSeconds / 60);
    const accuracy = clamp(rawAccuracy * 100);
    const completeness = clamp(aligned.matches / Math.max(1, referenceWords.length) * 100);
    const fluency = spoken.length ? rhythmScore(wpm) : 0;
    const overall = clamp(accuracy * 0.55 + completeness * 0.35 + fluency * 0.10);
    const uncertain = uncertaintyReasons.length > 0;
    quality.uncertaintyReasons = uncertaintyReasons.map((item) => item.reason);
    const uncertaintyMessage = uncertain
      ? `Résultat indicatif : ${uncertaintyReasons[0].message}. La reconnaissance automatique est incertaine; vous pouvez continuer ou refaire l'essai.`
      : "";

    return {
      provisional: true,
      uncertain,
      uncertaintyReasons,
      uncertaintyMessage,
      spoken,
      referenceWords,
      aligned,
      wpm,
      accuracy,
      completeness,
      fluency,
      overall,
      quality
    };
  }

  function validateRecordingEvidence(options) {
    const transcript = String(options && options.transcript || "").trim();
    if (tokens(transcript).length) return { ok: true, reason: "", message: "" };

    const audio = options && options.audio || {};
    const durationSeconds = finiteNumber(audio.duration_seconds);
    const recordedDurationMs = finiteNumber(options && options.recordedDurationMs);
    const rms = finiteNumber(audio.rms);
    const peak = finiteNumber(audio.peak);
    const weakSignal = (rms !== null && rms < 0.0025) || (peak !== null && peak < 0.012);
    const tooShort = (durationSeconds !== null && durationSeconds < 0.9)
      || (durationSeconds === null && recordedDurationMs !== null && recordedDurationMs < 900);

    if (weakSignal) {
      return {
        ok: false,
        reason: "weak_signal",
        message: "Le microphone n'a pas capt\u00e9 une voix suffisamment forte. V\u00e9rifiez le microphone choisi et recommencez."
      };
    }
    if (tooShort) {
      return {
        ok: false,
        reason: "too_short",
        message: "L'enregistrement est trop court pour corriger la prononciation. Lisez toute la phrase puis arr\u00eatez le micro."
      };
    }
    return {
      ok: false,
      reason: "no_speech",
      message: "Aucune parole exploitable n'a \u00e9t\u00e9 reconnue. \u00c9coutez l'enregistrement, puis rapprochez-vous du microphone et recommencez."
    };
  }

  function preferredMimeType() {
    if (!root || !root.MediaRecorder) return "";
    return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4;codecs=mp4a.40.2", "audio/mp4"]
      .find((type) => root.MediaRecorder.isTypeSupported(type)) || "";
  }

  function supportedAudioConstraints(deviceId) {
    const requested = root.JaraMicPermissions?.audioConstraints(deviceId) || {
      echoCancellation: { ideal: true },
      noiseSuppression: { ideal: true },
      autoGainControl: { ideal: true },
      channelCount: { ideal: 1 }
    };
    const supported = root.navigator.mediaDevices?.getSupportedConstraints?.() || {};
    const filtered = {};
    Object.entries(requested).forEach(([key, value]) => {
      if (key === "deviceId" || supported[key] !== false) filtered[key] = value;
    });
    return filtered;
  }

  function recordCalibrationSample(stream) {
    return new Promise((resolve, reject) => {
      const mimeType = preferredMimeType();
      let recorder;
      try {
        recorder = mimeType ? new root.MediaRecorder(stream, { mimeType }) : new root.MediaRecorder(stream);
      } catch (error) {
        reject(error);
        return;
      }
      const chunks = [];
      let timeout = null;
      recorder.ondataavailable = (event) => { if (event.data && event.data.size) chunks.push(event.data); };
      recorder.onerror = (event) => reject(event.error || new Error("Enregistrement impossible."));
      recorder.onstop = () => {
        if (timeout) root.clearTimeout(timeout);
        const type = mimeType || recorder.mimeType || "audio/webm";
        const blob = new Blob(chunks, { type });
        if (!blob.size) reject(new Error("Aucun son n'a été enregistré."));
        else resolve(blob);
      };
      recorder.start(200);
      timeout = root.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 3200);
    });
  }

  const calibration = {
    ready: false,
    busy: false,
    panel: null,
    status: null,
    button: null,
    playback: null,
    objectUrl: "",
    isReady() { return this.ready; },
    reset(message) {
      this.ready = false;
      if (this.panel) this.panel.classList.remove("is-ready", "is-error");
      if (this.status) this.status.textContent = message || "Test requis avant la première lecture.";
      if (this.button) this.button.innerHTML = '<i class="bi bi-soundwave"></i> Tester pendant 3 s';
    }
  };

  function calibrationResult(payload) {
    const transcript = String(payload && payload.text || "").trim();
    const spoken = tokens(transcript);
    const audio = payload && payload.audio || {};
    const rms = finiteNumber(audio.rms);
    const peak = finiteNumber(audio.peak);
    const confidence = confidenceSummary(payload && payload.words);
    if (!spoken.length) return { ok: false, message: "Le micro capte du son, mais la parole n'est pas assez claire. Rapprochez l'appareil et recommencez." };
    if ((rms !== null && rms < 0.0025) || (peak !== null && peak < 0.012)) return { ok: false, message: "Signal trop faible. Rapprochez le microphone et parlez avec votre volume habituel." };
    if (confidence.average !== null && confidence.average < 0.34) return { ok: false, message: "La voix a été captée, mais reste difficile à reconnaître. Réduisez le bruit ambiant et recommencez." };
    if (peak !== null && peak >= 0.995) return { ok: true, warning: true, message: "Microphone prêt, mais le signal est très fort. Éloignez légèrement l'appareil pendant la lecture." };
    return { ok: true, message: "Microphone prêt. Le signal et la reconnaissance sont suffisants pour commencer." };
  }

  async function runCalibration() {
    if (!root || calibration.busy) return;
    const micButton = root.document.getElementById("micButton");
    const stopButton = root.document.getElementById("stopButton");
    const recordStatus = root.document.getElementById("recordStatus");
    const recordHelp = root.document.querySelector(".record-help");
    const unsupported = root.document.getElementById("unsupported");
    const microphoneSelect = root.document.getElementById("microphoneSelect");
    const permissions = root.JaraMicPermissions;
    let stream = null;
    calibration.busy = true;
    calibration.button.disabled = true;
    calibration.panel.classList.remove("is-ready", "is-error");
    calibration.status.textContent = "Préparation du microphone…";
    try {
      const ready = permissions?.ensureReady
        ? await permissions.ensureReady({ language: "fr", micButton, stopButton, recordStatus, recordHelp, unsupported })
        : true;
      if (!ready) throw new Error("Autorisez le microphone, puis relancez le test.");
      permissions?.beforeRequest?.({ language: "fr", recordStatus, recordHelp });
      stream = await root.navigator.mediaDevices.getUserMedia({
        audio: supportedAudioConstraints(microphoneSelect && microphoneSelect.value),
        video: false
      });
      permissions?.markActive?.({ language: "fr", stream, recordHelp, microphoneSelect });
      const settings = stream.getAudioTracks()[0]?.getSettings?.() || {};
      calibration.button.innerHTML = '<i class="bi bi-record-circle"></i> Parlez maintenant';
      calibration.status.textContent = "Dites : « Bonjour, je teste mon microphone. »";
      const blob = await recordCalibrationSample(stream);
      if (calibration.objectUrl) root.URL.revokeObjectURL(calibration.objectUrl);
      calibration.objectUrl = root.URL.createObjectURL(blob);
      calibration.playback.src = calibration.objectUrl;
      calibration.playback.hidden = false;
      calibration.status.textContent = "Vérification du signal…";
      const response = await root.fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": blob.type || "audio/webm" },
        body: blob
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Erreur du serveur (${response.status}).`);
      const result = calibrationResult(payload);
      calibration.ready = result.ok;
      calibration.panel.classList.toggle("is-ready", result.ok && !result.warning);
      calibration.panel.classList.toggle("is-error", !result.ok || result.warning);
      calibration.status.textContent = result.message;
      calibration.button.innerHTML = result.ok
        ? '<i class="bi bi-arrow-repeat"></i> Tester à nouveau'
        : '<i class="bi bi-arrow-repeat"></i> Refaire le test';
      if (recordStatus) recordStatus.textContent = result.ok ? "Microphone vérifié. Vous pouvez commencer la lecture." : "Microphone à régler avant la lecture.";
      if (recordHelp && settings.sampleRate) recordHelp.textContent = `Microphone vérifié à ${Math.round(settings.sampleRate / 1000)} kHz. L'échantillon de test n'est pas enregistré.`;
    } catch (error) {
      calibration.ready = false;
      calibration.panel.classList.add("is-error");
      calibration.status.textContent = error.message || "Le test du microphone n'a pas pu être terminé.";
      calibration.button.innerHTML = '<i class="bi bi-arrow-repeat"></i> Refaire le test';
      if (!permissions?.handleError?.(error, { language: "fr", recordStatus, recordHelp, microphoneSelect })) {
        if (recordStatus) recordStatus.textContent = "Le test du microphone n'a pas pu être terminé.";
      }
    } finally {
      if (stream) stream.getTracks().forEach((track) => track.stop());
      calibration.busy = false;
      calibration.button.disabled = false;
    }
  }

  function installCalibration() {
    if (!root || calibration.panel) return calibration;
    const recordZone = root.document.querySelector(".record-zone");
    const micButton = root.document.getElementById("micButton");
    if (!recordZone || !micButton) return calibration;

    const panel = root.document.createElement("section");
    panel.className = "mic-calibration";
    panel.setAttribute("aria-labelledby", "micCalibrationTitle");
    panel.innerHTML = `
      <div class="mic-calibration-copy">
        <i class="bi bi-phone-vibrate" aria-hidden="true"></i>
        <div><strong id="micCalibrationTitle">Vérification du microphone</strong><span>Un test court évite qu'un signal faible produise un résultat injuste.</span></div>
      </div>
      <button type="button" class="action-button mic-calibration-button"><i class="bi bi-soundwave"></i> Tester pendant 3 s</button>
      <p class="mic-calibration-status" aria-live="polite">Test requis avant la première lecture.</p>
      <audio class="mic-calibration-playback" controls hidden></audio>
      <small>L'échantillon est analysé par le serveur local et n'est pas conservé.</small>
    `;
    const levelMeter = root.document.querySelector(".level-meter");
    (levelMeter || root.document.getElementById("microphoneSelect")?.closest(".microphone-picker"))?.insertAdjacentElement("afterend", panel);
    if (!panel.isConnected) recordZone.insertBefore(panel, micButton);
    calibration.panel = panel;
    calibration.status = panel.querySelector(".mic-calibration-status");
    calibration.button = panel.querySelector(".mic-calibration-button");
    calibration.playback = panel.querySelector(".mic-calibration-playback");
    calibration.button.addEventListener("click", runCalibration);
    root.document.getElementById("microphoneSelect")?.addEventListener("change", () => calibration.reset("Microphone modifié : refaites le test avant de lire."));

    const legend = root.document.querySelector(".legend");
    if (legend && !legend.querySelector(".accepted")) {
      legend.insertAdjacentHTML("beforeend", '<span><i class="accepted"></i> variante sonore acceptée</span>');
    }
    const results = root.document.getElementById("results");
    if (results) {
      const eyebrow = results.querySelector(".eyebrow");
      if (eyebrow) eyebrow.textContent = "Estimation automatique provisoire";
      if (!results.querySelector(".assessment-provisional-note")) {
        results.insertAdjacentHTML("beforeend", '<p class="assessment-provisional-note"><i class="bi bi-person-check-fill"></i> Cette estimation s’appuie sur la transcription. Elle ne remplace pas l’écoute et la validation du professeur.</p>');
      }
    }
    return calibration;
  }

  if (root && root.document) {
    root.document.addEventListener("click", (event) => {
      const button = event.target && event.target.closest && event.target.closest("#micButton");
      if (!button || calibration.ready) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      installCalibration();
      if (calibration.status) calibration.status.textContent = "Effectuez d'abord le test de trois secondes.";
      calibration.panel?.scrollIntoView({ behavior: "smooth", block: "center" });
      calibration.button?.focus();
    }, true);
    const schedule = typeof root.queueMicrotask === "function" ? root.queueMicrotask.bind(root) : (callback) => root.setTimeout(callback, 0);
    schedule(installCalibration);
  }

  return {
    assess,
    align,
    calibration,
    calibrationResult,
    characterSimilarity,
    confidenceSummary,
    normalizeWord,
    phoneticVariants,
    rhythmScore,
    substitutionCost,
    tokens,
    validateRecordingEvidence
  };
});
