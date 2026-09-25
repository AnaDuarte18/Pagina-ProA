import type { EventoBackendItem } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

function authHeaders(token?: string | null): HeadersInit {
  const t = token || (typeof window !== "undefined" ? localStorage.getItem("proa_token") : null);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/** Todos los eventos publicados (requiere auth en el backend) */
export async function fetchEventosPublicados(token?: string | null): Promise<EventoBackendItem[]> {
  const res = await fetch(`${BASE}/eventos?estadoID=3`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`[eventos] ${res.status} ${res.statusText}`);
  return res.json();
}

/** Un evento por ID (requiere auth en el backend) con fallback a la lista si /eventos/:id da 404 */
export async function fetchEventoById(id: number, token?: string | null): Promise<EventoBackendItem> {
  try {
    const res = await fetch(`${BASE}/eventos/${id}`, {
      headers: authHeaders(token),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`[eventos] No se pudo obtener /eventos/${id}, intentando fallback a lista:`, err);
  }

  // Fallback: si /eventos/:id no responde 200 (ej. 404 por endpoint no reiniciado), buscarlo en la lista de eventos
  const todos = await fetchEventosPublicados(token);
  const encontrado = todos.find((e) => Number(e.ID) === Number(id));
  if (encontrado) return encontrado;

  throw new Error(`[eventos] Evento #${id} no encontrado.`);
}
