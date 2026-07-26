import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AsyncButton } from "@/components/async-button";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/services/api";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/stores/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Criar conta — HireAI" },
      { name: "description", content: "Cadastre-se como empresa (recrutador) ou candidato." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [role, setRole] = useState<AppRole>("recrutador");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { nome: nome.trim(), email: email.trim(), senha };
      return role === "recrutador"
        ? authService.signupEmpresa(payload)
        : authService.signupCandidato(payload);
    },
    onSuccess: () => {
      toast.success("Conta criada com sucesso!");
      navigate({ to: "/jobs" });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Não foi possível criar a conta.";
      toast.error(msg);
    },
  });

  return (
    <section className="mx-auto max-w-sm space-y-6 pt-4">
      <header className="space-y-2 text-center">
        <span
          aria-hidden
          className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground"
        >
          <UserPlus className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
        <p className="text-sm text-muted-foreground">
          Escolha o tipo de conta que você quer criar.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Tipo de conta"
        className="grid grid-cols-2 rounded-full bg-muted p-0.5 text-sm font-medium"
      >
        {(["recrutador", "candidato"] as AppRole[]).map((r) => (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={role === r}
            onClick={() => setRole(r)}
            className={cn(
              "min-h-10 rounded-full px-3 transition",
              role === r
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {r === "recrutador" ? "Empresa" : "Candidato"}
          </button>
        ))}
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (mutation.isPending) return;
          if (!nome.trim() || !email.trim() || !senha) {
            toast.error("Preencha todos os campos.");
            return;
          }
          mutation.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="signup-nome">
            {role === "recrutador" ? "Nome da empresa" : "Seu nome"}
          </Label>
          <Input
            id="signup-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            autoComplete={role === "recrutador" ? "organization" : "name"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-senha">Senha</Label>
          <Input
            id="signup-senha"
            type="password"
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <AsyncButton
          type="submit"
          className="w-full"
          loading={mutation.isPending}
          loadingLabel="Criando..."
        >
          Criar conta
        </AsyncButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </section>
  );
}
