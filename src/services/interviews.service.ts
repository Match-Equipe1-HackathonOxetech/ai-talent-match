import { api } from "./api";
import type {
  InterviewAnswerResponse,
  InterviewResult,
  InterviewStart,
  InterviewState,
} from "./types";

export const interviewsService = {
  start: (jobId: string) =>
    api.post<InterviewStart>("/entrevistas", { vagaId: jobId }),
  answer: (entrevistaId: string, resposta: string) =>
    api.post<InterviewAnswerResponse>(`/entrevistas/${entrevistaId}/respostas`, {
      resposta,
    }),
  getState: (entrevistaId: string) =>
    api.get<InterviewState>(`/entrevistas/${entrevistaId}`),
  getResult: (entrevistaId: string) =>
    api.post<InterviewResult>(`/entrevistas/${entrevistaId}/resultado`),
};
