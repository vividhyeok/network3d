import React, { useState } from 'react';
import { Text } from '@react-three/drei';

export default function LayerSlab({ layer, position, isSender, onClick, showPduNames }) {
  const [hovered, setHovered] = useState(false);

  // Slab dimensions
  const width = 4;
  const height = 0.4;
  const depth = 4;

  return (
    <group position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick(layer);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color={layer.color} 
          transparent
          opacity={layer.opacity}
          emissive={layer.color}
          emissiveIntensity={hovered ? 0.5 : 0.1}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>

      {/* Layer Name Text */}
      <Text
        position={[0, height / 2 + 0.05, depth / 2 - 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000"
      >
        {isSender ? `[S] ${layer.name}` : `[R] ${layer.name}`}
      </Text>

      {/* Conditional PDU Data Unit Name */}
      {showPduNames && (
        <group position={[0, height / 2 + 0.05, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[width * 0.8, depth * 0.4]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
          </mesh>
          <Text
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.25}
            color="#fff" // bright color for visibility
            anchorX="center"
            anchorY="middle"
          >
            {layer.pdu}
          </Text>
        </group>
      )}
    </group>
  );
}
