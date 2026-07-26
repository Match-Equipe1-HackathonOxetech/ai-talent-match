import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Vagas — HireAI" },
      { name: "description", content: "Lista de vagas ativas e fechadas com AI Score dos candidatos." },
      { property: "og:title", content: "Vagas — HireAI" },
      { property: "og:description", content: "Gerencie vagas e veja candidatos ordenados por AI Score." },
    ],
  }),
  component: () => <Outlet />,
});
