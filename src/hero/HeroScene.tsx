import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EnvironmentLighting } from './EnvironmentLighting';
import { Workspace } from './Workspace';
import type { HeroAnimationState } from './heroAnimations';

interface HeroSceneProps {
  animStateRef: React.MutableRefObject<HeroAnimationState>;
  isMobile: boolean;
  reducedMotion: boolean;
  paused: boolean;
  onAdminTrigger?: () => void;
  onSceneReady: () => void;
  onContextLost: () => void;
  onContextRestored: () => void;
}

const DESKTOP_CAMERA_POS: [number, number, number] = [-1.42, 1.6, 3.18];
const DESKTOP_CAMERA_TARGET: [number, number, number] = [0.16, 1.0, -0.58];
const DESKTOP_CAMERA_FOV = 35;

const MOBILE_CAMERA_POS: [number, number, number] = [-1.18, 1.66, 3.92];
const MOBILE_CAMERA_TARGET: [number, number, number] = [0.06, 0.96, -0.55];
const MOBILE_CAMERA_FOV = 44;

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

/**
 * Strictly stationary camera controller. Configures the fixed architectural perspective
 * once on mount (and adjusts base framing only if viewport crosses desktop/mobile breakpoint).
 * Never orbits, zooms, pans, or shifts position during the animation cycle.
 */
function FixedCameraRig({
  isMobile,
  isSoftwareGl,
  onSceneReady,
}: {
  isMobile: boolean;
  isSoftwareGl: boolean;
  onSceneReady: () => void;
}) {
  const { camera, gl, scene } = useThree();
  const readyFiredRef = useRef(false);

  useEffect(() => {
    const pos = isMobile ? MOBILE_CAMERA_POS : DESKTOP_CAMERA_POS;
    const target = isMobile ? MOBILE_CAMERA_TARGET : DESKTOP_CAMERA_TARGET;
    const fov = isMobile ? MOBILE_CAMERA_FOV : DESKTOP_CAMERA_FOV;

    camera.position.set(pos[0], pos[1], pos[2]);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov;
      camera.near = 0.1;
      camera.far = 35;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(target[0], target[1], target[2]);
    camera.updateMatrixWorld();

    if (!readyFiredRef.current) {
      readyFiredRef.current = true;
      if (!isSoftwareGl) {
        gl.compile(scene, camera);
      }
      onSceneReady();
    }
  }, [camera, gl, scene, isMobile, isSoftwareGl, onSceneReady]);

  return null;
}

/**
 * Fence-sync frame pacer strictly for software WebGL environments (SwiftShader / llvmpipe)
 * so the main thread and browser UI stay completely responsive.
 */
function SoftwareGlPacer({ enabled }: { enabled: boolean }) {
  const { gl, invalidate } = useThree();

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    let timerId = 0;

    const scheduleNext = () => {
      if (disposed) return;
      const ctx = gl.getContext() as WebGL2RenderingContext;
      if (ctx && typeof ctx.fenceSync === 'function') {
        const sync = ctx.fenceSync(ctx.SYNC_GPU_COMMANDS_COMPLETE, 0);
        ctx.flush();
        const poll = () => {
          if (disposed) {
            if (sync) ctx.deleteSync(sync);
            return;
          }
          const status = sync ? ctx.getSyncParameter(sync, ctx.SYNC_STATUS) : ctx.SIGNALED;
          if (status === ctx.UNSIGNALED) {
            timerId = window.setTimeout(poll, 8);
          } else {
            if (sync) ctx.deleteSync(sync);
            timerId = window.setTimeout(() => {
              if (!disposed) {
                invalidate();
                scheduleNext();
              }
            }, 80);
          }
        };
        timerId = window.setTimeout(poll, 8);
      } else {
        timerId = window.setTimeout(() => {
          if (!disposed) {
            invalidate();
            scheduleNext();
          }
        }, 90);
      }
    };

    invalidate();
    scheduleNext();

    return () => {
      disposed = true;
      window.clearTimeout(timerId);
    };
  }, [enabled, gl, invalidate]);

  return null;
}

export default function HeroScene({
  animStateRef,
  isMobile,
  reducedMotion,
  paused,
  onAdminTrigger,
  onSceneReady,
  onContextLost,
  onContextRestored,
}: HeroSceneProps) {
  const isSoftwareGl = useMemo(() => detectSoftwareWebGL(), []);
  const canvasDomRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasDomRef.current;
    if (!canvas) return;

    const handleLost = (e: Event) => {
      e.preventDefault();
      onContextLost();
    };
    const handleRestored = () => {
      onContextRestored();
    };

    canvas.addEventListener('webglcontextlost', handleLost, false);
    canvas.addEventListener('webglcontextrestored', handleRestored, false);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleLost);
      canvas.removeEventListener('webglcontextrestored', handleRestored);
    };
  }, [onContextLost, onContextRestored]);

  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        style={{ touchAction: 'pan-y' }}
        shadows={isSoftwareGl ? false : 'percentage'}
        dpr={isSoftwareGl ? 1 : [1, isMobile ? 1.5 : 2]}
        frameloop={paused || isSoftwareGl ? 'demand' : 'always'}
        camera={{
          position: isMobile ? MOBILE_CAMERA_POS : DESKTOP_CAMERA_POS,
          fov: isMobile ? MOBILE_CAMERA_FOV : DESKTOP_CAMERA_FOV,
          near: 0.1,
          far: 35,
        }}
        gl={{
          antialias: !isSoftwareGl,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        onCreated={({ gl }) => {
          canvasDomRef.current = gl.domElement;
          gl.shadowMap.enabled = !isSoftwareGl;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <FixedCameraRig
          isMobile={isMobile}
          isSoftwareGl={isSoftwareGl}
          onSceneReady={onSceneReady}
        />

        <SoftwareGlPacer enabled={isSoftwareGl && !paused} />

        <EnvironmentLighting
          animStateRef={animStateRef}
          isMobile={isMobile}
          isSoftwareGl={isSoftwareGl}
        />

        <Workspace
          animStateRef={animStateRef}
          isMobile={isMobile}
          reducedMotion={reducedMotion}
          onAdminTrigger={onAdminTrigger}
        />
      </Canvas>
    </div>
  );
}
