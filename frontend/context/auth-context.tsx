"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const TOKEN_KEY = "notes_app_token";

type JwtPayload = {
  sub: number;
  username: string;
  jti: string;
  exp: number;
};

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

type AuthState = {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState>({
  token: null,
  username: null,
  isAuthenticated: false,
  isHydrated: false,
  signIn: () => {},
  signOut: () => {},
});

function readStoredSession(): { token: string | null; username: string | null } {
  if (typeof window === "undefined") return { token: null, username: null };
  const stored = sessionStorage.getItem(TOKEN_KEY);
  if (!stored) return { token: null, username: null };
  const payload = decodeJwt(stored);
  if (payload && payload.exp * 1000 > Date.now()) {
    return { token: stored, username: payload.username };
  }
  sessionStorage.removeItem(TOKEN_KEY);
  return { token: null, username: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start with a consistent server/client render, then hydrate from sessionStorage on mount.
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredSession();
    setToken(stored.token);
    setUsername(stored.username);
    setIsHydrated(true);
  }, []);

  const handleSignIn = useCallback((newToken: string) => {
    const payload = decodeJwt(newToken);
    sessionStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUsername(payload?.username ?? null);
  }, []);

  const handleSignOut = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        isAuthenticated: !!token,
        isHydrated,
        signIn: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
