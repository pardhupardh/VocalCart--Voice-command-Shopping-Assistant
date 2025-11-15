import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ShoppingItem } from '../src/types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    items: { // For ADD. An array of items to add.
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.STRING },
          category: {
            type: Type.STRING,
            enum: ['Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Household', 'Other'],
          },
        },
      },
    },
    itemNames: { // For REMOVE. An array of item names to remove.
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    modifications: { // For MODIFY. An array of modifications.
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: {type: Type.STRING},
                newQuantity: {type: Type.STRING},
            }
        }
    },
    query: { type: Type.STRING }, // For SEARCH
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    reason: { type: Type.STRING },
    response: { type: Type.STRING },
  },
};

export const processVoiceCommand = async (text: string, currentList: ShoppingItem[], language: string): Promise<any> => {
  try {
    // Escape double quotes in the user's command to prevent breaking the prompt string.
    const escapedText = text.replace(/"/g, '\\"');

    const prompt = `
      You are a shopping list API that only responds in JSON.
      Your task is to process a user's voice command and return a structured JSON response.
      Strictly adhere to the provided JSON schema. A command may contain multiple actions of different types (e.g., adding and removing items simultaneously).

      The user is speaking in ${language}. All string values in the returned JSON, like 'name' and 'quantity', must also be in ${language}.

      For the 'quantity' field, ONLY return the number and unit (e.g., "1", "2 lbs", "500g"). DO NOT include any extra conversational text, sentences, or explanations.

      The user's current shopping list is:
      ${currentList.length > 0 ? JSON.stringify(currentList.map(i => ({ name: i.name, quantity: i.quantity }))) : 'empty'}.

      The user's command is: "${escapedText}"

      Analyze the command and populate the corresponding fields in the JSON object.
      A single command can result in multiple fields being populated. For example, "add milk and remove bread" should populate both the 'items' and 'itemNames' arrays in the same response.

      - For adding items (e.g., "add 2 apples and a loaf of bread"): Populate the "items" array. Each object should have "name", "quantity", and "category". Infer category. Default "quantity" to "1" if not specified.
      - For removing items (e.g., "remove bread and eggs"): Populate the "itemNames" array of strings. Match items from the current list.
      - For modifying items (e.g., "change apples to 5 and milk to 2 cartons"): Populate the "modifications" array of objects, where each object has "name" and "newQuantity".
      - For searching (e.g., "find milk"): Populate "query". A search query is for a single item.
      - For suggestions (e.g., "what should I buy?"): Populate the "suggestions" array with 3 unique item names.
      - For greetings (e.g., "hello"): Populate "response" with a friendly greeting in ${language}.
      - For showing the list (e.g., "show my cart"): Populate "response" with a confirmatory message in ${language}.
      - If the command is unclear: Populate "reason".
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const jsonText = result.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error processing voice command with Gemini:", error);
    return { reason: 'Failed to understand the response from the AI service.' };
  }
};

export const generateItemImage = async (itemName: string): Promise<string | null> => {
  try {
    const prompt = `A professional, high-quality product photograph of ${itemName}, centered on a clean, plain white background. The image should be clear and well-lit.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:image/png;base64,${base64ImageBytes}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const generateSpeech = async (textToSpeak: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: textToSpeak }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // A standard, clear voice
            },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};