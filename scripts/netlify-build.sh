#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

(corepack enable || true)
corepack prepare pnpm@8.8.0 --activate

if [ ! -f "$ROOT_DIR/scripts/prisma-generate-if-exists.sh" ]; then
  echo "Unable to locate scripts/prisma-generate-if-exists.sh" >&2
  exit 1
fi

"$ROOT_DIR/scripts/prisma-generate-if-exists.sh"

pnpm -w install --frozen-lockfile
pnpm --filter ./apps/web... build

# Ensure Netlify can find the publish directory even if it runs from scripts/.
mkdir -p "$SCRIPT_DIR/apps"
rm -rf "$SCRIPT_DIR/apps/web"
ln -s ../apps/web "$SCRIPT_DIR/apps/web"
