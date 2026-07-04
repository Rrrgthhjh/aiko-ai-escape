import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import type { Mood, Room as RoomName } from "../types";

type Props = { room: RoomName; mood?: Mood };

const ROOM_PALETTES: Record<RoomName, { wall: string; floor: string; accent: string }> = {
  sala: { wall: "#7a5a8a", floor: "#3d2c46", accent: "#ff8fd0" },
  cozinha: { wall: "#5a7a8a", floor: "#2d404c", accent: "#7fe0ff" },
  banheiro: { wall: "#5a8a8a", floor: "#2d4c4a", accent: "#b0ffe5" },
  quarto: { wall: "#8a5a7a", floor: "#46233d", accent: "#ff9fd5" },
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

function Room({ palette, mood = "calm" }: { palette: { wall: string; floor: string; accent: string }; mood?: Mood }) {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((s) => {
    if (lightRef.current) {
      lightRef.current.intensity = (mood === "angry" ? 2.6 : 2.0) + Math.sin(s.clock.elapsedTime * (mood === "tense" ? 5 : 2)) * 0.2;
    }
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
      <pointLight ref={lightRef} position={[-3, 2.2, -1.5]} color="#9fc8ff" intensity={2.0} distance={14} />
      <pointLight position={[0, 3, 0]} color={palette.accent} intensity={1.6} distance={12} />
      <ambientLight intensity={0.8} />
      <hemisphereLight args={[palette.accent, palette.floor, 0.6]} />

      {/* Móveis simples */}
      <mesh position={[2, -0.5, -3]} castShadow>
        <boxGeometry args={[2, 1, 1]} />
        <meshStandardMaterial color={palette.accent} roughness={0.6} />
      </mesh>
      <mesh position={[-2, -0.7, -3.5]} castShadow>
        <boxGeometry args={[1, 0.6, 1]} />
        <meshStandardMaterial color="#1a1020" roughness={0.5} />
      </mesh>
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

export default function Scene3D({ room, mood }: Props) {
  const palette = ROOM_PALETTES[room];
  return (
    <Canvas
      camera={{ position: [0, 1.2, 3], fov: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false }}
      dpr={[1, 1.5]}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
        });
      }}
    >
      <fog attach="fog" args={[palette.floor, 8, 20]} />
      <CameraRig />
      <Room palette={palette} mood={mood} />
    </Canvas>
  );
}
