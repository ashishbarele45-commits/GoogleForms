/**
 * Academic Survey Application & Full-Screen Glitch Submission Engine
 * "A Study of Vendors' Opinions About Their Selling Strategies in Wickely Bazar"
 */

function setupSurveyApp() {
  const form = document.querySelector("form");
  const submitBtn = document.getElementById("submitBtn");
  const clearBtn = document.getElementById("clearBtn");
  const unansweredCountEl = document.getElementById("unansweredCount");
  const questionCards = document.querySelectorAll(".question-card");

  // Glitch Screen & Indicator Elements
  const audioStatusText = document.getElementById("audioStatusText");
  const audioStatusDot = document.getElementById("audioStatusDot");
  const fsStatusText = document.getElementById("fsStatusText");
  const fsStatusDot = document.getElementById("fsStatusDot");
  const glitchPlayAudioBtn = document.getElementById("glitchPlayAudioBtn");

  if (!form) {
    console.error("FORM NOT FOUND");
    return;
  }

  let isSubmitted = false;

  // =========================================================================
  // PERSISTENT AUDIO ELEMENT SETUP (Cloudinary URL)
  // Preloads the audio on initial page load
  // =========================================================================
  const audio = document.getElementById("voice");
  if (audio) {
    try {
      audio.preload = "auto";
      audio.loop = true;
      audio.volume = 1.0;
      audio.playsInline = true;
      audio.muted = false;
      audio.load();
    } catch (err) {
      console.warn("Audio initial load warning:", err);
    }

    // Keep continuously looping once submitted
    audio.addEventListener("ended", () => {
      if (isSubmitted) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    });

    audio.addEventListener("playing", () => {
      updateAudioStatus(true);
    });

    audio.addEventListener("pause", () => {
      if (isSubmitted) {
        audio.play().catch(() => {});
      }
    });
  }

  // =========================================================================
  // STATUS INDICATOR HELPERS
  // =========================================================================
  function updateAudioStatus(isPlaying) {
    if (!audioStatusText || !audioStatusDot) return;
    if (isPlaying) {
      audioStatusText.textContent = "AUDIO ACTIVE // LOOPING";
      audioStatusDot.className = "status-dot active";
      if (glitchPlayAudioBtn) glitchPlayAudioBtn.style.display = "none";
    } else {
      audioStatusText.textContent = "AUDIO BLOCKED // TAP PLAY";
      audioStatusDot.className = "status-dot warning";
      if (glitchPlayAudioBtn) glitchPlayAudioBtn.style.display = "inline-block";
    }
  }

  function updateFullscreenStatus(isFs) {
    if (!fsStatusText || !fsStatusDot) return;
    if (isFs) {
      fsStatusText.textContent = "FULLSCREEN ACTIVE";
      fsStatusDot.className = "status-dot active";
    } else {
      fsStatusText.textContent = "WINDOWED MODE";
      fsStatusDot.className = "status-dot neutral";
    }
  }

  document.addEventListener("fullscreenchange", () => {
    updateFullscreenStatus(!!(document.fullscreenElement || document.webkitFullscreenElement));
  });
  document.addEventListener("webkitfullscreenchange", () => {
    updateFullscreenStatus(!!(document.fullscreenElement || document.webkitFullscreenElement));
  });

  // Fallback Play Audio Button (Touch-friendly for mobile/autoplay block)
  if (glitchPlayAudioBtn) {
    glitchPlayAudioBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (audio) {
        audio.volume = 1.0;
        audio.loop = true;
        audio.muted = false;
        audio.play().then(() => {
          updateAudioStatus(true);
        }).catch((err) => {
          console.warn("Manual audio play blocked:", err);
          updateAudioStatus(false);
        });
      }
    });
  }

  // =========================================================================
  // QUESTION CARDS INTERACTION
  // =========================================================================
  questionCards.forEach((card) => {
    card.addEventListener("click", () => {
      if (isSubmitted) return;
      questionCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    });
  });

  // Radio button changes & "Other" specification text display
  document.querySelectorAll(".gforms-radio").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (isSubmitted) return;

      const card = e.target.closest(".question-card");
      if (card) {
        card.classList.remove("has-error");
      }

      const qNum = e.target.name.replace("q", "");
      const otherInput = document.getElementById(`other_text_q${qNum}`);
      if (otherInput) {
        if (e.target.value === "Other") {
          otherInput.style.display = "block";
          otherInput.focus();
        } else {
          otherInput.style.display = "none";
        }
      }

      updateRemainingCount();
    });
  });

  function updateRemainingCount() {
    let missingCount = 0;
    for (let i = 1; i <= 10; i++) {
      if (!document.querySelector(`input[name="q${i}"]:checked`)) {
        missingCount++;
      }
    }
    if (unansweredCountEl) {
      if (missingCount > 0 && submitBtn && submitBtn.dataset.attempted === "true") {
        unansweredCountEl.textContent = `${missingCount} required question${missingCount > 1 ? "s" : ""} left`;
        unansweredCountEl.style.display = "inline-block";
      } else {
        unansweredCountEl.style.display = "none";
      }
    }
  }

  // =========================================================================
  // AUTHORITATIVE FORM SUBMISSION HANDLER
  // Attached to the FORM element to prevent any page reload or navigation
  // =========================================================================
  form.addEventListener("submit", async (event) => {
    // PREVENT NATIVE FORM SUBMISSION & PAGE REFRESH IMMEDIATELY
    event.preventDefault();
    event.stopImmediatePropagation();

    console.log("FORM SUBMIT HANDLER FIRED");

    if (isSubmitted) return;

    // Validate all 10 required questions
    let firstMissingCard = null;
    let missingCount = 0;

    for (let i = 1; i <= 10; i++) {
      const checkedOption = document.querySelector(`input[name="q${i}"]:checked`);
      const card = document.querySelector(`.question-card[data-q="${i}"]`);

      if (!checkedOption) {
        missingCount++;
        if (card) {
          card.classList.add("has-error");
          if (!firstMissingCard) {
            firstMissingCard = card;
          }
        }
      } else if (card) {
        card.classList.remove("has-error");
      }
    }

    // If validation fails, scroll to first unanswered card
    if (firstMissingCard) {
      if (submitBtn) submitBtn.dataset.attempted = "true";
      updateRemainingCount();
      firstMissingCard.scrollIntoView({ behavior: "smooth", block: "center" });
      questionCards.forEach((c) => c.classList.remove("active"));
      firstMissingCard.classList.add("active");
      return;
    }

    // Form is 100% valid - proceed to post-submit experience
    isSubmitted = true;
    if (submitBtn) {
      submitBtn.disabled = true;
    }

    // 1. Try audio, but NEVER let an audio error stop the submission.
    if (audio) {
      try {
        audio.volume = 1.0;
        audio.loop = true;
        await audio.play();
        console.log("AUDIO PLAYING");
        updateAudioStatus(true);
      } catch (error) {
        console.warn("Audio playback blocked:", error);
        updateAudioStatus(false);
      }
    }

    // 2. Try fullscreen, but NEVER let fullscreen failure stop the flow.
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen unavailable:", error);
    }
    updateFullscreenStatus(!!(document.fullscreenElement || document.webkitFullscreenElement));

    // 3. NOW hide the entire survey completely.
    const survey = document.querySelector(".survey-container")
                || document.querySelector("main")
                || form;

    if (survey) {
      survey.style.display = "none";
    }

    const topBanner = document.getElementById("topBanner");
    if (topBanner) {
      topBanner.style.display = "none";
    }

    // 4. Show the glitch screen.
    const glitch = document.getElementById("glitchScreen");
    if (glitch) {
      glitch.style.display = "flex";
      glitch.style.visibility = "visible";
      glitch.style.opacity = "1";
    }
  });

  // Clear Form button (before submit)
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (isSubmitted) return;
      if (confirm("Clear all answers? This will reset all your answers.")) {
        form.reset();
        document.querySelectorAll(".other-text-input").forEach((input) => {
          input.style.display = "none";
        });
        questionCards.forEach((c) => {
          c.classList.remove("has-error");
          c.classList.remove("active");
        });
        if (unansweredCountEl) unansweredCountEl.style.display = "none";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }
}

// Ensure execution whether DOMContentLoaded hasn't fired yet or already has
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupSurveyApp);
} else {
  setupSurveyApp();
}
