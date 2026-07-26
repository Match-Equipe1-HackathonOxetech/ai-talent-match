import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, Inbox } from "lucide-react";
import { jobsService } from "@/services/jobs.service";
import type { RankingRow } from "@/services/types";

const rankingQuery = (jobId: string) =>
  queryOptions({
    queryKey: ["ranking", jobId],
    queryFn: () => jobsService.ranking(jobId),
  });

const jobQuery = (jobId: string) =>
  queryOptions({
    queryKey: ["job", jobId],
    queryFn: () => jobsService.get(jobId),
  });

export const Route = createFileRoute("/jobs/$jobId/ranking")({
  head: ({ params }) => ({
    meta: [
      { title: `Ranking — Vaga ${params.jobId}` },
      { name: "description", content: "Ranking de candidatos por soft skills, hard skills e média." },
    ],
  }),
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(jobQuery(params.jobId));
    context.queryClient.ensureQueryData(rankingQuery(params.jobId));
  },
  component: RankingPage,
});

// Meter horizontal acessível para cada célula de score.
function ScoreBar({ label, value }: { label: string; value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const tone =
    v >= 80
      ? "bg-score-good text-score-good-foreground"
      : v >= 60
        ? "bg-score-warn text-score-warn-foreground"
        : "bg-score-bad text-score-bad-foreground";
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      className="flex items-center gap-2"
    >
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${tone.split(" ")[0]}`} style={{ width: `${v}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
        {v}%
      </span>
    </div>
  );
}

function RankingPage() {
  const { jobId } = Route.useParams();
  const { data: job } = useSuspenseQuery(jobQuery(jobId));
  const { data: rows } = useSuspenseQuery(rankingQuery(jobId));

  const sorted = [...(rows ?? [])].sort(
    (a: RankingRow, b: RankingRow) => b.mediaScore - a.mediaScore,
  );

  return (
    <section className="space-y-5">
      <Link
        to="/jobs/$jobId"
        params={{ jobId }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar para a vaga
      </Link>

      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Ranking
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{job.jobTitle}</h1>
        <p className="text-sm text-muted-foreground">
          Candidatos ordenados por média entre soft skills e hard skills.
        </p>
      </header>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-muted-foreground">
          <Inbox className="h-8 w-8" aria-hidden />
          <p className="text-sm">Sem resultados ainda para esta vaga.</p>
        </div>
      ) : (
        // Exceção deliberada à regra "zero tabelas": ranking multi-coluna comparativo
        // é o único caso em que uma <table> real é semanticamente correta.
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Ranking de candidatos com soft skills, hard skills e média
            </caption>
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2 w-10">#</th>
                <th scope="col" className="px-3 py-2">Candidato</th>
                <th scope="col" className="px-3 py-2 min-w-[140px]">Soft</th>
                <th scope="col" className="px-3 py-2 min-w-[140px]">Hard</th>
                <th scope="col" className="px-3 py-2 min-w-[140px]" aria-sort="descending">
                  Média
                </th>
                <th scope="col" className="px-3 py-2 w-10">
                  <span className="sr-only">Abrir</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr
                  key={r.candidateId}
                  className="border-t border-border transition hover:bg-accent/40 focus-within:bg-accent/40"
                >
                  <td className="px-3 py-3 font-semibold tabular-nums text-muted-foreground">
                    {i + 1}
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      to="/candidates/$candidateId"
                      params={{ candidateId: r.candidateId }}
                      className="block focus:outline-none focus-visible:underline"
                      aria-label={`Abrir candidato ${r.fullName}, média ${r.mediaScore}%`}
                    >
                      <span className="block font-semibold text-foreground">
                        {r.fullName}
                      </span>
                      {r.headline && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {r.headline}
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <ScoreBar label={`Soft skills ${r.softScore}%`} value={r.softScore} />
                  </td>
                  <td className="px-3 py-3">
                    <ScoreBar label={`Hard skills ${r.hardScore}%`} value={r.hardScore} />
                  </td>
                  <td className="px-3 py-3">
                    <ScoreBar label={`Média ${r.mediaScore}%`} value={r.mediaScore} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Link
                      to="/candidates/$candidateId"
                      params={{ candidateId: r.candidateId }}
                      aria-label={`Ver detalhes de ${r.fullName}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
