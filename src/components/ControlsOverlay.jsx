import React from 'react';

export default function ControlsOverlay({ 
  showPduNames, 
  setShowPduNames, 
  isPlaying, 
  setIsPlaying, 
  speed, 
  setSpeed 
}) {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#0f1117]/90 border border-white/10 p-4 rounded-xl backdrop-blur-md flex items-center space-x-6 z-10 w-max shadow-2xl">
      
      {/* Play/Pause Button */}
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className="flex items-center justify-center bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-lg font-bold tracking-wide transition-all"
      >
        {isPlaying ? '■ STOP ANIMATION' : '▶ PLAY ANIMATION'}
      </button>

      <div className="w-px h-8 bg-white/10"></div>

      {/* PDU Toggle */}
      <label className="flex items-center cursor-pointer space-x-3">
        <div className="relative w-10 h-6 bg-gray-700 rounded-full shadow-inner flex items-center p-1 transition-colors">
          <input 
            type="checkbox" 
            className="sr-only" 
            checked={showPduNames}
            onChange={(e) => setShowPduNames(e.target.checked)}
          />
          <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${showPduNames ? 'transform translate-x-4 bg-teal-400' : ''}`}></div>
        </div>
        <span className="text-sm font-semibold text-gray-300 select-none">Show PDU Names</span>
      </label>

    </div>
  );
}
