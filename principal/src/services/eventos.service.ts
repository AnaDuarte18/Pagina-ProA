import { MOCK_CONFIG } from "@/config/mock.config";
import { EVENTOS } from "@/mocks/eventos.mock";
import type { Evento } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * Devuelve la lista de eventos del calendario.
 * - MOCK_CONFIG.eventos = true  → datos locales (sin red)
 * - MOCK_CONFIG.eventos = false → GET ${BASE}/api/eventos
 */
export async function fetchEventos(): Promise<Evento[]> {
  if (MOCK_CONFIG.eventos) {
    await delay(0);
    return EVENTOS;
  }

  const res = await fetch(`${BASE}/api/eventos`);
  if (!res.ok) throw new Error(`[eventos] ${res.status} ${res.statusText}`);
  return res.json() as Promise<Evento[]>;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
