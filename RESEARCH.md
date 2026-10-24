# RESEARCH & STRATEGIC PRODUCT REPORT

---

## 1. Simple Summary: What SitePeel Does

**SitePeel** is a developer/designer browser extension and web utility designed to extract, inspect, and clone website frontend elements and design tokens.

* **Core Utility**: Chrome/Chromium extension (plus web tools) for copying frontend HTML/CSS, extracting design tokens, capturing screenshots, and feeding design context into AI coding assistants.
* **Key Capabilities (12–13 Tools)**:
  1. **Clone Page**: Exports rendered HTML, styles, and asset links as a static offline page snapshot.
  2. **Pick Element**: Selects a specific element on the page and extracts isolated HTML + CSS.
  3. **Design MD Generator**: Extracts design tokens (colors, fonts, line-heights, spacing, radii) into a `DESIGN.md` file formatted for AI agents (Cursor, Claude Code, Windsurf).
  4. **Extract Assets**: Scrapes and downloads images, SVGs, videos, 3D models (`.glb`, `.gltf`), and Lottie animations.
  5. **Extract Colors**: Scrapes rendered computed colors and exports palettes in CSS/JSON format.
  6. **Detect / Find Fonts**: Identifies active fonts, font weights, line heights, and Google Font links.
  7. **Swap Fonts**: Previews 2,100+ alternative fonts live on any target webpage.
  8. **Inspect & Measure**: Measures dimensions, padding, margins, and distance between DOM elements.
  9. **Design Prompt Generator**: Converts a page's structure and styles into an AI build prompt (optional connection to custom LLM API keys).
  10. **Edit Text**: Modifies page typography inline for quick copy testing.
  11. **Move & Delete Layout**: Visually rearranges or deletes DOM elements on live sites.
  12. **Responsive Viewer**: Previews side-by-side viewports (Mobile, Tablet, Desktop) with zoom and screenshot.
  13. **Full-Page Screenshot & Capture Editor**: Captures full-page/section views, blurs sections, crops, and annotates.

---

## 2. Link-by-Link Breakdown, Pricing, and Free Tools

### A. Link Analysis

1. **`https://sitepeel.dev` (Homepage)**
   * **Focus**: Headline pitch ("Free tools to clone any website"), quick URL inputs for free online extractors, community gallery of `DESIGN.md` files, and integration list for AI agents (Claude Code, Cursor, Codex, Copilot, Windsurf).
   * **Key Highlight**: Demonstrates how `DESIGN.md` files guide AI agents to match brand styles.

2. **`https://sitepeel.dev/guides/` (Knowledge Base - 66 Guides)**
   * **Focus**: Comprehensive tutorials categorized into *Start Here*, *DESIGN.md & AI*, *Code & Cloning*, *Assets & Screenshots*, *Responsive*, *Fonts & Colors*, and *Comparisons*.
   * **Key Takeaways**: Educates users on integrating `DESIGN.md` into AI rules (`.cursor/rules`, `CLAUDE.md`, `AGENTS.md`), fixing broken cloned animations, and performing competitive comparisons against tools like CSS Scan, CSS Peeper, and Hoverify.

3. **`https://sitepeel.dev/extension/` (Chrome Extension Landing)**
   * **Focus**: Showcases the 13 inline extension tools, sidebars/dock modes, responsive testing, and asset downloading.
   * **Target Audience**: Web developers, UI/UX designers, and prompt engineers who work directly in Chromium browsers (Chrome, Edge, Brave).

4. **`https://sitepeel.dev/design-md/` (DESIGN.md Portal & Gallery)**
   * **Focus**: Public registry/gallery of 198+ crowd-extracted brand design systems (e.g., Stripe, Linear, Vercel, Grammarly).
   * **Key Structure**: Documents token schemas (`colors`, `typography`, `rounded`, `spacing`) passing an official `DESIGN.md` linter.

5. **`https://sitepeel.dev/free-tools/` (Web Tools Directory)**
   * **Focus**: 9 browser-accessible tools requiring no extension installation:
     * *DESIGN.md Generator*, *Clone Prompt*, *AI Slop Checker* (scores site genericness), *Asset Extractor*, *Responsive Checker*, *Website Screenshot*, *What Font Is This?*, *Color Palette Generator*, *Tech Stack Finder* (Wappalyzer equivalent).

6. **`https://sitepeel.dev/#pricing` (Pricing & Licensing)**
   * **Free Tier**: Free browser tools (9 web utilities) with usage rate limits; free install of Chrome Extension with a 24-hour trial of extension features.
   * **Lifetime License ($15 one-time purchase)**: Unlocks all 13 extension tools, unlimited asset extractions, unlimited `DESIGN.md` generations, cloud library saves, and future updates. No subscription fees.

---

## 3. SitePeel's Weaknesses and Gaps

1. **Raw "Copy-Paste Junk CSS" Output**:
   * SitePeel captures raw computed DOM styles. This results in bloated, unmaintainable CSS with non-standard class names, redundant property declarations, and missing dynamic state classes.
2. **Brittle Page Snapshot Cloning**:
   * Cloned pages break on complex JavaScript interactions, GSAP animations, canvas elements, dynamic React/Vue hydration states, and backend endpoints.
3. **Extension-First Bottleneck & Platform Lock-In**:
   * Requires desktop Chromium browsers. It lacks a centralized SaaS web app where teams can collaborate, visually edit layouts, or maintain dynamic design systems without extension overhead.
4. **No Modern Code Component Export**:
   * Out of the box, SitePeel produces standard raw HTML/CSS. It cannot export clean, semantic **Tailwind CSS**, modular **Next.js React** components, or clean TSX design tokens.
5. **No Visual Layout Builder or Design Re-Architecting**:
   * SitePeel provides rudimentary DOM deletion/text editing on live pages, but lacks a full visual canvas editor to customize, rebuild, or re-theme site sections.
6. **Ethical & Legal Risks ("Cloning" Stereotype)**:
   * By positioning itself around "cloning" and copy-pasting existing sites, SitePeel leans into grey-market scraper perception rather than offering an ethical, clean design system extraction and re-architecture suite.

---

## 4. Our Strategic Vision: Ethical Design DNA Extraction & Remake SaaS Platform

> **Core Strategic Shift**: We are NOT building a SitePeel clone or Chrome extension scraper. We are building an **Ethical Rebuild SaaS Platform** focused on **Extracting Design DNA, Visual Remake Editing, and Clean Next.js + Tailwind Rebuilds**.

### Strategic Principles
* **Brand Language**: Strictly eliminate scraping terminology ("peel", "clone", "rip"). Use creative, professional terms: **"Import URL"**, **"Extract Design DNA"**, **"Remake Studio"**, **"Design DNA Engine"**.
* **Zero Junk Code / Pure Component Architecture**: Remove raw HTML/CSS copying. Export *only* clean `tokens.json`, `tailwind.config.js`, `DESIGN.md`, and semantic **Next.js (React) TSX** components.
* **3 Killer Differentiators**:
  1. **Screenshot / Dribbble to Live Website**: Upload any design concept or image to extract design DNA and generate an editable Next.js site layout.
  2. **Brand DNA Score**: AI evaluates brand consistency across colors, typography scales, contrast, and spacing, proposing actionable design improvements.
  3. **One-Click Theme Switcher**: Instantly re-theme extracted designs into Dark/Light modes, 5+ curated color themes, or modern variable font scales.
* **Full Legal Moat**: Focus exclusively on non-copyrightable design tokens and AI structural prompts. By avoiding direct asset scraping or raw HTML copy-pasting, we maintain 100% legal, ethical integrity.

---

## 5. Comparison Table: SitePeel vs. Our SaaS Platform

| Feature / Dimension | **SitePeel** | **Our SaaS Platform** | **Why We Are Different** |
| :--- | :--- | :--- | :--- |
| **Product Model** | Extension Scraper | **Web SaaS Platform** | We are a cloud creation workspace, not a browser plugin scraper. |
| **Philosophy** | Direct page cloning | **Ethical Rebuild Platform** | We re-architect design systems ethically rather than copy-pasting existing sites. |
| **Primary Workflow** | Copy raw DOM HTML/CSS | **URL Import $\rightarrow$ Design DNA Extract $\rightarrow$ Visual Remake** | We extract design tokens and build clean Next.js/Tailwind components. |
| **Code Output** | Raw computed CSS & inline HTML | **`tokens.json` + `tailwind.config.js` + Clean Next.js Components** | Zero junk CSS. Production-ready React components styled with Tailwind utilities. |
| **Image / Screenshot Input**| None | **Screenshot / Dribbble to Live Site** | Turns static design screenshots into interactive, editable web pages. |
| **Visual Editing** | Minor DOM text editing | **Visual Remake Studio Canvas** | Full interactive canvas to tweak themes, layout sections, and typography. |
| **Brand Intelligence** | None (Basic "AI Slop Score") | **Brand DNA Score & AI Engine** | Evaluates design system health, contrast ratios, and typography consistency. |
| **Theming** | Font swap only | **One-Click Theme Switcher** | Switch light/dark mode and color schemes across the whole canvas in 1 click. |
| **Collaboration & Storage** | Local browser storage | **Cloud Workspaces & Team Libraries** | Centralized project management and design token sharing for teams. |
| **Business Model** | $15 Lifetime one-time fee | **Freemium SaaS Subscription** | $0 Free / $12 Pro / $29 Team with continuous cloud capabilities. |

---

## 6. Phased Product Roadmap

### Phase 1: MVP Core
* **URL Import**: Web-based URL input to scrape design system metrics.
* **Design DNA Extraction**: Automated generation of `tokens.json`, `tailwind.config.js`, `DESIGN.md`, and visual style guide.
* **Visual Remake Studio**: Interactive web canvas for inline text editing and section layout preview.
* **Clean Code Export**: One-click download of Next.js TSX components and Tailwind configuration.

### Phase 2: Intelligence & AI Expansion
* **Screenshot / Dribbble to Live Website**: Image recognition engine converting static UI designs into editable Next.js canvas layouts.
* **Brand DNA Score**: Automated design system health and consistency auditing.
* **One-Click Theme Switcher**: Multi-theme preview engine (Light, Dark, Cyberpunk, Minimalist, Pastel).
* **AI Prompt Engine**: Rebuild prompt generators for Cursor, Claude Code, and ChatGPT.

### Phase 3: Team & Design Ecosystem
* **Cloud Workspaces & Storage**: Shared cloud project libraries and team access controls.
* **Figma Token Plugin**: Export design tokens directly into Figma styles and design systems.
* **Stripe Team Subscriptions**: Multi-seat organization management and usage quotas.
