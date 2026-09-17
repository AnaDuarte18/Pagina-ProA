import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, AuthContextType } from "@/types";

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

  useEffect(() => {
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
          // Limpiar la URL sin recargar
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
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
}
