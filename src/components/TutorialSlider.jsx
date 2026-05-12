import React, { useState, useEffect, useRef } from 'react';

/**
 * TutorialSlider — Step-by-step concept guide with typewriter animation.
 *
 * Props:
 *   steps: Array<{ text: string, onEnter?: () => void }>
 *   initialStep: number (optional, default 0)
 */
export default function TutorialSlider({ steps = [], initialStep = 0 }) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [collapsed, setCollapsed] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingRef = useRef(null);
  const isFirstRender = useRef(true);

  const total = steps.length;
  const step = steps[currentStep];

  // Typewriter effect
  useEffect(() => {
    if (!step) return;
    clearTimeout(typingRef.current);
    setIsTyping(true);
    setDisplayedText('');

    const fullText = step.text;
    let i = 0;

    // Slightly randomised per-character delay for a natural look
    const type = () => {
      if (i < fullText.length) {
        setDisplayedText(fullText.slice(0, i + 1));
        i++;
        // faster for spaces/punctuation, natural pace for letters
        const delay = fullText[i - 1] === ' ' ? 18 : 28;
        typingRef.current = setTimeout(type, delay);
      } else {
        setIsTyping(false);
      }
    };

    typingRef.current = setTimeout(type, isFirstRender.current ? 0 : 60);
    isFirstRender.current = false;

    return () => clearTimeout(typingRef.current);
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Call onEnter hook when step changes (to trigger animations)
  useEffect(() => {
    if (step?.onEnter) {
      step.onEnter();
    }
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (idx) => {
    if (idx < 0 || idx >= total) return;
    setCurrentStep(idx);
  };

  if (total === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 select-none">
      {/* Fixed-height container — always occupies space even when collapsed */}
      <div className="relative bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
           style={{ minHeight: collapsed ? 52 : 130 }}>

        {/* Header bar — always visible */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'w-5 h-2 bg-teal-400'
                    : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-500">
              {currentStep + 1} / {total}
            </span>
            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed(c => !c)}
              className="text-gray-500 hover:text-gray-300 transition-colors text-xs px-1"
              title={collapsed ? '펼치기' : '접기'}
            >
              {collapsed ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Expandable body */}
        {!collapsed && (
          <div className="flex items-center gap-4 px-4 py-3">
            {/* Prev arrow */}
            <button
              onClick={() => goTo(currentStep - 1)}
              disabled={currentStep === 0}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
            >
              ‹
            </button>

            {/* Text area — fixed height to prevent layout shift */}
            <div className="flex-1 min-h-[60px] flex items-center">
              <p className="text-[13px] leading-relaxed text-gray-200">
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-[1px] h-3.5 bg-teal-400 ml-0.5 animate-[blink_0.8s_steps(1)_infinite]" />
                )}
              </p>
            </div>

            {/* Next arrow */}
            <button
              onClick={() => goTo(currentStep + 1)}
              disabled={currentStep === total - 1}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
