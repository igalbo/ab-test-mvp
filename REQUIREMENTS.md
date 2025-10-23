# A/B Testing Platform - Requirements Document

## Project Overview

Build a minimal but functional A/B testing platform MVP using T3 Stack (Next.js App Router + TypeScript + tRPC + TailwindCSS).

## Tech Stack

- **Framework**: T3 App (Next.js App Router)
- **Language**: TypeScript
- **API**: tRPC
- **Styling**: TailwindCSS + shadcn/ui (dark theme)
- **Database**: Drizzle or Prisma with SQLite (recommended)
- **Optional**: Go service for assignment logic

## Core Features

### 1. Experiments Management

**Fields:**

- `name` - snake_case, lowercase only, unique
- `status` - draft | active | paused | completed
- `strategy` - string (e.g., "uniform" - don't implement others)
- `startAt` - nullable datetime
- `endAt` - nullable datetime

**Operations:** CRUD (Create, Read, Update, Delete)

### 2. Variants Management

**Fields:**

- `key` - variant identifier (e.g., "A", "B")
- `weight` - integer 0-100

**Rules:**

- Each experiment must have >= 2 variants
- Simplification allowed: store variants inline in experiment object

### 3. Assignment Logic

**Purpose:** Get or assign users to variants for experiments

**Two Options:**

- **Option A (Sticky)**: Same (userId, experimentId) always returns same variant
  - Store assignments with unique constraint (userId, experimentId)
  - Use stable hash: `hash(userId + ":" + experiment.name) % variants.length`
- **Option B (Simplified)**: Use Math.random() to pick variant
  - Optional persistence in localStorage or database

### 4. GUI Requirements

**Three Main Tabs:**

1. **Experiments Tab**
   - Table showing: name, status, schedule, variant count
   - Search/filter by name
   - Create/edit functionality (modal or inline)
   - Status colors: Green (active), Yellow (scheduled), Red (paused/completed)

2. **Variants Tab** (per experiment)
   - List variants for selected experiment
   - Add/edit/delete variants
   - Control weight via number input (slider optional)

3. **Assignments Tab**
   - Input: userId, experimentId
   - Output: assigned variant
   - Create sticky assignment if none exists (if using sticky option)

## Data Model

### Minimal (Flat Structure)

```
Experiment {
  id, name, status, strategy, startAt, endAt
  variants: [{ key, weight }] // inline JSON
}
User { id, name }
```

### Full Structure (Optional)

```
Experiment { id, name, status, strategy, startAt, endAt }
Variant { id, experimentId, key, weight }
Assignment { id, experimentId, userId, variantKey }
  - UNIQUE constraint on (experimentId, userId)
```

## tRPC API Procedures

### Experiments

- `experiments.list()` → Experiment[]
- `experiments.create(input)` → Experiment
- `experiments.update(input)` → Experiment
- `experiments.delete({ id })` → void

### Variants

- `variants.list({ experimentId })` → Variant[]
- `variants.upsertMany({ experimentId, variants })` → Variant[]

### Assignments

- `assignments.get({ userId, experimentId })` → { variantKey }
- `assignments.assign({ userId, experimentId })` → { variantKey }

**Validation:** Use Zod for input validation, enforce snake_case lowercase for experiment names

## UI Components (shadcn/ui)

- Button, Input, Table, Dialog, Badge, Tabs
- Slider or NumberField (for weights)
- Dark theme by default

## Non-Requirements (Out of Scope)

- ❌ Authentication/Authorization (NextAuth)
- ❌ Server-side analytics or charts
- ❌ Multiple assignment strategies implementation
- ❌ Fancy scheduling engine
- ❌ REST/GraphQL (use tRPC only)

## Optional Bonuses

- Go microservice for assignment logic
- Deploy to Vercel
- NextAuth roles (viewer/editor/admin)
- Unit tests for assignment logic
- Basic analytics widget (variant counts)

## Deliverables

1. **Environment Setup** (~30 min)
   - Scaffold with `create-t3-app`
   - Disable posts example
   - Verify dev server runs

2. **High-Level Design** (~1 hour)
   - Architecture diagram
   - Data model
   - tRPC procedures list
   - Assignment logic explanation

3. **Working MVP** (~2h 30m)
   - Create/list experiments
   - Manage variants
   - Get/assign users to variants

4. **README** (~30 min)
   - Installation steps
   - Run instructions
   - Storage choice explanation
   - Assumptions and next steps

## Evaluation Criteria

- ✅ Correctness of assignment logic (deterministic if sticky)
- ✅ Code clarity (structure, typing, validation)
- ✅ Simplicity (small, readable, end-to-end)
- ✅ Clean UI (dark theme, sensible forms)
- ✅ Clear documentation (README, HLD)

## Key Constraints

- Keep scope minimal - working slice is better than incomplete features
- Focus on clarity over complexity
- Use AI tools as needed to speed up development
- Empty stubs are acceptable if clearly labeled
