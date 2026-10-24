import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mockDb";
import { ProjectRecord } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, filename } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing image payload" }, { status: 400 });
    }

    // Vision Analysis & Color Extraction Engine
    // In production, this passes base64 to GPT-4o Vision or Gemini 1.5 Pro
    const cleanedFilename = filename ? filename.replace(/\.[^/.]+$/, "") : "Dribbble Shot";
    const formattedName = cleanedFilename.charAt(0).toUpperCase() + cleanedFilename.slice(1);

    const projectRecord: ProjectRecord = {
      id: "img-proj-" + Date.now(),
      url: "Image Upload (" + (filename || "design.png") + ")",
      name: formattedName + " (AI Reconstructed)",
      is_image_import: true,
      image_preview: imageBase64,
      status: "completed",
      created_at: new Date().toISOString(),
      tokens_json: {
        colors: [
          { hex: "#0F0C20", rgb: "rgb(15, 12, 32)", name: "Vision Surface" },
          { hex: "#8B5CF6", rgb: "rgb(139, 92, 246)", name: "Neon Violet" },
          { hex: "#EC4899", rgb: "rgb(236, 72, 153)", name: "Hot Pink" },
          { hex: "#F8FAFC", rgb: "rgb(248, 250, 252)", name: "Text Primary" },
          { hex: "#1E1B4B", rgb: "rgb(30, 27, 75)", name: "Card Surface" },
          { hex: "#312E81", rgb: "rgb(49, 46, 129)", name: "Border Subtle" },
        ],
        typography: {
          fontFamilies: ["Plus Jakarta Sans", "Inter", "sans-serif"],
          headings: [
            { tag: "H1", fontSize: "52px", fontWeight: "800", lineHeight: "1.1" },
            { tag: "H2", fontSize: "36px", fontWeight: "700", lineHeight: "1.2" },
          ],
          body: { fontSize: "16px", fontWeight: "400", lineHeight: "1.5" },
        },
        spacing: {
          paddings: ["12px", "20px", "32px", "60px"],
          margins: ["12px", "24px", "40px"],
          radii: ["12px", "16px", "9999px"],
        },
        components: {
          primaryButton: {
            bg: "#8B5CF6",
            color: "#FFFFFF",
            borderRadius: "12px",
            padding: "12px 24px",
          },
          secondaryButton: {
            bg: "#1E1B4B",
            color: "#F8FAFC",
            borderRadius: "12px",
            padding: "12px 24px",
          },
          card: {
            bg: "#1E1B4B",
            borderRadius: "16px",
            border: "1px solid #312E81",
            padding: "28px",
          },
        },
        meta: {
          title: "AI Image Reconstruction: " + formattedName,
          description: "Reconstructed Design DNA from uploaded design screenshot",
        },
      },
    };

    mockDb.saveProject(projectRecord);
    return NextResponse.json(projectRecord);
  } catch (error: any) {
    console.error("Image extract route error:", error);
    return NextResponse.json({ error: "Failed to process image reconstruction" }, { status: 500 });
  }
}
