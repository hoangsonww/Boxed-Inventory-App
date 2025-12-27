import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerationConfig,
} from "@google/generative-ai";

type GeminiModelListResponse = {
  models?: Array<{
    name?: string;
    displayName?: string;
    supportedGenerationMethods?: string[];
  }>;
};

const MODEL_CACHE_TTL_MS = 10 * 60 * 1000;
const FALLBACK_GEMINI_MODELS = ["models/gemini-2.5-flash"];

let cachedGeminiModels: string[] | null = null;
let cachedGeminiModelsAt = 0;
let inFlightGeminiModels: Promise<string[]> | null = null;
let geminiModelRotationIndex = 0;

function rotateModels(models: string[]): string[] {
  if (models.length <= 1) return models;
  const startIndex = geminiModelRotationIndex % models.length;
  geminiModelRotationIndex = (startIndex + 1) % models.length;
  return [...models.slice(startIndex), ...models.slice(0, startIndex)];
}

function filterGeminiModels(
  models: GeminiModelListResponse["models"],
): string[] {
  const unique = new Set<string>();

  for (const model of models || []) {
    const name = model.name?.trim();
    if (!name) continue;

    const lowerName = name.toLowerCase();
    const lowerDisplay = (model.displayName || "").toLowerCase();
    const supportsGenerate =
      model.supportedGenerationMethods?.includes("generateContent");

    if (!lowerName.startsWith("models/gemini")) continue;
    if (!supportsGenerate) continue;
    if (lowerName.includes("pro") || lowerDisplay.includes("pro")) continue;
    if (lowerName.includes("embedding") || lowerDisplay.includes("embedding")) {
      continue;
    }

    unique.add(name);
  }

  return Array.from(unique);
}

async function fetchGeminiModelNames(apiKey: string): Promise<string[]> {
  const now = Date.now();
  if (cachedGeminiModels && now - cachedGeminiModelsAt < MODEL_CACHE_TTL_MS) {
    return cachedGeminiModels;
  }

  if (inFlightGeminiModels) return inFlightGeminiModels;

  inFlightGeminiModels = (async () => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Gemini models (status ${response.status})`,
      );
    }

    const data = (await response.json()) as GeminiModelListResponse;
    const models = filterGeminiModels(data.models);

    if (!models.length) {
      throw new Error("No Gemini models available after filtering");
    }

    cachedGeminiModels = models;
    cachedGeminiModelsAt = Date.now();
    return models;
  })();

  try {
    return await inFlightGeminiModels;
  } catch (error) {
    console.warn("BoxedAI model list fetch failed:", error);
    if (cachedGeminiModels?.length) return cachedGeminiModels;
    return FALLBACK_GEMINI_MODELS;
  } finally {
    inFlightGeminiModels = null;
  }
}

export async function chatWithBoxAI(
  history: Array<{ role: string; parts: Array<{ text: string }> }>,
  message: string,
  context: string,
  systemInstruction?: string,
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_AI_API_KEY");
  }

  const baseSystem =
    systemInstruction ||
    `
You are **BoxedAI**, an intelligent assistant embedded in the Boxed app.
Primary goals:
1. Help the user locate items.
2. Offer packing & organizing advice.
3. Reference the user’s actual boxes/items.
4. Ask for clarification if you don’t know.
5. Never hallucinate items not in the context.

FYI, Boxed is a personal inventory app that helps users track their belongings in boxes, rooms, and locations. It allows users to search for items, view box contents, and manage their inventory efficiently.
You have access to the user's inventory data, which includes boxes, items, and their locations. Use this data to provide accurate and helpful responses.

When responding, always:

- Use the user's inventory data to answer questions about items and boxes.
- Provide clear, concise instructions for finding items.
- Offer practical advice on packing and organizing.
- Avoid making assumptions about items not present in the inventory.
- If you don't know the answer, ask for clarification instead of guessing.

Inventory Context:
${context || "No inventory data available."}
`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelNames = rotateModels(await fetchGeminiModelNames(apiKey));

  const generationConfig: GenerationConfig = {
    temperature: 0.6,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 8192,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  // Normalize roles: "assistant" → "model"
  const normalizedHistory = history.map((h) => ({
    role: h.role === "assistant" ? "model" : h.role,
    parts: h.parts,
  }));

  // Append the new user message
  const fullHistory = [
    ...normalizedHistory,
    { role: "user", parts: [{ text: message }] },
  ];

  let lastError: unknown;

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: baseSystem,
      });

      const chatSession = model.startChat({
        generationConfig,
        safetySettings,
        history: fullHistory,
      });

      const result = await chatSession.sendMessage(message);
      const raw = await result.response?.text?.();
      if (!raw || typeof raw !== "string") {
        throw new Error("Empty or invalid response from BoxedAI");
      }

      return raw.trim();
    } catch (error) {
      lastError = error;
      console.warn("BoxedAI model attempt failed:", {
        model: modelName,
        error,
      });
    }
  }

  console.error("BoxedAI all Gemini models failed:", lastError);
  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error("All Gemini models failed");
}
