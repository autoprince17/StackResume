#!/bin/bash

echo "🚀 StackResume Deployment Helper"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo ""
echo "1. Create a GitHub repository:"
echo "   - Go to https://github.com/new"
echo "   - Name: stackresume"
echo "   - Keep it Public or Private"
echo "   - DON'T initialize with README"
echo ""
echo "2. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/stackresume.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Sign up for free accounts:"
echo "   - Supabase: https://supabase.com (Free tier: 500MB DB)"
echo "   - Vercel: https://vercel.com (Free tier: 100GB bandwidth)"
echo "   - Stripe: https://stripe.com (Test mode = free)"
echo ""
echo "4. Run database schema in Supabase SQL Editor"
echo ""
echo "5. Deploy on Vercel and add environment variables"
echo ""
echo "📖 Full instructions in DEPLOY.md"
echo ""

# Create .env.local template
if [ ! -f .env.local ]; then
    cat > .env.local << 'EOF'
# Supabase - Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe - Use test keys for development (free)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin/Cron - Generate a random string
CRON_SECRET=your-random-secret-here

# Vercel - Only needed for production deployment
VERCEL_TOKEN=
VERCEL_TEAM_ID=
EOF
    echo "✅ Created .env.local template"
fi

echo ""
echo "Next steps:"
echo "1. Edit .env.local with your actual values"
echo "2. Follow DEPLOY.md for detailed instructions"
echo "3. Run: npm run dev (to test locally)"
echo ""
