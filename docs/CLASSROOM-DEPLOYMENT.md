# 🚀 Deployment Guide - Classroom Informatika

> **Catatan:** Panduan ini akan direvisi setelah arsitektur baru (pnpm + Prisma + NextAuth) selesai dipetakan. Gunakan sebagai referensi awal saja.

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

## 🌐 **Netlify Deployment (Recommended)**

### **Option 1: Deploy to Netlify Button**
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Noorwahid717/landing-page-gema)

1. Klik tombol deploy
2. Hubungkan akun GitHub
3. Pilih repository Classroom Informatika
4. Netlify akan membaca `netlify.toml` dan menyiapkan build command otomatis
5. Tambahkan environment variable yang dibutuhkan lalu jalankan deploy pertama

### **Option 2: GitHub Integration Manual**
1. **Push ke GitHub:**
```bash
git add .
git commit -m "feat: Complete Classroom Informatika system"
git push origin main
```

2. **Import ke Netlify:**
   - Buka [app.netlify.com](https://app.netlify.com)
   - Klik "Add new site" → "Import an existing project"
   - Pilih repository GitHub
   - Pastikan build command otomatis terisi sesuai `netlify.toml`
   - Set environment variable sebelum menekan tombol **Deploy site**

### **Option 3: Netlify CLI**
```bash
# Install Netlify CLI secara global
npm install -g netlify-cli

# Login ke Netlify
netlify login

# Inisialisasi site baru atau sambungkan ke site yang ada
netlify init

# Deploy preview (build dari branch saat ini)
netlify deploy --build

# Deploy ke produksi (menggunakan branch production)
netlify deploy --build --prod
```

---

## 🗄️ **Database Setup**

### **Option 1: Netlify Postgres / External Managed Postgres (Recommended)**
Gunakan database Postgres terkelola (Supabase, Neon, Railway, atau Netlify Postgres beta jika tersedia).
```bash
# Contoh instalasi client Postgres
pnpm add @prisma/client

# Buat database melalui dashboard provider pilihan Anda
# Salin connection string ke environment variable Netlify
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
Set di **Site configuration → Environment variables** di Netlify:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="https://your-domain.netlify.app"

# File Storage (Vercel Blob API)
# Token dapat digunakan di luar Vercel selama project tetap aktif
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
- [x] **HTTPS Only** - Netlify menyediakan SSL otomatis
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
curl -X POST https://your-domain.netlify.app/api/auth/register \
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

Website: https://classroom.smawahidiyah.netlify.app
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