# ScholarPrep 🎓

AI-powered scholarship test practice for Australian primary school students.
Covers ACER, AAST and Edutest for Years 1–6.

## What's included

- **Landing page** — marketing page with pricing, features, and CTA
- **Authentication** — sign up / login with 7-day free trial tracking (via Supabase)
- **Practice tests** — AI-generated questions for Mathematics, Reading Comprehension, and General Ability
- **Writing section** — AI-assessed narrative and persuasive writing with scored criteria and feedback
- **Progress dashboard** — track performance across all subjects over time
- **PDF generator** — pay-per-question exam-style PDFs with answer keys (Stripe payments)

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 |
| Auth & Database | Supabase |
| AI (questions + writing) | Claude API (Anthropic) |
| Payments | Stripe |
| Hosting | Vercel (recommended) |
| PDF generation | Browser print (upgradeable to jsPDF) |

---

## Setup guide

### Step 1 — Prerequisites

- Node.js 18+ installed ([nodejs.org](https://nodejs.org))
- A GitHub account ([github.com](https://github.com))
- A Vercel account ([vercel.com](https://vercel.com)) — free

### Step 2 — Install dependencies

```bash
cd scholarprep
npm install
```

### Step 3 — Set up Supabase (for login/accounts)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (name it "scholarprep")
3. Go to **Settings → API**
4. Copy your **Project URL** and **anon public** key

### Step 4 — Set up Stripe (for PDF payments)

1. Go to [stripe.com](https://stripe.com) and create an account
2. Go to **Developers → API Keys**
3. Copy your **Publishable key** (starts with `pk_`)

### Step 5 — Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:
```
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Step 6 — Run locally

```bash
npm start
```

Opens at http://localhost:3000

> **Demo mode:** If you haven't connected Supabase yet, the app runs in demo mode — you can explore everything without logging in.

---

## Deploy to Vercel (make it live on the web)

### Option A — Via GitHub (recommended)

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial ScholarPrep build"
   git remote add origin https://github.com/YOUR_USERNAME/scholarprep.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Add environment variables (from your `.env.local`)
5. Click **Deploy** — your app will be live in ~2 minutes!

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Custom domain

In Vercel dashboard → your project → **Settings → Domains**
Add `scholarprep.com.au` (or your chosen domain)

---

## Supabase database setup

Run this SQL in your Supabase **SQL Editor** to enable progress storage:

```sql
-- User profiles
create table profiles (
  id uuid references auth.users primary key,
  name text,
  trial_start timestamptz default now(),
  subscribed boolean default false,
  stripe_customer_id text,
  created_at timestamptz default now()
);

-- Test sessions
create table test_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  subject text,
  year_level int,
  correct int,
  total int,
  score int,
  created_at timestamptz default now()
);

-- Writing submissions
create table writing_submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  type text,
  year_level int,
  total_score int,
  max_score int,
  feedback jsonb,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table test_sessions enable row level security;
alter table writing_submissions enable row level security;

-- Policies (users can only see their own data)
create policy "Users see own profile" on profiles for all using (auth.uid() = id);
create policy "Users see own sessions" on test_sessions for all using (auth.uid() = user_id);
create policy "Users see own writing" on writing_submissions for all using (auth.uid() = user_id);
```

---

## Pricing model

| Plan | Price | Access |
|------|-------|--------|
| Free trial | $0 | 7 days full access |
| Monthly subscription | $9.99/month | Unlimited everything |
| PDF generator | $0.50/question | Pay per test, no account needed |

---

## Business next steps

1. ✅ **Deploy** to Vercel and get a live URL
2. 🔲 **Connect Stripe** — add webhook for subscription management
3. 🔲 **Custom domain** — register scholarprep.com.au (~$15/yr at CrazyDomains)
4. 🔲 **Add General Ability** — non-verbal/pattern questions require image generation (future feature)
5. 🔲 **Email notifications** — Supabase + SendGrid for welcome emails and reminders
6. 🔲 **Analytics** — add Plausible or Posthog for user behaviour tracking
7. 🔲 **Upload question bank** — add more example questions from your photos to improve AI prompts

---

## Folder structure

```
scholarprep/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── AppLayout.jsx      # Sidebar + app shell
│   ├── hooks/
│   │   └── useAuth.js         # Auth context
│   ├── lib/
│   │   ├── ai.js              # Claude API (question gen + writing assessment)
│   │   ├── supabase.js        # Auth + database
│   │   └── progress.js        # Local progress storage
│   ├── pages/
│   │   ├── Landing.jsx        # Marketing landing page
│   │   ├── Auth.jsx           # Login + Signup
│   │   ├── Home.jsx           # App dashboard
│   │   ├── TestPage.jsx       # Practice test engine (Maths/Reading/General)
│   │   ├── WritingPage.jsx    # Writing + AI assessment
│   │   ├── ProgressPage.jsx   # Progress dashboard
│   │   └── PDFGeneratorPage.jsx # PDF generator + Stripe
│   ├── styles/
│   │   └── global.css
│   ├── App.js                 # Routing
│   └── index.js               # Entry point
├── .env.example               # Environment variable template
├── package.json
└── README.md
```

---

Built with ❤️ for Australian families preparing for scholarship exams.
