import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import type { EventoBackendItem } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface ListaEventosProps {
  onEditar?: (evento: EventoBackendItem) => void;
}

export default function ListaEventos({ onEditar }: ListaEventosProps) {
  const { token } = useAuth();
  const [eventos, setEventos] = useState<EventoBackendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [modalDevolverId, setModalDevolverId] = useState<number | null>(null);
  const [comentarioDevolucion, setComentarioDevolucion] = useState<{ [id: number]: string }>({});

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/eventos`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setEventos(data);
      } else {
        setEventos(getMockEventos());
      }
    } catch {
      setEventos(getMockEventos());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, [token]);

  const cambiarEstado = async (id: number, nuevoEstadoID: number, comentario?: string) => {
    try {
      const res = await fetch(`${BASE}/eventos/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estadoID: nuevoEstadoID, comentario: comentario || null }),
      });
      if (res.ok) {
        fetchEventos();
        setModalDevolverId(null);
      } else {
        alert("Error al actualizar estado del evento.");
      }
    } catch {
      alert("Error de conexión.");
    }
  };

  const eliminarEvento = async (id: number) => {
    if (!confirm("¿Seguro que querés dar de baja este evento?")) return;
    try {
      const res = await fetch(`${BASE}/eventos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) fetchEventos();
    } catch {
      alert("Error al eliminar.");
    }
  };

  const eventosFiltrados = eventos.filter((e) => {
    const matchEstado =
      filtroEstado === "todos"
        ? true
        : filtroEstado === "1"
        ? e.estadoID === 1
        : filtroEstado === "2"
        ? e.estadoID === 2
        : filtroEstado === "3"
        ? e.estadoID === 3
        : filtroEstado === "4"
        ? e.estadoID === 4
        : true;

    const matchBusqueda =
      e.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.cuerpo.toLowerCase().includes(busqueda.toLowerCase()) ||
      (e.autorNombre && e.autorNombre.toLowerCase().includes(busqueda.toLowerCase()));

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
              Todos ({eventos.length})
            </button>
            <button
              onClick={() => setFiltroEstado("1")}
              className={`px-3 py-1 rounded transition-colors ${
                filtroEstado === "1" ? "bg-amber-600 text-white font-bold" : "text-amber-800 hover:bg-amber-50"
              }`}
            >
              Pendientes ({eventos.filter((e) => e.estadoID === 1).length})
            </button>
            <button
              onClick={() => setFiltroEstado("3")}
              className={`px-3 py-1 rounded transition-colors ${
                filtroEstado === "3" ? "bg-emerald-600 text-white font-bold" : "text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              Publicados ({eventos.filter((e) => e.estadoID === 3).length})
            </button>
            <button
              onClick={() => setFiltroEstado("2")}
              className={`px-3 py-1 rounded transition-colors ${
                filtroEstado === "2" ? "bg-blue-600 text-white font-bold" : "text-blue-800 hover:bg-blue-50"
              }`}
            >
              Devueltos ({eventos.filter((e) => e.estadoID === 2).length})
            </button>
            <button
              onClick={() => setFiltroEstado("4")}
              className={`px-3 py-1 rounded transition-colors ${
                filtroEstado === "4" ? "bg-gray-600 text-white font-bold" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Eliminados ({eventos.filter((e) => e.estadoID === 4).length})
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar evento por título..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-xs px-3.5 py-2 rounded-md bg-white border border-[#8B8C89]/30 text-[#0d1b2a] focus:outline-none focus:border-[#6096BA]"
          />
        </div>
      </div>

      {/* Lista de Eventos */}
      {loading ? (
        <div className="text-center py-12 text-sm text-[#8B8C89]">Cargando eventos desde el servidor...</div>
      ) : eventosFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[#8B8C89]/20 text-sm text-[#8B8C89]">
          No hay eventos registrados con los criterios seleccionados.
        </div>
      ) : (
        <div className="space-y-4">
          {eventosFiltrados.map((ev) => {
            const estadoBadge = getEstadoBadge(ev.estadoID);
            return (
              <div
                key={ev.ID}
                className="bg-white rounded-lg p-5 border border-[#8B8C89]/20 shadow-sm hover:border-[#6096BA] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-mono-code font-bold px-2.5 py-0.5 rounded-full ${estadoBadge.className}`}>
                      {estadoBadge.label}
                    </span>
                    <span className="text-[10px] font-mono-code bg-[#6096BA]/15 text-[#274C77] px-2 py-0.5 rounded font-bold">
                      📅 {ev.fecha_publicacion ? ev.fecha_publicacion.substring(0, 10) : "Sin fecha"}
                    </span>
                    <span className="text-xs text-[#8B8C89]">
                      Autor: <strong>{ev.autorNombre || "Docente"}</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#274C77]">{ev.titulo}</h3>
                  <p className="text-xs text-[#0d1b2a]/80 line-clamp-2 leading-relaxed">{ev.cuerpo}</p>

                  {ev.comentarioAdmin && (
                    <div className="mt-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded">
                      <strong>Comentario admin:</strong> {ev.comentarioAdmin}
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {ev.estadoID === 1 && (
                    <>
                      <button
                        onClick={() => cambiarEstado(ev.ID, 3)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm"
                      >
                        Aprobar y Publicar
                      </button>
                      <button
                        onClick={() => setModalDevolverId(ev.ID)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm"
                      >
                        Devolver
                      </button>
                    </>
                  )}

                  {ev.estadoID === 2 && (
                    <button
                      onClick={() => cambiarEstado(ev.ID, 3)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm"
                    >
                      Aprobar
                    </button>
                  )}

                  {onEditar && (
                    <button
                      onClick={() => onEditar(ev)}
                      className="bg-[#274C77] hover:bg-[#6096BA] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors"
                    >
                      Editar
                    </button>
                  )}

                  {ev.estadoID !== 4 && (
                    <button
                      onClick={() => eliminarEvento(ev.ID)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
                    >
                      Dar de baja
                    </button>
                  )}
                </div>

                {modalDevolverId === ev.ID && (
                  <div className="w-full mt-3 p-4 bg-[#E7ECEF] rounded-lg border border-[#8B8C89]/30">
                    <label className="block text-xs font-bold text-[#274C77] mb-1">
                      Comentario u observaciones para el docente:
                    </label>
                    <textarea
                      rows={2}
                      value={comentarioDevolucion[ev.ID] || ""}
                      onChange={(e) =>
                        setComentarioDevolucion({ ...comentarioDevolucion, [ev.ID]: e.target.value })
                      }
                      placeholder="Motivo de la devolución del evento..."
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
                        onClick={() => cambiarEstado(ev.ID, 2, comentarioDevolucion[ev.ID])}
                        className="text-xs px-3 py-1 bg-amber-600 text-white font-semibold rounded hover:bg-amber-700"
                      >
                        Confirmar Devolución
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

function getMockEventos(): EventoBackendItem[] {
  return [
    {
      ID: 1,
      titulo: "Evaluación Práctica de Algoritmos",
      cuerpo: "Evaluación sobre estructuras condicionales y bucles en Python.",
      autorNombre: "Prof. Ana Duarte",
      cuentaID: 2,
      estadoID: 1,
      estadoNombre: "Pendiente",
      fecha_publicacion: "2026-09-22T08:00:00Z",
      fechaDeCreacion: "2026-09-16T11:00:00Z",
    },
    {
      ID: 2,
      titulo: "Jornada de Integración Estudiantil",
      cuerpo: "Actividades deportivas y de programación entre 1° y 4° año.",
      autorNombre: "Admin ProA",
      cuentaID: 1,
      estadoID: 3,
      estadoNombre: "Publicado",
      fecha_publicacion: "2026-09-25T09:00:00Z",
      fechaDeCreacion: "2026-09-12T10:00:00Z",
    },
  ];
}
