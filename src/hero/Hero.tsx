import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowDown, ShieldCheck } from 'lucide-react';
import {
  HERO_THEMES,
  createHeroTimeline,
  createInitialAnimationState,
  type HeroAnimationState,
} from './heroAnimations';
import { usePortfolio } from '../context/PortfolioContext';

const HeroScene = lazy(() => import('./HeroScene'));

interface HeroProps {
  adminLinkUnlocked: boolean;
  onAdminTreeTrigger: () => void;
  onOpenAdmin: () => void;
}

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Clean architectural static fallback rendered if WebGL is unsupported or context is lost.
 */
function StaticStudioFallback() {
  const theme = HERO_THEMES[0];

  return (
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(circle at 22% 24%, ${theme.keyLightColor}22 0%, transparent 45%), linear-gradient(145deg, ${theme.wallColor} 0%, ${theme.panelColor} 58%, #121216 100%)`,
      }}
    />
  );
}

export function Hero({
  adminLinkUnlocked,
  onAdminTreeTrigger,
  onOpenAdmin,
}: HeroProps) {
  const { profile, isOwnerAdmin } = usePortfolio();
  const sectionRef = useRef<HTMLElement>(null);
  const animStateRef = useRef<HeroAnimationState>(createInitialAnimationState());
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const [webglAvailable, setWebglAvailable] = useState<boolean>(() => checkWebGLSupport());
  const [contextLost, setContextLost] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  // Scroll-driven fade out smoothed with a spring so stepped wheel ticks glide cleanly
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 30,
    mass: 0.25,
  });

  const stageOpacity = useTransform(smoothProgress, [0, 0.72, 0.96], [1, 0.28, 0]);
  const stageScale = useTransform(smoothProgress, [0, 0.96], [1, 0.975]);
  const titleY = useTransform(smoothProgress, [0, 0.85], [0, -32]);
  const scrollCueOpacity = useTransform(smoothProgress, [0, 0.24], [1, 0]);

  // Pause WebGL & GSAP timeline once scrolled fully off-screen so lower sections scroll at peak 60/120fps
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '140px 0px 140px 0px', threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Track responsive mobile breakpoint & prefers-reduced-motion media query
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Initialize continuous 24-second GSAP master timeline on page load
  useEffect(() => {
    const tl = createHeroTimeline(animStateRef.current);
    timelineRef.current = tl;

    if (reducedMotion) {
      tl.pause(HERO_THEMES[0].seekTime);
    } else {
      tl.play(0);
    }

    return () => {
      tl.kill();
      timelineRef.current = null;
    };
  }, [reducedMotion]);

  // Sync GSAP timeline play/pause with off-screen visibility
  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) return;
    if (reducedMotion) {
      tl.pause(HERO_THEMES[0].seekTime);
    } else if (isInView) {
      tl.play();
    } else {
      tl.pause();
    }
  }, [isInView, reducedMotion]);

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  const handleContextLost = useCallback(() => {
    setContextLost(true);
  }, []);

  const handleContextRestored = useCallback(() => {
    setContextLost(false);
    setWebglAvailable(true);
  }, []);

  const showFallback = !webglAvailable || contextLost;
  const showUnlockedAdminLink = adminLinkUnlocked || isOwnerAdmin;

  return (
    <section
      ref={sectionRef}
      aria-label="Vignesh 3D Developer Workspace Hero"
      className="relative h-[100svh] w-full touch-pan-y overflow-hidden bg-[#121216] text-white select-none"
    >
      <motion.div
        style={
          reducedMotion
            ? undefined
            : { opacity: stageOpacity, scale: stageScale }
        }
        className="relative h-full w-full origin-center transform-gpu will-change-[opacity,transform]"
      >
        {/* ==================== REAL-TIME 3D WORKSPACE CANVAS ==================== */}
        <div className="absolute inset-0">
          {showFallback ? (
            <StaticStudioFallback />
          ) : (
            <Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center bg-[#121216]">
                  <div className="text-center">
                    <p className="font-[var(--font-display)] text-sm font-medium tracking-widest text-white/60 uppercase">
                      Preparing 3D Studio
                    </p>
                  </div>
                </div>
              }
            >
              <HeroScene
                animStateRef={animStateRef}
                isMobile={isMobile}
                reducedMotion={reducedMotion}
                paused={!isInView}
                onAdminTrigger={onAdminTreeTrigger}
                onSceneReady={handleSceneReady}
                onContextLost={handleContextLost}
                onContextRestored={handleContextRestored}
              />
            </Suspense>
          )}
        </div>

        {/* ==================== 0-3s INITIAL WORKSPACE REVEAL FADE ==================== */}
        {!showFallback && !reducedMotion && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 z-[5] bg-[#121216] transition-opacity duration-[2000ms] ease-out ${
              sceneReady ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}

        {/* ==================== MEASURED TOP-LEFT CONTRAST SCRIM ==================== */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-[8] h-64 w-full max-w-2xl"
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(18, 18, 22, 0.72) 0%, rgba(18, 18, 22, 0.34) 48%, rgba(18, 18, 22, 0) 76%)',
          }}
        />

        {/* ==================== SUBTLE BOTTOM TRANSITION EDGE INTO ROYAL BLACK ==================== */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] h-28"
          style={{
            background:
              'linear-gradient(to bottom, rgba(18, 18, 22, 0) 0%, rgba(18, 18, 22, 0.78) 78%, #121216 100%)',
          }}
        />

        {/* ==================== TOP-LEFT EDITORIAL DEVELOPER IDENTITY ==================== */}
        <motion.header
          style={reducedMotion ? undefined : { y: titleY }}
          className="pointer-events-none absolute top-0 left-0 z-10 px-6 pt-6 sm:px-10 sm:pt-9 lg:px-12 lg:pt-11"
        >
          <div className="max-w-xl">
            <h1
              className="font-[var(--font-display)] text-[clamp(2.1rem,4.2vw,3.65rem)] font-bold leading-[1.04] tracking-[-0.02em] text-white uppercase"
              style={{
                textShadow: '0 2px 24px rgba(0, 0, 0, 0.45)',
                textWrap: 'balance',
              }}
            >
              HI, I&apos;M {profile.name}
            </h1>
            <p
              className="mt-2.5 font-[var(--font-sans)] text-xs font-medium tracking-[0.16em] text-white/88 uppercase sm:text-sm"
              style={{ textShadow: '0 1px 16px rgba(0, 0, 0, 0.5)' }}
            >
              {profile.role} <span className="mx-1.5 text-[#C8FF2E]">|</span> DEVELOPER
            </p>
          </div>
        </motion.header>

        {/* ==================== HIDDEN ADMIN PORTAL LINK (ONLY SHOWN ONCE UNLOCKED VIA 3D TREE) ==================== */}
        {showUnlockedAdminLink && (
          <div className="absolute right-6 bottom-6 z-20 sm:right-10 sm:bottom-8">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 border border-[#C8FF2E] bg-[#121216]/95 px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-[#C8FF2E] uppercase transition-colors hover:bg-[#C8FF2E] hover:text-[#121216]"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Admin Portal</span>
            </button>
          </div>
        )}

        {/* ==================== SUBTLE SCROLL DOWN CUE ==================== */}
        <motion.div
          style={reducedMotion ? undefined : { opacity: scrollCueOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-4 sm:bottom-8"
        >
          <a
            href="#intro"
            className="pointer-events-auto group inline-flex items-center gap-2.5 border border-[#4A4B52]/80 bg-[#121216]/85 px-4 py-2 font-mono text-[11px] font-medium tracking-[0.18em] text-[#E4E5EC] uppercase transition-colors duration-200 hover:border-[#C8FF2E] hover:text-[#C8FF2E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C8FF2E]"
          >
            <span>Scroll to Explore</span>
            <ArrowDown
              className="h-3.5 w-3.5 text-[#C8FF2E] transition-transform duration-200 group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;
