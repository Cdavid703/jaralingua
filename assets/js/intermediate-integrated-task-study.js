(function () {
  "use strict";

  var speed = 1;
  var activeAudio = null;
  var activeButton = null;
  var status = document.getElementById("studyAudioStatus");

  function setStatus(message) {
    status.textContent = message;
  }

  function resetButton(button) {
    if (!button) return;
    button.classList.remove("is-playing");
    button.setAttribute("aria-pressed", "false");
    var icon = button.querySelector("i");
    if (icon) icon.className = "bi bi-play-fill";
  }

  function activateButton(button) {
    button.classList.add("is-playing");
    button.setAttribute("aria-pressed", "true");
    var icon = button.querySelector("i");
    if (icon) icon.className = "bi bi-pause-fill";
  }

  function stopActiveAudio() {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }
    resetButton(activeButton);
    activeAudio = null;
    activeButton = null;
  }

  document.querySelectorAll("[data-study-speed]").forEach(function (button) {
    button.addEventListener("click", function () {
      speed = Number(button.getAttribute("data-study-speed"));
      if (activeAudio) activeAudio.playbackRate = speed;
      document.querySelectorAll("[data-study-speed]").forEach(function (item) {
        var selected = Number(item.getAttribute("data-study-speed")) === speed;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      setStatus("Audio speed changed to " + speed + "x.");
    });
  });

  document.querySelectorAll("[data-study-audio]").forEach(function (button) {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", function () {
      var label = button.getAttribute("data-audio-label") || "phrase";
      if (activeButton === button && activeAudio && !activeAudio.paused) {
        activeAudio.pause();
        resetButton(button);
        setStatus("Audio paused: " + label + ".");
        return;
      }
      stopActiveAudio();
      activeAudio = new Audio(button.getAttribute("data-study-audio"));
      activeButton = button;
      activeAudio.preload = "auto";
      activeAudio.playbackRate = speed;
      activeAudio.addEventListener("ended", function () {
        resetButton(button);
        setStatus("Audio completed: " + label + ".");
        activeAudio = null;
        activeButton = null;
      }, { once: true });
      activeAudio.addEventListener("error", function () {
        resetButton(button);
        setStatus("This professional audio could not be loaded. Check the connection and try again.");
        activeAudio = null;
        activeButton = null;
      }, { once: true });
      activateButton(button);
      setStatus("Playing at " + speed + "x: " + label + ".");
      activeAudio.play().catch(function () {
        resetButton(button);
        setStatus("Playback did not start. Press the play button again.");
        activeAudio = null;
        activeButton = null;
      });
    });
  });
})();
