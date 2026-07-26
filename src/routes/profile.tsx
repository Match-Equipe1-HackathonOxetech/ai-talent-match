import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserCircle, LogOut } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { authService } from "@/services/auth.service";
import { AsyncButton } from "@/components/async-button";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — HireAI" },
      { name: "description", content: "Sua conta e sessão." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const logout = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => navigate({ to: "/login" }),
  });

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <UserCircle className="h-10 w-10 text-muted-foreground" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            {auth.role === "recrutador" ? "Recrutador" : "Candidato"}
          </p>
          <p className="truncate font-semibold">{auth.email ?? "—"}</p>
        </div>
      </div>
      <AsyncButton
        variant="outline"
        className="w-full"
        loading={logout.isPending}
        loadingLabel="Saindo..."
        onClick={() => logout.mutate()}
      >
        <LogOut className="mr-2 h-4 w-4" aria-hidden />
        Sair da conta
      </AsyncButton>
    </section>
  );
}
