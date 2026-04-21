# Iruka Web App - Implementation Plan

## Overview
Web app and marketing surface for Iruka — "Open Data Signals for Smarter Agents"

**Narrative:** AI agents need reliable blockchain event sources. Iruka provides composable signal monitoring that listens through chain noise until exact conditions resolve.

## Design System

### Colors
- **Iruka Primary:** muted copper / operational signal tone
- **Iruka Accent:** deep teal for secondary signal states
- **Dark BG:** `#16181a`
- **Dark Secondary:** `#202426`
- **Light BG:** `#f0f2f7`

### Typography
- **Headings:** Rajdhani / display sans
- **Body:** Inter
- **Code:** Victor Mono / monospace

### Spacing & Roundness
- Border radius: small and controlled; avoid pill-shaped controls by default
- Container padding: px-6 sm:px-8 md:px-12 lg:px-16
- Grid textures: bg-dot-grid, bg-line-grid with fade masks

## Page Structure

### 1. Hero Section
- Tag: "Event Infrastructure for Agents"
- Headline: "Listen Through Chain Noise"
- Subline: Typing animation showing use cases:
  - "Alert when a whale exits"
  - "Track position drops in real-time"  
  - "Trigger webhooks on-chain events"
- CTA: "Read the Docs" / "Try Simulator"
- Visual: Animated signal flow diagram or code snippet

### 2. How It Works (3 Steps)
1. **Define** - Write conditions in simple DSL
2. **Deploy** - Register signal via API
3. **React** - Receive webhooks when triggered

### 3. Feature Cards
- **Multi-Condition Logic** - AND/OR groups, nested conditions
- **Time Windows** - Track changes over 1h, 7d, 30d
- **Protocol-Native Metrics** - Morpho positions, markets, events
- **Operator-Ready** - designed for DeFi operators and agent builders

### 4. Code Examples
Show real DSL examples:
- Whale position drop alert
- Utilization spike warning
- Supply/withdraw event aggregation

### 5. For Agents Section
- OpenClaw integration example
- SKILL.md format for agent consumption
- Webhook → Agent action flow

### 6. API Reference (Quick)
- POST /signals - Create signal
- GET /signals/:id - Check status
- POST /simulate - Test without deploying

### 7. Footer
- Links: Docs, Discord, iruka.tech

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS 4
- **Fonts:** Google Fonts (Inter, Zen Kaku Gothic New) + local Victor Mono
- **Icons:** react-icons (Remix Icons)
- **Animations:** Framer Motion (subtle)
- **Deployment:** Vercel (iruka.tech)

## File Structure
```
iruka-web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── global.css
│   └── fonts.ts
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── HowItWorks.tsx
│   ├── Features.tsx
│   ├── CodeExamples.tsx
│   ├── ForAgents.tsx
│   ├── ApiReference.tsx
│   ├── Footer.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── SectionTag.tsx
│       ├── CodeBlock.tsx
│       └── GridTexture.tsx
├── public/
│   └── imgs/
├── tailwind.config.ts
├── package.json
└── README.md
```

## Mobile Optimization
- Responsive grid: 1 col mobile, 2 col desktop
- Touch-friendly buttons (min 44px)
- Readable font sizes (16px+ body)
- Collapsible code examples on mobile
- Sticky header with hamburger menu

## Implementation Phases

### Phase 1: Setup (30 min) ✅
- [x] Create Next.js project
- [x] Configure Tailwind with Iruka tokens
- [x] Set up fonts (Inter, JetBrains Mono, Zen Kaku Gothic New)
- [x] Create global.css with theme variables

### Phase 2: Components (2 hours) ✅
- [x] Header with logo + nav + dark mode toggle
- [x] Hero section with typing animation
- [x] How It Works section (3 steps)
- [x] Feature cards grid (4 features)
- [x] Code examples with syntax highlighting + tabs

### Phase 3: Polish (1 hour) ✅
- [x] For Agents section
- [x] API quick reference table
- [x] Footer
- [x] Dark/light mode toggle

### Phase 4: Mobile (1 hour) ✅
- [x] Responsive testing
- [x] Touch optimization
- [x] Performance audit (build passes, edge-compatible)

### Phase 5: Content (30 min) ✅
- [x] Final copy review
- [x] Meta tags / SEO (full metadata, JSON-LD)
- [x] Social preview image (OG + Twitter generated)

## Hourly Check-in Schedule
- 00:00 - Project setup complete
- 01:00 - Hero + Header done
- 02:00 - Features + How It Works done
- 03:00 - Code examples + For Agents done
- 04:00 - Mobile optimization done
- 05:00 - Final polish + deploy ready
- 06:00 - Review and handoff

### Phase 6: Deployment ✅
- [x] Private source repository lives under iruka-tech
- [x] ESLint errors fixed
- [x] Build passes clean
- [ ] Deploy to Vercel (iruka.tech) — **READY**

## Deployment

**Repository:** Private source repository under `iruka-tech`

**To deploy:**
1. Import to Vercel: https://vercel.com/new
2. Select the private Iruka web repository under `iruka-tech`
3. Set custom domain: `iruka.tech`
4. Deploy

## Notes
- Keep marketing surfaces static where possible; app workspace proxies to the Iruka API
- Optimize for agents reading (clear structure, code-first)
- Keep Iruka restrained, precise, and operational
