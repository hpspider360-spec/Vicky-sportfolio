import * as THREE from 'three';
import type { SwatchSpec } from './heroAnimations';

function configureTexture(
  canvas: HTMLCanvasElement,
  options: {
    srgb?: boolean;
    repeatX?: number;
    repeatY?: number;
    anisotropy?: number;
  } = {}
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = options.srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  if (options.repeatX || options.repeatY) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(options.repeatX ?? 1, options.repeatY ?? 1);
  }
  tex.anisotropy = options.anisotropy ?? 8;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates realistic warm European oak wood plank floor color & bump maps
 * matching the reference video's sunlit timber flooring.
 */
export function createOakFloorTextures(anisotropy = 8): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const width = 1024;
  const height = 1024;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bCtx = bumpCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const rCtx = roughCanvas.getContext('2d')!;

  // Base warm oak tone
  ctx.fillStyle = '#9D8368';
  ctx.fillRect(0, 0, width, height);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, width, height);
  rCtx.fillStyle = '#9E9E9E';
  rCtx.fillRect(0, 0, width, height);

  const plankCols = 8;
  const plankWidth = width / plankCols;
  const plankRows = 3;
  const plankLen = height / plankRows;

  // Deterministic pseudo-random helper for consistent grain
  let seed = 4219;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let col = 0; col < plankCols; col++) {
    const x = col * plankWidth;
    const offset = (col % 3) * (plankLen * 0.37);

    for (let row = -1; row <= plankRows; row++) {
      const y = row * plankLen + offset;
      const h = plankLen;

      // Per-plank oak tonal variance
      const shade = (rand() - 0.5) * 18;
      const r = Math.round(166 + shade);
      const g = Math.round(138 + shade * 0.85);
      const b = Math.round(108 + shade * 0.7);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x + 1, y + 1, plankWidth - 2, h - 2);

      // Roughness per plank (satin matte oak)
      const rv = Math.round(148 + (rand() - 0.5) * 34);
      rCtx.fillStyle = `rgb(${rv},${rv},${rv})`;
      rCtx.fillRect(x + 1, y + 1, plankWidth - 2, h - 2);

      // Subtle wood grain fibers running along plank length
      for (let f = 0; f < 34; f++) {
        const fx = x + 3 + rand() * (plankWidth - 6);
        const alpha = 0.04 + rand() * 0.08;
        const dark = rand() > 0.35;
        ctx.strokeStyle = dark
          ? `rgba(74, 52, 34, ${alpha})`
          : `rgba(218, 194, 165, ${alpha * 0.8})`;
        ctx.lineWidth = 0.8 + rand() * 1.8;
        ctx.beginPath();
        ctx.moveTo(fx, y + 2);
        const sway = (rand() - 0.5) * 8;
        ctx.bezierCurveTo(
          fx + sway,
          y + h * 0.33,
          fx - sway * 0.7,
          y + h * 0.66,
          fx + sway * 0.3,
          y + h - 2
        );
        ctx.stroke();

        bCtx.strokeStyle = `rgba(110, 110, 110, ${alpha * 1.6})`;
        bCtx.lineWidth = 1;
        bCtx.beginPath();
        bCtx.moveTo(fx, y + 2);
        bCtx.lineTo(fx + sway * 0.3, y + h - 2);
        bCtx.stroke();
      }

      // Plank seams (subtle dark bevel grooves)
      ctx.fillStyle = 'rgba(52, 38, 26, 0.45)';
      ctx.fillRect(x, y, 2, h);
      ctx.fillRect(x, y, plankWidth, 2);

      bCtx.fillStyle = '#242424';
      bCtx.fillRect(x, y, 2.5, h);
      bCtx.fillRect(x, y, plankWidth, 2.5);

      rCtx.fillStyle = '#DCDCDC';
      rCtx.fillRect(x, y, 2.5, h);
      rCtx.fillRect(x, y, plankWidth, 2.5);
    }
  }

  return {
    map: configureTexture(colorCanvas, { srgb: true, repeatX: 3.4, repeatY: 3.4, anisotropy }),
    bumpMap: configureTexture(bumpCanvas, { srgb: false, repeatX: 3.4, repeatY: 3.4, anisotropy }),
    roughnessMap: configureTexture(roughCanvas, {
      srgb: false,
      repeatX: 3.4,
      repeatY: 3.4,
      anisotropy,
    }),
  };
}

/**
 * Generates a subtle matte architectural plaster bump/roughness micro-texture
 * so studio walls catch directional window light authentically.
 */
export function createWallPlasterTexture(anisotropy = 4): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  let seed = 9187;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 6000; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const v = Math.round(115 + rand() * 26);
    ctx.fillStyle = `rgba(${v},${v},${v},0.35)`;
    ctx.fillRect(x, y, 2 + rand() * 3, 2 + rand() * 3);
  }

  return configureTexture(canvas, { srgb: false, repeatX: 4, repeatY: 3, anisotropy });
}

/**
 * Generates a subtle brushed dark/neutral wood desk top roughness & grain map.
 */
export function createDeskGrainTexture(anisotropy = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#888888';
  ctx.fillRect(0, 0, 512, 512);

  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 240; i++) {
    const y = rand() * 512;
    const v = Math.round(112 + rand() * 44);
    ctx.strokeStyle = `rgba(${v},${v},${v},0.28)`;
    ctx.lineWidth = 1 + rand() * 2.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y + (rand() - 0.5) * 6, 340, y + (rand() - 0.5) * 6, 512, y);
    ctx.stroke();
  }

  return configureTexture(canvas, { srgb: false, repeatX: 2, repeatY: 1, anisotropy });
}

/**
 * Generates a perforated wall pegboard bump/color pattern (matching the reference video).
 */
export function createPegboardTexture(anisotropy = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 512, 384);

  const cols = 18;
  const rows = 13;
  const padX = 28;
  const padY = 26;
  const stepX = (512 - padX * 2) / (cols - 1);
  const stepY = (384 - padY * 2) / (rows - 1);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = padX + c * stepX;
      const cy = padY + r * stepY;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.beginPath();
      ctx.arc(cx, cy, 4.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return configureTexture(canvas, { srgb: true, anisotropy });
}

/**
 * Generates a realistic developer IDE screen texture for the primary 32" monitor.
 */
export function createMonitorScreenTexture(anisotropy = 8): THREE.CanvasTexture {
  const w = 1024;
  const h = 576;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Deep IDE editor canvas
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#0D111A');
  bgGrad.addColorStop(1, '#121826');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Top titlebar
  ctx.fillStyle = '#0A0D14';
  ctx.fillRect(0, 0, w, 34);
  const dots = ['#FF5F56', '#FFBD2E', '#27C93F'];
  dots.forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(22 + i * 18, 17, 5.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Active tab
  ctx.fillStyle = '#161E2E';
  ctx.fillRect(100, 5, 195, 29);
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '500 13px monospace';
  ctx.fillText('HeroScene.tsx', 120, 23);

  ctx.fillStyle = '#64748B';
  ctx.fillText('workspace.ts', 318, 23);
  ctx.fillText('shaders.glsl', 442, 23);

  // Left explorer sidebar
  ctx.fillStyle = '#0B0F17';
  ctx.fillRect(0, 34, 170, h - 34);
  ctx.fillStyle = '#334155';
  ctx.fillRect(170, 34, 1, h - 34);

  const files = [
    'src/',
    '  hero/',
    '    Hero.tsx',
    '    HeroScene.tsx',
    '    Workspace.tsx',
    '    DeveloperAvatar.tsx',
    '    FloatingPalette.tsx',
    '    heroAnimations.ts',
    '  styles/',
    '    index.css',
  ];
  files.forEach((f, i) => {
    ctx.fillStyle = i === 3 ? '#1E293B' : 'transparent';
    if (i === 3) ctx.fillRect(8, 52 + i * 24 - 15, 152, 22);
    ctx.fillStyle = i === 3 ? '#93C5FD' : i < 2 || i === 8 ? '#94A3B8' : '#64748B';
    ctx.font = '12px monospace';
    ctx.fillText(f, 16, 52 + i * 24);
  });

  // Syntax highlighted code lines
  const codeLines: Array<Array<[string, string]>> = [
    [
      ['import ', '#C084FC'],
      ['{ useFrame } ', '#E2E8F0'],
      ['from ', '#C084FC'],
      ["'@react-three/fiber'", '#86EFAC'],
      [';', '#94A3B8'],
    ],
    [
      ['import ', '#C084FC'],
      ['gsap ', '#93C5FD'],
      ['from ', '#C084FC'],
      ["'gsap'", '#86EFAC'],
      [';', '#94A3B8'],
    ],
    [['', '#fff']],
    [
      ['export function ', '#C084FC'],
      ['CinematicStudio', '#60A5FA'],
      ['() {', '#E2E8F0'],
    ],
    [
      ['  const ', '#C084FC'],
      ['cameraLocked ', '#E2E8F0'],
      ['= ', '#94A3B8'],
      ['true', '#FDBA74'],
      [';', '#94A3B8'],
    ],
    [
      ['  const ', '#C084FC'],
      ['themes ', '#E2E8F0'],
      ['= [', '#94A3B8'],
      ["'Graphite'", '#86EFAC'],
      [', ', '#94A3B8'],
      ["'ElectricBlue'", '#86EFAC'],
      [', ', '#94A3B8'],
      ["'Forest'", '#86EFAC'],
      [', ', '#94A3B8'],
      ["'Lilac'", '#86EFAC'],
      ['];', '#94A3B8'],
    ],
    [['', '#fff']],
    [
      ['  useFrame', '#60A5FA'],
      ['((state, delta) => {', '#E2E8F0'],
    ],
    [
      ['    updateEnvironmentLights', '#93C5FD'],
      ['(timelineState.current);', '#CBD5E1'],
    ],
    [
      ['    animateSeatedAvatar', '#93C5FD'],
      ['(state.clock.elapsedTime);', '#CBD5E1'],
    ],
    [
      ['    syncFloatingPalettes', '#93C5FD'],
      ['(delta);', '#CBD5E1'],
    ],
    [['  });', '#E2E8F0']],
    [['', '#fff']],
    [
      ['  return ', '#C084FC'],
      ['<StudioWorkspace ', '#60A5FA'],
      ['avatar=', '#93C5FD'],
      ['"Vignesh" ', '#86EFAC'],
      ['loop=', '#93C5FD'],
      ['{24} ', '#FDBA74'],
      ['/>;', '#60A5FA'],
    ],
    [['}', '#E2E8F0']],
  ];

  codeLines.forEach((tokens, lineIdx) => {
    const y = 68 + lineIdx * 23;
    ctx.fillStyle = '#3B485E';
    ctx.font = '12px monospace';
    ctx.fillText(String(lineIdx + 1).padStart(2, ' '), 188, y);

    let x = 224;
    ctx.font = '500 13.5px monospace';
    for (const [text, color] of tokens) {
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      x += ctx.measureText(text).width;
    }
  });

  // Right-side mini 3D waveform / preview card inside IDE
  ctx.fillStyle = '#151D2E';
  ctx.fillRect(720, 52, 282, 340);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.strokeRect(720, 52, 282, 340);

  // Abstract architecture preview graphics inside panel
  const accentGrad = ctx.createLinearGradient(740, 80, 980, 260);
  accentGrad.addColorStop(0, '#3B82F6');
  accentGrad.addColorStop(0.5, '#6366F1');
  accentGrad.addColorStop(1, '#22D3EE');
  ctx.fillStyle = accentGrad;
  ctx.fillRect(740, 74, 242, 130);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.fillRect(756, 94, 110, 88);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(768, 110, 68, 8);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillRect(768, 128, 84, 6);
  ctx.fillRect(768, 142, 54, 6);

  // Palette preview bars inside IDE right panel
  const swatches = ['#232427', '#285BFF', '#1F3A2E', '#9C88B5'];
  swatches.forEach((s, idx) => {
    ctx.fillStyle = s;
    ctx.fillRect(740 + idx * 62, 224, 52, 36);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.strokeRect(740 + idx * 62, 224, 52, 36);
  });

  // Mini bars
  for (let b = 0; b < 5; b++) {
    ctx.fillStyle = b === 0 ? '#60A5FA' : '#26344D';
    ctx.fillRect(740, 280 + b * 18, 220 - b * 24, 9);
  }

  // Bottom terminal panel
  ctx.fillStyle = '#090D14';
  ctx.fillRect(171, 420, w - 171, h - 420);
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(171, 420, w - 171, 1);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 11px monospace';
  ctx.fillText('TERMINAL   OUTPUT   BUILD', 194, 444);

  ctx.fillStyle = '#4ADE80';
  ctx.font = '12.5px monospace';
  ctx.fillText('✓ vite build ready in 148ms', 194, 474);
  ctx.fillStyle = '#93C5FD';
  ctx.fillText('▸ 3D Studio Scene · PBR RoomEnvironment Active', 194, 498);
  ctx.fillStyle = '#CBD5E1';
  ctx.fillText('▸ Timeline Cycle: 24.0s · 4 Themes · Camera Locked', 194, 522);

  return configureTexture(canvas, { srgb: true, anisotropy });
}

/**
 * Generates a secondary creative-tech dashboard screen texture for the side laptop.
 */
export function createLaptopScreenTexture(anisotropy = 8): THREE.CanvasTexture {
  const w = 640;
  const h = 400;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111622';
  ctx.fillRect(0, 0, w, h);

  // Header
  ctx.fillStyle = '#1A2234';
  ctx.fillRect(0, 0, w, 40);
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '600 15px sans-serif';
  ctx.fillText('Design System · 60-30-10', 22, 25);

  // Preview cards
  const blocks = [
    { x: 24, y: 64, w: 184, h: 132, color: '#252830', label: '60% Base' },
    { x: 228, y: 64, w: 184, h: 132, color: '#1F3A2E', label: '30% Surface' },
    { x: 432, y: 64, w: 184, h: 132, color: '#285BFF', label: '10% Accent' },
  ];
  blocks.forEach((b) => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '600 13px monospace';
    ctx.fillText(b.label, b.x + 14, b.y + b.h - 16);
  });

  // Waveform / timeline graph
  ctx.fillStyle = '#171F30';
  ctx.fillRect(24, 218, 592, 152);
  ctx.strokeStyle = '#60A5FA';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 44; x <= 596; x += 12) {
    const t = (x - 44) / 552;
    const y = 296 + Math.sin(t * Math.PI * 5) * 32 + Math.cos(t * Math.PI * 2.5) * 14;
    if (x === 44) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  return configureTexture(canvas, { srgb: true, anisotropy });
}

/**
 * Generates the architectural framed geometric art print texture (inspired by reference video).
 * The base print uses crisp cream matte paper + neutral charcoal lines, while a separate
 * 3D accent geometric overlay mesh on the frame takes the live animated 10% theme accent!
 */
export function createWallArtPaperTexture(anisotropy = 8): THREE.CanvasTexture {
  const w = 512;
  const h = 640;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Matte archival paper
  ctx.fillStyle = '#F3EFE6';
  ctx.fillRect(0, 0, w, h);

  // Subtle Bauhaus grid lines
  ctx.strokeStyle = 'rgba(30, 34, 42, 0.14)';
  ctx.lineWidth = 2;
  ctx.strokeRect(52, 52, w - 104, h - 104);

  // Minimal architectural charcoal line
  ctx.fillStyle = '#242730';
  ctx.fillRect(88, 495, 165, 10);
  ctx.fillStyle = 'rgba(36, 39, 48, 0.35)';
  ctx.fillRect(88, 518, 110, 6);

  return configureTexture(canvas, { srgb: true, anisotropy });
}

/**
 * Generates a razor-sharp 60-30-10 color palette card CanvasTexture matching
 * the iconic floating swatch cards from the reference video.
 */
export function createPaletteCardTexture(
  swatch: SwatchSpec,
  anisotropy = 8
): THREE.CanvasTexture {
  const w = 512;
  const h = 640;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const drawRoundedRect = (
    x: number,
    y: number,
    rw: number,
    rh: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + rw - radius, y);
    ctx.quadraticCurveTo(x + rw, y, x + rw, y + radius);
    ctx.lineTo(x + rw, y + rh - radius);
    ctx.quadraticCurveTo(x + rw, y + rh, x + rw - radius, y + rh);
    ctx.lineTo(x + radius, y + rh);
    ctx.quadraticCurveTo(x, y + rh, x, y + rh - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Clean crisp white studio card body
  ctx.fillStyle = '#FAFBFD';
  ctx.fillRect(0, 0, w, h);

  // Subtle card surface depth gradient
  const cardGrad = ctx.createLinearGradient(0, 0, w, h);
  cardGrad.addColorStop(0, '#FFFFFF');
  cardGrad.addColorStop(1, '#F1F3F7');
  ctx.fillStyle = cardGrad;
  ctx.fillRect(0, 0, w, h);

  // Swatch color block (large top square)
  const pad = 34;
  const swatchW = w - pad * 2;
  const swatchH = 408;

  drawRoundedRect(pad, pad, swatchW, swatchH, 24);
  ctx.fillStyle = swatch.hex;
  ctx.fill();

  // Subtle inner hairline stroke for light swatches (e.g. Studio White / Oat Cream)
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Subtle top glossy sheen across swatch
  const sheen = ctx.createLinearGradient(pad, pad, pad + swatchW * 0.7, pad + swatchH * 0.6);
  sheen.addColorStop(0, 'rgba(255,255,255,0.16)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  drawRoundedRect(pad, pad, swatchW, swatchH, 24);
  ctx.fillStyle = sheen;
  ctx.fill();

  // Swatch name
  ctx.fillStyle = '#11141B';
  ctx.font = '700 42px "Outfit", system-ui, sans-serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(swatch.label, pad + 4, 514);

  // Hex code (bottom-left, monospace)
  ctx.fillStyle = '#6B7280';
  ctx.font = '500 28px "JetBrains Mono", monospace';
  ctx.fillText(swatch.hex.toUpperCase(), pad + 4, 578);

  // Percentage ratio (bottom-right, bold architectural numeral)
  ctx.fillStyle = '#11141B';
  ctx.font = '800 48px "Outfit", system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(swatch.ratio, w - pad - 4, 582);
  ctx.textAlign = 'left';

  return configureTexture(canvas, { srgb: true, anisotropy });
}

/**
 * Generates a soft radial contact shadow texture to ground desk, chair & plant flush on the oak floor.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.08,
    size / 2,
    size / 2,
    size * 0.5
  );
  grad.addColorStop(0, 'rgba(8, 10, 14, 0.72)');
  grad.addColorStop(0.55, 'rgba(8, 10, 14, 0.32)');
  grad.addColorStop(1, 'rgba(8, 10, 14, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return configureTexture(canvas, { srgb: true, anisotropy: 1 });
}
