import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DeveloperAvatarProps {
  reducedMotion: boolean;
  isMobile: boolean;
}

/**
 * Procedural composite seated 3D avatar representing Vignesh (casual developer
 * in hoodie and glasses). Strictly anchored to the ergonomic office chair at
 * the computer desk, facing the desktop monitor (-Z) with subtle idle breathing,
 * periodic head focus shifts between monitor & laptop, and gentle typing motion.
 *
 * Local coordinate origin (0, 0, 0) sits on the floor directly beneath the chair
 * seat center; chair seat top is at y = 0.48, desk surface is at y = 0.75.
 */
export function DeveloperAvatar({ reducedMotion, isMobile }: DeveloperAvatarProps) {
  const upperBodyRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const leftShoulderRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);

  const seg = isMobile ? 14 : 24;

  // Shared PBR material palette with varied roughness/metalness across skin, hoodie, denim, glasses & sneakers
  const materials = useMemo(() => {
    const skin = new THREE.MeshStandardMaterial({
      color: '#C68B63',
      roughness: 0.62,
      metalness: 0.02,
    });
    const hair = new THREE.MeshStandardMaterial({
      color: '#19171B',
      roughness: 0.84,
      metalness: 0.04,
    });
    const hoodie = new THREE.MeshPhysicalMaterial({
      color: '#2B303C',
      roughness: 0.86,
      metalness: 0.0,
      sheen: 0.45,
      sheenRoughness: 0.7,
      sheenColor: new THREE.Color('#5A647B'),
    });
    const hoodieTrim = new THREE.MeshStandardMaterial({
      color: '#1F232D',
      roughness: 0.9,
      metalness: 0.0,
    });
    const drawstring = new THREE.MeshStandardMaterial({
      color: '#D4D8E2',
      roughness: 0.65,
      metalness: 0.05,
    });
    const jeans = new THREE.MeshStandardMaterial({
      color: '#1F293B',
      roughness: 0.88,
      metalness: 0.02,
    });
    const sneakerBody = new THREE.MeshStandardMaterial({
      color: '#E8ECF2',
      roughness: 0.55,
      metalness: 0.05,
    });
    const sneakerSole = new THREE.MeshStandardMaterial({
      color: '#1E2128',
      roughness: 0.78,
      metalness: 0.04,
    });
    const glassesFrame = new THREE.MeshStandardMaterial({
      color: '#16181F',
      roughness: 0.24,
      metalness: 0.82,
    });
    const glassesLens = new THREE.MeshPhysicalMaterial({
      color: '#DCEBFF',
      roughness: 0.08,
      metalness: 0.1,
      transparent: true,
      opacity: 0.38,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
    });
    const eyeDark = new THREE.MeshStandardMaterial({
      color: '#141216',
      roughness: 0.25,
      metalness: 0.1,
    });

    return {
      skin,
      hair,
      hoodie,
      hoodieTrim,
      drawstring,
      jeans,
      sneakerBody,
      sneakerSole,
      glassesFrame,
      glassesLens,
      eyeDark,
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [materials]);

  // Continuous, subtle seated idle motion (zero floating, zero standing, zero room travel)
  useFrame((state) => {
    if (reducedMotion) return;

    const t = state.clock.getElapsedTime();

    // Gentle breathing rhythm (~15 breaths/min)
    const breath = Math.sin(t * 1.55);
    if (upperBodyRef.current) {
      upperBodyRef.current.position.y = 0.54 + breath * 0.0055;
      upperBodyRef.current.scale.set(
        1 + breath * 0.008,
        1 + breath * 0.006,
        1 + breath * 0.012
      );
      // Slight natural forward coding lean toward monitor (-Z)
      upperBodyRef.current.rotation.x = -0.075 - breath * 0.007;
    }

    // Subtle organic head movement: primarily facing desktop monitor (-Z), occasional slight glance toward side laptop (+Y)
    if (headGroupRef.current) {
      const glanceWave = Math.sin(t * 0.42) * 0.5 + Math.sin(t * 0.19) * 0.5;
      const targetYaw = THREE.MathUtils.clamp(glanceWave * 0.16, -0.08, 0.24);
      const subtleNod = Math.sin(t * 1.15) * 0.022 + Math.cos(t * 0.52) * 0.016;
      const subtleTilt = Math.sin(t * 0.65) * 0.02;

      headGroupRef.current.rotation.y = targetYaw;
      headGroupRef.current.rotation.x = -0.05 + subtleNod;
      headGroupRef.current.rotation.z = subtleTilt;
    }

    // Subtle shoulder rise with breathing
    if (leftShoulderRef.current && rightShoulderRef.current) {
      leftShoulderRef.current.position.y = 0.405 + breath * 0.003;
      rightShoulderRef.current.position.y = 0.405 + breath * 0.003;
    }

    // Gentle typing rhythm on left hand & subtle mouse hand micro-movement on right hand (reaching forward -Z)
    if (leftForearmRef.current) {
      const typingPulse =
        Math.sin(t * 7.2) * 0.016 * (0.5 + 0.5 * Math.sin(t * 0.9));
      leftForearmRef.current.rotation.x = 1.46 + typingPulse;
    }
    if (rightForearmRef.current) {
      const mouseShift = Math.sin(t * 1.4) * 0.022;
      const clickTap = Math.sin(t * 5.8) * 0.009 * (0.5 + 0.5 * Math.cos(t * 0.8));
      rightForearmRef.current.rotation.x = 1.48 + clickTap;
      rightForearmRef.current.rotation.y = -0.1 + mouseShift;
    }
  });

  return (
    <group
      name="vignesh-seated-avatar"
      position={[0.1, 0, -0.05]}
      rotation={[0, 0.04, 0]}
    >
      {/* ==================== LOWER BODY (FIXED SEATED ON CHAIR) ==================== */}
      <group name="seated-lower-body">
        {/* Pelvis / seated hips resting flush on chair cushion (seat top = 0.495) */}
        <mesh
          position={[0, 0.515, 0.02]}
          material={materials.jeans}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.35, 0.11, 0.25]} />
        </mesh>

        {/* Left & Right Seated Thighs extending horizontally forward toward desk (-Z) */}
        {[-0.105, 0.105].map((xPos, idx) => (
          <group key={idx} position={[xPos, 0.505, -0.02]}>
            {/* Thigh */}
            <mesh
              position={[0, -0.005, -0.175]}
              rotation={[Math.PI / 2 - 0.06, 0, idx === 0 ? 0.05 : -0.05]}
              material={materials.jeans}
              castShadow
              receiveShadow
            >
              <capsuleGeometry args={[0.072, 0.27, 8, seg]} />
            </mesh>

            {/* Knee joint */}
            <mesh
              position={[idx === 0 ? -0.015 : 0.015, -0.025, -0.34]}
              material={materials.jeans}
              castShadow
            >
              <sphereGeometry args={[0.066, seg, seg]} />
            </mesh>

            {/* Lower leg / calf descending naturally to floor */}
            <mesh
              position={[idx === 0 ? -0.018 : 0.018, -0.245, -0.345]}
              rotation={[0.05, 0, 0]}
              material={materials.jeans}
              castShadow
              receiveShadow
            >
              <capsuleGeometry args={[0.055, 0.32, 8, seg]} />
            </mesh>

            {/* Casual Sneaker resting strictly flush on oak floor (world y = 0 -> local y = -0.505) */}
            <group position={[idx === 0 ? -0.02 : 0.02, -0.505, -0.39]}>
              {/* Rubber outsole flush at y = 0 */}
              <mesh
                position={[0, 0.016, 0]}
                material={materials.sneakerSole}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.095, 0.032, 0.23]} />
              </mesh>
              {/* Sneaker upper */}
              <mesh
                position={[0, 0.052, 0.01]}
                material={materials.sneakerBody}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.088, 0.056, 0.2]} />
              </mesh>
              {/* Rounded toe cap */}
              <mesh
                position={[0, 0.042, -0.092]}
                material={materials.sneakerBody}
                castShadow
              >
                <sphereGeometry args={[0.044, 12, 12]} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      {/* ==================== UPPER BODY (CASUAL HOODIE + BREATHING) ==================== */}
      <group ref={upperBodyRef} position={[0, 0.54, 0.01]} rotation={[-0.075, 0, 0]}>
        {/* Ribbed hoodie waistband hem */}
        <mesh
          position={[0, 0.03, 0]}
          material={materials.hoodieTrim}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.175, 0.178, 0.065, seg]} />
        </mesh>

        {/* Sculpted torso in casual hoodie */}
        <mesh
          position={[0, 0.235, 0]}
          scale={[1.18, 1, 0.78]}
          material={materials.hoodie}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.176, 0.148, 0.38, seg]} />
        </mesh>

        {/* Soft rounded chest / upper back fullness */}
        <mesh
          position={[0, 0.37, 0.005]}
          scale={[1.22, 0.72, 0.8]}
          material={materials.hoodie}
          castShadow
        >
          <sphereGeometry args={[0.168, seg, seg]} />
        </mesh>

        {/* Front kangaroo pocket detail on hoodie */}
        <mesh
          position={[0, 0.135, -0.128]}
          material={materials.hoodieTrim}
          castShadow
        >
          <boxGeometry args={[0.21, 0.11, 0.025]} />
        </mesh>

        {/* Draped hoodie collar & hood resting naturally across upper back */}
        <mesh
          position={[0, 0.445, 0.025]}
          rotation={[0.28, 0, 0]}
          material={materials.hoodie}
          castShadow
        >
          <torusGeometry args={[0.115, 0.036, 12, 24]} />
        </mesh>
        <mesh
          position={[0, 0.39, 0.115]}
          rotation={[0.45, 0, 0]}
          scale={[1.1, 0.85, 0.65]}
          material={materials.hoodie}
          castShadow
        >
          <sphereGeometry args={[0.108, 16, 14]} />
        </mesh>

        {/* Hoodie drawstrings hanging subtly down chest */}
        {[-0.036, 0.036].map((dx, i) => (
          <mesh
            key={i}
            position={[dx, 0.34, -0.138]}
            rotation={[0.08, 0, i === 0 ? 0.05 : -0.05]}
            material={materials.drawstring}
          >
            <cylinderGeometry args={[0.0045, 0.0045, 0.13, 8]} />
          </mesh>
        ))}

        {/* ==================== HEAD, HAIR & GLASSES ==================== */}
        <group ref={headGroupRef} position={[0, 0.48, -0.015]} rotation={[-0.05, 0, 0]}>
          {/* Neck */}
          <mesh position={[0, 0.035, 0]} material={materials.skin} castShadow>
            <cylinderGeometry args={[0.054, 0.062, 0.09, seg]} />
          </mesh>

          {/* Cranium / Head */}
          <mesh
            position={[0, 0.165, -0.008]}
            scale={[0.92, 1.08, 0.98]}
            material={materials.skin}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[0.112, seg, seg]} />
          </mesh>

          {/* Subtle nose bridge & tip facing -Z */}
          <mesh
            position={[0, 0.155, -0.118]}
            rotation={[-0.2, 0, 0]}
            material={materials.skin}
          >
            <coneGeometry args={[0.016, 0.036, 10]} />
          </mesh>

          {/* Ears */}
          {[-0.102, 0.102].map((ex, i) => (
            <mesh
              key={i}
              position={[ex, 0.158, 0.002]}
              scale={[0.45, 1.0, 0.72]}
              material={materials.skin}
              castShadow
            >
              <sphereGeometry args={[0.026, 10, 10]} />
            </mesh>
          ))}

          {/* Modern sculpted layered dark hair */}
          <group name="avatar-hair">
            {/* Main crown hair volume */}
            <mesh
              position={[0, 0.215, 0.008]}
              scale={[0.98, 0.85, 1.05]}
              material={materials.hair}
              castShadow
            >
              <sphereGeometry args={[0.113, seg, seg]} />
            </mesh>
            {/* Front textured quiff / fringe sweep */}
            <mesh
              position={[0.012, 0.25, -0.065]}
              rotation={[-0.25, 0.15, -0.12]}
              scale={[1.15, 0.58, 0.78]}
              material={materials.hair}
              castShadow
            >
              <sphereGeometry args={[0.075, 16, 14]} />
            </mesh>
            {/* Back tapered hair cover */}
            <mesh
              position={[0, 0.165, 0.048]}
              scale={[0.94, 0.96, 0.85]}
              material={materials.hair}
              castShadow
            >
              <sphereGeometry args={[0.098, 16, 14]} />
            </mesh>
          </group>

          {/* Subtle eyes & eyebrows */}
          {[-0.036, 0.036].map((ex, i) => (
            <group key={i}>
              <mesh position={[ex, 0.172, -0.104]} material={materials.eyeDark}>
                <sphereGeometry args={[0.009, 10, 10]} />
              </mesh>
              <mesh
                position={[ex, 0.194, -0.103]}
                rotation={[0, 0, i === 0 ? 0.06 : -0.06]}
                material={materials.hair}
              >
                <boxGeometry args={[0.028, 0.006, 0.008]} />
              </mesh>
            </group>
          ))}

          {/* Stylish thin-rimmed developer glasses */}
          <group name="developer-glasses" position={[0, 0.17, -0.112]}>
            {/* Left & right rectangular-round rims + subtle reflective lenses */}
            {[-0.04, 0.04].map((gx, i) => (
              <group key={i} position={[gx, 0, 0]}>
                <mesh material={materials.glassesFrame}>
                  <torusGeometry args={[0.025, 0.0034, 8, 22]} />
                </mesh>
                <mesh material={materials.glassesLens}>
                  <circleGeometry args={[0.023, 18]} />
                </mesh>
              </group>
            ))}
            {/* Nose bridge */}
            <mesh position={[0, 0.005, 0]} material={materials.glassesFrame}>
              <boxGeometry args={[0.026, 0.004, 0.004]} />
            </mesh>
            {/* Left & right temple arms resting over ears */}
            {[-0.068, 0.068].map((tx, i) => (
              <mesh
                key={i}
                position={[tx, 0.002, 0.058]}
                rotation={[0, i === 0 ? -0.22 : 0.22, 0]}
                material={materials.glassesFrame}
              >
                <boxGeometry args={[0.004, 0.0045, 0.125]} />
              </mesh>
            ))}
          </group>
        </group>

        {/* ==================== LEFT ARM & TYPING HAND ==================== */}
        <group
          ref={leftShoulderRef}
          position={[-0.215, 0.405, 0.0]}
          rotation={[0.28, 0.08, 0.14]}
        >
          {/* Shoulder cap */}
          <mesh material={materials.hoodie} castShadow>
            <sphereGeometry args={[0.064, 14, 14]} />
          </mesh>
          {/* Upper arm sleeve */}
          <mesh
            position={[0, -0.145, -0.02]}
            material={materials.hoodie}
            castShadow
            receiveShadow
          >
            <capsuleGeometry args={[0.052, 0.21, 8, 16]} />
          </mesh>
          {/* Elbow + Forearm angled forward onto mechanical keyboard */}
          <group
            ref={leftForearmRef}
            position={[0, -0.275, -0.035]}
            rotation={[1.46, 0.14, 0]}
          >
            <mesh material={materials.hoodie} castShadow>
              <sphereGeometry args={[0.048, 12, 12]} />
            </mesh>
            <mesh
              position={[0, -0.125, 0]}
              material={materials.hoodie}
              castShadow
              receiveShadow
            >
              <capsuleGeometry args={[0.044, 0.19, 8, 14]} />
            </mesh>
            {/* Ribbed sleeve cuff */}
            <mesh position={[0, -0.23, 0]} material={materials.hoodieTrim}>
              <cylinderGeometry args={[0.04, 0.036, 0.035, 12]} />
            </mesh>
            {/* Sculpted hand hovering cleanly over keyboard keys */}
            <mesh
              position={[0.01, -0.285, 0.012]}
              rotation={[0.18, 0, 0]}
              scale={[1.05, 1.15, 0.55]}
              material={materials.skin}
              castShadow
            >
              <boxGeometry args={[0.068, 0.072, 0.044]} />
            </mesh>
          </group>
        </group>

        {/* ==================== RIGHT ARM & MOUSE / KEYBOARD HAND ==================== */}
        <group
          ref={rightShoulderRef}
          position={[0.215, 0.405, 0.0]}
          rotation={[0.28, -0.1, -0.14]}
        >
          {/* Shoulder cap */}
          <mesh material={materials.hoodie} castShadow>
            <sphereGeometry args={[0.064, 14, 14]} />
          </mesh>
          {/* Upper arm sleeve */}
          <mesh
            position={[0, -0.145, -0.02]}
            material={materials.hoodie}
            castShadow
            receiveShadow
          >
            <capsuleGeometry args={[0.052, 0.21, 8, 16]} />
          </mesh>
          {/* Elbow + Forearm reaching naturally to keyboard/mouse */}
          <group
            ref={rightForearmRef}
            position={[0, -0.275, -0.035]}
            rotation={[1.48, -0.1, 0]}
          >
            <mesh material={materials.hoodie} castShadow>
              <sphereGeometry args={[0.048, 12, 12]} />
            </mesh>
            <mesh
              position={[0, -0.125, 0]}
              material={materials.hoodie}
              castShadow
              receiveShadow
            >
              <capsuleGeometry args={[0.044, 0.19, 8, 14]} />
            </mesh>
            {/* Ribbed sleeve cuff */}
            <mesh position={[0, -0.23, 0]} material={materials.hoodieTrim}>
              <cylinderGeometry args={[0.04, 0.036, 0.035, 12]} />
            </mesh>
            {/* Sculpted right hand resting comfortably by mouse */}
            <mesh
              position={[-0.005, -0.285, 0.012]}
              rotation={[0.15, 0, 0]}
              scale={[1.05, 1.15, 0.55]}
              material={materials.skin}
              castShadow
            >
              <boxGeometry args={[0.068, 0.072, 0.044]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
