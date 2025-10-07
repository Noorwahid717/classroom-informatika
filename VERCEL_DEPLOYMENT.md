# 🚀 GEMA Landing Page - Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ **1. Project Status**
- [x] Next.js 15 dengan App Router ✅
- [x] TypeScript configuration ✅
- [x] Tailwind CSS 4 ✅
- [x] Prisma ORM dengan PostgreSQL ✅
- [x] NextAuth.js authentication ✅
- [x] Real-time chat system ✅
- [x] Admin dashboard ✅
- [x] Responsive design ✅

### ✅ **2. Build Configuration**
- [x] `vercel.json` optimized ✅
- [x] `next.config.ts` configured ✅
- [x] Environment variables template ✅
- [x] `.vercelignore` setup ✅

## 🌐 Deployment Options

### **Option 1: Vercel Dashboard (Recommended)**

1. **Login ke Vercel**
   ```
   https://vercel.com/dashboard
   ```

2. **Import Repository**
   - Click "Add New Project"
   - Import dari GitHub: `Noorwahid717/landing-page-gema`
   - Framework Preset: Next.js (auto-detected)

3. **Configure Environment Variables**
   ```bash
   NEXTAUTH_SECRET=your-super-secret-production-key
   NEXTAUTH_URL=https://your-app-name.vercel.app
   DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
   ADMIN_EMAIL=admin@smawahidiyah.edu
   ADMIN_PASSWORD=secure-admin-password
   ```

4. **Deploy**
   - Click "Deploy"
   - Auto-build dengan Next.js 15 + Turbopack
   - Domain: `https://your-app-name.vercel.app`

### **Option 2: Vercel CLI**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # Preview deployment
   npm run deploy-preview
   
   # Production deployment
   npm run deploy
   ```

## 🔧 Environment Variables Setup

### **Required Environment Variables untuk Production:**

```bash
# Core Settings
NEXTAUTH_SECRET="your-super-secret-production-key-32-chars-min"
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXT_PUBLIC_SITE_URL="https://your-app-name.vercel.app"

# Database (managed Postgres, e.g. Neon/Supabase/Railway)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Admin Credentials
ADMIN_EMAIL="admin@smawahidiyah.edu"
ADMIN_PASSWORD="secure-admin-password-change-this"

# Site Information
NEXT_PUBLIC_SITE_NAME="GEMA - SMA Wahidiyah Kediri"
NEXT_PUBLIC_SITE_DESCRIPTION="Generasi Muda Informatika SMA Wahidiyah"

# Contact Information
NEXT_PUBLIC_CONTACT_EMAIL="smaswahidiyah@gmail.com"
NEXT_PUBLIC_CONTACT_ADDRESS="Jl. KH. Wahid Hasyim, Ponpes Kedunglo, Kediri"

# Social Media
NEXT_PUBLIC_INSTAGRAM_URL="https://instagram.com/smawahidiyah_official"
NEXT_PUBLIC_LINKTREE_URL="https://linktr.ee/smawahidiyah"
NEXT_PUBLIC_REGISTRATION_URL="https://spmbkedunglo.com"
```

## 📊 Post-Deployment Checklist

### **✅ Functional Testing**
- [ ] Landing page loads correctly
- [ ] Admin login works (`/admin/login`)
- [ ] Contact form submissions
- [ ] Real-time chat functionality
- [ ] Multi-chat session management
- [ ] Registration forms
- [ ] Video/animation logo display
- [ ] Mobile responsiveness

### **✅ Performance Testing**
- [ ] Core Web Vitals scores
- [ ] Page load speed < 3s
- [ ] Image optimization working
- [ ] Video lazy loading
- [ ] API response times

### **✅ Security Testing**
- [ ] Admin authentication
- [ ] API route protection
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Security headers active

## 🎯 Expected Performance Metrics

### **Lighthouse Scores (Target):**
- **Performance**: 90+ ⚡
- **Accessibility**: 95+ ♿
- **Best Practices**: 90+ 📋
- **SEO**: 95+ 🔍

### **Core Web Vitals:**
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

## 🔧 Troubleshooting

### **Common Issues:**

1. **Build Errors**
   ```bash
   # Check Node.js version (requires 18+)
   node --version
   
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Database Issues**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema
   npx prisma db push
   ```

3. **Environment Variables**
   - Verify all required vars are set in Vercel Dashboard
   - Check spelling and formatting
   - Ensure NEXTAUTH_SECRET is 32+ characters

4. **Authentication Issues**
   - Verify NEXTAUTH_URL matches your domain
   - Check admin credentials
   - Clear browser cookies

## 🚀 Deployment Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server locally
npm run start

# Deploy to Vercel preview
npm run deploy-preview

# Deploy to Vercel production
npm run deploy

# Lint code
npm run lint
```

## 📱 Domain Configuration

### **Custom Domain Setup:**
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain: `gema.smawahidiyah.edu` (example)
3. Configure DNS records as shown
4. SSL certificate auto-generated

### **Subdomain Suggestions:**
- `gema.smawahidiyah.edu`
- `informatika.smawahidiyah.edu`
- `students.smawahidiyah.edu`

## 🔒 Security Recommendations

1. **Change Default Credentials**
   ```bash
   ADMIN_EMAIL=admin@smawahidiyah.edu
   ADMIN_PASSWORD=SecurePassword123!@#
   ```

2. **Generate Strong NEXTAUTH_SECRET**
   ```bash
   # Generate 32-character secret
   openssl rand -base64 32
   ```

3. **Regular Security Updates**
   - Update dependencies monthly
   - Monitor Vercel security advisories
   - Review admin access logs

## 📈 Analytics Setup (Optional)

1. **Vercel Analytics**
   - Enable in Vercel Dashboard
   - Real-time performance metrics

2. **Google Analytics**
   - Add tracking ID to environment variables
   - Monitor user behavior and conversions

## 🎉 Success! Your GEMA Landing Page is Live!

After successful deployment:
- ✅ Site accessible at your Vercel URL
- ✅ Admin dashboard at `/admin`
- ✅ Real-time chat functional
- ✅ Contact forms working
- ✅ Performance optimized

**🏫 GEMA SMA Wahidiyah siap menerima santri baru! 🚀**
