// In-memory mock database store for standalone runtime execution
import { ProjectRecord } from "./supabase";

class MockStore {
  private projects: Map<string, ProjectRecord> = new Map();

  constructor() {
    // Seed with a default demo project
    const demoId = "demo-linear";
    this.projects.set(demoId, {
      id: demoId,
      url: "https://linear.app",
      name: "Linear App",
      status: "completed",
      created_at: new Date().toISOString(),
      tokens_json: {
        colors: [
          { hex: "#0F1015", rgb: "rgb(15, 16, 21)", name: "Primary Surface" },
          { hex: "#5E6AD2", rgb: "rgb(94, 106, 210)", name: "Brand Accent" },
          { hex: "#F7F8F8", rgb: "rgb(247, 248, 248)", name: "Text Primary" },
          { hex: "#8A8F98", rgb: "rgb(138, 143, 152)", name: "Text Muted" },
          { hex: "#191B22", rgb: "rgb(25, 27, 34)", name: "Card Surface" },
          { hex: "#2E303A", rgb: "rgb(46, 48, 58)", name: "Border Subtle" }
        ],
        typography: {
          fontFamilies: ["Inter", "Geist", "sans-serif"],
          headings: [
            { tag: "H1", fontSize: "56px", fontWeight: "600", lineHeight: "1.1" },
            { tag: "H2", fontSize: "36px", fontWeight: "600", lineHeight: "1.2" },
            { tag: "H3", fontSize: "24px", fontWeight: "500", lineHeight: "1.3" }
          ],
          body: { fontSize: "16px", fontWeight: "400", lineHeight: "1.5" }
        },
        spacing: {
          paddings: ["8px", "16px", "24px", "48px", "80px"],
          margins: ["8px", "16px", "24px", "32px"],
          radii: ["6px", "12px", "9999px"]
        },
        components: {
          primaryButton: {
            bg: "#5E6AD2",
            color: "#FFFFFF",
            borderRadius: "6px",
            padding: "10px 20px"
          },
          secondaryButton: {
            bg: "#191B22",
            color: "#F7F8F8",
            borderRadius: "6px",
            padding: "10px 20px"
          },
          card: {
            bg: "#191B22",
            borderRadius: "12px",
            border: "1px solid #2E303A",
            padding: "24px"
          }
        },
        meta: {
          title: "Linear – Purpose-built for modern software development",
          description: "Linear is a remarkably thoughtful tool for software development and issue tracking."
        }
      }
    });
  }

  getProject(id: string): ProjectRecord | undefined {
    return this.projects.get(id);
  }

  saveProject(project: ProjectRecord): ProjectRecord {
    this.projects.set(project.id, project);
    return project;
  }

  listProjects(): ProjectRecord[] {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
}

export const mockDb = new MockStore();
