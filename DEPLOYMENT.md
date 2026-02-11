# 🚀 COMPLETE DEPLOYMENT GUIDE

**Deploy Storm Chaser & Insider Alerts in 1 Hour**

---

## ✅ WHAT YOU'VE BUILT

### Storm Chaser (Complete):
- ✅ Landing page with pricing
- ✅ Full dashboard with real-time updates
- ✅ Authentication (Supabase)
- ✅ Payment integration (Stripe)
- ✅ Storm map visualization
- ✅ Lead claiming system

### Backend Systems (Complete):
- ✅ Storm monitoring (NOAA API)
- ✅ Insider trading monitoring (SEC API)
- ✅ Database schemas
- ✅ GitHub Actions workflows

---

## 🎯 DEPLOYMENT STEPS (60 Minutes)

### STEP 1: Set Up Supabase (10 minutes)

**1.1 Create Account**
```
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (free)
4. Create new organization (free)
```

**1.2 Create Project**
```
1. Click "New Project"
2. Name: "storm-chaser" or "AlphaClaw"
3. Database Password: Generate strong password (save it!)
4. Region: Choose closest to your users
5. Plan: Free tier (enough to start)
6. Click "Create new project"
```

**1.3 Run Database Schema**
```
1. Wait for project to finish setting up (~2 minutes)
2. Go to SQL Editor (left sidebar)
3. Click "New query"
4. Copy/paste contents of:
   - storm_chaser/database/schema.sql
   - insider_alerts/database/schema.sql
5. Click "Run"
6. Verify tables created (check "Table Editor" tab)
```

**1.4 Get API Keys**
```
1. Go to Settings → API
2. Copy these values:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY)
3. Save them - you'll need these in Step 3
```

---

### STEP 2: Set Up Stripe (15 minutes)

**2.1 Create Account**
```
1. Go to https://stripe.com
2. Click "Start now"
3. Create account (free)
4. Complete business information
5. Activate account
```

**2.2 Create Products & Prices**

Go to Products → Add product

**Product 1: Storm Chaser - Basic**
- Name: Storm Chaser Basic
- Description: Real-time storm alerts, up to 50 leads/month
- Pricing: $497/month recurring
- After creation, copy the Price ID (starts with price_...)
- Save as `price_basic_monthly`

**Product 2: Storm Chaser - Pro**
- Name: Storm Chaser Pro
- Description: Unlimited leads, priority access, CRM integration
- Pricing: $1,495/month recurring
- Copy Price ID → Save as `price_pro_monthly`

**Product 3: Storm Chaser - Enterprise**
- Name: Storm Chaser Enterprise
- Description: First access, white-label, dedicated support
- Pricing: $4,995/month recurring
- Copy Price ID → Save as `price_enterprise_monthly`

**Repeat for Insider Alerts:**
- Insider Alerts Basic: $197/month
- Insider Alerts Pro: $297/month
- Insider Alerts Professional: $497/month

**2.3 Get API Keys**
```
1. Go to Developers → API keys
2. Copy these values:
   - Publishable key (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
   - Secret key (STRIPE_SECRET_KEY)
3. Save them - you'll need these in Step 3
```

**2.4 Set Up Webhook (will do after deployment in Step 5)**

---

### STEP 3: Configure Environment Variables (5 minutes)

**3.1 Create .env.local in frontend directory**

```bash
cd ~/.openclaw/workspace/storm_chaser/frontend
cp .env.example .env.local
```

**3.2 Edit .env.local with your actual values:**

```bash
# Supabase (from Step 1.4)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (from Step 2.3)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=(will add after Step 5)

# Mapbox (free tier)
# Sign up at https://mapbox.com
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**3.3 Update Stripe Price IDs**

Edit `frontend/app/signup/page.tsx` and replace price IDs:
```typescript
const PLANS = {
  basic: {
    priceId: 'price_xxxxx', // Your actual Stripe price ID from Step 2.2
  },
  pro: {
    priceId: 'price_xxxxx', // Your actual price ID
  },
  enterprise: {
    priceId: 'price_xxxxx', // Your actual price ID
  }
}
```

---

### STEP 4: Test Locally (10 minutes)

**4.1 Install Dependencies**
```bash
cd ~/.openclaw/workspace/storm_chaser/frontend
npm install
```

**4.2 Run Development Server**
```bash
npm run dev
```

**4.3 Test the App**
```
1. Open http://localhost:3000
2. Click "Start Free Trial"
3. Fill out signup form
4. You should be redirected to Stripe Checkout
5. Use test card: 4242 4242 4242 4242
6. Complete payment
7. Should redirect to dashboard
8. Verify real-time updates work
```

**If everything works, proceed to deployment!**

---

### STEP 5: Deploy to Vercel (10 minutes)

**5.1 Install Vercel CLI**
```bash
npm i -g vercel
```

**5.2 Deploy**
```bash
cd ~/.openclaw/workspace/storm_chaser/frontend
vercel
```

Follow prompts:
- Set up and deploy? Yes
- Which scope? Your account
- Link to existing project? No
- Project name? storm-chaser
- Directory? ./
- Override settings? No

**5.3 Set Environment Variables**

In Vercel dashboard:
```
1. Go to your project
2. Settings → Environment Variables
3. Add all variables from .env.local:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - STRIPE_SECRET_KEY
   - NEXT_PUBLIC_MAPBOX_TOKEN
   - NEXT_PUBLIC_APP_URL (use your Vercel URL)
4. Click "Save"
```

**5.4 Redeploy**
```bash
vercel --prod
```

**Your app is now live!** 🎉

Copy your production URL (e.g., `https://storm-chaser.vercel.app`)

---

### STEP 6: Configure Stripe Webhook (5 minutes)

**6.1 Create Webhook Endpoint**
```
1. Go to Stripe Dashboard
2. Developers → Webhooks
3. Click "Add endpoint"
4. Endpoint URL: https://your-app.vercel.app/api/webhooks/stripe
5. Description: "Storm Chaser Subscription Webhooks"
6. Events to send: Select these:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
7. Click "Add endpoint"
```

**6.2 Get Webhook Secret**
```
1. Click on your new webhook
2. Click "Reveal" under "Signing secret"
3. Copy the value (starts with whsec_...)
```

**6.3 Add to Vercel**
```
1. Go to Vercel project settings
2. Environment Variables
3. Add: STRIPE_WEBHOOK_SECRET = whsec_...
4. Save
5. Redeploy: vercel --prod
```

---

### STEP 7: Deploy Backend Monitoring (10 minutes)

**7.1 Update GitHub Actions Secrets**

In your GitHub repository:
```
1. Settings → Secrets and variables → Actions
2. Add secrets:
   - SUPABASE_URL (from Step 1.4)
   - SUPABASE_KEY (service role key)
3. Click "New repository secret" for each
```

**7.2 Push to GitHub**
```bash
cd ~/.openclaw/workspace/storm_chaser
git init
git add .
git commit -m "Storm Chaser - Complete application"
git remote add origin https://github.com/YOUR_USERNAME/storm-chaser.git
git push -u origin main
```

**7.3 Verify Actions Running**
```
1. Go to your GitHub repo
2. Actions tab
3. Should see "Storm Monitoring" workflow
4. Running every 5 minutes automatically
5. Check runs to verify no errors
```

---

### STEP 8: Final Testing (5 minutes)

**8.1 End-to-End Test**
```
1. Visit your production URL
2. Click "Start Free Trial"
3. Create account
4. Complete Stripe checkout (use test mode)
5. Verify redirect to dashboard
6. Verify dashboard loads
7. Check Supabase - verify user created
8. Check Stripe - verify subscription created
```

**8.2 Test Real-Time Updates**
```
1. Open dashboard in two browser windows
2. In Supabase SQL Editor, insert test storm:

INSERT INTO storms (
  event_id,
  event_type,
  severity,
  headline,
  city,
  state,
  latitude,
  longitude,
  estimated_homes,
  start_time,
  status
) VALUES (
  'test-001',
  'tornado',
  9,
  'Test Tornado Warning',
  'Durham',
  'NC',
  35.9940,
  -78.8986,
  10000,
  NOW(),
  'active'
);

3. Dashboard should update in real-time
4. Notification should appear
```

**If all tests pass → YOU'RE LIVE!** 🚀

---

## 🎉 YOU'RE DEPLOYED!

### What's Live:
- ✅ Storm Chaser web app
- ✅ Real-time dashboard
- ✅ Authentication working
- ✅ Stripe payments integrated
- ✅ Backend monitoring (GitHub Actions)
- ✅ Database updating every 5 minutes

### Your URLs:
- **App**: https://your-app.vercel.app
- **Dashboard**: https://your-app.vercel.app/dashboard
- **Supabase**: https://app.supabase.com/project/your-project
- **Stripe**: https://dashboard.stripe.com

---

## 📊 NEXT STEPS

### Go Live:
1. **Switch Stripe to Live Mode**
   - Stripe Dashboard → Toggle "Test mode" to Live
   - Update Vercel env vars with live keys
   - Redeploy

2. **Get Custom Domain**
   ```
   - Buy domain (Namecheap, GoDaddy)
   - In Vercel: Settings → Domains
   - Add your domain
   - Update DNS records
   ```

3. **Enable Google Auth (Optional)**
   ```
   - Supabase Dashboard → Authentication → Providers
   - Enable Google
   - Add OAuth credentials
   ```

### Start Selling:
1. **Post on LinkedIn**
   - "Just launched Storm Chaser - AI storm intelligence for contractors"
   - Include screenshot + link
   - Offer first 10 customers 50% off

2. **Reddit Launch**
   - r/Entrepreneur
   - r/roofing
   - r/HomeImprovement

3. **Direct Outreach**
   - Find roofing contractors on LinkedIn
   - Send 50 DMs/day
   - "Found this would be useful for your business..."

---

## 🔧 DEPLOY INSIDER ALERTS

Repeat Steps 3-6 for Insider Alerts:
```bash
cd ~/.openclaw/workspace/insider_alerts/frontend
# Follow same steps
# Deploy to insider-alerts.vercel.app
```

---

## 💰 EXPECTED TIMELINE

**Week 1:**
- Day 1: Deploy (done ✅)
- Day 2-3: Marketing (LinkedIn, Reddit)
- Day 4-7: First 5 customers

**Week 2:**
- 10 customers total
- ~$15,000/month revenue
- Refine based on feedback

**Month 1:**
- 30 customers
- ~$50,000/month revenue
- Start hiring support

---

## 🆘 TROUBLESHOOTING

### "Supabase connection failed"
- Check environment variables in Vercel
- Verify URL and keys are correct
- Check Supabase project is active

### "Stripe webhook not working"
- Verify webhook URL is correct
- Check webhook secret in Vercel
- Look at Stripe webhook logs

### "Real-time updates not working"
- Check Supabase Realtime is enabled
- Verify Row Level Security policies
- Check browser console for errors

### "GitHub Actions failing"
- Check secrets are set correctly
- Verify NOAA API is accessible
- Check Action logs for specific errors

---

## 📞 SUPPORT

**Need help?**
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs
- Vercel: https://vercel.com/docs
- Next.js: https://nextjs.org/docs

---

**YOU NOW HAVE TWO COMPLETE SAAS APPLICATIONS DEPLOYED AND READY TO SELL** 🎉

**Total Time:** 60 minutes
**Total Cost:** $0/month (until you get customers)
**Revenue Potential:** $50k+/month

**Start selling NOW!** 💰
