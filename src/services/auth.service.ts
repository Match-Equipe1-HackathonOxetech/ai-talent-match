import { api } from "./api";
import { authStore, type AppRole } from "@/stores/auth";
import type {
  AuthTokens,
  LoginInput,
  SignupCandidatoInput,
  SignupEmpresaInput,
} from "./types";

function decodeJwtRole(token: string): AppRole | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as Record<string, unknown>;
    const raw =
      (json.role as string | undefined) ??
      (json.tipo as string | undefined) ??
      (json.user_type as string | undefined) ??
      ((json.claims as Record<string, unknown> | undefined)?.role as string | undefined);
    if (raw === "recrutador" || raw === "empresa") return "recrutador";
    if (raw === "candidato" || raw === "candidate") return "candidato";
    return null;
  } catch {
    return null;
  }
}

function extractTokens(res: unknown): { accessToken: string; refreshToken: string | null; role?: AppRole } {
  const r = (res ?? {}) as Record<string, unknown>;
  // Suporta múltiplos formatos de resposta do backend.
  const nested = (r.data ?? r.tokens ?? r.result) as Record<string, unknown> | undefined;
  const src = { ...(nested ?? {}), ...r };
  const access =
    (src.accessToken as string) ??
    (src.access_token as string) ??
    (src.token as string) ??
    (src.jwt as string) ??
    "";
  const refresh =
    (src.refreshToken as string) ??
    (src.refresh_token as string) ??
    (src.refresh as string) ??
    null;
  const roleRaw = (src.role as string) ?? (src.tipo as string) ?? (src.userType as string);
  let role: AppRole | undefined;
  if (roleRaw === "recrutador" || roleRaw === "empresa") role = "recrutador";
  else if (roleRaw === "candidato" || roleRaw === "candidate") role = "candidato";
  return { accessToken: access, refreshToken: refresh, role };
}

function persistTokens(res: unknown, forcedRole: AppRole | null, email: string) {
  const { accessToken, refreshToken, role: bodyRole } = extractTokens(res);
  if (!accessToken) {
    throw new Error(
      "Login sem token de acesso na resposta do backend. Verifique o formato retornado por /login.",
    );
  }
  const jwtRole = decodeJwtRole(accessToken);
  const role: AppRole = forcedRole ?? bodyRole ?? jwtRole ?? "candidato";
  authStore.setSession({
    accessToken,
    refreshToken,
    role,
    email,
  });
}

export const authService = {
  async signupEmpresa(input: SignupEmpresaInput): Promise<void> {
    await api.post<unknown>("/empresas", input, { skipAuth: true });
    // Login em seguida — forçamos role="recrutador" para não depender do backend.
    const res = await api.post<unknown>(
      "/login",
      { email: input.email, senha: input.senha },
      { skipAuth: true },
    );
    persistTokens(res, "recrutador", input.email);
  },

  async signupCandidato(input: SignupCandidatoInput): Promise<void> {
    await api.post<unknown>("/candidatos", input, { skipAuth: true });
    const res = await api.post<unknown>(
      "/login",
      { email: input.email, senha: input.senha },
      { skipAuth: true },
    );
    persistTokens(res, "candidato", input.email);
  },

  async login(input: LoginInput, fallbackRole: AppRole = "candidato"): Promise<void> {
    const res = await api.post<unknown>("/login", input, { skipAuth: true });
    // Login normal: usa role do backend/JWT, com fallback.
    persistTokens(res, null, input.email);
    // Se nada veio, garante o fallback informado pela UI.
    if (!authStore.getSnapshot().role) {
      authStore.setSession({ role: fallbackRole });
    }
  },

  async logout(): Promise<void> {
    const { refreshToken } = authStore.getSnapshot();
    try {
      if (refreshToken) {
        await api.post<unknown>("/logout", { refreshToken });
      }
    } catch {
      // Ignora falha de logout no servidor; sempre limpa localmente.
    } finally {
      authStore.clear();
    }
  },
};
