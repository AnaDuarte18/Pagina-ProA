import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import type { Empresa } from "@/types";
import {
  fetchAdminEmpresas,
  crearEmpresa,
  actualizarEmpresa,
  cambiarEstadoEmpresa,
} from "@/services/empresas.service";

export default function ListaEmpresas() {
  const { token } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  // Modal Crear / Editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");
  const [estadoEmpresaID, setEstadoEmpresaID] = useState<number>(1);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const cargarEmpresas = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminEmpresas(token);
      setEmpresas(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEmpresas();
  }, [token]);

  const abrirModalCrear = () => {
    setEmpresaEditando(null);
    setNombre("");
    setDescripcion("");
    setImagen("");
    setEstadoEmpresaID(1);
    setErrorModal(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (empresa: Empresa) => {
    setEmpresaEditando(empresa);
    setNombre(empresa.Nombre);
    setDescripcion(empresa.Descripcion || "");
    setImagen(empresa.imagen || "");
    setEstadoEmpresaID(empresa.estadoEmpresaID);
    setErrorModal(null);
    setModalAbierto(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorModal("El nombre de la empresa es obligatorio.");
      return;
    }

    setGuardando(true);
    setErrorModal(null);

    if (empresaEditando) {
      // Editar
      const res = await actualizarEmpresa(
        empresaEditando.ID,
        {
          Nombre: nombre.trim(),
          Descripcion: descripcion.trim() || undefined,
          imagen: imagen.trim() || undefined,
        },
        token
      );

      if (res.success) {
        // Si el estado también cambió en el modal
        if (estadoEmpresaID !== empresaEditando.estadoEmpresaID) {
          await cambiarEstadoEmpresa(empresaEditando.ID, estadoEmpresaID, token);
        }
        setModalAbierto(false);
        cargarEmpresas();
      } else {
        setErrorModal(res.error || "Error al actualizar empresa.");
      }
    } else {
      // Crear
      const res = await crearEmpresa(
        {
          Nombre: nombre.trim(),
          Descripcion: descripcion.trim() || undefined,
          imagen: imagen.trim() || undefined,
          estadoEmpresaID,
        },
        token
      );

      if (res.success) {
        setModalAbierto(false);
        cargarEmpresas();
      } else {
        setErrorModal(res.error || "Error al crear empresa.");
      }
    }

    setGuardando(false);
  };

  const handleCambiarEstado = async (id: number, nuevoEstado: number) => {
    const res = await cambiarEstadoEmpresa(id, nuevoEstado, token);
    if (res.success) {
      cargarEmpresas();
    } else {
      alert(res.error || "No se pudo cambiar el estado de la empresa.");
    }
  };

  const empresasFiltradas = empresas.filter((emp) => {
    const matchEstado =
      filtroEstado === "todos"
        ? true
        : emp.estadoEmpresaID === parseInt(filtroEstado, 10);

    const matchBusqueda =
      emp.Nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (emp.Descripcion && emp.Descripcion.toLowerCase().includes(busqueda.toLowerCase()));

    return matchEstado && matchBusqueda;
  });

  return (
    <div className="space-y-6">
      {/* Barra superior de herramientas y filtros */}
      <div className="bg-[#E7ECEF]/70 p-4 rounded-lg border border-[#8B8C89]/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#274C77] uppercase tracking-wider">Estado:</span>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded bg-white border border-[#8B8C89]/30 text-[#0d1b2a]"
            >
              <option value="todos">Todos los estados</option>
              <option value="1">Activa</option>
              <option value="2">Inactiva</option>
              <option value="3">Dada de baja</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full text-xs px-3.5 py-2 rounded-md bg-white border border-[#8B8C89]/30 text-[#0d1b2a] focus:outline-none focus:border-[#6096BA]"
            />
          </div>

          <button
            onClick={abrirModalCrear}
            className="bg-[#274C77] hover:bg-[#6096BA] text-white text-xs font-bold px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
          >
            <span>+</span> Nueva Empresa
          </button>
        </div>
      </div>

      {/* Listado de empresas */}
      {loading ? (
        <div className="text-center py-12 text-sm text-[#8B8C89]">Cargando empresas asociadas...</div>
      ) : empresasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[#8B8C89]/20 text-sm text-[#8B8C89]">
          No se encontraron empresas con los criterios seleccionados.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-[#8B8C89]/20 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#274C77] text-white font-bold">
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Logo / Imagen</th>
                <th className="p-3.5">Empresa</th>
                <th className="p-3.5">Descripción de Pasantía</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8B8C89]/15">
              {empresasFiltradas.map((emp) => {
                const badge = getEstadoEmpresaBadge(emp.estadoEmpresaID);
                return (
                  <tr key={emp.ID} className="hover:bg-[#E7ECEF]/40 transition-colors">
                    <td className="p-3.5 font-mono-code font-bold text-[#8B8C89]">#{emp.ID}</td>
                    <td className="p-3.5">
                      {emp.imagen ? (
                        <img
                          src={emp.imagen}
                          alt={emp.Nombre}
                          className="w-12 h-10 object-cover rounded border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[#8B8C89] font-bold text-xs">
                          🏢
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-[#274C77] text-sm whitespace-nowrap">
                      {emp.Nombre}
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">
                      {emp.Descripcion || <span className="text-[#8B8C89] italic">Sin descripción</span>}
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${badge.className}`}>
                        {emp.estadoNombre || badge.label}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {/* Editar */}
                      <button
                        onClick={() => abrirModalEditar(emp)}
                        className="bg-[#274C77] hover:bg-[#6096BA] text-white font-semibold px-2.5 py-1 rounded text-[11px] transition-colors"
                      >
                        Editar
                      </button>

                      {/* Botones de cambio de estado rápido */}
                      {emp.estadoEmpresaID !== 1 && (
                        <button
                          onClick={() => handleCambiarEstado(emp.ID, 1)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded text-[11px] transition-colors"
                          title="Marcar como Activa"
                        >
                          Activar
                        </button>
                      )}

                      {emp.estadoEmpresaID === 1 && (
                        <button
                          onClick={() => handleCambiarEstado(emp.ID, 2)}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-2.5 py-1 rounded text-[11px] transition-colors"
                          title="Marcar como Inactiva temporalmente"
                        >
                          Inactivar
                        </button>
                      )}

                      {emp.estadoEmpresaID !== 3 && (
                        <button
                          onClick={() => {
                            if (confirm(`¿Estás seguro de dar de baja a la empresa "${emp.Nombre}"?`)) {
                              handleCambiarEstado(emp.ID, 3);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-2.5 py-1 rounded text-[11px] transition-colors"
                          title="Dar de baja de la plataforma"
                        >
                          Dar de baja
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear / Editar Empresa */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#8B8C89]/20 mb-4">
              <h3 className="text-base font-bold text-[#274C77]">
                {empresaEditando ? `Editar Empresa #${empresaEditando.ID}` : "Nueva Empresa de Pasantías"}
              </h3>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {errorModal && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                {errorModal}
              </div>
            )}

            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#274C77] mb-1">Nombre de la Empresa *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Mercado Libre, Globant, etc."
                  className="w-full text-xs p-2.5 rounded border border-[#8B8C89]/30 focus:outline-none focus:border-[#6096BA] text-[#0d1b2a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#274C77] mb-1">Descripción del Perfil / Pasantía</label>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Área de tecnología, rubro, tareas o perfil requerido..."
                  className="w-full text-xs p-2.5 rounded border border-[#8B8C89]/30 focus:outline-none focus:border-[#6096BA] text-[#0d1b2a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#274C77] mb-1">URL de Logo / Imagen</label>
                <input
                  type="url"
                  value={imagen}
                  onChange={(e) => setImagen(e.target.value)}
                  placeholder="https://ejemplo.com/logo.jpg"
                  className="w-full text-xs p-2.5 rounded border border-[#8B8C89]/30 focus:outline-none focus:border-[#6096BA] text-[#0d1b2a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#274C77] mb-1">Estado de la Empresa</label>
                <select
                  value={estadoEmpresaID}
                  onChange={(e) => setEstadoEmpresaID(parseInt(e.target.value, 10))}
                  className="w-full text-xs p-2.5 rounded border border-[#8B8C89]/30 bg-white text-[#0d1b2a]"
                >
                  <option value={1}>1 - Activa (visible al público)</option>
                  <option value={2}>2 - Inactiva (temporal)</option>
                  <option value={3}>3 - Dada de baja</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#8B8C89]/20">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="text-xs px-5 py-2 bg-[#274C77] hover:bg-[#6096BA] disabled:bg-slate-300 text-white font-bold rounded transition-colors shadow-sm"
                >
                  {guardando ? "Guardando..." : empresaEditando ? "Guardar Cambios" : "Crear Empresa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getEstadoEmpresaBadge(estadoId: number) {
  switch (estadoId) {
    case 1:
      return { label: "Activa", className: "bg-emerald-100 text-emerald-800" };
    case 2:
      return { label: "Inactiva", className: "bg-amber-100 text-amber-800" };
    case 3:
      return { label: "Dada de baja", className: "bg-red-100 text-red-800" };
    default:
      return { label: "Desconocido", className: "bg-gray-100 text-gray-600" };
  }
}
