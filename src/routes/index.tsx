import { createFileRoute, redirect } from "@tanstack/react-router";
import { authStore } from "@/stores/auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const { accessToken } = authStore.getSnapshot();
    throw redirect({ to: accessToken ? "/jobs" : "/login" });
  },
});
