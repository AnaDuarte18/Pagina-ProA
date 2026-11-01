import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import logoProa from "@/imports/image.png";
import type { User } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface LoginModalProps {
  onLoginSuccess?: (user: User) => void;
}

type Tab = "login" | "register";

export default function LoginModal({ onLoginSuccess }: LoginModalProps) {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();

  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Campos login
  const [loginCorreo, setLoginCorreo] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Campos registro
  const [regNombre, setRegNombre] = useState("");
  const [regCorreo, setRegCorreo] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    resetMessages();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCorreo.trim() || !loginPassword) {
      setErrorMessage("Por favor completá todos los campos.");
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: loginCorreo.trim(), password: loginPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        login(data.user, data.token);
        closeLoginModal();
        onLoginSuccess?.(data.user);
      } else {
        setErrorMessage(data.error || "Correo o contraseña incorrectos.");
      }
    } catch {
      setErrorMessage("No se pudo conectar con el servidor. Verificá tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regNombre.trim() || !regCorreo.trim() || !regPassword || !regConfirm) {
      setErrorMessage("Por favor completá todos los campos.");
      return;
    }

    if (regPassword.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (regPassword !== regConfirm) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: regNombre.trim(),
          correo: regCorreo.trim(),
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Al registrar la cuenta queda PENDIENTE. El JWT es válido pero la cuenta está pendiente.
        // Hacemos login para que el usuario pueda asignar curso / solicitar docente.
        login(data.user, data.token);
        setSuccessMessage(data.message || "Cuenta creada. Tu cuenta está pendiente de aprobación.");
        // Cerrar modal luego de un momento para que el usuario vea el mensaje
        setTimeout(() => {
          closeLoginModal();
          onLoginSuccess?.(data.user);
        }, 2000);
      } else {
        setErrorMessage(data.error || "No se pudo crear la cuenta.");
      }
    } catch {
      setErrorMessage("No se pudo conectar con el servidor. Verificá tu conexión.");
    } finally {
      setLoading(false);
    }
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
        {/* Cabecera */}
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

        {/* Pestañas */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => handleTabChange("login")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === "login"
                ? "text-[#274C77] border-b-2 border-[#274C77] bg-white"
                : "text-slate-500 hover:text-slate-700 bg-slate-50"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => handleTabChange("register")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === "register"
                ? "text-[#274C77] border-b-2 border-[#274C77] bg-white"
                : "text-slate-500 hover:text-slate-700 bg-slate-50"
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Cuerpo del modal */}
        <div className="p-6">
          {/* Mensajes */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          )}

          {/* ── FORMULARIO LOGIN ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={loginCorreo}
                  onChange={(e) => setLoginCorreo(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  autoComplete="email"
                  className="w-full text-sm px-3.5 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#274C77] focus:ring-1 focus:ring-[#274C77]/30 text-[#0d1b2a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    required
                    autoComplete="current-password"
                    className="w-full text-sm px-3.5 py-2.5 pr-10 rounded-md border border-slate-300 focus:outline-none focus:border-[#274C77] focus:ring-1 focus:ring-[#274C77]/30 text-[#0d1b2a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showLoginPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#274C77] hover:bg-[#1a3050] disabled:bg-slate-300 text-white font-bold py-2.5 px-4 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Ingresando...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>

              <p className="text-center text-xs text-slate-500 mt-2">
                ¿No tenés cuenta?{" "}
                <button type="button" onClick={() => handleTabChange("register")} className="text-[#274C77] font-semibold hover:underline">
                  Creá una acá
                </button>
              </p>
            </form>
          )}

          {/* ── FORMULARIO REGISTRO ── */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nombre y apellido
                </label>
                <input
                  type="text"
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  required
                  autoComplete="name"
                  className="w-full text-sm px-3.5 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#274C77] focus:ring-1 focus:ring-[#274C77]/30 text-[#0d1b2a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={regCorreo}
                  onChange={(e) => setRegCorreo(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  autoComplete="email"
                  className="w-full text-sm px-3.5 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-[#274C77] focus:ring-1 focus:ring-[#274C77]/30 text-[#0d1b2a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contraseña <span className="text-slate-400 font-normal">(mínimo 8 caracteres)</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full text-sm px-3.5 py-2.5 pr-10 rounded-md border border-slate-300 focus:outline-none focus:border-[#274C77] focus:ring-1 focus:ring-[#274C77]/30 text-[#0d1b2a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showRegPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirmar contraseña
                </label>
                <input
                  type={showRegPassword ? "text" : "password"}
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="Repetí la contraseña"
                  required
                  autoComplete="new-password"
                  className={`w-full text-sm px-3.5 py-2.5 rounded-md border focus:outline-none focus:ring-1 text-[#0d1b2a] ${
                    regConfirm && regPassword !== regConfirm
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                      : "border-slate-300 focus:border-[#274C77] focus:ring-[#274C77]/30"
                  }`}
                />
                {regConfirm && regPassword !== regConfirm && (
                  <p className="text-xs text-red-600 mt-1">Las contraseñas no coinciden.</p>
                )}
              </div>

              {/* Aviso de cuenta pendiente */}
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-800 flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Tu cuenta quedará en estado <strong>Pendiente</strong> hasta ser aprobada por la administración.
                  Podrás seleccionar tu curso o enviar una solicitud docente mientras esperás.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#274C77] hover:bg-[#1a3050] disabled:bg-slate-300 text-white font-bold py-2.5 px-4 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </button>

              <p className="text-center text-xs text-slate-500 mt-2">
                ¿Ya tenés cuenta?{" "}
                <button type="button" onClick={() => handleTabChange("login")} className="text-[#274C77] font-semibold hover:underline">
                  Iniciá sesión
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Footer del modal */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono-code text-[11px] text-[#274C77]">auth.local // bcrypt</span>
          <span className="text-[11px] text-slate-400">Escuela PRoA San Francisco</span>
        </div>
      </div>
    </div>
  );
}
