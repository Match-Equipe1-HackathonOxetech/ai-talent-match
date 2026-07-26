import { api } from "./api";
import type { Candidate, CandidateDecision } from "./types";

export const candidatesService = {
  listByJob: (jobId: string) =>
    api.get<Candidate[]>(`/jobs/${jobId}/candidates`),
  get: (candidateId: string) =>
    api.get<Candidate>(`/candidates/${candidateId}`),
  decide: (candidateId: string, decision: Exclude<CandidateDecision, "pending">) =>
    api.patch<Candidate>(`/candidates/${candidateId}`, { decision }),
};
