import React, { useState } from 'react';
import Scene from './components/Scene';
import InfoPanel from './components/InfoPanel';
import ControlsOverlay from './components/ControlsOverlay';
import ApplicationScreen from './screens/ApplicationScreen';
import TransportScreen from './screens/TransportScreen';
import NetworkScreen from './screens/NetworkScreen';

function App() {
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [drillDownLayer, setDrillDownLayer] = useState(null);
  const [showPduNames, setShowPduNames] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Speed is now fixed to 'slow' inside App.
  const speed = 'slow';

  const handleLayerClick = (layer) => {
    if (!layer) {
      setSelectedLayer(null);
      setDrillDownLayer(null);
      return;
    }
    
    if (['application', 'transport', 'network'].includes(layer.id)) {
      setDrillDownLayer(layer);
      setSelectedLayer(null); // Close info panel if open
    } else {
      setSelectedLayer(layer);
    }
  };

  const closeDrillDown = () => {
    setDrillDownLayer(null);
  };

  return (
    <div className="w-full h-screen bg-[#0f1117] text-white overflow-hidden relative font-sans">
      
      {/* 3D Canvas */}
      <Scene 
        setSelectedLayer={handleLayerClick}
        showPduNames={showPduNames}
        isPlaying={isPlaying}
        speed={speed}
        drillDownLayer={drillDownLayer}
      />

      {/* Title */}
      <div className={`absolute top-6 left-8 pointer-events-none z-10 transition-opacity duration-500 ${drillDownLayer ? 'opacity-0' : 'opacity-100'}`}>
        <h1 className="text-2xl font-black tracking-widest text-teal-400">NETWORK 3D VISUALIZER</h1>
        <p className="text-gray-400 text-sm mt-1">Interactive 5-Layer Internet Model</p>
      </div>

      {/* Layer Info Side Panel */}
      <InfoPanel 
        selectedLayer={selectedLayer} 
        onClose={() => setSelectedLayer(null)}
      />

      {/* Controls Overlay Bottom */}
      <div className={`transition-opacity duration-500 ${drillDownLayer ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <ControlsOverlay 
          showPduNames={showPduNames}
          setShowPduNames={setShowPduNames}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      </div>

      {/* Drill-Down Overlays with Crossfade */}
      <div className={`absolute inset-0 z-40 transition-opacity duration-1000 ${drillDownLayer ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {drillDownLayer?.id === 'application' && <ApplicationScreen onClose={closeDrillDown} />}
        {drillDownLayer?.id === 'transport' && <TransportScreen onClose={closeDrillDown} />}
        {drillDownLayer?.id === 'network' && <NetworkScreen onClose={closeDrillDown} />}
      </div>

    </div>
  );
}

export default App;
