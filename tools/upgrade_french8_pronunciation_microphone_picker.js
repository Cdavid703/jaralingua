const fs = require("fs");
const path = require("path");

const clientPath = path.join(__dirname, "..", "assets", "js", "french8-pronunciation.js");
let client = fs.readFileSync(clientPath, "utf8");

client = client.replace(
  '  const audioConsent = document.getElementById("audioConsent");\n',
  `  const audioConsent = document.getElementById("audioConsent");
  const microphonePicker = document.createElement("label");
  microphonePicker.className = "microphone-picker";
  microphonePicker.innerHTML = '<span><i class="bi bi-mic"></i> Microphone utilisé</span><select id="microphoneSelect" aria-label="Choisir le microphone"><option value="">Microphone par défaut</option></select>';
  microphonePicker.style.cssText = "display:grid;gap:.35rem;max-width:620px;margin:0 auto 1rem;text-align:left;color:#15345d;font-weight:900";
  micButton.parentNode.insertBefore(microphonePicker, micButton);
  const microphoneSelect = document.getElementById("microphoneSelect");
  microphoneSelect.style.cssText = "width:100%;padding:.65rem .8rem;border:1px solid rgba(31,78,140,.22);border-radius:10px;background:#fff;color:#15345d";

  async function refreshMicrophones() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const currentValue = microphoneSelect.value;
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
      microphoneSelect.innerHTML = '<option value="">Microphone par défaut</option>' + devices.map((device, index) => '<option value="' + device.deviceId + '">' + (device.label || ('Microphone ' + (index + 1))) + '</option>').join("");
      if ([...microphoneSelect.options].some((option) => option.value === currentValue)) microphoneSelect.value = currentValue;
    } catch (_error) {
      microphoneSelect.innerHTML = '<option value="">Microphone par défaut</option>';
    }
  }
`
);

client = client.replace(
  '      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 }, video: false });',
  '      const audioConstraints = { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 };\n      if (microphoneSelect.value) audioConstraints.deviceId = { exact: microphoneSelect.value };\n      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false });\n      const activeTrack = mediaStream.getAudioTracks()[0];\n      recordHelp.textContent = activeTrack?.label ? `Microphone actif : ${activeTrack.label}` : "Microphone actif";\n      await refreshMicrophones();\n      const activeDeviceId = activeTrack?.getSettings?.().deviceId;\n      if (activeDeviceId && [...microphoneSelect.options].some((option) => option.value === activeDeviceId)) microphoneSelect.value = activeDeviceId;'
);

client = client.replace(
  '  renderReference();\n  if (location.protocol === "file:") {',
  '  refreshMicrophones();\n  navigator.mediaDevices?.addEventListener?.("devicechange", refreshMicrophones);\n  renderReference();\n  if (location.protocol === "file:") {'
);

if (!client.includes("microphoneSelect") || !client.includes("Microphone actif")) {
  throw new Error("Microphone picker was not installed.");
}
fs.writeFileSync(clientPath, client, "utf8");
console.log("French 8 microphone selector installed.");
