// Frontend uses camelCase; the wire is snake_case (handled by the api client).

export type JobStatus = "active" | "closed";
export type CandidateDecision = "pending" | "approved" | "rejected";
export type ApplicationStatus =
  | "submitted"
  | "screening"
  | "interviewing"
  | "approved"
  | "rejected";

export interface Job {
  jobId: string;
  jobTitle: string;
  hardSkills: string[];
  softSkills: string[];
  status: JobStatus;
  candidateCount?: number;
  createdAt?: string;
}

export interface Candidate {
  candidateId: string;
  jobId: string;
  fullName: string;
  headline?: string;
  aiScore: number; // 0..100
  summary?: string;
  transcript?: string;
  decision: CandidateDecision;
  resumeFileUrl?: string;
}

export interface Application {
  applicationId: string;
  candidateId: string;
  jobId: string;
  jobTitle: string;
  status: ApplicationStatus;
  submittedAt: string;
}

export interface CreateJobInput {
  jobTitle: string;
  hardSkills: string[];
  softSkills: string[];
  // Alias enviado ao backend Python (softskills_alvo).
  softskillsAlvo?: string[];
}

export interface CreateApplicationInput {
  candidateId: string;
  jobId: string;
  resumeFileUrl: string;
}

export interface CreateApplicationResponse {
  applicationId: string;
  telegramUrl: string;
}

// ---- Auth ----
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  role?: "recrutador" | "candidato";
}

export interface LoginInput {
  email: string;
  senha: string;
}

export interface SignupEmpresaInput {
  nome: string;
  email: string;
  senha: string;
}

export interface SignupCandidatoInput {
  nome: string;
  email: string;
  senha: string;
}

// ---- Ranking (GET /vagas/{id}/resultados) ----
export interface RankingRow {
  candidateId: string;
  fullName: string;
  headline?: string;
  softScore: number; // 0..100
  hardScore: number; // 0..100
  mediaScore: number; // 0..100
}

// ---- Interviews ----
export interface InterviewStart {
  entrevistaId: string;
  pergunta: string;
  ordem?: number;
}

export interface InterviewAnswerResponse {
  pergunta?: string;
  ordem?: number;
  done: boolean;
}

export interface InterviewState {
  entrevistaId: string;
  memoria?: unknown;
  softskillsAvaliadas?: string[];
  done?: boolean;
  perguntaAtual?: string;
}

export interface InterviewResult {
  softskills: Record<string, number>;
  hardskills: Record<string, number>;
  media: number;
  resumo?: string;
}
