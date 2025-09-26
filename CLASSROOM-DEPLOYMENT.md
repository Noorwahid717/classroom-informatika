# 🚀 Deployment Guide - Classroom Informatika

## 📋 **Pre-Deployment Checklist**

### ✅ **Development Complete**
- [x] All components implemented and tested
- [x] Database schema finalized
- [x] API endpoints functional
- [x] Security measures in place
- [x] UI responsive and polished

### ✅ **Environment Setup**
- [x] Production database prepared
- [x] Environment variables configured
- [x] File storage service ready
- [x] Authentication providers configured

---

## 🌐 **Vercel Deployment (Recommended)**

### **Option 1: Quick Deploy Button**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Noorwahid717/landing-page-gema)

1. Click deploy button
2. Connect GitHub account
3. Import repository
4. Configure environment variables
5. Deploy automatically

### **Option 2: GitHub Integration**
1. **Push to GitHub:**
```bash
git add .
git commit -m "feat: Complete Classroom Informatika system"
git push origin main
```

2. **Import to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import GitHub repository
   - Configure settings

### **Option 3: Vercel CLI**
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy project
vercel

# Deploy to production
vercel --prod
```

---

## 🗄️ **Database Setup**

### **Option 1: Vercel Postgres (Recommended)**
```bash
# Install Vercel Postgres
npm install @vercel/postgres

# Create database in Vercel dashboard
# Copy connection string to environment variables
```

### **Option 2: Supabase**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get PostgreSQL connection string
4. Set as `DATABASE_URL` environment variable

### **Database Migration:**
```bash
# After deployment, run migrations
npm run db:push

# Or if using migrations
npm run db:migrate
```

---

## ⚙️ **Environment Variables**

### **Required Variables**
Create these in Vercel dashboard:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="https://your-domain.vercel.app"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_token"

# Optional: Email Provider
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@your-domain.com"
```

---

## 🔐 **Security Configuration**

### **Production Security Checklist:**
- [x] **HTTPS Only** - Vercel provides automatic SSL
- [x] **Environment Secrets** - Never commit sensitive data
- [x] **Rate Limiting** - Already implemented in API routes
- [x] **Input Validation** - Comprehensive validation in place
- [x] **File Upload Security** - ZIP validation and size limits
- [x] **Database Security** - Parameterized queries with Prisma

---

## 🧪 **Testing Before Production**

### **Pre-Deployment Tests:**
```bash
# Run all tests
npm test

# Build test
npm run build

# Type check
npm run type-check

# Lint check
npm run lint
```

### **Manual Testing Checklist:**
- [ ] User registration and login
- [ ] Class creation and enrollment
- [ ] Assignment creation and submission
- [ ] File upload and preview
- [ ] Grading interface functionality
- [ ] Mobile responsiveness
- [ ] Security measures (role-based access)

---

## 📈 **Post-Deployment Setup**

### **Initial Data Setup:**
```bash
# Create admin user (run once)
npm run db:seed

# Or create manually through API
curl -X POST https://your-domain.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smawahidiyah.sch.id","password":"secure-password","role":"ADMIN"}'
```

### **First-Time Configuration:**
1. **Create Admin Account**
2. **Create First Class**
3. **Test File Upload**
4. **Verify Email Notifications**
5. **Test Grading Workflow**

---

## 🚨 **Troubleshooting**

### **Common Issues:**

**Database Connection Error:**
```bash
# Check DATABASE_URL format
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Test connection
npm run db:push
```

**Build Failures:**
```bash
# Clear cache
rm -rf .next
npm run build

# Check TypeScript errors
npm run type-check
```

**File Upload Issues:**
```bash
# Verify Blob token
echo $BLOB_READ_WRITE_TOKEN

# Check file permissions
ls -la uploads/
```

---

## ✅ **Deployment Checklist**

### **Pre-Deployment:**
- [ ] Code complete and tested
- [ ] Environment variables configured
- [ ] Database setup and migrated
- [ ] Domain configured (if custom)
- [ ] SSL certificate ready

### **Deployment:**
- [ ] Deploy to production
- [ ] Verify all endpoints working
- [ ] Test file upload functionality
- [ ] Confirm authentication working
- [ ] Check responsive design

### **Post-Deployment:**
- [ ] Create admin account
- [ ] Setup monitoring
- [ ] Configure backups
- [ ] Document admin procedures
- [ ] Train end users

---

## 🎉 **Go Live Announcement**

```markdown
🚀 **CLASSROOM INFORMATIKA SUDAH LIVE!**

Website: https://classroom.smawahidiyah.vercel.app
Admin: admin@smawahidiyah.sch.id

✅ Fitur Lengkap:
- Upload tugas ZIP (HTML/CSS/JS)
- Preview kode real-time
- Sistem penilaian otomatis
- Dashboard guru dan siswa
- Validasi kode otomatis

📱 Akses dari HP/Laptop
🔒 Aman dan terpercaya
⚡ Performa tinggi

Selamat menggunakan sistem baru! 🎓
```

---

**🚀 DEPLOYMENT COMPLETE - CLASSROOM INFORMATIKA PRODUCTION READY! 🎯**