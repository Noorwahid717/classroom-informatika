# Deployment Issues Fix Checklist

Track your progress fixing the Vercel deployment issues. Check off items as you complete them.

## 🚀 Phase 1: Issue Creation & Planning (Day 1)

### Issue Creation
- [ ] Install GitHub CLI (`gh`)
- [ ] Authenticate with GitHub (`gh auth login`)
- [ ] Run issue creation script (`./scripts/create-deployment-issues.sh`)
- [ ] Verify all 5 issues were created successfully
- [ ] Review and understand each issue

### Planning & Prioritization
- [ ] Read `DEPLOYMENT_ISSUES.md` thoroughly
- [ ] Review `DEPLOYMENT_ISSUES_GUIDE.md`
- [ ] Prioritize issues based on business impact
- [ ] Assign team members to each issue
- [ ] Set target completion dates

### Strategic Decision
- [ ] **DECISION:** Choose deployment platform (Vercel OR Netlify)
- [ ] Document decision and rationale
- [ ] Communicate decision to team

## 🔧 Phase 2: Critical Fixes (Days 1-3)

### Issue #1: Path Duplication Fix
- [ ] Backup current workflow file
- [ ] Edit `.github/workflows/deploy-web.yml`
- [ ] Remove `working-directory: apps/web` parameter
- [ ] Test locally if possible
- [ ] Commit changes with issue reference
- [ ] Push and verify workflow runs
- [ ] Confirm deployment succeeds
- [ ] Close issue #1

**Files to modify:**
```
.github/workflows/deploy-web.yml (line 31)
```

### Issue #2: Build Command Fix
- [ ] Review current build commands
- [ ] Add Prisma generate step before build
- [ ] Fix pnpm workspace filter syntax
- [ ] Verify workspace name in `apps/web/package.json`
- [ ] Test build locally: `pnpm --filter @classroom/web build`
- [ ] Commit changes with issue reference
- [ ] Push and verify workflow runs
- [ ] Confirm build succeeds
- [ ] Close issue #2

**Files to modify:**
```
.github/workflows/deploy-web.yml
apps/web/package.json (verify name field)
```

### Issue #3: Deployment Platform Cleanup
- [ ] Execute decision from Phase 1

**If staying with Vercel:**
- [ ] Remove `netlify.toml`
- [ ] Remove `scripts/netlify-build.sh`
- [ ] Remove Netlify plugin from dependencies
- [ ] Update README to remove Netlify references
- [ ] Commit: `chore: remove Netlify config, staying with Vercel`

**If moving to Netlify:**
- [ ] Remove `.github/workflows/deploy-web.yml`
- [ ] Remove `.github/workflows/deploy-api.yml`
- [ ] Remove `.github/workflows/deploy-worker.yml`
- [ ] Remove `apps/web/vercel.json`
- [ ] Remove `.vercel-temp-web/` directory
- [ ] Remove `.vercelignore`
- [ ] Complete Netlify configuration
- [ ] Update README to document Netlify deployment
- [ ] Commit: `chore: remove Vercel config, using Netlify`

**After cleanup:**
- [ ] Push changes
- [ ] Update documentation
- [ ] Close issue #3

### Issue #4: CI Workflow Fixes
- [ ] Review CI workflow file
- [ ] Fix Prisma generate timing
- [ ] Add required environment variables
- [ ] Fix script permissions:
  ```bash
  chmod +x scripts/netlify-build.sh
  chmod +x scripts/prisma-generate-if-exists.sh
  ```
- [ ] Fix lint errors or update config
- [ ] Fix TypeScript errors
- [ ] Test CI locally if possible
- [ ] Commit changes with issue reference
- [ ] Push and verify CI passes
- [ ] Confirm all checks pass
- [ ] Close issue #4

**Files to modify:**
```
.github/workflows/ci.yml
scripts/netlify-build.sh (permissions)
scripts/prisma-generate-if-exists.sh (permissions)
```

## ⚙️ Phase 3: Optimization (Days 4-7)

### Issue #5: Configuration Optimization
- [ ] Review current Vercel/Netlify config
- [ ] Simplify build commands
- [ ] Align pnpm versions (9.12.0 everywhere)
- [ ] Update `.vercelignore` or `.netlify.toml`
- [ ] Optimize Prisma generation
- [ ] Test deployment with new config
- [ ] Measure build time improvements
- [ ] Commit optimizations
- [ ] Close issue #5

**Files to modify:**
```
apps/web/vercel.json (if using Vercel)
netlify.toml (if using Netlify)
.vercelignore or .netlify.toml
package.json (version alignment)
```

### Documentation Updates
- [ ] Update README with deployment instructions
- [ ] Document environment variables needed
- [ ] Add troubleshooting section
- [ ] Create deployment runbook
- [ ] Update architecture docs

### Testing & Verification
- [ ] Deploy to staging environment
- [ ] Test all critical features
- [ ] Verify error tracking works
- [ ] Check performance metrics
- [ ] Get team approval

## 📊 Phase 4: Monitoring & Maintenance (Ongoing)

### Set Up Monitoring
- [ ] Configure deployment notifications
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Create deployment dashboard
- [ ] Set up uptime monitoring
- [ ] Configure alerts for failures

### Process Improvements
- [ ] Document deployment process
- [ ] Create pre-deployment checklist
- [ ] Set up deployment calendar
- [ ] Plan rollback procedures
- [ ] Schedule regular reviews

### Knowledge Sharing
- [ ] Share learnings with team
- [ ] Update onboarding docs
- [ ] Create FAQ for common issues
- [ ] Document lessons learned

## ✅ Final Verification

### Deployment Success Criteria
- [ ] All GitHub issues closed
- [ ] Deployment workflow succeeds consistently
- [ ] CI workflow passes on all PRs
- [ ] No path duplication errors
- [ ] Build completes successfully
- [ ] Single deployment platform configured
- [ ] Documentation is up-to-date
- [ ] Team understands process

### Production Verification
- [ ] Latest code deployed to production
- [ ] Production site accessible
- [ ] No console errors
- [ ] All features working
- [ ] Performance acceptable
- [ ] Monitoring active

## 📈 Metrics to Track

### Before Fixes
- Deployment success rate: **0%** (12 consecutive failures)
- CI success rate: **~20%** (many failures)
- Average build time: **Unknown**
- Time to deploy: **N/A** (blocked)

### After Fixes (Target)
- Deployment success rate: **>95%**
- CI success rate: **>98%**
- Average build time: **<5 minutes**
- Time to deploy: **<10 minutes**

## 🎯 Success Indicators

When you can check ALL of these, you're done:

✅ **GitHub Issues**
- [ ] All 5 issues created
- [ ] All 5 issues assigned
- [ ] All 5 issues resolved
- [ ] All 5 issues closed

✅ **Workflows**
- [ ] Deploy workflow passing
- [ ] CI workflow passing
- [ ] No failing runs on main
- [ ] PR checks working

✅ **Deployment**
- [ ] Production site accessible
- [ ] Features working correctly
- [ ] No deployment errors
- [ ] Monitoring active

✅ **Documentation**
- [ ] README updated
- [ ] Deployment docs complete
- [ ] Team trained
- [ ] Runbook created

✅ **Configuration**
- [ ] Single platform chosen
- [ ] Configs cleaned up
- [ ] Versions aligned
- [ ] Optimizations applied

## 📝 Notes & Blockers

Use this section to track any issues or blockers:

```
Date: ___________
Blocker: ___________________________________________
Status: ___________________________________________
Resolution: ___________________________________________

Date: ___________
Blocker: ___________________________________________
Status: ___________________________________________
Resolution: ___________________________________________
```

## 🏆 Completion

- **Started:** __________
- **Target Completion:** __________
- **Actual Completion:** __________
- **Total Time:** __________
- **Team Members:** __________
- **Lessons Learned:** __________

---

**Last Updated:** 2025-10-18  
**Status:** Ready to start  
**Next Action:** Run `./scripts/create-deployment-issues.sh`
