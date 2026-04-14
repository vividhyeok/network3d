import React, { useState, useEffect } from 'react';

// Constants representing bandwidth units
const F = 100;   // file size (arbitrary units)
const Us = 10;   // server upload BW
const Ui = 3;    // each peer's upload BW
const dmin = 5;  // minimum download BW

function calcCS(n) {
  return Math.max((n * F) / Us, F / dmin);
}
function calcP2P(n) {
  return Math.max(F / Us, F / dmin, (n * F) / (Us + n * Ui));
}

export default function P2PvsCS() {
  const [n, setN] = useState(1);

  const csTime  = calcCS(n).toFixed(1);
  const p2pTime = calcP2P(n).toFixed(1);
  const maxTime = Math.max(calcCS(10), calcP2P(10)) * 1.1;

  // Generate node positions for CS
  const csClients = Array.from({ length: n }, (_, i) => {
    const angle = (i / Math.max(n, 1)) * Math.PI * 1.6 - 0.3;
    return { x: 50 + 38 * Math.cos(angle), y: 55 + 38 * Math.sin(angle) };
  });

  // P2P: arrange in a circle
  const p2pPeers = Array.from({ length: n + 1 }, (_, i) => {
    const angle = (i / (n + 1)) * Math.PI * 2;
    return { x: 50 + 35 * Math.cos(angle), y: 50 + 35 * Math.sin(angle) };
  });

  const serverOverwhelmed = n >= 7;

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Slider control */}
      <div className="flex items-center gap-6 bg-black/40 px-6 py-3 rounded-xl border border-white/10">
        <span className="text-sm font-bold text-teal-400 uppercase tracking-wider">Peers / Clients: <span className="text-white text-lg">{n}</span></span>
        <input type="range" min={1} max={10} value={n} onChange={e => setN(Number(e.target.value))}
          className="flex-1 accent-teal-500" />
        <button onClick={() => setN(n < 10 ? n + 1 : n)}
          className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg font-bold text-sm">
          + Add Node
        </button>
      </div>

      {/* Two panels */}
      <div className="flex-1 flex gap-4">
        {/* Client-Server */}
        <div className={`flex-1 rounded-xl border-2 p-4 flex flex-col ${serverOverwhelmed ? 'border-red-600 bg-red-950/20' : 'border-white/10 bg-white/5'}`}>
          <h3 className={`font-black text-lg tracking-wide mb-1 ${serverOverwhelmed ? 'text-red-400' : 'text-teal-400'}`}>
            Client-Server
            {serverOverwhelmed && <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">BOTTLENECK</span>}
          </h3>
          <div className="font-mono text-xs text-gray-500 mb-3">
            D<sub>cs</sub> = max(NF/U<sub>s</sub>, F/d<sub>min</sub>) = <span className="text-white">{csTime}</span> units
          </div>

          {/* SVG diagram */}
          <div className="flex-1 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Server */}
              <rect x="40" y="5" width="20" height="12" rx="3" fill={serverOverwhelmed ? '#7f1d1d' : '#134e4a'} stroke={serverOverwhelmed ? '#ef4444' : '#14b8a6'} strokeWidth="1.5" />
              <text x="50" y="13" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">SERVER</text>

              {/* Upload bar */}
              <rect x="38" y="18" width="24" height="3" rx="1" fill="#1e293b" />
              <rect x="38" y="18" width={Math.min(24, (Us / 15) * 24)} height="3" rx="1" fill={serverOverwhelmed ? '#ef4444' : '#14b8a6'} />
              <text x="50" y="24" textAnchor="middle" fontSize="2.5" fill={serverOverwhelmed ? '#ef4444' : '#94a3b8'}>Upload: {Us} (fixed)</text>

              {/* Arrows to clients */}
              {csClients.map((c, i) => {
                const busy = i < Math.min(n, Us);
                return (
                  <g key={i}>
                    <line x1="50" y1="17" x2={c.x} y2={c.y - 5}
                      stroke={serverOverwhelmed ? '#ef4444' : '#0d9488'} strokeWidth="0.8" opacity="0.7" strokeDasharray={serverOverwhelmed ? '2,1' : ''} />
                    <circle cx={c.x} cy={c.y} r="5" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.2" />
                    <text x={c.x} y={c.y + 1.5} textAnchor="middle" fontSize="3" fill="white">C{i + 1}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Time bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Distribution Time</span>
              <span className={serverOverwhelmed ? 'text-red-400 font-bold' : 'text-white'}>{csTime} units</span>
            </div>
            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(calcCS(n) / maxTime) * 100}%`, backgroundColor: serverOverwhelmed ? '#ef4444' : '#0d9488' }} />
            </div>
          </div>
        </div>

        {/* P2P */}
        <div className="flex-1 border-2 border-emerald-800 bg-emerald-950/10 rounded-xl p-4 flex flex-col">
          <h3 className="font-black text-lg tracking-wide text-emerald-400 mb-1">
            P2P
            <span className="ml-2 text-xs bg-emerald-700 text-white px-2 py-0.5 rounded-full">Self-Scaling</span>
          </h3>
          <div className="font-mono text-xs text-gray-500 mb-3">
            D<sub>p2p</sub> = max(F/U<sub>s</sub>, F/d<sub>min</sub>, NF/(U<sub>s</sub>+ΣU<sub>i</sub>)) = <span className="text-white">{p2pTime}</span> units
          </div>

          <div className="flex-1 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* P2P edges */}
              {p2pPeers.map((a, i) =>
                p2pPeers.map((b, j) => j > i && (
                  <line key={`e-${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke="#065f46" strokeWidth="0.5" opacity="0.5" />
                ))
              )}
              {/* Nodes */}
              {p2pPeers.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="6" fill={i === 0 ? '#134e4a' : '#1e3a5f'} stroke={i === 0 ? '#10b981' : '#3b82f6'} strokeWidth="1.2" />
                  <text x={p.x} y={p.y + 1.5} textAnchor="middle" fontSize="2.8" fill="white" fontWeight="bold">
                    {i === 0 ? 'SEED' : `P${i}`}
                  </text>
                  <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="2" fill="#10b981">↑{i === 0 ? Us : Ui}</text>
                </g>
              ))}
            </svg>
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Distribution Time</span>
              <span className="text-emerald-300 font-bold">{p2pTime} units</span>
            </div>
            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(calcP2P(n) / maxTime) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Comparison insight */}
      <div className="bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm flex items-center gap-6">
        <span className="text-gray-400">With <strong className="text-white">{n}</strong> nodes:</span>
        <span className="text-red-400">CS: <strong>{csTime}</strong> units</span>
        <span className="text-emerald-400">P2P: <strong>{p2pTime}</strong> units</span>
        <span className="text-teal-300 ml-auto font-bold">
          💡 P2P: every new peer brings additional U<sub>i</sub>={Ui} upload capacity
        </span>
      </div>
    </div>
  );
}
