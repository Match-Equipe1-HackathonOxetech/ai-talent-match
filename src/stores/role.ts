// Compat layer: keep the useRole() API used across the UI, but drive it from
// the real auth session. Old values ("recruiter"/"candidate") are mapped from
// authStore.role ("recrutador"/"candidato").
import { useMemo } from "react";
import { authStore, useAuth, type AppRole } from "./auth";

export type Role = "recruiter" | "candidate";

const toUi = (r: AppRole | null): Role => (r === "candidato" ? "candidate" : "recruiter");
const toApi = (r: Role): AppRole => (r === "candidate" ? "candidato" : "recrutador");

export function setRole(next: Role) {
  authStore.setSession({ role: toApi(next) });
}

export function useRole(): [Role, (r: Role) => void] {
  const { role } = useAuth();
  const ui = useMemo(() => toUi(role), [role]);
  return [ui, setRole];
}
