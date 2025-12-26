<div align="center">
  <img src="./public/logo.png" alt="ScrapeBun Logo" width="120" height="120">
  
  # 🐰 ScrapeBun
  
  ### Advanced Web Scraping Workflow Automation Platform
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)
  [![License](https://img.shields.io/badge/License-Educational-yellow)](#-important-disclaimer)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Local Installation](#-local-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Contributors](#-contributors)
- [Important Notes](#-important-notes)
- [Disclaimer](#-important-disclaimer)
- [License](#-license)

---

## 🌟 Overview

**ScrapeBun** is a powerful, visual workflow automation platform designed for building complex web scraping pipelines. Create drag-and-drop workflows with AI-powered data extraction, automatic CAPTCHA detection, conditional logic, and scheduled execution - all through an intuitive interface.

### Why ScrapeBun?

- **Visual Workflow Builder**: Design complex scraping workflows with a node-based editor
- **AI-Powered Extraction**: Leverage OpenAI and Google's Gemini AI for intelligent data extraction
- **Smart CAPTCHA Handling**: Automatic detection and user-guided resolution
- **Scheduled Execution**: Cron-based scheduling with timezone support
- **Credit-Based System**: Integrated Stripe billing for scalable usage
- **Real-time Monitoring**: Track execution logs, status, and resource consumption

---

## ✨ Features

### Core Capabilities

- 🎨 **Visual Workflow Editor** - Drag-and-drop node-based workflow creation
- 🤖 **AI Data Extraction** - Extract structured data using natural language prompts
- 🔄 **Advanced Control Flow** - Support for loops, conditions, merge, and parallel execution
- 📸 **Snapshot-Based Scraping** - Reuse cached HTML for efficient workflows
- 🕐 **Cron Scheduling** - Schedule workflows with flexible timing options
- 🔐 **Credential Management** - Secure storage of API keys and authentication tokens
- 💳 **Stripe Integration** - Credit-based billing system with multiple pricing tiers
- 📊 **Analytics Dashboard** - Monitor workflow performance and credit usage
- 🎯 **Execution History** - Detailed logs and debugging information

### Supported Node Types

| Category | Nodes |
|----------|-------|
| **Data Collection** | Navigate URL, Page to HTML, Extract with AI |
| **Control Flow** | Condition, Loop, Wait for User Input, Merge |
| **Data Processing** | Extract Text, Read Property, Add Property, Scroll to Element |
| **Interaction** | Click Element, Fill Input, Deliver via Webhook |
| **AI Integration** | OpenAI & Gemini AI extraction |

---

## 📸 Screenshots

<details>
<summary>Click to view application screenshots</summary>

### Home Page
![Home Page](./public/website/hom_page.png)

### Workflow Dashboard
![Workflow Page](./public/website/workflow_page.png)

### Workflow Editor
![Workflow Editor](./public/website/workflow_screen.png)

### Execution Monitor
![Execution Screen](./public/website/execution_screen.png)

### Scheduling Dialog
![Schedule Workflow](./public/website/schedule.png)
![Schedule Dialog](./public/website/scheduleDialogue.png)

### Optimization Features
![Optimize Dialog](./public/website/optimize_dialogue.png)

### Credentials Management
![Credentials Page](./public/website/credentials_page.png)

### Credits & Billing
![Credits Page](./public/website/credits_page.png)

</details>

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5.6](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [React Query (TanStack)](https://tanstack.com/query/latest)
- **Workflow Editor**: [React Flow (@xyflow/react)](https://reactflow.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/) + [Tabler Icons](https://tabler-icons.io/)

### Backend
- **Runtime**: Node.js 18+
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Web Scraping**: [Puppeteer](https://pptr.dev/) + [Chromium](https://www.chromium.org/)
- **HTML Parsing**: [Cheerio](https://cheerio.js.org/)
- **AI Integration**: 
  - [OpenAI API](https://platform.openai.com/)
  - [Google Gemini AI](https://ai.google.dev/)
- **Payment Processing**: [Stripe](https://stripe.com/)
- **Scheduling**: [cron-parser](https://www.npmjs.com/package/cron-parser) + [cronstrue](https://www.npmjs.com/package/cronstrue)

### DevOps & Tooling
- **Version Control**: Git
- **Package Manager**: npm
- **Linting**: ESLint
- **Deployment**: [Vercel](https://vercel.com/) (optimized)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **PostgreSQL**: v14.0 or higher ([Download](https://www.postgresql.org/download/))
- **Git**: Latest version ([Download](https://git-scm.com/))

### Additional Requirements

- A **Clerk** account for authentication ([Sign up](https://clerk.com/))
- An **OpenAI API key** ([Get one](https://platform.openai.com/api-keys))
- A **Google Gemini API key** ([Get one](https://ai.google.dev/))
- A **Stripe** account for payments (optional, for billing features)

---

## 🚀 Local Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/10Pratik01/ScrapeBun.git
cd ScrapeBun
```

### Step 2: Install Dependencies

```bash
npm install
```

This will automatically:
- Install all Node.js dependencies
- Generate Prisma client
- Download Chromium for Puppeteer

---

## 🔐 Environment Variables

### Step 1: Create `.env` File

Create a `.env` file in the project root:

```bash
touch .env
```

### Step 2: Configure Environment Variables

Copy and paste the following into your `.env` file and replace the placeholder values:

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://username:password@localhost:5432/scrapebun?schema=public"

# ============================================
# CLERK AUTHENTICATION
# ============================================
# Get these from: https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
CLERK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Clerk redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# ============================================
# AI PROVIDERS
# ============================================
# OpenAI API Key (https://platform.openai.com/api-keys)
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Google Gemini API Key (https://ai.google.dev/)
GEMINI_API_KEY="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx"

# ============================================
# STRIPE PAYMENT (Optional)
# ============================================
# Get these from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Stripe Price IDs (create products in Stripe Dashboard)
STRIPE_SMALL_PACK_PRICE_ID="price_xxxxxxxxxxxxxxxxxxxxx"
STRIPE_MEDIUM_PACK_PRICE_ID="price_xxxxxxxxxxxxxxxxxxxxx"
STRIPE_LARGE_PACK_PRICE_ID="price_xxxxxxxxxxxxxxxxxxxxx"

# ============================================
# APPLICATION SETTINGS
# ============================================
# Your application URL (use http://localhost:3000 for local development)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_URL="http://localhost:3000"

# Encryption key for credentials (generate a random 32-character string)
ENCRYPTION_KEY="your-32-character-encryption-key-here-change-this"

# API Secret for webhook authentication (generate a random string)
API_SECRET="your-api-secret-key-for-webhooks-change-this"

# ============================================
# CHROME/PUPPETEER (Optional)
# ============================================
# Custom Chrome path (auto-detected in most cases)
# CHROME_PATH="/usr/bin/google-chrome"

# Node environment
NODE_ENV="development"
```

### Environment Variable Details

<details>
<summary><b>🔍 Click to see detailed explanations</b></summary>

#### Database
- `DATABASE_URL`: PostgreSQL connection string
  - Format: `postgresql://[user]:[password]@[host]:[port]/[database]?schema=public`
  - Example: `postgresql://postgres:mysecretpassword@localhost:5432/scrapebun?schema=public`

#### Clerk Authentication
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Public key for Clerk (safe to expose)
- `CLERK_SECRET_KEY`: Secret key for Clerk (keep private)
- Get both from your [Clerk Dashboard](https://dashboard.clerk.com/)

#### AI Providers
- `OPENAI_API_KEY`: Required for AI-powered data extraction with GPT models
- `GEMINI_API_KEY`: Required for AI-powered data extraction with Gemini models

#### Stripe (Optional)
- Only required if you want to enable the billing/credits system
- Create a Stripe account and get keys from the [Dashboard](https://dashboard.stripe.com/)
- Create three products (Small/Medium/Large credit packs) and use their Price IDs

#### Security Keys
- `ENCRYPTION_KEY`: Used to encrypt stored credentials - **MUST be 32 characters**
  - Generate: `openssl rand -hex 16`
- `API_SECRET`: Used for webhook authentication
  - Generate: `openssl rand -hex 32`

</details>

---

## 🗄 Database Setup

### Step 1: Create PostgreSQL Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE scrapebun;
\q
```

Or use a GUI tool like [pgAdmin](https://www.pgadmin.org/) or [TablePlus](https://tableplus.com/).

### Step 2: Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push
```

### Step 3: (Optional) Seed Initial Data

If you want to add initial credits to a user:

```bash
# Edit add-credits.sql with your Clerk user ID
# Then run:
psql -U postgres -d scrapebun -f add-credits.sql
```

### Step 4: View Database (Optional)

```bash
# Open Prisma Studio to view/edit data
npx prisma studio
```

This opens a web interface at `http://localhost:5555` to browse your database.

---

## ▶️ Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Verify Chrome Installation (Important!)

ScrapeBun uses Puppeteer for web scraping, which requires Chrome/Chromium:

```bash
# List installed browsers
npx puppeteer browsers list

# If Chrome is missing, install it
npx puppeteer browsers install chrome
```

For production deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 📁 Project Structure

```
scrapBun/
├── app/                          # Next.js app directory
│   ├── (auth)/                  # Authentication pages (sign-in/sign-up)
│   ├── (dashboard)/             # Dashboard pages (home, workflows, credentials, billing)
│   ├── api/                     # API routes
│   │   └── workflows/           # Workflow execution & cron endpoints
│   ├── workflow/                # Workflow editor
│   └── layout.tsx               # Root layout with Clerk provider
│
├── actions/                      # Server actions
│   ├── workflows.ts             # Workflow CRUD operations
│   ├── runWorkflow.ts           # Workflow execution
│   ├── credentials.ts           # Credential management
│   ├── billings.ts              # Stripe billing
│   └── analytics.ts             # Usage analytics
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   └── [feature-components]/   # Feature-specific components
│
├── lib/                         # Core library code
│   ├── workflow/                # Workflow engine
│   │   ├── engine/              # Execution engine (V2)
│   │   │   ├── executors/      # Node type executors
│   │   │   └── registry.ts     # Executor registry
│   │   ├── executor/            # Legacy executors (V1)
│   │   └── task/                # Task definitions
│   ├── prisma.ts                # Prisma client
│   ├── billing.ts               # Stripe integration
│   ├── credential.ts            # Encryption utilities
│   └── helper.ts                # Utility functions
│
├── prisma/                      # Database schema & migrations
│   └── schema.prisma            # Prisma schema
│
├── public/                      # Static assets
│   ├── website/                 # Screenshot images
│   └── logo.png                 # Application logo
│
├── hooks/                       # Custom React hooks
├── schema/                      # Zod validation schemas
├── .env                         # Environment variables (DO NOT COMMIT)
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind CSS config
└── next.config.mjs              # Next.js config
```

### Key Directories Explained

- **`app/`**: Next.js 14 App Router structure with route groups
- **`actions/`**: Server-side functions called from client components
- **`lib/workflow/engine/`**: Core workflow execution engine with node executors
- **`components/`**: Reusable UI components built with shadcn/ui
- **`prisma/`**: Database schema and ORM configuration

---

## 👥 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/10Pratik01">
        <img src="https://github.com/10Pratik01.png" width="100px;" alt="Pratik Patil"/><br />
        <sub><b>Pratik Patil</b></sub>
      </a><br />
      <sub>Creator & Lead Developer</sub>
    </td>
  </tr>
</table>

### Want to Contribute?

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

Please ensure:
- Code follows the existing style (TypeScript + ESLint)
- All tests pass (if applicable)
- Commits are descriptive

---

## 📝 Important Notes

### Security Considerations

> [!IMPORTANT]
> - **Never commit `.env`** - It contains sensitive API keys
> - **Change default encryption keys** - Always use unique, random keys in production
> - **Rotate API secrets regularly** - Especially for production deployments
> - **Use environment-specific keys** - Separate keys for dev/staging/production

### Performance Tips

> [!TIP]
> - **Database**: Use connection pooling for production PostgreSQL
> - **Chrome**: Increase memory limits for Vercel/serverless (3GB minimum)
> - **Caching**: Enable Redis for caching scraped pages (future enhancement)
> - **Rate Limiting**: Implement rate limiting for API routes

### Known Limitations

> [!WARNING]
> - **CAPTCHAs**: Automatic detection only; manual solving required
> - **JavaScript-Heavy Sites**: May require custom wait conditions
> - **Large Datasets**: Paginated scraping recommended for 1000+ items
> - **Serverless Timeouts**: Vercel has 300s max execution time

### Cost Management

> [!CAUTION]
> - **OpenAI API**: Can be expensive for large-scale extraction
> - **Stripe**: Test mode recommended for development
> - **Puppeteer**: Memory-intensive; monitor serverless costs
> - **Database**: Use managed PostgreSQL for auto-scaling

---

## ⚠️ IMPORTANT DISCLAIMER

> [!CAUTION]
> **This project is provided strictly for EDUCATIONAL PURPOSES ONLY.**

### Legal & Ethical Notice

- ✅ **Learn**: Use to understand web scraping, workflow automation, and AI integration
- ✅ **Experiment**: Build personal projects and proof-of-concepts
- ✅ **Study**: Analyze the codebase for educational research

- ❌ **Commercial Use**: Do NOT use for unauthorized commercial scraping
- ❌ **TOS Violations**: Always respect website Terms of Service
- ❌ **Data Theft**: Never extract data without permission
- ❌ **Rate Abuse**: Do NOT overwhelm servers with requests

### Best Practices

1. **Check robots.txt**: Always respect website crawling policies
2. **Rate Limiting**: Add delays between requests (use WAIT nodes)
3. **User-Agent**: Identify your scraper properly
4. **Permission**: Get explicit permission for commercial data collection
5. **Privacy**: Handle personal data according to GDPR/CCPA regulations

### Developer Responsibility

By using ScrapeBun, you agree:
- To use it responsibly and ethically
- To comply with all applicable laws and regulations
- That the developers are NOT liable for misuse
- To respect the intellectual property of scraped websites

**Remember**: Just because you *can* scrape something doesn't mean you *should*.

---

## 📜 License

This project is released under the **MIT License** for educational purposes.

```
MIT License

Copyright (c) 2024 Pratik Patil

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software for EDUCATIONAL PURPOSES ONLY...
```

See [LICENSE](./LICENSE) file for full details.

---

## 🔗 Useful Links

- **Documentation**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- **GitHub Repo**: [10Pratik01/ScrapeBun](https://github.com/10Pratik01/ScrapeBun)
- **Report Issues**: [GitHub Issues](https://github.com/10Pratik01/ScrapeBun/issues)
- **Discussions**: [GitHub Discussions](https://github.com/10Pratik01/ScrapeBun/discussions)

---

## 🙏 Acknowledgments

Built with amazing open-source tools:
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Clerk](https://clerk.com/) - Authentication
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Puppeteer](https://pptr.dev/) - Web scraping
- [OpenAI](https://openai.com/) & [Google](https://ai.google.dev/) - AI integration

---

<div align="center">
  
  **Made with ❤️ for the developer community**
  
  If this project helped you learn something new, please consider giving it a ⭐ on GitHub!
  
  [⬆ Back to Top](#-scrapebun)

</div>