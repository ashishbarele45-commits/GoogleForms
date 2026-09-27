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
  const [audioBlocked, setAudioBlocked] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const questionRefs = useRef<Record<number, HTMLElement | null>>({});

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
    if (isSubmitting) return;

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

    // All 10 questions are answered: activate in-place permanent form glitch
    setIsSubmitting(true);

    // Request browser fullscreen (standard user-gesture invocation)
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // Ignore fullscreen errors
    }

    // Play the exact supplied audio file
    playSuppliedAudio();
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
    <div className={`page-shell min-h-screen bg-[#f0ebf8] py-4 sm:py-8 px-3 sm:px-4 flex flex-col items-center ${isSubmitting ? 'form-glitching permanent-glitch' : ''}`}>
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
    </div>
  );
}

