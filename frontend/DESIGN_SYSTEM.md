# FRONTEND-UI DESIGN SYSTEM — "AURORA" (DARK TECH)

This is the binding visual contract for every file in `frontend-UI`. The original
`frontend` folder is the FUNCTIONAL reference: all logic, hooks, state, handlers,
services, routes, props, and text content must be preserved EXACTLY. Only the
presentation layer (JSX markup, classNames, decorative wrappers) may change.

## STACK

React 18 + Vite + Tailwind CSS v4 (`@import "tailwindcss"` in index.css) +
react-router-dom v6 + lucide-react icons ONLY (no other icon sets) +
react-toastify. No new libraries allowed.

## PALETTE RULES

- Page/app background stays `#050816` (already set in Layout / login-page-bg).
- Surfaces/cards: `bg-[#0d1430]/55` or `bg-[#0b1128]/60` + `border-white/[0.08]`
  + `shadow-card` + `backdrop-blur-md`, rounded `rounded-2xl`.
- NEVER use light-theme colors: no `bg-white`, no `bg-slate-50/100`,
  no `text-slate-900/800/700` on surfaces, no `bg-indigo-50`, `border-slate-200`,
  `bg-red-50`, etc.
- Text hierarchy:
  - Headings: `text-white` (+ `font-display` for h1/h2/h3)
  - Body: `text-slate-300` or `text-slate-200`
  - Secondary: `text-slate-400`
  - Muted/captions: `text-slate-500`
- Status colors (dark-tuned):
  - Success: `text-emerald-300/400`, bg `emerald-400/10`, border `emerald-300/25`
  - Warning: `text-amber-300/400`, bg `amber-400/10`, border `amber-300/25`
  - Error: `text-rose-300/400`, bg `rose-500/10`, border `rose-300/25`
  - Info: `text-cyan-300/sky-300`, bg `sky-400/10`, border `sky-300/25`

## CLASS RECIPES

Card / panel:
```
rounded-2xl border border-white/[0.08] bg-[#0d1430]/55 shadow-card backdrop-blur-md p-6
```

Hoverable card — add: `transition-all duration-200 hover:border-cyan-300/25 hover:shadow-card-hover hover:-translate-y-0.5`

Primary action button (or use shared `<Button variant="primary">`):
```
bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-glow-sm hover:shadow-glow border border-cyan-300/30 rounded-xl
```

Secondary button:
```
border border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/[0.11] hover:text-white rounded-xl
```

Danger button:
```
bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-md shadow-rose-500/25 border border-rose-300/25
```

Input/select field container:
```
rounded-xl border border-white/10 bg-[#0a1026]/80 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10
```
(input text `text-slate-100`, placeholder `placeholder:text-slate-600`)
Prefer the shared `<Input>` / `<Select>` components from `components/ui`.

Table:
```
container: rounded-2xl border border-white/[0.08] bg-[#0b1128]/70 overflow-hidden shadow-card
thead: bg-white/[0.04] text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-white/[0.08]
rows: divide-y divide-white/[0.05]; row hover: hover:bg-white/[0.03]
cell text: text-slate-300; strong values: text-white
```

Badge/status pill (or use shared `<Badge status="PRESENT|ABSENT|...">`):
```
inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold
+ status recipe above; add glowing dot: <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
```

Modal backdrop / panel:
```
backdrop: fixed inset-0 bg-black/70 backdrop-blur-md animate-fade-in
panel:    glass-modal animate-scale-in rounded-3xl (class already in index.css)
```

Page header pattern (every page):
```jsx
<div className="animate-slide-up">
  <div className="flex items-center gap-3">
    <div className="icon tile: flex h-12 w-12 items-center justify-center rounded-xl
        bg-gradient-to-br from-blue-500/20 to-cyan-400/15 border border-cyan-300/25
        text-cyan-300 shadow-glow-sm">
      <Icon size={24} />
    </div>
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
        Title
      </h1>
      <p className="mt-0.5 text-xs sm:text-sm text-slate-400">Subtitle / context</p>
    </div>
  </div>
</div>
```

Stat/KPI card:
```
glass card recipe + big number: font-display text-3xl font-bold text-white
label: text-xs font-semibold uppercase tracking-wider text-slate-500
accent icon tile top-right or left; optional thin gradient bar:
<div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-transparent opacity-60" />
```

Skeleton loaders: use `.skeleton-block` class (shimmer built-in) or `<Skeleton variant="card" />`.
Empty states / error states: reuse `EmptyState` / `ErrorState` / `ErrorMessage` components.

## ANIMATION RULES

Available helpers (already in index.css): `animate-fade-in`, `animate-slide-up`,
`animate-scale-in`, `animate-shimmer`, `float-gentle`, `status-dot-live`,
`text-gradient-brand`, `skeleton-block`, `hover-lift`, `glass-card`,
`glass-modal`, `glass-dropdown`, `camera-viewfinder`, `scan-line`, `face-guide`,
`confidence-bar/fill/high/medium/low`, `btn-premium`.
Tailwind config also provides `shadow-glow-sm|glow|glow-lg|card|card-hover|panel`.

Usage:
- Page root sections: `animate-slide-up` (stagger children with inline
  `style={{ animationDelay: '80ms' }}` + `animate-slide-up opacity-0` if needed).
- Modals/toasts: `animate-scale-in` / `animate-fade-in`.
- Icon tiles can get `hover-lift`.
- Keep transitions 150–300ms. No bounce-heavy effects.
- Do NOT add continuous animations inside the camera/recognition area beyond
  existing scan-line/guide overlays (performance).

## ACCESSIBILITY & MISC

- Keep all aria-labels, roles, alt text from the original files.
- Keep form labels wired (`htmlFor`) and validation messages identical.
- Custom scrollbar is global already; don't add per-component scrollbars.
- Respect reduced motion: never remove the `prefers-reduced-motion` block logic
  (it is global in index.css).
- Mobile: tables become cards OR wrap in `overflow-x-auto`; nav must not overflow;
  test breakpoints sm/md/lg mentally while choosing grid classes.

## FILE-BY-FILE CONTRACT

For each assigned file:
1. Read the ORIGINAL file at `frontend/src/...` (reference) — it is byte-identical
   to the copy in `frontend-UI/src/...` right now.
2. Rewrite the copy at `frontend-UI/src/...` preserving EVERY import, state
   variable, effect, handler, API call, conditional, route string, toast call,
   prop, and text string. Change only presentation (className strings, wrapper
   divs, icon usage).
3. Do not rename files, do not change exports/props signatures, do not touch any
   file outside your assignment.
4. No comments explaining changes; keep code style of the original (indentation,
   quote style, template literals).
