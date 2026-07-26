import { api } from "./api";
import { USE_MOCK, mockApi } from "./mock";
import type { Candidate, CandidateDecision } from "./types";

export const candidatesService = {
  listByJob: (jobId: string) =>
    USE_MOCK
      ? mockApi.listCandidatesByJob(jobId)
      : api.get<Candidate[]>(`/jobs/${jobId}/candidates`),
  get: (candidateId: string) =>
    USE_MOCK
      ? mockApi.getCandidate(candidateId)
      : api.get<Candidate>(`/candidates/${candidateId}`),
  decide: (candidateId: string, decision: Exclude<CandidateDecision, "pending">) =>
    USE_MOCK
      ? mockApi.decideCandidate(candidateId, decision)
      : api.patch<Candidate>(`/candidates/${candidateId}`, { decision }),
};
