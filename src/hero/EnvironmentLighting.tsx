import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { HeroAnimationState } from './heroAnimations';

interface EnvironmentLightingProps {
  animStateRef: React.MutableRefObject<HeroAnimationState>;
  isMobile: boolean;
  isSoftwareGl: boolean;
}

// Pre-allocated scratch colors to guarantee zero per-frame allocations
const _fogColor = new THREE.Color();
const _keyColor = new THREE.Color();
const _hemiSky = new THREE.Color();
const _hemiGround = new THREE.Color();
const _lampColor = new THREE.Color();
const _rimColor = new THREE.Color();
const _monitorColor = new THREE.Color();

export function EnvironmentLighting({
  animStateRef,
  isMobile,
  isSoftwareGl,
}: EnvironmentLightingProps) {
  const { gl, scene } = useThree();

  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const lampLightRef = useRef<THREE.PointLight>(null);
  const monitorLightRef = useRef<THREE.PointLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const windowBounceRef = useRef<THREE.PointLight>(null);

  // Mandatory studio PMREM RoomEnvironment reflection map on every device (zero external HDR 404s)
  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);

    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.52;

    const initialFog = new THREE.Color(animStateRef.current.fogColor);
    scene.background = initialFog.clone();
    scene.fog = new THREE.FogExp2(initialFog.getHex(), 0.048);

    roomEnv.dispose();
    pmremGenerator.dispose();

    return () => {
      scene.environment = null;
      envRT.dispose();
    };
  }, [gl, scene, animStateRef]);

  // Synchronize studio lighting, reflections & fog imperatively from GSAP animation proxy
  useFrame(() => {
    const s = animStateRef.current;

    if (scene.background instanceof THREE.Color) {
      _fogColor.set(s.fogColor);
      scene.background.copy(_fogColor);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(_fogColor);
      }
    }

    if (keyLightRef.current) {
      _keyColor.set(s.keyLightColor);
      keyLightRef.current.color.copy(_keyColor);
      keyLightRef.current.intensity = s.keyLightIntensity;
    }

    if (hemiLightRef.current) {
      _hemiSky.set(s.hemiSkyColor);
      _hemiGround.set(s.hemiGroundColor);
      hemiLightRef.current.color.copy(_hemiSky);
      hemiLightRef.current.groundColor.copy(_hemiGround);
      hemiLightRef.current.intensity = s.hemiIntensity;
    }

    if (lampLightRef.current) {
      _lampColor.set(s.lampLightColor);
      lampLightRef.current.color.copy(_lampColor);
      lampLightRef.current.intensity = s.lampLightIntensity * s.accentGadgetsDrop;
    }

    if (monitorLightRef.current) {
      _monitorColor.set(s.monitorGlowColor);
      monitorLightRef.current.color.copy(_monitorColor);
      monitorLightRef.current.intensity = s.monitorGlowIntensity * s.monitorDrop;
    }

    if (rimLightRef.current) {
      _rimColor.set(s.rimLightColor);
      rimLightRef.current.color.copy(_rimColor);
      rimLightRef.current.intensity = s.rimLightIntensity;
    }

    if (windowBounceRef.current) {
      windowBounceRef.current.color.copy(_keyColor);
      windowBounceRef.current.intensity = s.keyLightIntensity * 0.42;
    }
  });

  const shadowMapSize = isMobile ? 1024 : 2048;
  const castShadows = !isSoftwareGl;

  return (
    <group name="studio-environment-lighting">
      {/* Primary sunlit window directional key light casting diagonal studio shadows */}
      <directionalLight
        ref={keyLightRef}
        position={[-4.8, 4.1, 2.3]}
        intensity={2.35}
        color="#FFF7EC"
        castShadow={castShadows}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
        shadow-camera-left={-4.2}
        shadow-camera-right={4.2}
        shadow-camera-top={3.8}
        shadow-camera-bottom={-2.8}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
        shadow-radius={3}
      />

      {/* Cool-to-warm architectural hemisphere ambient fill */}
      <hemisphereLight
        ref={hemiLightRef}
        args={['#D6DFEE', '#48433E', 0.85]}
        position={[0, 6, 0]}
      />

      {/* Sculptural rim / accent wash from upper-right to separate silhouette & metallic bevels */}
      <directionalLight
        ref={rimLightRef}
        position={[3.8, 3.2, -1.2]}
        intensity={0.85}
        color="#CFD8E8"
      />

      {/* Soft daylight bounce right inside the left architectural window */}
      <pointLight
        ref={windowBounceRef}
        position={[-2.15, 1.85, 0.25]}
        intensity={1.0}
        distance={6.5}
        decay={2}
        color="#FFF7EC"
      />

      {/* Mushroom desk lamp accent pool light (right side of desk) */}
      <pointLight
        ref={lampLightRef}
        position={[1.05, 1.18, -0.58]}
        intensity={1.85}
        distance={4.5}
        decay={2}
        color="#FFF1DC"
      />

      {/* Desktop monitor face illumination casting subtle code glow onto seated Vignesh */}
      <pointLight
        ref={monitorLightRef}
        position={[0.18, 1.24, -0.35]}
        intensity={1.05}
        distance={3.4}
        decay={2}
        color="#CFE0FF"
      />
    </group>
  );
}
