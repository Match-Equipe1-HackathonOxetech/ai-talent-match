import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Inbox } from "lucide-react";
import { jobsService } from "@/services/jobs.service";
import { candidatesService } from "@/services/candidates.service";
import { CandidateCard } from "@/components/candidate-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole } from "@/stores/role";
import type { Candidate } from "@/services/types";

const jobQuery = (jobId: string) =>
  queryOptions({
    queryKey: ["job", jobId],
    queryFn: () => jobsService.get(jobId),
  });

const candidatesQuery = (jobId: string) =>
  queryOptions({
    queryKey: ["candidates", jobId],
    queryFn: () => candidatesService.listByJob(jobId),
  });

export const Route = createFileRoute("/jobs/$jobId")({
  head: ({ params }) => ({
    meta: [
      { title: `Vaga ${params.jobId} — HireAI` },
      { name: "description", content: "Detalhes da vaga e candidatos ordenados por AI Score." },
    ],
  }),
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(jobQuery(params.jobId));
    context.queryClient.ensureQueryData(candidatesQuery(params.jobId));
  },
  component: JobDetailPage,
});

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const [role] = useRole();
  const { data: job } = useSuspenseQuery(jobQuery(jobId));
  const { data: candidates } = useSuspenseQuery(candidatesQuery(jobId));

  const sorted = [...(candidates ?? [])].sort(
    (a: Candidate, b: Candidate) => b.aiScore - a.aiScore,
  );

  return (
    <section className="space-y-5">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar para vagas
      </Link>

      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">{job.jobTitle}</h1>
        <div className="flex flex-wrap gap-1.5">
          {job.hardSkills.map((s) => (
            <Badge key={`h-${s}`} variant="secondary" className="font-normal">
              {s}
            </Badge>
          ))}
          {job.softSkills.map((s) => (
            <Badge key={`s-${s}`} variant="outline" className="font-normal">
              {s}
            </Badge>
          ))}
        </div>
        {role === "candidate" && (
          <Button asChild className="min-h-11 w-full sm:w-auto">
            <Link to="/apply/$jobId" params={{ jobId }} aria-label={`Aplicar para ${job.jobTitle}`}>
              Aplicar para esta vaga
            </Link>
          </Button>
        )}
      </header>

      {role === "recruiter" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Candidatos ({sorted.length}) — por AI Score
          </h2>
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-muted-foreground">
              <Inbox className="h-8 w-8" aria-hidden />
              <p className="text-sm">Nenhum candidato ainda.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {sorted.map((c) => (
                <CandidateCard key={c.candidateId} candidate={c} />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
