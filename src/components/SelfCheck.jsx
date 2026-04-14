import React, { useState } from 'react';

export default function SelfCheck({ questions }) {
  const [expanded, setExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReasoning, setShowReasoning] = useState(false);

  if (!questions || questions.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 border-t border-white/10 pt-4 pb-4">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full py-2 bg-[#1e2535] hover:bg-[#252f44] text-gray-300 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2 border border-white/5"
        >
          <span>이해 확인</span>
          <span className="text-xs">↓</span>
        </button>
      ) : (
        <div className="bg-[#151a25] border border-white/10 rounded-xl p-6 relative animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-2">
            <h3 className="text-teal-400 font-bold text-sm tracking-wide">SELF-CHECK</h3>
            <span className="text-gray-500 text-xs font-mono">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Question */}
          <div className="mb-6">
            <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">
              <span className="text-teal-500 font-bold mr-2">Q.</span>
              {questions[currentIndex].q}
            </p>
          </div>

          {/* Reasoning Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center mb-3"
            >
              <span className="mr-1">{showReasoning ? '▼' : '▶'}</span> 논리 확인
            </button>
            
            {showReasoning && (
              <div className="bg-[#1e2535] p-4 rounded-lg text-[13px] text-gray-300 leading-relaxed border border-white/5 animate-fade-in whitespace-pre-line">
                {questions[currentIndex].a}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-end pt-2">
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentIndex(currentIndex + 1);
                  setShowReasoning(false);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                다음 질문
              </button>
            ) : (
              <button
                onClick={() => {
                  setExpanded(false);
                  setCurrentIndex(0);
                  setShowReasoning(false);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-bold transition-colors"
              >
                닫기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
