import { api } from "./api";
import { authStore, type AppRole } from "@/stores/auth";
import type {
  AuthTokens,
  LoginInput,
  SignupCandidatoInput,
  SignupEmpresaInput,
} from "./types";

async function persistTokens(tokens: AuthTokens, role: AppRole, email: string) {
  authStore.setSession({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    role: tokens.role ?? role,
    email,
  });
}

export const authService = {
  async signupEmpresa(input: SignupEmpresaInput): Promise<void> {
    await api.post<unknown>("/empresas", input, { skipAuth: true });
    // A API não retorna tokens no signup; faz login em sequência.
    await authService.login({ email: input.email, senha: input.senha }, "recrutador");
  },

  async signupCandidato(input: SignupCandidatoInput): Promise<void> {
    await api.post<unknown>("/candidatos", input, { skipAuth: true });
    await authService.login({ email: input.email, senha: input.senha }, "candidato");
  },

  async login(input: LoginInput, fallbackRole: AppRole = "candidato"): Promise<void> {
    const res = await api.post<AuthTokens>("/login", input, { skipAuth: true });
    await persistTokens(res, fallbackRole, input.email);
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
