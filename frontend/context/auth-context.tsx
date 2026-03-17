"use client";

import {
  createContext,
  useContext,
  useState,
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
  signIn: (token: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState>({
  token: null,
  username: null,
  isAuthenticated: false,
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
  const [token, setToken] = useState<string | null>(() => readStoredSession().token);
  const [username, setUsername] = useState<string | null>(() => readStoredSession().username);

  // No useEffect needed — lazy initialisers run once on mount, client-side only.

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
