import type { NovedadBackendItem } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

/** Todas las novedades publicadas (estadoID = 3) */
export async function fetchNovedadesPublicadas(): Promise<NovedadBackendItem[]> {
  const res = await fetch(`${BASE}/novedades?estadoID=3`);
  if (!res.ok) throw new Error(`[novedades] ${res.status} ${res.statusText}`);
  return res.json();
}

/** Novedades publicadas, limitadas a N (para inicio) */
export async function fetchNovedadesRecientes(limite = 3): Promise<NovedadBackendItem[]> {
  const data = await fetchNovedadesPublicadas();
  return data.slice(0, limite);
}

/** Una novedad por ID */
export async function fetchNovedadById(id: number): Promise<NovedadBackendItem> {
  const res = await fetch(`${BASE}/novedades/${id}`);
  if (!res.ok) throw new Error(`[novedades] ${res.status} ${res.statusText}`);
  return res.json();
}
