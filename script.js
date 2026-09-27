/**
 * Academic Survey Application & In-Place Google Form Glitch Engine
 * "A Study of Vendors' Opinions About Their Selling Strategies in Wickely Bazar"
 */

document.addEventListener('DOMContentLoaded', () => {
  const surveyForm = document.getElementById('surveyForm');
  const submitBtn = document.getElementById('submitBtn');
  const clearBtn = document.getElementById('clearBtn');
  const unansweredCountEl = document.getElementById('unansweredCount');
  const questionCards = document.querySelectorAll('.question-card');
  const mainFormTitle = document.getElementById('mainFormTitle');
  const audioAlertBanner = document.getElementById('audioAlertBanner');
  const retryAudioBtn = document.getElementById('retryAudioBtn');

  // =========================================================================
  // PRE-WARMED PERSISTENT AUDIO ELEMENT
  // Exactly ONE audio instance created/referenced once on page load
  // Starts loading immediately to minimize startup delay
  // =========================================================================
  const audio = document.getElementById('voice');

  if (audio) {
    try {
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 1.0;
      audio.muted = false;
      // Immediately start loading and decoding the audio file
      audio.load();
    } catch (e) {
      console.log('Audio init notice:', e);
    }

    // Gracefully handle playback state and errors
    audio.addEventListener('error', () => {
      if (isFormGlitched && audioAlertBanner) {
        audioAlertBanner.style.display = 'flex';
      }
    });

    audio.addEventListener('playing', () => {
      if (audioAlertBanner) {
        audioAlertBanner.style.display = 'none';
      }
    });

    // Ensure seamless, continuous loop upon track completion
    audio.addEventListener('ended', () => {
      if (isFormGlitched) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    });
  }

  let isFormGlitched = false;
  let lockedScrollTop = 0;

  // Active question card highlight
  questionCards.forEach((card) => {
    card.addEventListener('click', () => {
      if (isFormGlitched) return;
      questionCards.forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  // Radio button changes & "Other" specification text display
  document.querySelectorAll('.gforms-radio').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      if (isFormGlitched) return;

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

  // Corrupt text characters for in-place glitch realism
  const originalTitle = mainFormTitle ? mainFormTitle.textContent : '';
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/0123456789~`§±';
  function scrambleText(text, intensity = 0.35) {
    return text.split('').map(ch => {
      if (ch === ' ') return ' ';
      return Math.random() < intensity ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : ch;
    }).join('');
  }

  /**
   * Submit Handler
   */
  surveyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (isFormGlitched) return;

    let firstMissingCard = null;
    let missingCount = 0;

    // Validate all 10 questions
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

    // If validation fails, scroll to first error
    if (firstMissingCard) {
      submitBtn.dataset.attempted = 'true';
      updateRemainingCount();
      firstMissingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      questionCards.forEach((c) => c.classList.remove('active'));
      firstMissingCard.classList.add('active');
      return;
    }

    // =========================================================================
    // SUBMIT AUDIO TIMING:
    // Call audio.play() immediately inside that user interaction before showing glitch screen.
    // No setTimeout, no artificial delays, no fetching/recreating audio.
    // After play() succeeds, show the glitch screen.
    // If playback is blocked, show fallback "PLAY AUDIO" button.
    // =========================================================================
    function activateGlitchScreen() {
      if (isFormGlitched) return;
      isFormGlitched = true;
      lockedScrollTop = window.scrollY || document.documentElement.scrollTop;

      // Lock screen and prevent scrolling
      document.documentElement.classList.add('screen-locked');
      document.body.classList.add('screen-locked', 'form-glitching');

      // Disable all form controls and buttons
      submitBtn.disabled = true;
      submitBtn.textContent = 'S̶U̶B̶M̶I̶T̶';
      clearBtn.disabled = true;

      document.querySelectorAll('button:not(#retryAudioBtn), input, label, a, select').forEach((el) => {
        el.style.pointerEvents = 'none';
        el.style.cursor = 'not-allowed';
        if ('disabled' in el) el.disabled = true;
      });

      // Scramble text in real time on the form
      setInterval(() => {
        if (mainFormTitle) {
          mainFormTitle.textContent = scrambleText(originalTitle, 0.4);
        }
        const randomQ = document.querySelector(`.question-card[data-q="${Math.floor(Math.random() * 10) + 1}"] .question-text`);
        if (randomQ) {
          randomQ.style.color = Math.random() > 0.5 ? '#ff0055' : '#00e5ff';
        }
      }, 120);

      // Keep volume at max and enforce looping without restarting audio
      setInterval(() => {
        if (audio && isFormGlitched) {
          try {
            if (audio.volume < 1.0) audio.volume = 1.0;
            if (audio.muted) audio.muted = false;
            if (audio.paused && (!audioAlertBanner || audioAlertBanner.style.display !== 'flex')) {
              audio.play().catch(() => {});
            }
          } catch (e) {}
        }
      }, 200);
    }

    if (audio) {
      try {
        audio.volume = 1.0;
        audio.loop = true;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              activateGlitchScreen();
              if (audioAlertBanner) audioAlertBanner.style.display = 'none';
            })
            .catch((err) => {
              console.log('Autoplay restriction caught:', err);
              if (audioAlertBanner) audioAlertBanner.style.display = 'flex';
              activateGlitchScreen();
            });
        } else {
          activateGlitchScreen();
        }
      } catch (err) {
        console.log('Audio play error:', err);
        if (audioAlertBanner) audioAlertBanner.style.display = 'flex';
        activateGlitchScreen();
      }
    } else {
      activateGlitchScreen();
    }
  });

  // Manual Retry Button if browser autoplay was blocked
  if (retryAudioBtn) {
    retryAudioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (audio) {
        audio.volume = 1.0;
        audio.loop = true;
        audio.play().then(() => {
          if (audioAlertBanner) audioAlertBanner.style.display = 'none';
        }).catch((err) => console.log('Manual play attempt:', err));
      }
    });
  }

  // =========================================================================
  // ABSOLUTE SCREEN FREEZE: BLOCK ALL CLICKS, KEYS, AND SCROLLING AFTER SUBMIT
  // "no screen work after click and scroll on submeet"
  // "ek bhi website button kaam nahi karegi"
  // =========================================================================
  const blockAllEvents = (e) => {
    if (isFormGlitched) {
      if (e.target && (e.target.id === 'retryAudioBtn' || e.target.closest('#audioAlertBanner'))) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (audio) {
        try {
          audio.volume = 1.0;
          audio.muted = false;
          if (audio.paused) audio.play().catch(() => {});
        } catch (err) {}
      }
      return false;
    }
  };

  window.addEventListener('click', blockAllEvents, true);
  window.addEventListener('mousedown', blockAllEvents, true);
  window.addEventListener('mouseup', blockAllEvents, true);
  window.addEventListener('touchstart', blockAllEvents, { passive: false, capture: true });
  window.addEventListener('touchend', blockAllEvents, { passive: false, capture: true });
  window.addEventListener('touchmove', blockAllEvents, { passive: false, capture: true });
  window.addEventListener('wheel', blockAllEvents, { passive: false, capture: true });
  window.addEventListener('keydown', blockAllEvents, true);
  window.addEventListener('contextmenu', blockAllEvents, true);

  // Lock scroll position completely
  window.addEventListener('scroll', () => {
    if (isFormGlitched) {
      window.scrollTo(0, lockedScrollTop);
    }
  }, { passive: false });

  // Clear Form button (before submit)
  clearBtn.addEventListener('click', () => {
    if (isFormGlitched) return;
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
