import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY ?? '' });

export interface SentimentResult {
  sentiment: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  score: number; // -1.0 ~ 1.0
  keywords: string[];
  suggestions: string[];
  urgency: 'low' | 'medium' | 'high';
}

export async function analyzeSentiment(
  review: string,
  rating: number,
  context?: { menuItems?: string[]; staffName?: string }
): Promise<SentimentResult> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: `You are a restaurant feedback analyst for "강원" (Kangwon), a Korean restaurant in the Philippines.
Analyze customer reviews to extract actionable insights. Respond in JSON only.`,
    messages: [
      {
        role: 'user',
        content: `Review: "${review}"
Rating: ${rating}/5
${context?.menuItems ? `Menu items ordered: ${context.menuItems.join(', ')}` : ''}
${context?.staffName ? `Server: ${context.staffName}` : ''}

Analyze and return JSON:
{
  "sentiment": "very_positive|positive|neutral|negative|very_negative",
  "score": number (-1.0 to 1.0),
  "keywords": ["extracted", "keywords"],
  "suggestions": ["actionable", "improvements"],
  "urgency": "low|medium|high"
}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse sentiment analysis');
  return JSON.parse(jsonMatch[0]);
}
