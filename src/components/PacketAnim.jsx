import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import { layers } from '../data/layers';
import * as THREE from 'three';

export default function PacketAnim({ isPlaying, speed, onAnimComplete }) {
  const groupRef = useRef();
  const progressRef = useRef(0);
  const labelRef = useRef(null);
  
  // Speed multiplier
  const speedFactors = { slow: 0.45, normal: 1.2, fast: 2.7 };
  const currentSpeed = speedFactors[speed] || 1.2;

  const senderX = -6;
  const receiverX = 6;
  
  // Define keypoints for the path
  const keypoints = useMemo(() => {
    const pts = [];
    pts.push(new THREE.Vector3(senderX, layers[0].yPos + 1.5, 0)); // 0: above
    pts.push(new THREE.Vector3(senderX, layers[0].yPos, 0)); // 1: App
    pts.push(new THREE.Vector3(senderX, layers[1].yPos, 0)); // 2: Trans
    pts.push(new THREE.Vector3(senderX, layers[2].yPos, 0)); // 3: Net
    pts.push(new THREE.Vector3(senderX, layers[3].yPos, 0)); // 4: Link
    pts.push(new THREE.Vector3(senderX, layers[4].yPos, 0)); // 5: Phys
    pts.push(new THREE.Vector3(0, layers[4].yPos, 0));       // 6: Router reach
    pts.push(new THREE.Vector3(0, layers[4].yPos, 0));       // 7: Router pause end
    pts.push(new THREE.Vector3(receiverX, layers[4].yPos, 0)); // 8: Receiver reach
    pts.push(new THREE.Vector3(receiverX, layers[3].yPos, 0)); // 9: Link
    pts.push(new THREE.Vector3(receiverX, layers[2].yPos, 0)); // 10: Net
    pts.push(new THREE.Vector3(receiverX, layers[1].yPos, 0)); // 11: Trans
    pts.push(new THREE.Vector3(receiverX, layers[0].yPos, 0)); // 12: App
    pts.push(new THREE.Vector3(receiverX, layers[0].yPos + 1.5, 0)); // 13: End
    return pts;
  }, [senderX, receiverX]);

  const getPacketState = (prog) => {
    if (prog < 1) return { level: 0 };
    if (prog < 2) return { level: 1, label: "HTTP GET /index.html 생성" };
    if (prog < 3) return { level: 2, label: "TCP 헤더 추가 — Seq#, Port 번호, Checksum" };
    if (prog < 4) return { level: 3, label: "IP 헤더 추가 — 출발지/목적지 IP 주소" };
    if (prog < 5) return { level: 4, label: "이더넷 프레임 추가 — MAC 주소" };
    if (prog < 6) return { level: 5, label: "비트 신호로 변환 → 전송", bits: true };
    if (prog < 7) return { level: 3, label: "IP 주소 확인 → 포워딩 테이블 조회 → 출력 포트 결정", router: true };
    if (prog < 8) return { level: 5, bits: true };
    if (prog < 9) return { level: 4, label: "신호 → 비트 복원" };
    if (prog < 10) return { level: 3, label: "MAC 주소 확인 → 프레임 벗겨냄" };
    if (prog < 11) return { level: 2, label: "IP 주소 확인 → 패킷 벗겨냄" };
    if (prog < 12) return { level: 1, label: "포트 번호 확인 → 올바른 프로세스로 전달 (Demux) → TCP Seq# 검증" };
    if (prog < 13) return { level: 0, label: "HTTP 응답 수신 완료" };
    return { level: 0 }; // >= 13
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    if (isPlaying) {
      progressRef.current += delta * currentSpeed;
      if (progressRef.current >= keypoints.length - 1) {
        progressRef.current = keypoints.length - 1;
        if (onAnimComplete) {
          onAnimComplete();
        }
      }
    } else if (progressRef.current === keypoints.length - 1) {
      // It's finished. Keep it invisible?
      // Actually, if we reset progress when play is clicked, it'll start from 0.
    }

    // Hide if not playing and at start
    if (!isPlaying && progressRef.current === 0) {
      groupRef.current.visible = false;
      return;
    }
    
    // Also hide if it's completely finished? We can just leave it visible or hidden.
    // The instructions say "자세히 보기 links appear only after animation completes".
    // If it's completely done, we can hide the packet.
    if (!isPlaying && progressRef.current >= keypoints.length - 1) {
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
    
    // Determine visual state
    const pState = getPacketState(progressRef.current);
    
    // Update HTML label
    if (labelRef.current) {
      if (pState.label) {
        labelRef.current.innerText = pState.label;
        labelRef.current.style.opacity = 1;
      } else {
        labelRef.current.style.opacity = 0;
      }
    }

    // Update visibilities of wrappers and data
    groupRef.current.children.forEach(child => {
      if (child.userData.isWrapper) {
        child.visible = !pState.bits && child.userData.level <= pState.level;
      } else if (child.userData.isData) {
        child.visible = !pState.bits;
      } else if (child.userData.isBits) {
        child.visible = !!pState.bits;
      }
    });
  });

  // Keep track of reset when isPlaying transitions to true while at the end
  React.useEffect(() => {
    if (isPlaying && progressRef.current >= keypoints.length - 1) {
      progressRef.current = 0;
    }
  }, [isPlaying, keypoints.length]);

  return (
    <group ref={groupRef} visible={false}>
      {/* HTML Label Overlay */}
      <Html position={[0, 1.8, 0]} center zIndexRange={[100, 0]}>
        <div ref={labelRef} className="px-3 py-1.5 bg-gray-900 border border-teal-500 rounded-lg text-white font-bold text-xs whitespace-nowrap shadow-xl transition-opacity duration-200 pointer-events-none" style={{ opacity: 0 }}>
        </div>
      </Html>

      {/* Base Data Packet */}
      <group userData={{ isData: true }}>
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
      </group>

      {/* Bit Stream representation */}
      <group userData={{ isBits: true }} visible={false}>
        {[[-0.6, 0, 0], [-0.2, 0.1, 0], [0.2, -0.1, 0], [0.6, 0, 0]].map((pos, i) => (
          <mesh key={`bit-${i}`} position={pos}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1} />
          </mesh>
        ))}
      </group>

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
