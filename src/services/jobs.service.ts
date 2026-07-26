import { api } from "./api";
import { USE_MOCK, mockApi } from "./mock";
import type { Job, CreateJobInput, RankingRow } from "./types";

export const jobsService = {
  list: (params?: { status?: "active" | "closed" }) =>
    USE_MOCK ? mockApi.listJobs(params?.status) : api.get<Job[]>("/vagas", params),
  get: (jobId: string) =>
    USE_MOCK ? mockApi.getJob(jobId) : api.get<Job>(`/vagas/${jobId}`),
  create: (input: CreateJobInput) => {
    const payload = {
      jobTitle: input.jobTitle,
      hardSkills: input.hardSkills,
      softskillsAlvo: input.softskillsAlvo ?? input.softSkills,
    };
    return USE_MOCK ? mockApi.createJob(input) : api.post<Job>("/vagas", payload);
  },
  close: (jobId: string) =>
    USE_MOCK ? mockApi.closeJob(jobId) : api.patch<Job>(`/vagas/${jobId}/close`),
  ranking: (jobId: string) =>
    USE_MOCK
      ? mockApi.rankingByJob(jobId)
      : api.get<RankingRow[]>(`/vagas/${jobId}/resultados`),
};
