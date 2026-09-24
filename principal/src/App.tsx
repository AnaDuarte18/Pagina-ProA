import { useState } from "react";
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
import { AuthProvider } from "@/context/AuthContext";

export default function App() {
  const [activeNav, setActiveNav] = useState("Inicio");

  const handleNavigate = (page: string) => {
    setActiveNav(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AuthProvider>
      <div className="min-h-full bg-[#E7ECEF] text-[#0d1b2a]">
        {/* Modal de inicio de sesión con Google */}
        <LoginModal />

        {/* Barra de navegación con roles y permisos */}
        <Navbar activeNav={activeNav} onNavigate={handleNavigate} />

        {/* Banner de aviso institucional */}
        {activeNav === "Inicio" && <BannerAviso />}

        {/* Router de páginas / vistas */}
        {activeNav === "Administrar" ? (
          <AdminPanel />
        ) : activeNav === "Nuevo" ? (
          <CrearPublicacion onPublicado={() => handleNavigate("Inicio")} />
        ) : activeNav === "Material" ? (
          <Material />
        ) : activeNav === "Eventos" ? (
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
            <Materias />
            <OrientacionPrincipal />
            <Footer onNavigate={handleNavigate} />
          </>
        ) : activeNav === "Contacto" ? (
          <Contacto />
        ) : (
          /* Inicio — página principal con novedades destacadas */
          <>
            <Hero onNavigate={handleNavigate} />
            <Publicaciones />
            <OrientacionPrincipal />
            <Calendario />
            <Footer onNavigate={handleNavigate} />
          </>
        )}
      </div>
    </AuthProvider>
  );
}
