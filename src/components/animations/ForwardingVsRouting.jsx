import React, { useState, useEffect } from 'react';
import SelfCheck from '../SelfCheck';

export default function ForwardingVsRouting() {
  const [packetPos, setPacketPos] = useState(-50); // -50 = ingress, 0 = center, 100 = egress
  const [lookupState, setLookupState] = useState('idle'); // idle, looking, matched
  
  // Fake animation loops
  useEffect(() => {
    const loop = setInterval(() => {
      setPacketPos(-50);
      setLookupState('idle');
      
      setTimeout(() => {
        setPacketPos(0);
        setLookupState('looking');
        
        setTimeout(() => {
          setLookupState('matched');
          
          setTimeout(() => {
            setPacketPos(150);
          }, 500);
          
        }, 1000);
      }, 500);
      
    }, 3500);
    return () => clearInterval(loop);
  }, []);

  const [routePhase, setRoutePhase] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setRoutePhase(p => (p + 1) % 4);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const checkData = [
    {
      q: "?¼ìš°???Œê³ ë¦¬ì¦˜???¤í–‰?˜ëŠ” ?ë„?€ ?¬ì›Œ?©ì´ ?¤í–‰?˜ëŠ” ?ë„?????¤ë¥¸ê°€?",
      a: "?¼ìš°?? ?„ì²´ ?¤íŠ¸?Œí¬ ? í´ë¡œì?ë¥?ë¶„ì„?˜ê³  ê²½ë¡œë¥?ê³„ì‚°?˜ëŠ” ?Œí”„?¸ì›¨???‘ì—….\nì´??¨ìœ„ ?ëŠ” ê·??´ìƒ??ì£¼ê¸°ë¡??¤í–‰?˜ë©° ê²°ê³¼ë¥??¬ì›Œ???Œì´ë¸”ì— ?€?¥í•œ??\n?¬ì›Œ?? ?¨í‚·???„ì°©???Œë§ˆ???Œì´ë¸”ì„ ë£©ì—…?˜ëŠ” ?˜ë“œ?¨ì–´ ?‘ì—….\n?˜ë…¸ì´?ë§ˆì´?¬ë¡œì´??˜ì??¼ë¡œ ì²˜ë¦¬?œë‹¤. ?¼ìš°??ê²°ê³¼ë¥?ê·¸ëƒ¥ ?½ê¸°ë§??œë‹¤."
    },
    {
      q: "?¼ìš°???Œì´ë¸”ì´ ?…ë°?´íŠ¸?˜ëŠ” ?™ì•ˆ ?¨í‚·???˜ëª»??ê²½ë¡œë¡??„ë‹¬?????ˆëŠ”ê°€?",
      a: "ê°€?¥í•˜?? ?¼ìš°???„ë¡œ? ì½œ????ê²½ë¡œë¥?ê³„ì‚°?˜ê³  ëª¨ë“  ?¼ìš°?°ì— ?„íŒŒ?˜ê¸° ?„ê¹Œì§€\n?¼ë? ?¼ìš°?°ëŠ” êµ??Œì´ë¸”ì„ ?¬ìš©?œë‹¤.\n???˜ë ´(Convergence) ?œê°„ ?™ì•ˆ ?¨í‚·??ë£¨í”„ë¥??Œê±°???˜ëª»??ê²½ë¡œë¡?ê°€???¼ì‹œ??ë¬¸ì œê°€ ?ê¸´??\n?´ë? ë°©ì??˜ê¸° ?„í•´ TTL(Time To Live) ê°’ì´ ?ˆì–´ ë¬´í•œ ë£¨í”„ë¥?ë§‰ëŠ”??"
    }
  ];

  return (
    <div className="w-full flex-1 flex flex-col font-sans text-white p-4">
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black tracking-widest text-teal-400">NETWORK LAYER CORE FUNCTIONS</h2>
        <p className="text-lg font-bold text-gray-300 mt-2 bg-white/10 inline-block px-6 py-2 rounded-lg border border-white/20">
          Routing = <span className="text-yellow-400">plan</span>. Forwarding = <span className="text-emerald-400">execute</span>.
        </p>
      </div>

      <div className="flex-1 flex space-x-8">
        
        {/* Forwarding Panel */}
        <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-6 relative flex flex-col items-center">
          <h3 className="text-xl font-bold text-emerald-400 mb-2 uppercase tracking-wide">Forwarding (Data Plane)</h3>
          <p className="text-sm text-gray-400 mb-8">Local, nanosecond scale, implemented in router hardware.</p>
          
          <div className="flex-1 w-full bg-white/5 rounded relative flex items-center justify-center border-2 border-emerald-900/50 overflow-hidden">
             
             {/* Simple Router View */}
             <div className="w-56 h-64 bg-slate-800 border-2 border-emerald-500 rounded-lg p-4 flex flex-col z-10 shadow-2xl relative">
                <div className="text-center font-bold text-lg mb-4 text-emerald-300">Router Core</div>
                
                <div className={`w-full bg-slate-900 border ${lookupState === 'looking' ? 'border-yellow-400 shadow-[0_0_10px_#facc15]' : 'border-slate-600'} rounded p-2 mb-4 transition-all duration-300`}>
                  <div className="text-[10px] text-gray-400 mb-1">Forwarding Table (FIB)</div>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-700"><th>Dest IP</th><th>Port</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>10.0.1.0/24</td><td>P1</td></tr>
                      <tr className={`${lookupState === 'matched' ? 'bg-emerald-500/30 text-emerald-300 font-bold' : ''} transition-all`}>
                        <td>192.168.1.0/24</td><td>P3</td>
                      </tr>
                      <tr><td>0.0.0.0/0</td><td>P2</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-auto text-center text-xs text-gray-400">Action: {lookupState === 'idle' ? 'Waiting...' : lookupState === 'looking' ? 'Looking up Dest IP: 192.168.1.5' : 'Forward to Port 3'}</div>
             </div>

             {/* Packet Animation */}
             <div className="absolute left-0 right-0 h-10 top-1/2 -translate-y-1/2 pointer-events-none z-20 overflow-visible">
               <div 
                 className="absolute w-12 h-8 bg-yellow-500 rounded flex items-center justify-center font-bold text-[10px] text-white transition-all shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                 style={{ 
                   left: `${packetPos}%`, 
                   top: packetPos > 0 ? (packetPos < 100 ? '0' : '80px') : '0',
                   transitionDuration: packetPos === -50 ? '0s' : (packetPos === 0 ? '500ms' : '500ms'),
                   opacity: packetPos === -50 ? 0 : 1
                 }}
               >
                 192.168.1.5
               </div>
             </div>

             {/* Ports */}
             <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-12 bg-slate-700 font-bold flex items-center justify-center text-xs ml-[20%]">IN</div>
             <div className="absolute right-0 top-1/4 -translate-y-1/2 translate-x-1/2 w-8 h-12 bg-slate-700 font-bold flex items-center justify-center text-xs mr-[20%]">P1</div>
             <div className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-1/2 w-8 h-12 bg-slate-700 font-bold flex items-center justify-center text-xs mr-[20%]">P2</div>
             <div className="absolute right-0 top-[60%] -translate-y-1/2 translate-x-1/2 w-8 h-12 bg-emerald-700 font-bold flex items-center justify-center text-xs mr-[20%] shadow-[0_0_10px_#10b981]">P3</div>

          </div>
        </div>

        {/* Routing Panel */}
        <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col items-center">
          <h3 className="text-xl font-bold text-yellow-400 mb-2 uppercase tracking-wide">Routing (Control Plane)</h3>
          <p className="text-sm text-gray-400 mb-8">Global, second scale, implemented via software algorithm.</p>
          
          <div className="flex-1 w-full bg-white/5 rounded relative flex items-center justify-center border-2 border-yellow-900/50 p-4">
             
             {/* Graph Network SVG Overlay */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
               {/* Nodes: R1 (center-left), R2 (top), R3 (bottom), R4 (center-right), R5 (far right) */}
               <line x1="20%" y1="50%" x2="40%" y2="20%" stroke={routePhase >= 1 ? "#facc15" : "#475569"} strokeWidth={routePhase >= 1 ? "4" : "2"} className="transition-all duration-500" />
               <line x1="20%" y1="50%" x2="40%" y2="80%" stroke="#475569" strokeWidth="2" />
               <line x1="40%" y1="20%" x2="70%" y2="50%" stroke={routePhase >= 2 ? "#facc15" : "#475569"} strokeWidth={routePhase >= 2 ? "4" : "2"} className="transition-all duration-500" />
               <line x1="40%" y1="80%" x2="70%" y2="50%" stroke="#475569" strokeWidth="2" />
               <line x1="70%" y1="50%" x2="90%" y2="50%" stroke={routePhase >= 3 ? "#facc15" : "#475569"} strokeWidth={routePhase >= 3 ? "4" : "2"} className="transition-all duration-500" />
               
               {/* Edge Weights */}
               <text x="30%" y="30%" fill="gray" fontSize="12" fontWeight="bold">w:5</text>
               <text x="30%" y="70%" fill="gray" fontSize="12" fontWeight="bold">w:10</text>
               <text x="55%" y="30%" fill="gray" fontSize="12" fontWeight="bold">w:2</text>
               <text x="55%" y="70%" fill="gray" fontSize="12" fontWeight="bold">w:4</text>
             </svg>
             
             <div className="absolute z-20 w-12 h-12 bg-slate-800 border-2 border-yellow-500 rounded flex items-center justify-center font-bold text-sm" style={{left: '20%', top: '50%', transform: 'translate(-50%, -50%)'}}>R1</div>
             <div className="absolute z-20 w-12 h-12 bg-slate-800 border-2 border-white/20 rounded flex items-center justify-center font-bold text-sm" style={{left: '40%', top: '20%', transform: 'translate(-50%, -50%)'}}>R2</div>
             <div className="absolute z-20 w-12 h-12 bg-slate-800 border-2 border-white/20 rounded flex items-center justify-center font-bold text-sm" style={{left: '40%', top: '80%', transform: 'translate(-50%, -50%)'}}>R3</div>
             <div className="absolute z-20 w-12 h-12 bg-slate-800 border-2 border-white/20 rounded flex items-center justify-center font-bold text-sm" style={{left: '70%', top: '50%', transform: 'translate(-50%, -50%)'}}>R4</div>
             <div className="absolute z-20 w-16 h-10 bg-indigo-900 border-2 border-indigo-500 rounded flex items-center justify-center font-bold text-xs text-center" style={{left: '90%', top: '50%', transform: 'translate(-50%, -50%)'}}>Dest<br/>192.*</div>

             <div className="absolute bottom-4 left-4 right-4 bg-black/60 p-3 rounded text-sm text-yellow-200 border border-yellow-900 font-mono">
               &gt; Running Dijkstra / OSPF...<br/>
               {routePhase >= 1 && <>&gt; Evaluating path through R2 (Cost: 5)<br/></>}
               {routePhase >= 2 && <>&gt; Evaluating path through R4 (Cost: 5+2=7)<br/></>}
               {routePhase >= 3 && <span className="text-emerald-400">&gt; Shortest Path Found! Installing to R1's Forwarding Table -&gt; Port 3</span>}
             </div>
          </div>
        </div>

      </div>

      {/* Self Check Layer */}
      <SelfCheck questions={checkData} />
    </div>
  );
}
