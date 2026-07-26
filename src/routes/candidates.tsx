import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";

export const Route = createFileRoute("/candidates")({
  head: () => ({
    meta: [
      { title: "Candidatos — HireAI" },
      { name: "description", content: "Navegue pelas vagas para ver seus candidatos ranqueados por AI Score." },
    ],
  }),
  component: CandidatesIndex,
});

function CandidatesIndex() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Candidatos</h1>
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-muted-foreground">
        <Briefcase className="h-8 w-8" aria-hidden />
        <p className="text-sm">Escolha uma vaga para ver seus candidatos ordenados pelo AI Score.</p>
        <Link
          to="/jobs"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Ver vagas
        </Link>
      </div>
    </section>
  );
}
