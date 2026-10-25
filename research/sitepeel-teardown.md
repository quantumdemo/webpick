# SITEPEEL.DEV DEEP TEARDOWN REPORT

**Target Site:** https://sitepeel.dev
**Date of Crawl & Audit:** October 2026 / Current Audit
**Auditor:** WebPicks Engineering & Research

---

## EXECUTIVE SUMMARY & CRAWL DATA

`sitepeel.dev` is a developer/designer utility tool that positions itself as "Free tools to clone any website" and "13 tools in one Chrome extension". Its core proposition is extracting visual and technical design tokens—colors, fonts, asset URLs, layout dimensions, and computed styles—from target URLs and converting them into a structured `DESIGN.md` specification file or LLM system prompts for coding assistants (Antigravity, Cursor, Claude Code, ChatGPT).

### Key Metadata & Landing Page Extraction
* **Headline:** "Free tools to clone any website."
* **Subheadline:** "Paste a link to get a prompt that rebuilds it with AI, plus its DESIGN.md style guide, assets, fonts and colors."
* **Hero Input Placeholder:** `"Paste a link, like raycast.com"` (Dynamic rotation: `linear.app`, `stripe.com`, `vercel.com`, `notion.com`, `apple.com`, `framer.com`, `airbnb.com`, `spotify.com`, `figma.com`).
* **CTA Buttons:**
  * Header/Hero: `Start for free`, `Add to Chrome` (Links directly to Chrome Web Store: `id/khcjkaobanoeohahnlffnnppinoeljme`).
  * Tool Selector Tabs: `DESIGN.md`, `Clone prompt`, `AI slop checker`, `Assets`, `Responsive`, `Screenshot`, `Fonts`, `Colors`, `Tech stack`.
* **Pricing & Paywall Structure:**
  * **Free Tier:** 9 web-based tools on sitepeel.dev. Allows anonymous web runs with rate limiting & Cloudflare Turnstile bot protection.
  * **Paid Tier:** $15 Launch Price ($19 regular) one-time lifetime payment (powered by Stripe / Checkout). Includes all 13 tools in the Chrome Extension, unlimited clone prompts/DESIGN.md generation, unlimited asset downloads, cloud library sync, and future updates.
* **Footer & Related Links:**
  * Direct links to tools: `DESIGN.md generator`, `Clone prompt`, `AI slop checker`, `Asset extractor`, `Responsive checker`, `Website screenshot`.
  * Account & Legal: `Your account`, `Privacy`, `Terms`, `Refunds`, `Privacy choices`.
  * Launch/Directory Badges: Listed on BetterLaunch, ScrollLaunch, Foundrlist, FrogDR, ToolFame, Findly Tools, Startup Fame, Smol Launch, etc.
* **Meta Tags & Scripts Loaded:**
  * Meta Description: *"Free tools for web developers: turn any website into a DESIGN.md, check it for AI slop, download its assets and test every screen size."*
  * Social Card Image: `https://sitepeel.dev/images/sitepeel-social.png`
  * Theme Color: `#0B0B0D`
  * Analytics & Tracking: Google Tag Manager (`G-JVVV1KHD2L`), Cloudflare Web Analytics (`rum`), Custom client-side telemetry (`analytics.js`, `analytics-provider.js`).
  * Bot Security: Cloudflare Turnstile (`challenges.cloudflare.com/turnstile/v0/api.js`).

---

## 1. USER FLOW MAPPING & NETWORK / API AUDIT

### Step-by-Step User Flow
1. **User Pastes URL into Web Tool (`/design-md/`, homepage, or `/free-tools/`):**
   * Input field validates domain syntax (e.g., `linear.app` or `https://linear.app`).
   * Fetches site favicon dynamically via `/api/tools/icon?host=<host>`.
2. **Bot Check & Security Handshake:**
   * Triggers `SitepeelFormProtection` (`form-protection.js`).
   * Fetches ephemeral token parameters from `/api/forms/options`.
   * Renders Cloudflare Turnstile explicitly in interaction-only or invisible mode to obtain a single-use token.
3. **Form Submission & API Call:**
   * Sends `POST` request to `/api/design-md/generate` with payload: `{ url, listed, token, fresh }`.
   * For other sub-tools, uses internal POST endpoints or client-side handoff storage (`indexedDB: sitepeel-handoff`).
4. **Execution & Rate Limit Checking:**
   * Calls `/api/tools/allowance?kind=<kind>&url=<url>` to verify if the client has free usage allowance remaining.
   * If allowed, server-side Playwright/Puppeteer renders the target URL, extracts computed styles, records screenshots, and processes design tokens.
5. **Loading State & Handoff:**
   * Button displays busy state with spinner: `aria-busy="true"`.
   * Handoff mechanism uses client-side IndexedDB (`sitepeel-handoff`, object store `runs`) to persist megabyte-sized JSON payloads between page transitions without secondary loading triggers.
6. **Result Display:**
   * **Full Page Preview:** Displays page screenshot thumbnail (`/design-md/<domain>/screenshot.jpg`).
   * **Color Palette:** Grouped by semantic roles (surfaces, text, accents, borders, status, gradients) with hex codes, WCAG contrast ratios (e.g. `18.7:1`), frequency of occurrence ("seen 20 times"), and token mappings.
   * **Typography Breakdown:** Lists font families (e.g. `Inter Variable`, `Berkeley Mono`), weights (e.g. `510`, `400`), sizes, line heights, letter spacing, and CSS variables.
   * **Layout & Elevation:** Spacing scale (`4px`, `8px`, `12px`, `24px`, `128px`), border radii (`4px`, `8px`, `9999px`), inset highlight shadows.
   * **Component Specs:** Button primary/outline/ghost, input fields, cards, links with CSS token values (`backgroundColor`, `textColor`, `padding`, `height`).
   * **Design Guidelines:** Auto-generated "Do's and Don'ts" and motion curves.
7. **Export & Paywall Behavior:**
   * **Copy Code:** One-click copy for YAML/Markdown frontmatter + `DESIGN.md` content.
   * **Free Limit / Paywall:** Anonymous users can generate basic specs and prompts for featured/cached sites. Running on fresh un-cached links triggers rate limits or prompts sign-in / Chrome Extension purchase ($15 lifetime) for unlimited runs and asset zips.

---

## 2. ALL FEATURES TABLE & EQUIVALENTS

| Feature | What Sitepeel Does | How We Think It's Built | Our WebPicks Equivalent |
| :--- | :--- | :--- | :--- |
| **DESIGN.md Generator** | Extracts full design system into standard Markdown specification (`DESIGN.md`). | Server-side Playwright script traversing DOM, running `window.getComputedStyle()` on all visible elements, mapping to token schema. | **Design DNA Engine:** Advanced computed style extractor generating clean `DESIGN.md`, Tailwind v4 config, and Shadcn UI theme tokens. |
| **Clone Prompt Generator** | Writes system prompts optimized for Cursor, Claude Code, ChatGPT, Antigravity. | Template engine formatting extracted `DESIGN.md` tokens into structured markdown LLM instructions. | **PromptForge AI:** Multi-file prompt generator (Cursor `.cursorrules`, Claude `CLAUDE.md`, Windsurf, Copilot) with exact step-by-step component building guidelines. |
| **Asset Extractor** | Finds images, SVGs, videos, 3D models (`.glb`), Lottie animations, fonts. | Evaluates page DOM, CSS `background-image`, `<picture>`, `<svg>`, `<video>`, and network traffic during headless render. | **AssetVault Pro:** Full asset pipeline extracting SVGs, WebP images, Lottie, 3D models, plus automatically optimizing and vectorizing raster icons. |
| **AI Slop Checker** | Calculates "Slop Score" (/100) identifying generic AI template tropes (indigoblur blobs, generic 3-icon cards). | Pattern matching on CSS classes, generic gradient patterns, text semantics, and component structural repetitive patterns. | **Design Authenticity Inspector:** Heuristic & LLM review checking contrast, UX anti-patterns, generic AI signatures, and accessibility compliance. |
| **Responsive Screen Checker** | Multi-device preview framing (Mobile, Tablet, Desktop, Foldable side-by-side). | Embeds iframe previews or takes multi-viewport headless screenshots at set device dimensions. | **Live Responsive Canvas:** Interactive synced multi-device preview environment with DOM event mirroring and viewport breakpoint debugger. |
| **Full Page Screenshot** | Captures page scroll screenshot with frame/crop/blur tools. | Playwright `page.screenshot({ fullPage: true })` + Canvas/SVG markup overlay editor. | **PixelCapture HD:** Full-page vector PDF / WebP screen capture with blur zones, annotation tools, and Figma auto-frame export. |
| **Font Detection** | Lists font families, weights, letter spacing, font sources (Google Fonts, Adobe). | Evaluates `document.fonts` API and computed `font-family` / `@font-face` CSS rules. | **FontExtractor & Type Scale:** Direct link detection + downloadable font files / Google Fonts import statements and fluid type scale specs. |
| **Color Palette Extraction** | Groups colors into surfaces, text, accents, borders with contrast ratios. | RGB clustering algorithm on DOM background/color styles + WCAG 2.1 contrast formula. | **Design DNA Palette:** Full OKLCH / HSL color system generation, dark/light theme pairing, and automatic WCAG AA/AAA contrast fixing. |
| **Tech Stack Detector** | Identifies framework, hosting, libraries, UI kits. | Analyzes HTTP response headers, meta tags, script tags, JS global objects (e.g. `window.__NEXT_DATA__`, `window.Framer`). | **StackTrace Inspector:** Deep JS AST analyzer identifying React/Next.js versions, Tailwind, Radix/Shadcn, Framer Motion, and state libraries. |
| **Chrome Extension** | Browser side-dock / popup giving instant access to all tools on active tab. | Manifest V3 Chrome Extension injecting content script to inspect DOM and communicate with background service worker. | **WebPicks Studio Extension:** MV3 extension with instant Figma layer export, live Tailwind class picker, and 1-click React component copier. |

---

## 3. TECH STACK INFERENCE

Based on client JS bundle inspection, server responses, CSS structure, and HTML source:

```
[ Frontend Shell ]
  - Framework: Custom Static HTML / Server-Rendered Next.js (App Router, SSG output) with lightweight Vanilla JS client controllers (`free-tools.js`, `design-md.js`, `library-client.js`).
  - Styling: Native CSS variables (`ui.css`, `free-tools.js`, `pages-ui.css`, `design-md-ui.css`) using custom dark UI design system. Geist Sans & Geist Mono typography.
  - Client Storage: IndexedDB (`sitepeel-handoff`) for zero-latency multi-megabyte payload transfers across page views.
  - Security: Cloudflare Turnstile (`form-protection.js`).

[ API & Edge Tier ]
  - API Routes: Next.js API Routes / Cloudflare Workers (`/api/design-md/generate`, `/api/tools/allowance`, `/api/tools/icon`, `/api/forms/options`).
  - Auth & Refresh: JWT / Cookie-based session handling (`/api/auth/refresh`, `/api/library/*`).

[ Extractor Engine (Backend) ]
  - Playwright / Puppeteer Core: Headless Chromium running on serverless containers (Vercel Serverless / AWS Lambda / Modal) or dedicated browser cluster.
  - Execution Method: Server-side rendering of URL -> Computed style extraction script -> JSON token assembly -> Markdown / Image generator.
```

### Key Technical Evidence
1. **No `__NEXT_DATA__` JSON block in page HTML:** Indicates Next.js App Router (Static Generation or Server Components) or static HTML export.
2. **Vanilla JS Bundles:** Highly optimized client scripts without heavy framework overhead (e.g., `free-tools.js` is ~31KB standalone JS).
3. **IndexedDB Handoff (`sitepeel-handoff`):** Solves the browser memory limit when passing heavy Playwright DOM extraction JSON data between `/free-tools/` and specific result pages.

---

## 4. ARCHITECTURE DIAGRAM

```
+-----------------------------------------------------------------------------------+
|                                 USER BROWSER                                      |
|  [ Web Client / Chrome MV3 Extension ]                                            |
|    |                                                                              |
|    +--> 1. Submits URL (e.g. linear.app) + Cloudflare Turnstile Token             |
+----+------------------------------------------------------------------------------+
     |
     v
+-----------------------------------------------------------------------------------+
|                             NEXT.JS / CLOUDFLARE API LAYER                        |
|  - Rate Limiter & Allowance Checker (`/api/tools/allowance`)                       |
|  - Auth Manager (`/api/auth/refresh`)                                              |
|  - Token Validator (`/api/forms/options`)                                         |
+----+------------------------------------------------------------------------------+
     |
     +---> [ Cache Hit? ] ---> Return pre-generated DESIGN.md from CDN/DB
     |
     +---> [ Cache Miss ]
           |
           v
+-----------------------------------------------------------------------------------+
|                         HEADLESS BROWSER EXTRACTOR CLUSTER                        |
|  (Serverless Playwright / Chromium)                                               |
|                                                                                   |
|  1. Page Load & Wait (`networkidle` / `domcontentloaded`)                          |
|  2. Execute Injected In-Browser Script:                                           |
|     - `window.getComputedStyle(el)` across DOM nodes                              |
|     - Extract CSS variables, typography, colors, padding, borders                 |
|     - Identify fonts, images, SVGs, Lottie, 3D GLB assets                         |
|  3. Capture Full-Page Screenshot (`page.screenshot`)                              |
+----+------------------------------------------------------------------------------+
     |
     v
+-----------------------------------------------------------------------------------+
|                             TOKEN PARSER & COMPILER                               |
|  - Color Clustering & Semantic Token Assignment (surface, text, accent)            |
|  - WCAG 2.1 Contrast Calculator                                                   |
|  - Layout Scale Inferrer (spacing, radii, line-heights)                           |
|  - Markdown Specification Synthesizer (`DESIGN.md` generator)                      |
|  - LLM System Prompt Generator (Cursor / Claude / ChatGPT templates)              |
+----+------------------------------------------------------------------------------+
     |
     v
+-----------------------------------------------------------------------------------+
|                               RESPONSE & STORAGE                                  |
|  1. Save Result to Database / S3 Asset Storage                                    |
|  2. Pass JSON payload to Client -> Stored in Client `IndexedDB (sitepeel-handoff)`|
|  3. Render UI Views & One-Click Copy Handlers                                     |
+-----------------------------------------------------------------------------------+
```

---

## 5. GAP LIST FOR WEBPICKS TO WIN

### A. 5 Features We Must Copy Exactly
1. **`DESIGN.md` Output Standard:** Generating a concise, standardized Markdown file with frontmatter specs that AI coding assistants (Cursor, Claude Code) natively understand.
2. **Instant Multi-Tool Tab Navigation:** Seamless UI allowing users to switch between Colors, Fonts, Assets, Tech Stack, and Prompts without re-running the extraction script.
3. **IndexedDB Client Handoff:** Storing large page extraction payloads in client IndexedDB (`sitepeel-handoff`) to allow instant navigation and refresh tolerance without double-triggering API calls.
4. **Single-Payment Chrome Extension Integration:** Providing an MV3 Chrome extension that brings extraction directly into the active browser tab.
5. **Color Semantic Role Clustering:** Grouping detected hex codes into clear functional buckets (Surfaces, Text, Accents, Borders, Status) with occurrence counts and contrast scores.

---

### B. 5 Features Sitepeel Misses That WebPicks Will Build to Be Superior

| Gap / Sitepeel Limitation | Why It Matters to Users | How WebPicks Will Do It Better |
| :--- | :--- | :--- |
| **1. Sitepeel exports raw DOM computed styles rather than modular React/Tailwind code.** | Sitepeel gives color lists and YAML tokens, requiring the developer to manually write component code from scratch. | **Clean React 19 + Tailwind v4 + Shadcn Export:** WebPicks compiles extracted Design DNA directly into production-ready TSX React components with clean Tailwind v4 utility classes and zero inline style bloat. |
| **2. Sitepeel lacks Component Interactive State Extraction (Hover, Focus, Active, Disabled).** | Sitepeel only captures the static default state of buttons/cards. Hover overlays, focus rings, and active press states are completely lost. | **Interactive State Simulator:** WebPicks programmatically triggers `:hover`, `:focus-visible`, `:active`, and `[disabled]` states during Playwright evaluation to capture complete interactive component states. |
| **3. Sitepeel cannot handle JS-heavy / Auth / Canvas web apps (e.g. SportyBet, Stripe Dashboard, WebGL).** | Standard headless renders fail or show blank screens on complex SPA dashboards, canvas elements, or dynamic state pages. | **Hybrid Screenshot + Canvas AI DNA Parser:** WebPicks combines DOM inspection with Vision-LLM screenshot analysis, enabling flawless extraction from screenshots, Figma designs, Behance, and dynamic JS dashboards. |
| **4. Sitepeel does not fix WCAG contrast or spacing scale inconsistencies.** | Sites often have broken contrast ratios (e.g., 3.5:1 text) or messy random pixel values (`11px`, `13.33px`, `7px`). Sitepeel dumps these raw errors. | **Smart Auto-Harmonizer & WCAG Fixer:** WebPicks automatically snaps irregular spacing to clean 4px/8px scales and suggests contrast-compliant AA/AAA color token alternatives in 1-click. |
| **5. Sitepeel has no direct Figma Export or Clean Next.js 15 Starter Package.** | Developers and designers have to copy-paste code snippets or YAML manually into their project structure. | **1-Click Figma & Next.js Boilerplate Sync:** WebPicks provides a direct "Export to Figma" plugin bridge and generates a downloadable Next.js 15 / Tailwind v4 GitHub starter zip. |

---

## 6. DELIVERABLES SUMMARY & ACTION PLAN

1. **Feature Breakdown:** Documented all 9 web tools + 13 extension tools, paywall structure, and user flows.
2. **Architecture:** Detailed Playwright headless evaluation -> API Layer -> IndexedDB handoff -> Token compiler pipeline.
3. **Competitive Strategy:** WebPicks will defeat Sitepeel by moving beyond static markdown text specifications to **Computed Code Generation (React 19 + Tailwind v4), Multi-State Capture, Vision-LLM Hybrid Parsing, and Figma/Next.js native exports.**
