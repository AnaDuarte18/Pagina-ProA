import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import type { NovedadBackendItem } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface ListaNovedadesProps {
  onEditar?: (novedad: NovedadBackendItem) => void;
}

export default function ListaNovedades({ onEditar }: ListaNovedadesProps) {
  const { token } = useAuth();
  const [novedades, setNovedades] = useState<NovedadBackendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [comentarioDevolucion, setComentarioDevolucion] = useState<{ [id: number]: string }>({});
  const [modalDevolverId, setModalDevolverId] = useState<number | null>(null);

  const fetchNovedades = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/novedades`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setNovedades(data);
      } else {
        setNovedades(getMockNovedades());
      }
    } catch {
      setNovedades(getMockNovedades());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNovedades();
  }, [token]);

  const cambiarEstado = async (id: number, nuevoEstadoID: number, comentario?: string) => {
    try {
      const res = await fetch(`${BASE}/novedades/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estadoID: nuevoEstadoID, comentario: comentario || null }),
      });
      if (res.ok) {
        fetchNovedades();
        setModalDevolverId(null);
      } else {
        alert("Error al actualizar estado en el servidor.");
      }
    } catch (e) {
      alert("Error de conexión con el backend.");
    }
  };

  const eliminarNovedad = async (id: number) => {
    if (!confirm("¿Seguro que querés dar de baja esta novedad? Pasará a estado Eliminado.")) return;
    try {
      const res = await fetch(`${BASE}/novedades/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) fetchNovedades();
    } catch {
      alert("Error al eliminar.");
    }
  };

  const novedadesFiltradas = novedades.filter((n) => {
    const matchEstado =
      filtroEstado === "todos"
        ? true
        : filtroEstado === "1"
        ? n.estadoID === 1
        : filtroEstado === "2"
        ? n.estadoID === 2
        : filtroEstado === "3"
        ? n.estadoID === 3
        : filtroEstado === "4"
        ? n.estadoID === 4
        : true;

    const matchBusqueda =
      n.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.cuerpo.toLowerCase().includes(busqueda.toLowerCase()) ||
      (n.autorNombre && n.autorNombre.toLowerCase().includes(busqueda.toLowerCase()));

    return matchEstado && matchBusqueda;
  });

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <div className="bg-[#E7ECEF]/70 p-4 rounded-lg border border-[#8B8C89]/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-[#274C77] uppercase tracking-wider">Estado:</span>
          <div className="inline-flex rounded-md border border-[#8B8C89]/30 bg-white p-1 text-xs">
            <button
              onClick={() => setFiltroEstado("todos")}
              className={`px-3 py-1 rounded transition-colors ${
                filtroEstado === "todos" ? "bg-[#274C77] text-white font-bold" : "text-[#274C77] hover:bg-[#A3CEF1]/20"
              }`}
            >
              Todos ({novedades.length})
            </button>
            <button
              onClick={() => setFiltroEstado("1")}
              className={`px-3 py-1 rounded transition-colors ${
                filtroEstado === "1" ? "bg-amber-600 text-white font-bold" : "text-amber-800 hover:bg-amber-50"
              }`}
            >
              Pendientes ({novedades.filter((n) => n.estadoID === 1).length})
            </button>
            <button
              onClick={() => setFiltroEstado("3")}
              className={`px-3 py-1 rounded transition-colors ${
                filtroEstado === "3" ? "bg-emerald-600 text-white font-bold" : "text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              Publicadas ({novedades.filter((n) => n.estadoID === 3).length})
            </button>
            <button
              onClick={() => setFiltroEstado("2")}
              className={`px-3 py-1 rounded transition-colors ${
                filtroEstado === "2" ? "bg-blue-600 text-white font-bold" : "text-blue-800 hover:bg-blue-50"
              }`}
            >
              Devueltas ({novedades.filter((n) => n.estadoID === 2).length})
            </button>
            <button
              onClick={() => setFiltroEstado("4")}
              className={`px-3 py-1 rounded transition-colors ${
                filtroEstado === "4" ? "bg-gray-600 text-white font-bold" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Eliminadas ({novedades.filter((n) => n.estadoID === 4).length})
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar por título o autor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-xs px-3.5 py-2 rounded-md bg-white border border-[#8B8C89]/30 text-[#0d1b2a] focus:outline-none focus:border-[#6096BA]"
          />
        </div>
      </div>

      {/* Lista de Novedades */}
      {loading ? (
        <div className="text-center py-12 text-sm text-[#8B8C89]">Cargando publicaciones desde el backend...</div>
      ) : novedadesFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[#8B8C89]/20 text-sm text-[#8B8C89]">
          No hay novedades que coincidan con los filtros seleccionados.
        </div>
      ) : (
        <div className="space-y-4">
          {novedadesFiltradas.map((n) => {
            const estadoBadge = getEstadoBadge(n.estadoID);
            return (
              <div
                key={n.ID}
                className="bg-white rounded-lg p-5 border border-[#8B8C89]/20 shadow-sm hover:border-[#6096BA] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-mono-code font-bold px-2.5 py-0.5 rounded-full ${estadoBadge.className}`}>
                      {estadoBadge.label}
                    </span>
                    {n.asignaturaNombre && (
                      <span className="text-[10px] font-mono-code bg-[#E7ECEF] text-[#274C77] px-2 py-0.5 rounded">
                        {n.asignaturaNombre}
                      </span>
                    )}
                    <span className="text-xs text-[#8B8C89]">
                      Por <strong>{n.autorNombre || "Docente"}</strong> · {n.fechaDeCreacion ? n.fechaDeCreacion.substring(0, 10) : "Reciente"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#274C77]">{n.titulo}</h3>
                  <p className="text-xs text-[#0d1b2a]/80 line-clamp-2 leading-relaxed">{n.cuerpo}</p>

                  {n.comentarioAdmin && (
                    <div className="mt-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded">
                      <strong>Comentario admin:</strong> {n.comentarioAdmin}
                    </div>
                  )}
                </div>

                {/* Acciones de administración */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {n.estadoID === 1 && (
                    <>
                      <button
                        onClick={() => cambiarEstado(n.ID, 3)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm"
                      >
                        Aprobar y Publicar
                      </button>
                      <button
                        onClick={() => setModalDevolverId(n.ID)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm"
                      >
                        Devolver con Comentario
                      </button>
                    </>
                  )}

                  {n.estadoID === 2 && (
                    <button
                      onClick={() => cambiarEstado(n.ID, 3)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm"
                    >
                      Aprobar ahora
                    </button>
                  )}

                  {onEditar && (
                    <button
                      onClick={() => onEditar(n)}
                      className="bg-[#274C77] hover:bg-[#6096BA] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors"
                    >
                      Editar
                    </button>
                  )}

                  {n.estadoID !== 4 && (
                    <button
                      onClick={() => eliminarNovedad(n.ID)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
                    >
                      Dar de baja
                    </button>
                  )}
                </div>

                {/* Modal inline para devolver con comentario */}
                {modalDevolverId === n.ID && (
                  <div className="w-full mt-3 p-4 bg-[#E7ECEF] rounded-lg border border-[#8B8C89]/30">
                    <label className="block text-xs font-bold text-[#274C77] mb-1">
                      Comentario u observaciones para el docente:
                    </label>
                    <textarea
                      rows={2}
                      value={comentarioDevolucion[n.ID] || ""}
                      onChange={(e) =>
                        setComentarioDevolucion({ ...comentarioDevolucion, [n.ID]: e.target.value })
                      }
                      placeholder="Indicá qué correcciones se deben realizar antes de publicar..."
                      className="w-full text-xs p-2 rounded bg-white border border-[#8B8C89]/30 text-[#0d1b2a] mb-2"
                    ></textarea>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setModalDevolverId(null)}
                        className="text-xs px-3 py-1 bg-white text-[#8B8C89] rounded border border-[#8B8C89]/30"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => cambiarEstado(n.ID, 2, comentarioDevolucion[n.ID])}
                        className="text-xs px-3 py-1 bg-amber-600 text-white font-semibold rounded hover:bg-amber-700"
                      >
                        Enviar Devolución
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getEstadoBadge(estadoId: number) {
  switch (estadoId) {
    case 1:
      return { label: "PENDIENTE", className: "bg-amber-100 text-amber-800 border border-amber-300" };
    case 2:
      return { label: "DEVUELTO", className: "bg-blue-100 text-blue-800 border border-blue-300" };
    case 3:
      return { label: "PUBLICADO", className: "bg-emerald-100 text-emerald-800 border border-emerald-300" };
    case 4:
      return { label: "ELIMINADO", className: "bg-gray-200 text-gray-700 border border-gray-400" };
    default:
      return { label: "DESCONOCIDO", className: "bg-gray-100 text-gray-600" };
  }
}

function getMockNovedades(): NovedadBackendItem[] {
  return [
    {
      ID: 1,
      titulo: "Feria de Ciencias & Tecnología 2026",
      cuerpo: "Los alumnos de 4° y 5° año presentarán sus proyectos de IoT y desarrollo de software.",
      autorNombre: "Prof. Ana Duarte",
      cuentaID: 2,
      estadoID: 1,
      estadoNombre: "Pendiente",
      asignaturaNombre: "Desarrollo Web & Apps",
      fechaDeCreacion: "2026-09-16T14:30:00Z",
    },
    {
      ID: 2,
      titulo: "Preinscripciones Abiertas Ciclo Lectivo 2027",
      cuerpo: "La Escuela Experimental ProA informa a la comunidad de San Francisco la apertura de vacantes.",
      autorNombre: "Dirección PRoA",
      cuentaID: 1,
      estadoID: 3,
      estadoNombre: "Publicado",
      fechaDeCreacion: "2026-09-10T09:00:00Z",
    },
  ];
}
