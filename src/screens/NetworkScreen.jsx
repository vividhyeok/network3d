import React from 'react';
import DrillDownNav from '../components/DrillDownNav';
import ForwardingVsRouting from '../components/animations/ForwardingVsRouting';

export default function NetworkScreen({ onClose }) {
  return (
    <div className="absolute inset-0 z-40 bg-[#0f1117] pointer-events-auto flex flex-col font-sans text-white">
      <DrillDownNav 
        title="NETWORK LAYER" 
        subtitle="Host-to-Host Routing"
        tabs={[]} /* No tabs for Network yet */
        activeTab={null}
        setActiveTab={() => {}}
        onClose={onClose}
      />
      
      <div className="flex-1 mt-24 p-8 relative overflow-y-auto">
        <div className="w-full min-h-full flex flex-col">
          <ForwardingVsRouting />
        </div>
      </div>
    </div>
  );
}
