import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Briefcase, PlusSquare, Users, User, FileText, Sparkles } from "lucide-react";
import { useRole, type Role } from "@/stores/role";
import { cn } from "@/lib/utils";

interface Tab {
  to: string;
  label: string;
  Icon: typeof Briefcase;
  matchPrefix?: string;
}

const recruiterTabs: Tab[] = [
  { to: "/jobs", label: "Vagas", Icon: Briefcase, matchPrefix: "/jobs" },
  { to: "/jobs/new", label: "Nova", Icon: PlusSquare },
  { to: "/candidates", label: "Candidatos", Icon: Users, matchPrefix: "/candidates" },
  { to: "/profile", label: "Perfil", Icon: User },
];

const candidateTabs: Tab[] = [
  { to: "/jobs", label: "Vagas", Icon: Briefcase, matchPrefix: "/jobs" },
  { to: "/applications", label: "Aplicações", Icon: FileText },
  { to: "/profile", label: "Perfil", Icon: User },
];

function tabsFor(role: Role) {
  return role === "recruiter" ? recruiterTabs : candidateTabs;
}

function Header() {
  const [role, setRole] = useRole();
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
        <Link
          to="/"
          aria-label="Ir para a página inicial"
          className="flex min-w-0 items-center gap-2"
        >
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"
          >
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="truncate text-sm font-semibold tracking-tight">
            HireAI
          </span>
        </Link>
        <div
          role="tablist"
          aria-label="Alternar papel"
          className="ml-auto grid grid-cols-2 rounded-full bg-muted p-0.5 text-xs font-medium"
        >
          {(["recruiter", "candidate"] as Role[]).map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={role === r}
              onClick={() => setRole(r)}
              className={cn(
                "min-h-9 rounded-full px-3 transition",
                role === r
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              {r === "recruiter" ? "Recrutador" : "Candidato"}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function BottomTabBar() {
  const [role] = useRole();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tabs = tabsFor(role);

  const isActive = (t: Tab) => {
    if (t.to === pathname) return true;
    if (t.matchPrefix && pathname.startsWith(t.matchPrefix)) {
      // Avoid marking "Vagas" active when we're on "Nova Vaga"
      if (t.to === "/jobs" && pathname.startsWith("/jobs/new")) return false;
      return true;
    }
    return false;
  };

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul
        className="mx-auto grid max-w-2xl"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map(({ to, label, Icon }) => {
          const active = isActive({ to, label, Icon });
          return (
            <li key={to}>
              <Link
                to={to}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <main
        id="main"
        className="mx-auto max-w-2xl px-4 pt-4 pb-28 sm:pb-24"
      >
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
