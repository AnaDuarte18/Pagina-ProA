import { useState } from "react";
import logoProa from "@/imports/image.png";

const NAV_LINKS = ["Inicio", "Académico", "Programación", "Material", "Actividades", "Noticias", "Contacto"];

const CODE_SNIPPET = `def bienvenida(nombre):
    return f"Hola, {nombre}!"

# Escuela PRoA -- San Francisco
print(bienvenida("futuro dev"))`;

const NOTICIAS = [
  {
    tag: "Tecnología",
    fecha: "22 ago 2026",
    titulo: "Alumnos de 5.° año ganan el hackathon provincial con una app de gestión escolar",
    img: "https://images.unsplash.com/photo-1598981457915-aea220950616?w=600&h=400&fit=crop&auto=format",
    alt: "Estudiante programando",
  },
  {
    tag: "Deporte",
    fecha: "18 ago 2026",
    titulo: "El equipo de fútbol femenino clasifica al campeonato regional",
    img: "https://images.unsplash.com/photo-1525088068454-ff2c453e50e9?w=600&h=400&fit=crop&auto=format",
    alt: "Chicas jugando fútbol",
  },
  {
    tag: "Comunidad",
    fecha: "10 ago 2026",
    titulo: "Robots solidarios: nuestros alumnos automatizan el comedor escolar",
    img: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&h=400&fit=crop&auto=format",
    alt: "Docente con alumnos",
  },
];

const EVENTOS = [
  { mes: "SEP", dia: "05", nombre: "Inicio del 2.º cuatrimestre", hora: "07:30 hs", tipo: "Académico" },
  { mes: "SEP", dia: "12", nombre: "Hackathon inter-PRoA — sede San Francisco", hora: "09:00 hs", tipo: "Tech" },
  { mes: "SEP", dia: "20", nombre: "Demo Day: proyectos de programación 5.° año", hora: "18:00 hs", tipo: "Tech" },
  { mes: "OCT", dia: "03", nombre: "Jornada de orientación vocacional — STEM", hora: "09:00 hs", tipo: "Orientación" },
  { mes: "OCT", dia: "17", nombre: "Expo Tecnología & Sociedad", hora: "10:00 hs", tipo: "Expo" },
];

const MATERIAS = [
  {
    icono: "{ }",
    mono: true,
    nombre: "Programación",
    desc: "Python, JavaScript y lógica computacional desde 1.° año. Proyectos reales desde el primer cuatrimestre.",
    badge: "eje troncal",
  },
  {
    icono: "[ ]",
    mono: true,
    nombre: "Pensamiento Computacional",
    desc: "Algoritmos, estructuras de datos y resolución de problemas complejos con enfoque práctico.",
    badge: "eje troncal",
  },
  {
    icono: "</>",
    mono: true,
    nombre: "Desarrollo Web",
    desc: "HTML, CSS, React y despliegue en la nube. De la maqueta al sitio publicado.",
    badge: "",
  },
  {
    icono: "f(x)",
    mono: true,
    nombre: "Matemática",
    desc: "Álgebra, geometría y estadística con énfasis en aplicaciones en ciencias de datos.",
    badge: "",
  },
  {
    icono: "~/",
    mono: true,
    nombre: "Robótica & IoT",
    desc: "Arduino, Raspberry Pi y sensores: construimos sistemas físico-digitales en el laboratorio.",
    badge: "",
  },
  {
    icono: "ssh",
    mono: true,
    nombre: "Seguridad Informática",
    desc: "Fundamentos de ciberseguridad, privacidad y uso ético de la tecnología.",
    badge: "",
  },
];

const STACK = [
  { name: "Python", color: "#3b82f6" },
  { name: "JavaScript", color: "#eab308" },
  { name: "HTML & CSS", color: "#f97316" },
  { name: "React", color: "#06b6d4" },
  { name: "Arduino", color: "#10b981" },
  { name: "SQL", color: "#8b5cf6" },
  { name: "Git", color: "#ef4444" },
  { name: "Linux", color: "#6b7280" },
];

const TAG_COLORS: Record<string, string> = {
  Tecnología: "bg-blue-100 text-blue-800",
  Deporte: "bg-green-100 text-green-800",
  Comunidad: "bg-amber-100 text-amber-800",
  Tech: "bg-blue-900 text-blue-100",
  Orientación: "bg-rose-100 text-rose-800",
  Expo: "bg-purple-100 text-purple-800",
  Académico: "bg-slate-100 text-slate-700",
};

const ASIGNATURA_COLORS: Record<string, string> = {
  Programación: "bg-blue-100 text-blue-800",
  "Desarrollo Web": "bg-cyan-100 text-cyan-800",
  Matemática: "bg-violet-100 text-violet-800",
  "Pensamiento Computacional": "bg-indigo-100 text-indigo-800",
  "Robótica & IoT": "bg-green-100 text-green-800",
  "Seguridad Informática": "bg-rose-100 text-rose-800",
};

const MATERIALES = [
  {
    id: 1,
    titulo: "Introducción a Python — Unidad 1",
    descripcion: "Variables, tipos de datos, operadores y estructuras de control básicas. Ejercicios resueltos.",
    asignatura: "Programación",
    clasificacion: "Pedagógico",
    docente: "Prof. García, M.",
    fecha: "15 ago 2026",
    paginas: 24,
    archivo: "intro-python-u1.pdf",
  },
  {
    id: 2,
    titulo: "Funciones y recursividad en Python",
    descripcion: "Definición de funciones, parámetros, retorno, alcance y ejemplos de recursividad.",
    asignatura: "Programación",
    clasificacion: "Pedagógico",
    docente: "Prof. García, M.",
    fecha: "28 ago 2026",
    paginas: 18,
    archivo: "python-funciones.pdf",
  },
  {
    id: 3,
    titulo: "Clean Code — Resumen capítulos 1 a 4",
    descripcion: "Extracto adaptado del libro de Robert C. Martin para uso en clase. Solo lectura.",
    asignatura: "Programación",
    clasificacion: "Lectura",
    docente: "Prof. García, M.",
    fecha: "02 sep 2026",
    paginas: 31,
    archivo: "clean-code-resumen.pdf",
  },
  {
    id: 4,
    titulo: "Fundamentos de HTML y CSS",
    descripcion: "Estructura de una página web, etiquetas semánticas, selectores CSS y modelo de caja.",
    asignatura: "Desarrollo Web",
    clasificacion: "Pedagógico",
    docente: "Prof. Romero, L.",
    fecha: "10 ago 2026",
    paginas: 36,
    archivo: "html-css-fundamentos.pdf",
  },
  {
    id: 5,
    titulo: "Flexbox y Grid — Guía práctica",
    descripcion: "Layouts modernos con CSS Flexbox y CSS Grid. Casos de uso y ejercicios.",
    asignatura: "Desarrollo Web",
    clasificacion: "Pedagógico",
    docente: "Prof. Romero, L.",
    fecha: "22 ago 2026",
    paginas: 20,
    archivo: "flexbox-grid.pdf",
  },
  {
    id: 6,
    titulo: "Álgebra lineal aplicada a la IA",
    descripcion: "Vectores, matrices y transformaciones. Lectura complementaria sobre aplicaciones en machine learning.",
    asignatura: "Matemática",
    clasificacion: "Lectura",
    docente: "Prof. Díaz, C.",
    fecha: "05 sep 2026",
    paginas: 44,
    archivo: "algebra-lineal-ia.pdf",
  },
  {
    id: 7,
    titulo: "Introducción a Arduino — Guía de laboratorio",
    descripcion: "Configuración del entorno, primeros sketches, control de LEDs y sensores básicos.",
    asignatura: "Robótica & IoT",
    clasificacion: "Pedagógico",
    docente: "Prof. Fernández, R.",
    fecha: "18 ago 2026",
    paginas: 28,
    archivo: "arduino-laboratorio.pdf",
  },
  {
    id: 8,
    titulo: "OWASP Top 10 — Lectura obligatoria",
    descripcion: "Las diez vulnerabilidades más críticas de aplicaciones web según OWASP. Material de referencia.",
    asignatura: "Seguridad Informática",
    clasificacion: "Lectura",
    docente: "Prof. Torres, A.",
    fecha: "01 sep 2026",
    paginas: 52,
    archivo: "owasp-top10.pdf",
  },
];

const ASIGNATURAS = ["Todas", ...Array.from(new Set(MATERIALES.map((m) => m.asignatura)))];
const CLASIFICACIONES = ["Todas", "Pedagógico", "Lectura"];

function PdfIcon() {
  return (
    <svg viewBox="0 0 40 48" fill="none" className="w-10 h-12 shrink-0">
      <rect width="40" height="48" rx="4" fill="#274C77" />
      <rect x="6" y="6" width="20" height="3" rx="1.5" fill="#A3CEF1" opacity="0.6" />
      <rect x="6" y="13" width="28" height="2" rx="1" fill="#A3CEF1" opacity="0.4" />
      <rect x="6" y="18" width="24" height="2" rx="1" fill="#A3CEF1" opacity="0.4" />
      <rect x="6" y="23" width="26" height="2" rx="1" fill="#A3CEF1" opacity="0.4" />
      <rect x="0" y="30" width="32" height="18" rx="3" fill="#6096BA" />
      <text x="16" y="43" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="monospace">PDF</text>
    </svg>
  );
}

function MaterialPage() {
  const [filtroAsignatura, setFiltroAsignatura] = useState("Todas");
  const [filtroClasificacion, setFiltroClasificacion] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");

  const filtrados = MATERIALES.filter((m) => {
    const matchAsig = filtroAsignatura === "Todas" || m.asignatura === filtroAsignatura;
    const matchClasif = filtroClasificacion === "Todas" || m.clasificacion === filtroClasificacion;
    const matchBusq = m.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    return matchAsig && matchClasif && matchBusq;
  });

  return (
    <div className="bg-[#E7ECEF] min-h-screen">
      {/* Cabecera de sección */}
      <div className="bg-[#274C77] text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <p className="font-mono-code text-[#A3CEF1] text-xs mb-3">// material.filter(pdf =&gt; publicado)</p>
          <h1 className="font-display text-4xl md:text-5xl font-black mb-3">
            Biblioteca de<br />
            <span className="text-[#A3CEF1]">material pedagógico</span>
          </h1>
          <p className="text-white/70 text-base max-w-xl">
            PDFs y guías de lectura subidos por los docentes. Filtrá por materia o tipo de material para encontrar lo que necesitás.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* Sidebar filtros */}
          <aside className="w-full md:w-60 shrink-0 flex flex-col gap-6">
            {/* Búsqueda */}
            <div>
              <label className="font-mono-code text-[#6096BA] text-xs block mb-2">buscar</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8C89]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
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
                {ASIGNATURAS.map((a) => (
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

            {/* Reset */}
            {(filtroAsignatura !== "Todas" || filtroClasificacion !== "Todas" || busqueda) && (
              <button
                onClick={() => { setFiltroAsignatura("Todas"); setFiltroClasificacion("Todas"); setBusqueda(""); }}
                className="font-mono-code text-xs text-[#6096BA] hover:text-[#274C77] transition-colors text-left"
              >
                ← limpiar filtros
              </button>
            )}
          </aside>

          {/* Grid de tarjetas */}
          <div className="flex-1 min-w-0">
            {/* Contador */}
            <div className="flex items-center justify-between mb-6">
              <p className="font-mono-code text-[#8B8C89] text-xs">
                {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filtrados.length === 0 ? (
              <div className="bg-white border border-[#c0cdd7] rounded-sm p-16 text-center">
                <p className="font-mono-code text-[#6096BA] text-sm mb-2">// 404 — sin resultados</p>
                <p className="text-[#8B8C89] text-sm">No hay materiales que coincidan con los filtros seleccionados.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtrados.map((m) => (
                  <div
                    key={m.id}
                    className="group bg-white border border-[#c0cdd7] rounded-sm hover:border-[#6096BA] transition-colors flex flex-col"
                  >
                    {/* Cabecera de tarjeta */}
                    <div className="p-5 border-b border-[#E7ECEF] flex items-start gap-4">
                      <PdfIcon />
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-base leading-snug group-hover:text-[#274C77] transition-colors line-clamp-2">
                          {m.titulo}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ASIGNATURA_COLORS[m.asignatura] || "bg-slate-100 text-slate-700"}`}>
                            {m.asignatura}
                          </span>
                          <span className={`font-mono-code text-xs px-2 py-0.5 rounded-full border ${
                            m.clasificacion === "Pedagógico"
                              ? "border-[#274C77]/30 text-[#274C77] bg-[#274C77]/5"
                              : "border-[#6096BA]/40 text-[#6096BA] bg-[#6096BA]/5"
                          }`}>
                            {m.clasificacion}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cuerpo */}
                    <div className="p-5 flex-1 flex flex-col gap-4">
                      <p className="text-[#8B8C89] text-sm leading-relaxed line-clamp-3">
                        {m.descripcion}
                      </p>

                      {/* Meta */}
                      <div className="flex flex-col gap-1 mt-auto">
                        <div className="flex items-center justify-between text-xs text-[#8B8C89]">
                          <span>{m.docente}</span>
                          <span className="font-mono-code">{m.paginas} págs.</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#8B8C89]">
                          <span className="font-mono-code">{m.archivo}</span>
                          <span>{m.fecha}</span>
                        </div>
                      </div>

                      {/* Botón descargar */}
                      <button className="w-full mt-1 bg-[#274C77] text-white text-sm font-semibold py-2.5 rounded-sm hover:bg-[#6096BA] transition-colors flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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

function CodeWindow({ code }: { code: string }) {
  return (
    <div className="rounded-sm overflow-hidden border border-[#A3CEF1]/30 shadow-xl bg-[#0d1b2a]">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#1a3050] border-b border-white/10">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <span className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-3 text-xs text-[#A3CEF1] font-mono-code">main.py — PRoA</span>
      </div>
      <pre className="p-5 text-sm leading-relaxed font-mono-code text-[#A3CEF1] overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Inicio");

  return (
    <div className="min-h-full bg-[#E7ECEF] text-[#0d1b2a]">

      {/* NAV */}
      <header className="sticky top-0 z-50 bg-[#274C77] text-white">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={logoProa} alt="Logo PRoA" className="h-10 w-10 object-contain" />
            <div>
              <p className="font-mono-code font-bold text-base leading-tight tracking-tight">Escuela PRoA</p>
              <p className="text-xs text-[#A3CEF1] leading-tight">Experimental Técnica · San Francisco</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => setActiveNav(link)}
                className={`text-sm font-medium transition-colors hover:text-[#A3CEF1] ${
                  activeNav === link ? "text-[#A3CEF1]" : "text-white/70"
                }`}
              >
                {link}
              </button>
            ))}
          </nav>

          <a
            href="#inscripcion"
            onClick={() => setActiveNav("Inicio")}
            className="hidden md:inline-flex items-center gap-2 bg-[#6096BA] text-white text-sm font-semibold px-4 py-2 rounded-sm hover:bg-[#A3CEF1] hover:text-[#274C77] transition-colors"
          >
            Preinscripción 2027
          </a>

          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#1a3050] px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => { setActiveNav(link); setMenuOpen(false); }}
                className="text-left text-sm text-[#A3CEF1] hover:text-white transition-colors"
              >
                {link}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* AVISO — solo en Inicio */}
      {activeNav === "Inicio" && (
        <div className="bg-[#6096BA] text-white">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4 text-sm">
            <span className="font-mono-code font-bold text-xs shrink-0 bg-white/20 px-2 py-0.5 rounded">AVISO</span>
            <p>Preinscripción 2027 abierta del <strong>1 al 30 de octubre</strong>. Cupos limitados. Completá el formulario o acercate a la secretaría.</p>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      {activeNav === "Material" ? (
        <MaterialPage />
      ) : (
        <>
          {/* HERO */}
          <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#274C77]">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(#A3CEF1 1px, transparent 1px), linear-gradient(90deg, #A3CEF1 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#274C77] via-[#274C77]/90 to-[#6096BA]/40" />

            <div className="relative max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center w-full">
              <div>
                <h1 className="font-display text-5xl md:text-7xl text-white font-black leading-[0.9] mb-6">
                  Aprendé a<br />
                  <em className="not-italic text-[#A3CEF1]">construir</em><br />
                  el futuro
                </h1>
                <p className="text-[#A3CEF1]/80 text-lg leading-relaxed max-w-md mb-8">
                  La única escuela secundaria experimental con orientación en programación de San Francisco. Egresás con habilidades reales del siglo XXI.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="#inscripcion"
                    id="inscripcion"
                    className="bg-[#6096BA] text-white font-semibold px-6 py-3 rounded-sm hover:bg-[#A3CEF1] hover:text-[#274C77] transition-colors"
                  >
                    Preinscripción 2027
                  </a>
                  <a
                    href="#programacion"
                    className="border border-[#A3CEF1]/40 text-[#A3CEF1] font-semibold px-6 py-3 rounded-sm hover:border-[#A3CEF1] transition-colors"
                  >
                    Ver plan de estudios →
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-12">
                  {[
                    { valor: "5", label: "años de cursada" },
                    { valor: "800+", label: "egresados" },
                    { valor: "12", label: "lenguajes enseñados" },
                  ].map(({ valor, label }) => (
                    <div key={label} className="border border-white/10 bg-white/5 rounded-sm p-4 text-center">
                      <p className="font-display font-black text-3xl text-white">{valor}</p>
                      <p className="text-[#A3CEF1]/70 text-xs mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden md:block">
                <CodeWindow code={CODE_SNIPPET} />
                <div className="mt-4 flex flex-wrap gap-2">
                  {STACK.slice(0, 6).map((s) => (
                    <span
                      key={s.name}
                      className="font-mono-code text-xs px-3 py-1 rounded-full bg-white/10 text-[#A3CEF1] border border-[#A3CEF1]/20"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN PROGRAMACIÓN */}
          <section id="programacion" className="bg-[#0d1b2a] text-white py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <p className="font-mono-code text-[#6096BA] text-xs mb-2">// orientación principal</p>
                  <h2 className="font-display text-4xl md:text-5xl font-black">
                    Programación<br />
                    <span className="text-[#A3CEF1]">desde el primer año</span>
                  </h2>
                </div>
                <p className="text-[#8B8C89] max-w-sm text-sm leading-relaxed">
                  No es un taller optativo. La programación es el eje central de nuestra propuesta educativa, integrada a todas las materias.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mb-14">
                {STACK.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-sm px-4 py-2 hover:border-[#6096BA]/50 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="font-mono-code text-sm text-[#A3CEF1]">{s.name}</span>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    año: "1.° y 2.° año",
                    titulo: "Fundamentos",
                    items: ["Lógica y algoritmos", "Python básico e intermedio", "Introducción a la web", "Control de versiones con Git"],
                  },
                  {
                    año: "3.° y 4.° año",
                    titulo: "Desarrollo",
                    items: ["JavaScript & React", "Bases de datos SQL", "Arduino y robótica", "Proyectos colaborativos"],
                  },
                  {
                    año: "5.° año",
                    titulo: "Proyecto final",
                    items: ["Desarrollo de producto completo", "Seguridad y testing", "Demo Day público", "Vinculación con empresas"],
                  },
                ].map((fase, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-sm p-6 hover:border-[#6096BA]/40 transition-colors">
                    <p className="font-mono-code text-[#6096BA] text-xs mb-1">{fase.año}</p>
                    <h3 className="font-display font-bold text-xl text-white mb-4">{fase.titulo}</h3>
                    <ul className="flex flex-col gap-2">
                      {fase.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-[#A3CEF1]/80">
                          <span className="font-mono-code text-[#6096BA] text-xs">→</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* NOTICIAS */}
          <section id="noticias" className="max-w-7xl mx-auto px-6 py-20">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="font-mono-code text-[#6096BA] text-xs mb-2">// últimas publicaciones</p>
                <h2 className="font-display text-4xl md:text-5xl font-black">Noticias<br />de la escuela</h2>
              </div>
              <a href="#" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-[#274C77] hover:text-[#6096BA] transition-colors">
                Ver todas →
              </a>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {NOTICIAS.map((n, i) => (
                <article
                  key={i}
                  className="group bg-white rounded-sm overflow-hidden border border-[#c0cdd7] hover:border-[#6096BA] transition-colors cursor-pointer"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-[#dae4ec]">
                    <img
                      src={n.img}
                      alt={n.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TAG_COLORS[n.tag]}`}>{n.tag}</span>
                      <span className="text-xs text-[#8B8C89]">{n.fecha}</span>
                    </div>
                    <h3 className="font-display font-bold text-lg leading-snug group-hover:text-[#274C77] transition-colors">
                      {n.titulo}
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* EVENTOS */}
          <section className="bg-[#274C77] text-white">
            <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-start">
              <div>
                <p className="font-mono-code text-[#A3CEF1] text-xs mb-2">// calendar.push(evento)</p>
                <h2 className="font-display text-4xl md:text-5xl font-black mb-10">Próximos<br />eventos</h2>

                <div className="flex flex-col gap-4">
                  {EVENTOS.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-5 p-5 border border-white/10 rounded-sm hover:border-[#A3CEF1]/40 transition-colors cursor-pointer group"
                    >
                      <div className="shrink-0 text-center w-12">
                        <p className="font-mono-code text-[#A3CEF1] text-xs font-bold">{e.mes}</p>
                        <p className="font-display font-black text-3xl leading-none">{e.dia}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold leading-snug group-hover:text-[#A3CEF1] transition-colors">{e.nombre}</p>
                        <p className="font-mono-code text-[#8B8C89] text-xs mt-1">{e.hora}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${TAG_COLORS[e.tipo] || "bg-white/10 text-white"}`}>
                        {e.tipo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative rounded-sm overflow-hidden bg-[#0d1b2a] h-full min-h-[420px] flex flex-col justify-between">
                <img
                  src="https://images.unsplash.com/photo-1613896527026-f195d5c818ed?w=800&h=500&fit=crop&auto=format"
                  alt="Edificio PRoA San Francisco"
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
                <div className="relative p-8 flex-1 flex flex-col justify-end">
                  <div className="mb-6">
                    <img src={logoProa} alt="Logo PRoA" className="h-20 w-20 object-contain opacity-90" />
                  </div>
                  <p className="font-display text-2xl font-bold text-white leading-snug">
                    "El código que escribís hoy<br />es el producto de mañana."
                  </p>
                  <p className="font-mono-code text-[#8B8C89] text-xs mt-3">— Dirección pedagógica, PRoA San Francisco</p>
                </div>
              </div>
            </div>
          </section>

          {/* ÁREAS ACADÉMICAS */}
          <section id="academico" className="max-w-7xl mx-auto px-6 py-20">
            <div className="mb-12">
              <p className="font-mono-code text-[#6096BA] text-xs mb-2">// import Materias from "./plan_estudios"</p>
              <h2 className="font-display text-4xl md:text-5xl font-black">Áreas de<br />conocimiento</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MATERIAS.map((m, i) => (
                <div
                  key={i}
                  className="group p-7 border border-[#c0cdd7] rounded-sm bg-white hover:border-[#274C77] transition-colors cursor-pointer relative overflow-hidden"
                >
                  {m.badge && (
                    <span className="absolute top-4 right-4 text-xs font-semibold bg-[#274C77] text-white px-2 py-0.5 rounded-full">
                      {m.badge}
                    </span>
                  )}
                  <span className={`mb-4 block ${m.mono ? "font-mono-code text-[#274C77] text-2xl font-bold" : "text-3xl"}`}>
                    {m.icono}
                  </span>
                  <h3 className="font-display font-bold text-xl mb-2 group-hover:text-[#274C77] transition-colors">
                    {m.nombre}
                  </h3>
                  <p className="text-[#8B8C89] text-sm leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* VIDA ESTUDIANTIL */}
          <section className="bg-[#dae4ec]">
            <div className="max-w-7xl mx-auto px-6 py-20">
              <div className="mb-12">
                <p className="font-mono-code text-[#6096BA] text-xs mb-2">// vida.map(actividad =&gt; render)</p>
                <h2 className="font-display text-4xl md:text-5xl font-black">Vida<br />estudiantil</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative rounded-sm overflow-hidden h-72 bg-[#c0cdd7]">
                  <img
                    src="https://images.unsplash.com/photo-1525088068454-ff2c453e50e9?w=900&h=500&fit=crop&auto=format"
                    alt="Actividades deportivas"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#274C77]/80 to-transparent flex items-end p-8">
                    <div>
                      <p className="text-white font-display font-bold text-2xl">Más allá del código</p>
                      <p className="text-[#A3CEF1] text-sm mt-1">Deportes, arte y cultura en nuestra comunidad</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {[
                    { titulo: "Club de Programación", desc: "Reuniones semanales, competencias y proyectos open source." },
                    { titulo: "Centro de estudiantes", desc: "Representación activa. Alumnos que lideran." },
                  ].map((item, i) => (
                    <div key={i} className="flex-1 bg-white rounded-sm p-6 border border-[#c0cdd7] hover:border-[#274C77] transition-colors cursor-pointer group">
                      <h3 className="font-display font-bold text-lg group-hover:text-[#274C77] transition-colors">{item.titulo}</h3>
                      <p className="text-[#8B8C89] text-sm mt-2">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="relative overflow-hidden bg-[#274C77] text-white">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(#A3CEF1 1px, transparent 1px), linear-gradient(90deg, #A3CEF1 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <p className="font-mono-code text-[#A3CEF1] text-xs mb-3">// ¿empezamos?</p>
                <h2 className="font-display font-black text-4xl md:text-5xl leading-tight mb-3">
                  ¿Querés aprender<br />a programar?
                </h2>
                <p className="text-[#A3CEF1]/80 text-lg">Preinscripción abierta del 1 al 30 de octubre de 2026.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <a href="#" className="bg-[#A3CEF1] text-[#274C77] font-bold px-8 py-4 rounded-sm hover:bg-white transition-colors text-center">
                  Formulario online
                </a>
                <a href="#" className="border border-[#A3CEF1]/40 text-white font-bold px-8 py-4 rounded-sm hover:border-[#A3CEF1] transition-colors text-center">
                  Más información
                </a>
              </div>
            </div>
          </section>
        </>
      )}

      {/* FOOTER */}
      <footer className="bg-[#0d1b2a] text-[#8B8C89]">
        <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logoProa} alt="Logo PRoA" className="h-10 w-10 object-contain" />
              <div>
                <p className="text-white font-display font-bold text-base">Escuela PRoA</p>
                <p className="text-xs leading-tight">Experimental Técnica · San Francisco</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Av. San Martín 1456, San Francisco, Córdoba<br />
              Tel: (03564) 42-0000<br />
              <span className="font-mono-code text-xs">secretaria@proa.edu.ar</span>
            </p>
          </div>

          <div>
            <p className="text-white text-xs font-bold uppercase tracking-wider mb-4">Navegación</p>
            <ul className="flex flex-col gap-2 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l}>
                  <button
                    onClick={() => setActiveNav(l)}
                    className="hover:text-white transition-colors text-left"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white text-xs font-bold uppercase tracking-wider mb-4">Institucional</p>
            <ul className="flex flex-col gap-2 text-sm">
              {["Historia", "Equipo directivo", "Proyecto PRoA", "Transparencia"].map((l) => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between text-xs">
            <p>© 2026 Escuela PRoA San Francisco. Todos los derechos reservados.</p>
            <p className="font-mono-code">Ministerio de Educación · Córdoba</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
