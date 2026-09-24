import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, AuthContextType } from "@/types";
import { MOCK_CONFIG } from "@/config/mock.config";
import { MOCK_USERS } from "@/mocks/cuenta.mock";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "proa_user";
const TOKEN_STORAGE_KEY = "proa_token";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mockIndex, setMockIndex] = useState(0);

  useEffect(() => {
    if (MOCK_CONFIG.auth) {
      // Modo mock: leer índice guardado o usar 0
      const savedIndex = parseInt(localStorage.getItem("proa_mock_index") ?? "0", 10);
      const idx = isNaN(savedIndex) ? 0 : Math.min(savedIndex, MOCK_USERS.length - 1);
      setMockIndex(idx);
      const mockUser = MOCK_USERS[idx];
      setUser(mockUser);
      setToken("mock-token-dev");
      setLoading(false);
      return;
    }

    // 1. Verificar si hay sesión guardada en localStorage
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (err) {
      console.error("Error al recuperar la sesión local:", err);
    }

    // 2. Verificar si retornamos de una redirección OAuth (/oauth2callback)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const loginSuccess = params.get("login_success");
      const urlToken = params.get("token");
      const userParam = params.get("user");
      const loginError = params.get("login_error");

      if (loginSuccess && urlToken && userParam) {
        try {
          const parsedUser: User = JSON.parse(decodeURIComponent(userParam));
          login(parsedUser, urlToken);
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          console.error("Error al procesar datos del usuario desde la URL:", e);
        }
      } else if (loginError) {
        console.warn("Error en el inicio de sesión con Google:", loginError);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    setLoading(false);
  }, []);

  const login = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      localStorage.setItem(TOKEN_STORAGE_KEY, userToken);
    } catch (err) {
      console.error("Error al guardar la sesión:", err);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  /** Cambia el usuario mock activo (solo en modo VITE_MOCK_AUTH=true) */
  const switchMockUser = (index: number) => {
    const idx = Math.min(Math.max(0, index), MOCK_USERS.length - 1);
    setMockIndex(idx);
    setUser(MOCK_USERS[idx]);
    setToken("mock-token-dev");
    localStorage.setItem("proa_mock_index", String(idx));
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}

      {/* Selector de usuario mock — solo visible en desarrollo con VITE_MOCK_AUTH=true */}
      {MOCK_CONFIG.auth && (
        <div
          style={{
            position: "fixed",
            bottom: "1rem",
            right: "1rem",
            zIndex: 9999,
            background: "#1e293b",
            color: "#f1f5f9",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            fontSize: "0.75rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            minWidth: "220px",
          }}
        >
          <p style={{ margin: "0 0 0.5rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.05em" }}>
            🧪 MOCK AUTH
          </p>
          <select
            value={mockIndex}
            onChange={(e) => switchMockUser(parseInt(e.target.value, 10))}
            style={{
              width: "100%",
              background: "#0f172a",
              color: "#f1f5f9",
              border: "1px solid #334155",
              borderRadius: "0.375rem",
              padding: "0.35rem 0.5rem",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            {MOCK_USERS.map((u, i) => (
              <option key={u.id} value={i}>
                {u.role} — {u.name}{u.estadoCuentaId !== 2 ? ` (${estadoLabel(u.estadoCuentaId)})` : ""}
                {u.solicitudDocente ? " 🕐" : ""}
              </option>
            ))}
          </select>
          <p style={{ margin: "0.5rem 0 0", color: "#64748b", fontSize: "0.65rem" }}>
            {user?.email}
          </p>
        </div>
      )}
    </AuthContext.Provider>
  );
}

function estadoLabel(estadoCuentaId?: number): string {
  switch (estadoCuentaId) {
    case 1: return "Pendiente";
    case 3: return "Rechazado";
    case 4: return "Suspendido";
    default: return "";
  }
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
}
