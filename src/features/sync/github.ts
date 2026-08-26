import { fromBase64, toBase64 } from '@/data';

/**
 * Cliente de la API de GitHub. Ver docs/tecnica/sync.md.
 *
 * Se usa la Git Data API y no la Contents API porque esta ultima hace **un
 * commit por fichero**, y adr-repo fija un commit por sincronizacion.
 */

export interface RepoFile {
  path: string;
  content: string;
}

export interface TreeEntry {
  path: string;
  sha: string;
}

export interface GitHubClient {
  /** SHA del commit al que apunta la rama, o null si el repo esta vacio. */
  getHead(): Promise<string | null>;
  listFiles(commitSha: string): Promise<TreeEntry[]>;
  readBlob(sha: string): Promise<string>;
  /** Crea un unico commit con todos los ficheros y mueve la referencia. */
  push(params: { parent: string | null; files: RepoFile[]; message: string }): Promise<string>;
}

export interface RepoConfig {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
}

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'GitHubError';
  }
}

/** Traduce el codigo HTTP a algo que se pueda enseñar sin jerga. */
function describe(status: number): string {
  if (status === 401) return 'El acceso a GitHub ha caducado o el token no es válido';
  if (status === 403) return 'El token no tiene permiso para escribir en el repositorio';
  if (status === 404) return 'No se encuentra el repositorio con este token';
  if (status === 409) return 'El repositorio cambió mientras se sincronizaba';
  return `GitHub respondió con un error (${String(status)})`;
}

export function createGitHubClient(config: RepoConfig): GitHubClient {
  const branch = config.branch ?? 'main';
  const base = `https://api.github.com/repos/${config.owner}/${config.repo}`;

  async function call<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    if (!response.ok) throw new GitHubError(describe(response.status), response.status);
    return (await response.json()) as T;
  }

  return {
    async getHead() {
      try {
        const ref = await call<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
        return ref.object.sha;
      } catch (error) {
        // Repo recien creado y vacio: no hay rama todavia, y no es un fallo.
        if (error instanceof GitHubError && error.status === 404) return null;
        throw error;
      }
    },

    async listFiles(commitSha) {
      const commit = await call<{ tree: { sha: string } }>(`/git/commits/${commitSha}`);
      const tree = await call<{ tree: { path: string; type: string; sha: string }[] }>(
        `/git/trees/${commit.tree.sha}?recursive=1`,
      );
      return tree.tree
        .filter((node) => node.type === 'blob')
        .map(({ path, sha }) => ({ path, sha }));
    },

    async readBlob(sha) {
      const blob = await call<{ content: string }>(`/git/blobs/${sha}`);
      return fromBase64(blob.content);
    },

    async push({ parent, files, message }) {
      const blobs = await Promise.all(
        files.map(async (file) => {
          const blob = await call<{ sha: string }>('/git/blobs', {
            method: 'POST',
            body: JSON.stringify({ content: toBase64(file.content), encoding: 'base64' }),
          });
          return { path: file.path, mode: '100644', type: 'blob', sha: blob.sha };
        }),
      );

      const tree = await call<{ sha: string }>('/git/trees', {
        method: 'POST',
        body: JSON.stringify({ ...(parent ? { base_tree: parent } : {}), tree: blobs }),
      });

      const commit = await call<{ sha: string }>('/git/commits', {
        method: 'POST',
        body: JSON.stringify({ message, tree: tree.sha, parents: parent ? [parent] : [] }),
      });

      if (parent) {
        await call(`/git/refs/heads/${branch}`, {
          method: 'PATCH',
          body: JSON.stringify({ sha: commit.sha }),
        });
      } else {
        await call('/git/refs', {
          method: 'POST',
          body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }),
        });
      }

      return commit.sha;
    },
  };
}
