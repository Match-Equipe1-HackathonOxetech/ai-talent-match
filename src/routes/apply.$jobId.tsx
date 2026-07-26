import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { AsyncButton } from "@/components/async-button";
import { ResumeUpload } from "@/components/resume-upload";
import { jobsService } from "@/services/jobs.service";
import { applicationsService } from "@/services/applications.service";
import { ApiError } from "@/services/api";

const jobQuery = (jobId: string) =>
  queryOptions({ queryKey: ["job", jobId], queryFn: () => jobsService.get(jobId) });

export const Route = createFileRoute("/apply/$jobId")({
  head: ({ params }) => ({
    meta: [
      { title: `Aplicar — Vaga ${params.jobId}` },
      { name: "description", content: "Envie seu currículo e comece a entrevista pelo Telegram." },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(jobQuery(params.jobId)),
  component: ApplyPage,
});

// Placeholder candidate identity — real auth flow will replace this.
function getCandidateId(): string {
  if (typeof window === "undefined") return "anonymous";
  let id = window.localStorage.getItem("candidate_id");
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem("candidate_id", id);
  }
  return id;
}

function ApplyPage() {
  const { jobId } = Route.useParams();
  const { data: job } = useSuspenseQuery(jobQuery(jobId));
  const [file, setFile] = useState<File | null>(null);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: async () => {
      if (!file) throw new ApiError(400, "Selecione um currículo antes de continuar.");
      // Upload-simulation: real integration will upload the file and get back a URL.
      const resumeFileUrl = `local://uploads/${encodeURIComponent(file.name)}`;
      return applicationsService.create({
        candidateId: getCandidateId(),
        jobId,
        resumeFileUrl,
      });
    },
    onSuccess: (res) => {
      toast.success("Aplicação enviada! Continue no Telegram.");
      setTelegramUrl(res.telegramUrl);
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Falha ao enviar aplicação.";
      toast.error(msg);
    },
  });

  return (
    <section className="space-y-5">
      <Link
        to="/jobs/$jobId"
        params={{ jobId }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar
      </Link>

      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Aplicar
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{job.jobTitle}</h1>
      </header>

      {telegramUrl ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5 text-center">
          <h2 className="text-lg font-semibold">Tudo pronto!</h2>
          <p className="text-sm text-muted-foreground">
            Sua entrevista com a IA acontece no Telegram. Clique abaixo para começar.
          </p>
          <AsyncButton asChild className="w-full">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir entrevista no Telegram"
            >
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
              Abrir Telegram
            </a>
          </AsyncButton>
        </div>
      ) : (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (submit.isPending) return;
            submit.mutate();
          }}
        >
          <ResumeUpload onChange={setFile} />
          <AsyncButton
            type="submit"
            className="w-full"
            loading={submit.isPending}
            loadingLabel="Enviando..."
            disabled={!file}
          >
            Iniciar entrevista
          </AsyncButton>
        </form>
      )}
    </section>
  );
}
