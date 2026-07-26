import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AsyncButton } from "@/components/async-button";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/services/api";
import { useAuth } from "@/stores/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — HireAI" },
      { name: "description", content: "Acesse sua conta de recrutador ou candidato." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/jobs",
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const auth = useAuth();

  const mutation = useMutation({
    mutationFn: () => authService.login({ email: email.trim(), senha }),
    onSuccess: () => {
      toast.success("Bem-vindo(a) de volta!");
      navigate({ to: redirect || "/jobs" });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Não foi possível entrar.";
      toast.error(msg);
    },
  });

  if (auth.accessToken) {
    navigate({ to: redirect || "/jobs" });
  }

  return (
    <section className="mx-auto max-w-sm space-y-6 pt-4">
      <header className="space-y-2 text-center">
        <span
          aria-hidden
          className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground"
        >
          <Sparkles className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Entrar no HireAI</h1>
        <p className="text-sm text-muted-foreground">
          Use suas credenciais para acessar suas vagas e entrevistas.
        </p>
      </header>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (mutation.isPending) return;
          if (!email.trim() || !senha) {
            toast.error("Informe email e senha.");
            return;
          }
          mutation.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-senha">Senha</Label>
          <Input
            id="login-senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={4}
          />
        </div>
        <AsyncButton
          type="submit"
          className="w-full"
          loading={mutation.isPending}
          loadingLabel="Entrando..."
        >
          Entrar
        </AsyncButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link to="/signup" className="font-medium text-primary hover:underline">
          Criar conta
        </Link>
      </p>
    </section>
  );
}
