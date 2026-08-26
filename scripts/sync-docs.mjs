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

export const SECTIONS = {
  adr: ['charts', 'adr-repo', 'adr-sync'],
  producto: ['vision', 'modelo', 'flujos', 'habitos', 'moods'],
  tecnica: [
    'repo',
    'stack',
    'tooling',
    'ci',
    'pwa',
    'dexie',
    'dal',
    'validacion',
    'serialize',
    'auth-gh',
    'seed',
    'sync',
  ],
  diseno: ['tokens', 'ui-kit', 'logo', 'iconos', 'splash', 'panel-tema', 'a11y', 'inputs'],
  graficas: ['heatmap', 'series', 'barras'],
};

/**
 * Quita el frontmatter YAML y normaliza los finales de linea.
 *
 * Los ficheros del vault vienen con CRLF en Windows: sin normalizar antes de
 * comparar, el delimitador no casa y el frontmatter se cuela entero en el
 * espejo. Paso justamente eso por alto la primera vez.
 */
export function stripFrontmatter(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return normalized.trimStart();
  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) return normalized.trimStart();
  return normalized.slice(end + 5).trimStart();
}

export async function syncDocs(vault) {
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

  return { copied, missing };
}

if (process.argv[1]?.endsWith('sync-docs.mjs')) {
  const flag = process.argv.indexOf('--vault');
  const vault = flag === -1 ? undefined : process.argv[flag + 1];
  if (!vault) {
    console.error('Uso: node scripts/sync-docs.mjs --vault <ruta al vault de Histos>');
    process.exit(1);
  }
  const { copied, missing } = await syncDocs(vault);
  console.log(`${copied} documentos actualizados`);
  if (missing.length) console.warn(`sin encontrar en el vault: ${missing.join(', ')}`);
}
