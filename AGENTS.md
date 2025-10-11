# Repository Guidelines

## Project Structure & Module Organization
- `apps/web` hosts the Next.js App Router frontend (`src/` for pages, components, hooks; `tests/` for unit and E2E suites).
- `apps/api` contains the NestJS API gateway with modules under `src/` and Prisma-powered services.
- `apps/worker` runs NestJS background jobs driven by BullMQ queues.
- Shared packages live in `packages/`: `config` centralises environment loading, while `ui` exposes headless React primitives.
- Database schema, migrations, and seeds reside in `prisma/`; static assets and public files live under `public/`.

## Build, Test, and Development Commands
```bash
pnpm install                   # bootstrap all workspaces
pnpm dev                       # Turbo-powered dev servers (web, api, worker)
pnpm lint | pnpm typecheck     # ESLint + TypeScript across the monorepo
pnpm test                      # Run Vitest, Jest, and other registered test targets
pnpm --filter web test:e2e     # Playwright E2E suite from apps/web/tests/e2e
pnpm --filter api start:dev    # Fastify-backed API in watch mode
pnpm build                     # Turbo build pipeline before deployment
```

## Coding Style & Naming Conventions
- TypeScript everywhere; rely on Prettier (default two-space indent) and the repo ESLint config (`@typescript-eslint`, `eslint-config-prettier`).
- React components and Nest providers use `PascalCase`; hooks, utilities, and services use `camelCase`; directories stay kebab-case.
- Keep Tailwind classes grouped by layout → spacing → typography; prefer shared variants from `packages/ui`.
- Configuration access should flow through `packages/config` helpers rather than `process.env`.

## Testing Guidelines
- Frontend unit tests (`*.test.ts[x]`) sit in `apps/web/tests/**`; favour Vitest + Testing Library with the provided Prisma test context.
- E2E scenarios live in `apps/web/tests/e2e/*.spec.ts` and require the Next dev server; stub network calls when feasible.
- Backend modules use Jest (`apps/api/src/**/__tests__` or `*.spec.ts`); include database mocks via Prisma `pg-mem`.
- Add or update tests alongside feature work; ensure `pnpm test` passes before opening PRs.

## Commit & Pull Request Guidelines
- Follow the existing history: short, imperative subjects with optional Conventional prefixes (`fix:`, `refactor:`). Group related changes per commit.
- PRs should describe scope, reference issues, and call out schema or env changes. Attach screenshots for UI updates and mention affected roles.
- Confirm lint, typecheck, and relevant test commands in the PR checklist; include a migration diff summary when touching `prisma/schema.prisma`.
