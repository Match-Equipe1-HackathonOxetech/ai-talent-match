import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AsyncButton } from "@/components/async-button";
import { ScoreRing } from "@/components/score-ring";
import { candidatesService } from "@/services/candidates.service";
import { ApiError } from "@/services/api";
import type { CandidateDecision } from "@/services/types";

const candidateQuery = (id: string) =>
  queryOptions({
    queryKey: ["candidate", id],
    queryFn: () => candidatesService.get(id),
  });

export const Route = createFileRoute("/candidates/$candidateId")({
  head: ({ params }) => ({
    meta: [
      { title: `Candidato ${params.candidateId} — HireAI` },
      { name: "description", content: "Perfil analítico do candidato com AI Score e transcrição." },
    ],
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(candidateQuery(params.candidateId)),
  component: CandidateDetailPage,
});

function CandidateDetailPage() {
  const { candidateId } = Route.useParams();
  const { data: candidate } = useSuspenseQuery(candidateQuery(candidateId));
  const qc = useQueryClient();

  const decide = useMutation({
    mutationFn: (decision: Exclude<CandidateDecision, "pending">) =>
      candidatesService.decide(candidateId, decision),
    onSuccess: (_data, decision) => {
      toast.success(decision === "approved" ? "Candidato aprovado." : "Candidato rejeitado.");
      qc.invalidateQueries({ queryKey: ["candidate", candidateId] });
      qc.invalidateQueries({ queryKey: ["candidates", candidate.jobId] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Não foi possível registrar a decisão.";
      toast.error(msg);
    },
  });

  return (
    <section className="space-y-5">
      <Link
        to="/jobs/$jobId"
        params={{ jobId: candidate.jobId }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar para a vaga
      </Link>

      <header className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <ScoreRing score={candidate.aiScore} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold">{candidate.fullName}</h1>
          {candidate.headline && (
            <p className="truncate text-sm text-muted-foreground">
              {candidate.headline}
            </p>
          )}
        </div>
      </header>

      {candidate.summary && (
        <article aria-labelledby="summary-h" className="space-y-2">
          <h2 id="summary-h" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Resumo analítico
          </h2>
          <p className="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground">
            {candidate.summary}
          </p>
        </article>
      )}

      <Accordion type="single" collapsible defaultValue="transcript">
        <AccordionItem value="transcript" className="rounded-xl border border-border bg-card px-4">
          <AccordionTrigger className="text-sm font-semibold">
            Transcrição da entrevista
          </AccordionTrigger>
          <AccordionContent className="whitespace-pre-line pb-4 text-sm leading-relaxed text-foreground">
            {candidate.transcript || "Transcrição ainda não disponível."}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="grid grid-cols-2 gap-3">
        <AsyncButton
          variant="outline"
          className="border-destructive/40 text-destructive hover:bg-destructive/10"
          loading={decide.isPending && decide.variables === "rejected"}
          disabled={decide.isPending || candidate.decision !== "pending"}
          onClick={() => decide.mutate("rejected")}
          aria-label="Rejeitar candidato"
        >
          <X className="mr-1 h-4 w-4" aria-hidden />
          Rejeitar
        </AsyncButton>
        <AsyncButton
          loading={decide.isPending && decide.variables === "approved"}
          disabled={decide.isPending || candidate.decision !== "pending"}
          onClick={() => decide.mutate("approved")}
          aria-label="Aprovar candidato"
        >
          <Check className="mr-1 h-4 w-4" aria-hidden />
          Aprovar
        </AsyncButton>
      </div>
    </section>
  );
}
