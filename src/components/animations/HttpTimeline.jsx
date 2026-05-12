import React, { useState } from 'react';
import TutorialSlider from '../TutorialSlider';

const Arrow = ({ top, label, duration = "1 RTT", direction = "right", color = "text-teal-400" }) => (
  <div className="absolute left-0 w-full flex flex-col justify-center opacity-0 animate-fade-in" style={{ top: `${top}%` }}>
    <span className={`text-[10px] font-bold ${color} text-center mb-0.5`}>{label} ({duration})</span>
    <div className="relative w-full h-px bg-white/30">
      {direction === "right" && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-white/50 transform rotate-45" />}
      {direction === "left"  && <div className="absolute left-0  top-1/2 -translate-y-1/2 w-2 h-2 border-b border-l border-white/50 transform rotate-45" />}
    </div>
  </div>
);

export default function HttpTimeline() {
  const [mode, setMode] = useState('non-persistent');

  const tutorialSteps = [
    {
      text: "Non-Persistent HTTP: 객체 하나마다 TCP 연결을 새로 맺습니다. HTML 1개 + 이미지 2개 = 3 연결, 총 6 RTT 소모. 연결 수립(SYN-ACK) 비용이 매번 발생합니다.",
      onEnter: () => setMode('non-persistent'),
    },
    {
      text: "Persistent HTTP (Pipelined): TCP 연결 1번만 맺고(1 RTT), 이후 모든 GET을 한꺼번에 쏩니다. 응답도 연속으로 수신 → 총 ~3 RTT. 연결 재사용이 핵심입니다.",
      onEnter: () => setMode('persistent'),
    },
    {
      text: "HTTP는 기본적으로 Stateless(무상태). 서버는 클라이언트를 기억하지 않습니다. 로그인 유지 같은 '상태'는 쿠키(Cookie)를 통해 클라이언트가 직접 들고 다니는 방식으로 구현됩니다.",
      onEnter: () => {},
    },
  ];

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center pt-8">
      <div className="flex space-x-6 mb-8 bg-black/40 p-2 rounded-xl border border-white/10">
        <button onClick={() => setMode('non-persistent')}
          className={`px-8 py-3 rounded-lg font-bold tracking-wide transition-all ${mode === 'non-persistent' ? 'bg-teal-600 text-white' : 'bg-transparent text-gray-400 hover:bg-white/5'}`}>
          NON-PERSISTENT HTTP
        </button>
        <button onClick={() => setMode('persistent')}
          className={`px-8 py-3 rounded-lg font-bold tracking-wide transition-all ${mode === 'persistent' ? 'bg-teal-600 text-white' : 'bg-transparent text-gray-400 hover:bg-white/5'}`}>
          PERSISTENT HTTP (PIPELINED)
        </button>
      </div>

      <div className="flex-1 w-full max-w-4xl relative flex justify-between px-16">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-12 bg-teal-800 border-2 border-teal-500 rounded-lg flex items-center justify-center font-bold text-sm mb-4">CLIENT</div>
          <div className="w-1 h-[600px] bg-teal-900/50 rounded-full" />
        </div>

        <div className="flex-1 relative mx-8 h-[600px] mt-16">
          {mode === 'non-persistent' ? (
            <>
              <Arrow top={0}  label="TCP SYN"              color="text-yellow-400" />
              <Arrow top={5}  label="TCP SYN/ACK"          direction="left" color="text-yellow-400" />
              <Arrow top={10} label="HTTP GET (index.html)" />
              <Arrow top={15} label="HTTP Response (HTML)"  direction="left" />
              <Arrow top={25} label="TCP SYN"              color="text-yellow-400" />
              <Arrow top={30} label="TCP SYN/ACK"          direction="left" color="text-yellow-400" />
              <Arrow top={35} label="HTTP GET (logo.png)"  />
              <Arrow top={40} label="HTTP Response (PNG)"   direction="left" />
              <Arrow top={50} label="TCP SYN"              color="text-yellow-400" />
              <Arrow top={55} label="TCP SYN/ACK"          direction="left" color="text-yellow-400" />
              <Arrow top={60} label="HTTP GET (banner.jpg)" />
              <Arrow top={65} label="HTTP Response (JPG)"   direction="left" />
              <div className="absolute -left-16 top-0 bottom-[35%] w-4 border-l-2 border-dashed border-red-500/50 flex items-center justify-center text-xs text-red-500 rotate-180" style={{ writingMode: 'vertical-rl' }}>6 RTT Total</div>
            </>
          ) : (
            <>
              <Arrow top={0}  label="TCP SYN"              color="text-yellow-400" />
              <Arrow top={10} label="TCP SYN/ACK"          direction="left" color="text-yellow-400" />
              <Arrow top={20} label="HTTP GET (index.html)" />
              <Arrow top={30} label="HTTP Response (HTML)"  direction="left" />
              <Arrow top={45} label="HTTP GET (logo.png)"  />
              <Arrow top={52} label="HTTP GET (banner.jpg)" />
              <Arrow top={65} label="HTTP Response (PNG)"   direction="left" />
              <Arrow top={72} label="HTTP Response (JPG)"   direction="left" />
              <div className="absolute -left-16 top-0 bottom-[28%] w-4 border-l-2 border-dashed border-emerald-500/50 flex items-center justify-center text-xs text-emerald-500 rotate-180" style={{ writingMode: 'vertical-rl' }}>~3 RTT Total</div>
            </>
          )}
        </div>

        <div className="relative flex flex-col items-center">
          <div className="w-16 h-12 bg-indigo-800 border-2 border-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm mb-4">SERVER</div>
          <div className="w-1 h-[600px] bg-indigo-900/50 rounded-full" />
        </div>
      </div>

      <TutorialSlider steps={tutorialSteps} />

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-5px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
