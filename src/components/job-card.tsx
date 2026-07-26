import { Link } from "@tanstack/react-router";
import { Users, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/services/types";

export function JobCard({ job }: { job: Job }) {
  return (
    <li>
      <Link
        to="/jobs/$jobId"
        params={{ jobId: job.jobId }}
        aria-label={`Abrir vaga ${job.jobTitle}`}
        className="block rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/40 focus-visible:border-primary"
      >
        <div className="flex items-start gap-3">
          <div
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"
          >
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-foreground">
              {job.jobTitle}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {job.candidateCount ?? 0} candidatos
            </p>
          </div>
        </div>
        {(job.hardSkills?.length ?? 0) + (job.softSkills?.length ?? 0) > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Habilidades">
            {job.hardSkills?.slice(0, 4).map((s) => (
              <li key={`h-${s}`}>
                <Badge variant="secondary" className="font-normal">
                  {s}
                </Badge>
              </li>
            ))}
            {job.softSkills?.slice(0, 2).map((s) => (
              <li key={`s-${s}`}>
                <Badge variant="outline" className="font-normal">
                  {s}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Link>
    </li>
  );
}
