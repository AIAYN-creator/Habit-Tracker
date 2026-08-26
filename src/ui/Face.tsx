interface Props {
  /** 1 es lo peor, 5 lo mejor. */
  level: 1 | 2 | 3 | 4 | 5;
  size?: number;
}

/**
 * Caras dibujadas, no emoji.
 *
 * Un emoji lo dibuja el sistema operativo: cambia de aspecto entre Android,
 * iOS y Windows, y no hereda el color del tema. Estas son SVG propio con
 * `currentColor`, asi que son iguales en todas partes y se tiñen con el color
 * de la dimension.
 *
 * Todas comparten circulo y ojos; lo unico que cambia es la boca, y en los
 * extremos tambien la mirada. Es lo que las hace leerse como una escala y no
 * como cinco dibujos distintos.
 */
const MOUTHS: Record<number, string> = {
  1: 'M10 23 Q16 16.5 22 23',
  2: 'M10.5 22 Q16 18.8 21.5 22',
  3: 'M10.5 20.5 H21.5',
  4: 'M10.5 19.5 Q16 22.8 21.5 19.5',
  5: 'M10 19 Q16 25.5 22 19',
};

export function Face({ level, size = 32 }: Props) {
  const mouth = MOUTHS[level] ?? MOUTHS[3];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="13" />
      {level === 5 ? (
        <>
          <path d="M9.5 13.5 Q11.75 11 14 13.5" />
          <path d="M18 13.5 Q20.25 11 22.5 13.5" />
        </>
      ) : level === 1 ? (
        <>
          <path d="M9.5 11 L13.5 12.8" />
          <path d="M22.5 11 L18.5 12.8" />
          <circle cx="11.75" cy="15" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="20.25" cy="15" r="1.1" fill="currentColor" stroke="none" />
        </>
      ) : (
        <>
          <circle cx="11.75" cy="14" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="20.25" cy="14" r="1.3" fill="currentColor" stroke="none" />
        </>
      )}
      <path d={mouth} />
    </svg>
  );
}
