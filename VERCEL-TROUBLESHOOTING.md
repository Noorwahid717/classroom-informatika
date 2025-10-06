# Vercel Deployment Troubleshooting - GEMA Landing Page

## ❌ Common Issues

### Issue 1: "Server error - Configuration" 
NextAuth configuration error karena environment variables tidak di-set di Vercel production.

### Issue 2: "Email atau password salah"
Admin user belum dibuat di database karena database connection error.

### Issue 3: "Unable to open database file"
SQLite file-based database tidak compatible dengan Vercel production (read-only filesystem).

### Issue 4: "No Next.js version detected"
Vercel akan membaca `package.json` di root repository untuk menentukan framework. Pastikan dependensi `next` tetap
terdaftar (dev dependency) di root monorepo sehingga auto-detection berhasil meskipun aplikasi berada di `apps/web`.

## 🚨 **CRITICAL: Database Issue**

**SQLite tidak bisa digunakan di Vercel production!** 

Error: `"Unable to open the database file"` terjadi karena:
- Vercel filesystem adalah read-only
- Connection string `file:./prod.db` mencoba membuka SQLite lokal
- Production wajib memakai database Postgres yang di-host di cloud

### ✅ **Database Solutions:**

#### Option 1: Vercel Postgres (Recommended)
1. Vercel Dashboard → Storage → Create Postgres Database
2. Copy `POSTGRES_URL` to Environment Variables
3. Update `DATABASE_URL=postgresql://...`
4. Redeploy → Auto-migration + seeding

#### Option 2: Supabase (Free)
1. https://supabase.com → New Project
2. Copy Database URL
3. Set `DATABASE_URL=postgresql://...`

#### Option 3: PlanetScale (MySQL)
1. https://planetscale.com → New Database  
2. Copy connection string
3. Set `DATABASE_URL=mysql://...`

## ✅ Solution Steps

#### Option 1: Via Vercel Dashboard (Recommended)

1. **Login ke Vercel Dashboard:**
   - Kunjungi: https://vercel.com/dashboard
   - Pilih project: `landing-page-gema`

2. **Tambah Environment Variables:**
   - Go to: Settings → Environment Variables
   - Add the following variables untuk **Production**:

```bash
# CRITICAL - NextAuth Configuration
NEXTAUTH_URL=https://landing-page-gema.vercel.app
NEXTAUTH_SECRET=gema-sma-wahidiyah-super-secret-production-key-2025-kediri
NEXTAUTH_COOKIE_DOMAIN=landing-page-gema.vercel.app

# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Admin Credentials  
ADMIN_EMAIL=admin@smawahidiyah.edu
ADMIN_PASSWORD=admin123

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://landing-page-gema.vercel.app
NEXT_PUBLIC_SITE_NAME=GEMA - Generasi Muda Informatika | SMA Wahidiyah Kediri
NEXT_PUBLIC_CONTACT_EMAIL=smaswahidiyah@gmail.com
NEXT_PUBLIC_SCHOOL_NAME=SMA Wahidiyah Kediri
NEXT_PUBLIC_REGISTRATION_URL=https://spmbkedunglo.com
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/smawahidiyah_official
```

3. **Redeploy:**
   - Klik "Redeploy" di dashboard
   - Atau push commit baru ke GitHub

#### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add environment variables
bash setup-vercel-env.sh

# Redeploy
vercel --prod
```

### 🔍 Testing After Fix

1. **Test NextAuth:**
   ```
   https://landing-page-gema.vercel.app/api/auth/signin
   ```

2. **Test Admin Login:**
   ```  
   https://landing-page-gema.vercel.app/admin/login
   Email: admin@smawahidiyah.edu
   Password: admin123
   ```

3. **Seed Database (First Time Setup):**
   ```
   POST: https://landing-page-gema.vercel.app/api/seed?secret=YOUR_NEXTAUTH_SECRET
   ```

3. **Test Debug Session:**
   ```
   https://landing-page-gema.vercel.app/api/debug-session
   ```

### 🛠️ Database Notice

**Important:** Gunakan connection string Postgres (mis. Neon, Supabase, Vercel Postgres). Format yang benar: `postgres://...` atau `postgresql://...`. String `file:./prod.db` tidak berlaku di production.

**Untuk production yang proper, gunakan:**
- **Vercel Postgres** (recommended)
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)
- **Railway** (PostgreSQL)

### 📝 Environment Variables Checklist

- [x] NEXTAUTH_URL - Production domain URL  
- [x] NEXTAUTH_SECRET - Strong random string
- [x] DATABASE_URL - Database connection string
- [x] ADMIN_EMAIL - Admin login email
- [x] ADMIN_PASSWORD - Admin login password
- [x] NEXT_PUBLIC_* - Public configuration variables

### 🚨 Security Notes

1. **NEXTAUTH_SECRET** harus unique dan strong (32+ characters)
2. **ADMIN_PASSWORD** harus strong untuk production
3. Jangan commit file `.env.production` ke git
4. Gunakan Vercel environment variables untuk secrets

---

**Status:** ✅ Ready for deployment with proper environment configuration