import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { api, setUnauthorizedHandler, User } from './api';
import { AUTO_LOGOUT_MS } from './config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, phone?: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const LOGOUT_SYNC_KEY = 'auth:logout-sync';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<number | null>(null);
  const isLoggingOutRef = useRef(false);

  const clearAutoLogoutTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const broadcastLogout = useCallback(() => {
    localStorage.setItem(LOGOUT_SYNC_KEY, String(Date.now()));
  }, []);

  const runLogout = useCallback(async (options?: { callApi?: boolean; broadcast?: boolean }) => {
    if (isLoggingOutRef.current) {
      return;
    }

    isLoggingOutRef.current = true;
    clearAutoLogoutTimer();

    try {
      if (options?.callApi !== false) {
        try {
          await api.auth.logout();
        } catch {
        }
      }
    } finally {
      setUser(null);
      if (options?.broadcast !== false) {
        broadcastLogout();
      }
      isLoggingOutRef.current = false;
    }
  }, [broadcastLogout, clearAutoLogoutTimer]);

  const resetAutoLogoutTimer = useCallback(() => {
    if (!user || loading) {
      clearAutoLogoutTimer();
      return;
    }

    clearAutoLogoutTimer();
    timerRef.current = window.setTimeout(() => {
      void runLogout({ callApi: true, broadcast: true });
    }, AUTO_LOGOUT_MS);
  }, [clearAutoLogoutTimer, loading, runLogout, user]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAutoLogoutTimer();
      setUser(null);
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [clearAutoLogoutTimer]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LOGOUT_SYNC_KEY || !event.newValue) {
        return;
      }

      clearAutoLogoutTimer();
      setUser(null);
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [clearAutoLogoutTimer]);

  useEffect(() => {
    if (!user || loading) {
      clearAutoLogoutTimer();
      return;
    }

    const events: Array<keyof WindowEventMap> = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      resetAutoLogoutTimer();
    };

    resetAutoLogoutTimer();

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      clearAutoLogoutTimer();
    };
  }, [clearAutoLogoutTimer, loading, resetAutoLogoutTimer, user]);

  useEffect(() => {
    api.auth.getMe()
      .then(res => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.auth.login(username, password);
    setUser(res.user);
  };

  const register = async (username: string, password: string, phone?: string, email?: string) => {
    const res = await api.auth.register(username, password, phone, email);
    setUser(res.user);
  };

  const logout = async () => {
    await runLogout({ callApi: true, broadcast: true });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
