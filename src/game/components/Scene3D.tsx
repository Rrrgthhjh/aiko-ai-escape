import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import type { Mood, Room as RoomName } from "../types";

type Props = { room: RoomName; clueFound?: boolean; mood?: Mood };

const ROOM_PALETTES: Record<RoomName, { wall: string; floor: string; accent: string }> = {
  sala: { wall: "#3a2a4a", floor: "#1d1426", accent: "#ff5fb0" },
  cozinha: { wall: "#2a3a4a", floor: "#13202c", accent: "#5fd0ff" },
  banheiro: { wall: "#2a4a4a", floor: "#132c2a", accent: "#a0ffe5" },
  quarto: { wall: "#4a2a3a", floor: "#26131d", accent: "#ff7fc5" },
};

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      a[i * 3] = (Math.random() - 0.5) * 12;
      a[i * 3 + 1] = Math.random() * 6;
      a[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return a;
  }, []);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.05;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={200} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#ffb4e6" transparent opacity={0.7} />
    </points>
  );
}

function Room({ palette, clueFound = false, mood = "calm" }: { palette: { wall: string; floor: string; accent: string }; clueFound?: boolean; mood?: Mood }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const clueRef = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (lightRef.current) {
      lightRef.current.intensity = (mood === "angry" ? 1.8 : 1.2) + Math.sin(s.clock.elapsedTime * (mood === "tense" ? 5 : 2)) * 0.15;
    }
    if (clueRef.current) clueRef.current.rotation.y += 0.015;
  });
  return (
    <group>
      {/* Chão */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color={palette.floor} roughness={0.9} />
      </mesh>
      {/* Paredes */}
      <mesh position={[0, 2, -5]}>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color={palette.wall} roughness={1} />
      </mesh>
      <mesh position={[-5, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color={palette.wall} roughness={1} />
      </mesh>
      <mesh position={[5, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color={palette.wall} roughness={1} />
      </mesh>
      {/* Janela com luz */}
      <mesh position={[-4.95, 2.2, -1.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2, 2.4]} />
        <meshBasicMaterial color="#9fc8ff" />
      </mesh>
      <pointLight ref={lightRef} position={[-3, 2.2, -1.5]} color="#9fc8ff" intensity={1.2} distance={10} />
      {/* Lâmpada acento */}
      <pointLight position={[0, 3, 0]} color={palette.accent} intensity={0.8} distance={8} />
      <ambientLight intensity={0.25} />

      {/* Móveis simples */}
      <mesh position={[2, -0.5, -3]} castShadow>
        <boxGeometry args={[2, 1, 1]} />
        <meshStandardMaterial color={palette.accent} roughness={0.6} />
      </mesh>
      <mesh position={[-2, -0.7, -3.5]} castShadow>
        <boxGeometry args={[1, 0.6, 1]} />
        <meshStandardMaterial color="#1a1020" roughness={0.5} />
      </mesh>
      {!clueFound && (
        <mesh ref={clueRef} position={[-2, 0.05, -3.45]} castShadow>
          <octahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={1.2} roughness={0.25} />
        </mesh>
      )}
      <Particles />
    </group>
  );
}

function CameraRig() {
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    s.camera.position.x = Math.sin(t * 0.15) * 0.3;
    s.camera.position.y = 1.2 + Math.sin(t * 0.4) * 0.05;
    s.camera.lookAt(0, 1, -3);
  });
  return null;
}

export default function Scene3D({ room, clueFound, mood }: Props) {
  const palette = ROOM_PALETTES[room];
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.2, 3], fov: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
    >
      <fog attach="fog" args={[palette.floor, 4, 14]} />
      <CameraRig />
      <Room palette={palette} clueFound={clueFound} mood={mood} />
    </Canvas>
  );
}
