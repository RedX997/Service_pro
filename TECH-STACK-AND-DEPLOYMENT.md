# ServicePro Management - Tech Stack & Deployment Guide

## 📚 Complete Tech Stack

### Frontend (Client)
```
Framework & Libraries:
├── React 18.3.1 - UI library
├── TypeScript 5.8.3 - Type safety
├── Vite 5.4.19 - Build tool & dev server
├── React Router DOM 6.30.1 - Client-side routing
└── React Hook Form 7.61.1 - Form management

UI Components & Styling:
├── Tailwind CSS 3.4.17 - Utility-first CSS
├── Radix UI - Accessible component primitives
│   ├── Dialog, Dropdown, Select, Toast, etc.
│   └── 30+ accessible components
├── Lucide React 0.462.0 - Icon library
├── Shadcn/ui - Component system (built on Radix)
└── Tailwind Animate - Animation utilities

State Management & Data Fetching:
├── TanStack Query 5.83.0 - Server state management
├── Axios 1.13.5 - HTTP client
└── React Context - Global state (Auth)

Charts & Visualization:
└── Recharts 2.15.4 - Chart library

Form Validation:
├── Zod 3.25.76 - Schema validation
└── Hookform Resolvers 3.10.0 - Form validation integration

Date Handling:
├── date-fns 3.6.0 - Date utilities
└── React Day Picker 8.10.1 - Date picker

Additional:
├── Embla Carousel 8.6.0 - Carousel component
├── Next Themes 0.3.0 - Theme management
└── Sonner 1.7.4 - Toast notifications
```

### Backend (Server)
```
Runtime & Framework:
├── Node.js - JavaScript runtime
├── Express 5.2.1 - Web framework
├── TypeScript 5.9.3 - Type safety
└── TSX 4.21.0 - TypeScript execution

Database & ORM:
├── PostgreSQL - Relational database
├── Prisma 6.19.2 - ORM & query builder
└── @prisma/client 6.19.2 - Database client

Middleware & Utilities:
├── CORS 2.8.6 - Cross-origin resource sharing
├── dotenv 17.3.1 - Environment variables
└── Zod 4.3.6 - Schema validation

Development:
├── tsx watch - Hot reload
└── nodemon 3.1.11 - Process manager
```

### Development Tools
```
Code Quality:
├── ESLint 9.32.0 - Linting
├── TypeScript ESLint 8.38.0 - TS linting
└── Prettier (via ESLint) - Code formatting

Testing:
├── Vitest 3.2.4 - Unit testing
├── Testing Library React 16.0.0 - Component testing
├── Testing Library Jest DOM 6.6.0 - DOM matchers
└── jsdom 20.0.3 - DOM implementation

Build Tools:
├── Vite Plugin React SWC 3.11.0 - Fast refresh
├── PostCSS 8.5.6 - CSS processing
└── Autoprefixer 10.4.21 - CSS vendor prefixes
```

### Storage
```
Database:
└── PostgreSQL (local or cloud)

Browser Storage:
├── localStorage - Settings, Appointments, Tasks
└── sessionStorage - Temporary data

File Storage:
└── Public folder - Static assets
```

---

## 🚀 Deployment Options (Easiest to Advanced)

### ⭐ OPTION 1: Vercel (RECOMMENDED - Easiest)

**Best For**: Quick deployment, automatic CI/CD, free tier

**What You Get**:
- ✅ Free hosting for frontend
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments from Git
- ✅ Preview deployments for PRs
- ✅ Serverless functions for backend
- ✅ Environment variables management

**Database**: Use Vercel Postgres or Supabase

**Steps**:
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Sign up with GitHub
4. Click "Import Project"
5. Select your repository
6. Configure:
   - Framework: Vite
   - Root Directory: `Service pro/management practice`
   - Build Command: `npm run build`
   - Output Directory: `dist`
7. Add environment variables:
   - `VITE_API_URL`: Your backend URL
   - `VITE_USE_API`: `true`
8. Deploy!

**Backend Deployment**:
- Option A: Deploy as Vercel Serverless Functions
- Option B: Deploy backend separately on Render/Railway

**Cost**: Free tier available (generous limits)

---

### ⭐ OPTION 2: Netlify + Render

**Best For**: Separate frontend/backend deployment

**Frontend on Netlify**:
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import from Git"
4. Select repository
5. Configure:
   - Base directory: `Service pro/management practice`
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables
7. Deploy!

**Backend on Render**:
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Select repository
5. Configure:
   - Root Directory: `Service pro/management practice/server`
   - Build Command: `npm install && npm run prisma:generate && npm run build`
   - Start Command: `npm start`
6. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `PORT`: 3000
7. Deploy!

**Database**: Use Render PostgreSQL or Supabase

**Cost**: 
- Netlify: Free tier available
- Render: Free tier (with limitations)

---

### ⭐ OPTION 3: Railway (All-in-One)

**Best For**: Full-stack deployment with database included

**What You Get**:
- ✅ Frontend hosting
- ✅ Backend hosting
- ✅ PostgreSQL database included
- ✅ Automatic HTTPS
- ✅ Environment variables
- ✅ Easy scaling

**Steps**:
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select repository
5. Railway auto-detects both frontend and backend
6. Configure services:
   
   **Frontend Service**:
   - Root: `Service pro/management practice`
   - Build: `npm run build`
   - Start: `npm run preview`
   
   **Backend Service**:
   - Root: `Service pro/management practice/server`
   - Build: `npm install && npx prisma generate`
   - Start: `npm start`
   
   **Database Service**:
   - Add PostgreSQL from Railway marketplace
   - Automatically connects to backend

7. Deploy!

**Cost**: $5/month (includes everything)

---

### ⭐ OPTION 4: Heroku (Traditional)

**Best For**: Established platform, easy scaling

**Steps**:
1. Install Heroku CLI
2. Create two apps:
   ```bash
   heroku create servicepro-frontend
   heroku create servicepro-backend
   ```
3. Add PostgreSQL:
   ```bash
   heroku addons:create heroku-postgresql:mini -a servicepro-backend
   ```
4. Deploy backend:
   ```bash
   cd "Service pro/management practice/server"
   git init
   heroku git:remote -a servicepro-backend
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```
5. Deploy frontend similarly

**Cost**: $7/month per dyno (no free tier anymore)

---

### ⭐ OPTION 5: DigitalOcean App Platform

**Best For**: More control, good performance

**Steps**:
1. Go to [digitalocean.com](https://digitalocean.com)
2. Create account
3. Go to "App Platform"
4. Click "Create App"
5. Connect GitHub repository
6. Configure components:
   - Frontend (Static Site)
   - Backend (Web Service)
   - Database (PostgreSQL)
7. Deploy!

**Cost**: $5-12/month depending on resources

---

### ⭐ OPTION 6: AWS (Advanced)

**Best For**: Enterprise, full control, scalability

**Services Needed**:
- Frontend: S3 + CloudFront
- Backend: EC2 or Elastic Beanstalk
- Database: RDS PostgreSQL
- Load Balancer: ALB

**Cost**: Pay-as-you-go (can be expensive)

---

## 🎯 Recommended Deployment Strategy

### For Development/Testing:
```
Frontend: Vercel (free)
Backend: Render (free tier)
Database: Supabase (free tier)
Total Cost: $0/month
```

### For Production (Small Business):
```
Frontend: Vercel (Pro)
Backend: Railway
Database: Railway PostgreSQL
Total Cost: ~$20/month
```

### For Production (Growing Business):
```
Frontend: Vercel (Pro)
Backend: Railway or DigitalOcean
Database: Managed PostgreSQL (Railway/DO)
Total Cost: ~$50/month
```

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Create `.env` files for both frontend and backend:

**Frontend** (`.env`):
```env
VITE_API_URL=https://your-backend-url.com
VITE_USE_API=true
```

**Backend** (`.env`):
```env
DATABASE_URL=postgresql://user:password@host:5432/database
PORT=3000
NODE_ENV=production
```

### 2. Database Setup
```bash
# Run migrations
cd "Service pro/management practice/server"
npx prisma migrate deploy

# Seed initial data
npx prisma db seed
```

### 3. Build Test
```bash
# Test frontend build
cd "Service pro/management practice"
npm run build

# Test backend build
cd server
npm run build
```

### 4. Update CORS Settings
In `server/src/index.ts`, update allowed origins:
```typescript
app.use(cors({
  origin: ['https://your-frontend-url.com'],
  credentials: true
}));
```

### 5. Security
- [ ] Add rate limiting
- [ ] Enable HTTPS only
- [ ] Set secure headers
- [ ] Validate all inputs
- [ ] Use environment variables for secrets

---

## 🔧 Deployment Commands

### Frontend Build
```bash
cd "Service pro/management practice"
npm install
npm run build
# Output: dist/ folder
```

### Backend Build
```bash
cd "Service pro/management practice/server"
npm install
npx prisma generate
npm run build
# Output: dist/ folder
```

### Start Production
```bash
# Frontend (using preview)
npm run preview

# Backend
npm start
```

---

## 🌐 Custom Domain Setup

### Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records (provided by Vercel)

### Netlify:
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Update DNS records

### Railway:
1. Go to Service Settings → Networking
2. Add custom domain
3. Update DNS CNAME record

---

## 📊 Monitoring & Analytics

### Recommended Tools:
- **Vercel Analytics** - Built-in (free)
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Google Analytics** - User analytics
- **Uptime Robot** - Uptime monitoring

---

## 💰 Cost Comparison

| Platform | Frontend | Backend | Database | Total/Month |
|----------|----------|---------|----------|-------------|
| Vercel + Supabase | Free | Free | Free | $0 |
| Netlify + Render | Free | Free | Free | $0 |
| Railway | $5 | $5 | $5 | $15 |
| Heroku | $7 | $7 | $9 | $23 |
| DigitalOcean | $5 | $12 | $15 | $32 |
| AWS | $5 | $20 | $30 | $55+ |

---

## 🚀 Quick Start: Deploy in 10 Minutes

### Using Vercel + Supabase (Easiest):

1. **Setup Supabase** (2 min):
   - Go to supabase.com
   - Create project
   - Copy connection string

2. **Deploy Backend to Render** (3 min):
   - Go to render.com
   - New Web Service
   - Connect GitHub
   - Add DATABASE_URL
   - Deploy

3. **Deploy Frontend to Vercel** (3 min):
   - Go to vercel.com
   - Import project
   - Add VITE_API_URL
   - Deploy

4. **Run Migrations** (2 min):
   - In Render dashboard, open Shell
   - Run: `npx prisma migrate deploy`
   - Run: `npx prisma db seed`

**Done!** Your app is live! 🎉

---

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

**Recommendation**: Start with **Vercel (frontend) + Render (backend) + Supabase (database)** for the easiest, free deployment!
