import { createFileRoute } from "@tanstack/react-router";
import { UserCircle } from "lucide-react";
import { useRole } from "@/stores/role";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — HireAI" },
      { name: "description", content: "Gerencie seu papel e preferências." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [role, setRole] = useRole();
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <UserCircle className="h-10 w-10 text-muted-foreground" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Papel atual</p>
          <p className="font-semibold">
            {role === "recruiter" ? "Recrutador" : "Candidato"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant={role === "recruiter" ? "default" : "outline"}
          className="min-h-11"
          onClick={() => setRole("recruiter")}
        >
          Recrutador
        </Button>
        <Button
          variant={role === "candidate" ? "default" : "outline"}
          className="min-h-11"
          onClick={() => setRole("candidate")}
        >
          Candidato
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        A autenticação real será plugada quando o backend expor o contrato de login. Enquanto isso, o papel é apenas local.
      </p>
    </section>
  );
}
