import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = join(__dirname, '..', 'public');

// Read base logo, recolor every fill to white for the dark email header.
const svg = readFileSync(join(pub, 'logo.svg'), 'utf8');
const whiteSvg = svg
  .replace(/fill="#1C1F3B"/g, 'fill="#FFFFFF"')
  .replace(/fill="#2E4C9B"/g, 'fill="#FFFFFF"')
  // the one path with no explicit fill (defaults to black) -> white
  .replace(/<path d="M176.344/g, '<path fill="#FFFFFF" d="M176.344');

writeFileSync(join(pub, 'logo-email.svg'), whiteSvg);

// Render at 3x for crisp retina display (base 184x69 -> 552x207).
await sharp(Buffer.from(whiteSvg), { density: 300 })
  .resize(552, 207, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(join(pub, 'logo-email.png'));

console.log('Wrote public/logo-email.png and public/logo-email.svg');
