import React, { useState } from 'react';
import DrillDownNav from '../components/DrillDownNav';
import TcpHandshake from '../components/animations/TcpHandshake';
import RdtAnimation from '../components/animations/RdtAnimation';
import MultiplexingDemo from '../components/animations/MultiplexingDemo';
import CongestionGraph from '../components/animations/CongestionGraph';
import FlowControlBuffer from '../components/animations/FlowControlBuffer';

export default function TransportScreen({ onClose }) {
  const [activeTab, setActiveTab] = useState('connection');
  
  const tabs = [
    { id: 'connection', label: 'Connection Setup', isNew: true },
    { id: 'rdt',        label: 'RDT Evolution' },
    { id: 'mux',        label: 'Mux / Demux', isNew: true },
    { id: 'congestion', label: 'Congestion Control' },
    { id: 'flow',       label: 'Flow Control' },
  ];

  return (
    <div className="absolute inset-0 z-40 bg-[#0f1117] pointer-events-auto flex flex-col font-sans text-white">
      <DrillDownNav 
        title="TRANSPORT LAYER" 
        subtitle="Process-to-Process Reliability"
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onClose={onClose}
      />
      
      <div className="flex-1 mt-24 px-8 pb-8 relative overflow-y-auto">
        {activeTab === 'connection' && <div className="w-full min-h-full flex flex-col"><TcpHandshake /></div>}
        {activeTab === 'rdt'        && <div className="w-full min-h-full flex flex-col"><RdtAnimation /></div>}
        {activeTab === 'mux'        && <div className="w-full min-h-full flex flex-col"><MultiplexingDemo /></div>}
        {activeTab === 'congestion' && <div className="w-full min-h-full flex flex-col"><CongestionGraph /></div>}
        {activeTab === 'flow'       && <div className="w-full min-h-full flex flex-col"><FlowControlBuffer /></div>}
      </div>
    </div>
  );
}
