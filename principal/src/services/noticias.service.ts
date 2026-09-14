import { MOCK_CONFIG } from "@/config/mock.config";
import { NOTICIAS } from "@/mocks/noticias.mock";
import type { Noticia } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * Devuelve la lista de noticias.
 * - MOCK_CONFIG.noticias = true  → datos locales (sin red)
 * - MOCK_CONFIG.noticias = false → GET ${BASE}/api/noticias
 */
export async function fetchNoticias(): Promise<Noticia[]> {
  if (MOCK_CONFIG.noticias) {
    // Simulamos latencia mínima para que los estados loading/skeleton sean visibles
    await delay(0);
    return NOTICIAS;
  }

  const res = await fetch(`${BASE}/api/noticias`);
  if (!res.ok) throw new Error(`[noticias] ${res.status} ${res.statusText}`);
  return res.json() as Promise<Noticia[]>;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
