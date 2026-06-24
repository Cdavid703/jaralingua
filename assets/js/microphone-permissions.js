(() => {
  "use strict";

  const TEXT = {
    en: {
      fileStatus: "The microphone does not work in file mode.",
      fileHelp: "Open this activity from the HTTPS website or from localhost.",
      fileTitle: "Local file mode detected",
      fileDetail: "Browsers block microphone access on file:// addresses.",
      httpsStatus: "Secure connection required.",
      httpsHelp: "The microphone requires HTTPS or localhost.",
      httpsTitle: "HTTPS required",
      httpsDetail: "The browser can only ask for microphone access on a secure page.",
      unsupportedStatus: "This browser does not support audio recording.",
      unsupportedHelp: "Use a recent version of Chrome, Edge, Safari or Firefox.",
      unsupportedTitle: "Browser not compatible",
      unsupportedDetail: "This activity requires getUserMedia and MediaRecorder.",
      deniedStatus: "Microphone blocked for this site.",
      deniedHelp: "The browser will not show the permission popup while this site remains blocked.",
      deniedTitle: "Microphone blocked for JaraLingua",
      deniedDetail: "Unblock the microphone in the site settings, reload the page, then try again.",
      promptHelp: "Tap the microphone: your browser should ask you to allow access.",
      readyHelp: "Microphone ready. Tap the microphone to start.",
      requestStatus: "Requesting microphone permission…",
      requestHelp: "If a permission window appears, choose Allow for JaraLingua.",
      notAllowedStatus: "The microphone is blocked or permission was not granted.",
      notAllowedHelp: "Tap the microphone again and choose Allow if the permission window appears.",
      noMicStatus: "No microphone was detected.",
      noMicHelp: "Connect a microphone or check that this device allows microphone access.",
      busyStatus: "The microphone is being used by another application.",
      busyHelp: "Close Zoom, Teams, WhatsApp, the voice recorder or any other app using the microphone.",
      unavailableStatus: "The selected microphone is not available.",
      unavailableHelp: "The selected microphone is not available. The page will use the default microphone.",
      active: "Active microphone",
      guides: {
        ios: [
          "iPhone/iPad Safari: tap AA or the site icon, then Website Settings, Microphone, Allow.",
          "If it still fails: iOS Settings > Safari > Microphone > Allow or Ask.",
          "Reload this page and tap the microphone again."
        ],
        android: [
          "Android Chrome: tap the lock icon near the address, then Permissions, Microphone, Allow.",
          "If needed: Android Settings > Apps > Chrome > Permissions > Microphone.",
          "Reload this page and tap the microphone again."
        ],
        safari: [
          "Mac Safari: Safari > Settings for This Website > Microphone > Allow.",
          "Also check System Settings > Privacy & Security > Microphone.",
          "Reload this page and tap the microphone again."
        ],
        desktop: [
          "Chrome/Edge/Brave on desktop: click the lock icon next to the address, then Microphone, Allow.",
          "Also check Windows or macOS privacy settings for browser microphone access.",
          "Reload this page and tap the microphone again."
        ],
        compatible: [
          "Android: use an updated Chrome browser.",
          "iPhone/iPad: use an updated Safari browser.",
          "PC/Mac: use Chrome, Edge, Firefox or Safari."
        ]
      }
    },
    fr: {
      fileStatus: "Le microphone ne fonctionne pas en mode fichier.",
      fileHelp: "Ouvrez cette activité depuis le site HTTPS de JaraLingua ou depuis localhost.",
      fileTitle: "Mode fichier détecté",
      fileDetail: "Les navigateurs bloquent le microphone sur les adresses file://.",
      httpsStatus: "Connexion sécurisée requise.",
      httpsHelp: "Le microphone exige HTTPS ou localhost.",
      httpsTitle: "HTTPS requis",
      httpsDetail: "Le navigateur ne peut demander l’autorisation du micro que sur une page sécurisée.",
      unsupportedStatus: "Ce navigateur ne prend pas en charge l’enregistrement audio.",
      unsupportedHelp: "Utilisez Chrome, Edge, Safari ou Firefox à jour.",
      unsupportedTitle: "Navigateur non compatible",
      unsupportedDetail: "Cette activité nécessite getUserMedia et MediaRecorder.",
      deniedStatus: "Microphone bloqué pour ce site.",
      deniedHelp: "Le navigateur ne montrera plus la fenêtre d’autorisation tant que le site restera bloqué.",
      deniedTitle: "Microphone bloqué pour JaraLingua",
      deniedDetail: "Débloquez le micro dans les paramètres du site, rechargez la page, puis réessayez.",
      promptHelp: "Touchez le micro : le navigateur doit vous demander d’autoriser l’accès.",
      readyHelp: "Microphone prêt. Touchez le micro pour commencer.",
      requestStatus: "Demande d’autorisation du microphone…",
      requestHelp: "Si une fenêtre apparaît, choisissez Autoriser pour JaraLingua.",
      notAllowedStatus: "Le microphone est bloqué ou l’autorisation n’a pas été accordée.",
      notAllowedHelp: "Touchez à nouveau le micro et choisissez Autoriser si la fenêtre apparaît.",
      noMicStatus: "Aucun microphone n’a été détecté.",
      noMicHelp: "Connectez un microphone ou vérifiez que votre appareil autorise l’accès au micro.",
      busyStatus: "Le microphone est utilisé par une autre application.",
      busyHelp: "Fermez Zoom, Teams, WhatsApp, l’enregistreur vocal ou toute autre application utilisant le micro.",
      unavailableStatus: "Le microphone sélectionné n’est pas disponible.",
      unavailableHelp: "Le microphone choisi n’est plus disponible. La page revient au micro par défaut.",
      active: "Microphone actif",
      guides: {
        ios: [
          "iPhone/iPad Safari : touchez AA ou l’icône du site, puis Réglages du site web, Microphone, Autoriser.",
          "Si le blocage continue : Réglages iOS > Safari > Microphone > Autoriser ou Demander.",
          "Rechargez cette page et touchez à nouveau le micro."
        ],
        android: [
          "Android Chrome : touchez le cadenas près de l’adresse, puis Autorisations, Microphone, Autoriser.",
          "Si nécessaire : Paramètres Android > Applications > Chrome > Autorisations > Microphone.",
          "Rechargez cette page et touchez à nouveau le micro."
        ],
        safari: [
          "Mac Safari : Safari > Réglages pour ce site web > Microphone > Autoriser.",
          "Vérifiez aussi Réglages système > Confidentialité et sécurité > Microphone.",
          "Rechargez cette page et touchez à nouveau le micro."
        ],
        desktop: [
          "Chrome/Edge/Brave sur ordinateur : cliquez sur le cadenas à gauche de l’adresse, puis Microphone, Autoriser.",
          "Vérifiez aussi les paramètres Windows ou macOS pour autoriser le micro du navigateur.",
          "Rechargez cette page et touchez à nouveau le micro."
        ],
        compatible: [
          "Android : utilisez Chrome à jour.",
          "iPhone/iPad : utilisez Safari à jour.",
          "PC/Mac : utilisez Chrome, Edge, Firefox ou Safari récent."
        ]
      }
    }
  };

  function text(language) {
    return TEXT[language] || TEXT.en;
  }

  function platformGuide(language) {
    const copy = text(language);
    const agent = navigator.userAgent || "";
    const isiOS = /iPad|iPhone|iPod/.test(agent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(agent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(agent);
    if (isiOS) return copy.guides.ios;
    if (isAndroid) return copy.guides.android;
    if (isSafari) return copy.guides.safari;
    return copy.guides.desktop;
  }

  function ensureHelpBox(recordHelp) {
    if (!recordHelp) return null;
    let box = recordHelp.parentElement?.querySelector?.(".mic-permission-help");
    if (box) return box;
    box = document.createElement("div");
    box.className = "mic-permission-help";
    box.hidden = true;
    box.style.cssText = "display:none;gap:.55rem;text-align:left;margin:1rem auto 0;max-width:720px;padding:1rem;border-radius:14px;background:#fff7df;border-left:5px solid #f9c74f;color:#5c4930;line-height:1.45";
    recordHelp.insertAdjacentElement("afterend", box);
    return box;
  }

  function showHelp(recordHelp, title, detail, guide) {
    const box = ensureHelpBox(recordHelp);
    if (!box) return;
    box.hidden = false;
    box.style.display = "grid";
    box.innerHTML = `<strong style="color:#15345d">${title}</strong><span>${detail}</span><ul style="margin:.2rem 0 0;padding-left:1.1rem">${guide.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  }

  function hideHelp(recordHelp) {
    const box = recordHelp?.parentElement?.querySelector?.(".mic-permission-help");
    if (!box) return;
    box.hidden = true;
    box.style.display = "none";
    box.innerHTML = "";
  }

  async function permissionState() {
    if (!navigator.permissions?.query) return "unknown";
    try {
      const permission = await navigator.permissions.query({ name: "microphone" });
      return permission.state || "unknown";
    } catch (_error) {
      return "unknown";
    }
  }

  function audioConstraints(deviceId) {
    const constraints = {
      echoCancellation: { ideal: true },
      noiseSuppression: { ideal: true },
      autoGainControl: { ideal: true },
      channelCount: { ideal: 1 }
    };
    if (deviceId) constraints.deviceId = { exact: deviceId };
    return constraints;
  }

  async function ensureReady(options = {}) {
    const copy = text(options.language);
    const { micButton, stopButton, recordStatus, recordHelp, unsupported, localUrl } = options;
    if (location.protocol === "file:") {
      if (unsupported) {
        unsupported.hidden = false;
        if (localUrl) unsupported.innerHTML = `<strong>${copy.fileTitle}.</strong><br>${copy.fileDetail}<br><a href="${localUrl}">Open compatible version</a>`;
      }
      if (micButton) micButton.disabled = true;
      if (stopButton) stopButton.disabled = true;
      if (recordStatus) recordStatus.textContent = copy.fileStatus;
      if (recordHelp) recordHelp.textContent = copy.fileHelp;
      showHelp(recordHelp, copy.fileTitle, copy.fileDetail, [copy.fileHelp]);
      return false;
    }
    if (!window.isSecureContext) {
      if (micButton) micButton.disabled = true;
      if (stopButton) stopButton.disabled = true;
      if (recordStatus) recordStatus.textContent = copy.httpsStatus;
      if (recordHelp) recordHelp.textContent = copy.httpsHelp;
      showHelp(recordHelp, copy.httpsTitle, copy.httpsDetail, [copy.httpsHelp]);
      return false;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      if (unsupported) unsupported.hidden = false;
      if (micButton) micButton.disabled = true;
      if (stopButton) stopButton.disabled = true;
      if (recordStatus) recordStatus.textContent = copy.unsupportedStatus;
      if (recordHelp) recordHelp.textContent = copy.unsupportedHelp;
      showHelp(recordHelp, copy.unsupportedTitle, copy.unsupportedDetail, copy.guides.compatible);
      return false;
    }
    const state = await permissionState();
    if (state === "denied") {
      if (recordStatus) recordStatus.textContent = copy.deniedStatus;
      if (recordHelp) recordHelp.textContent = copy.deniedHelp;
      showHelp(recordHelp, copy.deniedTitle, copy.deniedDetail, platformGuide(options.language));
      return false;
    }
    hideHelp(recordHelp);
    if (micButton) micButton.disabled = false;
    if (stopButton) stopButton.disabled = true;
    if (recordHelp) recordHelp.textContent = state === "prompt" ? copy.promptHelp : copy.readyHelp;
    return true;
  }

  function beforeRequest(options = {}) {
    const copy = text(options.language);
    hideHelp(options.recordHelp);
    if (options.recordStatus) options.recordStatus.textContent = copy.requestStatus;
    if (options.recordHelp) options.recordHelp.textContent = copy.requestHelp;
  }

  function markActive(options = {}) {
    const copy = text(options.language);
    const track = options.stream?.getAudioTracks?.()[0];
    if (options.recordHelp) options.recordHelp.textContent = track?.label ? `${copy.active}: ${track.label}` : `${copy.active}.`;
    const deviceId = track?.getSettings?.().deviceId;
    if (deviceId && options.microphoneSelect && [...options.microphoneSelect.options].some((option) => option.value === deviceId)) {
      options.microphoneSelect.value = deviceId;
    }
  }

  function handleError(error, options = {}) {
    const copy = text(options.language);
    const name = error?.name;
    if (!["NotAllowedError", "SecurityError", "NotFoundError", "NotReadableError", "OverconstrainedError", "NotSupportedError"].includes(name)) return false;
    const guide = platformGuide(options.language);
    if (name === "NotAllowedError") {
      if (options.recordStatus) options.recordStatus.textContent = copy.notAllowedStatus;
      if (options.recordHelp) options.recordHelp.textContent = copy.deniedHelp;
      showHelp(options.recordHelp, copy.deniedTitle, copy.deniedDetail, guide);
    } else if (name === "SecurityError") {
      if (options.recordStatus) options.recordStatus.textContent = copy.httpsStatus;
      if (options.recordHelp) options.recordHelp.textContent = copy.httpsHelp;
      showHelp(options.recordHelp, copy.httpsTitle, copy.httpsDetail, [copy.httpsHelp]);
    } else if (name === "NotFoundError") {
      if (options.recordStatus) options.recordStatus.textContent = copy.noMicStatus;
      if (options.recordHelp) options.recordHelp.textContent = copy.noMicHelp;
      showHelp(options.recordHelp, copy.noMicStatus, copy.noMicHelp, copy.guides.compatible);
    } else if (name === "NotReadableError") {
      if (options.recordStatus) options.recordStatus.textContent = copy.busyStatus;
      if (options.recordHelp) options.recordHelp.textContent = copy.busyHelp;
      showHelp(options.recordHelp, copy.busyStatus, copy.busyHelp, guide);
    } else if (name === "OverconstrainedError") {
      if (options.microphoneSelect) options.microphoneSelect.value = "";
      if (options.recordStatus) options.recordStatus.textContent = copy.unavailableStatus;
      if (options.recordHelp) options.recordHelp.textContent = copy.unavailableHelp;
      showHelp(options.recordHelp, copy.unavailableStatus, copy.unavailableHelp, guide);
    } else if (name === "NotSupportedError") {
      if (options.recordStatus) options.recordStatus.textContent = copy.unsupportedStatus;
      if (options.recordHelp) options.recordHelp.textContent = copy.unsupportedHelp;
      showHelp(options.recordHelp, copy.unsupportedTitle, copy.unsupportedDetail, copy.guides.compatible);
    }
    return true;
  }

  window.JaraMicPermissions = {
    audioConstraints,
    beforeRequest,
    ensureReady,
    handleError,
    hideHelp,
    markActive,
    permissionState
  };
})();
