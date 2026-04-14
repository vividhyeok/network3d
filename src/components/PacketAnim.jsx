import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { layers } from '../data/layers';
import * as THREE from 'three';

export default function PacketAnim({ isPlaying, speed }) {
  const groupRef = useRef();
  const progressRef = useRef(0);
  
  // Speed multiplier
  const speedFactors = { slow: 0.45, normal: 1.2, fast: 2.7 };
  const currentSpeed = speedFactors[speed] || 1.2;

  const senderX = -6;
  const receiverX = 6;
  
  // Define keypoints for the path
  const keypoints = useMemo(() => {
    const pts = [];
    // 0: Start above Sender Application
    pts.push(new THREE.Vector3(senderX, layers[0].yPos + 1.5, 0));
    
    // 1 to 5: Sender layers (down)
    layers.forEach((layer) => {
      pts.push(new THREE.Vector3(senderX, layer.yPos, 0));
    });

    // 6 to 10: Receiver layers (up, but reverse order physically)
    const reversedLayers = [...layers].reverse();
    reversedLayers.forEach((layer) => {
      pts.push(new THREE.Vector3(receiverX, layer.yPos, 0));
    });

    // 11: End above Receiver Application
    pts.push(new THREE.Vector3(receiverX, layers[0].yPos + 1.5, 0));

    return pts;
  }, [senderX, receiverX]);

  // Determine encapsulation level based on vertical position and side
  // Max level = 5 (Physical). Min level = 0 (Base Data).
  const getEncapLevel = (x, y) => {
    // If we are at receiver side, decap happens. 
    // Simply map Y position to layer index.
    let activeIndex = 0;
    if (y > layers[0].yPos + 0.5) return 0; // Above app
    
    for (let i = 0; i < layers.length; i++) {
      if (y <= layers[i].yPos + 0.5) {
        activeIndex = i + 1;
      }
    }
    return activeIndex;
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    if (isPlaying) {
      progressRef.current += delta * currentSpeed;
      if (progressRef.current >= keypoints.length - 1) {
        progressRef.current = 0; // loop
      }
    } else {
      // If stopped, reset or keep? Let's hide or reset.
      progressRef.current = 0; 
    }

    if (!isPlaying && progressRef.current === 0) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    // Interpolate between keypoints
    const index = Math.floor(progressRef.current);
    const fraction = progressRef.current - index;
    
    const p1 = keypoints[index];
    const p2 = keypoints[Math.min(index + 1, keypoints.length - 1)];

    if (p1 && p2) {
      groupRef.current.position.lerpVectors(p1, p2, fraction);
    }
    
    // Determine level
    const level = getEncapLevel(groupRef.current.position.x, groupRef.current.position.y);
    
    // Update visibilities of wrappers
    groupRef.current.children.forEach((child, i) => {
      if (child.userData.isWrapper) {
        child.visible = child.userData.level <= level;
      }
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* Base Data Packet */}
      <mesh>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.5} />
      </mesh>
      
      <Text
        position={[0, 0, 0.31]}
        fontSize={0.15}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        DATA
      </Text>

      {/* Wrappers */}
      {layers.map((layer, index) => {
        const level = index + 1;
        const size = 0.6 + level * 0.3;
        const wrapperLabels = ["HTTP", "TCP", "IP", "Frame", "Bits"];
        return (
          <group key={level} userData={{ isWrapper: true, level }}>
            <mesh>
              <boxGeometry args={[size, size, size]} />
              <meshStandardMaterial 
                color={layer.color} 
                transparent 
                opacity={0.3} 
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Label for wrapper */}
            {level > 0 && (
              <Text
                position={[0, size / 2 + 0.15, 0]}
                fontSize={0.2}
                color="white"
                outlineWidth={0.02}
                outlineColor="black"
              >
                {wrapperLabels[index]}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
}
