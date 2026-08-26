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
            font-size="72" font-weight="700" fill="#f2f5f8">Track Your Way</text>
      <text x="482" y="352" font-family="Segoe UI, Helvetica, Arial, sans-serif"
            font-size="30" fill="#9fb0c0">Habitos y estado de animo, a tu manera</text>
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

/**
 * Pantallas de arranque de iOS. Ver docs/diseno/splash.md.
 *
 * La lista de dispositivos es un unico array del que salen **tanto las
 * imagenes como las etiquetas**: no pueden divergir, y añadir un dispositivo
 * es una linea. Es la mitigacion de haber dejado pwa-asset-generator, que
 * conocia la lista pero arrastraba Chromium entero.
 */
const SPLASH = [
  { w: 1290, h: 2796, ratio: 3, device: 430, deviceH: 932 },
  { w: 1179, h: 2556, ratio: 3, device: 393, deviceH: 852 },
  { w: 1170, h: 2532, ratio: 3, device: 390, deviceH: 844 },
  { w: 1125, h: 2436, ratio: 3, device: 375, deviceH: 812 },
  { w: 828, h: 1792, ratio: 2, device: 414, deviceH: 896 },
  { w: 750, h: 1334, ratio: 2, device: 375, deviceH: 667 },
  { w: 1536, h: 2048, ratio: 2, device: 768, deviceH: 1024 },
];

async function splash({ w, h }, source) {
  const size = Math.round(Math.min(w, h) * 0.28);
  const symbolPng = await sharp(source, { density: 512 }).resize(size, size).png().toBuffer();
  return sharp({ create: { width: w, height: h, channels: 4, background: BRAND_INK } })
    .composite([{ input: symbolPng, gravity: 'centre' }])
    .png()
    .toBuffer();
}

/** Las etiquetas salen del mismo array que las imagenes. */
function splashTags() {
  return SPLASH.map(
    ({ w, h, ratio, device, deviceH }) =>
      `    <link rel="apple-touch-startup-image" href="/splash-${w}x${h}.png" ` +
      `media="(device-width: ${device}px) and (device-height: ${deviceH}px) ` +
      `and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)" />`,
  ).join(`
`);
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

for (const device of SPLASH) {
  await writeFile(`${OUT}/splash-${device.w}x${device.h}.png`, await splash(device, source));
}

// Las etiquetas se escriben en index.html entre marcas, para que regenerar no
// obligue a tocar el HTML a mano y no puedan quedarse desincronizadas.
const html = await readFile('index.html', 'utf8');
const start = '<!-- splash:start -->';
const end = '<!-- splash:end -->';
if (html.includes(start) && html.includes(end)) {
  const before = html.slice(0, html.indexOf(start) + start.length);
  const after = html.slice(html.indexOf(end));
  await writeFile(
    'index.html',
    [before, splashTags(), after].join(`
`),
    'utf8',
  );
}

await writeFile(`${OUT}/favicon.svg`, source);
await writeFile(`${OUT}/favicon.ico`, await pngToIco([`${OUT}/favicon-32.png`]));

console.log(`${outputs.length + 2 + SPLASH.length} ficheros generados en ${OUT}/`);
