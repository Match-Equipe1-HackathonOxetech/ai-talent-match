import { api } from "./api";
import type { Job, CreateJobInput } from "./types";

export const jobsService = {
  list: (params?: { status?: "active" | "closed" }) =>
    api.get<Job[]>("/jobs", params),
  get: (jobId: string) => api.get<Job>(`/jobs/${jobId}`),
  create: (input: CreateJobInput) =>
    api.post<Job>("/jobs", { jobData: input }),
  close: (jobId: string) => api.patch<Job>(`/jobs/${jobId}/close`),
};
