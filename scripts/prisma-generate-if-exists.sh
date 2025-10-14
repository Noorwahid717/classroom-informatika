#!/usr/bin/env bash
set -euo pipefail

if [ -f "./prisma/schema.prisma" ]; then
  echo "Found prisma schema at ./prisma/schema.prisma"
  pnpm exec prisma generate --schema=./prisma/schema.prisma
elif [ -f "./apps/web/prisma/schema.prisma" ]; then
  echo "Found prisma schema at ./apps/web/prisma/schema.prisma"
  pnpm exec prisma generate --schema=./apps/web/prisma/schema.prisma
else
  echo "PRISMA_SCHEMA_NOT_FOUND"
  exit 2
fi
