
## Objetivo
Integrar o frontend à API Python (`http://192.168.151.46:5000`), com auth completa, entrevista pelo site, e tabela de ranking com Soft / Hard / Média (0–100%) para o recrutador.

## 1. Configuração de ambiente
- `.env.example`: `VITE_API_URL=http://192.168.151.46:5000`.
- Remover fallback para `mockApi` — se `VITE_API_URL` ausente, mostrar aviso amigável (banner) mas manter mock só como escape hatch em dev via flag explícita `VITE_USE_MOCK=1`.

## 2. Camada de autenticação
- `src/services/auth.service.ts`: `signupEmpresa`, `signupCandidato`, `login`, `logout`, `refresh`.
- `src/stores/auth.ts` (Zustand-like simples via `useSyncExternalStore`): guarda `accessToken`, `refreshToken`, `role` (`recrutador` | `candidato`), persistidos em `localStorage`.
- `src/services/api.ts`:
  - Injeta `Authorization: Bearer <access>` (substitui leitura direta de `auth_token`).
  - Em resposta 401: chama `POST /refresh` uma vez, atualiza tokens, refaz a requisição. Se falhar → limpa sessão e redireciona para `/login`.
  - Mantém conversão camel↔snake existente.

## 3. Telas de auth (públicas)
- `src/routes/login.tsx`: email + senha, submit chama `/login`, salva tokens/role, redireciona para `/jobs`.
- `src/routes/signup.tsx`: toggle **Empresa / Candidato** no topo → alterna entre `/empresas` e `/candidatos`. Campos mínimos por tipo (nome, email, senha; empresa: razão social/CNPJ opcional se a API pedir).
- `src/routes/_authenticated/route.tsx` (gate): redireciona para `/login` se sem token.
- Mover rotas privadas (`jobs`, `candidates`, `applications`, `profile`, `apply`) para dentro de `_authenticated/`.
- Substituir o toggle atual de papel em `src/stores/role.ts` pela role vinda do token/login (compat: mantém a mesma API `useRole()`).

## 4. Contrato de dados atualizado (types)
Adicionar em `src/services/types.ts`:
```ts
interface SoftHardScore { soft: number; hard: number; media: number } // 0..100
interface RankedCandidate extends Candidate { scores: SoftHardScore }
interface CreateVagaInput { jobTitle: string; hardSkills: string[]; softskillsAlvo: string[] }
interface InterviewState { entrevistaId: string; memoria: unknown; softskillsAvaliadas: string[]; done: boolean }
interface InterviewQuestion { pergunta: string; ordem: number }
interface InterviewResult { softskills: Record<string, number>; hardskills: Record<string, number>; media: number; resumo?: string }
```

## 5. Services mapeados aos endpoints
- `jobs.service.ts` → `POST /vagas`, `GET /vagas/{id}/resultados` (retorna lista com `soft/hard/media`).
- `interviews.service.ts` (novo):
  - `start(vagaId)` → `POST /entrevistas` retorna `{ entrevistaId, pergunta }`.
  - `answer(id, resposta)` → `POST /entrevistas/{id}/respostas` retorna próxima pergunta ou conclusão.
  - `getState(id)` → `GET /entrevistas/{id}`.
  - `getResult(id)` → `POST /entrevistas/{id}/resultado`.
- `auth.service.ts` conforme item 2.
- Manter `applications.service.ts` só se ainda usado (o fluxo passa a ser Entrevista direta).

## 6. Ranking do recrutador — **tabela real**
Nova rota `/_authenticated/jobs/$jobId/ranking` (ou reaproveitar `jobs.$jobId.tsx` como aba):
- `useSuspenseQuery` em `GET /vagas/{id}/resultados`, ordenado por `media` desc.
- Renderiza `<table>` acessível:
  - Colunas: **#**, **Candidato**, **Soft skills (%)**, **Hard skills (%)**, **Média (%)**, **Ação**.
  - `<caption>` com título da vaga, `<th scope="col">`, `aria-sort` na coluna clicável, barras visuais nas células (`role="meter"` com `aria-valuenow`).
  - Linha clicável linka para `/candidates/$candidateId`.
- Comentário explicando exceção deliberada à regra "zero tabelas" a pedido do usuário.

## 7. Fluxo de entrevista no site (candidato)
`src/routes/_authenticated/apply.$jobId.tsx` reformulado:
- Três opções de canal:
  - **Pelo site** — ativo. Botão "Iniciar entrevista" chama `POST /entrevistas` e navega para `/interviews/$id`.
  - **Telegram** — ativo (mantém link atual).
  - **WhatsApp** — desabilitado, badge "Em breve".
- Nova rota `src/routes/_authenticated/interviews.$interviewId.tsx`:
  - Chat mobile-first: bolhas pergunta/resposta, `textarea` + `AsyncButton "Enviar"`.
  - `useMutation` para `POST /entrevistas/{id}/respostas`; ao receber `done`, chama `POST /entrevistas/{id}/resultado` e mostra tela de conclusão.
  - `pendingComponent` + toast em erro (padrão já existente).

## 8. Criação de vaga
- `jobs.new.tsx`: renomear "Soft skills" para incluir `softskillsAlvo` no payload; enviar `POST /vagas`.

## 9. Acessibilidade e UX
- Todos os novos inputs com `<Label htmlFor>`, `aria-invalid`, mensagens de erro em `role="alert"`.
- Toasts em toda falha de API (`ApiError`).
- Botões com `AsyncButton` (spinner + disable imediato).
- Tabela do ranking: navegação por teclado nas linhas, `focus-visible` visível, contraste WCAG AA nas barras.

## 10. Verificação
Após implementar:
- `tsgo` (typecheck) via harness.
- Screenshot Playwright em `/login`, `/jobs`, `/jobs/$id/ranking` (com dados mock caso API offline) e `/interviews/$id`.
- Testar fluxo 401→refresh com mock local temporário no console.

## Detalhes técnicos (referência)
- Refresh single-flight: promise compartilhada no módulo `api.ts` para evitar múltiplos `/refresh` concorrentes.
- Persistência: `localStorage.setItem("auth", JSON.stringify({access, refresh, role}))`, hidratado em `RootComponent` antes do primeiro fetch.
- Gate `_authenticated` usa `beforeLoad` lendo `authStore.getSnapshot()` (não hook), redirect para `/login?redirect=<href>`.
- Formato snake_case garantido pelo `camelToSnake` já existente; verificar chaves específicas: `softskills_alvo`, `access_token`, `refresh_token`, `entrevista_id`.
