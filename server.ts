import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const app = express();

// 1. Top-Level Request Deserialization (Ordering Guarantee)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Helper: Lazy load Gemini AI Client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || "dummy-key",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Resilient Model Fallback Ladder
const MODEL_FALLBACK_LADDER = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash",
];

// Reusable Helper with Fallback Protocol
async function generateContentWithFallback(
  ai: GoogleGenAI,
  promptText: string,
  systemInstruction: string
): Promise<{ text: string; modelUsed: string }> {
  let lastError: any = null;

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: promptText,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode || err?.code;
      const errorMsg = String(err?.message || "");
      console.warn(`[Gemini Fallback] Model ${model} failed with status/msg:`, status, errorMsg);
      // Continue to next model in ladder for recoverable errors
      continue;
    }
  }

  throw lastError || new Error("Failed to generate reflection with all available Gemini models");
}

// Strict Undefined-Stripping Helper
function stripUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// In-Memory Storage for Journal Entries (Synchronized with client-side durability)
interface StoredEntry {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  tags: string[];
  reflection?: {
    rawText: string;
    reflectionText: string;
    primaryMood: string;
    hiddenSummary: string;
    generatedAt: string;
    modelUsed?: string;
  };
  wordCount: number;
}

let journalEntriesStore: StoredEntry[] = [];

// API Routes
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Generate Journal Reflection & Extraction
app.post("/api/journal/reflect", async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { entry, title, history } = body;

    if (!entry || typeof entry !== "string" || !entry.trim()) {
      return res.status(400).json({
        error: "Journal entry text is required and cannot be empty.",
      });
    }

    const systemInstruction = `Role: You are an insightful, highly empathetic, and objective journaling assistant. Your primary goal is to help the user process their thoughts, find clarity, and document their personal growth.

Instructions:
When the user submits a journal entry or reflection, you must process the input and provide a structured response containing two distinct parts: a conversational reflection and a structured metadata extraction.

Part 1: The Reflection (Rich Text)
- Validate: Acknowledge the user's feelings and experiences without judgment.
- Reflect & Summarize: Gently mirror back the core themes of what they wrote to show understanding.
- Brainstorm/Expand (If applicable): If the user is facing a problem or creative block, offer 1-2 constructive frameworks or ideas.
- Prompt: Always end your conversational response with a single, gentle, open-ended question to encourage further writing.

Part 2: Data Extraction (Strict JSON)
- You must append a JSON object at the very end of your response inside a markdown code block.
- This JSON must contain two keys: primary_mood (a single lowercase word representing the dominant emotion) and hidden_summary (a concise one-sentence summary of the entry for the database).

Example Output Format:
It sounds like you had an incredibly demanding day trying to balance those project deadlines, but taking a walk was a great way to reset. Have you noticed a pattern in what time of day you feel the most overwhelmed?

\`\`\`json
{
"primary_mood": "stressed",
"hidden_summary": "The user struggled with tight project deadlines but found some relief in a brief outdoor break."
}
\`\`\``;

    let userPrompt = `Here is the user's journal entry:\n\nTitle: ${title || "Untitled Reflection"}\nContent:\n${entry.trim()}`;

    if (Array.isArray(history) && history.length > 0) {
      userPrompt += `\n\nRecent Journal History Context for continuity:\n` +
        history
          .slice(-3)
          .map((h: any) => `- [${h.role || "user"}]: ${String(h.text || "").slice(0, 180)}`)
          .join("\n");
    }

    const ai = getGeminiClient();
    const { text, modelUsed } = await generateContentWithFallback(ai, userPrompt, systemInstruction);

    // Extract Part 1 (reflectionText) and Part 2 (JSON metadata)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let primary_mood = "reflective";
    let hidden_summary = entry.slice(0, 120) + (entry.length > 120 ? "..." : "");
    let reflectionText = text;

    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim());
        if (parsed.primary_mood) primary_mood = String(parsed.primary_mood).toLowerCase().trim();
        if (parsed.hidden_summary) hidden_summary = String(parsed.hidden_summary).trim();
        reflectionText = text.replace(/```(?:json)?\s*[\s\S]*?\s*```/, "").trim();
      } catch (parseErr) {
        console.warn("Failed to parse JSON metadata from Gemini response:", parseErr);
      }
    }

    // Extract the final prompt question if isolated
    const lastQuestionMatch = reflectionText.match(/([^.?!]+[?])\s*$/);
    const suggestedPrompt = lastQuestionMatch ? lastQuestionMatch[1].trim() : undefined;

    return res.json({
      rawResponse: text,
      reflectionText,
      metadata: {
        primary_mood,
        hidden_summary,
      },
      suggestedPrompt,
      modelUsed,
    });
  } catch (error: any) {
    console.error("Error in /api/journal/reflect:", error);
    return res.status(500).json({
      error: error?.message || "Failed to process journal reflection with Gemini AI.",
    });
  }
});

// Prompt Inspiration Generator
app.post("/api/journal/prompt-idea", async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const category = body.category || "general";

    const promptText = `Generate 3 thoughtful, gentle, and introspective journaling prompts for someone looking to reflect on the category: "${category}". 
Format as a JSON array of strings: ["Prompt 1", "Prompt 2", "Prompt 3"]. Return only valid JSON.`;

    const ai = getGeminiClient();
    const { text } = await generateContentWithFallback(
      ai,
      promptText,
      "You are an empathetic journaling guide who crafts deeply resonant reflection questions."
    );

    let prompts: string[] = [];
    try {
      const cleaned = text.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
      prompts = JSON.parse(cleaned);
    } catch {
      prompts = [
        "What is one emotion you have been holding onto lately that you are ready to explore?",
        "Describe a small moment from today that brought you peace or unexpected clarity.",
        "What boundary or gentle permission do you need to give yourself right now?",
      ];
    }

    return res.json({ prompts });
  } catch (error: any) {
    console.error("Error generating prompt ideas:", error);
    return res.json({
      prompts: [
        "What is currently taking up the most emotional space in your mind?",
        "If you could speak to yourself with total compassion, what would you say today?",
        "What is something you learned about your own resilience recently?",
      ],
    });
  }
});

// Get all stored entries
app.get("/api/journal/entries", (_req: Request, res: Response) => {
  return res.json({ entries: journalEntriesStore });
});

// Save or Update Entry
app.post("/api/journal/save", (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const sanitizedEntry = stripUndefined(body) as StoredEntry;

    if (!sanitizedEntry.id || !sanitizedEntry.content) {
      return res.status(400).json({ error: "Entry must contain id and content" });
    }

    const existingIndex = journalEntriesStore.findIndex((e) => e.id === sanitizedEntry.id);
    if (existingIndex >= 0) {
      journalEntriesStore[existingIndex] = sanitizedEntry;
    } else {
      journalEntriesStore.unshift(sanitizedEntry);
    }

    return res.json({ success: true, entry: sanitizedEntry });
  } catch (error: any) {
    console.error("Error saving entry:", error);
    return res.status(500).json({ error: "Failed to persist journal entry" });
  }
});

// Delete Entry
app.delete("/api/journal/entries/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    journalEntriesStore = journalEntriesStore.filter((e) => e.id !== id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete entry" });
  }
});

// Start Full-Stack Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Empathetic Journaling Assistant server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
