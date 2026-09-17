import { MOCK_CONFIG } from "@/config/mock.config";
import { MATERIALES } from "@/mocks/materiales.mock";
import type { MaterialItem } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * Devuelve la lista de materiales pedagógicos.
 * - MOCK_CONFIG.materiales = true  → datos locales (sin red)
 * - MOCK_CONFIG.materiales = false → GET ${BASE}/api/materiales
 */
export async function fetchMateriales(): Promise<MaterialItem[]> {
  if (MOCK_CONFIG.materiales) {
    await delay(0);
    return MATERIALES;
  }

  const res = await fetch(`${BASE}/api/materiales`);
  if (!res.ok) throw new Error(`[materiales] ${res.status} ${res.statusText}`);
  return res.json() as Promise<MaterialItem[]>;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
