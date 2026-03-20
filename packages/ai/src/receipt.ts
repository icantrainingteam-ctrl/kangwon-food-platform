import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? '' });

export interface ParsedReceipt {
  totalAmount: number;
  merchantName: string;
  date?: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  category?: string;
}

export async function parseReceipt(
  base64Image: string,
  mimeType: string = 'image/jpeg',
  categories: string[] = []
): Promise<ParsedReceipt> {
  const categoryContext = categories.length > 0
    ? `Classify into one of these categories: ${JSON.stringify(categories)}.`
    : 'Classify into a relevant category.';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Image } },
        {
          text: `Analyze this receipt image.
          1. Extract the merchant/restaurant name.
          2. Extract the transaction date (YYYY-MM-DD).
          3. Extract the total amount.
          4. Extract individual line items with names, quantities (default 1), and prices.
          5. ${categoryContext}`
        },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          totalAmount: { type: Type.NUMBER },
          merchantName: { type: Type.STRING },
          date: { type: Type.STRING },
          category: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.NUMBER },
                quantity: { type: Type.NUMBER },
              },
            },
          },
        },
        required: ['totalAmount', 'merchantName'],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error('No data returned from Gemini');
  return JSON.parse(text);
}
