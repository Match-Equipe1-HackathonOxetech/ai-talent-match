import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout parent para /jobs/$jobId/* — hospeda a rota index (detalhes) e o ranking.
export const Route = createFileRoute("/jobs/$jobId")({
  component: () => <Outlet />,
});
