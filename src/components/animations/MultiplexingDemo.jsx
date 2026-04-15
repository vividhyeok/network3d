import React, { useState, useEffect, useRef } from 'react';
import SelfCheck from '../SelfCheck';

const PROCESSES = [
  { port: 80,    name: 'HTTP Server',   color: '#0ea5e9', bg: 'bg-sky-900',    border: 'border-sky-500' },
  { port: 53,    name: 'DNS Server',    color: '#8b5cf6', bg: 'bg-violet-900', border: 'border-violet-500' },
  { port: 12345, name: 'Custom App',   color: '#f59e0b', bg: 'bg-amber-900',  border: 'border-amber-500' },
];

const INCOMING_PACKETS = [
  { id: 1, srcIP: '12.0.0.1', srcPort: 5001, dstPort: 80,    label: 'HTTP GET' },
  { id: 2, srcIP: '99.0.0.1', srcPort: 6200, dstPort: 53,    label: 'DNS Query' },
  { id: 3, srcIP: '12.0.0.1', srcPort: 5002, dstPort: 12345, label: 'Custom Data' },
  { id: 4, srcIP: '45.0.0.2', srcPort: 7100, dstPort: 80,    label: 'HTTP GET (diff client)' },
];

function PacketTag({ pkt, tcpMode, progress, resolved, targetPort }) {
  // progress: 0-100 = falling down, resolved: bool
  const resolvedProc = PROCESSES.find(p => p.port === pkt.dstPort);

  return (
    <div className="absolute left-1/2 -translate-x-1/2 transition-all duration-700"
      style={{
        top: resolved ? '78%' : `${5 + progress * 0.55}%`,
        opacity: progress > 5 ? 1 : 0,
      }}>
      <div className={`px-3 py-1.5 rounded-lg border-2 text-xs font-mono font-bold whitespace-nowrap shadow-xl`}
        style={{ borderColor: resolvedProc?.color || '#fff', color: resolvedProc?.color || '#fff', backgroundColor: 'rgba(0,0,0,0.8)' }}>
        [{pkt.srcIP}:{pkt.srcPort} ??:{pkt.dstPort}] {pkt.label}
        {tcpMode && <div className="text-[10px] mt-0.5 text-gray-300">4-tuple: {pkt.srcIP}:{pkt.srcPort} ??HOST:{pkt.dstPort}</div>}
      </div>
    </div>
  );
}

export default function MultiplexingDemo() {
  const [tcpMode, setTcpMode] = useState(false); // false = UDP, true = TCP
  const [activePackets, setActivePackets] = useState([]); // {pkt, progress, resolved}
  const [highlightedSocket, setHighlightedSocket] = useState(null);
  const [log, setLog] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const queueRef = useRef([...INCOMING_PACKETS]);
  const timersRef = useRef([]);

  const checkData = [
    {
      q: "???œë²„ê°€ port 80 ?˜ë‚˜ë§??´ì–´???˜ì²œ ëª…ì˜ ?´ë¼?´ì–¸?¸ë? ?™ì‹œ??ì²˜ë¦¬?????ˆëŠ” ?´ìœ ??",
      a: "TCP??4-tuple (src IP, src port, dst IP, dst port)ë¡??Œì¼“??êµ¬ë¶„?œë‹¤.\n?´ë¼?´ì–¸?¸ë§ˆ??src IP ?ëŠ” src portê°€ ?¤ë¥´ë¯€ë¡?dst portê°€ ëª¨ë‘ 80?´ì–´??nê°ê° ?¤ë¥¸ ?Œì¼“?¼ë¡œ ?¼ìš°?…ëœ??\n?œë²„ ?…ìž¥?ì„œ??port 80?¼ë¡œ ?¤ì–´?¤ëŠ” ?°ê²°ë§ˆë‹¤ ë³„ë„ ?Œì¼“???ì„±?œë‹¤."
    },
    {
      q: "UDP?ì„œ ???´ë¼?´ì–¸?¸ê? ê°™ì? ?œë²„??ê°™ì? ?¬íŠ¸ë¡??¨í‚·??ë³´ë‚´ë©??´ë–»ê²??˜ëŠ”ê°€?\nTCP?€ ?´ë–»ê²??¤ë¥¸ê°€?",
      a: "UDP: dst portë§Œìœ¼ë¡??Œì¼“??ê²°ì •?˜ë?ë¡????¨í‚·??ê°™ì? ?Œì¼“?¼ë¡œ ?¤ì–´ê°„ë‹¤.\n? í”Œë¦¬ì??´ì…˜??src IP/portë¥?ì§ì ‘ ?½ì–´???„ê? ë³´ëƒˆ?”ì? êµ¬ë¶„?´ì•¼ ?œë‹¤.\nTCP: 4-tuple???¤ë¥´ë©?ë³„ë„ ?Œì¼“ ???ë™?¼ë¡œ ?°ê²°ë³?êµ¬ë¶„?œë‹¤."
    }
  ];

  const addLog = msg => setLog(p => [msg, ...p].slice(0, 8));

  const clearAll = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setActivePackets([]);
    setHighlightedSocket(null);
    setLog([]);
    setIsRunning(false);
    queueRef.current = [...INCOMING_PACKETS];
  };

  useEffect(() => { clearAll(); }, [tcpMode]);

  const sendNextPacket = () => {
    if (queueRef.current.length === 0) {
      setIsRunning(false);
      return;
    }
    const pkt = queueRef.current.shift();

    // Add packet, let it fall
    setActivePackets(prev => [...prev, { pkt, progress: 0, resolved: false, id: pkt.id }]);

    // Animate progress
    let prog = 0;
    const progTimer = setInterval(() => {
      prog += 5;
      setActivePackets(prev => prev.map(p => p.id === pkt.id ? { ...p, progress: prog } : p));
      if (prog >= 100) {
        clearInterval(progTimer);
        // Resolve
        const proc = PROCESSES.find(p => p.port === pkt.dstPort);
        if (proc) {
          const socketKey = tcpMode ? `${pkt.dstPort}-${pkt.srcIP}:${pkt.srcPort}` : `${pkt.dstPort}`;
          setHighlightedSocket(socketKey);
          setActivePackets(prev => prev.map(p => p.id === pkt.id ? { ...p, resolved: true } : p));
          if (tcpMode) {
            addLog(`TCP 4-tuple match: [${pkt.srcIP}:${pkt.srcPort} ??:${pkt.dstPort}] ??${proc.name}`);
          } else {
            addLog(`UDP dst port ${pkt.dstPort} ??${proc.name}`);
          }
          const t = setTimeout(() => {
            setActivePackets(prev => prev.filter(p => p.id !== pkt.id));
            setHighlightedSocket(null);
            // send next
            const t2 = setTimeout(sendNextPacket, 400);
            timersRef.current.push(t2);
          }, 1200);
          timersRef.current.push(t);
        }
      }
    }, 80);
    timersRef.current.push(progTimer);
  };

  const start = () => {
    clearAll();
    setIsRunning(true);
    queueRef.current = [...INCOMING_PACKETS];
    // slight delay before first
    const t = setTimeout(sendNextPacket, 400);
    timersRef.current.push(t);
  };

  // For TCP mode, port 80 has TWO different connections from different clients
  const port80Connections = tcpMode
    ? INCOMING_PACKETS.filter(p => p.dstPort === 80)
    : [];

  return (
    <div className="w-full flex-1 flex flex-col gap-3">
      {/* Controls */}
      <div className="flex items-center gap-4 bg-black/40 px-5 py-3 rounded-xl border border-white/10">
        <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Demux Mode</span>
        <button onClick={() => setTcpMode(false)}
          className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${!tcpMode ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
          UDP (dst port only)
        </button>
        <button onClick={() => setTcpMode(true)}
          className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${tcpMode ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
          TCP (4-tuple)
        </button>
        <div className="w-px h-5 bg-white/20" />
        <button onClick={start} disabled={isRunning}
          className="px-5 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-900 disabled:text-gray-500 text-white rounded-lg font-bold text-sm">
          ??Simulate
        </button>
        <button onClick={clearAll} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-sm">Reset</button>
      </div>

      {/* Mode insight */}
      <div className={`px-5 py-2 rounded-xl text-sm font-medium border ${tcpMode ? 'bg-blue-950/30 border-blue-700 text-blue-200' : 'bg-teal-950/30 border-teal-700 text-teal-200'}`}>
        {tcpMode
          ? '?”µ TCP: router identifies a connection by all 4 values ??same dst port 80 can serve many simultaneous connections'
          : '?Ÿ¢ UDP: Transport Layer only reads dst port ??routes to the matching socket regardless of source'}
      </div>

      <div className="flex-1 flex gap-4">
        {/* Network arrival area */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden">
          <div className="absolute top-3 left-0 right-0 text-center font-bold text-xs text-gray-400 uppercase tracking-widest">Incoming Packets (Network)</div>

          {/* Transport Layer band */}
          <div className="absolute left-0 right-0 bg-indigo-950/60 border-y border-indigo-800/40 text-center z-20"
            style={{ top: '55%', height: '12%' }}>
            <div className="h-full flex items-center justify-center">
              <span className="text-indigo-300 font-bold text-xs uppercase tracking-widest">Transport Layer ??reads dst port{tcpMode ? ' + src IP:port' : ''}</span>
            </div>
          </div>

          {/* Sockets */}
          <div className="absolute left-0 right-0 flex justify-around px-6" style={{ bottom: '5%', height: '22%' }}>
            {PROCESSES.map(proc => {
              const socketKey = (tcpMode && proc.port === 80) ? null : `${proc.port}`;
              const isHighlighted = highlightedSocket === socketKey;

              if (tcpMode && proc.port === 80) {
                // Show 2 separate sockets for port 80
                return port80Connections.map(conn => {
                  const key = `80-${conn.srcIP}:${conn.srcPort}`;
                  const lit = highlightedSocket === key;
                  return (
                    <div key={key}
                      className={`rounded-xl border-2 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 ${proc.bg} ${lit ? 'border-white scale-105 shadow-[0_0_20px_rgba(14,165,233,0.6)]' : proc.border}`}
                      style={{ flex: '0 0 15%' }}>
                      <div style={{ color: proc.color }}>:{proc.port}</div>
                      <div className="text-gray-400 text-[9px]">from {conn.srcIP}</div>
                      <div className="text-[9px] text-white">{proc.name}</div>
                    </div>
                  );
                });
              }

              return (
                <div key={proc.port}
                  className={`rounded-xl border-2 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 ${proc.bg} ${isHighlighted ? 'border-white scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : proc.border}`}
                  style={{ flex: '0 0 18%' }}>
                  <div style={{ color: proc.color }}>:{proc.port}</div>
                  <div className="text-[10px] text-gray-300 text-center px-1">{proc.name}</div>
                </div>
              );
            })}
          </div>

          {/* Flying packets */}
          {activePackets.map(({ pkt, progress, resolved, id }) => (
            <PacketTag key={id} pkt={pkt} tcpMode={tcpMode} progress={progress} resolved={resolved} />
          ))}
        </div>

        {/* Log panel */}
        <div className="w-72 bg-black/40 border border-white/10 rounded-xl p-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Demux Log</h4>
          <div className="font-mono text-xs space-y-2 overflow-y-auto" style={{ maxHeight: '100%' }}>
            {log.map((l, i) => <div key={i} className="text-gray-300 leading-relaxed">&gt; {l}</div>)}
            {log.length === 0 && <span className="text-gray-600">Press Simulate to begin</span>}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 text-[10px] text-gray-500 leading-relaxed">
            {tcpMode
              ? 'TCP needs all 4 values (src IP, src port, dst IP, dst port) to identify which connection socket to use. A web server can handle thousands of connections on port 80 simultaneously.'
              : 'UDP only checks dst port. All packets to port 80 go to the same socket ??there is no concept of separate connections.'}
          </div>
        </div>
      </div>

      {/* Self Check Layer */}
      <SelfCheck questions={checkData} />
    </div>
  );
}
