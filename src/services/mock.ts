// In-memory mock backend used when VITE_API_URL is not configured, so the app
// remains fully navigable during frontend development.
import type {
  Application,
  Candidate,
  CreateApplicationInput,
  CreateApplicationResponse,
  CreateJobInput,
  Job,
} from "./types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const jobs: Job[] = [
  {
    jobId: "j-001",
    jobTitle: "Desenvolvedor(a) Backend Python",
    hardSkills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    softSkills: ["Comunicação", "Autonomia"],
    status: "active",
    candidateCount: 3,
    createdAt: new Date().toISOString(),
  },
  {
    jobId: "j-002",
    jobTitle: "Product Designer Sênior",
    hardSkills: ["Figma", "Design System", "Pesquisa"],
    softSkills: ["Colaboração"],
    status: "active",
    candidateCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    jobId: "j-003",
    jobTitle: "Analista de Dados Pleno",
    hardSkills: ["SQL", "Python", "dbt"],
    softSkills: ["Storytelling"],
    status: "closed",
    candidateCount: 5,
    createdAt: new Date().toISOString(),
  },
];

const candidates: Candidate[] = [
  {
    candidateId: "c-001",
    jobId: "j-001",
    fullName: "Marina Alves",
    headline: "Backend Engineer • 6 anos",
    aiScore: 92,
    summary:
      "Forte experiência em FastAPI e otimização de consultas Postgres. Excelente comunicação técnica e alinhamento cultural com o time.",
    transcript:
      "IA: Fale sobre um projeto backend recente.\nCandidata: Migrei uma API monolítica para microsserviços em FastAPI, reduzindo latência em 40%...",
    decision: "pending",
  },
  {
    candidateId: "c-002",
    jobId: "j-001",
    fullName: "Rafael Souza",
    headline: "Python Developer",
    aiScore: 74,
    summary: "Bom domínio de Python e Docker; experiência limitada em PostgreSQL avançado.",
    transcript: "IA: Como você lida com deploys?\nCandidato: Uso GitHub Actions com Docker...",
    decision: "pending",
  },
  {
    candidateId: "c-003",
    jobId: "j-001",
    fullName: "Beatriz Lima",
    headline: "Estagiária de Backend",
    aiScore: 48,
    summary: "Perfil júnior; conhecimentos iniciais em Python. Grande potencial de aprendizado.",
    transcript: "IA: Já trabalhou com APIs REST?\nCandidata: Sim, em projetos acadêmicos...",
    decision: "pending",
  },
  {
    candidateId: "c-101",
    jobId: "j-002",
    fullName: "João Pereira",
    headline: "Senior Product Designer",
    aiScore: 88,
    summary: "Portfólio robusto em SaaS B2B, forte em design system.",
    decision: "pending",
  },
];

const applications: Application[] = [];

const delay = <T>(v: T, ms = 250) =>
  new Promise<T>((r) => setTimeout(() => r(v), ms));

export const mockApi = {
  listJobs: (status?: "active" | "closed") =>
    delay(status ? jobs.filter((j) => j.status === status) : jobs),
  getJob: (jobId: string) => {
    const j = jobs.find((x) => x.jobId === jobId);
    if (!j) return Promise.reject(new Error("Vaga não encontrada"));
    return delay(j);
  },
  createJob: (input: CreateJobInput) => {
    const j: Job = {
      jobId: `j-${uid().slice(0, 6)}`,
      jobTitle: input.jobTitle,
      hardSkills: input.hardSkills,
      softSkills: input.softSkills,
      status: "active",
      candidateCount: 0,
      createdAt: new Date().toISOString(),
    };
    jobs.unshift(j);
    return delay(j);
  },
  closeJob: (jobId: string) => {
    const j = jobs.find((x) => x.jobId === jobId);
    if (j) j.status = "closed";
    return delay(j as Job);
  },
  listCandidatesByJob: (jobId: string) =>
    delay(candidates.filter((c) => c.jobId === jobId)),
  rankingByJob: (jobId: string) =>
    delay(
      candidates
        .filter((c) => c.jobId === jobId)
        .map((c) => {
          const hard = Math.max(0, Math.min(100, c.aiScore + Math.round((Math.random() - 0.5) * 10)));
          const soft = Math.max(0, Math.min(100, c.aiScore + Math.round((Math.random() - 0.5) * 10)));
          const media = Math.round((hard + soft) / 2);
          return {
            candidateId: c.candidateId,
            fullName: c.fullName,
            headline: c.headline,
            hardScore: hard,
            softScore: soft,
            mediaScore: media,
          };
        }),
    ),
  getCandidate: (id: string) => {
    const c = candidates.find((x) => x.candidateId === id);
    if (!c) return Promise.reject(new Error("Candidato não encontrado"));
    return delay(c);
  },
  decideCandidate: (id: string, decision: "approved" | "rejected") => {
    const c = candidates.find((x) => x.candidateId === id);
    if (c) c.decision = decision;
    return delay(c as Candidate);
  },
  listMyApplications: () => delay(applications),
  createApplication: (input: CreateApplicationInput) => {
    const job = jobs.find((j) => j.jobId === input.jobId);
    const app: Application = {
      applicationId: `a-${uid().slice(0, 6)}`,
      candidateId: input.candidateId,
      jobId: input.jobId,
      jobTitle: job?.jobTitle ?? "Vaga",
      status: "submitted",
      submittedAt: new Date().toISOString(),
    };
    applications.unshift(app);
    const res: CreateApplicationResponse = {
      applicationId: app.applicationId,
      telegramUrl: `https://t.me/m4tchoxetechbot?start=${app.applicationId}`,
    };
    return delay(res);
  },
};

export const USE_MOCK = !import.meta.env.VITE_API_URL;
