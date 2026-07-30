(function () {
  let activeExpressionAudio = null;
  let activeExpressionCard = null;

  function stopExpressionAudio() {
    if (activeExpressionAudio) {
      activeExpressionAudio.pause();
      activeExpressionAudio.currentTime = 0;
    }
    if (activeExpressionCard) {
      activeExpressionCard.classList.remove("is-playing");
      activeExpressionCard.setAttribute("aria-pressed", "false");
    }
    activeExpressionAudio = null;
    activeExpressionCard = null;
  }

  function playExpressionCard(card) {
    const source = card.getAttribute("data-expression-audio");
    if (!source) return;
    if (activeExpressionCard === card) {
      stopExpressionAudio();
      return;
    }
    stopExpressionAudio();
    activeExpressionCard = card;
    activeExpressionAudio = new Audio(source);
    activeExpressionAudio.addEventListener("ended", stopExpressionAudio, { once: true });
    activeExpressionAudio.addEventListener("error", stopExpressionAudio, { once: true });
    activeExpressionAudio.play().then(function () {
      card.classList.add("is-playing");
      card.setAttribute("aria-pressed", "true");
    }).catch(stopExpressionAudio);
  }

  document.querySelectorAll("[data-expression-audio]").forEach(function (card) {
    card.setAttribute("tabindex", card.getAttribute("tabindex") || "0");
    card.setAttribute("role", card.getAttribute("role") || "button");
    card.setAttribute("aria-pressed", "false");
    card.addEventListener("click", function () {
      playExpressionCard(card);
    });
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        playExpressionCard(card);
      }
    });
  });
})();
