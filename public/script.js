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
  const surveyContainer = document.getElementById("surveyContainer");
  const topBanner = document.getElementById("topBanner");
  const inPlaceGlitchFx = document.getElementById("inPlaceGlitchFx");
  const glitchScreen = document.getElementById("glitchScreen");
  const mainFormTitle = document.getElementById("mainFormTitle");

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

  // Pre-cached original title for text scrambling
  const originalTitle = mainFormTitle ? mainFormTitle.textContent : "";
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/0123456789~`§±';
  function scrambleText(text, intensity = 0.35) {
    return text.split('').map(ch => {
      if (ch === ' ') return ' ';
      return Math.random() < intensity ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : ch;
    }).join('');
  }

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

  // Question cards active state
  questionCards.forEach((card) => {
    card.addEventListener("click", () => {
      if (isSubmitted) return;
      questionCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    });
  });

  // Radio button changes & "Other" specification input handler
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
  // AUTHORITATIVE FORM SUBMISSION & PROGRESSIVE GLITCH SEQUENCE
  // =========================================================================
  form.addEventListener("submit", async (event) => {
    // Prevent any native form submission or page refresh
    event.preventDefault();
    event.stopImmediatePropagation();

    console.log("FORM SUBMIT HANDLER FIRED");

    if (isSubmitted) return;

    // Validate all 10 questions
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

    if (firstMissingCard) {
      if (submitBtn) submitBtn.dataset.attempted = "true";
      updateRemainingCount();
      firstMissingCard.scrollIntoView({ behavior: "smooth", block: "center" });
      questionCards.forEach((c) => c.classList.remove("active"));
      firstMissingCard.classList.add("active");
      return;
    }

    // Mark as submitted
    isSubmitted = true;

    // Disable all inputs to prevent further user input
    document.querySelectorAll("input, button:not(#glitchPlayAudioBtn)").forEach(el => {
      el.style.pointerEvents = "none";
    });

    if (submitBtn) {
      submitBtn.textContent = "S̶U̶B̶M̶I̶T̶";
    }

    // 1. Audio attempt directly inside user interaction
    if (audio) {
      try {
        audio.volume = 1.0;
        audio.loop = true;
        audio.play().then(() => {
          console.log("AUDIO PLAYING");
          updateAudioStatus(true);
        }).catch((err) => {
          console.warn("Audio playback blocked:", err);
          updateAudioStatus(false);
        });
      } catch (error) {
        console.warn("Audio exception:", error);
        updateAudioStatus(false);
      }
    }

    // 2. Fullscreen attempt (non-blocking)
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } catch (fsErr) {
      console.warn("Fullscreen unavailable:", fsErr);
    }
    updateFullscreenStatus(!!(document.fullscreenElement || document.webkitFullscreenElement));

    // =========================================================================
    // STEP 1 & 2 & 3: FORM GLITCHES IN-PLACE
    // The actual survey form remains visible and starts glitching/corrupting!
    // =========================================================================
    document.body.classList.add("form-glitching");
    if (inPlaceGlitchFx) {
      inPlaceGlitchFx.style.display = "block";
    }

    // Scramble text on form cards in real time
    const scrambleInterval = setInterval(() => {
      if (mainFormTitle && originalTitle) {
        mainFormTitle.textContent = scrambleText(originalTitle, 0.45);
      }
      const randomCard = questionCards[Math.floor(Math.random() * questionCards.length)];
      if (randomCard) {
        const qText = randomCard.querySelector(".question-text");
        if (qText) {
          qText.style.color = Math.random() > 0.5 ? "#ff0055" : "#00e5ff";
        }
      }
    }, 90);

    // =========================================================================
    // STEP 4 & 5: CORRUPTION INTENSIFIES & FORM BREAKS APART (~1600ms)
    // The actual form visibly breaks apart into flying fragments
    // =========================================================================
    setTimeout(() => {
      document.body.classList.add("glitch-phase-break");
    }, 1600);

    // =========================================================================
    // STEP 6 & 7: FORM DISAPPEARS & FULLSCREEN GLITCH SCREEN APPEARS (~2800ms)
    // =========================================================================
    setTimeout(() => {
      clearInterval(scrambleInterval);

      if (surveyContainer) {
        surveyContainer.style.display = "none";
      }
      if (topBanner) {
        topBanner.style.display = "none";
      }
      if (inPlaceGlitchFx) {
        inPlaceGlitchFx.style.display = "none";
      }

      if (glitchScreen) {
        glitchScreen.style.display = "flex";
        glitchScreen.style.visibility = "visible";
        glitchScreen.style.opacity = "1";
      }

      // Check audio status again in case state settled
      if (audio && !audio.paused) {
        updateAudioStatus(true);
      }
    }, 2800);
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
