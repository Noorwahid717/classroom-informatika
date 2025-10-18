#!/bin/bash
# Script to create GitHub issues for Vercel deployment failures
# This script requires gh CLI to be installed and authenticated

set -e

REPO="noah-isme/classroom-informatika"

echo "Creating GitHub issues for Vercel deployment failures..."
echo ""

# Issue 1: Path Duplication
echo "Creating Issue 1: Path Duplication in Deploy Web Workflow..."
gh issue create \
  --repo "$REPO" \
  --title "🐛 Vercel Deployment Fails: Path Duplication Error (apps/web/apps/web)" \
  --label "bug,deployment,vercel" \
  --body "## Description
The Vercel deployment workflow fails with a path duplication error. The Vercel CLI attempts to deploy from \`~/work/classroom-informatika/classroom-informatika/apps/web/apps/web\` (duplicated \`apps/web\`) instead of the correct path.

## Error Message
\`\`\`
The provided path \"~/work/classroom-informatika/classroom-informatika/apps/web/apps/web\" does not exist.
\`\`\`

## Failed Workflow Runs
- Run #12: https://github.com/noah-isme/classroom-informatika/actions/runs/18500430564
- Run #11: https://github.com/noah-isme/classroom-informatika/actions/runs/18499745637
- Run #10: https://github.com/noah-isme/classroom-informatika/actions/runs/18497697500

## Root Cause
The \`amondnet/vercel-action@v20\` action in \`.github/workflows/deploy-web.yml\` is configured with:
- \`working-directory: apps/web\` (line 31)
- The action may be internally adding another \`apps/web\` prefix causing path duplication

## Impact
- ❌ All Vercel deployments to production fail
- ❌ Unable to deploy web application updates
- ❌ Blocks continuous delivery pipeline

## Proposed Solution
Update \`.github/workflows/deploy-web.yml\`:

\`\`\`yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v20
  with:
    vercel-token: \${{ secrets.VERCEL_TOKEN }}
    vercel-args: '--prod --yes'
    # Remove working-directory parameter
    vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: \${{ secrets.VERCEL_WEB_PROJECT_ID }}
\`\`\`

Or adjust the Vercel project configuration to account for the correct directory structure.

## Additional Context
See full analysis in \`DEPLOYMENT_ISSUES.md\`

## Acceptance Criteria
- [ ] Vercel deployment workflow completes successfully
- [ ] Production deployment is accessible
- [ ] No path duplication errors in workflow logs"

echo "✓ Issue 1 created"
echo ""

# Issue 2: Build Command Configuration
echo "Creating Issue 2: Build Command Configuration Issues..."
gh issue create \
  --repo "$REPO" \
  --title "🔧 Fix Build Command Configuration in Deploy Workflow" \
  --label "bug,deployment,ci-cd" \
  --body "## Description
The build step in the Vercel deployment workflow uses inconsistent commands that may not correctly resolve in the monorepo structure.

## Failed Workflow Runs
- Run #9: https://github.com/noah-isme/classroom-informatika/actions/runs/18492381001
- Run #8: https://github.com/noah-isme/classroom-informatika/actions/runs/18491700792
- Run #7: https://github.com/noah-isme/classroom-informatika/actions/runs/18487945202

## Issues Identified
1. **Prisma Generate Failures**: Prisma client not generated before build
2. **Filter Syntax**: Using \`pnpm --filter web build\` which may not match workspace name
3. **Module Resolution**: Build failures due to missing dependencies

## Root Cause
- Inconsistent pnpm workspace filter syntax
- Missing Prisma client generation step
- Monorepo workspace configuration issues

## Proposed Solution
Update build commands in \`.github/workflows/deploy-web.yml\`:

\`\`\`yaml
steps:
  # ... previous steps ...
  - run: pnpm install --frozen-lockfile
  - run: pnpm exec prisma generate --schema=./prisma/schema.prisma
  - run: pnpm --filter @classroom/web build  # Use correct workspace name
  - name: Deploy to Vercel
    # ... deploy step ...
\`\`\`

Also verify \`apps/web/package.json\` has the correct workspace name.

## Additional Context
See full analysis in \`DEPLOYMENT_ISSUES.md\`

## Acceptance Criteria
- [ ] Build command completes successfully
- [ ] Prisma client is generated before build
- [ ] All dependencies resolve correctly
- [ ] Deploy workflow runs without build errors"

echo "✓ Issue 2 created"
echo ""

# Issue 3: Mixed Deployment Strategy
echo "Creating Issue 3: Mixed Deployment Strategy..."
gh issue create \
  --repo "$REPO" \
  --title "🤔 Clarify Deployment Strategy: Vercel vs Netlify" \
  --label "discussion,deployment,cleanup" \
  --body "## Description
The repository contains configuration for both Vercel and Netlify deployments, creating confusion about the deployment target.

## Evidence
- ✅ Recent commit: \"chore: migrate deployment to netlify\" (558a9a1)
- ✅ Files: Both \`netlify.toml\` and \`apps/web/vercel.json\` exist
- ✅ Workflows: \`.github/workflows/deploy-web.yml\` (Vercel) and Netlify configs present

## Impact
- ⚠️ Confusion about which platform to use
- ⚠️ Duplicate/conflicting configurations
- ⚠️ Wasted CI/CD resources
- ⚠️ Inconsistent deployment behavior

## Decision Required
Choose one deployment platform and remove conflicting configurations:

### Option A: Stay with Vercel
- [ ] Remove \`netlify.toml\`
- [ ] Remove Netlify-related scripts
- [ ] Fix Vercel deployment workflows (Issues #1, #2)
- [ ] Update documentation

### Option B: Move to Netlify
- [ ] Remove \`.github/workflows/deploy-web.yml\`
- [ ] Remove \`.github/workflows/deploy-api.yml\`
- [ ] Remove \`.github/workflows/deploy-worker.yml\`
- [ ] Remove \`apps/web/vercel.json\`
- [ ] Complete Netlify configuration
- [ ] Update documentation

## Recommendation
Based on recent commits indicating Netlify migration, suggest:
1. Complete Netlify migration
2. Remove Vercel configurations
3. Update CI/CD documentation

## Additional Context
See full analysis in \`DEPLOYMENT_ISSUES.md\`

## Acceptance Criteria
- [ ] Single deployment platform chosen
- [ ] Conflicting configurations removed
- [ ] Documentation updated
- [ ] Deployment works reliably"

echo "✓ Issue 3 created"
echo ""

# Issue 4: CI Workflow Failures
echo "Creating Issue 4: CI Workflow Build Failures..."
gh issue create \
  --repo "$REPO" \
  --title "🚨 CI Workflow Consistently Failing on Main Branch" \
  --label "bug,ci-cd,high-priority" \
  --body "## Description
The CI workflow (\`.github/workflows/ci.yml\`) is consistently failing across multiple runs, preventing proper validation of changes.

## Failed Workflow Runs
- Run #35: https://github.com/noah-isme/classroom-informatika/actions/runs/18504544970
- Run #34: https://github.com/noah-isme/classroom-informatika/actions/runs/18503543224
- Run #33: https://github.com/noah-isme/classroom-informatika/actions/runs/18500430563

## Common Error Types
1. 🔴 Prisma generate failures
2. 🔴 TypeScript compilation errors
3. 🔴 Lint rule violations
4. 🔴 Module import resolution issues
5. 🔴 Netlify build script errors

## Root Causes
- Missing environment variables for CI
- Prisma schema not generated at correct stage
- Dependency installation issues in monorepo
- Test configuration problems
- Netlify build script path issues (scripts/netlify-build.sh)

## Impact
- ❌ Cannot merge PRs with confidence
- ❌ No automated quality checks
- ❌ Deployment pipeline blocked
- ❌ Development workflow disrupted

## Proposed Solution
1. **Fix Prisma Generation**
   \`\`\`yaml
   - name: Prisma generate
     run: pnpm exec prisma generate --schema=./prisma/schema.prisma
   \`\`\`

2. **Add Required Environment Variables**
   \`\`\`yaml
   env:
     DATABASE_URL: \${{ secrets.DATABASE_URL }}
     # Add other required env vars
   \`\`\`

3. **Fix Build Script Permissions**
   \`\`\`bash
   chmod +x scripts/netlify-build.sh
   chmod +x scripts/prisma-generate-if-exists.sh
   \`\`\`

4. **Update Lint Configuration** or fix violations

## Additional Context
See full analysis in \`DEPLOYMENT_ISSUES.md\`

## Acceptance Criteria
- [ ] CI workflow passes on main branch
- [ ] All build steps complete successfully
- [ ] Lint and typecheck pass
- [ ] Tests run and pass (if applicable)"

echo "✓ Issue 4 created"
echo ""

# Issue 5: Vercel Monorepo Configuration
echo "Creating Issue 5: Vercel Monorepo Configuration..."
gh issue create \
  --repo "$REPO" \
  --title "⚙️ Review and Optimize Vercel Monorepo Configuration" \
  --label "enhancement,vercel,configuration" \
  --body "## Description
The Vercel configuration for monorepo deployment needs review and optimization.

## Current Configuration (\`apps/web/vercel.json\`)
\`\`\`json
{
  \"installCommand\": \"(corepack enable || true) && corepack prepare pnpm@8.8.0 --activate && pnpm -w install --frozen-lockfile\",
  \"buildCommand\": \"(corepack enable || true) && corepack prepare pnpm@8.8.0 --activate && pnpm exec prisma generate --schema=./prisma/schema.prisma && pnpm build\",
  \"framework\": \"nextjs\",
  \"github\": { \"silent\": true }
}
\`\`\`

## Issues Identified
1. **Complex Commands**: Build/install commands are overly complex with corepack setup
2. **Path Issues**: Prisma schema path may be incorrect in Vercel build context
3. **Version Mismatch**: Using pnpm 8.8.0 in config vs 9.12.0 in \`package.json\`
4. **Ignore File**: \`.vercelignore\` may be blocking necessary files

## Proposed Improvements
1. **Simplify Commands**
   \`\`\`json
   {
     \"installCommand\": \"pnpm install --frozen-lockfile\",
     \"buildCommand\": \"pnpm --filter @classroom/web build\",
     \"framework\": \"nextjs\"
   }
   \`\`\`

2. **Align pnpm Versions**
   - Update to pnpm 9.12.0 consistently

3. **Review .vercelignore**
   - Ensure necessary monorepo files are not ignored

4. **Verify Prisma Setup**
   - Configure Prisma generation in build process

## Related Files
- \`apps/web/vercel.json\`
- \`.vercelignore\`
- \`.vercel-temp-web/\` directory
- \`package.json\`

## Additional Context
See full analysis in \`DEPLOYMENT_ISSUES.md\`

## Acceptance Criteria
- [ ] Build commands are simplified
- [ ] pnpm versions are consistent
- [ ] Vercel deployment works reliably
- [ ] Build time is optimized
- [ ] Configuration is well-documented"

echo "✓ Issue 5 created"
echo ""

echo "========================================="
echo "✅ All 5 deployment issues have been created!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Review the created issues"
echo "2. Prioritize based on severity"
echo "3. Assign team members"
echo "4. Start fixing highest priority issues"
echo ""
echo "Full analysis available in: DEPLOYMENT_ISSUES.md"
