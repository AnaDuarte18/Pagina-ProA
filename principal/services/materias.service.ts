import { MOCK_CONFIG } from "@/config/mock.config";
import { MATERIAS } from "@/mocks/materias.mock";
import type { Materia } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * Devuelve la lista de materias/áreas académicas.
 * - MOCK_CONFIG.materias = true  → datos locales (sin red)
 * - MOCK_CONFIG.materias = false → GET ${BASE}/api/materias
 */
export async function fetchMaterias(): Promise<Materia[]> {
  if (MOCK_CONFIG.materias) {
    await delay(0);
    return MATERIAS;
  }

  const res = await fetch(`${BASE}/api/materias`);
  if (!res.ok) throw new Error(`[materias] ${res.status} ${res.statusText}`);
  return res.json() as Promise<Materia[]>;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
