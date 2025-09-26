# 🚨 URGENT: Vercel Environment Variables Setup

## Masalah yang Ditemukan:
Redirect login gagal karena environment variables belum di-set di Vercel, khususnya `NEXTAUTH_URL` dan `NEXTAUTH_SECRET`.

## 🔧 Langkah-langkah Perbaikan:

### 1. Login ke Vercel Dashboard
1. Buka https://vercel.com/dashboard
2. Pilih project: **landing-page-gema**
3. Masuk ke **Settings** → **Environment Variables**

### 2. Tambahkan Environment Variables Wajib:

#### ⚡ CRITICAL VARIABLES:
```bash
NEXTAUTH_URL = https://landing-page-gema.vercel.app
NEXTAUTH_SECRET = gema-sma-wahidiyah-super-secret-production-key-2025-kediri-$(openssl rand -base64 32)
NEXTAUTH_COOKIE_DOMAIN = landing-page-gema.vercel.app
DATABASE_URL = file:./prod.db
```

#### 📧 Admin Credentials:
```bash
ADMIN_EMAIL = admin@smawahidiyah.edu
ADMIN_PASSWORD = admin123!@#
```

#### 🌐 Site Configuration:
```bash
NEXT_PUBLIC_SITE_URL = https://landing-page-gema.vercel.app
NEXT_PUBLIC_SITE_NAME = GEMA - Generasi Muda Informatika | SMA Wahidiyah Kediri
NEXT_PUBLIC_CONTACT_EMAIL = smaswahidiyah@gmail.com
NEXT_PUBLIC_SCHOOL_NAME = SMA Wahidiyah Kediri
NEXT_PUBLIC_REGISTRATION_URL = https://spmbkedunglo.com
NEXT_PUBLIC_INSTAGRAM_URL = https://instagram.com/smawahidiyah_official
```

### 3. Redeploy Setelah Environment Variables Di-set:
```bash
# Method 1: Push any small change to trigger redeploy
git commit --allow-empty -m "Trigger redeploy after env vars setup"
git push

# Method 2: Manual redeploy di Vercel dashboard
# Go to Deployments → Click "..." → Redeploy
```

## 🔍 Debug Steps:

### 1. Cek Cookie di Browser:
- Open DevTools → Application → Cookies
- Cari: `next-auth.session-token`
- Harus muncul setelah login berhasil

### 2. Cek Network Tab:
- Login attempt should show:
  - POST /api/auth/callback/credentials
  - Response with Set-Cookie header

### 3. Console Logs:
- Middleware logs akan muncul di Vercel Functions log
- NextAuth redirect callback logs

## ⚠️ Jika Masih Bermasalah:

1. **Hapus semua cookies** dan coba login ulang
2. **Incognito mode** untuk test clean session
3. **Cek Vercel Function Logs** di dashboard untuk error details

## 📝 Expected Behavior After Fix:

1. User login → NextAuth creates session
2. Middleware validates token
3. Automatic redirect to `/admin/dashboard`
4. Session cookie tersimpan otomatis mengikuti domain production (contoh: `landing-page-gema.vercel.app` atau custom domain sekolah)

---

**STATUS: MENUNGGU ENVIRONMENT VARIABLES SETUP** ⏳