"use strict";

window.JaraLinguaUnit6GrammarStorybookData = {
  endpoint: "/api/intermediate/unit6-grammar-storybook/submit",
  pages: [
    {
      title: "Thursday Starts To Fill Up",
      image: "../../assets/img/english-intermediate/unit-6/unit-6-grammar-storybook-page-1.webp",
      alt: "Olivia and Marcus reviewing a busy Thursday in a professional music studio",
      caption: "Olivia has intentions, confirmed appointments, and one recording day that needs protection.",
      paragraphs: [
        "Olivia Reed has a busy Thursday, and her schedule is becoming difficult to manage. In the morning, she tells Marcus that she {{0}} record the acoustic version of her new song this week.",
        "Marcus opens the calendar and notices that Olivia {{1}} the producer at ten o'clock on Thursday. After that, the studio session {{2}} at noon, and the musicians {{3}} at the studio before lunch."
      ],
      note: "Page 1 contrasts a prior plan with confirmed future arrangements."
    },
    {
      title: "The Interview Problem",
      image: "../../assets/img/english-intermediate/unit-6/unit-6-grammar-storybook-page-2.webp",
      alt: "Marcus points to a tablet calendar while Olivia checks a message about a radio interview",
      caption: "A radio interview creates a real conflict, so the language shifts toward advice and options.",
      paragraphs: [
        "The problem is the radio interview. Olivia {{4}} the radio host at two thirty, but the studio is across town. Marcus thinks she {{5}} protect her recording day because she needs time to eat, travel, and rest.",
        "He says she {{6}} move the interview to Friday morning. Olivia is not sure because the photo shoot is still {{7}}, and she already has a lot {{8}} this week."
      ],
      note: "Page 2 adds advice, possibility, and two scheduling expressions."
    },
    {
      title: "Priorities On The Table",
      image: "../../assets/img/english-intermediate/unit-6/unit-6-grammar-storybook-page-3.webp",
      alt: "Olivia and Marcus moving colored schedule cards to build a realistic agenda",
      caption: "They separate what is necessary, what is optional, and what can be inserted carefully.",
      paragraphs: [
        "Marcus reminds her that she {{9}} do every interview before the concert. She {{10}} keep the producer meeting and the recording session because they are confirmed.",
        "She also {{11}} be at her parents' house by six because she promised them dinner. Olivia asks whether they can {{12}} a short break between the recording session and the family dinner."
      ],
      note: "Page 3 checks obligation, softer advice, and fitting one event into a crowded agenda."
    },
    {
      title: "A Realistic Final Agenda",
      image: "../../assets/img/english-intermediate/unit-6/unit-6-grammar-storybook-page-4.webp",
      alt: "Olivia calmly reviewing a final agenda while Marcus sends an updated schedule",
      caption: "The final decision is clear, polite, and practical enough for the whole team.",
      paragraphs: [
        "After a short discussion, Olivia decides, \"I {{13}} call the radio host now.\" Marcus answers, \"Good. I {{14}} send the updated schedule so everyone is {{15}}.\"",
        "Moving the interview will {{16}} Thursday afternoon and help Olivia finish the song calmly. By the end of the meeting, the agenda is not perfect, but it is realistic."
      ],
      note: "Page 4 uses will for a decision made now and closes with useful scheduling language."
    }
  ],
  blanks: [
    { id: 0, category: "going to", options: ["is going to", "is meeting", "will"], correct: 0, review: "Blank 1: review prior plans and intentions with be going to." },
    { id: 1, category: "arrangements", options: ["is going to meet", "is meeting", "will meet"], correct: 1, review: "Blank 2: review present continuous for confirmed future arrangements." },
    { id: 2, category: "scheduled events", options: ["starts", "is going to start", "will start"], correct: 0, review: "Blank 3: review scheduled events with the simple present." },
    { id: 3, category: "arrangements", options: ["are arriving", "are going to arrive", "arrive"], correct: 0, review: "Blank 4: review confirmed arrangements with present continuous." },
    { id: 4, category: "arrangements", options: ["is meeting", "is going to meet", "meets"], correct: 0, review: "Blank 5: review future arrangements with present continuous." },
    { id: 5, category: "advice", options: ["could", "should", "has to"], correct: 1, review: "Blank 6: review strong but respectful advice with should." },
    { id: 6, category: "possibility", options: ["could", "ought to", "has to"], correct: 0, review: "Blank 7: review possible solutions with could." },
    { id: 7, category: "idiom", options: ["on the same page", "up in the air", "on her plate"], correct: 1, review: "Blank 8: review up in the air for something not decided yet." },
    { id: 8, category: "idiom", options: ["on her plate", "up in the air", "on the same page"], correct: 0, review: "Blank 9: review on her plate for many responsibilities." },
    { id: 9, category: "obligation", options: ["does not have to", "should not", "will not"], correct: 0, review: "Blank 10: review no obligation with does not have to." },
    { id: 10, category: "advice", options: ["ought to", "could", "will"], correct: 0, review: "Blank 11: review ought to for advisable action." },
    { id: 11, category: "obligation", options: ["has to", "could", "is going to"], correct: 0, review: "Blank 12: review external obligation with has to." },
    { id: 12, category: "phrasal verb", options: ["put off", "fit in", "free up"], correct: 1, review: "Blank 13: review fit in for finding space in a schedule." },
    { id: 13, category: "decision now", options: ["am going to", "am calling", "will"], correct: 2, review: "Blank 14: review will for a decision made at the moment of speaking." },
    { id: 14, category: "decision now", options: ["will", "am going to", "am sending"], correct: 0, review: "Blank 15: review will for an immediate decision or offer." },
    { id: 15, category: "idiom", options: ["on the same page", "up in the air", "on your plate"], correct: 0, review: "Blank 16: review on the same page for shared understanding." },
    { id: 16, category: "phrasal verb", options: ["put off", "free up", "fit in"], correct: 1, review: "Blank 17: review free up for making time available." }
  ]
};

(() => {
  const data = window.JaraLinguaUnit6GrammarStorybookData;
  const state = {
    page: -1,
    answers: Array(data.blanks.length).fill(null),
    checked: false,
    submitted: false
  };

  const elements = {
    bookCard: document.querySelector("[data-storybook-card]"),
    previousButton: document.querySelector("[data-previous-page]"),
    nextButton: document.querySelector("[data-next-page]"),
    checkButton: document.querySelector("[data-check-story]"),
    reviewButton: document.querySelector("[data-review-marked]"),
    resetButton: document.querySelector("[data-reset-story]"),
    progressBar: document.querySelector("[data-progress-bar]"),
    pageCounter: document.querySelector("[data-page-counter]"),
    blankCounter: document.querySelector("[data-blank-counter]"),
    scoreText: document.querySelector("[data-score-text]"),
    feedback: document.querySelector("[data-feedback]"),
    reviewList: document.querySelector("[data-review-list]"),
    reflection: document.querySelector("[data-reflection]"),
    wordCount: document.querySelector("[data-word-count]"),
    deliveryForm: document.querySelector("[data-delivery-form]"),
    sendButton: document.querySelector("[data-send-teacher]"),
    deliveryStatus: document.querySelector("[data-delivery-status]")
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function wordCount(value) {
    const cleaned = String(value || "").trim();
    return cleaned ? cleaned.split(/\s+/).length : 0;
  }

  function blankSelectMarkup(blankId) {
    const blank = data.blanks[blankId];
    const value = state.answers[blankId];
    const statusClass = state.checked && value !== null
      ? (value === blank.correct ? " is-correct" : " is-review")
      : "";
    const options = blank.options.map((option, optionIndex) => {
      const selected = value === optionIndex ? " selected" : "";
      return `<option value="${optionIndex}"${selected}>${escapeHtml(option)}</option>`;
    }).join("");
    return `
      <select class="blank-select${statusClass}" data-blank="${blankId}" aria-label="Blank ${blankId + 1}: ${escapeHtml(blank.category)}">
        <option value="">Choose...</option>
        ${options}
      </select>
    `;
  }

  function paragraphMarkup(paragraph) {
    return `<p>${paragraph.replace(/\{\{(\d+)\}\}/g, (_, id) => blankSelectMarkup(Number(id)))}</p>`;
  }

  function renderCover() {
    elements.bookCard.className = "storybook-card is-cover";
    elements.bookCard.innerHTML = `
      <div class="book-cover" role="group" aria-label="Olivia's Schedule Storybook cover">
        <div class="book-cover-edge" aria-hidden="true"></div>
        <div class="book-cover-content">
          <span class="book-series">Unit 6 Grammar Mini-Book</span>
          <h3>Olivia's Schedule Storybook</h3>
          <p>Open the book, read four short pages, choose each grammar decision, revise marked blanks, and send the final note to the teacher.</p>
          <div class="book-cover-tags">
            <span>17 dropdown blanks</span>
            <span>4 story pages</span>
            <span>teacher follow-up 0%</span>
          </div>
          <button type="button" class="u6g-button primary" data-cover-open>Open the book</button>
        </div>
      </div>
    `;
    elements.previousButton.disabled = true;
    elements.nextButton.disabled = false;
    elements.nextButton.textContent = "Open book";
    elements.pageCounter.textContent = "Cover";
    update();
  }

  function renderPage() {
    if (state.page < 0) {
      renderCover();
      return;
    }
    const page = data.pages[state.page];
    elements.bookCard.className = "storybook-card is-open";
    elements.bookCard.innerHTML = `
      <figure class="storybook-figure">
        <img src="${page.image}" alt="${escapeHtml(page.alt)}" />
        <figcaption>${escapeHtml(page.caption)}</figcaption>
      </figure>
      <div class="storybook-copy">
        <span class="page-label">Page ${state.page + 1} of ${data.pages.length}</span>
        <h3>${escapeHtml(page.title)}</h3>
        <div class="story-text">${page.paragraphs.map(paragraphMarkup).join("")}</div>
        <div class="page-note">${escapeHtml(page.note)}</div>
      </div>
    `;
    elements.previousButton.disabled = state.page === 0;
    elements.nextButton.disabled = state.page === data.pages.length - 1;
    elements.nextButton.textContent = "Next page";
    elements.pageCounter.textContent = `Page ${state.page + 1} of ${data.pages.length}`;
    update();
  }

  function setFeedback(message, type) {
    elements.feedback.className = "feedback-box" + (type ? " " + type : "");
    elements.feedback.textContent = message;
  }

  function completionCount() {
    return state.answers.filter(answer => answer !== null).length;
  }

  function incorrectIndexes() {
    if (!state.checked) return [];
    return state.answers
      .map((answer, index) => answer === data.blanks[index].correct ? null : index)
      .filter(index => index !== null);
  }

  function currentGrade() {
    const correct = state.answers.filter((answer, index) => answer === data.blanks[index].correct).length;
    return Math.round((correct / data.blanks.length) * 500) / 100;
  }

  function updateReviewList() {
    const incorrect = incorrectIndexes();
    if (!state.checked || !incorrect.length) {
      elements.reviewList.classList.remove("is-visible");
      elements.reviewList.innerHTML = "";
      return;
    }
    const items = incorrect.map(index => `<li>${escapeHtml(data.blanks[index].review)}</li>`).join("");
    elements.reviewList.innerHTML = `<strong>Review these decisions. Correct answers stay hidden.</strong><ul>${items}</ul>`;
    elements.reviewList.classList.add("is-visible");
  }

  function updateSendState() {
    const words = wordCount(elements.reflection.value);
    const ready = state.checked && completionCount() === data.blanks.length && words >= 30 && words <= 120 && !state.submitted;
    elements.sendButton.disabled = !ready;
  }

  function update() {
    const complete = completionCount();
    const percentage = Math.round((complete / data.blanks.length) * 100);
    elements.progressBar.style.width = percentage + "%";
    elements.blankCounter.textContent = `${complete} of ${data.blanks.length} blanks complete`;
    elements.scoreText.textContent = state.checked ? `Reference grade: ${currentGrade().toFixed(2)} / 5.0` : "Reference grade: -- / 5.0";
    elements.checkButton.disabled = complete !== data.blanks.length;
    elements.reviewButton.disabled = !state.checked || !incorrectIndexes().length;
    updateReviewList();
    updateSendState();
  }

  function goToFirstIncorrect() {
    const first = incorrectIndexes()[0];
    if (first == null) return;
    const pageIndex = data.pages.findIndex(page => page.paragraphs.some(paragraph => paragraph.includes(`{{${first}}}`)));
    if (pageIndex >= 0) {
      state.page = pageIndex;
      renderPage();
      setFeedback("The first marked decision is visible on this page. Choose another option and check again before sending.", "error");
      elements.bookCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function readStoredUser(key) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) {
        sessionStorage.removeItem(key);
        return null;
      }
      return saved;
    } catch (error) {
      sessionStorage.removeItem(key);
      return null;
    }
  }

  function authHeaders() {
    const google = readStoredUser("jaralingua_google_user");
    if (google && google.credential) {
      return {
        Authorization: "Bearer " + google.credential,
        "X-Jaralingua-Auth-Provider": "google",
        "Content-Type": "application/json"
      };
    }
    const microsoft = readStoredUser("jaralingua_microsoft_user");
    if (microsoft && microsoft.credential) {
      return {
        Authorization: "Bearer " + microsoft.credential,
        "X-Jaralingua-Auth-Provider": "microsoft",
        "Content-Type": "application/json"
      };
    }
    const local = readStoredUser("jaralingua_local_user");
    if (local && local.credential) {
      return {
        Authorization: "Bearer " + local.credential,
        "X-Jaralingua-Auth-Provider": "local",
        "Content-Type": "application/json"
      };
    }
    return null;
  }

  function requestSignIn() {
    const trigger = document.querySelector("[data-auth-toggle]");
    if (trigger) trigger.click();
  }

  function setDelivery(message, type) {
    elements.deliveryStatus.className = "delivery-status show" + (type ? " " + type : "");
    elements.deliveryStatus.textContent = message;
  }

  elements.bookCard.addEventListener("change", event => {
    const select = event.target.closest("[data-blank]");
    if (!select) return;
    const blankId = Number(select.dataset.blank);
    state.answers[blankId] = select.value === "" ? null : Number(select.value);
    if (state.checked) {
      state.checked = false;
      setFeedback("Decision updated. Check the story again before sending it to the teacher.", "");
    }
    state.submitted = false;
    elements.sendButton.textContent = "Send to teacher";
    renderPage();
  });

  elements.bookCard.addEventListener("click", event => {
    const coverButton = event.target.closest("[data-cover-open]");
    if (!coverButton) return;
    state.page = 0;
    renderPage();
    setFeedback("The book is open. Complete the dropdowns on each page, then check the full story.", "");
  });

  elements.previousButton.addEventListener("click", () => {
    if (state.page > 0) {
      state.page -= 1;
      renderPage();
    }
  });

  elements.nextButton.addEventListener("click", () => {
    if (state.page < data.pages.length - 1) {
      state.page += 1;
      renderPage();
    }
  });

  elements.checkButton.addEventListener("click", () => {
    if (completionCount() !== data.blanks.length) {
      setFeedback("Complete every blank before checking the story.", "error");
      return;
    }
    state.checked = true;
    renderPage();
    const incorrect = incorrectIndexes();
    if (incorrect.length) {
      setFeedback(`Story checked. ${incorrect.length} decision(s) are marked for review. Choose another option on those blanks; correct answers are not revealed.`, "error");
    } else {
      setFeedback("Story checked. All grammar decisions are accurate. Write the final note and send it to the teacher.", "success");
    }
  });

  elements.reviewButton.addEventListener("click", goToFirstIncorrect);

  elements.resetButton.addEventListener("click", () => {
    state.answers = Array(data.blanks.length).fill(null);
    state.checked = false;
    state.submitted = false;
    state.page = -1;
    elements.reflection.value = "";
    elements.wordCount.textContent = "0 words - write 30 to 120 words";
    elements.deliveryStatus.className = "delivery-status";
    setFeedback("Start from the cover. Open the book, complete the dropdowns, and check the full story when all decisions are filled.", "");
    renderPage();
    document.querySelector("#storybook").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  elements.reflection.addEventListener("input", () => {
    const words = wordCount(elements.reflection.value);
    elements.wordCount.textContent = `${words} words - write 30 to 120 words`;
    if (state.submitted) {
      state.submitted = false;
      elements.sendButton.textContent = "Send to teacher";
      setDelivery("Your note changed. Send the updated version when you are ready.", "");
    }
    updateSendState();
  });

  elements.deliveryForm.addEventListener("submit", event => {
    event.preventDefault();
    const words = wordCount(elements.reflection.value);
    if (!state.checked || completionCount() !== data.blanks.length) {
      setDelivery("Check the complete story before sending it to the teacher.", "error");
      return;
    }
    if (words < 30 || words > 120) {
      setDelivery("Your final note must be between 30 and 120 words.", "error");
      return;
    }
    const headers = authHeaders();
    if (!headers) {
      setDelivery("Sign in first. Your grammar storybook must be linked to your student record before it can be sent to the teacher.", "error");
      requestSignIn();
      return;
    }
    elements.sendButton.disabled = true;
    setDelivery("Sending your grammar storybook to the teacher...", "");
    fetch(data.endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        answers: state.answers,
        finalReflection: elements.reflection.value.trim(),
        clientDate: new Date().toISOString().slice(0, 10)
      })
    }).then(response => response.json().then(body => ({ ok: response.ok, status: response.status, body })))
      .then(result => {
        if (!result.ok) {
          elements.sendButton.disabled = false;
          if (result.status === 403) {
            setDelivery("Your account is signed in, but it is not linked to an Intermediate English student record. Ask the teacher to check your email in the gradebook.", "error");
          } else if (result.body && result.body.error === "text_too_short") {
            setDelivery("Your final note is too short. Write at least 30 words before sending.", "error");
          } else if (result.body && result.body.error === "text_too_long") {
            setDelivery("Your final note is too long. Keep it under 120 words before sending.", "error");
          } else {
            setDelivery("The grammar storybook could not be saved. Please reload and try again.", "error");
          }
          return;
        }
        state.submitted = true;
        const incorrect = Array.isArray(result.body.incorrectQuestions) ? result.body.incorrectQuestions : [];
        setDelivery(`Submitted to teacher. Reference grade: ${Number(result.body.grade).toFixed(2)} / 5.0. ${incorrect.length ? "Decisions marked for review: " + incorrect.join(", ") + "." : "All decisions were accurate."} Gradebook weight: 0%.`, "success");
        elements.sendButton.textContent = "Submitted to teacher";
        updateSendState();
      })
      .catch(() => {
        elements.sendButton.disabled = false;
        setDelivery("Network error. The activity was not submitted.", "error");
      });
  });

  renderPage();
})();
