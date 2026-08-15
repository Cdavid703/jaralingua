(function () {
  "use strict";
  var questions = [
    { prompt: "Choose the sentence that expresses a possible future hope.", options: ["I hope I get the scholarship.", "I hope I getting the scholarship.", "I hope getting the scholarship."], answer: 0, family: "hope + subject + verb", feedback: "<strong>Hope does not need a preposition here.</strong> Follow it directly with a subject and verb: <em>I hope I get the scholarship.</em>" },
    { prompt: "Choose the natural sentence when the same people will do the action.", options: ["We hope finishing the project by Friday.", "We hope to finish the project by Friday.", "We hope to finishing the project by Friday."], answer: 1, family: "hope to + verb", feedback: "Use <strong>hope to + base verb</strong> when the person who hopes also performs the action." },
    { prompt: "Choose the sentence that uses hope correctly after a complete subject.", options: ["I hope the interview go well.", "I hope the interview going well.", "I hope the interview goes well."], answer: 2, family: "hope + subject + verb", feedback: "Use <strong>hope + subject + verb</strong>: <em>I hope the interview goes well.</em> No preposition is needed." },
    { prompt: "Choose the natural sentence for an important aspiration.", options: ["Salomé dreams of designing safer urban spaces.", "Salomé dreams of to design safer urban spaces.", "Salomé dreams designing safer urban spaces."], answer: 0, family: "dream of + -ing", feedback: "Use <strong>dream of + -ing</strong> for an aspiration or long-term imagined future." },
    { prompt: "Choose the sentence that completes the noun dream correctly.", options: ["Her dream of run a bookstore is becoming realistic.", "Her dream of running a bookstore is becoming realistic.", "Her dream running a bookstore is becoming realistic."], answer: 1, family: "dream of + -ing", feedback: "After the noun <em>dream</em>, use <strong>of + -ing</strong> to name the aspiration." },
    { prompt: "Choose the sentence for a present reality the speaker wants to change.", options: ["I wish I have more time to consider the offer.", "I wish I will have more time to consider the offer.", "I wish I had more time to consider the offer."], answer: 2, family: "wish + past form", feedback: "Use <strong>wish + past form</strong> for a present reality you want to be different. The speaker does not have enough time now." },
    { prompt: "Choose the sentence for an ability or possibility that is unavailable now.", options: ["They wish they could attend the workshop in person.", "They wish they can attend the workshop in person.", "They wish they could to attend the workshop in person."], answer: 0, family: "wish + could", feedback: "Use <strong>wish + could + base verb</strong> for an ability or possibility that is unavailable now." },
    { prompt: "Choose the sentence about another person's behavior the speaker wants to change.", options: ["I wish my neighbor turns the music down tonight.", "I wish my neighbor would turn the music down tonight.", "I wish my neighbor would turns the music down tonight."], answer: 1, family: "wish + would", feedback: "Use <strong>wish + subject + would + verb</strong> for another person's behavior that you want to change." },
    { prompt: "Choose the sentence that regrets a different past action.", options: ["After missing the deadline, I wish I applied earlier.", "After missing the deadline, I wish I would apply earlier.", "After missing the deadline, I wish I had applied earlier."], answer: 2, family: "wish + past perfect", feedback: "Use <strong>wish + had + past participle</strong> for a different past. The speaker did not apply earlier." },
    { prompt: "Choose the natural social expression before an important interview.", options: ["We all wished her luck before the interview.", "We all wished her to be lucky before the interview.", "We all made her a wish before the interview."], answer: 0, family: "wish someone luck", feedback: "<strong>Wish someone luck</strong> is the common fixed expression before an important event." },
    { prompt: "Choose the sentence that states a planned result.", options: ["Our goal is build a transition plan before the meeting.", "Our goal is to build a transition plan before the meeting.", "Our goal is to building a transition plan before the meeting."], answer: 1, family: "goal is to + verb", feedback: "Use <strong>goal is to + base verb</strong> to state the result you intend to achieve." },
    { prompt: "Choose the sentence that names a goal as an activity.", options: ["Her long-term goal of manage a team motivates her.", "Her long-term goal to managing a team motivates her.", "Her long-term goal of managing a team motivates her."], answer: 2, family: "goal of + -ing", feedback: "Use <strong>goal of + -ing</strong> when a goal is followed by an activity." },
    { prompt: "Choose the polite request for a thing, not an action.", options: ["I would like some advice before I decide.", "I would like to advice before I decide.", "I would like an advice before I decide."], answer: 0, family: "would like + noun", feedback: "Use <strong>would like + noun</strong> for a polite request: <em>I would like some advice.</em> Advice is uncountable, so do not use <em>an advice</em>." },
    { prompt: "Choose the polite invitation to do an action.", options: ["Would you like discuss the consequences with us?", "Would you like to discuss the consequences with us?", "Would you like to discussing the consequences with us?"], answer: 1, family: "would like to + verb", feedback: "Use <strong>would like to + base verb</strong> for a polite invitation or desire." },
    { prompt: "Choose the fixed expression for a special desire before blowing out candles.", options: ["Everyone did a wish before blowing out the candles.", "Everyone made wish before blowing out the candles.", "Everyone made a wish before blowing out the candles."], answer: 2, family: "make a wish", feedback: "<strong>Make a wish</strong> is the fixed expression for a special desire, often connected with candles or a meaningful moment." }
  ];
  var questionNode = document.getElementById("grammarQuestion");
  var progressNode = document.getElementById("grammarProgress");
  var progressBar = document.getElementById("grammarProgressBar");
  var checkButton = document.getElementById("grammarCheckAll");
  var restartButton = document.getElementById("grammarRestart");
  var resultNode = document.getElementById("grammarResult");
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, function (character) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]; }); }
  function topicFor(item) {
    if (item.family.indexOf("hope") === 0) return "Hope";
    if (item.family.indexOf("dream") === 0) return "Dream";
    if (item.family.indexOf("wish") === 0) return "Wish";
    if (item.family.indexOf("goal") === 0) return "Goal";
    if (item.family.indexOf("would like") === 0) return "Would like";
    return "Make a wish";
  }
  function render() {
    resultNode.hidden = true;
    progressNode.textContent = "15 questions · choose one answer in every card";
    progressBar.style.width = "0%";
    checkButton.hidden = false;
    questionNode.innerHTML = '<div class="ie2-grammar-question-list">' + questions.map(function (item, questionIndex) { return '<article class="ie2-grammar-question-card" data-question="' + questionIndex + '"><div class="ie2-grammar-question-head"><span>' + escapeHtml(topicFor(item)) + '</span><strong>' + (questionIndex + 1) + '</strong></div><h3>' + escapeHtml(item.prompt) + '</h3><fieldset><legend>Choose one complete sentence</legend>' + item.options.map(function (option, optionIndex) { return '<label><input type="radio" name="grammarAnswer' + questionIndex + '" value="' + optionIndex + '" /><span><b>' + String.fromCharCode(65 + optionIndex) + '</b>' + escapeHtml(option) + '</span></label>'; }).join("") + '</fieldset><div class="ie2-grammar-feedback" aria-live="polite"></div></article>'; }).join("") + '</div>';
  }
  function checkAll() {
    var answered = 0, correct = 0, missed = [];
    questions.forEach(function (item, questionIndex) {
      var card = questionNode.querySelector('[data-question="' + questionIndex + '"]');
      var selected = card.querySelector('input[name="grammarAnswer' + questionIndex + '"]:checked');
      var feedback = card.querySelector(".ie2-grammar-feedback");
      card.querySelectorAll("label").forEach(function (label, optionIndex) { label.classList.remove("is-correct", "is-incorrect"); if (selected) { label.classList.toggle("is-correct", optionIndex === item.answer); label.classList.toggle("is-incorrect", optionIndex === Number(selected.value) && Number(selected.value) !== item.answer); } });
      if (!selected) { feedback.className = "ie2-grammar-feedback is-warning"; feedback.textContent = "Choose one complete sentence before checking."; return; }
      answered += 1;
      var isCorrect = Number(selected.value) === item.answer;
      if (isCorrect) correct += 1; else missed.push(item);
      feedback.className = "ie2-grammar-feedback " + (isCorrect ? "is-correct" : "is-incorrect");
      feedback.innerHTML = '<strong>' + (isCorrect ? "Correct." : "Review this pattern.") + '</strong><p>' + item.feedback + '</p>';
    });
    progressBar.style.width = ((answered / questions.length) * 100) + "%";
    if (answered !== questions.length) { progressNode.textContent = answered + " of 15 answered"; resultNode.hidden = true; questionNode.querySelector(".is-warning")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    progressNode.textContent = "15 of 15 answered";
    resultNode.hidden = false;
    resultNode.innerHTML = '<div><span>Your result</span><h3>' + correct + ' / 15</h3><p>' + (missed.length ? 'Read the feedback in the marked cards, then change any answer and check all 15 again.' : 'Excellent. You selected every Unit 2 pattern accurately.') + '</p></div>' + (missed.length ? '<ol>' + missed.map(function (item) { return '<li><strong>' + escapeHtml(item.family) + '</strong><span>' + item.feedback.replace(/<[^>]+>/g, "") + '</span></li>'; }).join("") + '</ol>' : "");
    resultNode.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function restart() { render(); document.getElementById("grammarChallenge").scrollIntoView({ behavior: "smooth", block: "start" }); }
  checkButton.addEventListener("click", checkAll);
  restartButton.addEventListener("click", restart);
  render();
}());
