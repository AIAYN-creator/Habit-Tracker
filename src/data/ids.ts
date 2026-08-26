import { customAlphabet } from 'nanoid';

// Sin guiones ni mayusculas: estos ids acaban en nombres de clave dentro de
// JSON que un humano lee a mano en el repo.
const generate = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);

export function habitId(): string {
  return `h_${generate()}`;
}

export function moodId(): string {
  return `m_${generate()}`;
}
