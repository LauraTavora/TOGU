"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createAuthApi, createHttpClient, type AuthApi, type HttpClient } from "@fecho/sdk";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  status: AuthStatus;
  userId: string | null;
  authApi: AuthApi;
  http: HttpClient;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const accessTokenRef = useRef<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [userId, setUserId] = useState<string | null>(null);

  const http = useMemo(
    () => createHttpClient({ getAccessToken: () => accessTokenRef.current }),
    [],
  );
  const authApi = useMemo(() => createAuthApi(http), [http]);

  useEffect(() => {
    let cancelled = false;

    // Refresh silencioso: o refresh token vive num cookie HttpOnly, então
    // basta chamar /refresh — se houver uma sessão válida, ganhamos um
    // access token novo sem pedir credenciais de novo.
    authApi
      .refresh()
      .then(({ accessToken }) => {
        if (cancelled) return null;
        accessTokenRef.current = accessToken;
        return authApi.me();
      })
      .then((me) => {
        if (cancelled || !me) return;
        setUserId(me.userId);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!cancelled) setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { accessToken } = await authApi.login({ email, password });
      accessTokenRef.current = accessToken;
      const me = await authApi.me();
      setUserId(me.userId);
      setStatus("authenticated");
    },
    [authApi],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      await authApi.register({ email, password });
    },
    [authApi],
  );

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    accessTokenRef.current = null;
    setUserId(null);
    setStatus("unauthenticated");
  }, [authApi]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, userId, authApi, http, login, register, logout }),
    [status, userId, authApi, http, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de <AuthProvider>.");
  }
  return context;
}
