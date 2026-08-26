#!/usr/bin/env node
/**
 * Genera todos los assets de marca desde brand/logo.svg.
 *
 *   npm run icons
 *
 * Los ficheros resultantes se versionan: forman parte del build y no deben
 * depender de que este script funcione en la maquina de turno. Cuando el logo
 * cambie, se vuelve a ejecutar y ya esta. Ver docs/diseno/splash.md.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const BRAND_INK = '#162330';
const BRAND_ACCENT = '#0d7dd4';
const OUT = 'public';

/** El simbolo suelto, en el tamano pedido. */
async function symbol(size, source) {
  return sharp(source, { density: 512 }).resize(size, size).png().toBuffer();
}

/**
 * Icono maskable: el sistema recorta hasta un 20% por lado, asi que el simbolo
 * vive en el 60% central y el fondo llega hasta el borde.
 */
async function maskable(size, source) {
  const inner = Math.round(size * 0.6);
  const symbolPng = await sharp(source, { density: 512 }).resize(inner, inner).png().toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_INK,
    },
  })
    .composite([{ input: symbolPng, gravity: 'centre' }])
    .png()
    .toBuffer();
}

/** Imagen de preview al compartir el enlace. 1200x630 es lo que esperan las redes. */
async function ogImage(source) {
  const symbolPng = await sharp(source, { density: 512 }).resize(220, 220).png().toBuffer();
  const text = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
      <text x="480" y="292" font-family="Segoe UI, Helvetica, Arial, sans-serif"
            font-size="72" font-weight="700" fill="#f2f5f8">Habit Tracker</text>
      <text x="482" y="352" font-family="Segoe UI, Helvetica, Arial, sans-serif"
            font-size="30" fill="#9fb0c0">Habitos y estado de animo, local-first</text>
      <rect x="482" y="392" width="150" height="4" rx="2" fill="${BRAND_ACCENT}" />
    </svg>`);

  return sharp({
    create: { width: 1200, height: 630, channels: 4, background: BRAND_INK },
  })
    .composite([
      { input: symbolPng, top: 205, left: 190 },
      { input: text, top: 0, left: 0 },
    ])
    .png()
    .toBuffer();
}

const source = await readFile('brand/logo.svg');
await mkdir(OUT, { recursive: true });

const outputs = [
  ['favicon-32.png', await symbol(32, source)],
  ['apple-touch-icon.png', await maskable(180, source)],
  ['icon-192.png', await symbol(192, source)],
  ['icon-512.png', await symbol(512, source)],
  ['icon-maskable-512.png', await maskable(512, source)],
  ['og-image.png', await ogImage(source)],
];

for (const [name, buffer] of outputs) {
  await writeFile(`${OUT}/${name}`, buffer);
}

await writeFile(`${OUT}/favicon.svg`, source);
await writeFile(`${OUT}/favicon.ico`, await pngToIco([`${OUT}/favicon-32.png`]));

console.log(`${outputs.length + 2} ficheros generados en ${OUT}/`);
