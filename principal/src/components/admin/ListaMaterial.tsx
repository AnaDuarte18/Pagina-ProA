import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import type { MaterialBackendItem } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface ListaMaterialProps {
  onEditar?: (material: MaterialBackendItem) => void;
}

export default function ListaMaterial({ onEditar }: ListaMaterialProps) {
  const { token } = useAuth();
  const [materiales, setMateriales] = useState<MaterialBackendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [modalDevolverId, setModalDevolverId] = useState<number | null>(null);
  const [comentarioDevolucion, setComentarioDevolucion] = useState<{ [id: number]: string }>({});

  const fetchMateriales = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/materiales`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setMateriales(data);
      } else {
        setMateriales(getMockMateriales());
      }
    } catch {
      setMateriales(getMockMateriales());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateriales();
  }, [token]);

  const cambiarEstado = async (id: number, nuevoEstadoID: number, comentario?: string) => {
    try {
      const res = await fetch(`${BASE}/materiales/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estadoID: nuevoEstadoID, comentario: comentario || null }),
      });
      if (res.ok) {
        fetchMateriales();
        setModalDevolverId(null);
      } else {
        alert("Error al actualizar estado del material.");
      }
    } catch {
      alert("Error de conexión.");
    }
  };

  const eliminarMaterial = async (id: number) => {
    if (!confirm("¿Seguro que querés dar de baja este material?")) return;
    try {
      const res = await fetch(`${BASE}/materiales/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) fetchMateriales();
    } catch {
      alert("Error al eliminar.");
    }
  };

  const materialesFiltrados = materiales.filter((m) => {
    const matchEstado =
      filtroEstado === "todos"
        ? true
        : filtroEstado === "1"
        ? m.estadoID === 1
        : filtroEstado === "2"
        ? m.estadoID === 2
        : filtroEstado === "3"
        ? m.estadoID === 3
        : filtroEstado === "4"
        ? m.estadoID === 4
        : true;

    const matchBusqueda =
      m.Titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      (m.descripcion && m.descripcion.toLowerCase().includes(busqueda.toLowerCase())) ||
      (m.autorNombre && m.autorNombre.toLowerCase().includes(busqueda.toLowerCase()));

    return matchEstado && matchBusqueda;
  });

  return (
    <div className="space-y-6">
      {/* Filtros */}
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
              Todos ({materiales.length})
            </button>
            <button
              onClick={() => setFiltroEstado("1")}
              className={`px-3 py-1 rounded transition-colors ${
                filtroEstado === "1" ? "bg-amber-600 text-white font-bold" : "text-amber-800 hover:bg-amber-50"
              }`}
            >
              Pendientes ({materiales.filter((m) => m.estadoID === 1).length})
            </button>
            <button
              onClick={() => setFiltroEstado("3")}
              className={`px-3 py-1 rounded transition-colors ${
                filtroEstado === "3" ? "bg-emerald-600 text-white font-bold" : "text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              Publicados ({materiales.filter((m) => m.estadoID === 3).length})
            </button>
            <button
              onClick={() => setFiltroEstado("2")}
              className={`px-3 py-1 rounded transition-colors ${
                filtroEstado === "2" ? "bg-blue-600 text-white font-bold" : "text-blue-800 hover:bg-blue-50"
              }`}
            >
              Devueltos ({materiales.filter((m) => m.estadoID === 2).length})
            </button>
            <button
              onClick={() => setFiltroEstado("4")}
              className={`px-3 py-1 rounded transition-colors ${
                filtroEstado === "4" ? "bg-gray-600 text-white font-bold" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Eliminados ({materiales.filter((m) => m.estadoID === 4).length})
            </button>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar material o autor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-xs px-3.5 py-2 rounded-md bg-white border border-[#8B8C89]/30 text-[#0d1b2a] focus:outline-none focus:border-[#6096BA]"
          />
        </div>
      </div>

      {/* Lista de Materiales */}
      {loading ? (
        <div className="text-center py-12 text-sm text-[#8B8C89]">Cargando materiales desde el servidor...</div>
      ) : materialesFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[#8B8C89]/20 text-sm text-[#8B8C89]">
          No hay materiales registrados con los filtros actuales.
        </div>
      ) : (
        <div className="space-y-4">
          {materialesFiltrados.map((m) => {
            const estadoBadge = getEstadoBadge(m.estadoID);
            return (
              <div
                key={m.ID}
                className="bg-white rounded-lg p-5 border border-[#8B8C89]/20 shadow-sm hover:border-[#6096BA] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-mono-code font-bold px-2.5 py-0.5 rounded-full ${estadoBadge.className}`}>
                      {estadoBadge.label}
                    </span>
                    {m.clasificacionNombre && (
                      <span className="text-[10px] font-mono-code bg-[#E7ECEF] text-[#274C77] px-2 py-0.5 rounded font-bold">
                        {m.clasificacionNombre}
                      </span>
                    )}
                    <span className="text-xs text-[#8B8C89]">
                      Subido por <strong>{m.autorNombre || "Docente"}</strong> · {m.fechaDeCreacion ? m.fechaDeCreacion.substring(0, 10) : "Reciente"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#274C77]">{m.Titulo}</h3>
                  <p className="text-xs text-[#0d1b2a]/80 line-clamp-2 leading-relaxed">{m.descripcion}</p>

                  <div className="pt-1">
                    <a
                      href={m.archivo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#6096BA] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Ver / Descargar archivo
                    </a>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {m.estadoID === 1 && (
                    <>
                      <button
                        onClick={() => cambiarEstado(m.ID, 3)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm"
                      >
                        Aprobar y Publicar
                      </button>
                      <button
                        onClick={() => setModalDevolverId(m.ID)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm"
                      >
                        Devolver
                      </button>
                    </>
                  )}

                  {m.estadoID === 2 && (
                    <button
                      onClick={() => cambiarEstado(m.ID, 3)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm"
                    >
                      Aprobar
                    </button>
                  )}

                  {onEditar && (
                    <button
                      onClick={() => onEditar(m)}
                      className="bg-[#274C77] hover:bg-[#6096BA] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors"
                    >
                      Editar
                    </button>
                  )}

                  {m.estadoID !== 4 && (
                    <button
                      onClick={() => eliminarMaterial(m.ID)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
                    >
                      Dar de baja
                    </button>
                  )}
                </div>

                {modalDevolverId === m.ID && (
                  <div className="w-full mt-3 p-4 bg-[#E7ECEF] rounded-lg border border-[#8B8C89]/30">
                    <label className="block text-xs font-bold text-[#274C77] mb-1">
                      Comentario u observaciones para el docente:
                    </label>
                    <textarea
                      rows={2}
                      value={comentarioDevolucion[m.ID] || ""}
                      onChange={(e) =>
                        setComentarioDevolucion({ ...comentarioDevolucion, [m.ID]: e.target.value })
                      }
                      placeholder="Motivo de la devolución del material..."
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
                        onClick={() => cambiarEstado(m.ID, 2, comentarioDevolucion[m.ID])}
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

function getMockMateriales(): MaterialBackendItem[] {
  return [
    {
      ID: 1,
      Titulo: "Guía de Algoritmos y Diagramas de Flujo",
      descripcion: "Material introductorio para 1° año.",
      archivo: "https://ejemplo.com/guia1.pdf",
      autorNombre: "Prof. Ana Duarte",
      cuentaID: 2,
      estadoID: 1,
      estadoNombre: "Pendiente",
      clasificacionID: 1,
      clasificacionNombre: "Cuadernillo",
      fechaDeCreacion: "2026-09-15T15:00:00Z",
    },
    {
      ID: 2,
      Titulo: "Manual de Referencia React 19 & Tailwind",
      descripcion: "Documentación para el desarrollo del proyecto final de 4° año.",
      archivo: "https://ejemplo.com/react-ref.pdf",
      autorNombre: "Admin ProA",
      cuentaID: 1,
      estadoID: 3,
      estadoNombre: "Publicado",
      clasificacionID: 2,
      clasificacionNombre: "Material de clase",
      fechaDeCreacion: "2026-09-08T10:00:00Z",
    },
  ];
}
