import { MOCK_EMPRESAS } from "@/mocks/empresas.mock";
import type { Empresa } from "@/types";

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
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn("[Empresas] GET /empresas no disponible, utilizando mock local:", err);
  }
  return MOCK_EMPRESAS;
}

/**
 * Obtiene todas las empresas registradas (cualquier estado) para el panel de administración.
 */
export async function fetchAdminEmpresas(token: string | null): Promise<Empresa[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/empresas`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn("[Empresas] GET /admin/empresas no disponible, utilizando mock local:", err);
  }
  return MOCK_EMPRESAS;
}

/**
 * Crea una nueva empresa de pasantías (POST /empresas).
 */
export async function crearEmpresa(
  datos: { Nombre: string; Descripcion?: string; imagen?: string; estadoEmpresaID?: number },
  token: string | null
): Promise<{ success: boolean; data?: Empresa; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/empresas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(datos),
    });
    const result = await res.json();
    if (res.ok) {
      return { success: true, data: result.empresa };
    }
    return { success: false, error: result.error || "Error al crear la empresa" };
  } catch (err: any) {
    return { success: false, error: err.message || "Error de conexión" };
  }
}

/**
 * Edita datos de una empresa (PATCH /empresas/:id).
 */
export async function actualizarEmpresa(
  id: number,
  datos: { Nombre?: string; Descripcion?: string; imagen?: string },
  token: string | null
): Promise<{ success: boolean; data?: Empresa; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/empresas/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(datos),
    });
    const result = await res.json();
    if (res.ok) {
      return { success: true, data: result.empresa };
    }
    return { success: false, error: result.error || "Error al actualizar la empresa" };
  } catch (err: any) {
    return { success: false, error: err.message || "Error de conexión" };
  }
}

/**
 * Cambia el estado de una empresa (PATCH /empresas/:id/estado).
 * Valores: 1 = Activa, 2 = Inactiva, 3 = Dada de baja
 */
export async function cambiarEstadoEmpresa(
  id: number,
  estadoEmpresaID: number,
  token: string | null
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/empresas/${id}/estado`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ estadoEmpresaID }),
    });
    const result = await res.json();
    if (res.ok) {
      return { success: true, message: result.message };
    }
    return { success: false, error: result.error || "Error al cambiar estado" };
  } catch (err: any) {
    return { success: false, error: err.message || "Error de conexión" };
  }
}
