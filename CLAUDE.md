# CLAUDE.md — front-hono Design System Rules

Guidelines for translating Figma designs into production code in this project.

---

## 1. Design Tokens

### Location
`src/index.css` — all tokens defined as CSS Custom Properties using OKLch color space.

### Color Token Pattern
```css
/* Light theme (default) */
:root {
  --primary: oklch(0.606 0.25 292.717);        /* Purple */
  --primary-foreground: oklch(0.985 0 0);
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.606 0.25 292.717);
  /* Semantic: secondary, muted, accent, card, popover, sidebar-* */
  /* Data viz: --chart-1 through --chart-5 */
}

/* Dark theme */
.dark { /* All values overridden */ }
```

### Spacing / Radius Tokens
```css
:root {
  --radius: 0.75rem;         /* 12px */
  --radius-sm: calc(var(--radius) - 4px);  /* 8px */
  --radius-md: calc(var(--radius) - 2px);  /* 10px */
  --radius-lg: var(--radius);              /* 12px */
  --radius-xl: calc(var(--radius) + 4px);  /* 16px */
}
```

**Rule:** When mapping Figma colors → always use semantic token (`bg-primary`, `text-foreground`) over raw hex. When adding a new token, add it to both `:root` and `.dark` blocks in `index.css`.

---

## 2. Component Library

### Directory Structure
```
src/components/
├── ui/              # shadcn/ui primitives (button, card, input, badge, dialog, etc.)
├── animate-ui/      # Motion-enhanced components
│   ├── buttons/     # liquid.tsx, ripple.tsx
│   ├── icons/       # Animated icon wrappers
│   ├── backgrounds/ # stars.tsx, animated backgrounds
│   ├── radix/       # Wrapped Radix UI with animations
│   ├── text/        # Animated text components
│   └── effects/     # Visual effects
└── *.tsx            # Feature-level components (FinancialChart, CardIncome, etc.)
```

### Component Architecture
Uses **shadcn/ui** pattern: Radix UI headless primitives + CVA variants + Tailwind utilities.

```tsx
// Variant pattern (CVA)
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const componentVariants = cva('base-classes...', {
  variants: {
    variant: { default: '...', destructive: '...' },
    size: { sm: '...', default: '...', lg: '...' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

export interface ComponentProps
  extends React.ComponentProps<'element'>,
    VariantProps<typeof componentVariants> {}

export function Component({ className, variant, size, ...props }: ComponentProps) {
  return <element className={cn(componentVariants({ variant, size }), className)} {...props} />;
}
```

### Adding New shadcn Components
```bash
pnpm dlx shadcn@latest add <component-name>
```
Config: `components.json` at project root. Components land in `src/components/ui/`.

### Feature Components
Page-level composed components (e.g. `FinancialChart.tsx`, `CardIncome.tsx`) live directly in `src/components/`. These use ui primitives + business logic.

---

## 3. Frameworks & Libraries

| Concern | Library | Version |
|---|---|---|
| UI Framework | React | ^19.2.4 |
| Routing | TanStack Router | ^1.158.1 |
| Server State | TanStack Query | ^5.90.20 |
| Tables | TanStack Table | ^8.21.3 |
| Styling | Tailwind CSS | ^4.2.1 |
| Components | Radix UI + shadcn/ui | ^1.4.3 |
| Variants | Class Variance Authority | ^0.7.1 |
| Animation | Framer Motion | ^11.18.2 |
| Animation | Motion/React | ^12.33.0 |
| Animation | GSAP | ^3.14.2 |
| Icons | Lucide React | ^0.515.0 |
| Icons (secondary) | React Icons | ^5.5.0 |
| Charts | Recharts | ^3.8.0 |
| Forms/Validation | Zod | ^3.25.76 |
| Backend | Supabase | ^2.95.3 |
| Toasts | Sonner | ^2.0.7 |
| Theme | next-themes | ^0.4.6 |
| Bundler | Vite | ^6.4.1 |

---

## 4. Asset Management

### Storage
```
src/assets/
├── react.svg
└── tela-inicial.png
```

### Import Pattern
```tsx
import heroImage from '@/assets/tela-inicial.png';
// Use in JSX:
<img src={heroImage} alt="..." />
```

Vite handles hashing and optimization at build time. No CDN configuration in this project.

---

## 5. Icon System

### Primary: Lucide React
```tsx
import { ChevronDown, Plus, AlertCircle, Bell } from 'lucide-react';

<ChevronDown size={16} className="text-muted-foreground" />
<Plus className="h-4 w-4" />
```

### Secondary: React Icons (FA6, MD families)
```tsx
import { FaChartArea, FaMoneyBill } from 'react-icons/fa6';
import { MdTipsAndUpdates } from 'react-icons/md';
```
Use sparingly — only when Lucide doesn't have the icon.

### Animated Icons: `animate-ui/icons/`
Context-based animation system. Use for interactive elements (navbar, action buttons).

```tsx
import { LogInIcon } from '@/components/animate-ui/icons/log-in';
import { BellIcon } from '@/components/animate-ui/icons/bell';
```

### Sizing Convention
- Inline / small UI: `h-4 w-4` or `size={16}`
- Medium / buttons: `h-5 w-5` or `size={20}`
- Feature icons: `h-6 w-6` or `size={24}`

---

## 6. Styling Approach

### Methodology
Utility-first with **Tailwind CSS v4** + **CSS Custom Properties** + **CVA** for variants.

### Utility Helper
```tsx
import { cn } from '@/lib/utils';
// cn = clsx + tailwind-merge
<div className={cn('base-class', condition && 'conditional-class', className)} />
```

### Dark Mode
- Strategy: CSS class-based (`.dark`)
- Default: `"dark"` theme in ThemeProvider
- Implementation: update `--variable` values under `.dark {}` in `index.css`
- Never hardcode dark-mode colors — always use semantic tokens

### Responsive Design
Mobile-first Tailwind breakpoints:
```tsx
// Standard breakpoints
<div className="flex flex-col md:flex-row lg:grid lg:grid-cols-3" />

// Container queries (for self-contained components)
<div className="@container/card">
  <div className="@container/card-header has-data-[slot=card-action]:grid-cols-[1fr_auto]" />
</div>
```

### Global Base Styles
`src/index.css` sets:
```css
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

---

## 7. Project Structure

```
src/
├── components/         # UI primitives + feature components
│   ├── ui/             # shadcn primitives
│   └── animate-ui/     # Motion-enhanced variants
├── pages/              # Route-level page components
│   ├── admin/          # Protected admin pages (Dashboard, Income, List, History)
│   └── *.tsx           # Public pages (Home, Login)
├── routes/             # TanStack Router config
├── hooks/              # Custom hooks (always wrapping TanStack Query)
├── service/            # API layer (useCreateIncome, useDeleteIncome, etc.)
├── model/              # TypeScript types / interfaces
├── schema/             # Zod validation schemas
├── context/            # React context providers (UserContext)
├── lib/                # Library setup (supabase.ts, query-keys.ts, utils.ts)
├── config/             # App-wide configuration constants
├── data/               # Static data / mock data
├── utils/              # Pure utility functions
├── stories/            # Storybook stories (*.stories.tsx)
└── assets/             # Static assets (images, SVGs)
```

### Route Structure
```
/                    → Home (public, landing)
/login               → Login
/auth/callback       → OAuth callback
/admin               → Dashboard (protected)
/admin/income        → Income management
/admin/list          → Expenses list
/admin/history       → Transaction history
/admin/editUser      → Profile
```

### Feature Organization Pattern
Each feature follows this structure:
```
service/<feature>/
  use<Feature>ById.ts
  useCreate<Feature>.ts
  useDelete<Feature>.ts
  useEdit<Feature>.ts

hooks/
  use-<feature>-by-month.ts   # TanStack Query wrapper

components/
  <Feature>DataTable.tsx       # Feature component

pages/admin/
  <Feature>.tsx                # Page component
```

### Query Key Convention
Centralized in `src/lib/query-keys.ts`. Always reference from there — never inline strings.

---

## 8. Build System

**Bundler:** Vite 6.4.1

### Manual Chunks (code-splitting)
```ts
// vite.config.ts
manualChunks: {
  'react-vendor':    ['react', 'react-dom', ...],
  'ui-vendor':       ['@radix-ui/*', ...],
  'animation-vendor':['framer-motion', 'motion', ...],
  'icons-vendor':    ['lucide-react', 'react-icons'],
  'data-vendor':     ['@supabase/supabase-js'],
  'utils-vendor':    ['date-fns', 'zod', 'sonner'],
  'shadcn':          ['@/components/ui/*'],
  'animate-ui':      ['@/components/animate-ui/*'],
}
```

### Path Alias
```ts
// Always use @/ alias — never relative paths for src/ imports
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
```

### Dev Server
- Port: `5173` (strict)
- API proxy: `/api` → `http://localhost:3000`

### Scripts
```bash
pnpm dev                # Start dev server
pnpm build              # TypeScript check + Vite build
pnpm build:with-version # Generate version + build
pnpm preview            # Preview production build
```

---

## 9. Figma → Code Integration Rules

When translating Figma designs into this codebase:

1. **Colors:** Map to semantic tokens (`text-primary`, `bg-background`) — never raw hex.
2. **Radius:** Map to `rounded-sm/md/lg/xl` which resolve from `--radius-*` tokens.
3. **Shadows:** Use Tailwind shadow utilities (`shadow-xs`, `shadow-sm`, `shadow-md`).
4. **Typography:** Use Tailwind type scale (`text-sm`, `text-base`, `text-xl`, `font-semibold`).
5. **Spacing:** 4px grid — use Tailwind spacing (1 unit = 4px).
6. **Components:** Check `src/components/ui/` first before creating new ones.
7. **Animations:** Use `animate-ui/` components for interactive elements; use Framer Motion for custom animations.
8. **Icons:** Match Figma icons to Lucide React names first; fall back to React Icons.
9. **Dark mode:** All components must work in both light and dark — use semantic tokens only.
10. **Responsive:** Implement mobile-first; use `sm:`, `md:`, `lg:` breakpoints.
