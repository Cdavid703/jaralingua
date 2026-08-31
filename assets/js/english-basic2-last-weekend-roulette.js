(function () {
  "use strict";

  const COLORS = ["#f6d365", "#60a5fa", "#34d399", "#f97316", "#f9a8d4", "#a7f3d0", "#facc15", "#93c5fd", "#fb7185", "#c4b5fd"];
  const state = { originalNames: [], pool: [], currentStudent: "", history: [], rotation: 0, spinning: false, seconds: 900, timerRunning: false, timerId: null };
  const $ = function (id) { return document.getElementById(id); };
  const cleanName = function (value) { return String(value || "").trim(); };

  function uniqueNames(names) {
    const seen = new Set();
    return names.map(cleanName).filter(function (name) {
      const key = name.toLowerCase();
      if (!name || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function readCurrentUser() {
    if (window.JaraLinguaAuth && window.JaraLinguaAuth.getUser) return window.JaraLinguaAuth.getUser();
    const keys = ["jaralingua_google_user", "jaralingua_microsoft_user", "jaralingua_local_user"];
    for (let index = 0; index < keys.length; index += 1) {
      try {
        const user = JSON.parse(sessionStorage.getItem(keys[index]) || localStorage.getItem(keys[index]) || "null");
        if (user && user.credential) return user;
      } catch (_error) {
        /* Ignore a malformed saved session and continue. */
      }
    }
    return null;
  }

  function setRosterStatus(message, type) {
    const node = $("rosterStatus");
    node.textContent = message;
    node.className = "roulette-status" + (type ? " " + type : "");
  }

  function renderWheel() {
    const wheel = $("studentWheel");
    const names = state.pool.length ? state.pool : ["Ready"];
    const slice = 360 / names.length;
    const gradient = names.map(function (_name, index) {
      return COLORS[index % COLORS.length] + " " + (index * slice) + "deg " + ((index + 1) * slice) + "deg";
    }).join(", ");
    wheel.innerHTML = '<div class="student-wheel-center">STUDENT</div>';
    wheel.style.background = "conic-gradient(" + gradient + ")";
    wheel.style.transform = "rotate(" + state.rotation + "deg)";

    names.slice(0, 24).forEach(function (name, index) {
      const angle = index * slice + slice / 2;
      const label = document.createElement("span");
      label.className = "wheel-label";
      label.textContent = name.length > 16 ? name.slice(0, 15) + "…" : name;
      label.style.transform = "rotate(" + angle + "deg) translateY(-" + (wheel.clientWidth ? Math.max(82, wheel.clientWidth * 0.33) : 104) + "px) rotate(-" + angle + "deg)";
      wheel.appendChild(label);
    });
  }

  function renderHistory() {
    const body = $("roundHistory");
    if (!state.history.length) {
      body.innerHTML = '<tr><td colspan="3" class="history-empty">No participant has been selected yet.</td></tr>';
      return;
    }
    body.innerHTML = state.history.map(function (round) {
      return "<tr><td>" + round.number + "</td><td>" + escapeHtml(round.student) + "</td><td>First, Then, After that, Finally + one phrasal verb + one idiom</td></tr>";
    }).join("");
  }

  function render() {
    renderWheel();
    $("spinStudentBtn").disabled = state.spinning || !state.pool.length || !!state.currentStudent;
    $("resetRosterBtn").disabled = !state.originalNames.length || state.spinning;
    $("endTurnBtn").disabled = !state.currentStudent || state.spinning;
    $("cancelTurnBtn").disabled = !state.currentStudent || state.spinning;
    $("selectedStudent").textContent = state.currentStudent || "Waiting for the roulette";
    $("selectedStudentNote").textContent = state.currentStudent
      ? "Tell your weekend story aloud. Include every connector, one phrasal verb, and one idiomatic expression."
      : "Prepare with the class, then let the roulette select the next speaker.";
    $("remainingCount").textContent = state.pool.length + " student" + (state.pool.length === 1 ? "" : "s") + " ready";
    renderHistory();
  }

  async function loadRoster() {
    const user = readCurrentUser();
    if (!user || !user.credential) {
      setRosterStatus("Sign in with the authorized teacher or administrator account first.", "error");
      if (window.JaraLinguaAuth && window.JaraLinguaAuth.openPanel) window.JaraLinguaAuth.openPanel();
      return;
    }

    setRosterStatus("Loading the active Course 2 roster…");
    $("loadRosterBtn").disabled = true;
    try {
      const response = await fetch("/api/basic2/grades", {
        headers: {
          Authorization: "Bearer " + user.credential,
          "X-Jaralingua-Auth-Provider": user.provider || "google"
        }
      });
      if (!response.ok) throw new Error("roster_request_failed");
      const payload = await response.json();
      if (!(payload.role === "admin" || payload.role === "teacher") || !Array.isArray(payload.students)) {
        throw new Error("teacher_access_required");
      }
      const names = uniqueNames(payload.students.map(function (student) { return student.fullName; }));
      if (!names.length) throw new Error("empty_roster");
      state.originalNames = names.slice();
      state.pool = names.slice();
      state.currentStudent = "";
      state.history = [];
      state.rotation = 0;
      setRosterStatus(names.length + " active Course 2 students are ready for the roulette.", "good");
    } catch (error) {
      const message = error && error.message === "teacher_access_required"
        ? "This button is available only to the authorized Course 2 teacher or administrator account."
        : "The roster could not be loaded. Check the account connection and try again.";
      setRosterStatus(message, "error");
    } finally {
      $("loadRosterBtn").disabled = false;
      render();
    }
  }

  function spinStudent() {
    if (state.spinning || !state.pool.length || state.currentStudent) return;
    const index = Math.floor(Math.random() * state.pool.length);
    const slice = 360 / state.pool.length;
    const target = 360 - (index * slice + slice / 2);
    state.spinning = true;
    state.rotation += 1440 + target - (state.rotation % 360);
    render();
    window.setTimeout(function () {
      state.currentStudent = state.pool[index];
      state.spinning = false;
      render();
    }, 2350);
  }

  function endTurn() {
    if (!state.currentStudent) return;
    state.history.push({ number: state.history.length + 1, student: state.currentStudent });
    state.pool = state.pool.filter(function (name) { return name !== state.currentStudent; });
    state.currentStudent = "";
    if (!state.pool.length) setRosterStatus("Every loaded student has participated. Reset participants to begin again.", "good");
    render();
  }

  function cancelTurn() {
    if (!state.currentStudent) return;
    state.currentStudent = "";
    render();
  }

  function resetParticipants() {
    state.pool = state.originalNames.slice();
    state.currentStudent = "";
    state.history = [];
    state.rotation = 0;
    setRosterStatus(state.pool.length + " active Course 2 students are ready for a new roulette round.", "good");
    render();
  }

  function updateTimer() {
    const minutes = Math.floor(state.seconds / 60);
    const seconds = state.seconds % 60;
    $("timerDisplay").textContent = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    $("timerToggle").textContent = state.timerRunning ? "Pause timer" : (state.seconds === 0 ? "Start again" : "Start timer");
  }

  function toggleTimer() {
    if (state.timerRunning) {
      window.clearInterval(state.timerId);
      state.timerId = null;
      state.timerRunning = false;
      updateTimer();
      return;
    }
    if (state.seconds === 0) state.seconds = 900;
    state.timerRunning = true;
    updateTimer();
    state.timerId = window.setInterval(function () {
      state.seconds -= 1;
      if (state.seconds <= 0) {
        state.seconds = 0;
        window.clearInterval(state.timerId);
        state.timerId = null;
        state.timerRunning = false;
        setRosterStatus("Preparation time is over. Start the roulette when the class is ready.", "good");
      }
      updateTimer();
    }, 1000);
  }

  function resetTimer() {
    if (state.timerId) window.clearInterval(state.timerId);
    state.timerId = null;
    state.timerRunning = false;
    state.seconds = 900;
    updateTimer();
  }

  let modelAudio = null;
  function playModel() {
    if (!modelAudio) {
      modelAudio = new Audio("audio/unit4/last-weekend-roulette/teacher-model-last-weekend.mp3");
      modelAudio.addEventListener("ended", function () {
        $("playModelAudio").textContent = "Listen to the model";
        $("modelAudioStatus").textContent = "Use the images to demonstrate the order.";
      });
    }
    if (modelAudio.paused) {
      modelAudio.play().then(function () {
        $("playModelAudio").textContent = "Pause model";
        $("modelAudioStatus").textContent = "The teacher model is playing.";
      }).catch(function () {
        $("modelAudioStatus").textContent = "Audio is unavailable. You can still read the model aloud.";
      });
      return;
    }
    modelAudio.pause();
    $("playModelAudio").textContent = "Listen to the model";
    $("modelAudioStatus").textContent = "Model paused.";
  }

  $("loadRosterBtn").addEventListener("click", loadRoster);
  $("resetRosterBtn").addEventListener("click", resetParticipants);
  $("spinStudentBtn").addEventListener("click", spinStudent);
  $("endTurnBtn").addEventListener("click", endTurn);
  $("cancelTurnBtn").addEventListener("click", cancelTurn);
  $("timerToggle").addEventListener("click", toggleTimer);
  $("timerReset").addEventListener("click", resetTimer);
  $("playModelAudio").addEventListener("click", playModel);
  window.addEventListener("resize", render);
  updateTimer();
  render();
}());
