# DuoFit - AGENTS.md

Codebase guidelines for agentic coding agents.

## Project Overview

DuoFit is a couples fitness and nutrition accountability app built with Next.js 16 App Router, TypeScript, Prisma (with libsql/Turso), and Tailwind CSS 4.

## Build/Lint/Test Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Build
npm run build        # Generate Prisma client and build for production

# Lint
npm run lint         # Run ESLint with next/core-web-vitals

# Database
npx prisma generate  # Generate Prisma client
npx prisma migrate dev --name <name>  # Create migration
npx prisma studio    # Open database GUI
```

**Note:** No test framework is configured. If tests are needed, ask the user which framework to use.

## Code Style Guidelines

### General

- **NO COMMENTS** in code unless explicitly requested
- Use TypeScript strict mode - all code must be type-safe
- Prefer `const` over `let`
- Use arrow functions for callbacks and handlers
- Use `async/await` over `.then()` chains

### Imports

Order imports as follows (separated by blank lines between groups):
1. React/Next.js imports
2. Third-party libraries
3. Internal imports with `@/` alias
4. Generated Prisma types from `@/generated/prisma/client`

```typescript
// Example:
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChecklistItem } from "@/generated/prisma/client";
```

### Formatting

- Indent with 2 spaces
- Single quotes for strings
- Trailing commas in multiline objects/arrays
- Max line length: ~100 characters (soft limit)
- Blank line before return statements
- Blank line between logical sections

### TypeScript

- Use `interface` for object types, `type` for unions/mapped types
- Export interfaces from `src/types/index.ts` for shared DTOs
- Use `Omit<>, Pick<>` for derived types
- Explicit return types for exported functions (optional for internal)
- Avoid `any` - use `unknown` when type is truly unknown

```typescript
// Good
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

// Avoid
export type ButtonProps = any;
```

### Components (React)

- Use default export for components: `export default function ComponentName()`
- Use `"use client"` directive at the top of client components
- Keep server components as the default (no directive)
- Props interfaces defined inline or in same file
- Destructure props in function signature
- Use Tailwind CSS for styling - no CSS modules or styled-components
- Avoid inline styles; use Tailwind classes

```tsx
// Server component (default)
export default async function Dashboard() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client component
"use client";

export default function Button({ variant = "primary", children }: Props) {
  return <button className="...">{children}</button>;
}
```

### API Routes

- Located in `src/app/api/`
- Export async functions named after HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- Use `NextRequest` and `NextResponse` from `next/server`
- Always check authentication via `getSession(req)` for protected routes
- Return `{ error: "message" }` for errors with appropriate status codes
- Use 201 for successful POST creation

```typescript
export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const data = await prisma.model.findMany();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  
  const item = await prisma.model.create({ data: { name: body.name } });
  return NextResponse.json(item, { status: 201 });
}
```

### Prisma

- Import from `@/lib/prisma` (not directly from generated)
- Generated types imported from `@/generated/prisma/client`
- Use `cuid()` for IDs (default in schema)
- Use relations with `include` or `select` for efficient queries
- Handle nullable fields with optional chaining

```typescript
import { prisma } from "@/lib/prisma";
import { User, ChecklistItem } from "@/generated/prisma/client";

const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, name: true, partnerId: true },
});
```

### Error Handling

- Use try/catch in async operations that may fail
- Return null/undefined for expected absence of data
- Throw only for unexpected/unrecoverable errors
- Log errors to console in development only

```typescript
// Good - expected absence
const user = await prisma.user.findUnique({ where: { id } });
if (!user) return null;

// Good - recovery attempt
try {
  const data = await fetchData();
  return data;
} catch {
  return null;
}

// Good - logging in catch
try {
  await saveItem();
} catch (error) {
  console.error("Failed to save:", error);
}
```

### Naming Conventions

- **Files:** `kebab-case.tsx` for components, `kebab-case.ts` for utilities
- **Components:** PascalCase (e.g., `DashboardPage`, `TaskRow`)
- **Functions:** camelCase (e.g., `getUserData`, `handleSubmit`)
- **Variables:** camelCase, use descriptive names
- **Constants:** SCREAMING_SNAKE_CASE for true constants
- **Types/Interfaces:** PascalCase with descriptive suffix (e.g., `UserDTO`, `ButtonProps`)

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Protected app routes (dashboard, etc.)
│   ├── (auth)/            # Auth routes (login, register)
│   ├── api/               # API route handlers
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Entry page
├── components/
│   ├── ui/                # Reusable UI primitives
│   ├── auth/              # Auth-related components
│   ├── dashboard/         # Dashboard feature components
│   └── [feature]/         # Feature-specific components
├── lib/                   # Utility libraries
│   ├── prisma.ts          # Database client
│   ├── auth.ts            # Auth helpers
│   └── dates.ts           # Date utilities
├── types/                 # Shared TypeScript types
│   └── index.ts
└── generated/             # Auto-generated code (Prisma)
```

### Tailwind CSS

- Use Tailwind utility classes exclusively
- Primary color: `indigo-*` for user, `amber-*` for partner
- Common patterns:
  - `rounded-lg` for rounded corners
  - `px-4 py-2` for button padding
  - `text-sm font-medium` for labels
  - `text-gray-*` for muted text

### Security Notes

- Never expose or log secrets (JWT_SECRET, TURSO_AUTH_TOKEN)
- Always validate auth in protected API routes
- Use `httpOnly` cookies for session tokens
- Never commit `.env` files

### Environment Variables

Required:
- `JWT_SECRET` - Secret for JWT signing
- `TURSO_DATABASE_URL` - Turso database URL (production)
- `TURSO_AUTH_TOKEN` - Turso auth token (production)

Local dev uses SQLite fallback when Turso vars are not set.

### Common Tasks

**Add new API route:**
1. Create `src/app/api/[resource]/route.ts`
2. Export GET/POST/etc. functions
3. Import from `@/lib/auth` for auth, `@/lib/prisma` for database

**Add new component:**
1. Create in `src/components/[feature]/` or `src/components/ui/`
2. Use `"use client"` if using hooks/client features
3. Export as default function

**Add new page:**
1. Create in `src/app/(app)/[route]/page.tsx` for protected pages
2. Create in `src/app/(auth)/[route]/page.tsx` for auth pages
3. Use server components by default for data fetching