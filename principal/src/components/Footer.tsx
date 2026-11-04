import { useNavigate } from "react-router-dom";
import logoProa from "@/imports/image.png";
import { NAV_LINKS } from "@/data/constants";
import { pageToPath } from "@/App";

export default function Footer() {
  const navigate = useNavigate();

  const enlacesInstitucionales = [
    { label: "Historia", path: "/historia" },
    { label: "Propuesta Académica", path: "/academico" },
    { label: "Contacto", path: "/contacto" },
  ];

  return (
    <footer className="bg-[#0d1b2a] text-[#8B8C89]">
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
        {/* Logo e info de contacto */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoProa} alt="Logo PRoA" className="h-10 w-10 object-contain" />
            <div>
              <p className="text-white font-display font-bold text-base">Escuela PRoA</p>
              <p className="text-xs leading-tight">Experimental Técnica · San Francisco</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            Las Guayanas 533, San Francisco, Córdoba<br />
            Tel: (03564) 59-6752<br />
            <span className="font-mono-code text-xs">sanfrancisco.tec@escuelasproa.edu.ar</span>
          </p>
        </div>

        {/* Navegación */}
        <div>
          <p className="text-white text-xs font-bold uppercase tracking-wider mb-4">Navegación</p>
          <ul className="flex flex-col gap-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l}>
                <button
                  onClick={() => navigate(pageToPath(l))}
                  className="hover:text-white transition-colors text-left"
                >
                  {l}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Institucional */}
        <div>
          <p className="text-white text-xs font-bold uppercase tracking-wider mb-4">Institucional</p>
          <ul className="flex flex-col gap-2 text-sm">
            {enlacesInstitucionales.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className="hover:text-white transition-colors text-left"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between text-xs">
          <p className="font-mono-code">Ministerio de Educación · Córdoba</p>
        </div>
      </div>
    </footer>
  );
}
