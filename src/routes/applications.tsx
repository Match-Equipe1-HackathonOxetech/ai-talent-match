import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { applicationsService } from "@/services/applications.service";
import { Badge } from "@/components/ui/badge";
import type { Application, ApplicationStatus } from "@/services/types";

const myApplicationsQuery = queryOptions({
  queryKey: ["applications", "me"],
  queryFn: () => applicationsService.listMine(),
});

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "Minhas aplicações — HireAI" },
      { name: "description", content: "Acompanhe o status das suas candidaturas." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(myApplicationsQuery),
  component: ApplicationsPage,
});

const statusLabel: Record<ApplicationStatus, string> = {
  submitted: "Enviada",
  screening: "Em triagem",
  interviewing: "Em entrevista",
  approved: "Aprovada",
  rejected: "Rejeitada",
};

function statusVariant(s: ApplicationStatus) {
  if (s === "approved") return "default" as const;
  if (s === "rejected") return "destructive" as const;
  return "secondary" as const;
}

function ApplicationsPage() {
  const { data } = useSuspenseQuery(myApplicationsQuery);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Minhas aplicações</h1>
      {!data || data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-muted-foreground">
          <Inbox className="h-8 w-8" aria-hidden />
          <p className="text-sm">Você ainda não aplicou para nenhuma vaga.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.map((a: Application) => (
            <li
              key={a.applicationId}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-semibold">{a.jobTitle}</h2>
                <p className="text-xs text-muted-foreground">
                  Enviada em {new Date(a.submittedAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <Badge variant={statusVariant(a.status)} className="shrink-0">
                {statusLabel[a.status]}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
