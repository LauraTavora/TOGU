import type { HttpClient } from "./http-client";

export interface RegisterResponse {
  user: { id: string; email: string };
}

export interface LoginResponse {
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface MeResponse {
  userId: string;
}

export function createAuthApi(client: HttpClient) {
  return {
    register: (input: { email: string; password: string }) =>
      client.request<RegisterResponse>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      }),

    login: (input: { email: string; password: string }) =>
      client.request<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      }),

    logout: () => client.request<{ ok: true }>("/api/v1/auth/logout", { method: "POST" }),

    refresh: () => client.request<RefreshResponse>("/api/v1/auth/refresh", { method: "POST" }),

    me: () => client.request<MeResponse>("/api/v1/auth/me", { method: "GET" }),

    verifyEmail: (token: string) =>
      client.request<{ ok: true }>("/api/v1/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ token }),
      }),

    requestPasswordReset: (email: string) =>
      client.request<{ ok: true }>("/api/v1/auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),

    confirmPasswordReset: (input: { token: string; password: string }) =>
      client.request<{ ok: true }>("/api/v1/auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
