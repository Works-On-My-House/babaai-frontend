import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  AUTH_LOGOUT_EVENT,
  AUTH_REFRESHED_EVENT,
  TOKEN_KEY,
  refreshAccessToken,
} from "../../api/axios";
import { api, type User } from "../../api/client";

interface AuthContextValue {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }
    const profile = await api.me(token);
    setUser(profile);
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await api.me(token);
        if (!cancelled) setUser(profile);
      } catch {
        // Access token likely expired — try the refresh cookie once before giving up.
        try {
          const newToken = await refreshAccessToken();
          const profile = await api.me(newToken);
          if (!cancelled) {
            setToken(newToken);
            setUser(profile);
          }
        } catch {
          if (!cancelled) {
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (username: string, password: string) => {
    const { access_token } = await api.login(username, password);
    localStorage.setItem(TOKEN_KEY, access_token);
    setToken(access_token);
    const profile = await api.me(access_token);
    setUser(profile);
  }, []);

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      await api.register({ email, username, password });
      await login(username, password);
    },
    [login],
  );

  const logout = useCallback(() => {
    void api.logout().catch(() => {
      /* best-effort server-side revoke */
    });
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // React to the axios interceptor: forced logout when a refresh fails, or token refreshed.
  useEffect(() => {
    const onLogout = () => {
      setToken(null);
      setUser(null);
    };
    const onRefreshed = (event: Event) => {
      const next = (event as CustomEvent<string>).detail;
      if (next) setToken(next);
    };
    window.addEventListener(AUTH_LOGOUT_EVENT, onLogout);
    window.addEventListener(AUTH_REFRESHED_EVENT, onRefreshed);
    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, onLogout);
      window.removeEventListener(AUTH_REFRESHED_EVENT, onRefreshed);
    };
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [token, user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
