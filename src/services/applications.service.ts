import { api } from "./api";
import type {
  Application,
  CreateApplicationInput,
  CreateApplicationResponse,
} from "./types";

export const applicationsService = {
  listMine: () => api.get<Application[]>("/applications/me"),
  create: (input: CreateApplicationInput) =>
    api.post<CreateApplicationResponse>("/applications", {
      candidateData: input,
    }),
};
