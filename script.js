/**
 * Academic Survey Application & Full-Screen Glitch Submission Engine
 * "A Study of Vendors' Opinions About Their Selling Strategies in Wickely Bazar"
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const surveyForm = document.getElementById('surveyForm');
  const surveyContainer = document.getElementById('surveyContainer');
  const topBanner = document.getElementById('topBanner');
  const glitchScreen = document.getElementById('glitchScreen');
  const submitBtn = document.getElementById('submitBtn');
  const clearBtn = document.getElementById('clearBtn');
  const unansweredCountEl = document.getElementById('unansweredCount');
  const questionCards = document.querySelectorAll('.question-card');

  // Status & Audio Fallback Elements on Glitch Screen
  const audioStatusText = document.getElementById('audioStatusText');
  const audioStatusDot = document.getElementById('audioStatusDot');
  const fsStatusText = document.getElementById('fsStatusText');
  const fsStatusDot = document.getElementById('fsStatusDot');
  const glitchPlayAudioBtn = document.getElementById('glitchPlayAudioBtn');

  // Exact persistent single HTML5 audio element
  const audio = document.getElementById('voice');

  let isSubmitted = false;

  // =========================================================================
  // AUDIO PRELOAD & INITIALIZATION
  // Preloads the audio on page load to minimize startup latency
  // =========================================================================
  if (audio) {
    try {
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 1.0;
      audio.playsInline = true;
      audio.muted = false;
      audio.load();
    } catch (err) {
      console.warn('Initial audio preload error:', err);
    }

    // Monitor playback state
    audio.addEventListener('playing', () => {
      updateAudioStatus(true);
    });

    audio.addEventListener('pause', () => {
      if (isSubmitted) {
        // Enforce continuous loop if paused unexpectedly
        audio.play().catch(() => {});
      }
    });

    audio.addEventListener('ended', () => {
      if (isSubmitted) {
        audio.currentTime = 0;
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
      audioStatusText.textContent = 'AUDIO ACTIVE // LOOPING';
      audioStatusDot.className = 'status-dot active';
      if (glitchPlayAudioBtn) glitchPlayAudioBtn.style.display = 'none';
    } else {
      audioStatusText.textContent = 'AUDIO BLOCKED // TAP PLAY';
      audioStatusDot.className = 'status-dot warning';
      if (glitchPlayAudioBtn) glitchPlayAudioBtn.style.display = 'inline-block';
    }
  }

  function updateFullscreenStatus(isFs) {
    if (!fsStatusText || !fsStatusDot) return;
    if (isFs) {
      fsStatusText.textContent = 'FULLSCREEN ACTIVE';
      fsStatusDot.className = 'status-dot active';
    } else {
      fsStatusText.textContent = 'WINDOWED MODE';
      fsStatusDot.className = 'status-dot neutral';
    }
  }

  // Track Fullscreen changes across browsers
  document.addEventListener('fullscreenchange', () => {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    updateFullscreenStatus(isFs);
  });
  document.addEventListener('webkitfullscreenchange', () => {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    updateFullscreenStatus(isFs);
  });

  // =========================================================================
  // FALLBACK PLAY AUDIO BUTTON (Touch-friendly manual start if blocked)
  // =========================================================================
  if (glitchPlayAudioBtn) {
    glitchPlayAudioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (audio) {
        try {
          audio.volume = 1.0;
          audio.loop = true;
          audio.muted = false;
          audio.play().then(() => {
            updateAudioStatus(true);
          }).catch((err) => {
            console.error('Manual audio play failed:', err);
            updateAudioStatus(false);
          });
        } catch (err) {
          console.error('Manual audio play exception:', err);
          updateAudioStatus(false);
        }
      }
    });
  }

  // =========================================================================
  // QUESTION CARDS INTERACTION
  // =========================================================================
  questionCards.forEach((card) => {
    card.addEventListener('click', () => {
      if (isSubmitted) return;
      questionCards.forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  // Radio button change listener & "Other" specification input handler
  document.querySelectorAll('.gforms-radio').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      if (isSubmitted) return;

      const card = e.target.closest('.question-card');
      if (card) {
        card.classList.remove('has-error');
      }

      const qNum = e.target.name.replace('q', '');
      const otherInput = document.getElementById(`other_text_q${qNum}`);
      if (otherInput) {
        if (e.target.value === 'Other') {
          otherInput.style.display = 'block';
          otherInput.focus();
        } else {
          otherInput.style.display = 'none';
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
      if (missingCount > 0 && submitBtn.dataset.attempted === 'true') {
        unansweredCountEl.textContent = `${missingCount} required question${missingCount > 1 ? 's' : ''} left`;
        unansweredCountEl.style.display = 'inline-block';
      } else {
        unansweredCountEl.style.display = 'none';
      }
    }
  }

  // =========================================================================
  // ROBUST SUBMISSION FLOW
  // 1. Prevent Default
  // 2. Validate questions
  // 3. Attempt audio.play() directly from the click gesture
  // 4. Attempt fullscreen where supported
  // 5. Hide original survey completely
  // 6. Show full-screen glitch screen
  // 7. Update audio status based on actual playback
  // =========================================================================
  surveyForm.addEventListener('submit', async (e) => {
    // 1. Prevent default
    e.preventDefault();

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
          card.classList.add('has-error');
          if (!firstMissingCard) {
            firstMissingCard = card;
          }
        }
      } else if (card) {
        card.classList.remove('has-error');
      }
    }

    if (firstMissingCard) {
      submitBtn.dataset.attempted = 'true';
      updateRemainingCount();
      firstMissingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      questionCards.forEach((c) => c.classList.remove('active'));
      firstMissingCard.classList.add('active');
      return;
    }

    // Mark submitted & disable submit button temporarily
    isSubmitted = true;
    submitBtn.disabled = true;

    // 3. Immediately attempt audio playback from click gesture
    let audioPromise = null;
    if (audio) {
      try {
        audio.volume = 1.0;
        audio.loop = true;
        audio.muted = false;
        audioPromise = audio.play();
      } catch (audioErr) {
        console.warn('Initial audio.play() call error:', audioErr);
      }
    }

    // 4. Immediately request browser fullscreen where supported (non-blocking)
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch((fsErr) => {
          console.warn('Fullscreen request rejected:', fsErr);
        });
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } catch (fsApiErr) {
      console.warn('Fullscreen API exception:', fsApiErr);
    }
    const isNowFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
    updateFullscreenStatus(isNowFullscreen);

    // 5. Completely hide original survey
    if (surveyContainer) {
      surveyContainer.style.display = 'none';
    }
    if (topBanner) {
      topBanner.style.display = 'none';
    }

    // 6. Show the full-screen glitch screen
    if (glitchScreen) {
      glitchScreen.style.display = 'flex';
    }

    // 7. Handle audio playback result
    if (audioPromise !== null && typeof audioPromise.then === 'function') {
      audioPromise.then(() => {
        updateAudioStatus(true);
      }).catch((playErr) => {
        console.warn('Browser blocked audio autoplay:', playErr);
        updateAudioStatus(false);
      });
    } else if (audio && !audio.paused) {
      updateAudioStatus(true);
    } else {
      updateAudioStatus(false);
    }

    // Periodic volume & loop check
    setInterval(() => {
      if (audio && isSubmitted && !audio.paused) {
        try {
          if (audio.volume < 1.0) audio.volume = 1.0;
          if (audio.muted) audio.muted = false;
        } catch (e) {}
      }
    }, 500);
  });

  // Clear Form button (before submit)
  clearBtn.addEventListener('click', () => {
    if (isSubmitted) return;
    if (confirm('Clear all answers? This will reset all your answers.')) {
      surveyForm.reset();
      document.querySelectorAll('.other-text-input').forEach((input) => {
        input.style.display = 'none';
      });
      questionCards.forEach((c) => {
        c.classList.remove('has-error');
        c.classList.remove('active');
      });
      if (unansweredCountEl) unansweredCountEl.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
});
