import React from 'react';

export default function DrillDownNav({ title, subtitle, tabs, activeTab, setActiveTab, onClose }) {
  return (
    <div className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-50 pointer-events-auto bg-gradient-to-b from-[#0f1117] to-transparent">
      <div className="flex items-center space-x-6">
        <button 
          onClick={onClose}
          className="flex items-center space-x-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg backdrop-blur-md transition-all"
        >
          <span>←</span>
          <span className="font-semibold tracking-wide text-sm">BACK TO MAIN</span>
        </button>
        <div>
          <h2 className="text-2xl font-black tracking-widest text-white">{title}</h2>
          {subtitle && <p className="text-sm font-medium text-teal-400">{subtitle}</p>}
        </div>
      </div>

      {tabs && tabs.length > 0 && (
        <div className="flex flex-wrap bg-white/5 backdrop-blur-md rounded-xl p-1 shadow-lg border border-white/5 gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-2 rounded-lg text-sm font-bold tracking-wide transition-all ${
                activeTab === tab.id 
                  ? 'bg-teal-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
              {tab.isNew && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_6px_rgba(45,212,191,0.8)]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
