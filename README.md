# A/B Testing Platform MVP

A minimal but functional A/B testing platform built with the T3 Stack, featuring experiment management, variant configuration, and deterministic user assignment.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **API**: tRPC
- **Database**: Prisma with PostgreSQL (Vercel Postgres for production)
- **Styling**: TailwindCSS + shadcn/ui (dark theme)
- **Deployment**: Vercel

## Features

✅ **Experiment Management**: Create, read, update, and delete experiments with status tracking (draft, active, paused, completed)

✅ **Variant Configuration**: Define multiple variants per experiment with adjustable weights (0-100)

✅ **Sticky Assignment**: Deterministic hash-based algorithm ensures the same user always gets the same variant for a given experiment

✅ **Clean UI**: Dark-themed interface with three main tabs (Experiments, Variants, Assignments)

## Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database (or use Vercel Postgres)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/igalbo/ab-test-mvp.git
cd ab-test-mvp
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and add your database connection strings:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Data Model

### Experiment

- `name` (unique, snake_case, lowercase only)
- `status` (draft | active | paused | completed)
- `strategy` (string, e.g., "uniform")
- `startAt`, `endAt` (nullable datetime)

### Variant

- `key` (e.g., "A", "B", "control")
- `weight` (integer 0-100)
- Linked to experiment via `experimentId`

### Assignment

- Stores `userId`, `experimentId`, `variantKey`
- Unique constraint on `(experimentId, userId)` ensures sticky assignment

### User

- Simple `id` and `name` fields for demo purposes

## Assignment Logic

The platform uses **Option A (Sticky Hash)** from the assignment spec:

1. Compute `hash = stableHash(userId + ":" + experiment.name)`
2. Map hash to variant using modulo: `hash % numVariants`
3. Store assignment in database with unique constraint
4. Subsequent requests for the same `(userId, experimentId)` pair return the stored variant

This ensures deterministic, repeatable assignments across sessions.

## API (tRPC)

### Experiments

- `experiments.list()` - Get all experiments with variant counts
- `experiments.create(input)` - Create new experiment
- `experiments.update(input)` - Update existing experiment
- `experiments.delete({ id })` - Delete experiment

### Variants

- `variants.list({ experimentId })` - Get variants for experiment
- `variants.upsertMany({ experimentId, variants })` - Bulk update variants

### Assignments

- `assignments.get({ userId, experimentId })` - Get existing assignment
- `assignments.assign({ userId, experimentId })` - Create or get assignment

All inputs are validated using Zod schemas.

## Storage Choice

**PostgreSQL** was chosen for production deployment on Vercel:

- Relational model fits the experiment-variant-assignment structure
- Prisma provides type-safe ORM with excellent DX
- Vercel Postgres offers seamless integration

_Note: The project was initially developed with SQLite for local testing, then migrated to PostgreSQL for production._

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add Vercel Postgres database
4. Configure environment variables:
   - `DATABASE_URL` = Prisma Database URL (pooled)
   - `DIRECT_URL` = Postgres URL (direct)
5. Set build command: `prisma generate && prisma migrate deploy && next build`
6. Deploy

## Assumptions & Simplifications

- No authentication system (as per MVP requirements)
- Single assignment strategy ("uniform") - no round-robin or weighted random
- Minimal scheduling logic (dates stored but not enforced by cron jobs)
- Basic error handling focused on happy path
- Simple user model for demo (no real user management)

## Next Steps

Potential enhancements beyond MVP:

- [ ] Add NextAuth for role-based access control (viewer/editor/admin)
- [ ] Implement analytics dashboard showing variant performance
- [ ] Add scheduling engine to auto-activate/pause experiments
- [ ] Support multiple assignment strategies (weighted, round-robin)
- [ ] Add variant confidence intervals and significance testing
- [ ] Create Go microservice for high-performance assignment logic

## Project Structure

```
ab-test-mvp/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with dark theme
│   │   ├── page.tsx           # Home page with tabs
│   │   └── _components/       # UI components
│   │       ├── experiments-view.tsx
│   │       ├── variants-view.tsx
│   │       └── assignments-view.tsx
│   ├── server/
│   │   ├── db.ts              # Prisma client
│   │   └── api/
│   │       ├── root.ts        # tRPC router
│   │       ├── trpc.ts        # tRPC config
│   │       └── routers/       # API routers
│   │           ├── experiments.ts
│   │           ├── variants.ts
│   │           └── assignments.ts
│   └── trpc/                  # tRPC client setup
└── README.md
```
