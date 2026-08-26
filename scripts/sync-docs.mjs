#!/usr/bin/env node
/**
 * Baja al repo las tarjetas aprobadas del tablero de Histos.
 *
 *   node scripts/sync-docs.mjs --vault "../Habit tracker"
 *
 * Copia content/<id>.md quitando el frontmatter, a la carpeta que le toca segun
 * el mapa de abajo. El tablero es el canon: este script solo refleja, nunca
 * escribe hacia el vault.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const SECTIONS = {
  adr: ['charts', 'adr-repo', 'adr-sync'],
  producto: ['vision', 'modelo', 'flujos'],
  tecnica: ['repo', 'stack', 'tooling', 'ci', 'pwa', 'dexie', 'dal'],
  diseno: ['tokens', 'ui-kit', 'logo', 'iconos', 'splash', 'panel-tema'],
};

function stripFrontmatter(text) {
  if (!text.startsWith('---\n')) return text.trimStart();
  const end = text.indexOf('\n---\n', 4);
  if (end === -1) return text.trimStart();
  return text.slice(end + 5).trimStart();
}

const vaultFlag = process.argv.indexOf('--vault');
if (vaultFlag === -1 || !process.argv[vaultFlag + 1]) {
  console.error('Uso: node scripts/sync-docs.mjs --vault <ruta al vault de Histos>');
  process.exit(1);
}
const vault = process.argv[vaultFlag + 1];

let copied = 0;
const missing = [];

for (const [section, ids] of Object.entries(SECTIONS)) {
  for (const id of ids) {
    const source = join(vault, 'content', `${id}.md`);
    const target = join('docs', section, `${id}.md`);
    try {
      const raw = await readFile(source, 'utf8');
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, stripFrontmatter(raw), 'utf8');
      copied += 1;
    } catch {
      missing.push(id);
    }
  }
}

console.log(`${copied} documentos actualizados`);
if (missing.length) console.warn(`sin encontrar en el vault: ${missing.join(', ')}`);
