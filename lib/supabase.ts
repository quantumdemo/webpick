import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ProjectRecord {
  id: string;
  user_id?: string;
  url: string;
  name: string;
  tokens_json: {
    colors: Array<{ hex: string; rgb: string; name: string }>;
    typography: {
      fontFamilies: string[];
      headings: Array<{ tag: string; fontSize: string; fontWeight: string; lineHeight: string }>;
      body: { fontSize: string; fontWeight: string; lineHeight: string };
    };
    spacing: {
      paddings: string[];
      margins: string[];
      radii: string[];
    };
    components: {
      primaryButton: { bg: string; color: string; borderRadius: string; padding: string };
      secondaryButton: { bg: string; color: string; borderRadius: string; padding: string };
      card: { bg: string; borderRadius: string; border: string; padding: string };
    };
    meta: {
      title: string;
      description: string;
      favicon?: string;
    };
  };
  screenshot_url?: string;
  status: "pending" | "completed" | "failed";
  created_at: string;
}
