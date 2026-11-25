import gsap from 'gsap';

export type ThemeId = 'graphite' | 'electric-blue' | 'forest-green' | 'dusty-lilac';

export interface SwatchSpec {
  label: string;
  hex: string;
  ratio: '60%' | '30%' | '10%';
  isAccent?: boolean;
}

export interface HeroThemeConfig {
  id: ThemeId;
  index: number;
  name: string;
  shortName: string;
  tagline: string;
  seekTime: number;
  wallColor: string;
  panelColor: string;
  trimColor: string;
  furnitureColor: string;
  chairFabricColor: string;
  accentColor: string;
  accentEmissive: string;
  keyLightColor: string;
  keyLightIntensity: number;
  hemiSkyColor: string;
  hemiGroundColor: string;
  hemiIntensity: number;
  lampLightColor: string;
  lampLightIntensity: number;
  rimLightColor: string;
  rimLightIntensity: number;
  monitorGlowColor: string;
  monitorGlowIntensity: number;
  fogColor: string;
  cardGlowColor: string;
  swatches: [SwatchSpec, SwatchSpec, SwatchSpec];
}

export const TIMELINE_DURATION = 24;

export const HERO_THEMES: HeroThemeConfig[] = [
  {
    id: 'graphite',
    index: 0,
    name: 'Graphite Black',
    shortName: 'Graphite',
    tagline: 'Minimal dark studio · neutral balanced lighting',
    seekTime: 4.5,
    wallColor: '#252830',
    panelColor: '#1B1E24',
    trimColor: '#363B45',
    furnitureColor: '#2C3038',
    chairFabricColor: '#202329',
    accentColor: '#EEF1F6',
    accentEmissive: '#DDE4F0',
    keyLightColor: '#FFF7EC',
    keyLightIntensity: 2.35,
    hemiSkyColor: '#D6DFEE',
    hemiGroundColor: '#48433E',
    hemiIntensity: 0.85,
    lampLightColor: '#FFF1DC',
    lampLightIntensity: 1.85,
    rimLightColor: '#CFD8E8',
    rimLightIntensity: 0.85,
    monitorGlowColor: '#CFE0FF',
    monitorGlowIntensity: 1.05,
    fogColor: '#1B1D23',
    cardGlowColor: '#E5E9F2',
    swatches: [
      { label: 'Graphite Black', hex: '#232427', ratio: '60%' },
      { label: 'Slate Ash', hex: '#383D47', ratio: '30%' },
      { label: 'Studio White', hex: '#EEF1F6', ratio: '10%', isAccent: true },
    ],
  },
  {
    id: 'electric-blue',
    index: 1,
    name: 'Electric Blue',
    shortName: 'Electric Blue',
    tagline: 'Deep cobalt architecture · cool electric reflections',
    seekTime: 8.5,
    wallColor: '#1B2D52',
    panelColor: '#111E3B',
    trimColor: '#2B4270',
    furnitureColor: '#22252C',
    chairFabricColor: '#1A1D24',
    accentColor: '#285BFF',
    accentEmissive: '#3B6EFF',
    keyLightColor: '#EAF2FF',
    keyLightIntensity: 2.2,
    hemiSkyColor: '#7EA9FF',
    hemiGroundColor: '#202D48',
    hemiIntensity: 1.05,
    lampLightColor: '#3B74FF',
    lampLightIntensity: 2.8,
    rimLightColor: '#4D82FF',
    rimLightIntensity: 1.65,
    monitorGlowColor: '#4E86FF',
    monitorGlowIntensity: 1.45,
    fogColor: '#111C33',
    cardGlowColor: '#285BFF',
    swatches: [
      { label: 'Cobalt Slate', hex: '#1B2D52', ratio: '60%' },
      { label: 'Graphite Black', hex: '#22252C', ratio: '30%' },
      { label: 'Electric Blue', hex: '#285BFF', ratio: '10%', isAccent: true },
    ],
  },
  {
    id: 'forest-green',
    index: 2,
    name: 'Forest Green',
    shortName: 'Forest Green',
    tagline: 'Botanical studio walls · warm oat & natural balance',
    seekTime: 12.5,
    wallColor: '#1F3A2E',
    panelColor: '#152A21',
    trimColor: '#2E5242',
    furnitureColor: '#EAE0CC',
    chairFabricColor: '#DDD2BC',
    accentColor: '#FF8A1C',
    accentEmissive: '#FF9A3C',
    keyLightColor: '#FFF5E2',
    keyLightIntensity: 2.45,
    hemiSkyColor: '#BBE0C8',
    hemiGroundColor: '#4D4538',
    hemiIntensity: 1.0,
    lampLightColor: '#FF9E45',
    lampLightIntensity: 2.45,
    rimLightColor: '#58B47E',
    rimLightIntensity: 1.35,
    monitorGlowColor: '#A6E8BE',
    monitorGlowIntensity: 1.15,
    fogColor: '#162820',
    cardGlowColor: '#FF8A1C',
    swatches: [
      { label: 'Forest Green', hex: '#1F3A2E', ratio: '60%' },
      { label: 'Oat Cream', hex: '#EAE0CC', ratio: '30%' },
      { label: 'Tangerine', hex: '#FF8A1C', ratio: '10%', isAccent: true },
    ],
  },
  {
    id: 'dusty-lilac',
    index: 3,
    name: 'Dusty Lilac',
    shortName: 'Dusty Lilac',
    tagline: 'Muted lilac interior · ink navy & cinematic glow',
    seekTime: 16.5,
    wallColor: '#9C88B5',
    panelColor: '#7B6894',
    trimColor: '#B5A3CC',
    furnitureColor: '#1C2340',
    chairFabricColor: '#171D36',
    accentColor: '#D6B8FF',
    accentEmissive: '#C59BFF',
    keyLightColor: '#F9F2FF',
    keyLightIntensity: 2.15,
    hemiSkyColor: '#DAC8F2',
    hemiGroundColor: '#3B314C',
    hemiIntensity: 1.05,
    lampLightColor: '#C084FC',
    lampLightIntensity: 2.6,
    rimLightColor: '#B980FF',
    rimLightIntensity: 1.55,
    monitorGlowColor: '#C8A8FF',
    monitorGlowIntensity: 1.35,
    fogColor: '#4A3D5E',
    cardGlowColor: '#C084FC',
    swatches: [
      { label: 'Dusty Lilac', hex: '#9C88B5', ratio: '60%' },
      { label: 'Ink Navy', hex: '#1C2340', ratio: '30%' },
      { label: 'Soft Lavender', hex: '#D6B8FF', ratio: '10%', isAccent: true },
    ],
  },
];

// Dedicated final showcase state (18–22s) that spotlights the seated developer
const DEVELOPER_FOCUS_STATE = {
  wallColor: '#1E2332',
  panelColor: '#151926',
  trimColor: '#2E364D',
  furnitureColor: '#242833',
  chairFabricColor: '#1B1F29',
  accentColor: '#7AA2FF',
  accentEmissive: '#6B98FF',
  keyLightColor: '#F4F6FF',
  keyLightIntensity: 2.05,
  hemiSkyColor: '#A8BBE6',
  hemiGroundColor: '#2B2C38',
  hemiIntensity: 0.9,
  lampLightColor: '#8FB2FF',
  lampLightIntensity: 2.4,
  rimLightColor: '#8A7CFF',
  rimLightIntensity: 1.55,
  monitorGlowColor: '#89B8FF',
  monitorGlowIntensity: 1.65,
  fogColor: '#151924',
};

export interface HeroAnimationState {
  // Environment RGB hex strings animated smoothly by GSAP
  wallColor: string;
  panelColor: string;
  trimColor: string;
  furnitureColor: string;
  chairFabricColor: string;
  accentColor: string;
  accentEmissive: string;
  keyLightColor: string;
  keyLightIntensity: number;
  hemiSkyColor: string;
  hemiGroundColor: string;
  hemiIntensity: number;
  lampLightColor: string;
  lampLightIntensity: number;
  rimLightColor: string;
  rimLightIntensity: number;
  monitorGlowColor: string;
  monitorGlowIntensity: number;
  fogColor: string;

  // Upper-side drop-in progress for computer & studio gadgets (0 = above/hidden, 1 = fixed in place)
  monitorDrop: number;
  laptopDrop: number;
  peripheralsDrop: number;
  pegboardDrop: number;
  wallArtDrop: number;
  accentGadgetsDrop: number;

  // Subtle focus accent for 18-22s developer showcase
  developerFocusAmount: number;
}

export function createInitialAnimationState(): HeroAnimationState {
  const base = HERO_THEMES[0];
  return {
    wallColor: base.wallColor,
    panelColor: base.panelColor,
    trimColor: base.trimColor,
    furnitureColor: base.furnitureColor,
    chairFabricColor: base.chairFabricColor,
    accentColor: base.accentColor,
    accentEmissive: base.accentEmissive,
    keyLightColor: base.keyLightColor,
    keyLightIntensity: base.keyLightIntensity,
    hemiSkyColor: base.hemiSkyColor,
    hemiGroundColor: base.hemiGroundColor,
    hemiIntensity: base.hemiIntensity,
    lampLightColor: base.lampLightColor,
    lampLightIntensity: base.lampLightIntensity,
    rimLightColor: base.rimLightColor,
    rimLightIntensity: base.rimLightIntensity,
    monitorGlowColor: base.monitorGlowColor,
    monitorGlowIntensity: base.monitorGlowIntensity,
    fogColor: base.fogColor,
    monitorDrop: 0,
    laptopDrop: 0,
    peripheralsDrop: 0,
    pegboardDrop: 0,
    wallArtDrop: 0,
    accentGadgetsDrop: 0,
    developerFocusAmount: 0,
  };
}

export function getActivePhaseFromTime(seconds: number): {
  themeIndex: number;
  phaseLabel: string;
  isFocusHold: boolean;
} {
  const t = ((seconds % TIMELINE_DURATION) + TIMELINE_DURATION) % TIMELINE_DURATION;
  if (t < 6) {
    return { themeIndex: 0, phaseLabel: 'Graphite Black', isFocusHold: false };
  }
  if (t < 10) {
    return { themeIndex: 1, phaseLabel: 'Electric Blue', isFocusHold: false };
  }
  if (t < 14) {
    return { themeIndex: 2, phaseLabel: 'Forest Green', isFocusHold: false };
  }
  if (t < 18) {
    return { themeIndex: 3, phaseLabel: 'Dusty Lilac', isFocusHold: false };
  }
  if (t < 22) {
    return { themeIndex: 0, phaseLabel: 'Developer Focus', isFocusHold: true };
  }
  return { themeIndex: 0, phaseLabel: 'Graphite Black', isFocusHold: false };
}

function addThemeEnvironmentTween(
  tl: gsap.core.Timeline,
  state: HeroAnimationState,
  target: typeof DEVELOPER_FOCUS_STATE | HeroThemeConfig,
  atTime: number,
  duration: number
) {
  tl.to(
    state,
    {
      wallColor: target.wallColor,
      panelColor: target.panelColor,
      trimColor: target.trimColor,
      furnitureColor: target.furnitureColor,
      chairFabricColor: target.chairFabricColor,
      accentColor: target.accentColor,
      accentEmissive: target.accentEmissive,
      keyLightColor: target.keyLightColor,
      keyLightIntensity: target.keyLightIntensity,
      hemiSkyColor: target.hemiSkyColor,
      hemiGroundColor: target.hemiGroundColor,
      hemiIntensity: target.hemiIntensity,
      lampLightColor: target.lampLightColor,
      lampLightIntensity: target.lampLightIntensity,
      rimLightColor: target.rimLightColor,
      rimLightIntensity: target.rimLightIntensity,
      monitorGlowColor: target.monitorGlowColor,
      monitorGlowIntensity: target.monitorGlowIntensity,
      fogColor: target.fogColor,
      duration,
      ease: 'power2.inOut',
    },
    atTime
  );
}

/**
 * Choreographs the computer and studio gadgets descending cleanly from the upper side (+Y)
 * into their exact fixed desk & wall positions (no clipping below desk surface).
 */
function addUpperDropInSequence(
  tl: gsap.core.Timeline,
  state: HeroAnimationState,
  atTime: number
) {
  tl.to(state, { monitorDrop: 1, duration: 0.72, ease: 'power3.out' }, atTime);
  tl.to(state, { laptopDrop: 1, duration: 0.68, ease: 'power3.out' }, atTime + 0.16);
  tl.to(state, { peripheralsDrop: 1, duration: 0.62, ease: 'power3.out' }, atTime + 0.3);
  tl.to(state, { pegboardDrop: 1, duration: 0.68, ease: 'power3.out' }, atTime + 0.42);
  tl.to(state, { wallArtDrop: 1, duration: 0.65, ease: 'power3.out' }, atTime + 0.54);
  tl.to(state, { accentGadgetsDrop: 1, duration: 0.72, ease: 'power3.out' }, atTime + 0.68);
}

/**
 * Smoothly lifts computer & studio gadgets back toward the upper side right before
 * the next theme's fresh drop-in assembly wave.
 */
function addUpperLiftOutSequence(
  tl: gsap.core.Timeline,
  state: HeroAnimationState,
  atTime: number
) {
  tl.to(
    state,
    {
      accentGadgetsDrop: 0,
      wallArtDrop: 0,
      pegboardDrop: 0,
      peripheralsDrop: 0,
      laptopDrop: 0,
      monitorDrop: 0,
      duration: 0.48,
      ease: 'power2.in',
    },
    atTime
  );
}

/**
 * Builds the continuous 24-second seamless GSAP master timeline:
 *  0–6s  : Graphite Black workspace; computer & studio gadgets descend from upper side into place
 *  6–10s : Electric Blue environment transition + fresh upper-side gadget drop-in
 * 10–14s : Forest Green & Oat Cream transition + fresh upper-side gadget drop-in
 * 14–18s : Dusty Lilac & Ink Navy transition + fresh upper-side gadget drop-in
 * 18–22s : Final developer-themed focus hold (all gear fixed in place around seated avatar)
 * 22–24s : Smooth return to Graphite Black + clean lift-up reset for seamless loop restart
 */
export function createHeroTimeline(
  state: HeroAnimationState,
  onProgressUpdate?: (time: number) => void
): gsap.core.Timeline {
  const tl = gsap.timeline({
    repeat: -1,
    defaults: { overwrite: 'auto' },
    onUpdate: () => {
      if (onProgressUpdate) {
        onProgressUpdate(tl.time());
      }
    },
  });

  // Start cleanly with seated avatar & desk grounded, gadgets ready above
  tl.set(
    state,
    {
      developerFocusAmount: 0,
      monitorDrop: 0,
      laptopDrop: 0,
      peripheralsDrop: 0,
      pegboardDrop: 0,
      wallArtDrop: 0,
      accentGadgetsDrop: 0,
    },
    0
  );

  // 0.35–2.2s: Initial computer & studio gadgets descend smoothly from upper side into Graphite Black workspace
  addUpperDropInSequence(tl, state, 0.35);

  // 6–10s: Lift & morph environment to Electric Blue, then drop computer & Electric Blue gadgets from upper side
  addUpperLiftOutSequence(tl, state, 5.45);
  addThemeEnvironmentTween(tl, state, HERO_THEMES[1], 5.85, 1.45);
  addUpperDropInSequence(tl, state, 6.2);

  // 10–14s: Lift & morph environment to Forest Green, then drop computer & Tangerine/Oat gadgets from upper side
  addUpperLiftOutSequence(tl, state, 9.45);
  addThemeEnvironmentTween(tl, state, HERO_THEMES[2], 9.85, 1.45);
  addUpperDropInSequence(tl, state, 10.2);

  // 14–18s: Lift & morph environment to Dusty Lilac, then drop computer & Lavender/Navy gadgets from upper side
  addUpperLiftOutSequence(tl, state, 13.45);
  addThemeEnvironmentTween(tl, state, HERO_THEMES[3], 13.85, 1.45);
  addUpperDropInSequence(tl, state, 14.2);

  // 18–22s: Final developer showcase hold — all computer hardware & gadgets remain locked in place
  addThemeEnvironmentTween(tl, state, DEVELOPER_FOCUS_STATE, 18.0, 1.5);
  tl.to(state, { developerFocusAmount: 1, duration: 1.4, ease: 'power2.inOut' }, 18.2);

  // 22–24s: Smoothly return environment to Graphite Black and lift gadgets for seamless restart at t=0
  tl.to(state, { developerFocusAmount: 0, duration: 1.5, ease: 'power2.inOut' }, 22.0);
  addThemeEnvironmentTween(tl, state, HERO_THEMES[0], 22.0, 1.9);
  addUpperLiftOutSequence(tl, state, 23.35);

  // Anchor exact 24.0s cycle length
  tl.to({}, { duration: 0.01 }, TIMELINE_DURATION - 0.01);

  return tl;
}
