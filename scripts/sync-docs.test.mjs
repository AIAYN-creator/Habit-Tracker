import { describe, expect, it } from 'vitest';
import { stripFrontmatter, SECTIONS } from './sync-docs.mjs';

const FRONTMATTER = ['---', "description: 'Algo'", 'sources: []', '---', '# Titulo', '', 'Cuerpo.'];

describe('stripFrontmatter', () => {
  it('quita el frontmatter con finales de linea LF', () => {
    expect(stripFrontmatter(FRONTMATTER.join('\n'))).toBe('# Titulo\n\nCuerpo.');
  });

  it('quita el frontmatter con finales de linea CRLF', () => {
    // El caso real del vault en Windows, y el que se me colo la primera vez.
    expect(stripFrontmatter(FRONTMATTER.join('\r\n'))).toBe('# Titulo\n\nCuerpo.');
  });

  it('deja intacto un documento sin frontmatter', () => {
    expect(stripFrontmatter('# Titulo\n\nCuerpo.')).toBe('# Titulo\n\nCuerpo.');
  });

  it('no se come el cuerpo si el frontmatter esta sin cerrar', () => {
    const roto = '---\ndescription: sin cierre\n# Titulo\n';
    expect(stripFrontmatter(roto)).toContain('# Titulo');
  });
});

describe('SECTIONS', () => {
  it('no asigna la misma tarjeta a dos carpetas', () => {
    const ids = Object.values(SECTIONS).flat();
    expect(new Set(ids).size).toBe(ids.length);
  });
});
