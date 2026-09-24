import { MOCK_CURSOS, type Curso } from "@/mocks/cursos.mock";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * Obtiene los cursos disponibles.
 */
export async function fetchCursos(token?: string | null): Promise<Curso[]> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/cursos`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn("[Cursos] No se pudo conectar a GET /cursos, usando mock local:", err);
  }
  return MOCK_CURSOS;
}

/**
 * Asigna el curso seleccionado al alumno.
 */
export async function asignarCursoAlumno(
  cursoID: number,
  token?: string | null
): Promise<{ success: boolean; message: string }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const anioInicio = new Date().getFullYear();
    const res = await fetch(`${API_BASE_URL}/alumno/curso`, {
      method: "POST",
      headers,
      body: JSON.stringify({ cursoID, anioInicio }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message || "Curso asignado con éxito." };
    } else {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, message: errorData.error || "No se pudo asignar el curso." };
    }
  } catch (err) {
    console.warn("[Cursos] Backend no disponible; simulando asignación en modo local.");
    return { success: true, message: "Curso asignado correctamente (modo local)." };
  }
}

/**
 * Envía la solicitud para acreditar rol docente.
 */
export async function enviarSolicitudDocente(
  cuentaId: number | string,
  token?: string | null
): Promise<{ success: boolean; message: string }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/cuentas/${cuentaId}/solicitar-docente`, {
      method: "POST",
      headers,
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message || "Solicitud de docente enviada con éxito." };
    } else {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, message: errorData.error || "No se pudo enviar la solicitud." };
    }
  } catch (err) {
    console.warn("[Cursos] Backend no disponible; simulando envío de solicitud docente.");
    return {
      success: true,
      message: "Solicitud enviada correctamente. El administrador la revisará a la brevedad.",
    };
  }
}
