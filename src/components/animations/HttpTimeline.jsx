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
      q: "Non-persistent HTTP에서 이미지 파일 3개를 받으려면 TCP 연결을 몇 번 맺어야 하는가?\n각 연결마다 왜 2 RTT가 드는가?",
      a: "HTML 1개 + 이미지 3개 = 총 4개 객체. 각 객체마다 TCP 연결을 새로 맺는다.\nTCP 연결 자체가 1 RTT (SYN-SYNACK), 실제 GET 요청-응답이 1 RTT.\n따라서 객체 하나당 2 RTT → 총 8 RTT.\n(단, HTML을 먼저 받아야 이미지 URL을 알 수 있으므로 순차적으로 발생한다.)"
    },
    {
      q: "Persistent + Pipelining에서 같은 4개 객체를 받으면 몇 RTT인가?\n왜 줄어드는가?",
      a: "TCP 연결 1번 (1 RTT) + 모든 GET을 동시에 파이프라이닝 (1 RTT).\n총 ~2 RTT. 연결을 재사용하고 요청을 기다리지 않고 연속으로 보내기 때문이다.\n단, 첫 HTML을 받아야 이미지 URL을 알므로 HTML 수신 후 나머지를 파이프라이닝."
    },
    {
      q: "HTTP는 왜 기본적으로 stateless(무상태)인가?\n그렇다면 로그인 유지는 어떻게 구현하는가?",
      a: "HTTP 자체는 요청-응답이 끝나면 서버가 클라이언트를 기억하지 않는다.\n단순하게 유지하기 위한 설계다.\n로그인 유지는 쿠키를 통해 클라이언트가 상태를 직접 들고 다니는 방식으로 구현한다."
    }
  ];

  // Non-persistent: 3 objects * 2 RTT = 6 RTT
  // Persistent: 1 RTT (conn) + 1 RTT (html) + 1 RTT (2 images pipelined) = 3 RTT
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center pt-8">
      
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
