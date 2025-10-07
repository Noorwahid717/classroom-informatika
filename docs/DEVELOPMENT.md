# Development Guide

This document describes how to work on the Classroom Informatika monorepo during the refactor towards a focused LMS.

## Prerequisites

- Node.js 20.x
- pnpm 9+
- PostgreSQL (local or container) if you need to run the API

## Install dependencies

```bash
pnpm install
```

## Useful commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Run all apps in development mode via Turborepo. |
| `pnpm lint` | Run ESLint across the workspace. |
| `pnpm test` | Run available tests. |
| `pnpm build` | Create production builds for each package/app. |

### Verifying production builds

Running `pnpm build` should finish without errors for the web, worker, and API apps. The command will create `.turbo/` caches and
framework-specific build output (for example `apps/api/dist/`). These artefacts are ephemeral and **must not** be committed. If you
need to clean them up after a build, run:

```bash
pnpm exec turbo run clean --no-cache || rm -rf .turbo apps/*/.turbo apps/*/dist
```

Use the `rm -rf` fallback in environments where the shared `clean` task is not yet available.

## Environment variables

Copy `.env.example` to `.env` in each app/package that requires configuration. Never commit secrets to the repository.

## Package manager standardisation

The repository uses **pnpm** workspaces. Delete `node_modules` folders or lockfiles from other package managers before committing.
