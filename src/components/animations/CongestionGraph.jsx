import React, { useState, useEffect, useRef } from 'react';

export default function CongestionGraph() {
  const [data, setData] = useState([{ round: 0, cwnd: 1, ssthresh: 16, phase: 'ss', event: null, eventType: null }]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setData(prev => {
          const last = prev[prev.length - 1];
          let nextCwnd = last.cwnd;
          let phase = last.phase;
          if (last.cwnd < last.ssthresh) { nextCwnd = last.cwnd * 2; phase = 'ss'; }
          else                            { nextCwnd = last.cwnd + 1; phase = 'ca'; }
          if (nextCwnd > 42) nextCwnd = 42;
          return [...prev, { round: last.round + 1, cwnd: nextCwnd, ssthresh: last.ssthresh, phase, event: null, eventType: null }];
        });
      }, 900);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  // 3-Dup-ACK → Fast Retransmit: cwnd → ssthresh/2, skip Slow Start, enter CA
  const triggerFastRetransmit = () => {
    setData(prev => {
      const last = prev[prev.length - 1];
      const newSsthresh = Math.max(Math.floor(last.cwnd / 2), 2);
      return [
        ...prev,
        { round: last.round + 1, cwnd: newSsthresh, ssthresh: newSsthresh, phase: 'ca', event: 'Fast Retransmit', eventType: 'fast' },
      ];
    });
  };

  // Timeout → cwnd = 1, restart Slow Start completely
  const triggerTimeout = () => {
    setData(prev => {
      const last = prev[prev.length - 1];
      const newSsthresh = Math.max(Math.floor(last.cwnd / 2), 2);
      return [
        ...prev,
        { round: last.round + 1, cwnd: 1, ssthresh: newSsthresh, phase: 'ss', event: 'Timeout', eventType: 'timeout' },
      ];
    });
  };

  const reset = () => {
    setData([{ round: 0, cwnd: 1, ssthresh: 16, phase: 'ss', event: null, eventType: null }]);
    setIsRunning(false);
  };

  const W = 820, H = 380;
  const maxRounds = Math.max(22, data.length + 4);
  const maxCwnd = 44;
  const getX = r => (r / maxRounds) * W;
  const getY = c => H - (c / maxCwnd) * H;

  const lineColor = (d) => {
    if (d.eventType === 'fast') return '#f97316';    // orange
    if (d.eventType === 'timeout') return '#ef4444'; // red
    if (d.phase === 'ss') return '#10b981';          // green
    return '#3b82f6';                                // blue
  };

  return (
    <div className="w-full h-full flex gap-6">
      {/* Graph */}
      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col">
        <h3 className="text-base font-bold text-teal-400 tracking-widest uppercase mb-3">TCP Congestion Window Over Time</h3>

        <div className="flex-1 relative overflow-hidden">
          <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            {/* Grid */}
            {[0, 8, 16, 24, 32, 40].map(y => (
              <g key={y}>
                <line x1={0} y1={getY(y)} x2={W} y2={getY(y)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                <text x={4} y={getY(y) - 3} fill="rgba(255,255,255,0.4)" fontSize="11">{y}</text>
              </g>
            ))}
            <text x={-H/2} y={14} fill="rgba(255,255,255,0.4)" fontSize="11" transform="rotate(-90)" textAnchor="middle">cwnd</text>

            {/* ssthresh dynamic line */}
            <line x1={0} y1={getY(data[data.length - 1].ssthresh)} x2={W} y2={getY(data[data.length - 1].ssthresh)}
              stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.8" />
            <text x={8} y={getY(data[data.length - 1].ssthresh) - 5}
              fill="#fbbf24" fontSize="11" fontWeight="bold">ssthresh = {data[data.length - 1].ssthresh}</text>

            {/* Segments */}
            {data.map((d, i) => {
              if (i === 0) return null;
              const prev = data[i - 1];
              const color = lineColor(d);
              return (
                <line key={i}
                  x1={getX(prev.round)} y1={getY(prev.cwnd)}
                  x2={getX(d.round)} y2={getY(d.cwnd)}
                  stroke={color} strokeWidth="3" strokeLinecap="round" />
              );
            })}

            {/* Dots & event labels */}
            {data.map((d, i) => {
              const color = lineColor(d);
              return (
                <g key={`pt-${i}`}>
                  <circle cx={getX(d.round)} cy={getY(d.cwnd)} r={d.event ? 7 : 4} fill={color} />
                  {d.event && (
                    <>
                      <line x1={getX(d.round)} y1={getY(d.cwnd)} x2={getX(d.round)} y2={H}
                        stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
                      <text x={getX(d.round)} y={getY(d.cwnd) - 16}
                        fill={color} fontSize="10" fontWeight="bold" textAnchor="middle">
                        {d.event}
                      </text>
                      <text x={getX(d.round)} y={getY(d.cwnd) - 5}
                        fill={color} fontSize="9" textAnchor="middle">
                        cwnd→{d.cwnd}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3 text-xs font-medium border-t border-white/5 pt-3">
          {[
            ['#10b981', 'Slow Start (exponential ×2)'],
            ['#3b82f6', 'Congestion Avoidance (+1/RTT)'],
            ['#f97316', '3-Dup-ACK: cwnd→ssthresh/2, skip SS'],
            ['#ef4444', 'Timeout: cwnd→1, full Slow Start'],
            ['#fbbf24', '--- ssthresh'],
          ].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-6 h-2 rounded" style={{ backgroundColor: color }} />
              <span className="text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="w-56 flex flex-col gap-3">
        <button onClick={() => setIsRunning(r => !r)}
          className={`py-3 rounded-xl font-bold tracking-wide transition-all text-white ${isRunning ? 'bg-orange-500 hover:bg-orange-400' : 'bg-teal-600 hover:bg-teal-500'}`}>
          {isRunning ? '⏸ PAUSE' : '▶ RUN'}
        </button>

        <div className="bg-black/40 border border-orange-900 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Fast Retransmit</h4>
          <p className="text-[10px] text-gray-400 leading-relaxed">3-Dup-ACK: ssthresh = cwnd/2, cwnd = ssthresh → enter CA directly</p>
          <button onClick={triggerFastRetransmit}
            className="w-full py-2 bg-orange-700 hover:bg-orange-600 text-white rounded-lg font-bold text-xs">
            Trigger 3-Dup-ACK
          </button>
        </div>

        <div className="bg-black/40 border border-red-900 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Timeout</h4>
          <p className="text-[10px] text-gray-400 leading-relaxed">Timeout: ssthresh = cwnd/2, cwnd = 1 → restart Slow Start from bottom</p>
          <button onClick={triggerTimeout}
            className="w-full py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold text-xs">
            Trigger Timeout
          </button>
        </div>

        <button onClick={reset}
          className="mt-auto py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-xs font-bold">
          RESET
        </button>
      </div>
    </div>
  );
}
