import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { layers } from '../data/layers';
import LayerSlab from './LayerSlab';
import PacketAnim from './PacketAnim';
import * as THREE from 'three';

function CameraRig({ drillDownLayer, controlsRef }) {
  const isMoving = useRef(false);
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    if (drillDownLayer) {
      targetPos.current.set(-6, drillDownLayer.yPos + 2, 4);
      targetLookAt.current.set(-6, drillDownLayer.yPos, 0);
    } else {
      targetPos.current.set(0, 8, 16);
      targetLookAt.current.set(0, 0, 0);
    }
    isMoving.current = true;
  }, [drillDownLayer]);

  useFrame((state) => {
    if (!controlsRef.current || !isMoving.current) return;

    // Lerp camera position
    state.camera.position.lerp(targetPos.current, 0.04);
    
    // Lerp orbit control target
    controlsRef.current.target.lerp(targetLookAt.current, 0.04);
    controlsRef.current.update();

    // Stop moving once zoomed in/out, to allow user to freely rotate/change view
    if (state.camera.position.distanceTo(targetPos.current) < 0.1) {
      isMoving.current = false;
    }
  });

  return null;
}

export default function Scene({ setSelectedLayer, showPduNames, isPlaying, speed, drillDownLayer, animComplete, onAnimComplete }) {
  const senderX = -6;
  const receiverX = 6;
  const controlsRef = useRef();

  return (
    <Canvas
      camera={{ position: [0, 8, 16], fov: 40 }}
      className="w-full h-full bg-[#0f1117]"
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      <CameraRig drillDownLayer={drillDownLayer} controlsRef={controlsRef} />

      {/* Sender Stack */}
      <group>
        {layers.map((layer) => (
          <LayerSlab 
            key={`sender-${layer.id}`} 
            layer={layer} 
            position={[senderX, layer.yPos, 0]} 
            isSender={true}
            onClick={setSelectedLayer}
            showPduNames={showPduNames}
            animComplete={animComplete}
          />
        ))}
      </group>

      {/* Network Core (simple visualization) */}
      <mesh position={[0, layers[4].yPos, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 12, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh position={[0, layers[4].yPos, 0]}>
         <sphereGeometry args={[0.4, 16, 16]} />
         <meshStandardMaterial color="#ffffff" emissive="#0ea5e9" emissiveIntensity={1} />
      </mesh>

      {/* Receiver Stack */}
      <group>
        {layers.map((layer) => (
          <LayerSlab 
            key={`receiver-${layer.id}`} 
            layer={layer} 
            position={[receiverX, layer.yPos, 0]} 
            isSender={false}
            onClick={setSelectedLayer}
            showPduNames={showPduNames}
            animComplete={animComplete}
          />
        ))}
      </group>

      {/* Packet Animation */}
      <PacketAnim isPlaying={isPlaying} speed={speed} onAnimComplete={onAnimComplete} />

      <OrbitControls 
        ref={controlsRef}
        makeDefault 
        enableDamping 
        dampingFactor={0.05} 
        minDistance={5} 
        maxDistance={40} 
        maxPolarAngle={Math.PI / 1.5}
      />
    </Canvas>
  );
}
