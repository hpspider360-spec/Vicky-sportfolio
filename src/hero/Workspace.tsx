import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { HeroAnimationState } from './heroAnimations';
import {
  createContactShadowTexture,
  createDeskGrainTexture,
  createLaptopScreenTexture,
  createMonitorScreenTexture,
  createOakFloorTextures,
  createPegboardTexture,
  createWallArtPaperTexture,
  createWallPlasterTexture,
} from './proceduralTextures';
import { DeveloperAvatar } from './DeveloperAvatar';

interface WorkspaceProps {
  animStateRef: React.MutableRefObject<HeroAnimationState>;
  isMobile: boolean;
  reducedMotion: boolean;
  onAdminTrigger?: () => void;
}

const _c = new THREE.Color();

/**
 * Potted ficus tree in a fluted white ceramic pedestal planter (composite Lathe + Tube + InstancedMesh leaves)
 * directly inspired by the sunlit corner plant in the reference video.
 * Includes a completely hidden owner gesture: touch/hold/hover on the tree for 5 seconds, then click 3 times.
 */
function PottedFicusPlant({
  isMobile,
  contactShadowTex,
  onAdminTrigger,
}: {
  isMobile: boolean;
  contactShadowTex: THREE.CanvasTexture;
  onAdminTrigger?: () => void;
}) {
  const leafInstancedRef = useRef<THREE.InstancedMesh>(null);
  const leafCount = isMobile ? 42 : 76;

  // Hidden owner trigger state (5s continuous touch/hover + 3 clicks)
  const holdTimerRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);
  const isInsideRef = useRef(false);
  const armedUntilRef = useRef(0);
  const clickCountRef = useRef(0);
  const ignoreNextClickRef = useRef(false);
  const glintUntilRef = useRef(0);

  // Sculpted pedestal planter via LatheGeometry
  const planterGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.14, 0.0),
      new THREE.Vector2(0.145, 0.03),
      new THREE.Vector2(0.1, 0.06),
      new THREE.Vector2(0.095, 0.1),
      new THREE.Vector2(0.185, 0.14),
      new THREE.Vector2(0.215, 0.25),
      new THREE.Vector2(0.225, 0.36),
      new THREE.Vector2(0.235, 0.39),
      new THREE.Vector2(0.21, 0.4),
      new THREE.Vector2(0.195, 0.36),
    ];
    return new THREE.LatheGeometry(pts, isMobile ? 20 : 32);
  }, [isMobile]);

  // Curved natural ficus trunk + secondary branches via TubeGeometry
  const branches = useMemo(() => {
    const curves = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.34, 0),
        new THREE.Vector3(-0.02, 0.58, 0.01),
        new THREE.Vector3(0.02, 0.85, -0.02),
        new THREE.Vector3(0.0, 1.1, 0.0),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.01, 0.65, 0.0),
        new THREE.Vector3(-0.14, 0.82, 0.08),
        new THREE.Vector3(-0.22, 0.96, 0.12),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.01, 0.74, -0.01),
        new THREE.Vector3(0.14, 0.9, 0.06),
        new THREE.Vector3(0.21, 1.04, 0.09),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.0, 0.8, -0.02),
        new THREE.Vector3(-0.06, 0.96, -0.15),
        new THREE.Vector3(-0.12, 1.08, -0.2),
      ]),
    ];
    return curves.map(
      (c, i) => new THREE.TubeGeometry(c, 12, i === 0 ? 0.019 : 0.011, 8, false)
    );
  }, []);

  // Leaf shape geometry
  const leafGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.032, 0.025, 0.038, 0.075, 0, 0.115);
    shape.bezierCurveTo(-0.038, 0.075, -0.032, 0.025, 0, 0);
    return new THREE.ShapeGeometry(shape, 5);
  }, []);

  const materials = useMemo(
    () => ({
      pot: new THREE.MeshStandardMaterial({
        color: '#EDEBE6',
        roughness: 0.42,
        metalness: 0.04,
      }),
      soil: new THREE.MeshStandardMaterial({
        color: '#2A211B',
        roughness: 0.95,
      }),
      bark: new THREE.MeshStandardMaterial({
        color: '#5C4433',
        roughness: 0.88,
      }),
      leaf: new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        roughness: 0.56,
        metalness: 0.02,
        side: THREE.DoubleSide,
      }),
    }),
    []
  );

  useEffect(() => {
    const mesh = leafInstancedRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let seed = 7731;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const centers = [
      new THREE.Vector3(0.0, 1.06, 0.0),
      new THREE.Vector3(-0.19, 0.94, 0.1),
      new THREE.Vector3(0.18, 1.01, 0.07),
      new THREE.Vector3(-0.1, 1.05, -0.16),
      new THREE.Vector3(0.08, 0.86, -0.1),
    ];

    const greens = ['#2F5A36', '#3A6B40', '#487C4B', '#284D2E', '#528751'];

    for (let i = 0; i < leafCount; i++) {
      const cluster = centers[i % centers.length];
      const angle = rand() * Math.PI * 2;
      const r = 0.04 + rand() * 0.17;
      const yOff = (rand() - 0.45) * 0.18;

      dummy.position.set(
        cluster.x + Math.cos(angle) * r,
        cluster.y + yOff,
        cluster.z + Math.sin(angle) * r
      );
      dummy.rotation.set(
        0.55 + (rand() - 0.5) * 0.95,
        angle + (rand() - 0.5) * 0.6,
        (rand() - 0.5) * 0.6
      );
      const scale = 0.85 + rand() * 0.45;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);
      color.set(greens[Math.floor(rand() * greens.length)]);
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [leafCount]);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current !== null) {
        window.clearTimeout(holdTimerRef.current);
      }
      planterGeo.dispose();
      branches.forEach((b) => b.dispose());
      leafGeo.dispose();
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [planterGeo, branches, leafGeo, materials]);

  // Subtle ceramic pot confirmation glint ONLY after completing the full 5-second hold
  useFrame(() => {
    const now = performance.now();
    if (now < glintUntilRef.current) {
      materials.pot.emissive.set('#C8FF2E');
      materials.pot.emissiveIntensity = 0.22;
    } else if (materials.pot.emissiveIntensity !== 0) {
      materials.pot.emissive.set('#000000');
      materials.pot.emissiveIntensity = 0;
    }
  });

  const cancelHoldTimer = () => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const startHoldTimer = () => {
    if (holdTimerRef.current !== null) return;
    if (Date.now() <= armedUntilRef.current) return;
    holdTimerRef.current = window.setTimeout(() => {
      holdTimerRef.current = null;
      if (isInsideRef.current || isPointerDownRef.current) {
        armedUntilRef.current = Date.now() + 15000;
        clickCountRef.current = 0;
        glintUntilRef.current = performance.now() + 550;
        if (isPointerDownRef.current) {
          // Do not count the release of the 5-second hold as click #1
          ignoreNextClickRef.current = true;
        }
      }
    }, 5000);
  };

  return (
    <group name="potted-ficus-plant" position={[-1.66, 0, -1.04]}>
      {/* Invisible hidden hitbox covering pot, trunk, and foliage for 5s touch + 3 clicks */}
      <mesh
        position={[0, 0.64, 0]}
        onPointerEnter={(e) => {
          e.stopPropagation();
          isInsideRef.current = true;
          startHoldTimer();
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          isInsideRef.current = false;
          if (!isPointerDownRef.current) {
            cancelHoldTimer();
          }
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          isPointerDownRef.current = true;
          isInsideRef.current = true;
          startHoldTimer();
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          isPointerDownRef.current = false;
          if (!isInsideRef.current) {
            cancelHoldTimer();
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (ignoreNextClickRef.current) {
            ignoreNextClickRef.current = false;
            return;
          }
          if (Date.now() <= armedUntilRef.current) {
            clickCountRef.current += 1;
            if (clickCountRef.current >= 3) {
              armedUntilRef.current = 0;
              clickCountRef.current = 0;
              cancelHoldTimer();
              onAdminTrigger?.();
            }
          }
        }}
      >
        <cylinderGeometry args={[0.38, 0.3, 1.32, 14]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Grounded contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[0.76, 0.76]} />
        <meshBasicMaterial
          map={contactShadowTex}
          transparent
          opacity={0.42}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={planterGeo} material={materials.pot} castShadow receiveShadow />
      <mesh position={[0, 0.355, 0]} material={materials.soil}>
        <cylinderGeometry args={[0.19, 0.18, 0.03, 18]} />
      </mesh>
      {branches.map((geo, idx) => (
        <mesh key={idx} geometry={geo} material={materials.bark} castShadow />
      ))}
      <instancedMesh
        ref={leafInstancedRef}
        args={[leafGeo, materials.leaf, leafCount]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

/**
 * Iconic mushroom-shaped studio desk lamp (LatheGeometry composite) matching the reference video.
 */
function MushroomDeskLamp({
  accentMaterial,
  bulbMaterial,
}: {
  accentMaterial: THREE.MeshStandardMaterial;
  bulbMaterial: THREE.MeshStandardMaterial;
}) {
  const { stemGeo, domeGeo } = useMemo(() => {
    const stemPts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.088, 0.0),
      new THREE.Vector2(0.085, 0.018),
      new THREE.Vector2(0.044, 0.04),
      new THREE.Vector2(0.028, 0.14),
      new THREE.Vector2(0.025, 0.28),
      new THREE.Vector2(0.038, 0.31),
    ];
    const domePts = [
      new THREE.Vector2(0.155, 0.275),
      new THREE.Vector2(0.16, 0.295),
      new THREE.Vector2(0.148, 0.34),
      new THREE.Vector2(0.115, 0.382),
      new THREE.Vector2(0.06, 0.405),
      new THREE.Vector2(0.0, 0.412),
    ];
    return {
      stemGeo: new THREE.LatheGeometry(stemPts, 28),
      domeGeo: new THREE.LatheGeometry(domePts, 32),
    };
  }, []);

  useEffect(() => {
    return () => {
      stemGeo.dispose();
      domeGeo.dispose();
    };
  }, [stemGeo, domeGeo]);

  return (
    <group name="mushroom-desk-lamp" position={[1.04, 0.75, -0.84]}>
      <mesh geometry={stemGeo} material={accentMaterial} castShadow receiveShadow />
      <mesh geometry={domeGeo} material={accentMaterial} castShadow receiveShadow />
      {/* Glowing warm/themed underside diffuser */}
      <mesh position={[0, 0.282, 0]} rotation={[Math.PI / 2, 0, 0]} material={bulbMaterial}>
        <circleGeometry args={[0.132, 24]} />
      </mesh>
    </group>
  );
}

/**
 * Sculptural over-ear headphones hanging on the studio pegboard (echoing reference video).
 */
function PegboardHeadphones({
  accentMaterial,
  padMaterial,
}: {
  accentMaterial: THREE.MeshStandardMaterial;
  padMaterial: THREE.MeshStandardMaterial;
}) {
  return (
    <group name="pegboard-headphones" position={[0.26, -0.02, 0.055]}>
      {/* Mounting peg */}
      <mesh position={[0, 0.11, -0.025]} rotation={[Math.PI / 2, 0, 0]} material={padMaterial}>
        <cylinderGeometry args={[0.008, 0.008, 0.05, 10]} />
      </mesh>
      {/* Headband arch */}
      <mesh position={[0, 0.0, 0]} material={accentMaterial} castShadow>
        <torusGeometry args={[0.095, 0.015, 12, 28, Math.PI]} />
      </mesh>
      {/* Left & Right Earcups */}
      {[-0.096, 0.096].map((xPos, idx) => (
        <group key={idx} position={[xPos, -0.045, 0]}>
          {/* Outer shell */}
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            scale={[1, 0.78, 1.15]}
            material={accentMaterial}
            castShadow
          >
            <cylinderGeometry args={[0.048, 0.048, 0.044, 18]} />
          </mesh>
          {/* Soft ear cushion */}
          <mesh
            position={[idx === 0 ? 0.02 : -0.02, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            scale={[1, 0.7, 1.05]}
            material={padMaterial}
          >
            <cylinderGeometry args={[0.045, 0.045, 0.018, 18]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Complete realistic modern 3D developer workspace with dynamically morphing
 * architectural walls, 30% furniture finishes, 10% studio accents, dual screens,
 * ergonomic chair, potted plant, and seated Vignesh developer avatar.
 */
export function Workspace({
  animStateRef,
  isMobile,
  reducedMotion,
  onAdminTrigger,
}: WorkspaceProps) {
  const { gl } = useThree();
  const maxAniso = Math.min(gl.capabilities.getMaxAnisotropy(), isMobile ? 4 : 8);

  const monitorGroupRef = useRef<THREE.Group>(null);
  const laptopGroupRef = useRef<THREE.Group>(null);
  const peripheralsGroupRef = useRef<THREE.Group>(null);
  const pegboardGroupRef = useRef<THREE.Group>(null);
  const pegboardAccentsRef = useRef<THREE.Group>(null);
  const wallArtGroupRef = useRef<THREE.Group>(null);
  const lampWrapperRef = useRef<THREE.Group>(null);
  const deskAccentsGroupRef = useRef<THREE.Group>(null);

  const textures = useMemo(() => {
    const oak = createOakFloorTextures(maxAniso);
    const plaster = createWallPlasterTexture(Math.min(maxAniso, 4));
    const deskGrain = createDeskGrainTexture(maxAniso);
    const pegboard = createPegboardTexture(maxAniso);
    const monitorScreen = createMonitorScreenTexture(maxAniso);
    const laptopScreen = createLaptopScreenTexture(maxAniso);
    const wallArtPaper = createWallArtPaperTexture(maxAniso);
    const contactShadow = createContactShadowTexture();

    return {
      oak,
      plaster,
      deskGrain,
      pegboard,
      monitorScreen,
      laptopScreen,
      wallArtPaper,
      contactShadow,
    };
  }, [maxAniso]);

  // Shared animated & static PBR materials (mutated imperatively in useFrame for zero React re-renders)
  const materials = useMemo(() => {
    const wall = new THREE.MeshStandardMaterial({
      color: '#252830',
      roughness: 0.9,
      metalness: 0.02,
      bumpMap: textures.plaster,
      bumpScale: 0.008,
    });
    const wallPanel = new THREE.MeshStandardMaterial({
      color: '#1B1E24',
      roughness: 0.82,
      metalness: 0.06,
    });
    const trim = new THREE.MeshStandardMaterial({
      color: '#363B45',
      roughness: 0.58,
      metalness: 0.08,
    });
    const floor = new THREE.MeshStandardMaterial({
      map: textures.oak.map,
      bumpMap: textures.oak.bumpMap,
      bumpScale: 0.012,
      roughnessMap: textures.oak.roughnessMap,
      roughness: 0.62,
      metalness: 0.04,
    });
    const furniture = new THREE.MeshStandardMaterial({
      color: '#2C3038',
      roughness: 0.56,
      metalness: 0.08,
      roughnessMap: textures.deskGrain,
    });
    const pegboardMat = new THREE.MeshStandardMaterial({
      color: '#2C3038',
      map: textures.pegboard,
      roughness: 0.68,
      metalness: 0.06,
    });
    const chairFabric = new THREE.MeshPhysicalMaterial({
      color: '#202329',
      roughness: 0.84,
      metalness: 0.0,
      sheen: 0.35,
      sheenRoughness: 0.72,
    });
    const accent = new THREE.MeshPhysicalMaterial({
      color: '#EEF1F6',
      roughness: 0.28,
      metalness: 0.14,
      clearcoat: 0.45,
      clearcoatRoughness: 0.25,
    });
    const accentGlow = new THREE.MeshStandardMaterial({
      color: '#EEF1F6',
      emissive: new THREE.Color('#DDE4F0'),
      emissiveIntensity: 0.85,
      roughness: 0.25,
    });
    const lampBulb = new THREE.MeshStandardMaterial({
      color: '#FFFDF8',
      emissive: new THREE.Color('#FFF1DC'),
      emissiveIntensity: 1.85,
      roughness: 0.2,
    });
    const brushedAluminum = new THREE.MeshStandardMaterial({
      color: '#C9CFD8',
      roughness: 0.24,
      metalness: 0.86,
    });
    const darkMetal = new THREE.MeshStandardMaterial({
      color: '#1A1D24',
      roughness: 0.34,
      metalness: 0.78,
    });
    const deskMat = new THREE.MeshStandardMaterial({
      color: '#2D313B',
      roughness: 0.92,
      metalness: 0.0,
    });
    const monitorScreen = new THREE.MeshStandardMaterial({
      map: textures.monitorScreen,
      emissive: new THREE.Color('#CFE0FF'),
      emissiveMap: textures.monitorScreen,
      emissiveIntensity: 0.72,
      roughness: 0.14,
      metalness: 0.06,
    });
    const laptopScreen = new THREE.MeshStandardMaterial({
      map: textures.laptopScreen,
      emissive: new THREE.Color('#CFE0FF'),
      emissiveMap: textures.laptopScreen,
      emissiveIntensity: 0.65,
      roughness: 0.16,
      metalness: 0.06,
    });
    const windowGlass = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      emissive: new THREE.Color('#FFFBF2'),
      emissiveIntensity: 1.35,
      roughness: 0.08,
    });
    const woodFrame = new THREE.MeshStandardMaterial({
      color: '#B8956C',
      roughness: 0.58,
      metalness: 0.04,
    });
    const wallArtPaper = new THREE.MeshStandardMaterial({
      map: textures.wallArtPaper,
      roughness: 0.82,
      metalness: 0.0,
    });
    const neutralPaper = new THREE.MeshStandardMaterial({
      color: '#ECE9E1',
      roughness: 0.78,
      metalness: 0.0,
    });
    const miniPlantGreen = new THREE.MeshStandardMaterial({
      color: '#467B4A',
      roughness: 0.6,
    });

    return {
      wall,
      wallPanel,
      trim,
      floor,
      furniture,
      pegboardMat,
      chairFabric,
      accent,
      accentGlow,
      lampBulb,
      brushedAluminum,
      darkMetal,
      deskMat,
      monitorScreen,
      laptopScreen,
      windowGlass,
      woodFrame,
      wallArtPaper,
      neutralPaper,
      miniPlantGreen,
    };
  }, [textures]);

  useEffect(() => {
    return () => {
      textures.oak.map.dispose();
      textures.oak.bumpMap.dispose();
      textures.oak.roughnessMap.dispose();
      textures.plaster.dispose();
      textures.deskGrain.dispose();
      textures.pegboard.dispose();
      textures.monitorScreen.dispose();
      textures.laptopScreen.dispose();
      textures.wallArtPaper.dispose();
      textures.contactShadow.dispose();
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [textures, materials]);

  // Update all architectural & studio materials imperatively from GSAP timeline state
  useFrame(() => {
    const s = animStateRef.current;

    _c.set(s.wallColor);
    materials.wall.color.copy(_c);

    _c.set(s.panelColor);
    materials.wallPanel.color.copy(_c);

    _c.set(s.trimColor);
    materials.trim.color.copy(_c);

    _c.set(s.furnitureColor);
    materials.furniture.color.copy(_c);
    materials.pegboardMat.color.copy(_c);

    _c.set(s.chairFabricColor);
    materials.chairFabric.color.copy(_c);

    _c.set(s.accentColor);
    materials.accent.color.copy(_c);
    materials.accentGlow.color.copy(_c);

    _c.set(s.accentEmissive);
    materials.accentGlow.emissive.copy(_c);
    materials.accentGlow.emissiveIntensity = 0.75 + s.developerFocusAmount * 0.55;

    _c.set(s.lampLightColor);
    materials.lampBulb.emissive.copy(_c);

    _c.set(s.monitorGlowColor);
    materials.monitorScreen.emissive.copy(_c);
    materials.monitorScreen.emissiveIntensity = 0.68 + s.developerFocusAmount * 0.32;
    materials.laptopScreen.emissive.copy(_c);
    materials.laptopScreen.emissiveIntensity = 0.58 + s.developerFocusAmount * 0.22;

    _c.set(s.keyLightColor);
    materials.windowGlass.emissive.copy(_c);

    // Helper: smoothly drop computer & gadgets straight down from upper side (+Y) into exact fixed place
    const applyUpperDrop = (
      group: THREE.Group | null,
      progress: number,
      baseY: number,
      dropHeight: number
    ) => {
      if (!group) return;
      if (progress <= 0.004) {
        group.visible = false;
        return;
      }
      group.visible = true;
      const p = Math.min(1, Math.max(0, progress));
      group.position.y = baseY + (1 - p) * dropHeight;
    };

    applyUpperDrop(monitorGroupRef.current, s.monitorDrop, 0.75, 1.85);
    applyUpperDrop(laptopGroupRef.current, s.laptopDrop, 0.75, 1.75);
    applyUpperDrop(peripheralsGroupRef.current, s.peripheralsDrop, 0, 1.45);
    applyUpperDrop(pegboardGroupRef.current, s.pegboardDrop, 1.74, 1.55);
    applyUpperDrop(pegboardAccentsRef.current, s.accentGadgetsDrop, 0, 0.95);
    applyUpperDrop(wallArtGroupRef.current, s.wallArtDrop, 1.84, 1.55);
    applyUpperDrop(lampWrapperRef.current, s.accentGadgetsDrop, 0, 1.65);
    applyUpperDrop(deskAccentsGroupRef.current, s.accentGadgetsDrop, 0, 1.45);
  });

  // Architectural slat indices for subtle back-right studio wall treatment
  const acousticSlats = useMemo(
    () => Array.from({ length: isMobile ? 10 : 16 }, (_, i) => 1.72 + i * 0.088),
    [isMobile]
  );

  return (
    <group name="developer-studio-workspace">
      {/* ==================== ARCHITECTURAL ROOM SHELL ==================== */}
      <group name="room-architecture">
        {/* Warm Oak Wood Plank Floor */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0.6, 0, 0.75]}
          material={materials.floor}
          receiveShadow
        >
          <planeGeometry args={[10.5, 9.0]} />
        </mesh>

        {/* Back Studio Wall */}
        <mesh
          position={[1.1, 2.15, -1.65]}
          material={materials.wall}
          receiveShadow
        >
          <boxGeometry args={[7.4, 4.3, 0.08]} />
        </mesh>

        {/* Subtle Architectural Vertical Wall Panels / Acoustic Slats on Right Back Wall */}
        <group name="wall-acoustic-panels" position={[0, 0, -1.595]}>
          <mesh position={[2.38, 2.05, -0.01]} material={materials.wallPanel} receiveShadow>
            <boxGeometry args={[1.5, 3.9, 0.02]} />
          </mesh>
          {acousticSlats.map((xPos, i) => (
            <mesh
              key={i}
              position={[xPos, 2.05, 0.012]}
              material={materials.wallPanel}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.042, 3.85, 0.026]} />
            </mesh>
          ))}
        </group>

        {/* Left Wall constructed around a recessed sunlit architectural window */}
        <group name="left-window-wall" position={[-2.45, 0, 0]}>
          {/* Back pier (between back wall and window) */}
          <mesh position={[0, 2.15, -1.08]} material={materials.wall} receiveShadow>
            <boxGeometry args={[0.14, 4.3, 1.24]} />
          </mesh>
          {/* Front pier */}
          <mesh position={[0, 2.15, 2.38]} material={materials.wall} receiveShadow>
            <boxGeometry args={[0.14, 4.3, 2.34]} />
          </mesh>
          {/* Below window sill */}
          <mesh position={[0, 0.44, 0.38]} material={materials.wall} receiveShadow>
            <boxGeometry args={[0.14, 0.88, 1.68]} />
          </mesh>
          {/* Above window header */}
          <mesh position={[0, 3.65, 0.38]} material={materials.wall} receiveShadow>
            <boxGeometry args={[0.14, 1.3, 1.68]} />
          </mesh>

          {/* Window frame casing & mullions casting diagonal studio light */}
          <mesh position={[-0.08, 1.94, 0.38]} rotation={[0, Math.PI / 2, 0]} material={materials.windowGlass}>
            <planeGeometry args={[1.66, 2.16]} />
          </mesh>
          {/* Window sill */}
          <mesh position={[0.06, 0.88, 0.38]} material={materials.trim} castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.04, 1.72]} />
          </mesh>
          {/* Vertical & Horizontal Mullions */}
          <mesh position={[0.01, 1.94, 0.38]} material={materials.trim} castShadow>
            <boxGeometry args={[0.06, 2.14, 0.055]} />
          </mesh>
          <mesh position={[0.01, 1.98, 0.38]} material={materials.trim} castShadow>
            <boxGeometry args={[0.06, 0.055, 1.68]} />
          </mesh>
          {/* Outer frame rails */}
          <mesh position={[0.01, 3.0, 0.38]} material={materials.trim} castShadow>
            <boxGeometry args={[0.08, 0.06, 1.72]} />
          </mesh>
          <mesh position={[0.01, 1.94, -0.45]} material={materials.trim} castShadow>
            <boxGeometry args={[0.08, 2.16, 0.06]} />
          </mesh>
          <mesh position={[0.01, 1.94, 1.21]} material={materials.trim} castShadow>
            <boxGeometry args={[0.08, 2.16, 0.06]} />
          </mesh>
        </group>

        {/* Crisp Architectural Floor Baseboards */}
        <mesh position={[1.1, 0.055, -1.6]} material={materials.trim} receiveShadow>
          <boxGeometry args={[7.4, 0.11, 0.028]} />
        </mesh>
        <mesh position={[-2.37, 0.055, 0.8]} material={materials.trim} receiveShadow>
          <boxGeometry args={[0.028, 0.11, 5.1]} />
        </mesh>

        {/* Ceiling slab for enclosed studio bounce */}
        <mesh position={[1.0, 4.25, 0.7]} rotation={[Math.PI / 2, 0, 0]} material={materials.wall}>
          <planeGeometry args={[8.5, 7.0]} />
        </mesh>
      </group>

      {/* ==================== POTTED FICUS PLANT (LEFT CORNER) ==================== */}
      <PottedFicusPlant
        isMobile={isMobile}
        contactShadowTex={textures.contactShadow}
        onAdminTrigger={onAdminTrigger}
      />

      {/* ==================== BACK WALL STUDIO DECOR ==================== */}
      {/* Framed Architectural Geometric Art Print */}
      <group ref={wallArtGroupRef} name="framed-wall-art" position={[-0.48, 1.84, -1.595]}>
        {/* Outer oak wood frame (4 rails) */}
        <mesh position={[0, 0.32, 0]} material={materials.woodFrame} castShadow>
          <boxGeometry args={[0.52, 0.026, 0.036]} />
        </mesh>
        <mesh position={[0, -0.32, 0]} material={materials.woodFrame} castShadow>
          <boxGeometry args={[0.52, 0.026, 0.036]} />
        </mesh>
        <mesh position={[-0.247, 0, 0]} material={materials.woodFrame} castShadow>
          <boxGeometry args={[0.026, 0.64, 0.036]} />
        </mesh>
        <mesh position={[0.247, 0, 0]} material={materials.woodFrame} castShadow>
          <boxGeometry args={[0.026, 0.64, 0.036]} />
        </mesh>
        {/* Archival cream paper backing */}
        <mesh position={[0, 0, -0.004]} material={materials.wallArtPaper}>
          <planeGeometry args={[0.47, 0.61]} />
        </mesh>
        {/* Dynamic 10% Theme Accent Bauhaus Geometric Arch + Circle inside frame */}
        <mesh position={[-0.02, -0.03, 0.002]} material={materials.accent}>
          <boxGeometry args={[0.16, 0.24, 0.004]} />
        </mesh>
        <mesh position={[0.04, 0.14, 0.003]} material={materials.accent}>
          <circleGeometry args={[0.068, 24]} />
        </mesh>
      </group>

      {/* Perforated Studio Wall Pegboard with Shelf, Books, Succulent & Headphones */}
      <group ref={pegboardGroupRef} name="studio-pegboard" position={[0.88, 1.74, -1.585]}>
        {/* Main perforated board (30% furniture color) */}
        <mesh material={materials.pegboardMat} castShadow receiveShadow>
          <boxGeometry args={[0.96, 0.6, 0.024]} />
        </mesh>
        {/* Floating pegboard shelf */}
        <mesh position={[-0.17, -0.14, 0.075]} material={materials.furniture} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.022, 0.13]} />
        </mesh>
        {/* Tiny Ceramic Succulent Pot on Shelf */}
        <group position={[-0.06, -0.128, 0.072]}>
          <mesh position={[0, 0.032, 0]} material={materials.neutralPaper} castShadow>
            <cylinderGeometry args={[0.036, 0.028, 0.064, 16]} />
          </mesh>
          <mesh position={[0, 0.078, 0]} material={materials.miniPlantGreen} castShadow>
            <dodecahedronGeometry args={[0.036, 1]} />
          </mesh>
        </group>

        {/* Accent Gadgets on Pegboard (Books + Hanging Headphones) dropping cleanly from upper side */}
        <group ref={pegboardAccentsRef} name="pegboard-accent-gadgets">
          {/* 3 Vertical Accent Hardcover Books on Shelf */}
          <mesh position={[-0.31, -0.04, 0.068]} material={materials.accent} castShadow>
            <boxGeometry args={[0.032, 0.17, 0.1]} />
          </mesh>
          <mesh position={[-0.27, -0.05, 0.068]} material={materials.accent} castShadow>
            <boxGeometry args={[0.028, 0.15, 0.095]} />
          </mesh>
          <mesh position={[-0.23, -0.06, 0.068]} material={materials.neutralPaper} castShadow>
            <boxGeometry args={[0.026, 0.135, 0.092]} />
          </mesh>
          {/* Sculptural Over-Ear Studio Headphones (10% accent color) */}
          <PegboardHeadphones
            accentMaterial={materials.accent}
            padMaterial={materials.darkMetal}
          />
        </group>
      </group>

      {/* ==================== MODERN COMPUTER DESK & PEDESTAL ==================== */}
      <group name="modern-developer-desk">
        {/* Grounded contact shadows beneath desk frame & drawer pedestal */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.64, 0.003, -0.78]}>
          <planeGeometry args={[0.55, 1.1]} />
          <meshBasicMaterial
            map={textures.contactShadow}
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.08, 0.003, -0.78]}>
          <planeGeometry args={[0.85, 1.05]} />
          <meshBasicMaterial
            map={textures.contactShadow}
            transparent
            opacity={0.48}
            depthWrite={false}
          />
        </mesh>

        {/* Primary Desktop Slab (top surface strictly at y = 0.75) */}
        <mesh
          position={[0.32, 0.726, -0.78]}
          material={materials.furniture}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.16, 0.048, 0.9]} />
        </mesh>

        {/* Subtle rear bias ambient LED strip casting soft theme glow onto back wall */}
        <mesh position={[0.32, 0.715, -1.235]} material={materials.accentGlow}>
          <boxGeometry args={[1.65, 0.018, 0.014]} />
        </mesh>

        {/* Left Architectural Steel Leg Frame (flush on floor y = 0) */}
        <group position={[-0.66, 0, -0.78]}>
          <mesh position={[0, 0.352, -0.36]} material={materials.furniture} castShadow receiveShadow>
            <boxGeometry args={[0.045, 0.704, 0.045]} />
          </mesh>
          <mesh position={[0, 0.352, 0.36]} material={materials.furniture} castShadow receiveShadow>
            <boxGeometry args={[0.045, 0.704, 0.045]} />
          </mesh>
          {/* Top & bottom crossbars */}
          <mesh position={[0, 0.022, 0]} material={materials.furniture} castShadow receiveShadow>
            <boxGeometry args={[0.045, 0.044, 0.76]} />
          </mesh>
          <mesh position={[0, 0.682, 0]} material={materials.furniture} castShadow>
            <boxGeometry args={[0.045, 0.04, 0.76]} />
          </mesh>
        </group>

        {/* Under-desk horizontal modesty support beam */}
        <mesh position={[0.12, 0.675, -1.1]} material={materials.furniture} castShadow>
          <boxGeometry args={[1.55, 0.055, 0.035]} />
        </mesh>

        {/* Right 3-Drawer Pedestal Storage Cabinet (30% furniture finish) */}
        <group position={[1.08, 0, -0.78]}>
          {/* Cabinet feet resting flush on y = 0 */}
          {[
            [-0.2, -0.26],
            [0.2, -0.26],
            [-0.2, 0.26],
            [0.2, 0.26],
          ].map(([fx, fz], i) => (
            <mesh key={i} position={[fx, 0.025, fz]} material={materials.darkMetal} castShadow>
              <cylinderGeometry args={[0.016, 0.014, 0.05, 10]} />
            </mesh>
          ))}
          {/* Main cabinet body */}
          <mesh position={[0, 0.375, 0]} material={materials.furniture} castShadow receiveShadow>
            <boxGeometry args={[0.48, 0.65, 0.64]} />
          </mesh>
          {/* 3 Beveled Drawer Fronts + Sleek Horizontal Pulls */}
          {[0.175, 0.375, 0.575].map((dy, i) => (
            <group key={i} position={[0, dy, 0.324]}>
              <mesh material={materials.furniture} castShadow receiveShadow>
                <boxGeometry args={[0.44, 0.178, 0.018]} />
              </mesh>
              <mesh position={[0, 0.03, 0.014]} material={materials.darkMetal}>
                <boxGeometry args={[0.13, 0.012, 0.016]} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ==================== DESK HARDWARE & STUDIO PROPS (Y = 0.75) ==================== */}
      <group name="desk-equipment">
        {/* Wide Felt Desk Mat */}
        <mesh position={[0.16, 0.753, -0.52]} material={materials.deskMat} receiveShadow>
          <boxGeometry args={[1.02, 0.006, 0.38]} />
        </mesh>

        {/* Primary 32" Studio Monitor on Brushed Aluminum L-Stand */}
        <group ref={monitorGroupRef} name="desktop-monitor" position={[0.24, 0.75, -0.98]}>
          {/* Stand base plate */}
          <mesh position={[0, 0.008, 0.02]} material={materials.brushedAluminum} castShadow receiveShadow>
            <boxGeometry args={[0.24, 0.016, 0.19]} />
          </mesh>
          {/* Stand neck riser */}
          <mesh
            position={[0, 0.19, -0.04]}
            rotation={[0.08, 0, 0]}
            material={materials.brushedAluminum}
            castShadow
          >
            <boxGeometry args={[0.068, 0.37, 0.018]} />
          </mesh>
          {/* Display chassis */}
          <group position={[0, 0.41, 0.015]} rotation={[-0.03, 0, 0]}>
            {/* Aluminum rear enclosure */}
            <mesh material={materials.brushedAluminum} castShadow receiveShadow>
              <boxGeometry args={[0.85, 0.49, 0.022]} />
            </mesh>
            {/* Dark slim front bezel */}
            <mesh position={[0, 0, 0.011]} material={materials.darkMetal}>
              <boxGeometry args={[0.842, 0.482, 0.006]} />
            </mesh>
            {/* Live IDE Code Screen */}
            <mesh position={[0, 0.005, 0.0155]} material={materials.monitorScreen}>
              <planeGeometry args={[0.808, 0.448]} />
            </mesh>
            {/* Subtle chin branding indicator */}
            <mesh position={[0, -0.228, 0.015]} material={materials.brushedAluminum}>
              <boxGeometry args={[0.036, 0.006, 0.002]} />
            </mesh>
          </group>
        </group>

        {/* Secondary Elevated Aluminum Laptop on Stand (Left of Monitor) */}
        <group
          ref={laptopGroupRef}
          name="developer-laptop"
          position={[-0.42, 0.75, -0.84]}
          rotation={[0, 0.36, 0]}
        >
          {/* Aluminum Laptop Stand */}
          <mesh position={[0, 0.007, 0]} material={materials.brushedAluminum} castShadow receiveShadow>
            <boxGeometry args={[0.22, 0.014, 0.22]} />
          </mesh>
          <mesh
            position={[0, 0.075, -0.02]}
            rotation={[-0.32, 0, 0]}
            material={materials.brushedAluminum}
            castShadow
          >
            <boxGeometry args={[0.09, 0.14, 0.014]} />
          </mesh>
          {/* Laptop Base Deck */}
          <group position={[0, 0.145, 0.01]} rotation={[0.26, 0, 0]}>
            <mesh material={materials.brushedAluminum} castShadow receiveShadow>
              <boxGeometry args={[0.34, 0.014, 0.23]} />
            </mesh>
            {/* Recessed Keyboard Deck */}
            <mesh position={[0, 0.008, -0.012]} material={materials.darkMetal}>
              <boxGeometry args={[0.28, 0.004, 0.115]} />
            </mesh>
            {/* Trackpad */}
            <mesh position={[0, 0.008, 0.07]} material={materials.furniture}>
              <boxGeometry args={[0.105, 0.003, 0.062]} />
            </mesh>
            {/* Open Lid + Display */}
            <group position={[0, 0.01, -0.112]} rotation={[-0.38, 0, 0]}>
              <mesh position={[0, 0.115, 0]} material={materials.brushedAluminum} castShadow>
                <boxGeometry args={[0.34, 0.23, 0.009]} />
              </mesh>
              <mesh position={[0, 0.115, 0.0055]} material={materials.darkMetal}>
                <planeGeometry args={[0.33, 0.22]} />
              </mesh>
              <mesh position={[0, 0.118, 0.0068]} material={materials.laptopScreen}>
                <planeGeometry args={[0.31, 0.195]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Keyboard & Wireless Mouse descending cleanly onto the felt desk mat */}
        <group ref={peripheralsGroupRef} name="desk-peripherals">
          {/* Compact 75% Mechanical Keyboard */}
          <group name="mechanical-keyboard" position={[0.1, 0.764, -0.49]} rotation={[0.05, 0, 0]}>
            <mesh material={materials.darkMetal} castShadow receiveShadow>
              <boxGeometry args={[0.36, 0.016, 0.135]} />
            </mesh>
            {/* Subtle accent keycap underglow plate */}
            <mesh position={[0, 0.007, 0]} material={materials.accentGlow}>
              <boxGeometry args={[0.336, 0.004, 0.112]} />
            </mesh>
            {/* Sculpted Keycap Rows */}
            {[-0.042, -0.021, 0, 0.021, 0.042].map((rz, idx) => (
              <mesh
                key={idx}
                position={[0, 0.013, rz]}
                material={idx === 4 ? materials.furniture : materials.neutralPaper}
                castShadow
              >
                <boxGeometry args={[idx === 4 ? 0.31 : 0.33, 0.009, 0.015]} />
              </mesh>
            ))}
          </group>

          {/* Sculpted Wireless Mouse */}
          <group name="wireless-mouse" position={[0.41, 0.768, -0.48]}>
            <mesh scale={[0.8, 0.55, 1.35]} material={materials.neutralPaper} castShadow>
              <sphereGeometry args={[0.04, 16, 14]} />
            </mesh>
            <mesh position={[0, 0.018, -0.016]} material={materials.darkMetal}>
              <boxGeometry args={[0.006, 0.008, 0.016]} />
            </mesh>
          </group>
        </group>

        {/* Iconic Mushroom Desk Lamp (10% Accent Color) descending from upper side */}
        <group ref={lampWrapperRef} name="mushroom-lamp-drop-wrapper">
          <MushroomDeskLamp
            accentMaterial={materials.accent}
            bulbMaterial={materials.lampBulb}
          />
        </group>

        {/* Ceramic Coffee Mug & Desk Notebook (10% Accent Color) descending from upper side */}
        <group ref={deskAccentsGroupRef} name="desk-accent-accessories">
          {/* Coffee mug */}
          <group position={[0.73, 0.75, -0.58]}>
            <mesh position={[0, 0.048, 0]} material={materials.accent} castShadow receiveShadow>
              <cylinderGeometry args={[0.04, 0.036, 0.096, 20]} />
            </mesh>
            <mesh position={[0.042, 0.048, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.accent}>
              <torusGeometry args={[0.024, 0.006, 8, 16, Math.PI]} />
            </mesh>
            {/* Dark espresso inside */}
            <mesh position={[0, 0.092, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.darkMetal}>
              <circleGeometry args={[0.034, 16]} />
            </mesh>
          </group>

          {/* Small notebook + accent pen on left-front desk */}
          <group position={[-0.48, 0.758, -0.52]} rotation={[0, 0.14, 0]}>
            <mesh material={materials.accent} castShadow receiveShadow>
              <boxGeometry args={[0.16, 0.014, 0.21]} />
            </mesh>
            <mesh position={[0.095, 0.006, 0]} rotation={[Math.PI / 2, 0, 0.08]} material={materials.brushedAluminum}>
              <cylinderGeometry args={[0.005, 0.005, 0.14, 8]} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ==================== ERGONOMIC SWIVEL OFFICE CHAIR ==================== */}
      <group
        name="ergonomic-office-chair"
        position={[0.1, 0, -0.05]}
        rotation={[0, 0.04, 0]}
      >
        {/* Grounded contact shadow under chair wheelbase */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0.02]}>
          <planeGeometry args={[0.88, 0.88]} />
          <meshBasicMaterial
            map={textures.contactShadow}
            transparent
            opacity={0.46}
            depthWrite={false}
          />
        </mesh>

        {/* 5-Star Swivel Base + Rolling Casters flush on oak floor (y = 0) */}
        {[0, 1, 2, 3, 4].map((idx) => {
          const angle = (idx / 5) * Math.PI * 2 + 0.35;
          const xEnd = Math.cos(angle) * 0.27;
          const zEnd = Math.sin(angle) * 0.27;
          return (
            <group key={idx}>
              {/* Star spoke arm */}
              <mesh
                position={[xEnd * 0.5, 0.085, zEnd * 0.5]}
                rotation={[0, -angle, 0]}
                material={materials.darkMetal}
                castShadow
              >
                <boxGeometry args={[0.28, 0.026, 0.032]} />
              </mesh>
              {/* Caster wheel touching y = 0 */}
              <mesh
                position={[xEnd, 0.028, zEnd]}
                rotation={[0, -angle, Math.PI / 2]}
                material={materials.darkMetal}
                castShadow
              >
                <cylinderGeometry args={[0.028, 0.028, 0.026, 12]} />
              </mesh>
            </group>
          );
        })}

        {/* Hydraulic Gas Lift Column */}
        <mesh position={[0, 0.25, 0]} material={materials.darkMetal} castShadow>
          <cylinderGeometry args={[0.03, 0.034, 0.34, 16]} />
        </mesh>
        <mesh position={[0, 0.42, 0]} material={materials.brushedAluminum}>
          <cylinderGeometry args={[0.022, 0.022, 0.08, 14]} />
        </mesh>

        {/* Under-seat Tilt Mechanism */}
        <mesh position={[0, 0.435, 0.01]} material={materials.darkMetal} castShadow>
          <boxGeometry args={[0.2, 0.045, 0.22]} />
        </mesh>

        {/* Contoured Upholstered Seat Cushion (top at y = 0.499) */}
        <mesh position={[0, 0.465, -0.01]} material={materials.chairFabric} castShadow receiveShadow>
          <boxGeometry args={[0.48, 0.068, 0.46]} />
        </mesh>
        {/* Outer Structural Seat Shell Trim (30% furniture color) */}
        <mesh position={[0, 0.44, -0.01]} material={materials.furniture} castShadow>
          <boxGeometry args={[0.495, 0.024, 0.475]} />
        </mesh>

        {/* Curved Lumbar Backrest Spine & Upholstered Back Cushion reclining naturally backward (+Z) */}
        <mesh
          position={[0, 0.65, 0.235]}
          rotation={[0.1, 0, 0]}
          material={materials.furniture}
          castShadow
        >
          <boxGeometry args={[0.11, 0.42, 0.032]} />
        </mesh>
        {/* Backrest outer shell (30% furniture finish — transforms beautifully across themes!) */}
        <mesh
          position={[0, 0.78, 0.23]}
          rotation={[0.08, 0, 0]}
          material={materials.furniture}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.45, 0.48, 0.036]} />
        </mesh>
        {/* Backrest inner cushion */}
        <mesh
          position={[0, 0.78, 0.205]}
          rotation={[0.08, 0, 0]}
          material={materials.chairFabric}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.42, 0.45, 0.034]} />
        </mesh>

        {/* Left & Right Ergonomic T-Armrests */}
        {[-0.27, 0.27].map((ax, i) => (
          <group key={i} position={[ax, 0, -0.02]}>
            {/* Armrest post */}
            <mesh position={[0, 0.54, 0.03]} material={materials.darkMetal} castShadow>
              <boxGeometry args={[0.028, 0.21, 0.032]} />
            </mesh>
            {/* Horizontal support connector under seat */}
            <mesh position={[i === 0 ? 0.05 : -0.05, 0.44, 0.03]} material={materials.darkMetal}>
              <boxGeometry args={[0.11, 0.026, 0.032]} />
            </mesh>
            {/* Soft Armrest Pad */}
            <mesh position={[0, 0.652, -0.01]} material={materials.darkMetal} castShadow receiveShadow>
              <boxGeometry args={[0.068, 0.024, 0.24]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ==================== SEATED 3D DEVELOPER AVATAR (VIGNESH) ==================== */}
      <DeveloperAvatar reducedMotion={reducedMotion} isMobile={isMobile} />
    </group>
  );
}
