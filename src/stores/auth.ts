import { useSyncExternalStore } from "react";

export type AppRole = "recrutador" | "candidato";

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: AppRole | null;
  email: string | null;
}

const KEY = "hireai.auth";
const listeners = new Set<() => void>();

const EMPTY: AuthState = {
  accessToken: null,
  refreshToken: null,
  role: null,
  email: null,
};

let cache: AuthState = EMPTY;
let hydrated = false;

function readFromStorage(): AuthState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      role: (parsed.role as AppRole | null) ?? null,
      email: parsed.email ?? null,
    };
  } catch {
    return EMPTY;
  }
}

function persist(next: AuthState) {
  if (typeof window === "undefined") return;
  if (!next.accessToken) window.localStorage.removeItem(KEY);
  else window.localStorage.setItem(KEY, JSON.stringify(next));
}

function ensureHydrated() {
  if (!hydrated && typeof window !== "undefined") {
    cache = readFromStorage();
    hydrated = true;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export const authStore = {
  getSnapshot(): AuthState {
    ensureHydrated();
    return cache;
  },
  setSession(next: Partial<AuthState>) {
    ensureHydrated();
    cache = { ...cache, ...next };
    persist(cache);
    emit();
  },
  clear() {
    cache = EMPTY;
    persist(cache);
    emit();
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        cache = readFromStorage();
        cb();
      }
    };
    if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
    };
  },
};

export function useAuth(): AuthState {
  return useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getSnapshot(),
    () => EMPTY,
  );
}
