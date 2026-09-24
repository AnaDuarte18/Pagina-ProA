import { useState, useEffect } from "react";
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

/**
 * 1) y 2) Determina si debe mostrarse la pestaña de selección inicial de curso o solicitud docente:
 * - Debe ser la primera vez que ingresa.
 * - Si la cuenta ya tiene un curso asignado o tiene un rol mayor a alumno (Admin o Docente), NO mostrarla.
 * - Si ya envió la solicitud docente o completó la selección, NO mostrarla.
 */
function debeMostrarSeleccionInicial(u: User | null): boolean {
  if (!u) return false;
  // Rol mayor a alumno (Administrador = 1, Docente = 2): NO mostrar
  if (u.roleId < 3) return false;
  // Cuenta ya tiene curso asignado: NO mostrar
  if (u.cursoId || localStorage.getItem(`proa_user_curso_${u.id}`)) return false;
  // Ya tiene solicitud docente enviada: NO mostrar
  if (u.solicitudDocente) return false;
  // Ya completó la selección inicial anteriormente: NO mostrar
  if (localStorage.getItem(`proa_onboarding_completed_${u.id}`) === "true") return false;

  return true;
}

/**
 * Verifica si un usuario con rol Alumno y estado inactivo está bloqueado en la selección inicial.
 * Debe estar confinado hasta que seleccione curso o envíe solicitud docente.
 */
export function estaAlumnoBloqueadoEnSeleccion(u: User | null): boolean {
  if (!u) return false;
  // Solo aplica a usuarios con rol Alumno (3)
  if (u.roleId !== 3) return false;
  // Debe estar inactivo (estado distinto de Activo = 2)
  const isInactivo = u.estadoCuentaId !== 2;
  if (!isInactivo) return false;

  const tieneCurso = Boolean(u.cursoId || localStorage.getItem(`proa_user_curso_${u.id}`));
  const tieneSolicitudDocente = Boolean(
    u.solicitudDocente || localStorage.getItem(`proa_user_solicitud_docente_${u.id}`) === "true"
  );

  return !tieneCurso && !tieneSolicitudDocente;
}

/** Contenido principal separado en su propio componente para poder usar useAuth */
function AppContent() {
  const { user } = useAuth();

  // Función perezosa para inicializar el estado activo
  const [activeNav, setActiveNav] = useState(() => {
    // Intentamos leer el usuario del almacenamiento local si no tenemos el contexto aún (aunque deberíamos)
    let initialUser = user;
    if (!initialUser) {
      try {
        const stored = localStorage.getItem("proa_user");
        if (stored) initialUser = JSON.parse(stored);
      } catch {
        // Ignorar
      }
    }
    if (estaAlumnoBloqueadoEnSeleccion(initialUser)) {
      return "SeleccionInicial";
    }
    return "Inicio";
  });

  const bloqueado = estaAlumnoBloqueadoEnSeleccion(user);

  // 1) y 2) Redirección automática si el usuario es una cuenta nueva de alumno sin curso ni rol mayor
  useEffect(() => {
    if (bloqueado && activeNav !== "SeleccionInicial") {
      setActiveNav("SeleccionInicial");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (user && debeMostrarSeleccionInicial(user)) {
      const sessionShownKey = `proa_onboarding_shown_${user.id}`;
      if (!sessionStorage.getItem(sessionShownKey)) {
        sessionStorage.setItem(sessionShownKey, "true");
        setActiveNav("SeleccionInicial");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [user, activeNav, bloqueado]);

  // Alumnos en estado pendiente o rechazado tienen el mismo acceso base que un usuario sin sesión
  const isAlumnoSinAcceso =
    user?.roleId === 3 &&
    (user?.estadoCuentaId === 1 || user?.estadoCuentaId === 3 || user?.estadoCuentaId === 4);

  const tieneAccesoCompleto = !!user && !isAlumnoSinAcceso;

  const handleNavigate = (page: string) => {
    if (bloqueado && page !== "SeleccionInicial") {
      return; // Bloquear navegación
    }
    setActiveNav(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginSuccess = (loggedUser?: User) => {
    const u = loggedUser || user;
    if (estaAlumnoBloqueadoEnSeleccion(u)) {
      handleNavigate("SeleccionInicial");
    } else if (debeMostrarSeleccionInicial(u)) {
      if (u?.id) {
        sessionStorage.setItem(`proa_onboarding_shown_${u.id}`, "true");
      }
      handleNavigate("SeleccionInicial");
    } else {
      handleNavigate("Inicio");
    }
  };

  return (
    <div className="min-h-full bg-[#E7ECEF] text-[#0d1b2a]">
      {/* Modal de inicio de sesión con Google */}
      <LoginModal onLoginSuccess={handleLoginSuccess} />

      {/* Barra de navegación con roles y permisos */}
      <Navbar activeNav={activeNav} onNavigate={handleNavigate} />

      {/* Banner de aviso institucional */}
      {activeNav === "Inicio" && <BannerAviso />}

      {/* Router de páginas / vistas */}
      {activeNav === "Administrar" && user?.roleId === 1 ? (
        <AdminPanel />
      ) : activeNav === "Nuevo" && (user?.roleId === 1 || user?.roleId === 2) ? (
        <CrearPublicacion onPublicado={() => handleNavigate("Inicio")} />
      ) : activeNav === "SeleccionInicial" ? (
        /* 1) y 2) Pestaña inicial que aparece una sola vez tras login para cuentas de alumno sin curso ni rol mayor */
        <>
          <SeleccionCursoDocente onCompletado={() => handleNavigate("Inicio")} />
          <Footer onNavigate={handleNavigate} />
        </>
      ) : activeNav === "¿Sos docente?" && user?.roleId === 3 ? (
        /* 3) y 4) Pestaña explicativa y formulario de solicitud docente, exclusiva para usuarios con rol Alumno */
        <>
          <SolicitudDocente onVolver={() => handleNavigate("Inicio")} />
          <Footer onNavigate={handleNavigate} />
        </>
      ) : activeNav === "Material" && tieneAccesoCompleto ? (
        <Material />
      ) : activeNav === "Eventos" && tieneAccesoCompleto ? (
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
          <Footer onNavigate={handleNavigate} />
        </>
      ) : activeNav === "Académico" ? (
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
          {/* Materias incluye la sección de Pasantías con el componente Empresas */}
          <Materias />
          <OrientacionPrincipal />
          <Footer onNavigate={handleNavigate} />
        </>
      ) : activeNav === "Contacto" ? (
        <>
          <Contacto />
          <Footer onNavigate={handleNavigate} />
        </>
      ) : (
        /* Inicio — página principal con novedades destacadas */
        <>
          <Hero onNavigate={handleNavigate} />
          <Publicaciones />
          <OrientacionPrincipal />
          {/* El calendario solo es visible para usuarios autenticados con acceso activo */}
          {tieneAccesoCompleto && <Calendario />}
          <Footer onNavigate={handleNavigate} />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
