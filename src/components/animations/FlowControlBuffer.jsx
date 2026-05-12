import React, { useState, useEffect } from 'react';
import TutorialSlider from '../TutorialSlider';

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
      q: "?¼ìž¡ ?œì–´?€ ?ë¦„ ?œì–´???????¡ì‹  ?ë„ë¥??œí•œ?˜ëŠ”?? ë¬´ì—‡???¤ë¥¸ê°€?",
      a: "?ë¦„ ?œì–´: ?˜ì‹ ?ì˜ ë²„í¼ê°€ ?˜ì¹˜ì§€ ?Šë„ë¡??œí•œ. ?˜ì‹ ?ê? rwndë¡??Œë ¤ì¤€??\n?¼ìž¡ ?œì–´: ?¤íŠ¸?Œí¬ ?´ë?(?¼ìš°????ê°€ ë§‰ížˆì§€ ?Šë„ë¡??œí•œ. senderê°€ ?¤ìŠ¤ë¡?cwndë¥?ì¡°ì ˆ.\n?¤ì œ TCP ?¡ì‹ ??= min(cwnd, rwnd). ???œí•œ ì¤????‘ì? ìª½ì´ ?ìš©?œë‹¤."
    },
    {
      q: "?˜ì‹ ???±ì´ ë²„í¼?ì„œ ?°ì´?°ë? ?½ëŠ” ?ë„ê°€ 0???˜ë©´ ?´ë–¤ ?¼ì´ ?¼ì–´?˜ëŠ”ê°€?\n???íƒœê°€ ?ì›??ì§€?ë˜ë©??µì‹ ???„ì „??ë©ˆì¶”?”ê??",
      a: "rwnd = 0???˜ë©´ sender???„ì†¡??ë©ˆì¶˜??\n?˜ì?ë§??„ì „??ë©ˆì¶”ì§€???ŠëŠ”????TCP?????íƒœ?ì„œ 1ë°”ì´?¸ì§œë¦?probe ?¨í‚·??ì£¼ê¸°?ìœ¼ë¡?ë³´ë‚¸??\n?˜ì‹ ?ê? ë²„í¼ë¥?ë¹„ìš°ë©?rwnd > 0??ACKë¥??Œë ¤ë³´ë‚´ê³? senderê°€ ?¬ê°œ?œë‹¤."
    }
  ];

  return (
    <div className="w-full flex-1 flex flex-col items-center">
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

