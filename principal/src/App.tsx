import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OrientacionPrincipal from "@/components/OrientacionPrincipal";
import Publicaciones from "@/components/Publicaciones";
import Calendario from "@/components/Calendario";
import Materias from "@/components/Materias";
import Material from "@/components/Material";
import Footer from "@/components/Footer";

export default function App() {
  const [activeNav, setActiveNav] = useState("Inicio");

  const handleNavigate = (page: string) => {
    setActiveNav(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-full bg-[#E7ECEF] text-[#0d1b2a]">
      {/* Barra de navegación */}
      <Navbar activeNav={activeNav} onNavigate={handleNavigate} />

      {/* AVISO*/}
      {activeNav === "Inicio" && (
        <div className="bg-[#6096BA] text-white">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4 text-sm">
            <span className="font-mono-code font-bold text-xs shrink-0 bg-white/20 px-2 py-0.5 rounded">
              AVISO
            </span>
            <p>
              Preinscripción 2027 abierta del <strong>1 al 30 de octubre</strong>. Cupos limitados.
              Completá el formulario o acercate a la secretaría.
            </p>
          </div>
        </div>
      )}

      {/* Router de páginas */}
      {activeNav === "Material" ? (
        <Material />
      ) : activeNav === "Programación" ? (
        <>
          <OrientacionPrincipal />
          <Footer onNavigate={handleNavigate} />
        </>
      ) : activeNav === "Académico" ? (
        <>
          <Materias />
          <Footer onNavigate={handleNavigate} />
        </>
      ) : activeNav === "Noticias" ? (
        <>
          <div className="bg-[#274C77] text-white">
            <div className="max-w-7xl mx-auto px-6 py-14">
              <p className="font-mono-code text-[#A3CEF1] text-xs mb-3">// noticias.filter(publicado)</p>
              <h1 className="font-display text-4xl md:text-5xl font-black">
                Noticias<br />
                <span className="text-[#A3CEF1]">de la escuela</span>
              </h1>
            </div>
          </div>
          <Publicaciones />
          <Footer onNavigate={handleNavigate} />
        </>
      ) : activeNav === "Actividades" ? (
        <>
          <Calendario />
          <Footer onNavigate={handleNavigate} />
        </>
      ) : activeNav === "Contacto" ? (
        <Footer onNavigate={handleNavigate} />
      ) : (
        /* Inicio — página completa */
        <>
          <Hero onNavigate={handleNavigate} />
          <OrientacionPrincipal />
          <Publicaciones />
          <Calendario />
          <Materias />
          <Footer onNavigate={handleNavigate} />
        </>
      )}
    </div>
  );
}
