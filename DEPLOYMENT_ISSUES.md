# Vercel Deployment Issues

This document tracks the deployment issues affecting the Vercel deployment of classroom-informatika.

## Issue 1: Path Duplication in Deploy Web Workflow

**Severity:** High  
**Status:** Open  
**Workflow:** `.github/workflows/deploy-web.yml`  
**Failed Runs:** 
- Run #12: https://github.com/noah-isme/classroom-informatika/actions/runs/18500430564
- Run #11: https://github.com/noah-isme/classroom-informatika/actions/runs/18499745637
- Run #10: https://github.com/noah-isme/classroom-informatika/actions/runs/18497697500

### Description
The Vercel deployment fails with a path duplication error. The Vercel CLI attempts to deploy from `~/work/classroom-informatika/classroom-informatika/apps/web/apps/web` (duplicated `apps/web`) instead of the correct path.

### Error Message
```
The provided path "~/work/classroom-informatika/classroom-informatika/apps/web/apps/web" does not exist.
```

### Root Cause
The `amondnet/vercel-action@v20` action in `.github/workflows/deploy-web.yml` is configured with:
- `working-directory: apps/web` (line 31)
- The action may be internally adding another `apps/web` prefix

### Impact
- All Vercel deployments to production fail
- Unable to deploy web application updates
- Blocks continuous delivery pipeline

### Proposed Solution
1. **Option A:** Remove the `working-directory` parameter and use explicit `vercel-args` to specify the path
2. **Option B:** Configure the Vercel project settings to point to the correct root directory
3. **Option C:** Use a different Vercel deployment action (e.g., `vercel/actions`)

### Recommended Fix
Update `.github/workflows/deploy-web.yml`:

```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v20
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-args: '--prod --yes'
    # Remove working-directory or adjust vercel-args
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_WEB_PROJECT_ID }}
```

---

## Issue 2: Build Command Configuration Issues

**Severity:** High  
**Status:** Open  
**Workflow:** `.github/workflows/deploy-web.yml`  
**Failed Runs:**
- Run #9: https://github.com/noah-isme/classroom-informatika/actions/runs/18492381001
- Run #8: https://github.com/noah-isme/classroom-informatika/actions/runs/18491700792
- Run #7: https://github.com/noah-isme/classroom-informatika/actions/runs/18487945202

### Description
The build step uses `pnpm --filter web build` which may not correctly resolve in a monorepo structure.

### Error Indicators
- Prisma generate failures
- Module resolution errors
- Build command timeouts

### Root Cause
- Inconsistent filter syntax (`web` vs `./apps/web`)
- Missing Prisma client generation before build
- Monorepo workspace configuration issues

### Proposed Solution
Update the build command in `.github/workflows/deploy-web.yml`:

```yaml
- run: pnpm exec prisma generate --schema=./prisma/schema.prisma
- run: pnpm --filter @classroom/web build
```

Or ensure `apps/web/package.json` has the correct workspace name.

---

## Issue 3: Mixed Deployment Strategy (Vercel + Netlify)

**Severity:** Medium  
**Status:** Open  

### Description
Recent commits indicate migration from Vercel to Netlify:
- Commit: "chore: migrate deployment to netlify" (558a9a1)
- Files: `netlify.toml`, `.vercelignore` both exist
- Workflows: Both `deploy-web.yml` (Vercel) and Netlify configs present

### Impact
- Confusion about deployment target
- Duplicate/conflicting configurations
- Wasted CI/CD resources

### Proposed Solution
**Decision Required:** Choose one deployment platform:

#### If staying with Vercel:
1. Remove `netlify.toml`
2. Remove Netlify-related scripts
3. Fix Vercel deployment workflows

#### If moving to Netlify:
1. Remove `.github/workflows/deploy-web.yml`
2. Remove `.github/workflows/deploy-api.yml`
3. Remove `.github/workflows/deploy-worker.yml`
4. Remove `apps/web/vercel.json`
5. Complete Netlify configuration

---

## Issue 4: CI Workflow Build Failures

**Severity:** High  
**Status:** Open  
**Workflow:** `.github/workflows/ci.yml`  
**Failed Runs:**
- Run #35: https://github.com/noah-isme/classroom-informatika/actions/runs/18504544970
- Run #34: https://github.com/noah-isme/classroom-informatika/actions/runs/18503543224
- Run #33: https://github.com/noah-isme/classroom-informatika/actions/runs/18500430563

### Description
CI workflow consistently fails during lint, typecheck, or build steps.

### Common Errors
1. Prisma generate failures
2. TypeScript compilation errors
3. Lint rule violations
4. Module import resolution issues

### Root Cause
- Missing environment variables for CI
- Prisma schema not generated before build
- Dependency installation issues in monorepo
- Test configuration problems

### Proposed Solution
1. Ensure Prisma generate runs before all build steps
2. Add proper environment variable handling
3. Fix TypeScript configuration issues
4. Update lint rules or fix violations

---

## Issue 5: Vercel Configuration in Monorepo

**Severity:** Medium  
**Status:** Open  
**Files:** 
- `apps/web/vercel.json`
- `.vercelignore`
- `.vercel-temp-web/` directory

### Description
Vercel configuration for monorepo deployment needs review:

```json
{
  "installCommand": "(corepack enable || true) && corepack prepare pnpm@8.8.0 --activate && pnpm -w install --frozen-lockfile",
  "buildCommand": "(corepack enable || true) && corepack prepare pnpm@8.8.0 --activate && pnpm exec prisma generate --schema=./prisma/schema.prisma && pnpm build",
  "framework": "nextjs",
  "github": { "silent": true }
}
```

### Issues
1. Complex build command with corepack setup
2. Prisma schema path may be incorrect in Vercel build context
3. `.vercelignore` may be blocking necessary files
4. Mismatch between pnpm version (8.8.0 in config vs 9.12.0 in package.json)

### Proposed Solution
1. Simplify build commands
2. Verify Prisma schema path
3. Review and update `.vercelignore`
4. Align pnpm versions

---

## Next Steps

1. **Immediate:** Fix path duplication in deploy-web.yml workflow
2. **Short-term:** Choose deployment platform (Vercel or Netlify) and remove conflicting configs
3. **Short-term:** Fix CI workflow build failures
4. **Medium-term:** Review and optimize Vercel/deployment configuration
5. **Long-term:** Document deployment process and troubleshooting guide

## Additional Resources

- [Vercel Monorepo Documentation](https://vercel.com/docs/monorepos)
- [pnpm Workspace Documentation](https://pnpm.io/workspaces)
- [GitHub Actions troubleshooting](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)
