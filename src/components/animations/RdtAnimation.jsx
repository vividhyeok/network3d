import React, { useState, useEffect, useRef } from 'react';
import SelfCheck from '../SelfCheck';

const FLIGHT_TIME = 2000;

/* ?€?€?€ Packet flying across the lane ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€ */
function PacketPill({ pkt, onComplete }) {
  const [pos, setPos] = useState(pkt.isAck ? 100 : 0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const t1 = setTimeout(() => setPos(pkt.isAck ? 0 : 100), 50);
    if (pkt.status === 'lost') {
      const t2 = setTimeout(() => setOpacity(0), FLIGHT_TIME * 0.4);
      const t3 = setTimeout(() => onComplete({ ...pkt, disappeared: true }), FLIGHT_TIME * 0.55);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else {
      const t2 = setTimeout(() => onComplete(pkt), FLIGHT_TIME + 100);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, []);

  let bg = 'bg-yellow-500';
  if (pkt.isAck && pkt.type === 'ack') bg = 'bg-green-500';
  if (pkt.isAck && pkt.type === 'nak') bg = 'bg-red-500';
  if (pkt.corrupted) bg = 'bg-purple-500';
  if (pkt.discarded) bg = 'bg-gray-600';

  return (
    <div className={`absolute top-1/2 -translate-y-1/2 ${bg} border-2 border-white/40 rounded-lg flex flex-col items-center justify-center font-bold text-[11px] text-white shadow-lg`}
      style={{ width: 56, height: 56, left: `${pos}%`, transition: `left ${FLIGHT_TIME}ms linear`, opacity, marginLeft: -28 }}>
      <div>{pkt.type?.toUpperCase()}</div>
      {pkt.seq != null && <div>#{pkt.seq}</div>}
      {pkt.corrupted && <div className="text-[9px] text-red-200">CORRUPT</div>}
      {pkt.discarded && <div className="text-[9px] text-gray-300">DISCARD</div>}
    </div>
  );
}

/* ?€?€?€ Pipelining sub-component ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€ */
function PipeliningView() {
  const N = 4; // packet count in queue
  const [protocol, setProtocol] = useState('gbn'); // gbn | sr
  const [windowSize, setWindowSize] = useState(3);
  const [phase, setPhase] = useState('idle'); // idle | sending | dropped | retransmit
  const [windowBase, setWindowBase] = useState(0);
  const [ackedUpTo, setAckedUpTo] = useState(-1);
  const [droppedPkt, setDroppedPkt] = useState(null); // index of dropped packet
  const [srBuffer, setSrBuffer] = useState([]); // SR: buffered out-of-order packets
  const [log, setLog] = useState([]);
  const addLog = msg => setLog(p => [msg, ...p].slice(0, 8));

  const TOTAL = 8; // total packets to send in demo

  const reset = () => {
    setPhase('idle');
    setWindowBase(0);
    setAckedUpTo(-1);
    setDroppedPkt(null);
    setSrBuffer([]);
    setLog([]);
  };

  useEffect(() => { reset(); }, [protocol]);

  const startSending = () => {
    setPhase('sending');
    addLog(`Sending pkts 0??{windowSize - 1} (window=${windowSize})`);
  };

  const injectLoss = () => {
    if (phase !== 'sending') return;
    const drop = windowBase + 1; // drop 2nd in window
    setDroppedPkt(drop);
    setPhase('dropped');
    addLog(`??Packet #${drop} LOST in network`);

    setTimeout(() => {
      if (protocol === 'gbn') {
        addLog(`GBN: Retransmit from #${drop} onward`);
        setWindowBase(drop);
        setPhase('retransmit');
      } else {
        addLog(`SR: Only retransmit #${drop}, buffer others`);
        setSrBuffer([drop + 1, drop + 2].filter(x => x < TOTAL));
        setPhase('retransmit');
      }
    }, 2000);
  };

  const advanceWindow = () => {
    const next = ackedUpTo + 1;
    if (next >= TOTAL) return;
    setAckedUpTo(next);
    setWindowBase(Math.min(next + 1, TOTAL));
    addLog(`ACK #${next} received ??window slides to [${Math.min(next + 1, TOTAL)}..${Math.min(next + windowSize, TOTAL - 1)}]`);
  };

  // Render packet slots
  const packets = Array.from({ length: TOTAL }, (_, i) => {
    let status = 'unsent';
    if (i <= ackedUpTo) status = 'acked';
    else if (i === droppedPkt && (phase === 'dropped' || phase === 'retransmit')) status = 'dropped';
    else if (protocol === 'sr' && srBuffer.includes(i)) status = 'buffered';
    else if (i >= windowBase && i < windowBase + windowSize) status = 'inflight';
    return { i, status };
  });

  const statusColor = {
    unsent:   'bg-gray-800 border-gray-600 text-gray-500',
    acked:    'bg-emerald-800 border-emerald-500 text-emerald-200',
    inflight: 'bg-blue-700 border-blue-400 text-white',
    dropped:  'bg-red-800 border-red-500 text-red-200',
    buffered: 'bg-orange-700 border-orange-400 text-white',
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center bg-black/40 px-5 py-3 rounded-xl border border-white/10">
        <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Protocol</span>
        {['gbn', 'sr'].map(p => (
          <button key={p} onClick={() => { setProtocol(p); }}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${protocol === p ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
            {p === 'gbn' ? 'Go-Back-N' : 'Selective Repeat'}
          </button>
        ))}
        <div className="w-px h-5 bg-white/20" />
        <span className="text-xs text-gray-400">Window N=</span>
        {[2, 3, 4].map(n => (
          <button key={n} onClick={() => setWindowSize(n)}
            className={`w-8 h-8 rounded font-bold text-sm ${windowSize === n ? 'bg-teal-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {n}
          </button>
        ))}
        <div className="w-px h-5 bg-white/20" />
        <button onClick={startSending} disabled={phase !== 'idle'}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-900 disabled:text-gray-500 text-white rounded-lg font-bold text-sm">
          ??Start
        </button>
        <button onClick={injectLoss} disabled={phase !== 'sending'}
          className="px-4 py-2 bg-red-700 hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg font-bold text-sm">
          ?’¥ Drop Pkt #{(windowBase + 1)}
        </button>
        <button onClick={advanceWindow} disabled={phase !== 'sending'}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg font-bold text-sm">
          ??Receive ACK
        </button>
        <button onClick={reset} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-sm">
          Reset
        </button>
      </div>

      {/* Protocol label */}
      <div className={`text-center py-2 rounded-lg font-bold text-sm ${protocol === 'gbn' ? 'bg-red-900/30 border border-red-700 text-red-300' : 'bg-orange-900/30 border border-orange-700 text-orange-300'}`}>
        {protocol === 'gbn'
          ? 'GBN: on loss, retransmit dropped packet AND everything after it'
          : 'SR: on loss, retransmit ONLY the dropped packet ??receiver buffers out-of-order'}
      </div>

      {/* Packet queue visual */}
      <div className="bg-black/30 rounded-xl border border-white/10 p-4">
        <div className="flex items-center gap-1 mb-3">
          <span className="text-xs text-gray-500 font-mono mr-2">Sender queue ??/span>
          {packets.map(({ i, status }) => (
            <div key={i}
              className={`relative w-12 h-12 border-2 rounded-lg flex flex-col items-center justify-center text-xs font-bold transition-all duration-500 ${statusColor[status]}`}>
              <span>#{i}</span>
              {status === 'dropped' && <span className="text-[9px] text-red-300">LOST</span>}
              {status === 'buffered' && <span className="text-[9px] text-orange-200">BUF</span>}
              {status === 'acked' && <span className="text-[9px] text-emerald-300">ACK</span>}
            </div>
          ))}
        </div>

        {/* Sliding window bracket */}
        {phase !== 'idle' && (
          <div className="relative h-6 mt-1">
            <div className="absolute h-full border-2 border-teal-400 border-dashed rounded-lg transition-all duration-700"
              style={{
                left: `${(windowBase / TOTAL) * 100 + 0.5}%`,
                width: `${(Math.min(windowSize, TOTAL - windowBase) / TOTAL) * 100 - 1}%`,
              }}>
              <span className="absolute -top-5 left-1 text-[10px] text-teal-400 font-bold">Window [N={windowSize}]</span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-4 mt-6 text-xs">
          {[['Unsent','bg-gray-800 border border-gray-600'],['In Window','bg-blue-700 border border-blue-400'],
            ['ACKed','bg-emerald-800 border border-emerald-500'],['Dropped','bg-red-800 border border-red-500'],
            ['Buffered (SR)','bg-orange-700 border border-orange-400']].map(([l, cls]) => (
            <div key={l} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${cls}`}/>
              <span className="text-gray-400">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Log */}
      <div className="flex-1 bg-black/50 rounded-xl p-4 border border-white/10 font-mono text-xs overflow-y-auto">
        {log.map((l, i) => <div key={i} className="text-gray-300 mb-0.5">&gt; {l}</div>)}
        {log.length === 0 && <span className="text-gray-600">Press Start to begin simulation</span>}
      </div>
    </div>
  );
}

/* ?€?€?€ Main RDT component ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€ */
export default function RdtAnimation() {
  const [mode, setMode] = useState('1.0');
  const [packets, setPackets] = useState([]);
  const [senderSeq, setSenderSeq] = useState(0);
  const [receiverSeq, setReceiverSeq] = useState(0);
  const [log, setLog] = useState([]);
  const [isWaitingAck, setIsWaitingAck] = useState(false);
  const timerRef = useRef(null);

  const checkData = [
    {
      q: "RDT 2.0?ì„œ NAK ?€??ACKë§??¬ìš©?????†ëŠ”ê°€?\n(?ŒíŠ¸: ACK??ë²ˆí˜¸ë¥?ë¶™ì¸?¤ë©´?)",
      a: "ê°€?¥í•˜?? ACK 0 / ACK 1ì²˜ëŸ¼ ë§ˆì?ë§‰ìœ¼ë¡??¬ë°”ë¥´ê²Œ ë°›ì? ?¨í‚· ë²ˆí˜¸ë¥?ACK??ë¶™ì´ë©?nNAK ?†ì´??'ë¬´ì—‡??ë°›ì•˜?”ì?' ?„ë‹¬?????ˆë‹¤.\n?¤ì œë¡?RDT 3.0ê³?TCP??NAK ?†ì´ ?„ì  ACK ë°©ì‹???¬ìš©?œë‹¤."
    },
    {
      q: "RDT 3.0?ì„œ ?€?´ë¨¸ê°€ ?ˆë¬´ ì§§ìœ¼ë©?/ ?ˆë¬´ ê¸¸ë©´ ê°ê° ?´ë–¤ ë¬¸ì œê°€ ?ê¸°?”ê??",
      a: "?ˆë¬´ ì§§ìœ¼ë©? ?„ì§ ?„ë‹¬ ì¤‘ì¸ ?¨í‚·???ì‹¤ë¡??¤íŒ ??ë¶ˆí•„?”í•œ ?¬ì „????¦ ???¤íŠ¸?Œí¬ ??¹„.\n?ˆë¬´ ê¸¸ë©´: ?¤ì œ ?ì‹¤??ë°œìƒ?´ë„ ?¤ëž˜ ê¸°ë‹¤ë¦??„ì—???¬ì „????ì§€??ì¦ê?.\nTCP??RTTë¥?ì¸¡ì •?˜ì—¬ ?™ì ?¼ë¡œ ?€?´ë¨¸ë¥?ì¡°ì ˆ?œë‹¤."
    },
    {
      q: "GBNê³?SR ì¤??˜ì‹ ??ë²„í¼ê°€ ?„ìš”??ìª½ì? ?´ëŠ ìª½ì¸ê°€?\n??GBN?€ ë²„í¼ê°€ ?„ìš” ?†ëŠ”ê°€?",
      a: "SR: ?œì„œê°€ ?´ê¸‹???¨í‚·???„ì‹œ ?€?¥í•´???˜ë?ë¡?ë²„í¼ ?„ìš”.\nGBN: ?œì„œê°€ ?´ê¸‹???¨í‚·?€ ?„ë? ë²„ë¦°?? ë²„í¼???€?¥í•˜ì§€ ?Šê³  ì¦‰ì‹œ ?ê¸°.\nê·¸ëž˜??GBN?€ êµ¬í˜„???¨ìˆœ?˜ì?ë§??¨í‚· ?ì‹¤ ????¹„ê°€ ?¬ê³ ,\nSR?€ ë³µìž¡?˜ì?ë§??¨ìœ¨?ì´??"
    }
  ];

  const addLog = msg => setLog(p => [msg, ...p].slice(0, 10));

  const resetAll = () => {
    setPackets([]);
    setSenderSeq(0);
    setReceiverSeq(0);
    setIsWaitingAck(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setLog([]);
  };

  useEffect(() => { resetAll(); }, [mode]);

  const startPacket = (corrupt = false, lose = false) => {
    if (isWaitingAck) return;
    const seq = mode === '3.0' ? senderSeq % 2 : senderSeq;
    const pkt = { id: Date.now(), type: 'data', seq, corrupted: corrupt, status: lose ? 'lost' : 'flying', isAck: false };
    setPackets(p => [...p, pkt]);
    setIsWaitingAck(true);
    addLog(`Sender ??pkt#${seq}${corrupt ? ' (CORRUPT)' : lose ? ' (will be LOST)' : ''}`);

    if (mode === '3.0') {
      timerRef.current = setTimeout(() => {
        addLog(`??Timeout! Retransmitting pkt#${seq}`);
        setIsWaitingAck(false);
        setPackets([]);
        setTimeout(() => startPacket(false, false), 100);
      }, FLIGHT_TIME * 2 + 500);
    }
  };

  const sendFeedback = (type, seq) => {
    const fb = { id: Date.now() + 1, type, seq, corrupted: false, status: 'flying', isAck: true };
    setPackets(p => [...p, fb]);
  };

  const handlePacketComplete = pkt => {
    if (pkt.disappeared) {
      setPackets(p => p.filter(x => x.id !== pkt.id));
      addLog(`??Packet lost in network`);
      return;
    }
    setPackets(p => p.filter(x => x.id !== pkt.id));

    if (!pkt.isAck) {
      if (mode === '1.0') {
        addLog(`Receiver ??pkt#${pkt.seq} ??);
        setSenderSeq(s => s + 1);
        setIsWaitingAck(false);
      } else if (mode === '2.0') {
        if (pkt.corrupted) {
          addLog(`Receiver: CHECKSUM FAIL ??NAK`);
          sendFeedback('nak', pkt.seq);
        } else {
          addLog(`Receiver ??pkt#${pkt.seq} ????ACK`);
          sendFeedback('ack', pkt.seq);
        }
      } else if (mode === '3.0') {
        if (pkt.corrupted) {
          addLog(`Receiver: pkt corrupt, ignoring`);
        } else if (pkt.seq !== receiverSeq) {
          addLog(`Receiver: dup pkt#${pkt.seq}, re-ACK`);
          sendFeedback('ack', pkt.seq);
        } else {
          addLog(`Receiver ??pkt#${pkt.seq} ????ACK${pkt.seq}`);
          setReceiverSeq(s => (s + 1) % 2);
          sendFeedback('ack', pkt.seq);
        }
      }
    } else {
      // ACK arrived at sender
      if (mode === '2.0') {
        if (pkt.type === 'nak') {
          addLog(`Sender ??NAK ??retransmit`);
          setIsWaitingAck(false);
          setTimeout(() => startPacket(false, false), 100);
        } else {
          addLog(`Sender ??ACK ??);
          setSenderSeq(s => s + 1);
          setIsWaitingAck(false);
        }
      } else if (mode === '3.0') {
        if (pkt.type === 'ack' && pkt.seq === senderSeq % 2) {
          addLog(`Sender ??ACK${pkt.seq} ????timer stopped`);
          clearTimeout(timerRef.current);
          setSenderSeq(s => s + 1);
          setIsWaitingAck(false);
        } else {
          addLog(`Sender ??stale ACK${pkt.seq}, ignore`);
        }
      }
    }
  };

  const MODES = [
    { id: '1.0', label: 'RDT 1.0', desc: 'Perfect channel ??no errors' },
    { id: '2.0', label: 'RDT 2.0', desc: 'Bit errors ??checksum + ACK/NAK' },
    { id: '3.0', label: 'RDT 3.0', desc: 'Packet loss ??seq numbers + timer' },
    { id: 'pipeline', label: 'Pipelining', desc: 'Window of N packets in flight' },
  ];

  if (mode === 'pipeline') {
    return (
      <div className="w-full flex-1 flex flex-col">
        <div className="flex gap-3 mb-4 bg-black/40 px-4 py-3 rounded-xl border border-white/10 flex-wrap">
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${mode === m.id ? 'bg-teal-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <PipeliningView />
        </div>
        
        {/* Self Check Layer */}
        <SelfCheck questions={checkData} />
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Mode tabs */}
      <div className="flex gap-3 mb-4 bg-black/40 px-4 py-3 rounded-xl border border-white/10 flex-wrap">
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${mode === m.id ? 'bg-teal-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Desc */}
      <div className="text-center text-sm font-bold text-gray-400 mb-2 tracking-wide">
        {MODES.find(m => m.id === mode)?.desc}
      </div>

      {/* Animation area */}
      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-between px-20">
        {/* Sender */}
        <div className="w-44 h-[62%] bg-teal-900 border-2 border-teal-500 rounded-xl flex flex-col items-center p-4 z-10 shadow-2xl">
          <h3 className="text-lg font-black text-white">SENDER</h3>
          <div className="mt-3 text-center space-y-1">
            <p className="text-teal-300 text-sm font-mono">Seq: {mode === '3.0' ? senderSeq % 2 : senderSeq}</p>
            {isWaitingAck && <p className="text-xs text-yellow-400 animate-pulse">??Waiting ACK</p>}
            {timerRef.current && mode === '3.0' && <p className="text-xs text-red-400">??Timer running</p>}
          </div>
          <div className="mt-auto flex flex-col w-full gap-2">
            <button onClick={() => startPacket(false, false)} disabled={isWaitingAck}
              className="bg-teal-500 disabled:bg-teal-900 disabled:text-gray-600 hover:bg-teal-400 text-white py-2 rounded-lg font-bold text-sm">
              Send Normal
            </button>
            {mode === '2.0' && (
              <button onClick={() => startPacket(true, false)} disabled={isWaitingAck}
                className="bg-purple-700 disabled:bg-purple-950 hover:bg-purple-600 text-white py-2 rounded-lg font-bold text-sm">
                Send Corrupt
              </button>
            )}
            {mode === '3.0' && <>
              <button onClick={() => startPacket(false, true)} disabled={isWaitingAck}
                className="bg-red-700 disabled:bg-red-950 hover:bg-red-600 text-white py-2 rounded-lg font-bold text-sm">
                Lose in Transit
              </button>
              <button onClick={() => startPacket(true, false)} disabled={isWaitingAck}
                className="bg-purple-700 disabled:bg-purple-950 hover:bg-purple-600 text-white py-2 rounded-lg font-bold text-sm">
                Send Corrupt
              </button>
            </>}
          </div>
        </div>

        {/* Flight lane */}
        <div className="absolute inset-0 mx-48 flex items-center pointer-events-none">
          <div className="w-full border-b-2 border-dashed border-white/10 absolute" />
          {packets.map(pkt => (
            <PacketPill key={pkt.id} pkt={pkt} onComplete={handlePacketComplete} />
          ))}
        </div>

        {/* Receiver */}
        <div className="w-44 h-[62%] bg-indigo-900 border-2 border-indigo-500 rounded-xl flex flex-col items-center p-4 z-10 shadow-2xl">
          <h3 className="text-lg font-black text-white">RECEIVER</h3>
          {mode === '3.0' && (
            <p className="mt-3 text-indigo-300 text-sm font-mono">Expecting: #{receiverSeq}</p>
          )}
          {mode === '2.0' && (
            <p className="mt-3 text-indigo-300 text-xs text-center">Sends ACK on OK<br/>NAK on corrupt</p>
          )}
        </div>
      </div>

      {/* Log */}
      <div className="h-28 mt-3 bg-black/60 rounded-xl px-4 py-3 overflow-y-auto font-mono text-xs border border-white/10">
        {log.map((l, i) => <div key={i} className="text-gray-300 mb-0.5">&gt; {l}</div>)}
        {log.length === 0 && <span className="text-gray-600">Press a send button to start</span>}
      </div>

      {/* Self Check Layer */}
      <SelfCheck questions={checkData} />
    </div>
  );
}
