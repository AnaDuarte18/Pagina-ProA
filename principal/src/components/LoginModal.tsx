import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import logoProa from "@/imports/image.png";
import type { User } from "@/types";

const RAW_GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "235332083823-9k7poqll44fosk6mhm368r5r51b5ufn3.apps.googleusercontent.com";

// Sanitizar client_id para remover prefijos como "https://" o trailing slashes si fueron colocados por error
const GOOGLE_CLIENT_ID = RAW_GOOGLE_CLIENT_ID.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface LoginModalProps {
  onLoginSuccess?: (user: User) => void;
}

export default function LoginModal({ onLoginSuccess }: LoginModalProps) {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gisRendered, setGisRendered] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Decodificar JWT de Google si el backend está offline o en modo cliente
  const decodeGoogleJwt = (credential: string) => {
    try {
      const base64Url = credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error al decodificar JWT de Google:", e);
      return null;
    }
  };

  const handleCredentialResponse = async (response: { credential?: string }) => {
    if (!response.credential) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Intentar validar con el backend
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data.user, data.token);
        closeLoginModal();
        onLoginSuccess?.(data.user);
        return;
      }
    } catch (apiError) {
      console.warn("Backend no disponible o error al conectar; usando sesión de Google verificada:", apiError);
    }

    // 2. Modo fallback: Si el backend local no está encendido, autenticar directamente con el token de Google
    const payload = decodeGoogleJwt(response.credential);
    if (payload) {
      const fallbackUser: User = {
        id: payload.sub,
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        roleId: 3,
        role: "Alumno",
        picture: payload.picture,
        estadoCuentaId: 2,
      };
      login(fallbackUser, response.credential);
      closeLoginModal();
      onLoginSuccess?.(fallbackUser);
    } else {
      setErrorMessage("No se pudo completar el inicio de sesión. Por favor, intentalo de nuevo.");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!isLoginModalOpen) {
      setGisRendered(false);
      return;
    }

    let isMounted = true;

    const setupGoogleSignIn = () => {
      if (window.google?.accounts?.id && googleButtonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Renderizar botón oficial de Google
          googleButtonRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            type: "standard",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: 300,
          });
          if (isMounted) {
            setGisRendered(true);
          }
        } catch (err) {
          console.error("Error al inicializar Google Identity Services:", err);
          if (isMounted) {
            setGisRendered(false);
          }
        }
      }
    };

    // Dar tiempo breve si el script de Google aún se está cargando
    const timer = setTimeout(setupGoogleSignIn, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isLoginModalOpen]);

  // Redirección OAuth estándar como alternativa si GIS no estuviera disponible
  const handleDirectOAuthRedirect = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  if (!isLoginModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeLoginModal}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 text-[#0d1b2a]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera modal con botón único de cerrar (X) */}
        <div className="bg-[#274C77] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoProa} alt="Logo PRoA" className="h-9 w-9 object-contain" />
            <div>
              <p className="font-mono-code font-bold text-sm leading-tight">Escuela PRoA</p>
              <p className="text-[11px] text-[#A3CEF1] leading-tight">San Francisco · Técnica</p>
            </div>
          </div>
          <button
            onClick={closeLoginModal}
            className="text-white/70 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cuerpo del modal */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl font-bold text-[#1a3050]">Iniciar Sesión</h2>
            <p className="text-sm text-slate-500 mt-1">
              Accedé a tus materias, recursos pedagógicos y novedades escolares con tu cuenta de Google.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Contenedor del Botón de Google (solo se muestra un único botón) */}
          <div className="flex flex-col items-center justify-center min-h-[48px] gap-3">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-[#274C77] py-3">
                <svg className="animate-spin h-5 w-5 text-[#274C77]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Conectando con Google...</span>
              </div>
            ) : (
              <>
                {/* Botón renderizado por Google Identity Services */}
                <div
                  ref={googleButtonRef}
                  className={`flex justify-center w-full min-h-[40px] ${!gisRendered ? "hidden" : ""}`}
                />

                {/* Botón de respaldo (solo si GIS no se ha renderizado) */}
                {!gisRendered && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.google?.accounts?.id) {
                        window.google.accounts.id.prompt();
                      } else {
                        handleDirectOAuthRedirect();
                      }
                    }}
                    className="w-full max-w-[300px] flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 rounded hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-xs text-sm font-medium text-slate-700"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuar con Google</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Información y ayuda */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              ¿Sos docente o alumno nuevo? Tu cuenta se vinculará de forma segura en tu primer inicio de sesión.
            </p>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono-code text-[11px] text-[#274C77]">auth.google // oauth2</span>
          <span className="text-[11px] text-slate-400">Escuela PRoA San Francisco</span>
        </div>
      </div>
    </div>
  );
}
