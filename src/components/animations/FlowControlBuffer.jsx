import React, { useState, useEffect } from 'react';
import SelfCheck from '../SelfCheck';

export default function FlowControlBuffer() {
  const [senderBuffer, setSenderBuffer] = useState(0); // number of packets waiting
  const [receiverBuffer, setReceiverBuffer] = useState(0); // filled capacity
  const [rwnd, setRwnd] = useState(10);
  const maxBuffer = 10;
  
  const [packetsInFlight, setPacketsInFlight] = useState([]);
  const [acksInFlight, setAcksInFlight] = useState([]);
  
  const [appReadRate, setAppReadRate] = useState(1); // 1 = slow, 3 = fast
  
  useEffect(() => {
    // Receiver App reading
    const readTimer = setInterval(() => {
      setReceiverBuffer(prev => {
        const next = Math.max(0, prev - appReadRate);
        setRwnd(maxBuffer - next);
        return next;
      });
    }, 2000);
    return () => clearInterval(readTimer);
  }, [appReadRate]);

  useEffect(() => {
    // Sender generating
    const sendTimer = setInterval(() => {
      // Send up to rwnd
      if (rwnd > packetsInFlight.length) {
        const toSend = Math.min(2, rwnd - packetsInFlight.length); // Send 1 or 2 at a time
        if (toSend > 0) {
          const newPkts = Array.from({length: toSend}).map((_, i) => ({
            id: Date.now() + i,
            progress: 0
          }));
          setPacketsInFlight(prev => [...prev, ...newPkts]);
        }
      }
    }, 500);
    return () => clearInterval(sendTimer);
  }, [rwnd, packetsInFlight.length]);

  useEffect(() => {
    // Animation loop
    const animTimer = setInterval(() => {
      setPacketsInFlight(prev => {
        let reached = 0;
        const next = prev.map(p => {
          if (p.progress >= 100) { reached++; return null; }
          return { ...p, progress: p.progress + 10 };
        }).filter(Boolean);
        
        if (reached > 0) {
          setReceiverBuffer(b => Math.min(maxBuffer, b + reached));
          // send ACKs
          const newAcks = Array.from({length: reached}).map((_, i) => ({
            id: Date.now() + i,
            progress: 0,
            advertisedRwnd: Math.max(0, maxBuffer - (receiverBuffer + reached))
          }));
          setAcksInFlight(a => [...a, ...newAcks]);
        }
        return next;
      });

      setAcksInFlight(prev => {
        return prev.map(a => {
          if (a.progress >= 100) return null;
          return { ...a, progress: a.progress + 10 };
        }).filter(Boolean);
      });

    }, 100);
    return () => clearInterval(animTimer);
  }, [receiverBuffer]);

  const checkData = [
    {
      q: "혼잡 제어와 흐름 제어는 둘 다 송신 속도를 제한하는데, 무엇이 다른가?",
      a: "흐름 제어: 수신자의 버퍼가 넘치지 않도록 제한. 수신자가 rwnd로 알려준다.\n혼잡 제어: 네트워크 내부(라우터 큐)가 막히지 않도록 제한. sender가 스스로 cwnd를 조절.\n실제 TCP 송신량 = min(cwnd, rwnd). 두 제한 중 더 작은 쪽이 적용된다."
    },
    {
      q: "수신자 앱이 버퍼에서 데이터를 읽는 속도가 0이 되면 어떤 일이 일어나는가?\n이 상태가 영원히 지속되면 통신이 완전히 멈추는가?",
      a: "rwnd = 0이 되면 sender는 전송을 멈춘다.\n하지만 완전히 멈추지는 않는다 — TCP는 이 상태에서 1바이트짜리 probe 패킷을 주기적으로 보낸다.\n수신자가 버퍼를 비우면 rwnd > 0인 ACK를 돌려보내고, sender가 재개한다."
    }
  ];

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="mb-8 text-center max-w-2xl">
         <h3 className="text-xl font-bold text-teal-400 mb-2">TCP Flow Control</h3>
         <p className="text-sm text-gray-400">Receiver advertises <span className="text-white font-bold">rwnd (Receive Window)</span>. Sender never sends more than rwnd to avoid overflowing the receiver's buffer.</p>
         
         <div className="mt-4 flex justify-center space-x-4">
           <label className="text-sm text-white flex items-center space-x-2">
             <span>Receiver App Read Speed:</span>
             <select 
               className="bg-black/50 border border-white/20 rounded p-1 text-teal-400"
               value={appReadRate}
               onChange={(e) => setAppReadRate(Number(e.target.value))}
             >
               <option value={0}>Stopped (0 PKT/s)</option>
               <option value={1}>Slow (1 PKT/s)</option>
               <option value={3}>Fast (3 PKT/s)</option>
             </select>
           </label>
         </div>
      </div>

      <div className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-between px-24">
        
        {/* Sender */}
        <div className="w-48 bg-teal-900 border-2 border-teal-500 rounded-xl flex flex-col items-center p-4 shadow-xl z-20">
          <h3 className="text-lg font-black text-white">SENDER</h3>
          <div className="text-xs text-teal-300 mt-2 mb-4 text-center">
            Allowed to send:<br/>
            <span className="text-2xl font-bold text-white">{rwnd}</span> pkts
          </div>
        </div>

        {/* Network / Flight Path */}
        <div className="absolute inset-0 left-48 right-48 mx-12 pointer-events-none">
          <div className="w-full h-1 mt-[45%] border-b-2 border-dashed border-teal-800/50 absolute"></div>
          <div className="w-full h-1 mt-[55%] border-b-2 border-dashed border-indigo-800/50 absolute"></div>
          
          {packetsInFlight.map(p => (
            <div 
              key={p.id} 
              className="absolute w-6 h-6 bg-yellow-500 rounded transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(234,179,8,0.5)]"
              style={{ left: `${p.progress}%`, top: '45%', transform: 'translateY(-50%)' }}
            ></div>
          ))}

          {acksInFlight.map(a => (
            <div 
              key={a.id} 
              className="absolute w-12 h-6 bg-indigo-500 rounded transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(99,102,241,0.5)] flex items-center justify-center text-[10px] font-bold text-white"
              style={{ left: `${100 - a.progress}%`, top: '55%', transform: 'translateY(-50%)' }}
            >
              rwnd:{a.advertisedRwnd}
            </div>
          ))}
        </div>

        {/* Receiver */}
        <div className="w-48 bg-indigo-900 border-2 border-indigo-500 rounded-xl flex flex-col items-center p-4 shadow-xl z-20 relative">
          <h3 className="text-lg font-black text-white mb-4">RECEIVER</h3>
          
          {/* Buffer Visualizer */}
          <div className="w-full h-48 border-2 border-white/20 rounded-lg p-1 flex flex-col-reverse relative bg-black/30">
            <div className="absolute inset-0 flex flex-col justify-between py-1 px-2 pointer-events-none opacity-20">
               {Array.from({length: 10}).map((_, i) => <div key={i} className="h-px w-full bg-white"></div>)}
            </div>
            
            {Array.from({length: receiverBuffer}).map((_, i) => (
              <div key={i} className="w-full h-[10%] p-0.5">
                <div className="w-full h-full bg-yellow-500 rounded-sm"></div>
              </div>
            ))}
          </div>

          <div className="text-xs font-bold text-red-400 mt-4 text-center">
            {receiverBuffer >= maxBuffer ? 'BUFFER FULL!' : `Remaining Capacity: ${maxBuffer - receiverBuffer}`}
          </div>

        </div>

      </div>

      {/* Self Check Layer */}
      <SelfCheck questions={checkData} />
    </div>
  );
}
