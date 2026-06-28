import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Eres un experto en marketing digital y redes sociales.
Genera contenido optimizado para cada plataforma respetando:
- Instagram: hasta 2200 caracteres, usa emojis y hashtags relevantes
- Facebook: hasta 63000 caracteres, tono conversacional
- Twitter/X: máximo 280 caracteres, directo e impactante
- LinkedIn: hasta 3000 caracteres, tono profesional
- TikTok: hasta 2200 caracteres, lenguaje joven y trending
Responde SOLO en JSON válido con esta estructura exacta (sin markdown, sin bloques de código):
{
  "instagram": string,
  "facebook": string,
  "twitter": string,
  "linkedin": string,
  "tiktok": string
}`;

const TONE_LABELS: Record<string, string> = {
  professional: "profesional y formal",
  casual:       "casual y amigable",
  motivational: "motivacional e inspirador",
  urgent:       "urgente y con llamada a la acción",
  educational:  "educativo e informativo",
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, platforms, tone, language } = body as {
      prompt: string;
      platforms: string[];
      tone: string;
      language: string;
    };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const toneLabel = TONE_LABELS[tone] ?? tone;
    const langLabel = language === "en" ? "English" : "Spanish (Español)";
    const platformList = platforms.length > 0 ? platforms.join(", ") : "all platforms";

    const userMessage = `
Genera contenido para redes sociales con estas especificaciones:

Tema / Descripción: ${prompt}
Tono: ${toneLabel}
Idioma de respuesta: ${langLabel}
Plataformas requeridas: ${platformList}

Genera el contenido optimizado para CADA plataforma listada.
Para las plataformas NO listadas, devuelve una cadena vacía "".
Responde SOLO con el objeto JSON, sin texto adicional.
    `.trim();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Strip any accidental markdown code fences
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    let posts: Record<string, string>;
    try {
      posts = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON", raw: cleaned },
        { status: 502 }
      );
    }

    // Ensure all platform keys exist
    const defaultPosts = {
      instagram: "",
      facebook: "",
      twitter: "",
      linkedin: "",
      tiktok: "",
    };

    return NextResponse.json({
      posts: { ...defaultPosts, ...posts },
    });
  } catch (error) {
    console.error("AI generate-post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
