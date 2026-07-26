import { api, ApiError } from "./api";
import { USE_MOCK, mockApi } from "./mock";
import type { Job, CreateJobInput, RankingRow } from "./types";

// Fallback quando GET /empresas não existir no backend.
const FALLBACK_EMPRESA_IDS = ["ddd2c4674dc94774bca7c1bab2032f78"];

async function listEmpresaIds(): Promise<string[]> {
  try {
    const empresas = await api.get<Array<{ id?: string; empresaId?: string }>>(
      "/empresas",
    );
    const ids = (empresas ?? [])
      .map((e) => e.empresaId ?? e.id)
      .filter((v): v is string => Boolean(v));
    return ids.length > 0 ? ids : FALLBACK_EMPRESA_IDS;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
      return FALLBACK_EMPRESA_IDS;
    }
    throw err;
  }
}

async function safeList(params?: { status?: "active" | "closed" }): Promise<Job[]> {
  try {
    const ids = await listEmpresaIds();
    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          return await api.get<Job[]>(`/empresas/${id}/vagas`);
        } catch (err) {
          if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
            return [];
          }
          throw err;
        }
      }),
    );
    const all = results.flat();
    if (!params?.status) return all;
    return all.filter((j) => (j.status ?? "active") === params.status);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
      return [];
    }
    throw err;
  }
}

export const jobsService = {
  list: (params?: { status?: "active" | "closed" }) =>
    USE_MOCK ? mockApi.listJobs(params?.status) : safeList(params),
  get: (jobId: string) =>
    USE_MOCK ? mockApi.getJob(jobId) : api.get<Job>(`/vagas/${jobId}`),
  create: (input: CreateJobInput) => {
    // Payload em português conforme contrato do backend Python.
    const payload = {
      titulo: input.jobTitle,
      hardskills: input.hardSkills,
      softskills_alvo: input.softskillsAlvo ?? input.softSkills,
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
