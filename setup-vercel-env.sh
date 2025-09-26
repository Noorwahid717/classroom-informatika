#!/bin/bash

# Setup Vercel Environment Variables for GEMA Landing Page
# Run this script: bash setup-vercel-env.sh

echo "🚀 Setting up Vercel Environment Variables for GEMA Landing Page..."

# Critical NextAuth Variables
vercel env add NEXTAUTH_URL production
# Enter: https://landing-page-gema.vercel.app

vercel env add NEXTAUTH_SECRET production
# Enter: gema-sma-wahidiyah-super-secret-production-key-2025-kediri

# Database URL (untuk development/preview - production perlu database real)
vercel env add DATABASE_URL production
# Enter: file:./prod.db

# Admin Credentials
vercel env add ADMIN_EMAIL production
# Enter: admin@smawahidiyah.edu

vercel env add ADMIN_PASSWORD production
# Enter: GemaWahidiyah2025!

# Public Site Info
vercel env add NEXT_PUBLIC_SITE_URL production
# Enter: https://landing-page-gema.vercel.app

vercel env add NEXT_PUBLIC_SITE_NAME production
# Enter: GEMA - Generasi Muda Informatika | SMA Wahidiyah Kediri

vercel env add NEXT_PUBLIC_SITE_DESCRIPTION production
# Enter: Wadah kreatif untuk belajar, berinovasi, dan berkembang di dunia teknologi dengan landasan nilai-nilai pesantren

# Contact Info
vercel env add NEXT_PUBLIC_CONTACT_EMAIL production
# Enter: smaswahidiyah@gmail.com

vercel env add NEXT_PUBLIC_CONTACT_ADDRESS production
# Enter: Jl. KH. Wahid Hasyim, Ponpes Kedunglo, Bandar Lor, Kec. Mojoroto, Kota Kediri, Jawa Timur

vercel env add NEXT_PUBLIC_SCHOOL_NAME production
# Enter: SMA Wahidiyah Kediri

vercel env add NEXT_PUBLIC_PESANTREN_NAME production
# Enter: Pondok Pesantren Kedunglo

# Registration URLs
vercel env add NEXT_PUBLIC_REGISTRATION_URL production
# Enter: https://spmbkedunglo.com

vercel env add NEXT_PUBLIC_SPMB_URL production
# Enter: https://spmbkedunglo.com

# Social Media
vercel env add NEXT_PUBLIC_INSTAGRAM_URL production
# Enter: https://instagram.com/smawahidiyah_official

vercel env add NEXT_PUBLIC_LINKTREE_URL production
# Enter: https://linktr.ee/smawahidiyah

echo "✅ Environment variables setup completed!"
echo "🔄 Redeploy your application: vercel --prod"