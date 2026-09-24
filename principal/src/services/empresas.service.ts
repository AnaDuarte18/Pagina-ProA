import { MOCK_EMPRESAS, type Empresa } from "@/mocks/empresas.mock";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * Obtiene el listado de empresas activas para pasantías desde el endpoint GET /empresas.
 * Si el backend no está disponible o responde vacío, utiliza los datos mock de contingencia.
 */
export async function fetchEmpresas(): Promise<Empresa[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/empresas`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn("[Empresas] GET /empresas no disponible, utilizando mock local:", err);
  }
  return MOCK_EMPRESAS;
}
