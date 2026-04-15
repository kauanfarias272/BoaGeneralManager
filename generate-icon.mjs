// Generates Android launcher PNGs from an inline SVG snake icon
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size / 100; // scale factor

  // Background rounded rect (simulate with full fill, Android clips to shape)
  ctx.fillStyle = '#d0d0a0';
  ctx.beginPath();
  const r = size * 0.22;
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

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

  // Tail connection
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

  // Eye white
  ctx.fillStyle = '#d0d0a0';
  ctx.beginPath();
  ctx.arc(67 * s, 26 * s, 3 * s, 0, Math.PI * 2);
  ctx.fill();

  // Pupil
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.arc(68 * s, 25 * s, 1.4 * s, 0, Math.PI * 2);
  ctx.fill();

  // Tongue
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(72 * s, 33 * s);
  ctx.lineTo(80 * s, 38 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(72 * s, 33 * s);
  ctx.lineTo(80 * s, 30 * s);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

const sizes = [
  { dir: 'mipmap-mdpi',    size: 48  },
  { dir: 'mipmap-hdpi',    size: 72  },
  { dir: 'mipmap-xhdpi',   size: 96  },
  { dir: 'mipmap-xxhdpi',  size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

const base = join(__dirname, 'android/app/src/main/res');

for (const { dir, size } of sizes) {
  const buf = drawIcon(size);
  const dirPath = join(base, dir);
  mkdirSync(dirPath, { recursive: true });
  writeFileSync(join(dirPath, 'ic_launcher.png'), buf);
  writeFileSync(join(dirPath, 'ic_launcher_round.png'), buf);
  console.log(`✓ ${dir} (${size}x${size})`);
}

// Also write a 1024x1024 source asset
mkdirSync(join(__dirname, 'assets'), { recursive: true });
writeFileSync(join(__dirname, 'assets/icon.png'), drawIcon(1024));
console.log('✓ assets/icon.png (1024x1024)');
console.log('All icons generated.');
