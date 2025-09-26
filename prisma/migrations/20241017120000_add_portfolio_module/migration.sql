-- Create enums for portfolio workflow
CREATE TYPE "PortfolioSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'RETURNED', 'GRADED');
CREATE TYPE "PortfolioArtifactType" AS ENUM ('EDITOR', 'UPLOAD');
CREATE TYPE "PortfolioRubricCriterion" AS ENUM (
  'HTML_STRUCTURE',
  'CSS_RESPONSIVE',
  'JS_INTERACTIVITY',
  'CODE_QUALITY',
  'CREATIVITY_BRIEF'
);

-- Task definition for portfolio assignment
CREATE TABLE "portfolio_tasks" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "classLevel" TEXT NOT NULL,
  "tags" TEXT,
  "instructions" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Student submission metadata
CREATE TABLE "portfolio_submissions" (
  "id" TEXT PRIMARY KEY,
  "taskId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "classLevel" TEXT NOT NULL,
  "tags" TEXT,
  "status" "PortfolioSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
  "lastVersionId" TEXT UNIQUE,
  "grade" INTEGER,
  "reviewerId" TEXT,
  "reviewerNote" TEXT,
  "submittedAt" TIMESTAMP(3),
  "returnedAt" TIMESTAMP(3),
  "draftHtml" TEXT,
  "draftCss" TEXT,
  "draftJs" TEXT,
  "draftArtifact" "PortfolioArtifactType" NOT NULL DEFAULT 'EDITOR',
  "draftArchivePath" TEXT,
  "draftArchiveSize" INTEGER,
  "draftMetadata" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Snapshot of student work at submission time
CREATE TABLE "portfolio_versions" (
  "id" TEXT PRIMARY KEY,
  "submissionId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "classLevel" TEXT NOT NULL,
  "tags" TEXT,
  "html" TEXT,
  "css" TEXT,
  "js" TEXT,
  "artifactType" "PortfolioArtifactType" NOT NULL DEFAULT 'EDITOR',
  "archivePath" TEXT,
  "archiveSize" INTEGER,
  "metadata" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedAt" TIMESTAMP(3) NOT NULL
);

-- Evaluation detail per submission version
CREATE TABLE "portfolio_evaluations" (
  "id" TEXT PRIMARY KEY,
  "submissionId" TEXT NOT NULL,
  "versionId" TEXT NOT NULL,
  "reviewerId" TEXT NOT NULL,
  "overallScore" INTEGER NOT NULL,
  "overallNote" TEXT,
  "status" "PortfolioSubmissionStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Rubric score breakdown
CREATE TABLE "portfolio_rubric_scores" (
  "id" TEXT PRIMARY KEY,
  "evaluationId" TEXT NOT NULL,
  "criterion" "PortfolioRubricCriterion" NOT NULL,
  "score" INTEGER NOT NULL,
  "maxScore" INTEGER NOT NULL,
  "comment" TEXT
);

-- Foreign keys
ALTER TABLE "portfolio_submissions"
  ADD CONSTRAINT "portfolio_submissions_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "portfolio_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "portfolio_submissions_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "portfolio_versions"
  ADD CONSTRAINT "portfolio_versions_submissionId_fkey"
    FOREIGN KEY ("submissionId") REFERENCES "portfolio_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "portfolio_submissions"
  ADD CONSTRAINT "portfolio_submissions_lastVersionId_fkey"
    FOREIGN KEY ("lastVersionId") REFERENCES "portfolio_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "portfolio_evaluations"
  ADD CONSTRAINT "portfolio_evaluations_submissionId_fkey"
    FOREIGN KEY ("submissionId") REFERENCES "portfolio_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "portfolio_evaluations_versionId_fkey"
    FOREIGN KEY ("versionId") REFERENCES "portfolio_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "portfolio_rubric_scores"
  ADD CONSTRAINT "portfolio_rubric_scores_evaluationId_fkey"
    FOREIGN KEY ("evaluationId") REFERENCES "portfolio_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes for filtering
CREATE INDEX "portfolio_submissions_taskId_idx" ON "portfolio_submissions" ("taskId");
CREATE INDEX "portfolio_submissions_studentId_idx" ON "portfolio_submissions" ("studentId");
CREATE INDEX "portfolio_submissions_status_idx" ON "portfolio_submissions" ("status");
CREATE INDEX "portfolio_versions_submissionId_idx" ON "portfolio_versions" ("submissionId");
CREATE INDEX "portfolio_evaluations_submissionId_idx" ON "portfolio_evaluations" ("submissionId");
CREATE INDEX "portfolio_rubric_scores_evaluationId_idx" ON "portfolio_rubric_scores" ("evaluationId");

-- Unique constraints defined in Prisma schema
CREATE UNIQUE INDEX "portfolio_tasks_title_classLevel_key" ON "portfolio_tasks" ("title", "classLevel");
CREATE UNIQUE INDEX "portfolio_submissions_studentId_taskId_key" ON "portfolio_submissions" ("studentId", "taskId");
CREATE UNIQUE INDEX "portfolio_evaluations_versionId_key" ON "portfolio_evaluations" ("versionId");
CREATE UNIQUE INDEX "portfolio_rubric_scores_evaluationId_criterion_key"
  ON "portfolio_rubric_scores" ("evaluationId", "criterion");
