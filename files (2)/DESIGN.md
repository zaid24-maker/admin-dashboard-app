# UI/UX Design Guide

## 1. Design Philosophy

A dark, professional, data-dense dashboard aesthetic optimized for engineers and analysts who spend long hours monitoring executions and logs. Clarity and scanability take priority over decoration.

---

## 2. Theme

**Mode:** Dark Dashboard (with optional light mode toggle)

### Color Palette

| Purpose | Color | Hex |
|---|---|---|
| Primary | Indigo | `#4F46E5` |
| Secondary | Green (success) | `#22C55E` |
| Danger | Red (failure) | `#EF4444` |
| Warning | Amber | `#F59E0B` |
| Background | Deep Navy | `#0F172A` |
| Card Surface | Slate | `#1E293B` |
| Text Primary | White | `#F8FAFC` |
| Text Secondary | Muted Gray | `#94A3B8` |
| Border | Slate Border | `#334155` |

### Border Radius
`12px` standard for cards, buttons, inputs, and modals.

### Typography
- **Font Family:** Inter
- **Headings:** 600–700 weight
- **Body:** 400–500 weight
- **Scale:** 12px / 14px / 16px / 20px / 24px / 32px

---

## 3. Layout

```
┌─────────────┬─────────────────────────────┐
│             │           Header             │
│   Sidebar   ├─────────────────────────────┤
│             │                               │
│   (Nav)     │        Content Area           │
│             │     (Cards / Tables / Forms)  │
│             │                               │
└─────────────┴─────────────────────────────┘
```

- **Sidebar:** Collapsible, icon + label navigation, active-state highlight.
- **Header:** Page title, breadcrumb, user avatar/menu, notifications bell.
- **Content:** Grid-based card layout for dashboard; table layout for lists (workflows, executions, logs).

### Responsive Breakpoints
- Desktop: ≥1280px — full sidebar + multi-column grid
- Tablet: 768–1279px — collapsible sidebar, 2-column grid
- Mobile: <768px — sidebar becomes a drawer/overlay, single-column stack

---

## 4. Components

| Component | Notes |
|---|---|
| Sidebar | Fixed, collapsible, icon-based |
| Navbar/Header | Sticky top, contains search + profile menu |
| Cards | Used for stats, workflow summaries |
| Charts | Line/bar charts for execution trends (e.g., Recharts) |
| Tables | Sortable, paginated, filterable |
| Forms | Grouped fields, inline validation messages |
| Buttons | Primary (indigo), secondary (outline), danger (red) |
| Modal | Used for create/edit workflow, confirmations |
| Toast | Non-blocking success/error notifications |
| Loader | Skeleton loaders preferred over spinners for tables/cards |

---

## 5. Status Indicators

| Status | Color | Icon |
|---|---|---|
| Success | Green `#22C55E` | Check circle |
| Failed | Red `#EF4444` | X circle |
| Running | Indigo `#4F46E5` | Spinner/pulse |
| Pending | Amber `#F59E0B` | Clock |
| Paused | Gray `#94A3B8` | Pause circle |

---

## 6. Animation & Interaction

- **Fade:** Page transitions, modal open/close
- **Slide:** Sidebar drawer on mobile, toast entry
- **Hover:** Subtle elevation/brightness increase on cards and buttons
- **Scale:** Button press feedback (scale 0.97 on active)

Keep animations under 200ms — this is a utility dashboard, not a marketing site.

---

## 7. Iconography

**Library:** Lucide React — consistent stroke-based icon set across the entire app.

---

## 8. Accessibility

- Minimum contrast ratio of 4.5:1 for body text against background
- All interactive elements keyboard-navigable
- Focus states visible (outline or ring, not just color change)
- Form errors announced via `aria-live` regions
