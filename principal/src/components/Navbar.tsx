import { useState } from "react";
import logoProa from "@/imports/image.png";
import { NAV_LINKS } from "@/data/constants";

interface NavbarProps {
  activeNav: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ activeNav, onNavigate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (link: string) => {
    onNavigate(link);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#274C77] text-white">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <button
          onClick={() => handleNavigate("Inicio")}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <img src={logoProa} alt="Logo PRoA" className="h-10 w-10 object-contain" />
          <div className="text-left">
            <p className="font-mono-code font-bold text-base leading-tight tracking-tight">Escuela PRoA</p>
            <p className="text-xs text-[#A3CEF1] leading-tight">Experimental Técnica · San Francisco</p>
          </div>
        </button>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              id={`nav-${link.toLowerCase().replace(/\s/g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
              onClick={() => handleNavigate(link)}
              className={`text-sm font-medium transition-colors hover:text-[#A3CEF1] ${
                activeNav === link ? "text-[#A3CEF1]" : "text-white/70"
              }`}
            >
              {link}
            </button>
          ))}
        </nav>

        {/* CTA desktop */}
        <button
          onClick={() => handleNavigate("Inicio")}
          className="hidden md:inline-flex items-center gap-2 bg-[#6096BA] text-white text-sm font-semibold px-4 py-2 rounded-sm hover:bg-[#A3CEF1] hover:text-[#274C77] transition-colors"
        >
          Preinscripción 2027
        </button>

        {/* Hamburger mobile */}
        <button
          id="nav-mobile-toggle"
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

      {/* Menú mobile */}
      {menuOpen && (
        <div className="md:hidden bg-[#1a3050] px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              onClick={() => handleNavigate(link)}
              className={`text-left text-sm transition-colors ${
                activeNav === link ? "text-white font-semibold" : "text-[#A3CEF1] hover:text-white"
              }`}
            >
              {link}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
