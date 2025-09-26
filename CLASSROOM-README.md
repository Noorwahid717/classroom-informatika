# 🏫 Classroom Informatika - Complete Assessment System

## ✅ **PROJECT STATUS: COMPLETED**

**Classroom Informatika** adalah sistem penilaian berbasis web untuk mata pelajaran Informatika di SMA Wahidiyah Kediri. Sistem ini mendukung upload tugas dalam format ZIP (HTML, CSS, JS), preview kode langsung, validasi otomatis, dan sistem penilaian berbasis rubrik.

---

## 🎯 **Fitur Utama yang Telah Diimplementasi**

### 👨‍🏫 **Teacher Features**
- ✅ **Class Management** - Buat dan kelola kelas dengan kode unik
- ✅ **Assignment Creation** - Buat tugas dengan rubrik penilaian
- ✅ **File Upload System** - Terima submission ZIP dari siswa
- ✅ **Code Preview** - Monaco Editor untuk preview kode siswa
- ✅ **Auto Validation** - HTMLHint, Stylelint, ESLint integration
- ✅ **Rubric Grading** - Sistem penilaian berbasis kriteria 
- ✅ **Inline Comments** - Feedback langsung pada submission
- ✅ **Teacher Dashboard** - Analytics dan manajemen lengkap

### 👨‍🎓 **Student Features**
- ✅ **Class Enrollment** - Join kelas dengan kode
- ✅ **Assignment View** - Lihat tugas dan deadline
- ✅ **ZIP Upload** - Upload tugas HTML/CSS/JS dalam ZIP
- ✅ **Live Preview** - Preview hasil kode secara real-time
- ✅ **Grade Tracking** - Lihat nilai dan feedback guru
- ✅ **Student Dashboard** - Track progress dan tugas

### 🔧 **System Features**
- ✅ **Authentication** - NextAuth dengan role-based access
- ✅ **Database** - PostgreSQL dengan Prisma ORM
- ✅ **File Storage** - Vercel Blob untuk file ZIP
- ✅ **Code Validation** - Automated quality checking
- ✅ **Security** - Comprehensive security measures
- ✅ **Responsive UI** - Mobile-friendly design

---

## 🛠️ **Tech Stack**

| Component | Technology | Status |
|-----------|------------|---------|
| **Frontend** | Next.js 15 + TypeScript | ✅ Complete |
| **Backend** | Next.js API Routes | ✅ Complete |
| **Database** | PostgreSQL + Prisma | ✅ Complete |
| **Authentication** | NextAuth.js | ✅ Complete |
| **File Storage** | Vercel Blob | ✅ Complete |
| **Code Editor** | Monaco Editor | ✅ Complete |
| **UI Framework** | Tailwind CSS + Radix UI | ✅ Complete |
| **Validation** | HTMLHint + Stylelint + ESLint | ✅ Complete |
| **Deployment** | Vercel | ✅ Ready |

---

## 📁 **Project Structure**

```
classroom-informatika/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── classes/      # Class management
│   │   │   ├── assignments/  # Assignment CRUD
│   │   │   ├── submissions/  # File upload & preview
│   │   │   ├── grades/       # Grading system
│   │   │   ├── comments/     # Feedback system
│   │   │   └── enrollments/  # Class enrollment
│   │   └── layout.tsx        # App layout
│   ├── components/
│   │   ├── FileUpload.tsx        # ZIP upload component
│   │   ├── CodePreview.tsx       # Monaco Editor preview
│   │   ├── ValidationResults.tsx # Code quality results
│   │   ├── GradingInterface.tsx  # Teacher grading UI
│   │   ├── TeacherDashboard.tsx  # Teacher management
│   │   ├── StudentDashboard.tsx  # Student interface
│   │   └── ui/                   # Reusable UI components
│   └── lib/
│       ├── prisma.ts         # Database client
│       ├── validation.ts     # Code validation service
│       ├── security.ts       # Security configuration
│       └── utils.ts          # Utility functions
├── package.json              # Dependencies & scripts
└── README.md                 # This file
```

---

## 🚀 **Installation & Setup**

### 1. **Clone Repository**
```bash
git clone https://github.com/Noorwahid717/landing-page-gema.git
cd landing-page-gema
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Environment Setup**
Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/classroom_informatika"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Vercel Blob (for file storage)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

### 4. **Database Setup**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Seed sample data
npm run db:seed
```

### 5. **Development Server**
```bash
npm run dev
```

Server akan berjalan di [http://localhost:3000](http://localhost:3000)

---

## 📊 **Database Schema**

### **Core Tables:**
- **Users** - Admin, Teacher, Student dengan role-based access
- **Classes** - Kelas dengan kode unik dan info semester
- **Assignments** - Tugas dengan rubrik dan deadline
- **Submissions** - Upload ZIP dengan metadata
- **Grades** - Penilaian berbasis rubrik
- **Comments** - Feedback dan komunikasi
- **Enrollments** - Relasi siswa-kelas

### **Key Features:**
- ✅ **Referential Integrity** - Foreign key constraints
- ✅ **Cascade Deletion** - Clean data removal
- ✅ **Audit Logging** - Track user actions
- ✅ **Role-based Access** - Security permissions

---

## 🔒 **Security Features**

### **Authentication & Authorization**
- ✅ NextAuth.js dengan session management
- ✅ Role-based access control (RBAC)
- ✅ JWT tokens untuk API authentication
- ✅ Password hashing dengan bcrypt

### **File Security**
- ✅ ZIP validation dan content scanning
- ✅ File size limits (10MB default)
- ✅ Malicious content detection
- ✅ Safe file type restrictions

### **API Security**
- ✅ Rate limiting untuk semua endpoints
- ✅ Input validation dan sanitization
- ✅ CSRF protection
- ✅ Security headers (CSP, HSTS, etc.)

### **Data Protection**
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Sensitive data masking
- ✅ Audit logging

---

## 🎨 **API Endpoints**

### **Classes**
- `GET /api/classes` - List user's classes
- `POST /api/classes` - Create new class
- `GET /api/classes/[id]` - Get class details
- `PUT /api/classes/[id]` - Update class
- `DELETE /api/classes/[id]` - Delete class

### **Assignments**
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/[id]` - Get assignment details
- `PUT /api/assignments/[id]` - Update assignment
- `DELETE /api/assignments/[id]` - Delete assignment

### **Submissions**
- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Upload ZIP file
- `GET /api/submissions/[id]` - Get submission + preview
- `DELETE /api/submissions/[id]` - Delete submission
- `POST /api/submissions/[id]/validate` - Run code validation

### **Grading & Comments**
- `GET /api/grades` - List grades
- `POST /api/grades` - Create/update grade
- `GET /api/comments` - List comments
- `POST /api/comments` - Add comment

### **Enrollment**
- `GET /api/enrollments` - List enrollments
- `POST /api/enrollments` - Join class with code

---

## 💻 **Components Overview**

### **FileUpload.tsx**
- **Drag & drop interface** untuk upload ZIP
- **Real-time validation** struktur file
- **Progress tracking** untuk upload
- **Error handling** comprehensive

### **CodePreview.tsx**
- **Monaco Editor** dengan syntax highlighting
- **File tree navigation** untuk explore ZIP
- **Live preview** HTML/CSS/JS dalam iframe
- **Download & export** functionality

### **ValidationResults.tsx**
- **HTMLHint** untuk validasi HTML
- **Stylelint** untuk CSS standards
- **ESLint** untuk JavaScript quality
- **Scoring system** dengan weighted grading

### **GradingInterface.tsx**
- **Rubric-based grading** dengan multiple criteria
- **Inline comments** pada submission
- **Preview integration** untuk review kode
- **Batch grading** support

### **Teacher/Student Dashboards**
- **Analytics & statistics**
- **Assignment management**
- **Grade tracking**
- **Class administration**

---

## 🎯 **Workflow Penggunaan**

### **1. Teacher Workflow**
1. **Login** sebagai teacher/admin
2. **Create Class** dengan nama dan deskripsi
3. **Share class code** kepada siswa
4. **Create Assignment** dengan rubrik penilaian
5. **Monitor submissions** dari dashboard
6. **Grade assignments** dengan rubrik
7. **Provide feedback** melalui comments
8. **Track analytics** performance siswa

### **2. Student Workflow**
1. **Login** sebagai student
2. **Join class** dengan class code
3. **View assignments** dan requirements
4. **Prepare HTML/CSS/JS** project
5. **Create ZIP file** dengan struktur yang benar
6. **Upload submission** melalui drag & drop
7. **Preview hasil** langsung di browser
8. **View grades** dan feedback dari guru

---

## 🔍 **Code Quality & Validation**

### **Automated Checks**
- ✅ **HTML Validation** - DOCTYPE, semantic tags, accessibility
- ✅ **CSS Validation** - Syntax, best practices, formatting
- ✅ **JavaScript Validation** - ES6+ standards, code quality
- ✅ **File Structure** - Proper organization, naming conventions

### **Scoring Algorithm**
```typescript
Score = 100 - (errors × 10) - (warnings × 2)
Weighted Score = Σ(criterion_score × weight) / Σ(max_score × weight)
```

### **Feedback Generation**
- **Line-by-line** error identification
- **Rule references** untuk learning
- **Improvement suggestions**
- **Best practices** recommendations

---

## 📱 **Responsive Design**

### **Mobile Support**
- ✅ **Mobile-first** approach
- ✅ **Touch-friendly** interfaces
- ✅ **Responsive tables** dan cards
- ✅ **Adaptive navigation**

### **Browser Support**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 🚢 **Deployment**

### **Vercel Deployment (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
npm run deploy

# Or use deploy button
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Noorwahid717/landing-page-gema)

### **Environment Variables**
Set di Vercel dashboard:
- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Production URL
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token

---

## 📈 **Performance Optimizations**

### **Frontend**
- ✅ **Static Site Generation** untuk pages
- ✅ **Image optimization** dengan Next.js Image
- ✅ **Code splitting** automatic
- ✅ **Bundle optimization** dengan Turbopack

### **Backend**
- ✅ **Database indexing** untuk queries
- ✅ **Connection pooling** dengan Prisma
- ✅ **API response caching**
- ✅ **File streaming** untuk large uploads

### **Storage**
- ✅ **Vercel Blob** untuk scalable storage
- ✅ **ZIP compression** untuk file transfer
- ✅ **CDN distribution** automatic

---

## 🔧 **Development Scripts**

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes
npm run db:seed          # Seed sample data
npm run db:migrate       # Run migrations

# Deployment
npm run deploy           # Deploy to production
npm run deploy-preview   # Deploy preview
npm run lint             # Run ESLint
```

---

## ⚙️ **Configuration Files**

### **Key Configurations**
- `prisma/schema.prisma` - Database schema
- `tailwind.config.js` - Styling configuration
- `next.config.js` - Next.js settings
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - Linting rules

---

## 🎓 **Educational Features**

### **Learning Support**
- ✅ **Interactive code preview** untuk experimentation
- ✅ **Real-time feedback** untuk immediate learning
- ✅ **Best practices** integration dalam validation
- ✅ **Progress tracking** untuk motivation

### **Assessment Tools**
- ✅ **Rubric-based evaluation** untuk fair grading
- ✅ **Automated quality checks** untuk consistency
- ✅ **Detailed feedback** untuk improvement
- ✅ **Portfolio building** untuk student showcase

---

## 🤝 **Contributing**

Untuk berkontribusi pada project ini:

1. **Fork** repository
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

---

## 📞 **Support & Contact**

- **Email**: smaswahidiyah@gmail.com
- **Instagram**: [@smawahidiyah_official](https://instagram.com/smawahidiyah_official)
- **Sekolah**: SMA Wahidiyah Kediri
- **Alamat**: Jl. KH. Wahid Hasyim, Kediri, Jawa Timur

---

## 📄 **License**

Project ini dibuat untuk keperluan edukasi di SMA Wahidiyah Kediri. 

© 2024 SMA Wahidiyah Kediri - Sistem Classroom Informatika

---

## 🎉 **Completed Checklist**

✅ **Step 1**: Project Setup (Next.js 15 + TypeScript + Tailwind)  
✅ **Step 2**: Database Schema (PostgreSQL + Prisma)  
✅ **Step 3**: Authentication (NextAuth + Role-based)  
✅ **Step 4**: API Routes (Complete CRUD operations)  
✅ **Step 5**: File Upload & Preview (ZIP + Monaco Editor)  
✅ **Step 6**: Teacher Grading Interface (Rubric + Comments)  
✅ **Step 7**: Student/Teacher Dashboards (Analytics + Management)  
✅ **Step 8**: Automated Code Validation (HTMLHint + Stylelint + ESLint)  
✅ **Step 9**: Security Implementation (Comprehensive protection)  

**🚀 CLASSROOM INFORMATIKA SIAP UNTUK PRODUCTION! 🎯**