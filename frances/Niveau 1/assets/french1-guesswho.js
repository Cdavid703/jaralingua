(() => {
  "use strict";
  const characters = ["Bibliothécaire","Professeur","Artisan","Fleuriste","Guide touristique","Musicien","Vétérinaire","Horloger","Bijoutière","Barista","Autrice","Chercheuse","Éducateur canin","Chef","Pompier","Policière"];
  const state = { students: [], characters: [...characters], currentStudent: "", currentCharacter: "", history: [], studentRotation: 0, characterRotation: 0, spinning: false };
  const byId = (id) => document.getElementById(id);
  const uniqueNames = (value) => {
    const seen = new Set();
    return value.split(/\n|,/).map((name) => name.trim()).filter((name) => {
      const key = name.toLocaleLowerCase("fr");
      if (!name || seen.has(key)) return false;
      seen.add(key); return true;
    });
  };
  const chips = (values, empty) => values.length ? values.map((value) => `<span class="guesswho-chip">${value}</span>`).join("") : `<p class="guesswho-empty-message">${empty}</p>`;

  function render() {
    byId("studentsLeftCount").textContent = state.students.length;
    byId("charactersLeftCount").textContent = state.characters.length;
    byId("studentPoolPill").textContent = state.students.length;
    byId("characterPoolPill").textContent = state.characters.length;
    byId("studentPoolList").innerHTML = chips(state.students, "Aucun élève actif.");
    byId("characterPoolList").innerHTML = chips(state.characters, "Tous les personnages ont participé.");
    byId("currentStudentName").textContent = state.currentStudent || "—";
    byId("currentCharacterName").textContent = state.currentCharacter || "—";
    byId("spinStudent").disabled = state.spinning || !state.students.length || Boolean(state.currentStudent);
    byId("spinCharacter").disabled = state.spinning || !state.currentStudent || Boolean(state.currentCharacter) || !state.characters.length;
    byId("foundCharacter").disabled = !state.currentStudent || !state.currentCharacter || state.spinning;
    byId("cancelRound").disabled = !state.currentStudent || state.spinning;
    byId("studentStatus").textContent = state.students.length ? (state.currentStudent ? "Élève sélectionné. Lancez la roulette personnage." : "Prêt : lancez la roulette élève.") : "Chargez les élèves.";
    byId("characterStatus").textContent = !state.currentStudent ? "Choisissez d’abord un élève." : state.currentCharacter ? "Le personnage secret est affiché." : "Prêt : l’élève doit se retourner.";
    byId("guesswhoHistoryBody").innerHTML = state.history.map((round, index) => `<tr><td>${index + 1}</td><td>${round.student}</td><td>${round.character}</td></tr>`).join("");
  }

  function loadNames() {
    const names = uniqueNames(byId("studentNamesInput").value);
    if (!names.length) { alert("Ajoutez au moins un nom d’élève."); return; }
    state.students = names; state.currentStudent = ""; state.currentCharacter = ""; state.history = [];
    state.characters = [...characters]; render();
  }

  function spin(kind) {
    if (state.spinning) return;
    const isStudent = kind === "student";
    const pool = isStudent ? state.students : state.characters;
    if (!pool.length || (!isStudent && !state.currentStudent)) return;
    state.spinning = true; render();
    const wheel = byId(isStudent ? "studentWheel" : "characterWheel");
    const key = isStudent ? "studentRotation" : "characterRotation";
    state[key] += 1440 + Math.floor(Math.random() * 720);
    wheel.style.transform = `rotate(${state[key]}deg)`;
    setTimeout(() => {
      const index = Math.floor(Math.random() * pool.length);
      const selected = pool[index];
      if (isStudent) state.currentStudent = selected;
      else state.currentCharacter = selected;
      state.spinning = false; render();
    }, 2200);
  }

  function finishRound() {
    if (!state.currentStudent || !state.currentCharacter) return;
    state.history.push({ student: state.currentStudent, character: state.currentCharacter });
    state.students = state.students.filter((name) => name !== state.currentStudent);
    state.characters = state.characters.filter((name) => name !== state.currentCharacter);
    state.currentStudent = ""; state.currentCharacter = ""; render();
  }

  function cancelRound() { state.currentStudent = ""; state.currentCharacter = ""; render(); }
  function reset() {
    state.students = []; state.characters = [...characters]; state.currentStudent = ""; state.currentCharacter = ""; state.history = []; state.studentRotation = 0; state.characterRotation = 0;
    byId("studentNamesInput").value = ""; byId("studentWheel").style.transform = "rotate(0deg)"; byId("characterWheel").style.transform = "rotate(0deg)"; render();
  }

  byId("importNames").onclick = () => byId("studentExcelInput").click();
  byId("loadNames").onclick = loadNames;
  byId("sampleNames").onclick = () => { byId("studentNamesInput").value = ["Ana","Paul","Sofia","Lucas","Chloé","Hugo","Inès","Malik"].join("\n"); loadNames(); };
  byId("resetGame").onclick = reset;
  byId("spinStudent").onclick = () => spin("student");
  byId("spinCharacter").onclick = () => spin("character");
  byId("foundCharacter").onclick = finishRound;
  byId("cancelRound").onclick = cancelRound;
  if (window.JaraLinguaRosterImport) window.JaraLinguaRosterImport.setup({ fileInputId: "studentExcelInput", textAreaId: "studentNamesInput", statusId: "rosterImportStatus", onNamesLoaded: loadNames });
  render();
})();
