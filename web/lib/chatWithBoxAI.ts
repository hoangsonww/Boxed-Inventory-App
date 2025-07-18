// lib/chatWithBoxAI.ts
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerationConfig,
} from "@google/generative-ai";

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
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    systemInstruction: baseSystem,
  });

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

  const chatSession = model.startChat({
    generationConfig,
    safetySettings,
    history: fullHistory,
  });

  const result = await chatSession.sendMessage(message);
  const raw = await result.response?.text?.();
  if (!raw || typeof raw !== "string") {
    console.error("BoxedAI invalid response:", result);
    throw new Error("Empty or invalid response from BoxedAI");
  }

  return raw.trim();
}
