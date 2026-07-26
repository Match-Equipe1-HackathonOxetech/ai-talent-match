import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AsyncButton } from "@/components/async-button";
import { interviewsService } from "@/services/interviews.service";
import { ApiError } from "@/services/api";
import type { InterviewResult } from "@/services/types";

export const Route = createFileRoute("/interviews/$interviewId")({
  head: ({ params }) => ({
    meta: [
      { title: `Entrevista ${params.interviewId} — HireAI` },
      { name: "description", content: "Entrevista conduzida por IA no navegador." },
    ],
  }),
  component: InterviewPage,
});

interface Turn {
  role: "ai" | "user";
  text: string;
}

function InterviewPage() {
  const { interviewId } = Route.useParams();
  const navigate = useNavigate();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const bootstrapped = useRef(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Hidrata a primeira pergunta do estado atual da entrevista.
  const state = useQuery({
    queryKey: ["interview", interviewId],
    queryFn: () => interviewsService.getState(interviewId),
    retry: false,
  });

  useEffect(() => {
    if (bootstrapped.current || !state.data) return;
    if (state.data.perguntaAtual) {
      setTurns([{ role: "ai", text: state.data.perguntaAtual }]);
    }
    if (state.data.done) setDone(true);
    bootstrapped.current = true;
  }, [state.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, done, result]);

  const send = useMutation({
    mutationFn: (resposta: string) => interviewsService.answer(interviewId, resposta),
    onSuccess: (res, resposta) => {
      setTurns((prev) => [
        ...prev,
        { role: "user", text: resposta },
        ...(res.pergunta ? [{ role: "ai" as const, text: res.pergunta }] : []),
      ]);
      setInput("");
      if (res.done) {
        setDone(true);
        finalize.mutate();
      }
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Falha ao enviar resposta.";
      toast.error(msg);
    },
  });

  const finalize = useMutation({
    mutationFn: () => interviewsService.getResult(interviewId),
    onSuccess: (res) => {
      setResult(res);
      toast.success("Entrevista concluída!");
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Não foi possível gerar o resultado.";
      toast.error(msg);
    },
  });

  return (
    <section className="flex min-h-[70vh] flex-col gap-4">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Sair da entrevista
      </Link>
      <header className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"
        >
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight">Entrevista com a IA</h1>
          <p className="text-xs text-muted-foreground">
            Responda com calma; suas respostas alimentam o AI Score.
          </p>
        </div>
      </header>

      <ol
        aria-label="Diálogo da entrevista"
        aria-live="polite"
        className="flex flex-1 flex-col gap-3 rounded-2xl border border-border bg-card p-4"
      >
        {turns.length === 0 && state.isLoading && (
          <li className="text-sm text-muted-foreground">Carregando entrevista...</li>
        )}
        {turns.map((t, i) => (
          <li
            key={i}
            className={
              t.role === "ai"
                ? "max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm"
                : "max-w-[85%] self-end rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
            }
          >
            {t.text}
          </li>
        ))}
        <div ref={bottomRef} />
      </ol>

      {done && result && (
        <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
          <h2 className="text-base font-semibold">Resultado</h2>
          <p className="text-sm">
            Média final:{" "}
            <span className="font-bold tabular-nums">{Math.round(result.media)}%</span>
          </p>
          {result.resumo && (
            <p className="text-sm text-muted-foreground">{result.resumo}</p>
          )}
          <AsyncButton onClick={() => navigate({ to: "/applications" })} className="w-full">
            Ver minhas aplicações
          </AsyncButton>
        </div>
      )}

      {!done && (
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const text = input.trim();
            if (!text || send.isPending) return;
            send.mutate(text);
          }}
        >
          <label htmlFor="answer" className="sr-only">
            Sua resposta
          </label>
          <textarea
            id="answer"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="Digite sua resposta..."
            className="min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-primary"
          />
          <AsyncButton
            type="submit"
            aria-label="Enviar resposta"
            loading={send.isPending}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" aria-hidden />
          </AsyncButton>
        </form>
      )}
    </section>
  );
}
