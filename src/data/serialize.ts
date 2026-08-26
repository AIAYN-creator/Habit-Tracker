/**
 * Conversion entre el modelo local y los ficheros del repo.
 * Ver docs/tecnica/serialize.md.
 */

/**
 * JSON con las claves ordenadas alfabeticamente, dos espacios y salto final.
 *
 * El orden importa: sin el, dos dispositivos pueden emitir el mismo objeto en
 * distinto orden y producir un diff enorme por un cambio de un valor.
 */
export function stableStringify(value: unknown): string {
  return `${JSON.stringify(sortDeep(value), null, 2)}\n`;
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value === null || typeof value !== 'object') return value;

  const source = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(source).sort()) {
    sorted[key] = sortDeep(source[key]);
  }
  return sorted;
}

/**
 * A base64, que es lo que recibe la API de GitHub.
 *
 * Via TextEncoder y no `btoa` a secas: `btoa` revienta con cualquier caracter
 * fuera de Latin-1, y el primer habito con tilde o emoji lo rompe.
 */
export function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  // De 8 kB en 8 kB: pasar decenas de miles de argumentos desborda la pila.
  for (let index = 0; index < bytes.length; index += 8192) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
  }
  return btoa(binary);
}

export function fromBase64(encoded: string): string {
  const binary = atob(encoded.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Lo que se lee del repo puede venir de una version mas nueva: no se descarta nada. */
export function parseJson(raw: string, path: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`El fichero ${path} no es JSON valido`);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`El fichero ${path} no contiene un objeto`);
  }
  return parsed as Record<string, unknown>;
}
