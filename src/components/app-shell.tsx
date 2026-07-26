import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Briefcase, PlusSquare, Users, User, FileText, Sparkles, LogOut } from "lucide-react";
import { useRole, type Role } from "@/stores/role";
import { useAuth } from "@/stores/auth";
import { authService } from "@/services/auth.service";
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

const PUBLIC_ROUTES = new Set(["/login", "/signup"]);

function isPublic(pathname: string) {
  return PUBLIC_ROUTES.has(pathname);
}

function Header({ authed }: { authed: boolean }) {
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
          <span className="truncate text-sm font-semibold tracking-tight">HireAI</span>
        </Link>
        {authed && (
          <button
            type="button"
            aria-label="Sair"
            onClick={() => {
              void authService.logout();
              window.location.assign("/login");
            }}
            className="ml-auto inline-flex min-h-9 items-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Sair
          </button>
        )}
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
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const auth = useAuth();
  const navigate = useNavigate();
  const publicRoute = isPublic(pathname);
  const authed = Boolean(auth.accessToken);

  // Client-side auth gate: rotas privadas redirecionam para /login sem sessão.
  useEffect(() => {
    if (!authed && !publicRoute) {
      navigate({ to: "/login", search: { redirect: pathname } });
    }
  }, [authed, publicRoute, pathname, navigate]);

  if (publicRoute) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <Header authed={authed} />
        <main id="main" className="mx-auto max-w-2xl px-4 pt-4 pb-10">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header authed={authed} />
      <main id="main" className="mx-auto max-w-2xl px-4 pt-4 pb-28 sm:pb-24">
        {authed ? children : null}
      </main>
      {authed && <BottomTabBar />}
    </div>
  );
}
