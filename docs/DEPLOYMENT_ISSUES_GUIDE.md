# Vercel Deployment Issues - Quick Start Guide

This directory contains documentation and scripts to help identify and resolve Vercel deployment failures in the classroom-informatika repository.

## 📋 Overview

The repository is experiencing multiple deployment failures affecting the Vercel deployment pipeline. This guide provides:

1. **Comprehensive Issue Documentation** - Detailed analysis of all deployment problems
2. **Automated Issue Creation** - Script to create GitHub issues for tracking
3. **Recommended Fixes** - Step-by-step solutions for each issue

## 🚨 Critical Issues Identified

| Issue | Severity | Status | Impact |
|-------|----------|--------|--------|
| Path Duplication in Deploy Workflow | 🔴 High | Open | All deployments fail |
| Build Command Configuration | 🔴 High | Open | Build failures |
| Mixed Deployment Strategy | 🟡 Medium | Open | Configuration conflicts |
| CI Workflow Failures | 🔴 High | Open | No automated checks |
| Vercel Monorepo Config | 🟡 Medium | Open | Suboptimal setup |

## 📚 Documentation

### Main Documentation Files

- **`DEPLOYMENT_ISSUES.md`** - Comprehensive analysis of all deployment issues
  - Detailed error descriptions
  - Root cause analysis
  - Proposed solutions
  - Links to failed workflow runs

## 🤖 Creating GitHub Issues

### Prerequisites

1. Install GitHub CLI: https://cli.github.com/
2. Authenticate: `gh auth login`
3. Ensure you have write access to the repository

### Run the Script

```bash
# Make sure you're in the repository root
cd /path/to/classroom-informatika

# Run the issue creation script
./scripts/create-deployment-issues.sh
```

This will create 5 GitHub issues:

1. **🐛 Vercel Deployment Fails: Path Duplication Error**
2. **🔧 Fix Build Command Configuration in Deploy Workflow**
3. **🤔 Clarify Deployment Strategy: Vercel vs Netlify**
4. **🚨 CI Workflow Consistently Failing on Main Branch**
5. **⚙️ Review and Optimize Vercel Monorepo Configuration**

### Manual Issue Creation

If you prefer to create issues manually, use the templates in `DEPLOYMENT_ISSUES.md`:

1. Go to https://github.com/noah-isme/classroom-informatika/issues/new
2. Copy content from the relevant section in `DEPLOYMENT_ISSUES.md`
3. Add appropriate labels: `bug`, `deployment`, `vercel`, `ci-cd`
4. Submit the issue

## 🔧 Quick Fixes

### Fix #1: Path Duplication (Immediate)

Edit `.github/workflows/deploy-web.yml`:

```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v20
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-args: '--prod --yes'
    # REMOVE THIS LINE: working-directory: apps/web
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_WEB_PROJECT_ID }}
```

### Fix #2: Build Command (Immediate)

Edit `.github/workflows/deploy-web.yml`:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: pnpm/action-setup@v4
    with:
      version: 9.12.0
  - uses: actions/setup-node@v4
    with:
      node-version: 20
      cache: pnpm
  - run: pnpm install --frozen-lockfile
  - run: pnpm exec prisma generate --schema=./prisma/schema.prisma
  - run: pnpm --filter @classroom/web build  # Verify workspace name
```

### Fix #3: Choose Deployment Platform (Short-term)

**If keeping Vercel:**
```bash
git rm netlify.toml
git rm scripts/netlify-build.sh
git commit -m "chore: remove Netlify config, staying with Vercel"
```

**If moving to Netlify:**
```bash
git rm .github/workflows/deploy-web.yml
git rm .github/workflows/deploy-api.yml
git rm .github/workflows/deploy-worker.yml
git rm apps/web/vercel.json
git commit -m "chore: remove Vercel config, using Netlify"
```

## 📊 Workflow Status

Current status of deployment workflows:

- ❌ Deploy Web (Vercel) - **FAILING** (12 consecutive failures)
- ❌ CI Workflow - **FAILING** (10+ consecutive failures)
- ⚠️ Netlify Deployment - **UNCLEAR** (configuration exists but incomplete)

## 🎯 Recommended Action Plan

### Phase 1: Immediate (Day 1)
1. ✅ Create GitHub issues (run `create-deployment-issues.sh`)
2. ⚠️ **DECIDE**: Vercel or Netlify? (Issue #3)
3. 🔧 Fix path duplication (Issue #1)
4. 🔧 Fix build commands (Issue #2)

### Phase 2: Short-term (Week 1)
1. 🔧 Fix CI workflow (Issue #4)
2. 🧹 Remove conflicting deployment configs
3. ✅ Verify deployments work
4. 📝 Update documentation

### Phase 3: Medium-term (Week 2-3)
1. ⚙️ Optimize Vercel/Netlify config (Issue #5)
2. 📊 Set up deployment monitoring
3. 🔒 Review security settings
4. 📚 Create runbook for deployments

## 🔍 Monitoring & Verification

After implementing fixes:

### Verify Deployment Success
```bash
# Check latest workflow run
gh run list --workflow=deploy-web.yml --limit=5

# View specific run
gh run view <run-id>
```

### Test Production Deployment
1. Visit production URL
2. Check console for errors
3. Test critical features
4. Monitor error tracking

### Verify CI Pipeline
```bash
# Check CI status
gh run list --workflow=ci.yml --limit=5

# Ensure all checks pass
gh run watch
```

## 📞 Getting Help

If you encounter issues:

1. **Check Logs**: Review GitHub Actions logs for detailed errors
2. **Review Documentation**: Read `DEPLOYMENT_ISSUES.md` for analysis
3. **Check Related Issues**: Search existing GitHub issues
4. **Community**: Ask in project discussions or team chat

## 📝 Contributing

When fixing these issues:

1. Reference the issue number in commits: `fix: resolve path duplication (#1)`
2. Update `DEPLOYMENT_ISSUES.md` with resolution details
3. Mark issues as resolved when fixed
4. Add tests to prevent regression

## 🔗 Useful Links

- [Vercel Monorepo Guide](https://vercel.com/docs/monorepos)
- [pnpm Workspace Documentation](https://pnpm.io/workspaces)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Troubleshooting Vercel Deployments](https://vercel.com/docs/deployments/troubleshoot-a-build)

---

**Last Updated:** 2025-10-18  
**Status:** Active deployment issues  
**Priority:** 🔴 High - Blocking production deployments
