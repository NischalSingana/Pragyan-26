# 🏥 Smart Triage System - Hospital Command Center

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Neon_Postgresql-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

An advanced, end-to-end intelligent triage platform designed to streamline hospital operations, automate patient assessment, and optimize resource allocation through AI-driven insights and a centralized Command Center.

## ✨ Features

- **🩺 Patient Triage & Risk Stratification**: Automatically evaluate patient risks with calculated scores based on patient symptoms, vitals, and pre-existing conditions.
- **📄 AI Document Processing**: Robust document engine to upload and analyze patient files using Google Cloud Vision and AWS S3 storage.
- **📊 Real-Time Department Tracking**: Dynamic metrics on department load, current patients wait/treatment times, and simulated bed occupancy metrics.
- **🚦 Intelligent Doctor Matching**: Automatically matches assigning patients to available doctors tailored by role and department.
- **🔐 Multi-Role Authorization (RBAC)**: Secure access tailored explicitly for:
  - `COMMAND_CENTER`: Complete macro-oversight functionality.
  - `ADMIN`: Platform administration.
  - `TRIAGE_NURSE`: Frontline intake operations.
  - `DOCTOR`: Dedicated patient and clinical view.
- **🎨 Modern UI Framework**: Interactive patient visualizations powered by Shadcn, Tailwind CSS, Recharts, and React Three Fiber/Drei.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (React 19), Tailwind CSS v4, Framer/TW Animate, Shadcn UI, Radix UI.
- **Data Visualization & 3D**: Recharts, Three.js, React Three Fiber, React Three Drei.
- **Backend Architecture**: Next.js App Router (Server Actions & APIs).
- **Database Layer**: Neon PostgreSQL managed via Prisma ORM 6.
- **AI & Cloud Services**: Google Cloud Vision API, AWS SDK (S3), PDF-Parse.
- **Security & Validation**: Zod, Bcrypt.js, JOSE (JWT).

---

## 📦 Getting Started

### Prerequisites

- Node.js `^20`
- A free Neon Postgres database
- AWS credentials (for S3 storage)
- Google Cloud credentials (for Vision API extraction)

### 1. Installation

Clone the repository and install dependencies from within the `my-app` directory.

```bash
git clone https://github.com/NischalSingana/Pragyan-26.git
cd Pragyan-26/my-app
npm install
```

### 2. Environment Setup

Create a `.env` file in the `my-app` directory and populate it with the requisite keys:

```ini
# PostgreSQL (Neon Database)
DATABASE_URL="postgres://user:password@endpoint/dbname?sslmode=require"
DIRECT_URL="postgres://user:password@endpoint/dbname?sslmode=require"

# AWS Storage Settings
AWS_REGION="your_aws_region"
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret"
AWS_S3_BUCKET="your_bucket_name"

# Google Cloud Services (Alternatively via JSON Path)
GOOGLE_APPLICATION_CREDENTIALS="google_credentials.json"
```

_Ensure your `google_credentials.json` sits correctly within your designated directory setup based on above env variables!_

### 3. Database Initialization

Run the Prisma migrations, push the schema directly to your neon instance, and automatically seed initial system/mock data.

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Running the Development Server

Spin up your environment to test out the application:

```bash
npm run dev
```

The application should now be securely bound to [http://localhost:3000](http://localhost:3000).

### 5. Running the Artificial Data Simulator (Optional)

We provide a built-in script specifically designed to artificially seed synthetic patient data and emulate continuous real-time system influx.

```bash
npm run synthetic
```

---

## 🏛 Structure Overview

- `/my-app/app` - Contains all Next.js 15 routing (API routes, nested pages, UI layouts).
- `/my-app/components` - Shared interface elements built fundamentally using React and Shadcn.
- `/my-app/prisma` - Schema architecture representing Postgres mapping, and foundational seeding logic.
- `/my-app/scripts` - Automated operational tooling including AI and synthetic data bots (`generate-synthetic-patients.ts`).
- `/my-app/data` - Local static definitions mapping roles, mocked references, etc.
- `/my-app/lib` - Domain utilities, DB clients, and generalized auth/helper functions.

---

## 📄 License & Legal

This software implementation requires a valid [LICENSE](./LICENSE) as bundled within this repository.
