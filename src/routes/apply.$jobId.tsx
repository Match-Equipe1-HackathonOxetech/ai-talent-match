import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { queryOptions, useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Globe, Lock, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { AsyncButton } from "@/components/async-button";
import { Badge } from "@/components/ui/badge";
import { jobsService } from "@/services/jobs.service";
import { interviewsService } from "@/services/interviews.service";
import { ApiError } from "@/services/api";

const jobQuery = (jobId: string) =>
  queryOptions({ queryKey: ["job", jobId], queryFn: () => jobsService.get(jobId) });

export const Route = createFileRoute("/apply/$jobId")({
  head: ({ params }) => ({
    meta: [
      { title: `Aplicar — Vaga ${params.jobId}` },
      { name: "description", content: "Escolha o canal para iniciar sua entrevista com a IA." },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(jobQuery(params.jobId)),
  component: ApplyPage,
});

function ApplyPage() {
  const { jobId } = Route.useParams();
  const { data: job } = useSuspenseQuery(jobQuery(jobId));
  const navigate = useNavigate();

  const startSite = useMutation({
    mutationFn: () => interviewsService.start(jobId),
    onSuccess: (res) => {
      toast.success("Entrevista iniciada!");
      navigate({ to: "/interviews/$interviewId", params: { interviewId: res.entrevistaId } });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Não foi possível iniciar a entrevista.";
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
        <p className="text-sm text-muted-foreground">
          Escolha o canal para conversar com a IA e iniciar sua entrevista.
        </p>
      </header>

      <ul className="space-y-2" aria-label="Canais de entrevista disponíveis">
        <li>
          <AsyncButton
            className="w-full justify-start"
            loading={startSite.isPending}
            loadingLabel="Iniciando..."
            onClick={() => startSite.mutate()}
            aria-label="Iniciar entrevista pelo site"
          >
            <Globe className="mr-2 h-4 w-4" aria-hidden />
            <span className="flex-1 text-left">Pelo site</span>
          </AsyncButton>
        </li>
        <li>
          <AsyncButton asChild variant="outline" className="w-full justify-start">
            <a
              href={`https://t.me/HireAIBot?start=${encodeURIComponent(jobId)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Iniciar entrevista pelo Telegram"
            >
              <Send className="mr-2 h-4 w-4" aria-hidden />
              <span className="flex-1 text-left">Telegram</span>
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
            </a>
          </AsyncButton>
        </li>
        <li>
          <button
            type="button"
            disabled
            aria-label="Entrevista pelo WhatsApp — em breve"
            aria-disabled="true"
            className="flex min-h-11 w-full cursor-not-allowed items-center rounded-md border border-dashed border-border bg-muted/40 px-4 py-2 text-sm text-muted-foreground"
          >
            <MessageCircle className="mr-2 h-4 w-4" aria-hidden />
            <span className="flex-1 text-left">WhatsApp</span>
            <Badge variant="secondary" className="ml-2 gap-1 font-normal">
              <Lock className="h-3 w-3" aria-hidden />
              Em breve
            </Badge>
          </button>
        </li>
      </ul>

      <p className="text-xs text-muted-foreground">
        WhatsApp faz parte do nosso roadmap.
      </p>
    </section>
  );
}
