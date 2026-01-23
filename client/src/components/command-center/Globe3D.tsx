import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";

// Batumi coordinates
const BATUMI_LAT = 41.6168;
const BATUMI_LNG = 41.6367;

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

function GlobeMarker({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const position = latLngToVector3(lat, lng, 2.05);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.2);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#00f5ff" />
      </mesh>
      <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div className="bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-cyan-400 text-xs whitespace-nowrap border border-cyan-500/50">
          {label}
        </div>
      </Html>
    </group>
  );
}

function GlobeMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  const globeTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Dark blue ocean
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, 512, 256);

    // Simplified continents in cyan glow
    ctx.fillStyle = '#0d3b66';
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 1;

    // Europe/Africa rough shape
    ctx.beginPath();
    ctx.ellipse(270, 100, 30, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Asia rough shape
    ctx.beginPath();
    ctx.ellipse(350, 90, 60, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Americas rough shape
    ctx.beginPath();
    ctx.ellipse(120, 100, 40, 60, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Grid lines
    ctx.strokeStyle = '#00f5ff20';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
    }
    for (let i = 0; i < 256; i += 32) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <>
      {/* Main globe */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={globeTexture}
          transparent
          opacity={0.9}
          emissive="#00f5ff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Atmosphere glow */}
      <Sphere args={[2.1, 64, 64]}>
        <meshBasicMaterial
          color="#00f5ff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Batumi marker */}
      <GlobeMarker lat={BATUMI_LAT} lng={BATUMI_LNG} label="ORBI CITY BATUMI" />
    </>
  );
}

export function Globe3D() {
  return (
    <div className="w-full h-[400px] relative">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7c3aed" />

        <GlobeMesh />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>

      {/* Glow effect overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-cyan-500/5 via-transparent to-transparent" />
      </div>
    </div>
  );
}
