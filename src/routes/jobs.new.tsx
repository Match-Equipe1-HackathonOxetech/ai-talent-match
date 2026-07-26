import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AsyncButton } from "@/components/async-button";
import { SkillTagInput } from "@/components/skill-tag-input";
import { jobsService } from "@/services/jobs.service";
import { ApiError } from "@/services/api";

export const Route = createFileRoute("/jobs/new")({
  head: () => ({
    meta: [
      { title: "Nova vaga — HireAI" },
      { name: "description", content: "Crie uma nova vaga informando título e habilidades." },
    ],
  }),
  component: NewJobPage,
});

function NewJobPage() {
  const [title, setTitle] = useState("");
  const [hard, setHard] = useState<string[]>([]);
  const [soft, setSoft] = useState<string[]>([]);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      jobsService.create({ jobTitle: title.trim(), hardSkills: hard, softSkills: soft }),
    onSuccess: (job) => {
      toast.success("Vaga criada com sucesso!");
      qc.invalidateQueries({ queryKey: ["jobs"] });
      navigate({ to: "/jobs/$jobId", params: { jobId: job.jobId } });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Não foi possível criar a vaga.";
      toast.error(msg);
    },
  });

  const canSubmit = title.trim().length > 2 && hard.length > 0;

  return (
    <section className="space-y-5">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Nova vaga</h1>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit || mutation.isPending) return;
          mutation.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="job-title">Título da vaga</Label>
          <Input
            id="job-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Desenvolvedor(a) Backend Python"
            required
            minLength={3}
            autoComplete="off"
          />
        </div>

        <SkillTagInput
          label="Hard skills"
          value={hard}
          onChange={setHard}
          placeholder="Python, PostgreSQL, Docker..."
        />
        <SkillTagInput
          label="Soft skills"
          value={soft}
          onChange={setSoft}
          placeholder="Comunicação, autonomia..."
        />

        <AsyncButton
          type="submit"
          className="w-full"
          loading={mutation.isPending}
          loadingLabel="Publicando..."
          disabled={!canSubmit}
        >
          Publicar vaga
        </AsyncButton>
      </form>
    </section>
  );
}
