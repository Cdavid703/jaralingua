(function () {
  "use strict";
  var questions = [
    { prompt: "I hope ___ the scholarship committee replies this week.", options: ["of", "that", "to"], answer: 1, family: "hope + clause", feedback: "Use <strong>hope + clause</strong> when you name the event you want to happen. <em>That</em> is possible here and can also be omitted: <em>I hope the committee replies.</em>" },
    { prompt: "We hope ___ the community project before December.", options: ["of completing", "that complete", "to complete"], answer: 2, family: "hope to + verb", feedback: "Use <strong>hope to + base verb</strong> when the person who hopes will perform the action." },
    { prompt: "The volunteers hope ___ a clear answer by Friday.", options: ["for", "to", "of"], answer: 0, family: "hope for + noun", feedback: "Use <strong>hope for + noun phrase</strong>: <em>hope for a clear answer</em>." },
    { prompt: "Salomé dreams ___ urban spaces that are safer for families.", options: ["to designing", "of designing", "that designing"], answer: 1, family: "dream of + -ing", feedback: "Use <strong>dream of + -ing</strong> for an aspiration or long-term imagined future." },
    { prompt: "Her dream ___ a small neighborhood bookstore is becoming more realistic.", options: ["to running", "that run", "of running"], answer: 2, family: "dream of + -ing", feedback: "After the noun <em>dream</em>, use <strong>of + -ing</strong> to name the aspiration." },
    { prompt: "I wish I ___ more time to consider the offer.", options: ["had", "have", "will have"], answer: 0, family: "wish + past form", feedback: "Use <strong>wish + past form</strong> for a present reality you want to be different. The real situation is that the speaker does not have enough time." },
    { prompt: "They wish they ___ attend the workshop in person.", options: ["can", "could", "to could"], answer: 1, family: "wish + could", feedback: "Use <strong>wish + could + base verb</strong> for an ability or possibility that is unavailable now." },
    { prompt: "I wish my neighbor ___ the music down tonight.", options: ["turns", "to turn", "would turn"], answer: 2, family: "wish + would", feedback: "Use <strong>wish + subject + would + verb</strong> for another person's behavior that you want to change." },
    { prompt: "After missing the deadline, I wish I ___ earlier.", options: ["had applied", "applied", "would apply"], answer: 0, family: "wish + past perfect", feedback: "Use <strong>wish + had + past participle</strong> for a different past. The speaker did not apply earlier." },
    { prompt: "Before her interview, we all ___ .", options: ["wished her to be lucky", "wished her luck", "made her a wish"], answer: 1, family: "wish someone luck", feedback: "<strong>Wish someone luck</strong> is a common fixed social expression before an important event." },
    { prompt: "Our goal is ___ a transition plan before the meeting.", options: ["of build", "building to", "to build"], answer: 2, family: "goal is to + verb", feedback: "Use <strong>goal is to + base verb</strong> to state the result you intend to achieve." },
    { prompt: "Her long-term goal of ___ a team motivates her to study management.", options: ["managing", "to managing", "that manage"], answer: 0, family: "goal of + -ing", feedback: "Use <strong>goal of + -ing</strong> when the goal is followed by an activity." },
    { prompt: "I would like ___ before I make a final decision.", options: ["to some advice", "some advice", "of some advice"], answer: 1, family: "would like + noun", feedback: "Use <strong>would like + noun</strong> for a polite request: <em>I would like some advice.</em>" },
    { prompt: "Would you like ___ the consequences with us?", options: ["discussing to", "of discussing", "to discuss"], answer: 2, family: "would like to + verb", feedback: "Use <strong>would like to + base verb</strong> for a polite invitation or desire." },
    { prompt: "Before blowing out the candles, everyone made ___ .", options: ["a wish", "a hope", "a dream of"], answer: 0, family: "make a wish", feedback: "<strong>Make a wish</strong> is the fixed expression for a special desire, often connected with candles or a meaningful moment." }
  ];
  var state = { index: 0, answers: [], checked: false, active: questions.slice() };
  var questionNode = document.getElementById("grammarQuestion");
  var progressNode = document.getElementById("grammarProgress");
  var progressBar = document.getElementById("grammarProgressBar");
  var nextButton = document.getElementById("grammarNext");
  var restartButton = document.getElementById("grammarRestart");
  var resultNode = document.getElementById("grammarResult");

  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, function (character) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]; }); }
  function renderQuestion() {
    var item = state.active[state.index];
    state.checked = false;
    resultNode.hidden = true;
    nextButton.hidden = true;
    progressNode.textContent = "Question " + (state.index + 1) + " of " + state.active.length;
    progressBar.style.width = ((state.index / state.active.length) * 100) + "%";
    questionNode.innerHTML = '<article class="ie2-grammar-question-card"><div class="ie2-grammar-question-head"><span>' + escapeHtml(item.family) + '</span><strong>' + (state.index + 1) + '</strong></div><h3>' + escapeHtml(item.prompt) + '</h3><fieldset><legend>Choose one answer</legend>' + item.options.map(function (option, index) { return '<label><input type="radio" name="grammarAnswer" value="' + index + '" /><span><b>' + String.fromCharCode(65 + index) + '</b>' + escapeHtml(option) + '</span></label>'; }).join("") + '</fieldset><button class="intermediate2-button primary" type="button" id="grammarCheck">Check response</button><div class="ie2-grammar-feedback" id="grammarFeedback" aria-live="polite"></div></article>';
    document.getElementById("grammarCheck").addEventListener("click", checkAnswer);
  }
  function checkAnswer() {
    if (state.checked) return;
    var selected = questionNode.querySelector('input[name="grammarAnswer"]:checked');
    var feedback = document.getElementById("grammarFeedback");
    if (!selected) { feedback.className = "ie2-grammar-feedback is-warning"; feedback.textContent = "Choose one answer before checking."; return; }
    state.checked = true;
    var item = state.active[state.index];
    var isCorrect = Number(selected.value) === item.answer;
    state.answers.push({ item: item, correct: isCorrect });
    questionNode.querySelectorAll("input").forEach(function (input) { input.disabled = true; });
    questionNode.querySelectorAll("label").forEach(function (label, index) { label.classList.toggle("is-correct", index === item.answer); label.classList.toggle("is-incorrect", index === Number(selected.value) && !isCorrect); });
    feedback.className = "ie2-grammar-feedback " + (isCorrect ? "is-correct" : "is-incorrect");
    feedback.innerHTML = '<strong>' + (isCorrect ? "Correct." : "Not this time.") + '</strong><p>' + item.feedback + '</p>';
    nextButton.hidden = false;
    nextButton.innerHTML = state.index === state.active.length - 1 ? 'See my results <i class="bi bi-arrow-right"></i>' : 'Next question <i class="bi bi-arrow-right"></i>';
  }
  function showResult() {
    var correct = state.answers.filter(function (answer) { return answer.correct; }).length;
    var missed = state.answers.filter(function (answer) { return !answer.correct; });
    progressNode.textContent = "Challenge complete";
    progressBar.style.width = "100%";
    questionNode.innerHTML = "";
    nextButton.hidden = true;
    resultNode.hidden = false;
    resultNode.innerHTML = '<div><span>Your result</span><h3>' + correct + ' / ' + state.answers.length + '</h3><p>' + (missed.length ? 'Review the patterns below, then repeat only the questions that need another look.' : 'Excellent. You selected every Unit 2 pattern accurately.') + '</p></div><div class="ie2-grammar-result-actions">' + (missed.length ? '<button class="intermediate2-button primary" id="grammarRetryMissed" type="button">Repeat ' + missed.length + ' missed ' + (missed.length === 1 ? 'question' : 'questions') + '</button>' : '') + '<button class="intermediate2-button ghost" id="grammarRestartResult" type="button">Restart all 15</button></div>' + (missed.length ? '<ol>' + missed.map(function (answer) { return '<li><strong>' + escapeHtml(answer.item.family) + '</strong><span>' + answer.item.feedback.replace(/<[^>]+>/g, "") + '</span></li>'; }).join("") + '</ol>' : "");
    document.getElementById("grammarRestartResult").addEventListener("click", restartAll);
    var retry = document.getElementById("grammarRetryMissed");
    if (retry) retry.addEventListener("click", function () { state.active = missed.map(function (answer) { return answer.item; }); state.index = 0; state.answers = []; renderQuestion(); });
  }
  function next() { if (!state.checked) return; state.index += 1; if (state.index >= state.active.length) showResult(); else renderQuestion(); }
  function restartAll() { state.active = questions.slice(); state.index = 0; state.answers = []; renderQuestion(); }
  nextButton.addEventListener("click", next);
  restartButton.addEventListener("click", restartAll);
  renderQuestion();
}());
