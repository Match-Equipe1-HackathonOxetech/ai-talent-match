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
