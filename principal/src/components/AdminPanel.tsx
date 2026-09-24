import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ListaNovedades from "./admin/ListaNovedades";
import ListaEventos from "./admin/ListaEventos";
import ListaMaterial from "./admin/ListaMaterial";
import ListaCuentas from "./admin/ListaCuentas";
import CrearPublicacion from "./CrearPublicacion";

type TabAdmin = "novedades" | "eventos" | "material" | "cuentas";

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabAdmin>("novedades");
  const [editandoObjeto, setEditandoObjeto] = useState<{ tipo: "novedad" | "evento" | "material"; objeto: any } | null>(null);

  // Seguridad en frontend (y backend en las llamadas API)
  if (!user || user.roleId !== 1) {
    return (
      <div className="bg-[#E7ECEF] min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-md border border-[#8B8C89]/20 max-w-md text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#274C77] mb-2">Acceso Restringido</h2>
          <p className="text-xs text-[#8B8C89] leading-relaxed">
            Esta sección es exclusiva para el personal de <strong>Administración</strong> de Escuela PRoA.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#E7ECEF] min-h-[calc(100vh-4rem)] py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Cabecera del Panel */}
        <div className="bg-[#274C77] text-white p-8 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="font-mono-code text-[#A3CEF1] text-xs font-semibold uppercase tracking-wider block mb-1">
              // Control Central de Plataforma
            </span>
            <h1 className="text-2xl md:text-3xl font-black">Panel de Administración</h1>
            <p className="text-[#E7ECEF]/80 text-xs md:text-sm mt-1">
              Revisá solicitudes docentes, aprobá publicaciones, gestioná el historial y administrá roles de usuario.
            </p>
          </div>

          {/* Navegación por pestañas */}
          <div className="inline-flex bg-[#1a3050] p-1.5 rounded-lg border border-white/15 overflow-x-auto self-start md:self-auto">
            <button
              onClick={() => {
                setActiveTab("novedades");
                setEditandoObjeto(null);
              }}
              className={`text-xs font-bold px-3.5 py-2 rounded-md transition-all whitespace-nowrap ${
                activeTab === "novedades" && !editandoObjeto
                  ? "bg-[#6096BA] text-white shadow-sm"
                  : "text-[#A3CEF1] hover:text-white"
              }`}
            >
              Novedades
            </button>
            <button
              onClick={() => {
                setActiveTab("eventos");
                setEditandoObjeto(null);
              }}
              className={`text-xs font-bold px-3.5 py-2 rounded-md transition-all whitespace-nowrap ${
                activeTab === "eventos" && !editandoObjeto
                  ? "bg-[#6096BA] text-white shadow-sm"
                  : "text-[#A3CEF1] hover:text-white"
              }`}
            >
              Eventos
            </button>
            <button
              onClick={() => {
                setActiveTab("material");
                setEditandoObjeto(null);
              }}
              className={`text-xs font-bold px-3.5 py-2 rounded-md transition-all whitespace-nowrap ${
                activeTab === "material" && !editandoObjeto
                  ? "bg-[#6096BA] text-white shadow-sm"
                  : "text-[#A3CEF1] hover:text-white"
              }`}
            >
              Material
            </button>
            <button
              onClick={() => {
                setActiveTab("cuentas");
                setEditandoObjeto(null);
              }}
              className={`text-xs font-bold px-3.5 py-2 rounded-md transition-all whitespace-nowrap ${
                activeTab === "cuentas" && !editandoObjeto
                  ? "bg-[#6096BA] text-white shadow-sm"
                  : "text-[#A3CEF1] hover:text-white"
              }`}
            >
              Cuentas
            </button>
          </div>
        </div>

        {/* Modal/Sección de Edición en Vivo */}
        {editandoObjeto ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setEditandoObjeto(null)}
                className="text-xs font-bold text-[#6096BA] hover:underline flex items-center gap-1.5"
              >
                ← Volver al listado
              </button>
            </div>
            <CrearPublicacion
              objetoEditar={editandoObjeto.objeto}
              tipoInicial={editandoObjeto.tipo}
              onPublicado={() => setEditandoObjeto(null)}
            />
          </div>
        ) : (
          /* Render de la pestaña activa */
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-md border border-[#8B8C89]/20">
            {activeTab === "novedades" && (
              <ListaNovedades
                onEditar={(novedad) => setEditandoObjeto({ tipo: "novedad", objeto: novedad })}
              />
            )}

            {activeTab === "eventos" && (
              <ListaEventos
                onEditar={(evento) => setEditandoObjeto({ tipo: "evento", objeto: evento })}
              />
            )}

            {activeTab === "material" && (
              <ListaMaterial
                onEditar={(mat) => setEditandoObjeto({ tipo: "material", objeto: mat })}
              />
            )}

            {activeTab === "cuentas" && <ListaCuentas />}
          </div>
        )}
      </div>
    </div>
  );
}
