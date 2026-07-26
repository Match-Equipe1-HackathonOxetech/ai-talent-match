import { api } from "./api";
import { USE_MOCK, mockApi } from "./mock";
import type { Job, CreateJobInput } from "./types";

export const jobsService = {
  list: (params?: { status?: "active" | "closed" }) =>
    USE_MOCK ? mockApi.listJobs(params?.status) : api.get<Job[]>("/jobs", params),
  get: (jobId: string) =>
    USE_MOCK ? mockApi.getJob(jobId) : api.get<Job>(`/jobs/${jobId}`),
  create: (input: CreateJobInput) =>
    USE_MOCK ? mockApi.createJob(input) : api.post<Job>("/jobs", { jobData: input }),
  close: (jobId: string) =>
    USE_MOCK ? mockApi.closeJob(jobId) : api.patch<Job>(`/jobs/${jobId}/close`),
};
