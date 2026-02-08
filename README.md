# StackResume

A done-for-you portfolio website service for technical students.

## Overview

StackResume allows technical students to get a professional, recruiter-ready portfolio website without writing any code. Students complete a guided form, and StackResume handles everything from design to deployment.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: Stripe
- **Deployment**: Vercel
- **Infrastructure**: Vercel (hosting + deployments)

## Project Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── (marketing)/      # Public marketing pages
│   │   │   ├── page.tsx      # Landing page
│   │   │   ├── pricing/      # Pricing page
│   │   │   └── layout.tsx    # Marketing layout
│   │   ├── (admin)/          # Admin dashboard
│   │   │   ├── page.tsx      # Admin overview
│   │   │   ├── submissions/  # Submission review
│   │   │   └── layout.tsx    # Admin layout
│   │   ├── (student)/        # Student dashboard
│   │   │   └── dashboard/    # Status lookup
│   │   ├── onboarding/       # Onboarding form
│   │   ├── checkout/         # Stripe checkout
│   │   ├── success/          # Success page
│   │   └── api/              # API routes
│   │       ├── create-payment-intent/
│   │       ├── deploy/
│   │       └── student/
│   ├── components/
│   │   ├── templates/        # Portfolio templates
│   │   │   ├── developer/
│   │   │   ├── data-scientist/
│   │   │   └── devops/
│   │   └── ui/
│   ├── lib/
│   │   ├── actions/          # Server actions
│   │   ├── db/              # Supabase clients
│   │   ├── tiers.ts         # Tier enforcement
│   │   ├── validation.ts    # Form validation
│   │   ├── deployment.ts    # Vercel deployment
│   │   └── auth.ts          # Auth utilities
│   └── types/
│       └── supabase.ts      # Database types
├── supabase/
│   └── schema.sql           # Database schema
└── .env.local.example       # Environment variables
```

## Features

### For Students
- **Zero Coding Required**: Complete one guided form
- **Quick Turnaround**: Live within 24 hours
- **Professional Design**: Recruiter-optimized layouts
- **Custom Domains**: Available on Professional and Flagship tiers
- **Status Tracking**: Check portfolio status via dashboard

### For Admins
- **Submission Review**: Quality checks and approval workflow
- **Deployment Queue**: Rate-limited processing
- **Tier Enforcement**: Server-side validation
- **Change Requests**: Track and manage updates

### Templates
1. **Developer**: Clean, minimal design
2. **Data Scientist**: Dark header with card-based layout
3. **DevOps**: Terminal-inspired aesthetic

All templates follow recruiter optimization rules:
- Name + role visible above the fold
- Projects appear before education
- No text blocks > 5 lines
- External links open in new tabs
- SEO metadata generated automatically

## Pricing Tiers

- **Starter ($129)**: Up to 3 projects, subdomain only
- **Professional ($229)**: Unlimited projects, custom domain, analytics
- **Flagship ($499)**: Everything + manual tweaks, resume review, LinkedIn review

## Setup Instructions

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Vercel
VERCEL_TOKEN=
VERCEL_TEAM_ID=

# Optional: AI for resume parsing
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your_random_secret
```

### 2. Database Setup

1. Create a Supabase project
2. Run the schema from `supabase/schema.sql` in the SQL Editor
3. Enable Row Level Security policies

### 3. Stripe Setup

1. Create a Stripe account
2. Get your API keys from the Dashboard
3. Set up webhook endpoint for production

### 4. Vercel Setup

1. Create a Vercel account
2. Generate an API token
3. Get your Team ID (if using teams)

### 5. Storage Setup

In Supabase Dashboard:
1. Go to Storage
2. Create a bucket named `student-assets`
3. Set public access policies

### 6. Deploy

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Deploy to Vercel
vercel --prod
```

## Deployment Pipeline

The deployment pipeline processes approved submissions:

1. Admin approves submission
2. Student status changes to `approved`
3. Deployment queued with rate limiting (5 concurrent)
4. Portfolio HTML generated based on role
5. Vercel project created/updated
6. Static files deployed
7. Subdomain assigned
8. Student status changes to `deployed`

### Deployment Options

**Option 1: Daily Cron (Vercel Free Tier)**
- Runs automatically once per day at 2 AM UTC
- Configure in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/deploy",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Option 2: Manual Deployment (Recommended for Free Tier)**
- Use the "Deploy" page in admin dashboard
- Click "Run Deployment Queue Now" button
- Instant deployment after approving submissions

**Option 3: External Cron Service (Free)**
- Use https://cron-job.org (free tier)
- Configure to ping: `https://your-app.vercel.app/api/deploy?secret=YOUR_CRON_SECRET`
- Set interval to every 10 minutes

**Option 4: Vercel Pro ($20/month)**
- Unlimited cron jobs
- Run every 10 minutes automatically
- No manual intervention needed

## Admin Access

To create an admin user:

1. Sign up via Supabase Auth
2. Insert into `admin_users` table:

```sql
INSERT INTO admin_users (id, email, role)
VALUES ('user-uuid', 'admin@example.com', 'admin');
```

3. Access admin at `/admin`

## Development

### Running Locally

```bash
npm run dev
```

### Testing Tier Enforcement

Tier limits are enforced at multiple levels:
- Form level: UI prevents adding more than allowed
- Server level: Actions validate before saving
- Admin level: Quality checks highlight violations

### Common Issues

1. **Supabase RLS errors**: Ensure policies are set correctly
2. **Stripe payment failures**: Check webhook configuration
3. **Deployment failures**: Verify Vercel token and rate limits

## Next Steps

The following features are planned but not yet implemented:

- [ ] AI-powered resume parsing
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Change request system
- [ ] Upgrade tier flow

## License

Proprietary - StackResume Internal
