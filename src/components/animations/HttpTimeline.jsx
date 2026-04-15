import React, { useState } from 'react';
import SelfCheck from '../SelfCheck';

// Common visual configuration for arrows
const Arrow = ({ top, label, duration = "1 RTT", direction = "right", color = "text-teal-400", delayClass="delay-0" }) => {
  return (
    <div className={`absolute left-0 w-full flex flex-col justify-center transition-all opacity-0 animate-fade-in ${delayClass}`} style={{ top: `${top}%` }}>
      <span className={`text-[10px] font-bold ${color} text-center mb-0.5`}>{label} ({duration})</span>
      <div className="relative w-full h-px bg-white/30">
        {direction === "right" && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-white/50 transform rotate-45"></div>}
        {direction === "left" && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 border-b border-l border-white/50 transform rotate-45"></div>}
      </div>
    </div>
  );
};

export default function HttpTimeline() {
  const [mode, setMode] = useState('non-persistent'); // 'non-persistent', 'persistent'

  const checkData = [
    {
      q: "Non-persistent HTTP?ì„œ ?´ë?ì§€ ?Œì¼ 3ê°œë? ë°›ìœ¼?¤ë©´ TCP ?°ê²°??ëª?ë²?ë§ºì–´???˜ëŠ”ê°€?\nê°??°ê²°ë§ˆë‹¤ ??2 RTTê°€ ?œëŠ”ê°€?",
      a: "HTML 1ê°?+ ?´ë?ì§€ 3ê°?= ì´?4ê°?ê°ì²´. ê°?ê°ì²´ë§ˆë‹¤ TCP ?°ê²°???ˆë¡œ ë§ºëŠ”??\nTCP ?°ê²° ?ì²´ê°€ 1 RTT (SYN-SYNACK), ?¤ì œ GET ?”ì²­-?‘ë‹µ??1 RTT.\n?°ë¼??ê°ì²´ ?˜ë‚˜??2 RTT ??ì´?8 RTT.\n(?? HTML??ë¨¼ì? ë°›ì•„???´ë?ì§€ URL???????ˆìœ¼ë¯€ë¡??œì°¨?ìœ¼ë¡?ë°œìƒ?œë‹¤.)"
    },
    {
      q: "Persistent + Pipelining?ì„œ ê°™ì? 4ê°?ê°ì²´ë¥?ë°›ìœ¼ë©?ëª?RTT?¸ê??\n??ì¤„ì–´?œëŠ”ê°€?",
      a: "TCP ?°ê²° 1ë²?(1 RTT) + ëª¨ë“  GET???™ì‹œ???Œì´?„ë¼?´ë‹ (1 RTT).\nì´?~2 RTT. ?°ê²°???¬ì‚¬?©í•˜ê³??”ì²­??ê¸°ë‹¤ë¦¬ì? ?Šê³  ?°ì†?¼ë¡œ ë³´ë‚´ê¸??Œë¬¸?´ë‹¤.\n?? ì²?HTML??ë°›ì•„???´ë?ì§€ URL???Œë?ë¡?HTML ?˜ì‹  ???˜ë¨¸ì§€ë¥??Œì´?„ë¼?´ë‹."
    },
    {
      q: "HTTP????ê¸°ë³¸?ìœ¼ë¡?stateless(ë¬´ìƒ???¸ê??\nê·¸ë ‡?¤ë©´ ë¡œê·¸??? ì????´ë–»ê²?êµ¬í˜„?˜ëŠ”ê°€?",
      a: "HTTP ?ì²´???”ì²­-?‘ë‹µ???ë‚˜ë©??œë²„ê°€ ?´ë¼?´ì–¸?¸ë? ê¸°ì–µ?˜ì? ?ŠëŠ”??\n?¨ìˆœ?˜ê²Œ ? ì??˜ê¸° ?„í•œ ?¤ê³„??\në¡œê·¸??? ì???ì¿ í‚¤ë¥??µí•´ ?´ë¼?´ì–¸?¸ê? ?íƒœë¥?ì§ì ‘ ?¤ê³  ?¤ë‹ˆ??ë°©ì‹?¼ë¡œ êµ¬í˜„?œë‹¤."
    }
  ];

  // Non-persistent: 3 objects * 2 RTT = 6 RTT
  // Persistent: 1 RTT (conn) + 1 RTT (html) + 1 RTT (2 images pipelined) = 3 RTT
  
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center pt-8">
      
      {/* Toggle */}
      <div className="flex space-x-6 mb-8 bg-black/40 p-2 rounded-xl border border-white/10">
        <button 
          onClick={() => setMode('non-persistent')}
          className={`px-8 py-3 rounded-lg font-bold tracking-wide transition-all ${mode === 'non-persistent' ? 'bg-teal-600 text-white' : 'bg-transparent text-gray-400 hover:bg-white/5'}`}
        >
          NON-PERSISTENT HTTP
        </button>
        <button 
          onClick={() => setMode('persistent')}
          className={`px-8 py-3 rounded-lg font-bold tracking-wide transition-all ${mode === 'persistent' ? 'bg-teal-600 text-white' : 'bg-transparent text-gray-400 hover:bg-white/5'}`}
        >
          PERSISTENT HTTP (PIPELINED)
        </button>
      </div>

      {/* Diagram container */}
      <div className="flex-1 w-full max-w-4xl relative flex justify-between px-16">
        
        {/* Client Line */}
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-12 bg-teal-800 border-2 border-teal-500 rounded-lg flex items-center justify-center font-bold text-sm mb-4">CLIENT</div>
          <div className="w-1 h-[600px] bg-teal-900/50 rounded-full"></div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 relative mx-8 h-[600px] mt-16">
          {mode === 'non-persistent' ? (
            <>
              {/* HTML Object */}
              <Arrow top={0} label="TCP SYN" color="text-yellow-400" />
              <Arrow top={5} label="TCP SYN/ACK" direction="left" color="text-yellow-400" />
              <Arrow top={10} label="HTTP GET (index.html)" />
              <Arrow top={15} label="HTTP Response (HTML)" direction="left" />
              
              {/* Image 1 */}
              <Arrow top={25} label="TCP SYN" color="text-yellow-400" />
              <Arrow top={30} label="TCP SYN/ACK" direction="left" color="text-yellow-400" />
              <Arrow top={35} label="HTTP GET (logo.png)" />
              <Arrow top={40} label="HTTP Response (PNG)" direction="left" />

              {/* Image 2 */}
              <Arrow top={50} label="TCP SYN" color="text-yellow-400" />
              <Arrow top={55} label="TCP SYN/ACK" direction="left" color="text-yellow-400" />
              <Arrow top={60} label="HTTP GET (banner.jpg)" />
              <Arrow top={65} label="HTTP Response (JPG)" direction="left" />

              {/* RTT blocks indication */}
              <div className="absolute -left-16 top-0 bottom-[35%] w-4 border-l-2 border-dashed border-red-500/50 flex items-center justify-center text-xs text-red-500 rotate-180" style={{ writingMode: 'vertical-rl' }}>6 RTT Total</div>
            </>
          ) : (
            <>
              {/* HTML Object */}
              <Arrow top={0} label="TCP SYN" color="text-yellow-400" />
              <Arrow top={10} label="TCP SYN/ACK" direction="left" color="text-yellow-400" />
              <Arrow top={20} label="HTTP GET (index.html)" />
              <Arrow top={30} label="HTTP Response (HTML)" direction="left" />
              
              {/* Pipelined Images */}
              <Arrow top={45} label="HTTP GET (logo.png)" />
              <Arrow top={52} label="HTTP GET (banner.jpg)" />
              
              <Arrow top={65} label="HTTP Response (PNG)" direction="left" />
              <Arrow top={72} label="HTTP Response (JPG)" direction="left" />

              <div className="absolute -left-16 top-0 bottom-[28%] w-4 border-l-2 border-dashed border-emerald-500/50 flex items-center justify-center text-xs text-emerald-500 rotate-180" style={{ writingMode: 'vertical-rl' }}>~3 RTT Total</div>
            </>
          )}
        </div>

        {/* Server Line */}
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-12 bg-indigo-800 border-2 border-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm mb-4">SERVER</div>
          <div className="w-1 h-[600px] bg-indigo-900/50 rounded-full"></div>
        </div>

      </div>

      {/* Self Check Layer */}
      <SelfCheck questions={checkData} />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
