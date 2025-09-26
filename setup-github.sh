#!/bin/bash

# GEMA Landing Page - GitHub Setup Script
# Run this script to setup GitHub repository and deploy to Vercel

echo "🚀 Setting up GEMA Landing Page for deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Commit changes
echo "💾 Creating initial commit..."
git commit -m "🎉 Initial commit: GEMA Landing Page with Vercel deployment setup

Features:
- Complete landing page with hero, about, activities, testimonials
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion  
- SEO optimized with metadata and sitemap
- Vercel deployment ready
- Environment variables configured"

# Set main branch
echo "🌿 Setting main branch..."
git branch -M main

# Instructions for GitHub setup
echo ""
echo "✅ Git repository ready!"
echo ""
echo "📋 Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Copy the repository URL"
echo "3. Run: git remote add origin YOUR_GITHUB_REPO_URL"
echo "4. Run: git push -u origin main"
echo "5. Go to vercel.com and import your GitHub repository"
echo ""
echo "🎯 Example:"
echo "   git remote add origin https://github.com/username/gema-landing-page.git"
echo "   git push -u origin main"
echo ""
echo "🔗 Then visit: https://vercel.com/new"
echo ""
echo "🎉 Happy deploying!"
