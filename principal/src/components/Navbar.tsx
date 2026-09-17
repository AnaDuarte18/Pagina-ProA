import { useState, useRef, useEffect } from "react";
import logoProa from "@/imports/image.png";
import { NAV_LINKS } from "@/data/constants";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  activeNav: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ activeNav, onNavigate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout, openLoginModal } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (link: string) => {
    onNavigate(link);
    setMenuOpen(false);
  };

  // Cerrar menú desplegable al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#274C77] text-white">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <button
          onClick={() => handleNavigate("Inicio")}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity text-left"
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

        {/* Acciones derecha desktop */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => handleNavigate("Inicio")}
            className="inline-flex items-center gap-2 bg-[#6096BA] text-white text-sm font-semibold px-4 py-2 rounded-sm hover:bg-[#A3CEF1] hover:text-[#274C77] transition-colors"
          >
            Preinscripción 2027
          </button>

          {/* Autenticación / Perfil */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                aria-expanded={userDropdownOpen}
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-white/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#6096BA] text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left leading-tight pr-1">
                  <p className="text-xs font-semibold max-w-[110px] truncate">{user.name}</p>
                  <span className="text-[10px] font-mono-code text-[#A3CEF1] bg-[#1a3050] px-1.5 py-0.2 rounded inline-block">
                    {user.role || "Alumno"}
                  </span>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-[#A3CEF1] transition-transform ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Menú desplegable de usuario */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-[#0d1b2a] rounded-md shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold truncate text-[#1a3050]">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-[11px] font-medium text-slate-600 capitalize">
                        {user.role || "Alumno"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              id="btn-login"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-3.5 py-2 rounded-sm border border-white/20 hover:border-white/40 transition-colors"
            >
              <svg className="w-4 h-4 text-[#A3CEF1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Iniciar sesión
            </button>
          )}
        </div>

        {/* Hamburger mobile */}
        <button
          id="nav-mobile-toggle"
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Menú mobile */}
      {menuOpen && (
        <div className="md:hidden bg-[#1a3050] px-6 py-4 flex flex-col gap-4 border-t border-white/10">
          {/* Usuario en móvil */}
          {user ? (
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#6096BA] text-white font-bold text-sm flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
                  <p className="text-xs text-[#A3CEF1] leading-tight">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="text-xs text-red-300 hover:text-red-100 bg-red-950/40 px-2.5 py-1.5 rounded border border-red-800/40"
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                openLoginModal();
                setMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-white/15 text-white py-2.5 rounded font-medium text-sm border border-white/20"
            >
              <svg className="w-4 h-4 text-[#A3CEF1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Iniciar sesión con Google
            </button>
          )}

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

          <button
            onClick={() => handleNavigate("Inicio")}
            className="w-full text-center bg-[#6096BA] text-white text-sm font-semibold py-2.5 rounded-sm hover:bg-[#A3CEF1] hover:text-[#274C77] transition-colors"
          >
            Preinscripción 2027
          </button>
        </div>
      )}
    </header>
  );
}
