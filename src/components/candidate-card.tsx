import { Link } from "@tanstack/react-router";
import { ScoreRing } from "./score-ring";
import type { Candidate } from "@/services/types";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <li>
      <Link
        to="/candidates/$candidateId"
        params={{ candidateId: candidate.candidateId }}
        aria-label={`Ver candidato ${candidate.fullName}, AI Score ${candidate.aiScore}`}
        className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/40 focus-visible:border-primary"
      >
        <ScoreRing score={candidate.aiScore} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground">
            {candidate.fullName}
          </h3>
          {candidate.headline && (
            <p className="truncate text-sm text-muted-foreground">
              {candidate.headline}
            </p>
          )}
          {candidate.decision !== "pending" && (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {candidate.decision === "approved" ? "Aprovado" : "Rejeitado"}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
