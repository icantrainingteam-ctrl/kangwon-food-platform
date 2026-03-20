import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY ?? '' });

export interface StrategyInsight {
  title: string;
  analysis: string;
  recommendations: Array<{
    action: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    timeline: string;
  }>;
  risks: string[];
  kpiImpact: Record<string, string>;
}

export async function generateStrategyInsight(context: {
  currentKPIs: Record<string, number>;
  recentTrends: string;
  menuPerformance: string;
  customerFeedbackSummary: string;
  competitorInfo?: string;
}): Promise<StrategyInsight> {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    system: `You are a strategic advisor for "강원" (Kangwon), a K-Food restaurant in the Philippines operated by iCAN.
Your approach follows Palantir's ontology-driven strategy: connect data points to surface non-obvious insights.
The restaurant employs Korean staff who directly serve customers, combining Korean hospitality with local appeal.
Think like a food industry consultant with deep data analytics expertise. Respond in JSON.`,
    messages: [
      {
        role: 'user',
        content: `Current KPIs: ${JSON.stringify(context.currentKPIs)}
Recent Trends: ${context.recentTrends}
Menu Performance: ${context.menuPerformance}
Customer Feedback: ${context.customerFeedbackSummary}
${context.competitorInfo ? `Competitor Info: ${context.competitorInfo}` : ''}

Generate a strategic insight with actionable recommendations. Return JSON:
{
  "title": "Insight title",
  "analysis": "Deep analysis connecting multiple data points",
  "recommendations": [{"action": "...", "impact": "high|medium|low", "effort": "high|medium|low", "timeline": "..."}],
  "risks": ["potential risks"],
  "kpiImpact": {"metric_name": "expected impact description"}
}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse strategy insight');
  return JSON.parse(jsonMatch[0]);
}
