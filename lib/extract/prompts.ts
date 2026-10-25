export interface PromptSuite {
  cursorRules: string;
  claudeMd: string;
  chatGpt: string;
  windsurf: string;
}

export function generatePromptSuite(siteName: string, designMd: string): PromptSuite {
  const cursorRules = `# .cursorrules for ${siteName} Rebuild

You are an expert Frontend AI Developer building a clone of ${siteName}.
Adhere strictly to the design system specified below:

${designMd}

## Rules & Coding Standards
1. Use React 19, Next.js 15 App Router, and Tailwind CSS v4.
2. Maintain high accessibility standards (WCAG AA).
3. Do not introduce arbitrary colors or unapproved font stacks.
4. Keep component code modular, fully typed with TypeScript, and free of inline style pollution.
`;

  const claudeMd = `# CLAUDE.md - ${siteName} Project Instructions

## Design Tokens & System Specifications
${designMd}

## Guidelines for Claude Code CLI
- Always check component interactive states (hover, focus, disabled).
- Use Tailwind CSS v4 classes without legacy inline hacks.
- Ensure all pages are responsive across mobile (390px), tablet (768px), and desktop (1440px).
`;

  const chatGpt = `System Prompt for ChatGPT / Custom GPT:

You are a UI/UX expert helping rebuild ${siteName}. Use the following DESIGN.md design specification as your single source of truth for all code recommendations, colors, fonts, and component structures:

${designMd}
`;

  const windsurf = `# Windsurf AI Workspace Context - ${siteName}

Use the extracted Design DNA tokens below to construct clean React components:

${designMd}
`;

  return { cursorRules, claudeMd, chatGpt, windsurf };
}
