import { useState } from "react";
import { CLASIFICACIONES, ASIGNATURA_COLORS } from "@/data/constants";
import { useMateriales } from "@/hooks/useMateriales";

function PdfIcon() {
  return (
    <svg viewBox="0 0 40 48" fill="none" className="w-10 h-12 shrink-0">
      <rect width="40" height="48" rx="4" fill="#274C77" />
      <rect x="6" y="6" width="20" height="3" rx="1.5" fill="#A3CEF1" opacity="0.6" />
      <rect x="6" y="13" width="28" height="2" rx="1" fill="#A3CEF1" opacity="0.4" />
      <rect x="6" y="18" width="24" height="2" rx="1" fill="#A3CEF1" opacity="0.4" />
      <rect x="6" y="23" width="26" height="2" rx="1" fill="#A3CEF1" opacity="0.4" />
      <rect x="0" y="30" width="32" height="18" rx="3" fill="#6096BA" />
      <text x="16" y="43" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="monospace">
        PDF
      </text>
    </svg>
  );
}

function MaterialSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white border border-[#c0cdd7] rounded-sm animate-pulse flex flex-col h-full min-h-[300px]">
          <div className="p-5 border-b border-[#E7ECEF] flex items-start gap-4">
            <div className="w-10 h-12 bg-[#dae4ec] rounded shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-[#dae4ec] rounded w-3/4 mb-2" />
              <div className="h-4 bg-[#dae4ec] rounded w-1/2 mb-3" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-[#dae4ec] rounded-full" />
                <div className="h-5 w-20 bg-[#dae4ec] rounded-full" />
              </div>
            </div>
          </div>
          <div className="p-5 flex-1 flex flex-col gap-4">
            <div className="h-3 bg-[#dae4ec] rounded w-full" />
            <div className="h-3 bg-[#dae4ec] rounded w-5/6" />
            <div className="mt-auto flex flex-col gap-2">
              <div className="h-3 bg-[#dae4ec] rounded w-full" />
              <div className="h-3 bg-[#dae4ec] rounded w-full mb-2" />
              <div className="h-10 bg-[#dae4ec] rounded-sm w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Material() {
  const [filtroAsignatura, setFiltroAsignatura] = useState("Todas");
  const [filtroClasificacion, setFiltroClasificacion] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");

  const { data: materiales, loading, error } = useMateriales();

  const asignaturasDisponibles = ["Todas", ...Array.from(new Set((materiales || []).map((m) => m.asignatura)))];

  const filtrados = (materiales || []).filter((m) => {
    const matchAsig = filtroAsignatura === "Todas" || m.asignatura === filtroAsignatura;
    const matchClasif = filtroClasificacion === "Todas" || m.clasificacion === filtroClasificacion;
    const matchBusq =
      m.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    return matchAsig && matchClasif && matchBusq;
  });

  return (
    <div className="bg-[#E7ECEF] min-h-screen">
      {/* Cabecera */}
      <div className="bg-[#274C77] text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <p className="font-mono-code text-[#A3CEF1] text-xs mb-3">// material.filter(pdf =&gt; publicado)</p>
          <h1 className="font-display text-4xl md:text-5xl font-black mb-3">
            Biblioteca de<br />
            <span className="text-[#A3CEF1]">material pedagógico</span>
          </h1>
          <p className="text-white/70 text-base max-w-xl">
            PDFs y guías de lectura subidos por los docentes. Filtrá por materia o tipo de material para
            encontrar lo que necesitás.
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar filtros */}
          <aside className="w-full md:w-60 shrink-0 flex flex-col gap-6">
            {/* Búsqueda */}
            <div>
              <label className="font-mono-code text-[#6096BA] text-xs block mb-2">buscar</label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8C89]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  />
                </svg>
                <input
                  id="material-search"
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Título o descripción..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#c0cdd7] rounded-sm focus:outline-none focus:border-[#6096BA] text-[#0d1b2a] placeholder:text-[#8B8C89]"
                />
              </div>
            </div>

            {/* Filtro asignatura */}
            <div>
              <p className="font-mono-code text-[#6096BA] text-xs mb-2">asignatura</p>
              <div className="flex flex-col gap-1">
                {asignaturasDisponibles.map((a) => (
                  <button
                    key={a}
                    onClick={() => setFiltroAsignatura(a)}
                    className={`text-left text-sm px-3 py-2 rounded-sm border transition-colors ${
                      filtroAsignatura === a
                        ? "bg-[#274C77] text-white border-[#274C77]"
                        : "bg-white text-[#0d1b2a] border-[#c0cdd7] hover:border-[#6096BA]"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro clasificación */}
            <div>
              <p className="font-mono-code text-[#6096BA] text-xs mb-2">clasificación</p>
              <div className="flex flex-col gap-1">
                {CLASIFICACIONES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFiltroClasificacion(c)}
                    className={`text-left text-sm px-3 py-2 rounded-sm border transition-colors ${
                      filtroClasificacion === c
                        ? "bg-[#274C77] text-white border-[#274C77]"
                        : "bg-white text-[#0d1b2a] border-[#c0cdd7] hover:border-[#6096BA]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Limpiar filtros */}
            {(filtroAsignatura !== "Todas" || filtroClasificacion !== "Todas" || busqueda) && (
              <button
                id="material-clear-filters"
                onClick={() => {
                  setFiltroAsignatura("Todas");
                  setFiltroClasificacion("Todas");
                  setBusqueda("");
                }}
                className="font-mono-code text-xs text-[#6096BA] hover:text-[#274C77] transition-colors text-left"
              >
                ← limpiar filtros
              </button>
            )}
          </aside>

          {/* Grid de tarjetas */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="font-mono-code text-[#8B8C89] text-xs">
                {loading ? "Cargando..." : `${filtrados.length} resultado${filtrados.length !== 1 ? "s" : ""}`}
              </p>
            </div>

            {loading && <MaterialSkeleton />}

            {error && (
              <div className="border border-red-200 bg-red-50 rounded-sm p-6 text-center">
                <p className="font-mono-code text-red-500 text-xs mb-1">// error al cargar materiales</p>
                <p className="text-red-700 text-sm">{error.message}</p>
              </div>
            )}

            {!loading && !error && filtrados.length === 0 && (
              <div className="bg-white border border-[#c0cdd7] rounded-sm p-16 text-center">
                <p className="font-mono-code text-[#6096BA] text-sm mb-2">// 404 — sin resultados</p>
                <p className="text-[#8B8C89] text-sm">
                  No hay materiales que coincidan con los filtros seleccionados.
                </p>
              </div>
            )}

            {!loading && !error && filtrados.length > 0 && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtrados.map((m) => (
                  <div
                    key={m.id}
                    className="group bg-white border border-[#c0cdd7] rounded-sm hover:border-[#6096BA] transition-colors flex flex-col h-full"
                  >
                    {/* Cabecera de tarjeta */}
                    <div className="p-5 border-b border-[#E7ECEF] flex items-start gap-4">
                      <PdfIcon />
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-base leading-snug group-hover:text-[#274C77] transition-colors line-clamp-2">
                          {m.titulo}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              ASIGNATURA_COLORS[m.asignatura] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {m.asignatura}
                          </span>
                          <span
                            className={`font-mono-code text-xs px-2 py-0.5 rounded-full border ${
                              m.clasificacion === "Pedagógico"
                                ? "border-[#274C77]/30 text-[#274C77] bg-[#274C77]/5"
                                : "border-[#6096BA]/40 text-[#6096BA] bg-[#6096BA]/5"
                            }`}
                          >
                            {m.clasificacion}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cuerpo */}
                    <div className="p-5 flex-1 flex flex-col gap-4">
                      <p className="text-[#8B8C89] text-sm leading-relaxed line-clamp-3">{m.descripcion}</p>

                      {/* Meta */}
                      <div className="flex flex-col gap-1 mt-auto">
                        <div className="flex items-center justify-between text-xs text-[#8B8C89]">
                          <span>{m.docente}</span>
                          <span className="font-mono-code">{m.paginas} págs.</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#8B8C89]">
                          <span className="font-mono-code truncate">{m.archivo}</span>
                          <span className="ml-2 whitespace-nowrap">{m.fecha}</span>
                        </div>
                      </div>

                      {/* Botón descargar */}
                      <button className="w-full mt-1 bg-[#274C77] text-white text-sm font-semibold py-2.5 rounded-sm hover:bg-[#6096BA] transition-colors flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Descargar PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
