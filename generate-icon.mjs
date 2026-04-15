// Generates Android launcher icons + adaptive icon foreground for all densities
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const base = join(__dirname, 'android/app/src/main/res');

function drawSnakeOnly(canvas, size, bgColor = null) {
  const ctx = canvas.getContext('2d');
  const s = size / 100;

  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    const r = size * 0.22;
    ctx.moveTo(r, 0); ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = '#0a0a0a';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Body coil
  ctx.lineWidth = 9 * s;
  ctx.beginPath();
  ctx.moveTo(50 * s, 85 * s);
  ctx.bezierCurveTo(25 * s, 85 * s, 15 * s, 70 * s, 15 * s, 58 * s);
  ctx.bezierCurveTo(15 * s, 46 * s, 25 * s, 38 * s, 38 * s, 38 * s);
  ctx.bezierCurveTo(51 * s, 38 * s, 60 * s, 46 * s, 60 * s, 56 * s);
  ctx.bezierCurveTo(60 * s, 64 * s, 54 * s, 70 * s, 46 * s, 70 * s);
  ctx.bezierCurveTo(38 * s, 70 * s, 33 * s, 65 * s, 33 * s, 58 * s);
  ctx.bezierCurveTo(33 * s, 52 * s, 37 * s, 48 * s, 42 * s, 48 * s);
  ctx.stroke();

  // Tail tip
  ctx.lineWidth = 7 * s;
  ctx.beginPath();
  ctx.moveTo(42 * s, 48 * s);
  ctx.bezierCurveTo(46 * s, 44 * s, 52 * s, 43 * s, 55 * s, 46 * s);
  ctx.stroke();

  // Head
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.ellipse(62 * s, 30 * s, 14 * s, 11 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#d0d0a0';
  ctx.beginPath();
  ctx.arc(67 * s, 26 * s, 3 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.arc(68 * s, 25 * s, 1.4 * s, 0, Math.PI * 2);
  ctx.fill();

  // Tongue
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(72 * s, 33 * s); ctx.lineTo(80 * s, 38 * s); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(72 * s, 33 * s); ctx.lineTo(80 * s, 30 * s); ctx.stroke();
}

const densities = [
  { dir: 'mipmap-mdpi',    icon: 48,  fg: 54  },
  { dir: 'mipmap-hdpi',    icon: 72,  fg: 81  },
  { dir: 'mipmap-xhdpi',   icon: 96,  fg: 108 },
  { dir: 'mipmap-xxhdpi',  icon: 144, fg: 162 },
  { dir: 'mipmap-xxxhdpi', icon: 192, fg: 216 },
];

for (const { dir, icon, fg } of densities) {
  mkdirSync(join(base, dir), { recursive: true });

  // Full icon (with #d0d0a0 rounded background) → used as fallback on old Android
  const c1 = createCanvas(icon, icon);
  drawSnakeOnly(c1, icon, '#d0d0a0');
  writeFileSync(join(base, dir, 'ic_launcher.png'), c1.toBuffer('image/png'));
  writeFileSync(join(base, dir, 'ic_launcher_round.png'), c1.toBuffer('image/png'));

  // Foreground (transparent bg, snake centered in safe zone)
  // Adaptive icon: content should be in the center 66/108 of the image
  const c2 = createCanvas(fg, fg);
  const ctx2 = c2.getContext('2d');
  // Scale snake to 70% of foreground size, centered
  const scale = (fg * 0.70) / fg;
  const offset = fg * 0.15;
  const s = (fg * scale) / 100;
  ctx2.strokeStyle = '#0a0a0a';
  ctx2.lineCap = 'round';
  ctx2.lineJoin = 'round';

  const o = offset;
  const ss = (fg * 0.70) / 100;

  ctx2.lineWidth = 9 * ss;
  ctx2.beginPath();
  ctx2.moveTo(50*ss+o, 85*ss+o);
  ctx2.bezierCurveTo(25*ss+o,85*ss+o, 15*ss+o,70*ss+o, 15*ss+o,58*ss+o);
  ctx2.bezierCurveTo(15*ss+o,46*ss+o, 25*ss+o,38*ss+o, 38*ss+o,38*ss+o);
  ctx2.bezierCurveTo(51*ss+o,38*ss+o, 60*ss+o,46*ss+o, 60*ss+o,56*ss+o);
  ctx2.bezierCurveTo(60*ss+o,64*ss+o, 54*ss+o,70*ss+o, 46*ss+o,70*ss+o);
  ctx2.bezierCurveTo(38*ss+o,70*ss+o, 33*ss+o,65*ss+o, 33*ss+o,58*ss+o);
  ctx2.bezierCurveTo(33*ss+o,52*ss+o, 37*ss+o,48*ss+o, 42*ss+o,48*ss+o);
  ctx2.stroke();

  ctx2.lineWidth = 7 * ss;
  ctx2.beginPath();
  ctx2.moveTo(42*ss+o, 48*ss+o);
  ctx2.bezierCurveTo(46*ss+o,44*ss+o, 52*ss+o,43*ss+o, 55*ss+o,46*ss+o);
  ctx2.stroke();

  ctx2.fillStyle = '#0a0a0a';
  ctx2.beginPath();
  ctx2.ellipse(62*ss+o, 30*ss+o, 14*ss, 11*ss, 0, 0, Math.PI*2);
  ctx2.fill();

  ctx2.fillStyle = '#d0d0a0';
  ctx2.beginPath();
  ctx2.arc(67*ss+o, 26*ss+o, 3*ss, 0, Math.PI*2);
  ctx2.fill();

  ctx2.fillStyle = '#0a0a0a';
  ctx2.beginPath();
  ctx2.arc(68*ss+o, 25*ss+o, 1.4*ss, 0, Math.PI*2);
  ctx2.fill();

  ctx2.strokeStyle = '#1a1a1a';
  ctx2.lineWidth = 2 * ss;
  ctx2.beginPath();
  ctx2.moveTo(72*ss+o, 33*ss+o); ctx2.lineTo(80*ss+o, 38*ss+o); ctx2.stroke();
  ctx2.beginPath();
  ctx2.moveTo(72*ss+o, 33*ss+o); ctx2.lineTo(80*ss+o, 30*ss+o); ctx2.stroke();

  writeFileSync(join(base, dir, 'ic_launcher_foreground.png'), c2.toBuffer('image/png'));
  console.log(`✓ ${dir}: icon ${icon}px  foreground ${fg}px`);
}

// Source asset
mkdirSync(join(__dirname, 'assets'), { recursive: true });
const src = createCanvas(1024, 1024);
drawSnakeOnly(src, 1024, '#d0d0a0');
writeFileSync(join(__dirname, 'assets/icon.png'), src.toBuffer('image/png'));
console.log('✓ assets/icon.png 1024px');
console.log('Done.');
