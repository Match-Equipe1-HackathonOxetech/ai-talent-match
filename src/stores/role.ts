import { useSyncExternalStore } from "react";

export type Role = "recruiter" | "candidate";

const KEY = "app.role";
const listeners = new Set<() => void>();

function read(): Role {
  if (typeof window === "undefined") return "recruiter";
  const v = window.localStorage.getItem(KEY);
  return v === "candidate" ? "candidate" : "recruiter";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function setRole(next: Role) {
  window.localStorage.setItem(KEY, next);
  listeners.forEach((l) => l());
}

export function useRole(): [Role, (r: Role) => void] {
  const role = useSyncExternalStore(
    subscribe,
    () => read(),
    () => "recruiter" as Role,
  );
  return [role, setRole];
}
