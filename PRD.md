# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Product Name: Remake (or Remake Studio)
**Tagline**: *Transform Any URL or Design into Clean, Production-Ready Next.js & Tailwind Systems.*

---

## 1. Executive Summary & Vision

### 1.1 Purpose
Remake is a modern Web SaaS platform designed for web developers, UI/UX designers, and product creators. Instead of scraping and copy-pasting raw DOM elements or junk CSS, Remake extracts non-copyrightable **Design DNA** (colors, typography scales, spacing grids, border radii, component variants) from any URL or screenshot. It allows users to visually edit and re-theme layouts in an interactive canvas ("Remake Studio"), and exports clean, modular **Next.js (React) + Tailwind CSS** components and design token files (`tokens.json`, `tailwind.config.js`, `DESIGN.md`).

### 1.2 Core Pillars
1. **Ethical Rebuild First**: Never copy-paste raw DOM scrapings or copyrighted site assets. Re-architect design systems ethically into clean React code.
2. **Pure Code Quality**: Zero junk CSS classes. Standard Tailwind CSS utilities and modular Next.js TSX components only.
3. **Interactive Studio**: Visual editing, theme switching, and layout section management on a web canvas.
4. **AI-Driven Creativity**: Turn screenshots into editable web layouts and score brand consistency with the Brand DNA Engine.

---

## 2. Target Audience & User Personas

### Persona 1: Frontend Developer (Alex)
* **Goal**: Build modern landing pages or web apps rapidly using inspiration from award-winning sites.
* **Pain Point**: Scraping extensions produce bloated inline CSS or messy raw HTML that breaks during React migration.
* **Remake Solution**: Imports URL $\rightarrow$ Gets clean `tailwind.config.js` and modular Next.js TSX components ready to copy into VS Code or Cursor.

### Persona 2: UI/UX Designer & Agency Builder (Sarah)
* **Goal**: Extract design tokens from client references and test new color palettes/typography scales quickly.
* **Pain Point**: Manually measuring colors, fonts, and spacing scales in Chrome DevTools is tedious.
* **Remake Solution**: One-click Design DNA extraction, visual theme switcher in Remake Studio, and downloadable `DESIGN.md` brief for AI workflows.

---

## 3. Product Roadmap & Phasing

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRODUCT ROADMAP                                │
└─────────────────────────────────────────────────────────────────────────┘
   PHASE 1: MVP CORE (Current Scope)
   ├── Web SaaS Dashboard & Import URL
   ├── Design DNA Extractor (Tokens, Palette, Type Scale, Spacing)
   ├── Remake Studio (Interactive Canvas, Text Editing, Section Manager)
   └── Clean Code Exporter (Next.js TSX + Tailwind Config + tokens.json)

   PHASE 2: INTELLIGENCE & CREATIVE ENGINE
   ├── Screenshot / Dribbble to Live Website
   ├── Brand DNA Score & Audit Engine
   ├── One-Click Multi-Theme Switcher (Dark/Light/Custom)
   └── Rebuild AI Prompt Generator (Cursor, Claude Code, ChatGPT)

   PHASE 3: ENTERPRISE & ECOSYSTEM
   ├── Cloud Team Workspaces & Shared Asset Libraries
   ├── Figma Design Token Plugin
   └── Stripe Organization Billing & Multi-Seat Subscriptions
```

---

## 4. User Stories (MVP Scope)

### US-1: URL Import & Design DNA Extraction
* **As a** developer or designer,
* **I want to** paste any public website URL into the Remake dashboard,
* **So that** I can automatically extract its design tokens (colors, font families, font sizes, spacing scale, border radii, and button styles) without installing a browser extension.

### US-2: Visual Style Guide & Token Inspection
* **As a** user,
* **I want to** view a structured visual overview of the extracted Design DNA,
* **So that** I can inspect computed color swatches, typography hierarchy, and spacing tokens in an organized interface.

### US-3: Interactive Remake Studio Canvas
* **As a** creator,
* **I want to** open the extracted layout inside an interactive web-based canvas,
* **So that** I can click on text headers to edit copy inline, reorder page sections, and preview responsive views (Desktop, Tablet, Mobile).

### US-4: Clean Next.js + Tailwind Export
* **As a** developer,
* **I want to** export the extracted design system as `tokens.json`, `tailwind.config.js`, `DESIGN.md`, and clean Next.js React (`.tsx`) components,
* **So that** I can immediately paste the production-ready code into my project repo without cleaning up junk CSS.

### US-5: Cloud Project Dashboard
* **As a** user,
* **I want to** save my imported projects to my cloud dashboard,
* **So that** I can return to previous Remakes, edit layouts, and re-export code at any time.

---

## 5. Functional Requirements & Specifications

### 5.1 URL Import & Scraping Engine (Backend)
* **FR-1.1**: Accept valid HTTP/HTTPS URLs via the web dashboard.
* **FR-1.2**: Utilize headless browser automation (Playwright/Puppeteer) to load the target webpage, execute JavaScript, and compute final CSS styles.
* **FR-1.3**: Extract unique computed color variables (HEX/RGB), mapped font family declarations, typography scales (H1–H6, Body), spacing paddings/margins, border radii, and button variants.
* **FR-1.4**: Normalize raw DOM styles into standard Tailwind utility classes (e.g., `rgb(59, 130, 246)` $\rightarrow$ `bg-blue-500`, `24px` $\rightarrow$ `text-2xl` / `p-6`).

### 5.2 Remake Studio Canvas (Frontend)
* **FR-2.1**: Render a live, sandboxed preview of the extracted webpage sections using clean React components.
* **FR-2.2**: **Inline Text Editing**: Clicking any text element opens an inline editor enabling instant copy modifications.
* **FR-2.3**: **Section Management**: Ability to reorder, duplicate, or delete major page sections (Hero, Features, Testimonials, CTA, Footer).
* **FR-2.4**: **Responsive Viewport Toggle**: Switch canvas viewport between Desktop (1440px), Tablet (768px), and Mobile (375px).

### 5.3 Code & Token Export Engine
* **FR-3.1**: **`tokens.json`**: Structured JSON file containing design tokens (colors, font-families, font-sizes, spacing-scale, radii).
* **FR-3.2**: **`tailwind.config.js`**: Production-ready Tailwind configuration extending `theme.extend` with extracted colors, font families, and custom spacing.
* **FR-3.3**: **`DESIGN.md`**: Markdown specification formatted for AI coding assistants (Cursor rules, `CLAUDE.md`, `AGENTS.md`).
* **FR-3.4**: **Next.js React Component (`Page.tsx`)**: Clean React functional component using Tailwind CSS utility classes and semantic JSX elements.

---

## 6. Information Architecture & UX Wireframes

### 6.1 Application Structure
```
Remake SaaS Platform
├── / (Marketing Landing Page)
├── /dashboard (Projects & Quick Import)
├── /import (URL & Screenshot Input Modal/Page)
├── /studio/[id] (Interactive Remake Studio Canvas)
│   ├── Left Sidebar: Design DNA Tokens (Colors, Type, Spacing)
│   ├── Center Canvas: Interactive Page Viewport & Section Builder
│   ├── Right Sidebar: Section Inspector & Theme Controls
│   └── Top Bar: Viewport Switcher, Undo/Redo, Export Button
└── /settings (Account, Subscription, Cloud Storage)
```

### 6.2 Layout Wireframe: Remake Studio (`/studio/[id]`)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  REMAKE STUDIO  │ Project: Linear Landing  │ [ Desktop | Tablet | Mobile ] │ [ Save ] [ Export Code ↓ ]│
├─────────────────┴──────────────────────────────────────────────────────────┴─────────────────────┤
│ LEFT PANEL: DESIGN DNA         │ CENTER CANVAS: INTERACTIVE VIEWPORT           │ RIGHT PANEL: INSPECTOR│
├────────────────────────────────┼───────────────────────────────────────────────┼───────────────────────┤
│ 🎨 COLOR PALETTE               │ ┌───────────────────────────────────────────┐ │ ⚙️ SECTION SETTINGS   │
│  ├── Primary: #533AFD         │ │ HERO SECTION                              │ │  ├── Section: Hero    │
│  ├── Surface: #FFFFFF         │ │                                           │ │  ├── Padding: py-20   │
│  └── Accent:  #8AB4FF         │ │ [H1] Re-Architect Web Apps Faster          │ │  └── Bg: bg-slate-900 │
│                                │ │ [Text] Build clean Next.js UI from design. │ │                       │
│ 🔤 TYPOGRAPHY HIERARCHY        │ │ [Button: Primary] Get Started Free        │ │ 🎯 THEME CONTROLLER   │
│  ├── Display: Geist (64px)     │ └───────────────────────────────────────────┘ │  ├── [Light Mode]     │
│  ├── Heading: Geist (32px)     │ ┌───────────────────────────────────────────┐ │  ├── [Dark Mode]      │
│  └── Body: Inter (16px)        │ │ FEATURES GRID                             │ │  └── Theme: Midnight  │
│                                │ │ ┌──────────┐ ┌──────────┐ ┌──────────┐    │ │                       │
│ 📐 SPACING & RADII             │ │ │ Card 1   │ │ Card 2   │ │ Card 3   │    │ │ 📄 AI PROMPT GENERATOR│
│  ├── Container: 1280px         │ │ └──────────┘ └──────────┘ └──────────┘    │ │  ├── [Cursor Prompt]  │
│  ├── Radius: rounded-xl (12px) │ └───────────────────────────────────────────┘ │  └── [Claude Prompt]  │
│  └── Grid Gap: gap-6           │                                               │                       │
└────────────────────────────────┴───────────────────────────────────────────────┴───────────────────────┘
```

---

## 7. Technical Architecture & Data Schema

### 7.1 Tech Stack
* **Frontend Framework**: Next.js 15 (App Router, React 19)
* **Styling**: Tailwind CSS v3/v4 + Shadcn UI
* **State Management**: Zustand (for Studio canvas state and active tokens)
* **Canvas Framework**: Custom React iframe sandbox + Tailwind runtime renderer
* **Headless Scraping**: Playwright running on Node.js serverless/worker runtime
* **Database & Auth**: Supabase (PostgreSQL + Row Level Security + Auth)
* **Payment Processor**: Stripe API (Subscription tiers: $0 Free, $12 Pro, $29 Team)

### 7.2 Database Schema (PostgreSQL / Supabase)

#### Table: `profiles`
* `id`: `uuid` (Primary Key, references `auth.users`)
* `email`: `text`
* `plan_tier`: `text` (`'free'`, `'pro'`, `'team'`)
* `imports_count`: `integer` (Default: `0`)
* `created_at`: `timestamp`

#### Table: `projects`
* `id`: `uuid` (Primary Key)
* `user_id`: `uuid` (References `profiles.id`)
* `name`: `text`
* `source_url`: `text`
* `design_dna`: `jsonb` (Stores extracted palette, typography, spacing, radii)
* `canvas_sections`: `jsonb` (Stores tree structure of editable page sections)
* `created_at`: `timestamp`
* `updated_at`: `timestamp`

---

## 8. Non-Functional Requirements & Security

1. **Performance**: URL Design DNA extraction complete within < 8 seconds. Studio Canvas render latency < 100ms on element interaction.
2. **Clean Code Guarantee**: Generated React code passes ESLint with zero unused imports or invalid inline styles.
3. **Security & RLS**: Supabase Row Level Security enforced so users can only access their own cloud projects.
4. **Ethical Compliance**: Crawling engine respects standard robots.txt restrictions and does not scrape authenticated personal user data.
