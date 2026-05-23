---

# Architecture & Development Blueprint: Us.exe

A private, secure micro-communal workspace designed for exactly two users. Built on a zero-maintenance serverless footprint with an intimate, minimalist terminal design aesthetic.

---

## 1. Project Specifications & Tech Stack

### Core Stack

* **Frontend Engine:** React 18+ (Vite Tooling)
* **Routing Architecture:** React Router v6 (react-router-dom)
* **Styling Pipeline:** Tailwind CSS v4 (Design tokens driven by CSS Custom Properties)
* **Database & Security Core:** Supabase (PostgreSQL, Realtime Engine, Secure Storage)

### Core Rules

* **No Registration Flow:** Accounts are provisioned and matched directly within the database management interface.
* **Strict Security Isolation:** Row Level Security (RLS) rules block any request that doesn't explicitly match the user's active, verified couple_id.
* **Ambient State Architecture:** Components use generic classes like bg-vibe-bg. Color states translate dynamically down to Tailwind via injected CSS custom variables.

---

## 2. Global System Architecture

```
                       [ BROWSER LAYOUT FRAME ]
                                  │
       ┌──────────────────────────┴──────────────────────────┐
       ▼                                                     ▼
[ React Context Provider ]                            [ Tailwind Layer ]
(Auth State, Couple ID & Session Cache)             (Dynamic Theme Engine Tokens)
       │                                                     ▲
       ▼                                                     │
[ Protected Route Guard ]                                    │
(Session Handshake / Blocking Intercepts)                     │
       │                                                     │
       ▼                                                     │
[ Dashboard Interface Grid ] ────────────────────────────────┘
(Realtime Broadcast Subscriptions & Module Cards)

```

---

## 3. Database Schema Blueprint

```sql
-- Core Relation Maps
auth.users (Managed by Supabase Engine)

public.couples (
    id UUID PRIMARY KEY,
    partner_1_id UUID REFERENCES auth.users(id),
    partner_2_id UUID REFERENCES auth.users(id)
)

public.moods (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    couple_id UUID REFERENCES public.couples(id),
    mood_type VARCHAR(30),
    updated_at TIMESTAMP
)

public.todos (
    id UUID PRIMARY KEY,
    couple_id UUID REFERENCES public.couples(id),
    task TEXT,
    is_completed BOOLEAN
)

public.sticky_notes (
    id UUID PRIMARY KEY,
    couple_id UUID REFERENCES public.couples(id),
    author_id UUID REFERENCES auth.users(id),
    content TEXT,
    is_cleared BOOLEAN
)

public.photo_wall (
    id UUID PRIMARY KEY,
    couple_id UUID REFERENCES public.couples(id),
    storage_path TEXT,
    caption TEXT
)

public.link_drops (
    id UUID PRIMARY KEY,
    couple_id UUID REFERENCES public.couples(id),
    url TEXT,
    is_open BOOLEAN
)

public.dynamic_triggers (
    couple_id UUID,
    creator_id UUID,
    trigger_type VARCHAR(30),
    payload JSONB
)

```

---

## 4. Phased Step-by-Step Implementation Map

### Phase 1: Database Setup & RLS Injection

* [ ] Create core infrastructure tables inside Supabase (couples, moods, todos, sticky_notes, photo_wall, link_drops, dynamic_triggers).
* [ ] Inject custom security function helper get_my_couple_id().
* [ ] Toggle Row Level Security (RLS) across all tables to completely block cross-tenant database sniffing.
* [ ] Create target private Storage Bucket named memories for the photo modules.

### Phase 2: Central Communication API Layer

* [ ] Configure root supabaseClient.js environment.
* [ ] Assemble networkUtility.js containing clear asynchronous database wrappers.
* [ ] Build out standard signIn and signOut endpoints without any sign-up/registration bloat.

### Phase 3: Global Context & Protected Routing Guards

* [ ] Build AppContext.jsx using React Context to handle session lifecycles and background token refreshes.
* [ ] Create ProtectedRoute.jsx component to handle loading frames, intercept unauthenticated sessions, and flag unpaired accounts.
* [ ] Wire core route endpoints (/login, /dashboard) inside App.jsx using BrowserRouter.

### Phase 4: Dynamic Theme Engine Pipeline

* [ ] Map custom tokens inside Tailwind styling config file (--color-vibe-bg, --color-vibe-accent).
* [ ] Build the dynamic color lookup matrices and Javascript DOM style injector.
* [ ] Create DashboardLayout.jsx wrapper subscribing to real-time Postgres changes to change UI colors instantly when moods shift.

### Phase 5: Dashboard Module Card Assembly

* [ ] **The Mood Grid:** Create components that let users update their active state and sync color profiles instantly.
* [ ] **The Shared To-Do List:** Build task lines paired with instant frontend completion mutations (optimistic updates).
* [ ] **The Active Alert Note System:** Add the persistent "unread tray" card stack overlay that remains visible until dismissed.
* [ ] **The Ephemeral Photo Wall:** Build secure image upload interfaces generating temporary, 60-second secure view tokens from the private storage layer, alongside a double-action server destruction method.
* [ ] **The Link Drop Hub ("The Jam"):** Integrate embed structures capable of parsing and mounting raw inline Spotify web player elements.
* [ ] **The Co-Op Trigger System:** Set up low-latency socket pipelines via Supabase Broadcast channels to flash partner displays instantly without writing slow, structural database rows.

---

## 5. Deployment Checklist & Maintenance Routine

1. Go to Supabase Provider Settings and **Disable user sign-ups** to lock down the application from external registration requests entirely.
2. Manually generate a test profile row inside the auth.users ledger.
3. Map user relationships directly inside the couples table.
4. Mount the local environment workspace engine via Vite: npm run dev and test persistence layers across complete tab refreshes.