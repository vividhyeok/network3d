import React, { useState, useEffect, useRef } from 'react';
import SelfCheck from '../SelfCheck';

const STEP_TIME = 2000;

export default function DnsResolver() {
  const [mode, setMode] = useState('iterative');
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [queryCount, setQueryCount] = useState(0); // 0 = first query, 1+ = cached
  const [isCacheQuery, setIsCacheQuery] = useState(false);
  const [cacheStepDone, setCacheStepDone] = useState(false);
  const timerRef = useRef(null);

  const checkData = [
    {
      q: "브라우저가 google.com을 입력받았을 때 실제로 연결하는 건 무엇인가?\nDNS가 없다면 어떻게 해야 하는가?",
      a: "브라우저는 IP 주소로만 통신할 수 있다. google.com은 사람이 읽기 쉬운 이름일 뿐이다.\nDNS가 없다면 사용자가 직접 142.250.196.46 같은 IP 주소를 알고 입력해야 한다."
    },
    {
      q: "Iterative와 Recursive 방식에서 '일을 누가 하는가'가 어떻게 다른가?",
      a: "Iterative: Local DNS가 직접 Root → TLD → Auth를 차례로 방문한다. 클라이언트(Local DNS)가 일한다.\nRecursive: Local DNS가 Root에 물어보면 Root가 TLD에, TLD가 Auth에 물어본다. 서버들이 일한다.\n실제 인터넷은 주로 Iterative를 사용한다 — 서버 부하를 분산하기 위해서다."
    },
    {
      q: "같은 도메인을 1분 안에 두 번 질의하면 두 번째는 왜 빠른가?\nTTL이 만료된 후 같은 도메인을 질의하면 어떻게 되는가?",
      a: "첫 질의 결과가 Local DNS 캐시에 TTL 시간 동안 저장된다.\n두 번째 질의는 캐시 HIT → Root/TLD/Auth 방문 없이 즉시 응답.\nTTL 만료 후에는 캐시가 지워지므로 다시 4-hop 전체 질의를 수행한다."
    }
  ];

  const stepsIterative = [
    { from: 'client', to: 'local', msg: 'Q: www.abc.com IP?' },
    { from: 'local', to: 'root',  msg: 'Q: www.abc.com IP?' },
    { from: 'root',  to: 'local', msg: 'A: Ask .com TLD (9.9.9.9)' },
    { from: 'local', to: 'tld',   msg: 'Q: www.abc.com IP?' },
    { from: 'tld',   to: 'local', msg: 'A: Ask abc.com Auth (8.8.8.8)' },
    { from: 'local', to: 'auth',  msg: 'Q: www.abc.com IP?' },
    { from: 'auth',  to: 'local', msg: 'A: 1.2.3.4  [cached, TTL=300s]' },
    { from: 'local', to: 'client',msg: 'A: 1.2.3.4' },
  ];

  const stepsRecursive = [
    { from: 'client', to: 'local', msg: 'Q: www.abc.com IP?' },
    { from: 'local',  to: 'root',  msg: 'Q: www.abc.com IP?' },
    { from: 'root',   to: 'tld',   msg: 'Q: www.abc.com IP?' },
    { from: 'tld',    to: 'auth',  msg: 'Q: www.abc.com IP?' },
    { from: 'auth',   to: 'tld',   msg: 'A: 1.2.3.4' },
    { from: 'tld',    to: 'root',  msg: 'A: 1.2.3.4' },
    { from: 'root',   to: 'local', msg: 'A: 1.2.3.4' },
    { from: 'local',  to: 'client',msg: 'A: 1.2.3.4' },
  ];

  const currentSteps = mode === 'iterative' ? stepsIterative : stepsRecursive;

  // Cache query: only 2 steps
  const cacheSteps = [
    { from: 'client', to: 'local', msg: 'Q: www.abc.com IP?' },
    { from: 'local',  to: 'client', msg: 'A: 1.2.3.4  [Cache HIT — TTL: 47s]', isCache: true },
  ];

  const activeSteps = isCacheQuery ? cacheSteps : currentSteps;

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep(0);
    setCacheStepDone(false);
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setStep(s => {
        if (s < activeSteps.length) return s + 1;
        clearInterval(timerRef.current);
        if (isCacheQuery) setCacheStepDone(true);
        return s;
      });
    }, isCacheQuery ? 800 : STEP_TIME);

    return () => clearInterval(timerRef.current);
  }, [isRunning, mode, isCacheQuery]);

  const handlePlay = () => {
    setStep(0);
    setCacheStepDone(false);
    setIsRunning(true);
  };

  const handleQueryAgain = () => {
    setIsCacheQuery(true);
    setQueryCount(c => c + 1);
    setStep(0);
    setCacheStepDone(false);
    setIsRunning(true);
  };

  const handleReset = () => {
    setStep(0);
    setIsRunning(false);
    setIsCacheQuery(false);
    setQueryCount(0);
    setCacheStepDone(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const nodes = {
    client: { top: '78%', left: '8%',  name: 'PC',          color: 'border-teal-400',   bg: 'bg-teal-900' },
    local:  { top: '78%', left: '38%', name: 'Local DNS',    color: 'border-blue-400',   bg: 'bg-blue-900' },
    root:   { top: '15%', left: '60%', name: 'Root Server',  color: 'border-purple-400', bg: 'bg-purple-900' },
    tld:    { top: '48%', left: '78%', name: 'TLD (.com)',   color: 'border-orange-400', bg: 'bg-orange-900' },
    auth:   { top: '78%', left: '92%', name: 'Auth (abc)',   color: 'border-pink-400',   bg: 'bg-pink-900' },
  };

  const isFirstQueryDone = !isCacheQuery && step >= currentSteps.length;

  return (
    <div className="w-full h-full flex flex-col items-center gap-3">
      {/* Controls row */}
      <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-xl border border-white/10">
        <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Mode</span>
        {['iterative', 'recursive'].map(m => (
          <button key={m}
            onClick={() => { setMode(m); handleReset(); }}
            className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${mode === m ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
        <div className="w-px h-6 bg-white/20" />
        <button onClick={handlePlay} disabled={isRunning && step < activeSteps.length}
          className="px-5 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-900 disabled:text-gray-500 text-white rounded-lg font-bold text-sm transition-all">
          ▶ Query
        </button>
        {isFirstQueryDone && (
          <button onClick={handleQueryAgain}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm transition-all animate-pulse">
            🔄 Query Again (test cache)
          </button>
        )}
        <button onClick={handleReset} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg font-bold text-sm">
          Reset
        </button>
      </div>

      {/* Stats bar */}
      {(isFirstQueryDone || isCacheQuery) && (
        <div className="flex gap-6 text-sm font-mono bg-black/40 rounded-xl px-6 py-2 border border-white/10">
          <span className="text-gray-400">1st query: <span className="text-red-400 font-bold">4 hops</span></span>
          {isCacheQuery && <span className="text-gray-400">2nd query: <span className="text-emerald-400 font-bold">1 hop (cached ✓)</span></span>}
        </div>
      )}

      {/* Cache HIT banner */}
      {cacheStepDone && (
        <div className="text-center px-8 py-3 bg-emerald-900/50 border border-emerald-500 rounded-xl font-bold text-emerald-300 text-sm">
          ⚡ Cache HIT — Local DNS answered immediately. TTL: 47s remaining. No further hops needed.
        </div>
      )}

      {/* Main diagram */}
      <div className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl relative overflow-hidden">

        {/* Nodes */}
        {Object.entries(nodes).map(([id, info]) => {
          const isLocalCacheHit = isCacheQuery && id === 'local' && step >= 2;
          return (
            <div key={id}
              className={`absolute w-24 h-24 -ml-12 -mt-12 ${info.bg} border-2 ${info.color} rounded-full flex flex-col items-center justify-center font-bold text-xs text-center z-20 transition-all duration-300
                ${isLocalCacheHit ? 'shadow-[0_0_30px_rgba(52,211,153,0.8)] scale-110' : 'shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}
              style={{ top: info.top, left: info.left }}>
              {info.name}
              {isLocalCacheHit && <span className="text-[10px] text-emerald-400 mt-1">CACHE HIT</span>}
            </div>
          );
        })}

        {/* SVG arrows */}
        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
          <defs>
            <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#34d399"/>
            </marker>
            <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#f87171"/>
            </marker>
            <marker id="arrowGold" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#fbbf24"/>
            </marker>
          </defs>

          {/* Completed arrows */}
          {activeSteps.slice(0, step).map((s, i) => {
            const start = nodes[s.from];
            const end   = nodes[s.to];
            const isAnswer = s.msg.startsWith('A:');
            const isCacheHit = s.isCache;
            const color = isCacheHit ? '#34d399' : isAnswer ? '#34d399' : '#f87171';
            const marker = isCacheHit ? 'url(#arrowGreen)' : isAnswer ? 'url(#arrowGreen)' : 'url(#arrowRed)';
            return (
              <g key={i}>
                <line x1={start.left} y1={start.top} x2={end.left} y2={end.top}
                  stroke={color} strokeWidth="2" strokeDasharray="6,4" opacity="0.5"
                  markerEnd={marker} />
                <text fill={color} fontSize="11" fontWeight="bold" textAnchor="middle" opacity="0.8"
                  x={`calc((${start.left} + ${end.left}) / 2)`}
                  style={{ dominantBaseline: 'auto' }}>
                </text>
              </g>
            );
          })}

          {/* Currently flying dot */}
          {isRunning && step > 0 && step <= activeSteps.length && (() => {
            const s = activeSteps[step - 1];
            const fromN = nodes[s.from];
            const toN   = nodes[s.to];
            const dur = isCacheQuery ? '0.8s' : `${STEP_TIME / 1000}s`;
            const color = s.isCache ? '#34d399' : s.msg.startsWith('A:') ? '#34d399' : '#f87171';
            return (
              <g key={`fly-${step}`}>
                <circle r="8" fill={color}>
                  <animate attributeName="cx" values={`${fromN.left};${toN.left}`} dur={dur} fill="freeze" />
                  <animate attributeName="cy" values={`${fromN.top};${toN.top}`} dur={dur} fill="freeze" />
                </circle>
                <text fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" dy="-14">
                  <animate attributeName="x" values={`${fromN.left};${toN.left}`} dur={dur} fill="freeze" />
                  <animate attributeName="y" values={`${fromN.top};${toN.top}`} dur={dur} fill="freeze" />
                  {s.msg}
                </text>
              </g>
            );
          })()}
        </svg>

        <div className="absolute bottom-3 left-3 font-mono text-xs text-gray-500">
          Step {step}/{activeSteps.length} {isCacheQuery && '(Cache Query)'}
        </div>
      </div>

      {/* Self Check Layer */}
      <SelfCheck questions={checkData} />
    </div>
  );
}
