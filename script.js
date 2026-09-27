/**
 * Academic Survey Application & Permanent In-Place Form Glitch Engine
 * "A Study of Vendors' Opinions About Their Selling Strategies in Wickely Bazar"
 */

function setupSurveyGlitch() {
  const form = document.getElementById("surveyForm");

  if (!form) {
    console.error("ERROR: surveyForm does not exist");
    return;
  }

  const submitBtn = document.getElementById("submitBtn");
  const clearBtn = document.getElementById("clearBtn");
  const unansweredCountEl = document.getElementById("unansweredCount");
  const questionCards = document.querySelectorAll(".question-card");
  const inPlaceGlitchFx = document.getElementById("inPlaceGlitchFx");
  const mainFormTitle = document.getElementById("mainFormTitle");

  let isSubmitted = false;

  // Cached original title for continuous live glitch scrambling
  const originalTitle = mainFormTitle ? mainFormTitle.textContent : "";
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/0123456789~`§±';
  function scrambleText(text, intensity = 0.35) {
    return text.split('').map(ch => {
      if (ch === ' ') return ' ';
      return Math.random() < intensity ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : ch;
    }).join('');
  }

  // Persistent HTML5 Audio with Cloudinary stream
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

    // Keep audio looping indefinitely once started
    audio.addEventListener("ended", () => {
      if (isSubmitted) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    });

    audio.addEventListener("pause", () => {
      if (isSubmitted) {
        audio.play().catch(() => {});
      }
    });
  }

  // Question cards selection behavior
  questionCards.forEach((card) => {
    card.addEventListener("click", () => {
      if (isSubmitted) return;
      questionCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    });
  });

  // Radio button change listeners & "Other" specification input handler
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
  // SUBMIT EVENT HANDLER: INTERCEPTS NATIVE SUBMISSION — ZERO PAGE RELOAD
  // The actual survey form glitches indefinitely. NO second screen.
  // =========================================================================
  form.addEventListener("submit", function(event) {
    // 1. Prevent native submission immediately
    event.preventDefault();
    event.stopPropagation();

    console.log("SUCCESS: submit event intercepted — NO PAGE RELOAD");

    if (isSubmitted) return;

    // 2. Validate all 10 required questions
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

    // If validation fails, scroll to first unanswered card without reload
    if (firstMissingCard) {
      if (submitBtn) submitBtn.dataset.attempted = "true";
      updateRemainingCount();
      firstMissingCard.scrollIntoView({ behavior: "smooth", block: "center" });
      questionCards.forEach((c) => c.classList.remove("active"));
      firstMissingCard.classList.add("active");
      return;
    }

    // Form is 100% valid: activate permanent form glitch
    isSubmitted = true;

    // Lock inputs so user cannot disrupt the glitch state
    document.querySelectorAll("input, button").forEach(el => {
      el.style.pointerEvents = "none";
    });

    if (submitBtn) {
      submitBtn.textContent = "S̶U̶B̶M̶I̶T̶";
    }

    // 3. Audio attempt (safely wrapped, failure never breaks anything)
    if (audio) {
      try {
        audio.volume = 1.0;
        audio.loop = true;
        audio.play().catch((err) => {
          console.warn("Audio autoplay blocked by browser:", err);
        });
      } catch (err) {
        console.warn("Audio play exception:", err);
      }
    }

    // 4. Optional Fullscreen attempt (safely wrapped, never changes screens or reloads)
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } catch (fsErr) {
      console.warn("Fullscreen request error:", fsErr);
    }

    // 5. START CONTINUOUS IN-PLACE FORM GLITCHING
    // The actual survey form remains on screen and continues glitching forever!
    document.body.classList.add("form-glitching");
    if (inPlaceGlitchFx) {
      inPlaceGlitchFx.style.display = "block";
    }

    // Rapid live text scrambler on title and question cards that loops infinitely
    setInterval(() => {
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
    }, 80);

    // That is the entire experience. STOP HERE.
    // No second screen. No timeout to another screen.
    // The glitching form itself remains forever.
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

// Attach listener via DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupSurveyGlitch);
} else {
  setupSurveyGlitch();
}
