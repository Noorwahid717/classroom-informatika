# Classroom Informatika - AI Coding Agent Instructions

This is a comprehensive classroom management system for SMA Wahidiyah Kediri with dual-mode authentication, real-time assessment, and portfolio management.

## �️ Architecture Overview

**Hybrid System Design**: Landing page + Admin dashboard with seamless integration
- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind CSS 4
- **Database**: PostgreSQL (Neon) with Prisma ORM - complex relational schema
- **Authentication**: NextAuth.js with dual providers (admin/student credentials)
- **Storage**: Vercel Blob for ZIP submissions and file handling
- **Real-time**: Monaco Editor integration for live code preview

## 🔑 Critical Authentication Pattern

**Dual Provider System** - Admin and Student login flows are completely separate:

```typescript
// Admin login: src/lib/auth-config.ts
CredentialsProvider({ id: 'admin', ... })  // Checks admin table + user.role='ADMIN'
CredentialsProvider({ id: 'student', ... }) // Checks student table with studentId

// Role-based routing in middleware.ts
if (token.userType === 'admin') -> '/dashboard/teacher'
if (token.userType === 'student') -> '/dashboard/student' 
```

**Key Components**:
- `LoginModal.tsx`: Tabbed interface (admin/student) with separate auth flows
- `middleware.ts`: Route protection with userType + role validation
- Session includes: `role`, `userType`, `studentId`, `class` properties

## �️ Database Schema Patterns

**Complex Relational Design** - Focus on these key relationships:

```prisma
User (teachers) -> Class (owned) -> Assignment -> Submission -> Grade
                -> Enrollment <-> Student (legacy table)
Submission -> Comment (inline feedback)
Submission -> Grade (rubric-based scoring)
```

**Critical Models**:
- `User`: Role-based (ADMIN/TEACHER/STUDENT) with password hashing
- `Class`: Teacher-owned with unique join codes
- `Assignment`: Rich rubric JSON, file type restrictions
- `Submission`: Status workflow (DRAFT->SUBMITTED->GRADED->RETURNED)

## 🔧 Environment & Development Setup

**Always verify environment loading first**:
```bash
# Database connection test
node test-db.js  # Custom script to verify DATABASE_URL

# Development workflow
npm run dev --turbopack  # Turbopack for faster builds
npm run db:push          # Schema changes to DB
npm run db:seed          # Creates admin/teacher records
```

**Required Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection (Neon cloud)
- `NEXTAUTH_SECRET`: Session signing (min 32 chars)
- `NEXTAUTH_URL`: Auth callback URL
- `BLOB_READ_WRITE_TOKEN`: File storage

## 📁 File Organization Patterns

**Component Structure**:
- `src/components/ui/`: Radix UI primitives (dialog, tabs, button, etc.)
- `src/components/`: Feature components (TeacherDashboard, CreateClassModal)
- `src/app/api/`: RESTful endpoints with role-based access control
- `src/lib/`: Utilities (auth, prisma, validation)

**API Route Pattern**: Every route checks session and role permissions:
```typescript
const session = await getServerSession(authOptions)
if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

## 🎯 Key Features Implementation

**Teacher Dashboard** (`TeacherDashboard.tsx`):
- Real data loading from APIs (`/api/classes`, `/api/assignments`)
- Tab-based navigation (Overview/Classes/Assignments/Submissions/Analytics)
- CreateClassModal integration with form validation

**Student Portfolio System**:
- ZIP upload with code extraction and preview
- Monaco Editor for live code editing
- Rubric-based grading with inline comments
- File validation (HTML/CSS/JS only)

## � Common Debugging Patterns

**Database Connection Issues**:
1. Check environment variables with `test-db.js`
2. Verify Prisma client generation: `npm run db:generate`
3. Restart dev server to reload env vars

**Authentication Failures**:
1. Verify admin records exist: check `prisma/seed.ts`
2. Test password hashing: `bcrypt.compare()` in debug scripts
3. Check role permissions in middleware

**API Route Debugging**:
- All routes use `authOptions` from `src/lib/auth-config.ts`
- Session validation pattern is consistent across endpoints
- Role checking must include all admin variants: `ADMIN`, `SUPER_ADMIN`

## 🔄 Development Workflow

**Making Changes**:
1. Schema changes: Update `prisma/schema.prisma` → `npm run db:push`
2. New features: Follow existing patterns in API routes
3. Auth changes: Test both admin/student login flows
4. UI changes: Use existing Radix UI components in `src/components/ui/`

**Testing Approach**:
- Manual login testing with seeded credentials
- Database connection verification with custom scripts
- Role-based access testing across routes

This system prioritizes educational functionality with robust authentication, file handling, and real-time code assessment capabilities.