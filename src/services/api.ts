// Centralized HTTP client. UI components MUST NOT call fetch/axios directly.
import { camelToSnake, snakeToCamel } from "./case";
import { authStore } from "@/stores/auth";

const DEFAULT_API_URL = "https://aimetch-talent.onrender.com";

const BASE_URL = ((import.meta.env.VITE_API_URL as string | undefined) || DEFAULT_API_URL).replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function friendly(status: number, fallback: string): string {
  if (status === 0) return "Sem conexão com o servidor. Verifique sua internet.";
  if (status === 400) return "Dados inválidos. Revise o formulário.";
  if (status === 401) return "Sessão expirada. Faça login novamente.";
  if (status === 403) return "Você não tem permissão para essa ação.";
  if (status === 404) return "Recurso não encontrado.";
  if (status === 409) return "Conflito ao processar. Tente novamente.";
  if (status === 422) return "Não foi possível processar os dados enviados.";
  if (status >= 500) return "Serviço indisponível. Tente novamente em instantes.";
  return fallback || "Erro inesperado.";
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  skipAuth?: boolean;
  _retry?: boolean;
}

// Single-flight refresh promise so multiple 401s don't spawn parallel refreshes.
let refreshPromise: Promise<boolean> | null = null;

async function performRefresh(): Promise<boolean> {
  const { refreshToken } = authStore.getSnapshot();
  if (!refreshToken || !BASE_URL) return false;
  try {
    const res = await fetch(BASE_URL + "/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
    };
    if (!data.access_token) return false;
    authStore.setSession({
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? refreshToken,
    });
    return true;
  } catch {
    return false;
  }
}

async function ensureRefreshed(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request<T>(
  method: Method,
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError(
      0,
      "API não configurada. Defina VITE_API_URL no ambiente.",
    );
  }

  const url = new URL(BASE_URL + path);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (!opts.skipAuth) {
    const { accessToken } = authStore.getSnapshot();
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  }

  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    if (opts.body instanceof FormData) {
      body = opts.body;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(camelToSnake(opts.body));
    }
  }

  const ctrl = new AbortController();
  const timeout = window.setTimeout(
    () => ctrl.abort(),
    opts.timeoutMs ?? 20000,
  );
  const signal = opts.signal
    ? mergeSignals(opts.signal, ctrl.signal)
    : ctrl.signal;

  let res: Response;
  try {
    res = await fetch(url.toString(), { method, headers, body, signal });
  } catch (err) {
    window.clearTimeout(timeout);
    if ((err as Error).name === "AbortError") {
      throw new ApiError(0, "A requisição demorou demais. Tente novamente.");
    }
    throw new ApiError(0, friendly(0, "Falha de rede."));
  }
  window.clearTimeout(timeout);

  // Handle 401 with single-flight refresh (once).
  if (res.status === 401 && !opts.skipAuth && !opts._retry) {
    const ok = await ensureRefreshed();
    if (ok) {
      return request<T>(method, path, { ...opts, _retry: true });
    }
    authStore.clear();
  }

  const text = await res.text();
  const parsed = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const message =
      (parsed && typeof parsed === "object" && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : undefined) || friendly(res.status, res.statusText);
    throw new ApiError(res.status, friendly(res.status, message), parsed);
  }

  return snakeToCamel<T>(parsed);
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function mergeSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  a.addEventListener("abort", onAbort);
  b.addEventListener("abort", onAbort);
  return ctrl.signal;
}

export const api = {
  get: <T>(path: string, query?: RequestOptions["query"], opts?: Partial<RequestOptions>) =>
    request<T>("GET", path, { query, ...opts }),
  post: <T>(path: string, body?: unknown, opts?: Partial<RequestOptions>) =>
    request<T>("POST", path, { body, ...opts }),
  put: <T>(path: string, body?: unknown, opts?: Partial<RequestOptions>) =>
    request<T>("PUT", path, { body, ...opts }),
  patch: <T>(path: string, body?: unknown, opts?: Partial<RequestOptions>) =>
    request<T>("PATCH", path, { body, ...opts }),
  del: <T>(path: string, opts?: Partial<RequestOptions>) =>
    request<T>("DELETE", path, opts),
};
