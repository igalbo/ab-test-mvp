# A/B Testing Platform - Architecture & Flow Diagrams

## System Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js App Router)"
        UI[shadcn/ui Components]
        Pages[Pages/Routes]
        TRPCClient[tRPC Client]
    end

    subgraph "Backend (Next.js API)"
        TRPCServer[tRPC Server]
        Routers[tRPC Routers]
        Logic[Business Logic]
    end

    subgraph "Data Layer"
        ORM[Prisma/Drizzle ORM]
        DB[(SQLite/PostgreSQL)]
    end

    subgraph "Optional"
        GoService[Go Assignment Service]
    end

    UI --> TRPCClient
    TRPCClient --> TRPCServer
    TRPCServer --> Routers
    Routers --> Logic
    Logic --> ORM
    ORM --> DB
    Logic -.-> GoService
    GoService -.-> DB
```

## User Flow - Experiment Management

```mermaid
sequenceDiagram
    actor User
    participant UI as UI (Experiments Tab)
    participant tRPC as tRPC Client
    participant API as tRPC Router
    participant DB as Database

    User->>UI: Create New Experiment
    UI->>User: Show Experiment Form
    User->>UI: Fill Details (name, status, dates)
    UI->>tRPC: experiments.create(data)
    tRPC->>API: Validate & Process
    API->>DB: Insert Experiment
    DB-->>API: Return Experiment
    API-->>tRPC: Return Result
    tRPC-->>UI: Update UI
    UI-->>User: Show Success + Experiment List
```

## User Flow - Variant Management

```mermaid
sequenceDiagram
    actor User
    participant UI as UI (Variants Tab)
    participant tRPC as tRPC Client
    participant API as tRPC Router
    participant DB as Database

    User->>UI: Select Experiment
    UI->>tRPC: variants.list(experimentId)
    tRPC->>API: Get Variants
    API->>DB: Query Variants
    DB-->>API: Return Variants
    API-->>tRPC: Return Data
    tRPC-->>UI: Display Variants

    User->>UI: Add/Edit Variants
    UI->>tRPC: variants.upsertMany(data)
    tRPC->>API: Validate (weights, keys)
    API->>DB: Update Variants
    DB-->>API: Confirm
    API-->>tRPC: Success
    tRPC-->>UI: Refresh List
```

## User Flow - Assignment (Sticky)

```mermaid
sequenceDiagram
    actor User
    participant UI as UI (Assignments Tab)
    participant tRPC as tRPC Client
    participant API as Assignment Router
    participant Logic as Assignment Logic
    participant DB as Database

    User->>UI: Enter userId & experimentId
    UI->>tRPC: assignments.get(userId, experimentId)
    tRPC->>API: Get Assignment
    API->>DB: Check Existing Assignment

    alt Assignment Exists
        DB-->>API: Return Assignment
        API-->>tRPC: Return Variant
    else No Assignment
        API->>Logic: Calculate Assignment
        Logic->>Logic: hash(userId:expName) % variantCount
        Logic-->>API: Return Variant
        API->>DB: Store Assignment
        DB-->>API: Confirm
        API-->>tRPC: Return New Variant
    end

    tRPC-->>UI: Display Variant
    UI-->>User: Show Result
```

## Assignment Logic Flow (Detailed)

```mermaid
flowchart TD
    Start([User Request: userId + experimentId])
    CheckExp{Experiment Active?}
    CheckAssign{Assignment Exists?}
    ReturnExisting[Return Existing Variant]
    CalcHash[Calculate Hash: hash userId:expName]
    MapVariant[Map to Variant: hash % variantCount]
    ApplyWeight{Apply Weights?}
    WeightLogic[Weight-based Selection]
    StoreAssign[Store Assignment in DB]
    ReturnNew[Return New Variant]
    Error[Return Error]

    Start --> CheckExp
    CheckExp -->|No| Error
    CheckExp -->|Yes| CheckAssign
    CheckAssign -->|Yes| ReturnExisting
    CheckAssign -->|No| CalcHash
    CalcHash --> MapVariant
    MapVariant --> ApplyWeight
    ApplyWeight -->|Yes| WeightLogic
    ApplyWeight -->|No| StoreAssign
    WeightLogic --> StoreAssign
    StoreAssign --> ReturnNew
```

## Component Structure

```mermaid
graph TD
    subgraph "App Layout"
        Layout[Root Layout - Dark Theme]
        Nav[Navigation/Tabs]
    end

    subgraph "Experiments View"
        ExpList[Experiments Table]
        ExpSearch[Search/Filter]
        ExpCreate[Create Dialog]
        ExpEdit[Edit Dialog]
    end

    subgraph "Variants View"
        VarSelect[Experiment Selector]
        VarList[Variants Table]
        VarForm[Add/Edit Form]
        WeightInput[Weight Input/Slider]
    end

    subgraph "Assignments View"
        AssignInput[User/Exp Input]
        AssignButton[Get Assignment Button]
        AssignResult[Result Display]
    end

    Layout --> Nav
    Nav --> ExpList
    Nav --> VarSelect
    Nav --> AssignInput

    ExpList --> ExpSearch
    ExpList --> ExpCreate
    ExpList --> ExpEdit

    VarSelect --> VarList
    VarList --> VarForm
    VarForm --> WeightInput

    AssignInput --> AssignButton
    AssignButton --> AssignResult
```

## Data Model Relationships

```mermaid
erDiagram
    EXPERIMENT ||--o{ VARIANT : contains
    EXPERIMENT ||--o{ ASSIGNMENT : has
    USER ||--o{ ASSIGNMENT : receives

    EXPERIMENT {
        string id PK
        string name UK
        enum status
        string strategy
        datetime startAt
        datetime endAt
    }

    VARIANT {
        string id PK
        string experimentId FK
        string key
        int weight
    }

    USER {
        string id PK
        string name
    }

    ASSIGNMENT {
        string id PK
        string experimentId FK
        string userId FK
        string variantKey
    }
```

## Technology Stack Flow

```mermaid
graph LR
    subgraph "Development"
        TS[TypeScript]
        React[React/Next.js]
        Tailwind[TailwindCSS]
        shadcn[shadcn/ui]
    end

    subgraph "API Layer"
        tRPC[tRPC]
        Zod[Zod Validation]
    end

    subgraph "Data"
        ORM[Prisma/Drizzle]
        SQLite[(SQLite)]
    end

    TS --> React
    React --> Tailwind
    Tailwind --> shadcn
    React --> tRPC
    tRPC --> Zod
    tRPC --> ORM
    ORM --> SQLite
```

## Complete Application Flow

```mermaid
flowchart TD
    Start([User Opens App]) --> LoadUI[Load UI with Dark Theme]
    LoadUI --> ShowTabs[Show Tabs: Experiments/Variants/Assignments]

    ShowTabs --> TabChoice{User Selects Tab}

    TabChoice -->|Experiments| ExpTab[Experiments Tab]
    TabChoice -->|Variants| VarTab[Variants Tab]
    TabChoice -->|Assignments| AssignTab[Assignments Tab]

    ExpTab --> ExpActions{Action?}
    ExpActions -->|Create| CreateExp[Create New Experiment]
    ExpActions -->|Edit| EditExp[Edit Experiment]
    ExpActions -->|Delete| DeleteExp[Delete Experiment]
    ExpActions -->|View| ListExp[List All Experiments]

    VarTab --> SelectExp[Select Experiment]
    SelectExp --> VarActions{Action?}
    VarActions -->|Add| AddVar[Add Variant]
    VarActions -->|Edit| EditVar[Edit Variant Weight]
    VarActions -->|Delete| DeleteVar[Delete Variant]
    VarActions -->|View| ListVar[List Variants]

    AssignTab --> InputIds[Enter userId & experimentId]
    InputIds --> GetAssign[Request Assignment]
    GetAssign --> CheckExist{Assignment Exists?}
    CheckExist -->|Yes| ShowExist[Show Existing Variant]
    CheckExist -->|No| CalcNew[Calculate New Assignment]
    CalcNew --> ShowNew[Show New Variant]

    CreateExp --> SaveDB[(Save to DB)]
    EditExp --> SaveDB
    DeleteExp --> SaveDB
    AddVar --> SaveDB
    EditVar --> SaveDB
    DeleteVar --> SaveDB
    CalcNew --> SaveDB

    SaveDB --> Refresh[Refresh UI]
    ListExp --> Refresh
    ListVar --> Refresh
    ShowExist --> Refresh
    ShowNew --> Refresh

    Refresh --> ShowTabs
```

## Deployment Architecture (Optional - Vercel)

```mermaid
graph TB
    subgraph "Client Browser"
        Browser[User Browser]
    end

    subgraph "Vercel Edge Network"
        Edge[Edge Functions]
        CDN[Static Assets CDN]
    end

    subgraph "Vercel Serverless"
        NextAPI[Next.js API Routes]
        tRPCAPI[tRPC Handlers]
    end

    subgraph "Database"
        DB[(PostgreSQL/Vercel Postgres)]
    end

    Browser --> Edge
    Browser --> CDN
    Edge --> NextAPI
    NextAPI --> tRPCAPI
    tRPCAPI --> DB
```

## Quick Reference: Key Interactions

### Creating an Experiment

1. User fills form with experiment details
2. Frontend validates input (Zod schema)
3. tRPC client calls `experiments.create`
4. Backend validates and saves to database
5. UI refreshes with new experiment in list

### Assigning a User to Variant

1. User enters userId and experimentId
2. System checks for existing assignment
3. If none exists:
   - Calculate hash from userId and experiment name
   - Map hash to variant index
   - Save assignment to database
4. Return variant key to user

### Managing Variants

1. User selects an experiment
2. System loads variants for that experiment
3. User can add/edit/delete variants
4. System validates weights (must total to logical distribution)
5. Changes saved and UI refreshes

---

**Note:** These diagrams provide a visual reference for understanding the system architecture, data flow, and user interactions. Refer to REQUIREMENTS.md for detailed specifications.
