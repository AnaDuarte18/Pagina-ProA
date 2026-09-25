import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OrientacionPrincipal from "@/components/OrientacionPrincipal";
import Publicaciones from "@/components/Publicaciones";
import Calendario from "@/components/Calendario";
import Materias from "@/components/Materias";
import Material from "@/components/Material";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import BannerAviso from "@/components/BannerAviso";
import Contacto from "@/components/Contacto";
import CrearPublicacion from "@/components/CrearPublicacion";
import AdminPanel from "@/components/AdminPanel";
import SeleccionCursoDocente from "@/components/SeleccionCursoDocente";
import SolicitudDocente from "@/components/SolicitudDocente";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import type { User } from "@/types";
import TablaNovedades from "@/components/TablaNovedades";
import NovedadDetalle from "@/components/NovedadDetalle";
import EventoDetalle from "@/components/EventoDetalle";

// ─── Helpers de acceso ────────────────────────────────────────────────────────

/**
 * Determina si debe mostrarse la pestaña de selección inicial de curso o solicitud docente
 * (primera vez que un alumno sin curso accede).
 */
export function debeMostrarSeleccionInicial(u: User | null): boolean {
  if (!u) return false;
  if (u.roleId < 3) return false;
  if (u.cursoId || localStorage.getItem(`proa_user_curso_${u.id}`)) return false;
  if (u.solicitudDocente) return false;
  if (localStorage.getItem(`proa_onboarding_completed_${u.id}`) === "true") return false;
  return true;
}

/**
 * Verifica si un alumno inactivo sin curso ni solicitud está bloqueado en la selección inicial.
 */
export function estaAlumnoBloqueadoEnSeleccion(u: User | null): boolean {
  if (!u) return false;
  if (u.roleId !== 3) return false;
  if (u.estadoCuentaId === 2) return false; // activo → no bloqueado

  const tieneCurso = Boolean(u.cursoId || localStorage.getItem(`proa_user_curso_${u.id}`));
  const tieneSolicitudDocente = Boolean(
    u.solicitudDocente || localStorage.getItem(`proa_user_solicitud_docente_${u.id}`) === "true"
  );
  return !tieneCurso && !tieneSolicitudDocente;
}

// ─── Layout compartido ────────────────────────────────────────────────────────

function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const bloqueado = estaAlumnoBloqueadoEnSeleccion(user);

  // Redirigir al login de selección si el usuario está bloqueado
  const location = useLocation();
  useEffect(() => {
    if (bloqueado && location.pathname !== "/seleccion-inicial") {
      navigate("/seleccion-inicial", { replace: true });
    }
  }, [bloqueado, location.pathname, navigate]);

  const handleLoginSuccess = (loggedUser?: User) => {
    const u = loggedUser || user;
    if (estaAlumnoBloqueadoEnSeleccion(u)) {
      navigate("/seleccion-inicial", { replace: true });
    } else if (debeMostrarSeleccionInicial(u)) {
      if (u?.id) sessionStorage.setItem(`proa_onboarding_shown_${u.id}`, "true");
      navigate("/seleccion-inicial", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-full bg-[#E7ECEF] text-[#0d1b2a]">
      <LoginModal onLoginSuccess={handleLoginSuccess} />
      <Navbar bloqueado={bloqueado} />
      {children}
    </div>
  );
}

// ─── Páginas ──────────────────────────────────────────────────────────────────

function PaginaInicio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAlumnoSinAcceso =
    user?.roleId === 3 &&
    (user?.estadoCuentaId === 1 || user?.estadoCuentaId === 3 || user?.estadoCuentaId === 4);
  const tieneAccesoCompleto = !!user && !isAlumnoSinAcceso;

  return (
    <>
      <BannerAviso />
      <Hero />
      <Publicaciones />
      <OrientacionPrincipal />
      {tieneAccesoCompleto && <Calendario />}
      <Footer />
    </>
  );
}

function PaginaAcademico() {
  return (
    <>
      <div className="bg-[#274C77] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <span className="font-mono-code text-[#A3CEF1] text-xs font-semibold uppercase tracking-wider block mb-2">
            // Áreas de Conocimiento & Orientación
          </span>
          <h1 className="text-3xl md:text-5xl font-black">
            Propuesta <span className="text-[#A3CEF1]">Académica</span>
          </h1>
          <p className="text-[#E7ECEF]/80 text-xs md:text-sm mt-2 max-w-2xl">
            Formación técnica intensiva en Programación articulada con asignaturas formativas y pedagógicas.
          </p>
        </div>
      </div>
      <Materias />
      <OrientacionPrincipal />
      <Footer />
    </>
  );
}

function PaginaEventos() {
  const { user } = useAuth();
  const isAlumnoSinAcceso =
    user?.roleId === 3 &&
    (user?.estadoCuentaId === 1 || user?.estadoCuentaId === 3 || user?.estadoCuentaId === 4);
  const tieneAccesoCompleto = !!user && !isAlumnoSinAcceso;

  if (!tieneAccesoCompleto) return <Navigate to="/" replace />;

  return (
    <>
      <div className="bg-[#274C77] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <span className="font-mono-code text-[#A3CEF1] text-xs font-semibold uppercase tracking-wider block mb-2">
            // Calendario Escolar & Fechas Clave
          </span>
          <h1 className="text-3xl md:text-5xl font-black">
            Eventos <span className="text-[#A3CEF1]">Académicos</span>
          </h1>
          <p className="text-[#E7ECEF]/80 text-xs md:text-sm mt-2 max-w-2xl">
            Consultá las fechas de actividades, entregas y talleres habilitados para tu curso.
          </p>
        </div>
      </div>
      <Calendario />
      <Footer />
    </>
  );
}

function PaginaMaterial() {
  const { user } = useAuth();
  const isAlumnoSinAcceso =
    user?.roleId === 3 &&
    (user?.estadoCuentaId === 1 || user?.estadoCuentaId === 3 || user?.estadoCuentaId === 4);
  const tieneAccesoCompleto = !!user && !isAlumnoSinAcceso;

  if (!tieneAccesoCompleto) return <Navigate to="/" replace />;

  return <Material />;
}

function PaginaContacto() {
  return (
    <>
      <Contacto />
      <Footer />
    </>
  );
}

function PaginaNuevo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user || (user.roleId !== 1 && user.roleId !== 2)) return <Navigate to="/" replace />;
  return <CrearPublicacion onPublicado={() => navigate("/")} />;
}

function PaginaAdministrar() {
  const { user } = useAuth();
  if (!user || user.roleId !== 1) return <Navigate to="/" replace />;
  return <AdminPanel />;
}

function PaginaSeleccionInicial() {
  const navigate = useNavigate();
  return (
    <>
      <SeleccionCursoDocente onCompletado={() => navigate("/", { replace: true })} />
      <Footer />
    </>
  );
}

function PaginaSosDocente() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user || user.roleId !== 3) return <Navigate to="/" replace />;
  return (
    <>
      <SolicitudDocente onVolver={() => navigate("/")} />
      <Footer />
    </>
  );
}

// ─── Mapeo nombre → path (para componentes heredados con onNavigate) ──────────

export function pageToPath(page: string): string {
  const map: Record<string, string> = {
    "Inicio": "/",
    "Académico": "/academico",
    "Eventos": "/eventos",
    "Novedades": "/novedades",
    "Material": "/material",
    "Contacto": "/contacto",
    "Nuevo": "/nuevo",
    "Administrar": "/administrar",
    "SeleccionInicial": "/seleccion-inicial",
    "¿Sos docente?": "/sos-docente",
  };
  return map[page] ?? "/";
}

// ─── App root ─────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PaginaInicio />} />
        <Route path="/academico" element={<PaginaAcademico />} />
        <Route path="/eventos" element={<PaginaEventos />} />
        <Route path="/material" element={<PaginaMaterial />} />
        <Route path="/contacto" element={<PaginaContacto />} />
        <Route path="/nuevo" element={<PaginaNuevo />} />
        <Route path="/administrar" element={<PaginaAdministrar />} />
        <Route path="/seleccion-inicial" element={<PaginaSeleccionInicial />} />
        <Route path="/sos-docente" element={<PaginaSosDocente />} />
        <Route path="/novedades" element={<TablaNovedades />} />
        <Route path="/novedades/:id" element={<NovedadDetalle />} />
        <Route path="/eventos/:id" element={<EventoDetalle />} />
        {/* Cualquier ruta desconocida va a inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
