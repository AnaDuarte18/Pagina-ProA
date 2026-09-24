import { useState, useRef, useEffect } from "react";
import logoProa from "@/imports/image.png";
import { useAuth } from "@/context/AuthContext";
import NotificacionesBox from "./NotificacionesBox";

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

  // Determinar los enlaces según el estado y rol del usuario
  const getNavLinks = () => {
    if (!user) {
      // Usuario NO INICIÓ SESIÓN
      return ["Inicio", "Académico", "Contacto"];
    }

    if (user.roleId === 3) {
      // Usuario ALUMNO
      return ["Inicio", "Académico", "Eventos", "Material", "Contacto"];
    }

    if (user.roleId === 2) {
      // Usuario DOCENTE
      return ["Inicio", "Académico", "Eventos", "Material", "Contacto", "Nuevo"];
    }

    if (user.roleId === 1) {
      // Usuario ADMIN
      return ["Inicio", "Académico", "Eventos", "Material", "Contacto", "Nuevo", "Administrar"];
    }

    // Default seguro
    return ["Inicio", "Académico", "Contacto"];
  };

  const links = getNavLinks();

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
    <header className="sticky top-0 z-50 bg-[#274C77] text-white shadow-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <button
          onClick={() => handleNavigate("Inicio")}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity text-left shrink-0"
        >
          <img src={logoProa} alt="Logo PRoA" className="h-10 w-10 object-contain" />
          <div className="text-left">
            <p className="font-mono-code font-bold text-base leading-tight tracking-tight text-white">Escuela PRoA</p>
            <p className="text-xs text-[#A3CEF1] leading-tight font-medium">Experimental Técnica · San Francisco</p>
          </div>
        </button>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7">
          {links.map((link) => {
            const isActive = activeNav === link;
            return (
              <button
                key={link}
                id={`nav-${link.toLowerCase()}`}
                onClick={() => handleNavigate(link)}
                className={`text-xs lg:text-sm font-semibold transition-all px-1 py-1 relative ${
                  isActive ? "text-[#A3CEF1]" : "text-white/80 hover:text-white"
                }`}
              >
                {link}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A3CEF1] rounded-full"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Acciones derecha desktop */}
        <div className="hidden md:flex items-center gap-3">
          {/* Caja de notificaciones para Docente (2) y Admin (1) */}
          {user && (user.roleId === 1 || user.roleId === 2) && <NotificacionesBox />}

          {/* Autenticación / Perfil de usuario */}
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
                  <p className="text-xs font-semibold max-w-[110px] truncate text-white">{user.name}</p>
                  <span className="text-[10px] font-mono-code text-[#A3CEF1] bg-[#1a3050] px-1.5 py-0.2 rounded inline-block">
                    {user.role || (user.roleId === 1 ? "Admin" : user.roleId === 2 ? "Docente" : "Alumno")}
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

              {/* Dropdown de perfil */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-[#0d1b2a] rounded-lg shadow-xl border border-[#8B8C89]/30 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-[#8B8C89]/20">
                    <p className="text-xs font-bold truncate text-[#274C77]">{user.name}</p>
                    <p className="text-[11px] text-[#8B8C89] truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-[11px] font-medium text-[#274C77]">
                        {user.role || (user.roleId === 1 ? "Administrador" : user.roleId === 2 ? "Docente" : "Alumno")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-semibold"
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
              className="inline-flex items-center gap-2 bg-[#6096BA] hover:bg-[#A3CEF1] hover:text-[#274C77] text-white text-xs font-bold px-4 py-2 rounded transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Iniciar Sesión
            </button>
          )}
        </div>

        {/* Hamburger mobile */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (user.roleId === 1 || user.roleId === 2) && <NotificacionesBox />}
          <button
            id="nav-mobile-toggle"
            className="text-white p-1"
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
      </div>

      {/* Menú mobile */}
      {menuOpen && (
        <div className="md:hidden bg-[#1a3050] px-6 py-4 flex flex-col gap-3 border-t border-white/10 animate-in slide-in-from-top-2 duration-150">
          {/* Usuario en móvil */}
          {user ? (
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#6096BA] text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-[#A3CEF1] leading-tight">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="text-xs text-red-300 hover:text-red-100 bg-red-950/40 px-2.5 py-1 rounded border border-red-800/40"
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
              className="w-full flex items-center justify-center gap-2 bg-[#6096BA] text-white py-2.5 rounded font-bold text-xs shadow-sm mb-2"
            >
              <svg className="w-4 h-4 text-[#A3CEF1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Iniciar Sesión
            </button>
          )}

          {links.map((link) => (
            <button
              key={link}
              onClick={() => handleNavigate(link)}
              className={`text-left text-xs font-semibold py-1.5 transition-colors ${
                activeNav === link ? "text-white font-bold bg-white/10 px-2 rounded" : "text-[#A3CEF1] hover:text-white"
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
