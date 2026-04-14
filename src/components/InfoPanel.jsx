import React from 'react';

export default function InfoPanel({ selectedLayer, onClose }) {
  if (!selectedLayer) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-[#0f1117]/80 backdrop-blur-md border-l border-teal-800 text-white p-6 shadow-2xl transform transition-transform duration-300">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
      >
        ✕
      </button>
      
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-wider mb-1" style={{ color: selectedLayer.color }}>
            {selectedLayer.name}
          </h2>
          <p className="text-sm text-gray-400 font-medium">Layer</p>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-teal-400 mb-2">ROLE</h3>
          <p className="text-gray-200">{selectedLayer.role}</p>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-teal-400 mb-2">PROTOCOLS</h3>
          <div className="flex flex-wrap gap-2">
            {selectedLayer.protocols.map(p => (
              <span key={p} className="px-2 py-1 bg-teal-900/50 rounded text-sm text-teal-100">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-teal-400 mb-2">PDU (Protocol Data Unit)</h3>
          <p className="text-gray-200">{selectedLayer.pdu}</p>
        </div>

        <div className="bg-teal-900/30 border border-teal-800/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-teal-400 mb-2">KEY CONCEPT</h3>
          <p className="text-teal-50 text-sm leading-relaxed">{selectedLayer.concept}</p>
        </div>
      </div>
    </div>
  );
}
