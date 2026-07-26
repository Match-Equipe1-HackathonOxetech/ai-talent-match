import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Plus, Inbox } from "lucide-react";
import { jobsService } from "@/services/jobs.service";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { useRole } from "@/stores/role";
import type { Job, JobStatus } from "@/services/types";

const jobsQuery = (status: JobStatus) =>
  queryOptions({
    queryKey: ["jobs", status],
    queryFn: () => jobsService.list({ status }),
  });

export const Route = createFileRoute("/jobs/")({
  head: () => ({
    meta: [
      { title: "Vagas — HireAI" },
      { name: "description", content: "Vagas ativas e fechadas em um só lugar." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(jobsQuery("active"));
  },
  component: JobsListPage,
});

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-muted-foreground">
      <Inbox className="h-8 w-8" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function JobList({ status }: { status: JobStatus }) {
  const { data } = useSuspenseQuery(jobsQuery(status));
  if (!data || data.length === 0)
    return <EmptyState label={status === "active" ? "Nenhuma vaga ativa." : "Nenhuma vaga fechada."} />;
  return (
    <ul className="flex flex-col gap-3">
      {data.map((j: Job) => (
        <JobCard key={j.jobId} job={j} />
      ))}
    </ul>
  );
}

function JobsListPage() {
  const [role] = useRole();
  return (
    <section aria-labelledby="jobs-title" className="space-y-4">
      <header className="flex items-center gap-3">
        <h1 id="jobs-title" className="text-2xl font-bold tracking-tight">
          Vagas
        </h1>
        {role === "recruiter" && (
          <Button asChild size="sm" className="ml-auto min-h-11">
            <Link to="/jobs/new" aria-label="Criar nova vaga">
              <Plus className="mr-1 h-4 w-4" aria-hidden />
              Nova vaga
            </Link>
          </Button>
        )}
      </header>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Ativas</TabsTrigger>
          <TabsTrigger value="closed">Fechadas</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <JobList status="active" />
        </TabsContent>
        <TabsContent value="closed" className="mt-4">
          <JobList status="closed" />
        </TabsContent>
      </Tabs>
    </section>
  );
}
