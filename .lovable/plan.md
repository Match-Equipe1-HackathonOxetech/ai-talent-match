
# MVP Recrutamento IA — Frontend Mobile-First

Stack real do projeto: **TanStack Start + React 19 + Vite 7 + Tailwind v4 + shadcn/ui** (não Vite/React puro). Aplico todas as suas restrições sobre essa base — roteamento file-based em `src/routes/`, sem `react-router-dom`.

## 1. Design System (Soft Light Mode)

Ajustes em `src/styles.css`:
- `--background: oklch(0.985 0.005 250)` (~ #F7F9FC, off-white azulado)
- `--foreground: oklch(0.22 0.02 260)` (cinza-chumbo, contraste AA+)
- `--card: oklch(0.995 0.003 250)` levemente acima do bg
- `--primary` índigo suave; `--accent-score` verde/âmbar/vermelho para faixas do AI Score
- Tipografia: Inter via `<link>` em `__root.tsx`
- Sem `#FFFFFF` puro em nenhum componente; só tokens semânticos (`bg-background`, `text-foreground`).

## 2. Layout & Navegação

- `src/routes/__root.tsx`: passa a envolver o `<Outlet />` num `AppShell` com:
  - `Header` fino (logo + toggle de papel Recrutador/Candidato guardado em `localStorage` via `useRoleStore`)
  - `<main>` único, `min-h-dvh`, `pb-20` para não colidir com a bottom bar
  - `BottomTabBar` fixa (`fixed bottom-0 inset-x-0`), 4 tabs conforme papel:
    - Recrutador: Vagas • Nova Vaga • Candidatos • Perfil
    - Candidato: Vagas • Minhas Aplicações • Perfil
  - Tabs com `min-h-14 min-w-14`, ícones lucide + label, `aria-current="page"` no ativo.

## 3. Rotas (file-based)

```
src/routes/
  __root.tsx                       (AppShell + role toggle)
  index.tsx                        (redireciona para /jobs)
  jobs.tsx                         (layout <Outlet/>)
  jobs.index.tsx                   (lista de vagas — Recrutador vê próprias, Candidato vê abertas)
  jobs.$jobId.tsx                  (detalhe vaga + lista de candidatos por AI Score OU botão "Aplicar" p/ candidato)
  jobs.new.tsx                     (form criação — Recrutador)
  candidates.$candidateId.tsx      (card expandido: score, resumo, acordeão transcrição, aprovar/rejeitar)
  applications.tsx                 (Candidato: status das aplicações)
  apply.$jobId.tsx                 (fluxo: upload CV → botão → redireciona t.me/Bot?start=UUID)
  profile.tsx
```

Cada rota define `head()` com título/description próprios.

## 4. Service Layer (`src/services/`)

Nenhum `fetch`/`axios` em componentes. Estrutura:

```
src/services/
  api.ts             (cliente base: baseURL = import.meta.env.VITE_API_URL,
                      interceptor pronto p/ Authorization: Bearer <token> quando auth existir,
                      timeout, JSON parse, erro tipado ApiError)
  case.ts            (camelToSnake / snakeToCamel deep recursivos)
  jobs.service.ts    (listJobs, getJob, createJob, closeJob)
  candidates.service.ts (listCandidatesByJob, getCandidate, decideCandidate)
  applications.service.ts (listMyApplications, createApplication → devolve telegram_url)
  types.ts           (tipos camelCase p/ o front)
```

- Todo **payload de saída** passa por `camelToSnake` (contrato Python garantido).
- Toda **resposta** passa por `snakeToCamel` para a UI trabalhar em camelCase.
- Endpoints (REST padrão, conforme escolhido):
  - `GET/POST /jobs`, `GET /jobs/:id`, `PATCH /jobs/:id/close`
  - `GET /jobs/:id/candidates`
  - `GET /candidates/:id`, `PATCH /candidates/:id` (`{ decision: "approved"|"rejected" }`)
  - `GET /applications/me`, `POST /applications` → `{ telegram_url }`
- `.env.example` com `VITE_API_URL=`.
- Sem login agora; interceptor lê `localStorage.getItem("auth_token")` se existir (pronto para plugar depois).

## 5. Data fetching

- TanStack Query já disponível. Loaders usam `queryClient.ensureQueryData(queryOptions)` e componentes usam `useSuspenseQuery`.
- Mutations (`createJob`, `decideCandidate`, `createApplication`) via `useMutation`:
  - Botão fica `disabled` no `isPending` (previne duplo-clique)
  - Spinner inline (`Loader2` do lucide) dentro do botão
  - `onError` dispara `toast.error(...)` (sonner) com mensagem amigável derivada de `ApiError`
  - `onSuccess` dispara `toast.success(...)` e invalida queries relacionadas

## 6. Componentes de UI (`src/components/`)

- `AppShell`, `Header`, `BottomTabBar`, `RoleToggle`
- `JobCard` — stacked card (título, skills como chips, contagem candidatos, status)
- `CandidateCard` — **AI Score em destaque absoluto**: círculo grande 72px, cor por faixa (≥80 verde, 60–79 âmbar, <60 vermelho), nome + tagline
- `CandidateDetail` — Score hero + "Resumo Analítico" (parágrafo) + `Accordion` (shadcn) "Transcrição da Entrevista" + botões Aprovar/Rejeitar
- `SkillTagInput` — input de tags (Enter/vírgula adiciona, Backspace remove) com `aria-label` e feedback para screen reader
- `ResumeUpload` — dropzone simulado (`<input type="file">` estilizado, mostra nome/tamanho, sem upload real ainda; devolve `resume_file_url` mock ou usa URL retornada por endpoint futuro)
- `AsyncButton` — wrapper padrão (loading + disabled + aria-busy)
- `EmptyState`, `Tabs` (shadcn) para "Vagas Ativas / Fechadas" e "Aplicações"

**Zero `<table>`** — todas as listas usam `<ul>` + `<li>` com cards.

## 7. Acessibilidade (WCAG AA)

- Um único `<main>` no AppShell
- Tokens de contraste testados (foreground vs background AA)
- `aria-label` em todos ícones-botão (bottom tabs, close, upload)
- `aria-current="page"` na tab ativa, `aria-live="polite"` para toasts (sonner já faz)
- Foco visível via `focus-visible:ring-2 ring-ring`
- Tap targets ≥ 44×44 (bottom tabs 56px)
- Acordeão da transcrição via Radix (shadcn Accordion) — teclado OK
- `lang="pt-BR"` no `<html>`

## 8. Detalhes técnicos (para dev)

- Toggle de papel: `src/stores/role.ts` (Zustand leve ou `useSyncExternalStore` sobre localStorage). Rotas checam papel e escondem tabs/rotas indevidas (sem gate de auth real).
- `camelToSnake`/`snakeToCamel` recursivos ignoram `File`, `Blob`, `Date`.
- `ApiError` normaliza `{status, message, details}`; mensagens amigáveis por status (400 "Dados inválidos", 401 "Sessão expirada", 5xx "Serviço indisponível, tente novamente").
- Sem `og:image` nas rotas (sem hero absoluto ainda).

## 9. Fora de escopo (confirmar depois)

- Auth real (aguardando contrato)
- Upload real de currículo para storage (só simulação client-side agora)
- Persistência dos dados mock — tudo vive via API externa quando `VITE_API_URL` estiver configurado; sem fallback offline.

Aprova para eu implementar?
