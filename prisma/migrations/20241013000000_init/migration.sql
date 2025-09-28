CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MENTOR', 'STUDENT');
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PROCESSING', 'GRADED', 'RETURNED');
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'REVIEW', 'APPROVED', 'REJECTED');
CREATE TYPE "FileCategory" AS ENUM ('ANNOUNCEMENT', 'GALLERY', 'ASSIGNMENT', 'SUBMISSION');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT,
  "needsPasswordRehash" BOOLEAN NOT NULL DEFAULT FALSE,
  "googleId" TEXT UNIQUE,
  "name" TEXT,
  "avatarUrl" TEXT,
  "role" "Role" NOT NULL DEFAULT 'STUDENT',
  "bio" TEXT,
  "phone" TEXT,
  "lastLoginAt" TIMESTAMPTZ,
  "emailVerifiedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "RefreshToken" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "token" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Classroom" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "startsAt" TIMESTAMPTZ NOT NULL,
  "endsAt" TIMESTAMPTZ NOT NULL,
  "capacity" INTEGER NOT NULL,
  "ownerId" TEXT NOT NULL REFERENCES "User"("id"),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "ClassMember" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "classId" TEXT NOT NULL REFERENCES "Classroom"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "role" "Role" NOT NULL DEFAULT 'STUDENT',
  "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("classId", "userId")
);

CREATE TABLE "Rubric" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "RubricCriterion" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "rubricId" TEXT NOT NULL REFERENCES "Rubric"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "weight" DOUBLE PRECISION NOT NULL
);

CREATE TABLE "Assignment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "classId" TEXT NOT NULL REFERENCES "Classroom"("id") ON DELETE CASCADE,
  "rubricId" TEXT REFERENCES "Rubric"("id"),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "dueAt" TIMESTAMPTZ,
  "maxScore" INTEGER NOT NULL DEFAULT 100,
  "instructions" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Submission" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "assignmentId" TEXT NOT NULL REFERENCES "Assignment"("id") ON DELETE CASCADE,
  "studentId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
  "repositoryUrl" TEXT,
  "previewUrl" TEXT,
  "storageKey" TEXT,
  "lintReport" JSONB,
  "score" INTEGER,
  "submittedAt" TIMESTAMPTZ,
  "gradedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Grade" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "submissionId" TEXT NOT NULL UNIQUE REFERENCES "Submission"("id") ON DELETE CASCADE,
  "rubricSnapshot" JSONB NOT NULL,
  "score" INTEGER NOT NULL,
  "feedback" TEXT,
  "graderId" TEXT NOT NULL REFERENCES "User"("id"),
  "studentId" TEXT NOT NULL REFERENCES "User"("id"),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Registration" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT REFERENCES "User"("id"),
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "programId" TEXT NOT NULL,
  "motivation" TEXT NOT NULL,
  "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Announcement" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "body" TEXT NOT NULL,
  "published" BOOLEAN NOT NULL DEFAULT FALSE,
  "publishedAt" TIMESTAMPTZ,
  "authorId" TEXT NOT NULL REFERENCES "User"("id"),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Event" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "classId" TEXT REFERENCES "Classroom"("id"),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "startsAt" TIMESTAMPTZ NOT NULL,
  "endsAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "FileAsset" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "category" "FileCategory" NOT NULL,
  "key" TEXT NOT NULL UNIQUE,
  "bucket" TEXT NOT NULL,
  "checksum" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "mimeType" TEXT NOT NULL,
  "uploadedBy" TEXT REFERENCES "User"("id"),
  "uploadedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "assignmentId" TEXT REFERENCES "Assignment"("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT REFERENCES "User"("id"),
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "resourceId" TEXT,
  "metadata" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "WorkerJob" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "submissionId" TEXT NOT NULL REFERENCES "Submission"("id") ON DELETE CASCADE,
  "jobId" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'queued',
  "result" JSONB,
  "startedAt" TIMESTAMPTZ,
  "finishedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_submission_assignment" ON "Submission"("assignmentId");
CREATE INDEX "idx_submission_student" ON "Submission"("studentId");
CREATE INDEX "idx_grade_student" ON "Grade"("studentId");
CREATE INDEX "idx_registration_status" ON "Registration"("status");
CREATE INDEX "idx_event_class" ON "Event"("classId");
CREATE INDEX "idx_file_category" ON "FileAsset"("category");
