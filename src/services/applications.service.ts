import { api } from "./api";
import { USE_MOCK, mockApi } from "./mock";
import type {
  Application,
  CreateApplicationInput,
  CreateApplicationResponse,
} from "./types";

export const applicationsService = {
  listMine: () =>
    USE_MOCK ? mockApi.listMyApplications() : api.get<Application[]>("/applications/me"),
  create: (input: CreateApplicationInput) =>
    USE_MOCK
      ? mockApi.createApplication(input)
      : api.post<CreateApplicationResponse>("/applications", { candidateData: input }),
};
