import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY ?? '' });

export interface MenuRecommendation {
  recommendations: Array<{
    menuItemId?: string;
    name: string;
    reason: string;
    pairingWith?: string;
    expectedPopularity: 'high' | 'medium' | 'low';
  }>;
  newMenuIdeas: Array<{
    name: string;
    nameEn: string;
    description: string;
    concept: string; // 'korean_classic', 'korean_filipino_fusion', 'modern_korean'
    estimatedCost: number;
    estimatedPrice: number;
    targetAudience: string;
  }>;
  menuMatrixInsight: string;
}

export async function generateMenuRecommendation(context: {
  currentMenu: Array<{ name: string; price: number; orders: number; rating: number; margin: number }>;
  seasonalIngredients?: string[];
  customerPreferences?: string;
  localTrends?: string;
}): Promise<MenuRecommendation> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: `You are a K-Food menu innovation specialist for "강원" (Kangwon), a Korean restaurant in the Philippines.
Your specialty is creating Korean-Filipino fusion dishes that honor Korean culinary traditions while appealing to local tastes.
Think in terms of the BCG Menu Matrix: Stars (high popularity, high margin), Cash Cows (high popularity, low margin),
Question Marks (low popularity, high margin), Dogs (low popularity, low margin). Respond in JSON.`,
    messages: [
      {
        role: 'user',
        content: `Current Menu Performance: ${JSON.stringify(context.currentMenu)}
${context.seasonalIngredients ? `Seasonal Ingredients Available: ${context.seasonalIngredients.join(', ')}` : ''}
${context.customerPreferences ? `Customer Preferences: ${context.customerPreferences}` : ''}
${context.localTrends ? `Local Food Trends: ${context.localTrends}` : ''}

Generate menu recommendations and new menu ideas. Return JSON:
{
  "recommendations": [{"name": "...", "reason": "...", "pairingWith": "...", "expectedPopularity": "high|medium|low"}],
  "newMenuIdeas": [{"name": "...", "nameEn": "...", "description": "...", "concept": "...", "estimatedCost": 0, "estimatedPrice": 0, "targetAudience": "..."}],
  "menuMatrixInsight": "Analysis of current menu positioning and suggestions"
}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse menu recommendation');
  return JSON.parse(jsonMatch[0]);
}
