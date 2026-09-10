/**
 * Utility: merges class names filtering falsy values.
 * función utilitaria para gestionar clases de CSS de forma dinámica y limpia
 * Usa por detrás una librería llamada tailwind-merge. Si por error ponés dos clases que chocan (como px-4 y px-6), cn() se asegura de que no se rompa el diseño y prioriza la última que declaraste, evitando que el navegador se vuelva loco decidiendo cuál aplicar.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
