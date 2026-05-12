import React, { useState, useEffect, useRef } from 'react';
import TutorialSlider from '../TutorialSlider';

const STEP_TIME = 2000;

const SETUP_STEPS = [
  {
    from: 'client', to: 'server',
    label: 'SYN  seq=x',
    clientState: 'SYN_SENT', serverState: 'LISTEN',
    note: 'Client initiates ??picks a random seq number x',
    color: '#f87171',
  },
  {
    from: 'server', to: 'client',
    label: 'SYN-ACK  seq=y  ack=x+1',
    clientState: 'SYN_SENT', serverState: 'SYN_RCVD',
    note: 'Server picks its own seq=y, acknowledges x',
    color: '#34d399',
  },
  {
    from: 'client', to: 'server',
    label: 'ACK  ack=y+1  [+ HTTP GET]',
    clientState: 'ESTABLISHED', serverState: 'ESTABLISHED',
    note: 'Connection established. Data piggybacks on ACK.',
    color: '#60a5fa',
  },
];

const TEARDOWN_STEPS = [
  { from: 'client', to: 'server',  label: 'FIN',     color: '#fb923c', note: 'Client done sending ??initiates close' },
  { from: 'server', to: 'client',  label: 'ACK',     color: '#34d399', note: 'Server acknowledges FIN' },
  { from: 'server', to: 'client',  label: 'FIN',     color: '#fb923c', note: 'Server also done ??sends its FIN' },
  { from: 'client', to: 'server',  label: 'ACK',     color: '#34d399', note: 'Client ACKs ??enters TIME_WAIT' },
];

const checkData = [
  {
    q: "3-way handshake?ì„œ ??2-way (SYN + SYN-ACK)ë¡œëŠ” ë¶€ì¡±í•œê°€?",
    a: "SYN-ACKë§Œìœ¼ë¡œëŠ” ?œë²„ê°€ ?´ë¼?´ì–¸?¸ì˜ ë©”ì‹œì§€ë¥?ë°›ì„ ???ˆë‹¤??ê²ƒë§Œ ?•ì¸?œë‹¤.\n?´ë¼?´ì–¸?¸ê? ?œë²„??SYN-ACKë¥?ë°›ì•˜?¤ëŠ” ?•ì¸(ACK)???†ìœ¼ë©?n?œë²„???´ë¼?´ì–¸?¸ê? ?¤ì œë¡??°ê²° ì¤€ë¹„ê? ?ëŠ”ì§€ ?????†ë‹¤.\n?‘ë°©???µì‹  ì¤€ë¹„ë? ?œë¡œ ?•ì¸?˜ë ¤ë©?3?¨ê³„ê°€ ?„ìš”?˜ë‹¤."
  },
  {
    q: "TIME_WAIT ?íƒœê°€ ???„ìš”?œê??\n?°ê²°???Šìë§ˆì ë°”ë¡œ ê°™ì? ?¬íŠ¸ë¡????°ê²°???´ë©´ ?´ë–¤ ë¬¸ì œê°€ ?ê¸¸ ???ˆëŠ”ê°€?",
    a: "ë§ˆì?ë§?ACKê°€ ? ì‹¤??ê²½ìš°ë¥??€ë¹„í•œ?? ?ë?ë°©ì´ FIN???¬ì „?¡í•  ???ˆìœ¼ë¯€ë¡?n?¼ì • ?œê°„ (ë³´í†µ 2Ã—MSL) ?™ì•ˆ ?€ê¸°í•˜ë©???²Œ ?„ì°©?˜ëŠ” ?¨í‚·??ì²˜ë¦¬?œë‹¤.\në°”ë¡œ ???°ê²°???´ë©´ ?´ì „ ?°ê²°??ì§€???¨í‚·?????°ê²°???°ì´?°ë¡œ ?¤ì¸?????ˆë‹¤."
  },
  {
    q: "HTTP Persistent connection???†ë‹¤ë©??¹í˜?´ì? ?˜ë‚˜ë¥?ë¡œë“œ????nTCP handshakeê°€ ëª?ë²??¼ì–´?˜ëŠ”ê°€? ?´ê²Œ ??ë¬¸ì œ?¸ê??",
    a: "?˜ì´ì§€???¬í•¨??ê°ì²´(?´ë?ì§€, CSS, JS) ?˜ë§Œ??handshakeê°€ ë°œìƒ?œë‹¤.\n?„ë? ?¹í˜?´ì????˜ì‹­~?˜ë°± ê°œì˜ ê°ì²´ë¥??¬í•¨?˜ë?ë¡?nhandshake ë¹„ìš©(1 RTT Ã— ê°ì²´ ?????¤ì œ ?°ì´???„ì†¡ë³´ë‹¤ ?????¤ë²„?¤ë“œê°€ ?œë‹¤."
  }
];

function Arrow({ from, to, label, color, yPct }) {
  const isRight = from === 'client';
  return (
    <div className="absolute w-full flex items-center" style={{ top: `${yPct}%` }}>
      <div className="w-[20%]" />
      <div className="flex-1 relative flex items-center">
        <div className="flex-1 border-t-2" style={{ borderColor: color, borderStyle: 'solid' }} />
        {isRight
          ? <div className="w-0 h-0 border-y-4 border-y-transparent border-l-8 flex-none" style={{ borderLeftColor: color }} />
          : <div className="w-0 h-0 border-y-4 border-y-transparent border-r-8 flex-none absolute left-0" style={{ borderRightColor: color }} />
        }
      </div>
      <div className="w-[20%]" />
      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-5 text-xs font-bold px-2 py-0.5 rounded"
        style={{ color, backgroundColor: 'rgba(0,0,0,0.7)', whiteSpace: 'nowrap' }}>
        {label}
      </div>
    </div>
  );
}

export default function TcpHandshake() {
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showTeardown, setShowTeardown] = useState(false);
  const [teardownStep, setTeardownStep] = useState(0);
  const [isTeardownRunning, setIsTeardownRunning] = useState(false);
  const timerRef = useRef(null);

  const activeSteps = SETUP_STEPS;

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setStep(s => {
        if (s < activeSteps.length) return s + 1;
        clearInterval(timerRef.current);
        setIsRunning(false);
        return s;
      });
    }, STEP_TIME);
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  useEffect(() => {
    let t;
    if (isTeardownRunning) {
      t = setInterval(() => {
        setTeardownStep(s => {
          if (s < TEARDOWN_STEPS.length) return s + 1;
          clearInterval(t);
          setIsTeardownRunning(false);
          return s;
        });
      }, STEP_TIME);
    }
    return () => clearInterval(t);
  }, [isTeardownRunning]);

  const reset = () => {
    setStep(0);
    setIsRunning(false);
    setTeardownStep(0);
    setIsTeardownRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const currentClientState = step > 0 ? SETUP_STEPS[step - 1].clientState : 'CLOSED';
  const currentServerState = step > 0 ? SETUP_STEPS[step - 1].serverState : 'LISTEN';

  // Y positions for each setup arrow (percentage in diagram area)
  const setupYs = [25, 50, 73];
  const teardownYs = [18, 38, 58, 78];

  const isDone = step >= SETUP_STEPS.length;

  return (
    <div className="w-full flex-1 flex flex-col gap-3">
      {/* Controls */}
      <div className="flex items-center gap-4 bg-black/40 px-5 py-3 rounded-xl border border-white/10">
        <button onClick={() => { reset(); setTimeout(() => setIsRunning(true), 50); }}
          disabled={isRunning}
          className="px-5 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-900 disabled:text-gray-500 text-white rounded-lg font-bold text-sm">
          ??Play Setup
        </button>
        {isDone && !showTeardown && (
          <button onClick={() => setShowTeardown(true)}
            className="px-5 py-2 bg-orange-700 hover:bg-orange-600 text-white rounded-lg font-bold text-sm">
            Show Teardown (4-way FIN)
          </button>
        )}
        {showTeardown && (
          <button onClick={() => { setTeardownStep(0); setIsTeardownRunning(true); }}
            disabled={isTeardownRunning}
            className="px-5 py-2 bg-orange-700 hover:bg-orange-600 disabled:bg-orange-950 text-white rounded-lg font-bold text-sm">
            ??Play Teardown
          </button>
        )}
        <button onClick={reset} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-sm">Reset</button>
      </div>

      {/* Key insight */}
      <div className="bg-teal-950 border border-teal-700 rounded-xl px-5 py-2 text-sm text-teal-200 font-medium">
        ?’¡ TCP costs <strong>1 RTT</strong> just to establish a connection ??this is why <strong>persistent HTTP</strong> reuses connections instead of opening one per object.
      </div>

      {/* Sequence diagram */}
      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden flex">

        {/* Client column */}
        <div className="w-40 flex flex-col items-center pt-6 z-10">
          <div className="w-28 py-3 bg-teal-900 border-2 border-teal-500 rounded-xl text-center font-black text-sm text-white">CLIENT</div>
          <div className="w-0.5 flex-1 bg-teal-800/50 mt-1" />
          <div className="mb-4 text-center">
            <div className="font-mono text-xs px-2 py-1 bg-black/40 border border-teal-800 rounded text-teal-300">
              {isDone ? 'ESTABLISHED' : currentClientState}
            </div>
            {teardownStep >= 4 && (
              <div className="font-mono text-[10px] text-orange-400 mt-1 bg-orange-950 px-2 py-0.5 rounded">
                TIME_WAIT<br/>(2 Ã— MSL)
              </div>
            )}
          </div>
        </div>

        {/* Middle diagram area */}
        <div className="flex-1 relative">
          {/* RTT bracket */}
          {step >= 3 && (
            <div className="absolute right-2 top-[20%] flex flex-col items-center"
              style={{ height: '55%' }}>
              <div className="h-full border-r-2 border-dashed border-gray-500 relative">
                <div className="absolute -left-1 top-0 w-2 border-t border-gray-500" />
                <div className="absolute -left-1 bottom-0 w-2 border-b border-gray-500" />
                <div className="absolute -left-16 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 text-right whitespace-nowrap">
                  1 RTT before<br />data can flow
                </div>
              </div>
            </div>
          )}

          {/* Setup arrows */}
          {SETUP_STEPS.slice(0, step).map((s, i) => (
            <Arrow key={i} from={s.from} to={s.to} label={s.label} color={s.color} yPct={setupYs[i]} />
          ))}

          {/* Step notes */}
          {step > 0 && step <= SETUP_STEPS.length && (
            <div className="absolute bottom-4 left-4 right-12 bg-black/70 border border-white/10 rounded-lg px-4 py-2 text-xs text-gray-300 font-mono">
              {SETUP_STEPS[step - 1].note}
            </div>
          )}

          {/* Teardown arrows */}
          {showTeardown && TEARDOWN_STEPS.slice(0, teardownStep).map((s, i) => (
            <Arrow key={`td-${i}`} from={s.from} to={s.to} label={s.label} color={s.color} yPct={teardownYs[i]} />
          ))}

          {teardownStep >= 4 && (
            <div className="absolute bottom-4 left-4 right-12 bg-orange-950/80 border border-orange-700 rounded-lg px-4 py-2 text-xs text-orange-200 font-mono">
              TIME_WAIT: client waits 2Ã—MSL (~120s) to ensure final ACK was received. Prevents old duplicate segments confusing a new connection.
            </div>
          )}
        </div>

        {/* Server column */}
        <div className="w-40 flex flex-col items-center pt-6 z-10">
          <div className="w-28 py-3 bg-indigo-900 border-2 border-indigo-500 rounded-xl text-center font-black text-sm text-white">SERVER</div>
          <div className="w-0.5 flex-1 bg-indigo-800/50 mt-1" />
          <div className="mb-4 text-center">
            <div className="font-mono text-xs px-2 py-1 bg-black/40 border border-indigo-800 rounded text-indigo-300">
              {isDone ? 'ESTABLISHED' : currentServerState}
            </div>
          </div>
        </div>

      </div>

      {/* Self Check Layer */}
      <SelfCheck questions={checkData} />
    </div>
  );
}

