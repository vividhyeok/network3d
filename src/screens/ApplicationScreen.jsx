import React, { useState } from 'react';
import DrillDownNav from '../components/DrillDownNav';
import HttpTimeline from '../components/animations/HttpTimeline';
import DnsResolver from '../components/animations/DnsResolver';
import P2PvsCS from '../components/animations/P2PvsCS';

export default function ApplicationScreen({ onClose }) {
  const [activeTab, setActiveTab] = useState('http');
  
  const tabs = [
    { id: 'http', label: 'HTTP' },
    { id: 'dns',  label: 'DNS Resolution' },
    { id: 'p2p',  label: 'P2P vs Client-Server', isNew: true },
  ];

  return (
    <div className="absolute inset-0 z-40 bg-[#0f1117] pointer-events-auto flex flex-col font-sans text-white">
      <DrillDownNav 
        title="APPLICATION LAYER" 
        subtitle="Network Services & Applications"
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onClose={onClose}
      />
      
      <div className="flex-1 mt-24 px-8 pb-8 relative overflow-y-auto">
        {activeTab === 'http' && <div className="w-full min-h-full flex flex-col"><HttpTimeline /></div>}
        {activeTab === 'dns'  && <div className="w-full min-h-full flex flex-col"><DnsResolver /></div>}
        {activeTab === 'p2p'  && <div className="w-full min-h-full flex flex-col"><P2PvsCS /></div>}
      </div>
    </div>
  );
}
