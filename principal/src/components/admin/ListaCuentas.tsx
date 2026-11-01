import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import type { CuentaItem, CursoItem } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function ListaCuentas() {
  const { token } = useAuth();
  const [cuentas, setCuentas] = useState<CuentaItem[]>([]);
  const [cursos, setCursos] = useState<CursoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroRol, setFiltroRol] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");

  // Selección múltiple
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchEstado, setBatchEstado] = useState<number>(2); // Activo por defecto
  const [batchRol, setBatchRol] = useState<number>(3); // Alumno por defecto
  const [batchAsignarRol, setBatchAsignarRol] = useState(false);

  // Modales individuales
  const [cambiandoRolId, setCambiandoRolId] = useState<number | null>(null);
  const [nuevoRolId, setNuevoRolId] = useState<number>(3);
  const [cambiandoCursoId, setCambiandoCursoId] = useState<number | null>(null);
  const [nuevoCursoId, setNuevoCursoId] = useState<number>(1);
  const [historialModal, setHistorialModal] = useState<{ id: number; data: any[] } | null>(null);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const fetchCuentas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/cuentas`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setCuentas(data);
      } else {
        setCuentas(getMockCuentas());
      }
    } catch {
      setCuentas(getMockCuentas());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCuentas();
    async function loadCursos() {
      try {
        const res = await fetch(`${BASE}/cursos`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setCursos(data);
        }
      } catch {
        // ignore
      }
    }
    loadCursos();
  }, [token]);

  // ── Selección múltiple ──────────────────────────────────────

  const toggleSeleccion = (id: number) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTodos = () => {
    if (seleccionados.size === cuentasFiltradas.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(cuentasFiltradas.map((c) => c.ID)));
    }
  };

  const limpiarSeleccion = () => setSeleccionados(new Set());

  const aplicarBatch = async () => {
    if (seleccionados.size === 0) return;
    if (!confirm(`¿Confirmar cambio de estado para ${seleccionados.size} cuenta(s)?`)) return;

    setBatchLoading(true);
    try {
      const body: any = {
        ids: Array.from(seleccionados),
        estadoCuentaID: batchEstado,
      };
      if (batchAsignarRol) body.rolID = batchRol;

      const res = await fetch(`${BASE}/cuentas/batch/estado`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        limpiarSeleccion();
        fetchCuentas();
      } else {
        alert(data.error || "Error al aplicar cambios.");
      }
    } catch {
      alert("Error de conexión.");
    } finally {
      setBatchLoading(false);
    }
  };

  // ── Acciones individuales ───────────────────────────────────

  const cambiarEstadoCuenta = async (id: number, nuevoEstadoID: number, nuevoRolID?: number) => {
    try {
      const body: any = { estadoCuentaID: nuevoEstadoID };
      if (nuevoRolID) body.rolID = nuevoRolID;

      const res = await fetch(`${BASE}/cuentas/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchCuentas();
      } else {
        alert("Error al actualizar estado de la cuenta.");
      }
    } catch {
      alert("Error de conexión.");
    }
  };

  const confirmarCambioRol = async (id: number) => {
    try {
      const res = await fetch(`${BASE}/cuentas/${id}/rol`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rolID: nuevoRolId }),
      });
      if (res.ok) {
        setCambiandoRolId(null);
        fetchCuentas();
      } else {
        alert("Error al cambiar rol.");
      }
    } catch {
      alert("Error de conexión.");
    }
  };

  const confirmarCambioCurso = async (id: number) => {
    try {
      const res = await fetch(`${BASE}/cuentas/${id}/curso`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cursoID: nuevoCursoId }),
      });
      if (res.ok) {
        setCambiandoCursoId(null);
        alert("¡Curso actualizado! Se conservó el año de ingreso original del alumno.");
      } else {
        alert("Error al cambiar el curso del alumno.");
      }
    } catch {
      alert("Error de conexión.");
    }
  };

  const verHistorial = async (id: number) => {
    setLoadingHistorial(true);
    setHistorialModal({ id, data: [] });
    try {
      const res = await fetch(`${BASE}/cuentas/${id}/historial`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setHistorialModal({ id, data });
      } else {
        setHistorialModal({ id, data: [] });
      }
    } catch {
      setHistorialModal({ id, data: [] });
    } finally {
      setLoadingHistorial(false);
    }
  };

  // ── Filtros ─────────────────────────────────────────────────

  const cuentasFiltradas = cuentas.filter((c) => {
    const matchRol =
      filtroRol === "todos" ? true : c.rolID === parseInt(filtroRol);

    const matchEstado =
      filtroEstado === "todos" ? true : c.estadoCuentaID === parseInt(filtroEstado);

    const matchBusqueda =
      c.NombreApellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.correo.toLowerCase().includes(busqueda.toLowerCase());

    return matchRol && matchEstado && matchBusqueda;
  });

  const todosMarcados =
    cuentasFiltradas.length > 0 && seleccionados.size === cuentasFiltradas.length;
  const algunoMarcado = seleccionados.size > 0;

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="bg-[#E7ECEF]/70 p-4 rounded-lg border border-[#8B8C89]/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#274C77] uppercase tracking-wider">Rol:</span>
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded bg-white border border-[#8B8C89]/30 text-[#0d1b2a]"
            >
              <option value="todos">Todos los roles</option>
              <option value="1">Administrador</option>
              <option value="2">Docente</option>
              <option value="3">Alumno</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#274C77] uppercase tracking-wider">Estado:</span>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded bg-white border border-[#8B8C89]/30 text-[#0d1b2a]"
            >
              <option value="todos">Todos los estados</option>
              <option value="1">Pendiente</option>
              <option value="2">Activo</option>
              <option value="3">Rechazado</option>
              <option value="4">Suspendido</option>
            </select>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-xs px-3.5 py-2 rounded-md bg-white border border-[#8B8C89]/30 text-[#0d1b2a] focus:outline-none focus:border-[#6096BA]"
          />
        </div>
      </div>

      {/* ── Barra de Acciones Batch ── */}
      {algunoMarcado && (
        <div className="bg-[#274C77] text-white p-4 rounded-lg flex flex-wrap items-center gap-4">
          <span className="text-sm font-bold">
            {seleccionados.size} cuenta(s) seleccionada(s)
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A3CEF1]">Nuevo estado:</span>
            <select
              value={batchEstado}
              onChange={(e) => setBatchEstado(parseInt(e.target.value))}
              className="text-xs px-2.5 py-1.5 rounded bg-[#1a3050] border border-white/20 text-white"
            >
              <option value={1}>Pendiente</option>
              <option value={2}>Activo</option>
              <option value={3}>Rechazado</option>
              <option value={4}>Suspendido</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs text-[#A3CEF1] cursor-pointer">
            <input
              type="checkbox"
              checked={batchAsignarRol}
              onChange={(e) => setBatchAsignarRol(e.target.checked)}
              className="rounded"
            />
            Asignar rol:
          </label>

          {batchAsignarRol && (
            <select
              value={batchRol}
              onChange={(e) => setBatchRol(parseInt(e.target.value))}
              className="text-xs px-2.5 py-1.5 rounded bg-[#1a3050] border border-white/20 text-white"
            >
              <option value={1}>Administrador</option>
              <option value={2}>Docente</option>
              <option value={3}>Alumno</option>
            </select>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={limpiarSeleccion}
              className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white"
            >
              Cancelar
            </button>
            <button
              onClick={aplicarBatch}
              disabled={batchLoading}
              className="text-xs px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 rounded font-bold text-white"
            >
              {batchLoading ? "Aplicando..." : "Aplicar a Seleccionadas"}
            </button>
          </div>
        </div>
      )}

      {/* Tabla de Cuentas */}
      {loading ? (
        <div className="text-center py-12 text-sm text-[#8B8C89]">Cargando usuarios desde la base de datos...</div>
      ) : cuentasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[#8B8C89]/20 text-sm text-[#8B8C89]">
          No se encontraron cuentas con los criterios aplicados.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-[#8B8C89]/20 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#274C77] text-white font-bold">
                {/* Checkbox "Seleccionar todos" */}
                <th className="p-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={todosMarcados}
                    onChange={toggleTodos}
                    className="rounded cursor-pointer"
                    title="Seleccionar todos"
                  />
                </th>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Usuario / Correo</th>
                <th className="p-3.5">Rol Actual</th>
                <th className="p-3.5">Estado Cuenta</th>
                <th className="p-3.5">Solicitud Docente</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8B8C89]/15">
              {cuentasFiltradas.map((c) => {
                const badgeRol = getRolBadge(c.rolID);
                const badgeEstado = getEstadoCuentaBadge(c.estadoCuentaID);
                const tieneSolicitud = !!c.solicitudDocente;
                const estaSeleccionado = seleccionados.has(c.ID);

                return (
                  <tr
                    key={c.ID}
                    className={`transition-colors ${
                      estaSeleccionado ? "bg-[#A3CEF1]/20" : "hover:bg-[#E7ECEF]/40"
                    }`}
                  >
                    <td className="p-3.5">
                      <input
                        type="checkbox"
                        checked={estaSeleccionado}
                        onChange={() => toggleSeleccion(c.ID)}
                        className="rounded cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5 font-mono-code font-bold text-[#8B8C89]">#{c.ID}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-[#274C77] text-sm">{c.NombreApellido}</p>
                      <p className="font-mono-code text-[#8B8C89] text-[11px]">{c.correo}</p>
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeRol.className}`}>
                        {c.rolNombre || badgeRol.label}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeEstado.className}`}>
                        {c.estadoCuenta || badgeEstado.label}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {tieneSolicitud ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full border border-purple-300">
                          ⏳ Pide rol Docente
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#8B8C89]">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {/* Si está pendiente de aprobación */}
                      {c.estadoCuentaID === 1 && (
                        <>
                          <button
                            onClick={() => cambiarEstadoCuenta(c.ID, 2, 3)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded text-[11px]"
                            title="Aprobar como Alumno"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => cambiarEstadoCuenta(c.ID, 3)}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-2.5 py-1 rounded text-[11px]"
                            title="Rechazar cuenta"
                          >
                            Rechazar
                          </button>
                        </>
                      )}

                      {/* Si tiene solicitud de docente pendiente */}
                      {tieneSolicitud && (
                        <button
                          onClick={() => cambiarEstadoCuenta(c.ID, 2, 2)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-2.5 py-1 rounded text-[11px]"
                          title="Aprobar solicitud y otorgar rol Docente"
                        >
                          Aprobar Docente
                        </button>
                      )}

                      {/* Cambiar Rol */}
                      <button
                        onClick={() => {
                          setCambiandoRolId(c.ID);
                          setNuevoRolId(c.rolID);
                        }}
                        className="bg-[#274C77] hover:bg-[#6096BA] text-white font-semibold px-2 py-1 rounded text-[11px]"
                      >
                        Rol
                      </button>

                      {/* Si es Alumno: Cambiar curso */}
                      {c.rolID === 3 && (
                        <button
                          onClick={() => setCambiandoCursoId(c.ID)}
                          className="bg-[#6096BA] hover:bg-[#274C77] text-white font-semibold px-2 py-1 rounded text-[11px]"
                          title="Cambiar curso"
                        >
                          Curso
                        </button>
                      )}

                      {/* Ver Historial */}
                      <button
                        onClick={() => verHistorial(c.ID)}
                        className="bg-white border border-[#8B8C89]/30 text-[#274C77] hover:bg-[#A3CEF1]/20 px-2 py-1 rounded text-[11px]"
                        title="Ver auditoría de cambios"
                      >
                        Historial
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Cambiar Rol */}
      {cambiandoRolId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-sm font-bold text-[#274C77] mb-3">Cambiar Rol de Usuario #{cambiandoRolId}</h3>
            <p className="text-xs text-[#8B8C89] mb-4">
              Seleccioná el nuevo rol. Si cambiás a Docente se limpiará cualquier solicitud pendiente.
            </p>
            <select
              value={nuevoRolId}
              onChange={(e) => setNuevoRolId(parseInt(e.target.value))}
              className="w-full text-xs p-2 rounded border border-[#8B8C89]/30 mb-4"
            >
              <option value={1}>1 - Administrador</option>
              <option value={2}>2 - Docente</option>
              <option value={3}>3 - Alumno</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCambiandoRolId(null)}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmarCambioRol(cambiandoRolId)}
                className="text-xs px-3 py-1.5 bg-[#274C77] text-white font-semibold rounded hover:bg-[#6096BA]"
              >
                Guardar Rol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Curso */}
      {cambiandoCursoId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-sm font-bold text-[#274C77] mb-2">Cambiar Curso de Alumno #{cambiandoCursoId}</h3>
            <p className="text-xs text-[#8B8C89] mb-4 leading-relaxed">
              El sistema cerrará el curso anterior y asignará el nuevo manteniendo el <strong>año de ingreso original</strong>.
            </p>
            <select
              value={nuevoCursoId}
              onChange={(e) => setNuevoCursoId(parseInt(e.target.value))}
              className="w-full text-xs p-2 rounded border border-[#8B8C89]/30 mb-4"
            >
              {cursos.map((c) => (
                <option key={c.ID} value={c.ID}>
                  {c.anio}° Año — División {c.division}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCambiandoCursoId(null)}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmarCambioCurso(cambiandoCursoId)}
                className="text-xs px-3 py-1.5 bg-[#274C77] text-white font-semibold rounded hover:bg-[#6096BA]"
              >
                Confirmar Nuevo Curso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historial de Cuenta */}
      {historialModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#8B8C89]/20 mb-4">
              <h3 className="text-sm font-bold text-[#274C77]">
                Historial y Auditoría de Cuenta #{historialModal.id}
              </h3>
              <button
                onClick={() => setHistorialModal(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {loadingHistorial ? (
                <p className="text-xs text-center py-6 text-[#8B8C89]">Cargando movimientos...</p>
              ) : historialModal.data.length === 0 ? (
                <p className="text-xs text-center py-6 text-[#8B8C89]">No hay cambios registrados para esta cuenta.</p>
              ) : (
                historialModal.data.map((h, i) => (
                  <div key={i} className="p-3 bg-[#E7ECEF]/50 rounded-lg border border-[#8B8C89]/20 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#274C77] mb-1">
                      <span className="uppercase text-[10px] bg-[#6096BA]/20 px-1.5 py-0.5 rounded">
                        Campo: {h.campo}
                      </span>
                      <span className="text-[#8B8C89] text-[10px] font-mono-code">{h.fechaDeCreacion}</span>
                    </div>
                    <p className="text-[11px] text-[#0d1b2a]">
                      Anterior: <span className="font-semibold text-red-700">{h.valorAnterior || "Ninguno"}</span> →
                      Nuevo: <span className="font-semibold text-emerald-700">{h.valorNuevo}</span>
                    </p>
                    <p className="text-[10px] text-[#8B8C89] mt-1">
                      Realizado por: <strong>{h.realizadoPor || "Sistema"}</strong>
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 mt-2 border-t border-[#8B8C89]/20 flex justify-end">
              <button
                onClick={() => setHistorialModal(null)}
                className="text-xs px-4 py-1.5 bg-[#274C77] text-white rounded font-semibold hover:bg-[#6096BA]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getRolBadge(rolId: number) {
  switch (rolId) {
    case 1: return { label: "Administrador", className: "bg-purple-100 text-purple-800" };
    case 2: return { label: "Docente", className: "bg-blue-100 text-blue-800" };
    case 3: return { label: "Alumno", className: "bg-emerald-100 text-emerald-800" };
    default: return { label: "Usuario", className: "bg-gray-100 text-gray-800" };
  }
}

function getEstadoCuentaBadge(estadoId: number) {
  switch (estadoId) {
    case 1: return { label: "Pendiente", className: "bg-amber-100 text-amber-800" };
    case 2: return { label: "Activo", className: "bg-emerald-100 text-emerald-800" };
    case 3: return { label: "Rechazado", className: "bg-red-100 text-red-800" };
    case 4: return { label: "Suspendido", className: "bg-gray-200 text-gray-800" };
    default: return { label: "Desconocido", className: "bg-gray-100 text-gray-600" };
  }
}

function getMockCuentas(): CuentaItem[] {
  return [
    { ID: 1, NombreApellido: "Admin ProA", correo: "admin@escuelasproa.edu.ar", rolID: 1, rolNombre: "Administrador", estadoCuentaID: 2, estadoCuenta: "Activo", solicitudDocente: false },
    { ID: 2, NombreApellido: "Ana Duarte", correo: "aduarte@escuelasproa.edu.ar", rolID: 2, rolNombre: "Docente", estadoCuentaID: 2, estadoCuenta: "Activo", solicitudDocente: false },
    { ID: 3, NombreApellido: "Lucas Méndez", correo: "lmendez@escuelasproa.edu.ar", rolID: 3, rolNombre: "Alumno", estadoCuentaID: 2, estadoCuenta: "Activo", solicitudDocente: false },
    { ID: 4, NombreApellido: "Carla Romero", correo: "carla.romero@gmail.com", rolID: 3, rolNombre: "Alumno", estadoCuentaID: 1, estadoCuenta: "Pendiente", solicitudDocente: false },
    { ID: 6, NombreApellido: "Valeria Torres", correo: "vtorres@escuelasproa.edu.ar", rolID: 3, rolNombre: "Alumno", estadoCuentaID: 2, estadoCuenta: "Activo", solicitudDocente: true },
  ];
}
