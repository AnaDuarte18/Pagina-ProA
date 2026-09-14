/**
 * ─── CONFIGURACIÓN DE DATOS MOCK ────────────────────────────────────────────
 *
 * Cada flag controla si ese recurso usa datos locales (mock) o llama al endpoint
 * real de la API. Ponelo en `true` mientras el endpoint todavía no existe.
 *
 * También podés sobreescribir cada valor desde el archivo .env (o .env.local):
 *
 *   VITE_MOCK_NOTICIAS=false
 *   VITE_MOCK_EVENTOS=false
 *   VITE_MOCK_MATERIALES=false
 *   VITE_MOCK_MATERIAS=false
 *
 * El valor de .env tiene prioridad sobre el que está hardcodeado acá.
 * ────────────────────────────────────────────────────────────────────────────
 */

function envFlag(key: string, fallback: boolean): boolean {
  const val = import.meta.env[key];
  if (val === "true") return true;
  if (val === "false") return false;
  return fallback;
}

export const MOCK_CONFIG = {
  /** GET /api/noticias */
  noticias: envFlag("VITE_MOCK_NOTICIAS", true),

  /** GET /api/eventos */
  eventos: envFlag("VITE_MOCK_EVENTOS", true),

  /** GET /api/materiales */
  materiales: envFlag("VITE_MOCK_MATERIALES", true),

  /** GET /api/materias */
  materias: envFlag("VITE_MOCK_MATERIAS", true),
} as const;

export type MockKey = keyof typeof MOCK_CONFIG;
