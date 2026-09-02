(() => {
  "use strict";
  const GRADEBOOK_API = "/api/intermediate2/grades";
  const data = window.Intermediate2TechnologyFunctions,
    devices = data.devices,
    $ = (id) => document.getElementById(id);
  const ui = {
    roster: $("rouletteRoster"),
    status: $("rouletteStatus"),
    studentWheel: $("studentWheel"),
    deviceWheel: $("deviceWheel"),
    studentCount: $("studentCount"),
    deviceCount: $("deviceCount"),
    studentResult: $("studentResult"),
    deviceResult: $("deviceResult"),
    reveal: $("deviceReveal"),
    image: $("rouletteDeviceImage"),
    list: $("manualDeviceList"),
    history: $("rouletteHistory"),
  };
  const state = {
    students: [],
    studentPool: [],
    devicePool: devices.slice(),
    student: null,
    device: null,
    spinning: false,
    studentRotation: 0,
    deviceRotation: 0,
    rounds: [],
  };
  const esc = (text) =>
    String(text).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function setStatus(text) {
    ui.status.textContent = text;
  }
  function names(value) {
    const seen = new Set();
    return String(value)
      .split(/\r?\n|,/)
      .map((x) => x.trim())
      .filter(
        (x) => x && !seen.has(x.toLowerCase()) && seen.add(x.toLowerCase()),
      );
  }
  function stored(key, provider) {
    try {
      const value = JSON.parse(
        sessionStorage.getItem(key) || localStorage.getItem(key) || "null",
      );
      return value &&
        value.credential &&
        (!value.exp || Date.now() / 1000 <= Number(value.exp))
        ? Object.assign({ provider }, value)
        : null;
    } catch (_) {
      return null;
    }
  }
  function activeUser() {
    return (
      stored("jaralingua_google_user", "google") ||
      stored("jaralingua_microsoft_user", "microsoft") ||
      stored("jaralingua_local_user", "local")
    );
  }
  function loadNames(list) {
    if (!list.length) {
      setStatus("Enter at least one student name, or load the Intermediate 2 roster.");
      return;
    }
    state.students = list.slice();
    reset();
  }
  async function loadCourseRoster() {
    const user = activeUser();
    if (!user) {
      setStatus("Sign in with the teacher account first, then load the Intermediate 2 roster.");
      return;
    }
    const button = $("loadCourseRoster");
    button.disabled = true;
    setStatus("Loading all Intermediate English Course 2 student names…");
    try {
      const response = await fetch(GRADEBOOK_API, {
        headers: {
          Authorization: `Bearer ${user.credential}`,
          "X-Jaralingua-Auth-Provider": user.provider || "google",
        },
        cache: "no-store",
      });
      const gradebook = await response.json().catch(() => ({}));
      if (!response.ok || !["admin", "teacher"].includes(gradebook.role)) {
        throw new Error("staff_only");
      }
      const roster = names(
        (gradebook.students || [])
          .map((student) => String(student.fullName || ""))
          .join("\n"),
      );
      if (!roster.length) throw new Error("no_roster");
      ui.roster.value = roster.join("\n");
      loadNames(roster);
      setStatus(`${roster.length} Intermediate English Course 2 names loaded. Only names are used on this device.`);
    } catch (_) {
      setStatus("The course roster could not load. Use the Intermediate 2 teacher account, or paste the class list.");
    } finally {
      button.disabled = false;
    }
  }
  function wheel(element, label, count) {
    element.innerHTML = `<strong>${label}<br>${count}</strong>`;
  }
  function render() {
    wheel(ui.studentWheel, "STUDENT", state.studentPool.length);
    wheel(ui.deviceWheel, "DEVICE", state.devicePool.length);
    ui.studentCount.textContent = state.studentPool.length;
    ui.deviceCount.textContent = state.devicePool.length;
    ui.studentResult.innerHTML = state.student
      ? `<strong>${esc(state.student)}</strong><p>Selected student</p>`
      : "<strong>Waiting for a student</strong>";
    ui.deviceResult.innerHTML = state.device
      ? "<strong>Image selected</strong><p>Look at the image. Name it first, then say what it is used for.</p>"
      : "<strong>Waiting for a device image</strong><p>Spin the roulette to get the next visual prompt.</p>";
    ui.list.innerHTML = state.devicePool
      .map(
        (item) => {
          const number = devices.indexOf(item) + 1;
          return `<button type="button" data-device="${item.id}" aria-label="Select device image ${number}"><img src="${item.image}" alt="" /><span>${String(number).padStart(2, "0")}</span></button>`;
        },
      )
      .join("");
    ui.list
      .querySelectorAll("button")
      .forEach((button) =>
        button.addEventListener("click", () =>
          selectDevice(
            state.devicePool.find((item) => item.id === button.dataset.device),
          ),
        ),
      );
    ui.history.innerHTML = state.rounds.length
      ? state.rounds
          .map(
            (round, index) =>
              `<tr><td>${index + 1}</td><td>${esc(round.student)}</td><td><img class="tg-history-device" src="${round.image}" alt="" /></td></tr>`,
          )
          .join("")
      : '<tr><td colspan="3">No completed round yet.</td></tr>';
  }
  function spin(kind) {
    const pool = kind === "student" ? state.studentPool : state.devicePool;
    if (
      !pool.length ||
      state.spinning ||
      (kind === "student" ? state.student : state.device)
    )
      return;
    state.spinning = true;
    const index = Math.floor(Math.random() * pool.length),
      target = kind === "student" ? ui.studentWheel : ui.deviceWheel;
    const rotationKey = kind === "student" ? "studentRotation" : "deviceRotation";
    state[rotationKey] += 1440 + 360 - (index / pool.length) * 360;
    target.style.transform = `rotate(${state[rotationKey]}deg)`;
    setStatus("The roulette is selecting…");
    window.setTimeout(() => {
      const item = pool.splice(index, 1)[0];
      if (kind === "student") state.student = item;
      else selectDevice(item, true);
      state.spinning = false;
      render();
      setStatus("Selection ready. The learner names the image, then says what it is used for.");
    }, 2500);
  }
  function selectDevice(device, removed = false) {
    if (!device || state.device) return;
    if (!removed)
      state.devicePool = state.devicePool.filter(
        (item) => item.id !== device.id,
      );
    state.device = device;
    ui.image.src = device.image;
    ui.image.alt = "";
    ui.reveal.hidden = false;
    render();
  }
  function finish() {
    if (!state.student || !state.device) {
      setStatus("Select one student and one device before closing the round.");
      return;
    }
    state.rounds.push({ student: state.student, image: state.device.image });
    state.student = null;
    state.device = null;
    ui.reveal.hidden = true;
    render();
    setStatus("Round saved on this device only. Spin again when ready.");
  }
  function reset() {
    state.studentPool = state.students.slice();
    state.devicePool = devices.slice();
    state.student = state.device = null;
    state.studentRotation = 0;
    state.deviceRotation = 0;
    ui.studentWheel.style.transform = "rotate(0deg)";
    ui.deviceWheel.style.transform = "rotate(0deg)";
    state.rounds = [];
    ui.reveal.hidden = true;
    render();
    setStatus(
      state.students.length
        ? "Roster ready. Spin the student roulette."
        : "Paste student names, then load the roster.",
    );
  }
  $("loadCourseRoster").addEventListener("click", loadCourseRoster);
  $("loadRoster").addEventListener("click", () => loadNames(names(ui.roster.value)));
  $("spinStudent").addEventListener("click", () => spin("student"));
  $("spinDevice").addEventListener("click", () => spin("device"));
  $("finishRound").addEventListener("click", finish);
  $("resetRoulette").addEventListener("click", reset);
  render();
})();
