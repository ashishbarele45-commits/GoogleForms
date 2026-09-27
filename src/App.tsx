/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Volume2, VolumeX, LogOut, CheckCircle2, RotateCcw } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
  hasOtherText?: boolean;
}

const SURVEY_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Aap Wickely Bazar mein kitne samay se vending/selling kar rahe hain?",
    options: [
      "6 mahine se kam",
      "6 mahine–1 saal",
      "1–3 saal",
      "3–5 saal",
      "5 saal se zyada"
    ]
  },
  {
    id: 2,
    text: "Aapki dukaan/stall par sabse zyada bikne wale products kaun se hain?",
    options: [
      "Food & beverages",
      "Clothing",
      "Household items",
      "Accessories",
      "Other"
    ],
    hasOtherText: true
  },
  {
    id: 3,
    text: "Aap apne products ki selling price kaise decide karte hain?",
    options: [
      "Competitors ke price dekhkar",
      "Cost + profit margin",
      "Customer demand ke according",
      "Supplier price ke according",
      "Combination of these"
    ]
  },
  {
    id: 4,
    text: "Customers ko attract karne ke liye aap kaunsi strategy sabse zyada use karte hain?",
    options: [
      "Discount/offer",
      "Product display",
      "Verbal promotion",
      "Repeat-customer relationship",
      "Social media/online promotion"
    ]
  },
  {
    id: 5,
    text: "Kya aap seasonal demand ke according apni product range change karte hain?",
    options: [
      "Hamesha",
      "Kabhi-kabhi",
      "Rarely",
      "Bilkul nahi"
    ]
  },
  {
    id: 6,
    text: "Aap customers ko repeat purchase ke liye kaise encourage karte hain?",
    options: [
      "Discount",
      "Better service",
      "Credit/relationship",
      "New products",
      "Koi specific strategy nahi"
    ]
  },
  {
    id: 7,
    text: "Aapko apne competitors ki selling strategies ka kitna effect padta hai?",
    options: [
      "Bahut zyada",
      "Kaafi",
      "Moderate",
      "Bahut kam",
      "Bilkul nahi"
    ]
  },
  {
    id: 8,
    text: "Kya aap social media, WhatsApp ya online platforms ka use selling badhane ke liye karte hain?",
    options: [
      "Regularly",
      "Sometimes",
      "Rarely",
      "Never"
    ]
  },
  {
    id: 9,
    text: "Aapke hisaab se Wickely Bazar mein sales badhane ki sabse badi challenge kya hai?",
    options: [
      "High competition",
      "Customer footfall",
      "Price competition",
      "Limited space",
      "Changing customer preferences"
    ]
  },
  {
    id: 10,
    text: "Aapke hisaab se sales improve karne ke liye kaunsi strategy sabse useful hogi?",
    options: [
      "Better product display",
      "More discounts/offers",
      "Online promotion",
      "Product variety",
      "Customer service",
      "Other"
    ],
    hasOtherText: true
  }
];

export default function App() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [otherCustomTexts, setOtherCustomTexts] = useState<Record<number, string>>({});
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showGlitchScreen, setShowGlitchScreen] = useState<boolean>(false);
  const [audioBlocked, setAudioBlocked] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [glitchNoiseSeed, setGlitchNoiseSeed] = useState<number>(0);

  const questionRefs = useRef<Record<number, HTMLElement | null>>({});

  // Periodic random flicker seed for digital glitch effect
  useEffect(() => {
    if (!showGlitchScreen) return;
    const interval = setInterval(() => {
      setGlitchNoiseSeed(Math.random());
    }, 120);
    return () => clearInterval(interval);
  }, [showGlitchScreen]);

  // Handle ESC key to exit glitch screen safely
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showGlitchScreen) {
        exitGlitchMode();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && showGlitchScreen) {
        // User exited native browser fullscreen via ESC or browser UI
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [showGlitchScreen]);

  const handleSelectOption = (questionId: number, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
    setActiveQuestionId(questionId);
  };

  const handleOtherTextChange = (questionId: number, text: string) => {
    setOtherCustomTexts(prev => ({
      ...prev,
      [questionId]: text
    }));
    // Also ensure "Other" is marked selected
    if (answers[questionId] !== 'Other') {
      setAnswers(prev => ({
        ...prev,
        [questionId]: 'Other'
      }));
    }
  };

  const validateForm = () => {
    const missing: number[] = [];
    for (const q of SURVEY_QUESTIONS) {
      if (!answers[q.id] || answers[q.id].trim() === '') {
        missing.push(q.id);
      }
    }
    return missing;
  };

  const playSuppliedAudio = () => {
    const audio = document.getElementById('voice') as HTMLAudioElement | null;
    if (audio) {
      audio.volume = 1.0;
      audio.loop = true;
      audio.muted = false;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAudioBlocked(false);
            setIsMuted(false);
          })
          .catch((err) => {
            console.warn("Audio autoplay blocked by browser policy:", err);
            setAudioBlocked(true);
          });
      }
    }
  };

  const pauseSuppliedAudio = () => {
    const audio = document.getElementById('voice') as HTMLAudioElement | null;
    if (audio) {
      audio.pause();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Prevent duplicate submission triggers
    if (isSubmitting || showGlitchScreen) return;

    setAttemptedSubmit(true);

    const missingQuestions = validateForm();
    if (missingQuestions.length > 0) {
      // Scroll smoothly to the first unanswered question
      const firstMissingId = missingQuestions[0];
      const targetElement = questionRefs.current[firstMissingId];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setActiveQuestionId(firstMissingId);
      }
      return;
    }

    // All 10 questions are answered: proceed to submit & glitch mode
    setIsSubmitting(true);

    // Request browser fullscreen (standard user-gesture invocation)
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          // Gracefully continue even if user/browser rejects fullscreen
        });
      }
    } catch {
      // Ignore fullscreen errors
    }

    // Activate the Glitch Screen visual effect
    setShowGlitchScreen(true);

    // Play the exact supplied audio file
    playSuppliedAudio();
  };

  const exitGlitchMode = () => {
    pauseSuppliedAudio();
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    setShowGlitchScreen(false);
    setIsSubmitting(false);
  };

  const toggleMute = () => {
    const audio = document.getElementById('voice') as HTMLAudioElement | null;
    if (audio) {
      if (isMuted) {
        audio.muted = false;
        audio.play().catch(() => {});
        setIsMuted(false);
      } else {
        audio.muted = true;
        setIsMuted(true);
      }
    }
  };

  const handleClearForm = () => {
    setAnswers({});
    setOtherCustomTexts({});
    setAttemptedSubmit(false);
    setActiveQuestionId(null);
    setShowClearConfirm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unansweredCount = SURVEY_QUESTIONS.filter(q => !answers[q.id]).length;

  return (
    <div className="min-h-screen bg-[#f0ebf8] py-4 sm:py-8 px-3 sm:px-4 flex flex-col items-center">
      {/* Top Banner accent decoration (mimics Google Forms' top color band) */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-[#673ab7] -z-10 shadow-sm" />

      {/* Main Survey Container */}
      <main className="w-full max-w-[640px] sm:max-w-[770px] space-y-3">
        {/* Header Form Card */}
        <section className="bg-white rounded-lg border border-[#dadce0] shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] overflow-hidden">
          {/* Top Google Forms purple header bar */}
          <div className="h-2.5 bg-[#673ab7] w-full" />
          <div className="p-5 sm:p-7">
            <h1 className="text-2xl sm:text-[32px] font-normal text-[#202124] leading-tight tracking-tight">
              A Study of Vendors' Opinions About Their Selling Strategies in Wickely Bazar
            </h1>
            <p className="mt-3 text-sm text-[#3c4043] leading-relaxed">
              This survey is conducted for academic/research purposes to understand vendors' opinions, experiences, and selling strategies in Wickely Bazar. Please select the answer that best represents your experience. All questions are required.
            </p>

            <div className="border-t border-[#dadce0] mt-5 pt-3 flex items-center justify-between">
              <span className="text-xs sm:text-[13px] text-[#d93025] font-normal flex items-center gap-1">
                <span className="text-sm font-bold">*</span> Indicates required question
              </span>
              <span className="text-xs text-[#70757a]">
                Academic Fieldwork • 10 Questions
              </span>
            </div>
          </div>
        </section>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          {SURVEY_QUESTIONS.map((question) => {
            const isSelected = !!answers[question.id];
            const isError = attemptedSubmit && !isSelected;
            const isActive = activeQuestionId === question.id;

            return (
              <section
                key={question.id}
                ref={(el) => {
                  questionRefs.current[question.id] = el;
                }}
                onClick={() => setActiveQuestionId(question.id)}
                className={`bg-white rounded-lg p-5 sm:p-6 transition-all duration-150 border ${
                  isError
                    ? 'border-[#d93025] border-2 shadow-sm'
                    : isActive
                    ? 'border-l-4 border-l-[#4285f4] border-t-[#dadce0] border-r-[#dadce0] border-b-[#dadce0] shadow-[0_1px_2px_0_rgba(60,64,67,0.3)]'
                    : 'border-[#dadce0] shadow-none'
                }`}
              >
                {/* Question Label */}
                <div className="mb-4">
                  <h2 className="text-sm sm:text-base font-normal text-[#202124] leading-snug">
                    <span className="font-medium mr-1.5">{question.id}.</span>
                    {question.text}
                    <span className="text-[#d93025] ml-1 font-bold text-base" aria-label="Required question">*</span>
                  </h2>
                </div>

                {/* Options List */}
                <div className="space-y-3 pt-1">
                  {question.options.map((option, idx) => {
                    const isChecked = answers[question.id] === option;
                    const radioId = `q${question.id}_opt${idx}`;

                    return (
                      <div key={option} className="flex flex-col">
                        <label
                          htmlFor={radioId}
                          className="flex items-center gap-3.5 cursor-pointer py-1 group select-none"
                        >
                          <input
                            type="radio"
                            id={radioId}
                            name={`question_${question.id}`}
                            value={option}
                            checked={isChecked}
                            onChange={() => handleSelectOption(question.id, option)}
                            className="gform-radio"
                          />
                          <span className="text-sm text-[#202124] group-hover:text-black">
                            {option}
                          </span>
                        </label>

                        {/* Optional specification text line when "Other" is selected */}
                        {option === 'Other' && isChecked && question.hasOtherText && (
                          <div className="ml-8 mt-1.5 max-w-sm">
                            <input
                              type="text"
                              value={otherCustomTexts[question.id] || ''}
                              onChange={(e) => handleOtherTextChange(question.id, e.target.value)}
                              placeholder="Your answer"
                              className="w-full border-b border-[#dadce0] focus:border-[#673ab7] outline-none text-sm py-1 transition-colors text-[#202124]"
                              autoFocus
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Google Forms Red Error Message */}
                {isError && (
                  <div className="mt-4 pt-2 flex items-center gap-2 text-[#d93025] text-xs sm:text-[13px] font-normal">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>This is a required question</span>
                  </div>
                )}
              </section>
            );
          })}

          {/* Form Actions Card */}
          <div className="pt-2 pb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#673ab7] hover:bg-[#5e35b1] text-white text-sm font-medium px-6 py-2.5 rounded shadow-[0_1px_2px_0_rgba(60,64,67,0.3)] hover:shadow-[0_1px_3px_1px_rgba(60,64,67,0.15)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>

              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-[#673ab7] hover:bg-purple-100/60 text-sm font-medium px-4 py-2 rounded transition-colors cursor-pointer"
              >
                Clear form
              </button>
            </div>

            {attemptedSubmit && unansweredCount > 0 && (
              <span className="text-xs text-[#d93025] font-medium hidden sm:inline-block">
                {unansweredCount} required question{unansweredCount > 1 ? 's' : ''} left
              </span>
            )}
          </div>
        </form>

        {/* Survey Footer */}
        <footer className="text-center text-xs text-[#70757a] space-y-1.5 pb-12 pt-2">
          <p>Never submit passwords through online forms.</p>
          <p className="text-[11px] text-[#80868b]">
            Academic Survey • Wickely Bazar Vendor Research Project
          </p>
        </footer>
      </main>

      {/* Clear Form Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-medium text-[#202124]">Clear form?</h3>
            <p className="text-sm text-[#5f6368]">
              This will remove all your answers and cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="text-[#673ab7] text-sm font-medium px-4 py-2 rounded hover:bg-purple-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearForm}
                className="bg-[#673ab7] text-white text-sm font-medium px-4 py-2 rounded hover:bg-[#5e35b1] cursor-pointer"
              >
                Clear form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULLSCREEN GLITCH TRANSITION SCREEN (Triggered strictly on submit)         */}
      {/* ========================================================================= */}
      {showGlitchScreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Submission Glitch Screen"
          className="fixed inset-0 z-[9999] bg-[#050508] text-white flex flex-col items-center justify-center select-none overflow-hidden glitch-flicker"
        >
          {/* CRT Scanlines Overlay */}
          <div className="absolute inset-0 crt-scanlines opacity-75 z-10 pointer-events-none" />

          {/* Glitch noise and background distortion lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 z-0"
            style={{
              backgroundImage: `radial-gradient(circle at ${50 + Math.sin(glitchNoiseSeed * 10) * 20}% ${50 + Math.cos(glitchNoiseSeed * 10) * 20}%, #7928ca 0%, #ff0080 40%, transparent 70%)`,
              filter: 'blur(40px)',
            }}
          />

          {/* Random horizontal digital slice artifacts */}
          <div
            className="absolute left-0 right-0 h-1 bg-cyan-400 opacity-60 z-10 pointer-events-none"
            style={{ top: `${(glitchNoiseSeed * 100) % 95}%` }}
          />
          <div
            className="absolute left-0 right-0 h-0.5 bg-pink-500 opacity-60 z-10 pointer-events-none"
            style={{ top: `${((glitchNoiseSeed + 0.37) * 100) % 90}%` }}
          />

          {/* Top Bar Controls: Audio Toggle & Exit Button (Strict Usability / Safety) */}
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-30 flex items-center gap-3">
            {/* Audio Mute/Unmute */}
            <button
              onClick={toggleMute}
              title={isMuted ? "Unmute audio" : "Mute audio"}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono tracking-wider backdrop-blur-md transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />}
              <span className="hidden sm:inline">{isMuted ? "MUTED" : "AUDIO ACTIVE"}</span>
            </button>

            {/* Exit Glitch Screen Button (Never traps user) */}
            <button
              onClick={exitGlitchMode}
              title="Exit fullscreen / glitch screen (Press Esc)"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white text-xs font-mono font-bold tracking-wider shadow-lg hover:shadow-red-500/50 backdrop-blur-md transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>EXIT [ESC]</span>
            </button>
          </div>

          {/* Center Visual Glitch Content */}
          <div className="relative z-20 text-center px-4 max-w-2xl w-full flex flex-col items-center">
            {/* Digital Telemetry / Academic Study Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 font-mono text-[11px] sm:text-xs tracking-widest uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>TRANSMISSION COMPLETE // 10/10 RESPONSES LOGGED</span>
            </div>

            {/* Large Glitch Headline: "SUBMISSION RECEIVED" */}
            <h1
              data-text="SUBMISSION RECEIVED"
              className="glitch-text text-3xl sm:text-5xl md:text-6xl font-black mb-4 tracking-wider leading-none"
            >
              SUBMISSION RECEIVED
            </h1>

            {/* Sub-text with RGB chromatic displacement feel */}
            <p className="font-mono text-xs sm:text-sm text-gray-300 tracking-widest uppercase mb-8 max-w-lg leading-relaxed">
              [SYSTEM OK] Wickely Bazar Fieldwork telemetry processed. Continuous loop audio channel active.
            </p>

            {/* Audio Visualizer Wave / Bars */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 h-16 sm:h-20 my-4 px-6 py-2 rounded-lg bg-black/50 border border-white/10 backdrop-blur-sm">
              {[45, 80, 25, 95, 60, 30, 85, 100, 40, 70, 90, 50, 65, 35, 75].map((height, i) => (
                <div
                  key={i}
                  className="w-1.5 sm:w-2 bg-gradient-to-t from-purple-500 via-pink-500 to-cyan-400 rounded-t-sm"
                  style={{
                    height: isMuted ? '6px' : `${Math.max(12, (height * (0.4 + (glitchNoiseSeed * 0.6))) % 100)}%`,
                    transition: 'height 0.1s ease',
                  }}
                />
              ))}
            </div>

            {/* Autoplay fallback button if browser blocked audio */}
            {audioBlocked && (
              <div className="mt-4 p-4 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3 max-w-md w-full animate-bounce">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-amber-400" />
                  <span>Browser blocked autoplay: click to start audio</span>
                </div>
                <button
                  onClick={playSuppliedAudio}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-xs uppercase tracking-wider cursor-pointer"
                >
                  Play Audio
                </button>
              </div>
            )}

            {/* Bottom Return / Reset Control */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={exitGlitchMode}
                className="px-6 py-2.5 rounded bg-white/10 hover:bg-white/20 border border-white/30 text-white font-mono text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                Return to Survey Form
              </button>

              <button
                onClick={() => {
                  exitGlitchMode();
                  handleClearForm();
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded text-gray-400 hover:text-white font-mono text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Submit another response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
