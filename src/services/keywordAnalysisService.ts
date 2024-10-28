import { Groq } from 'groq-sdk';
import { toast } from '../components/ui/Toast';

const GROQ_API_KEY = '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';

export interface KeywordAnalysis {
  keyword_analysis: {
    keyword: string;
    volume: number;
    sales_relevance: {
      score: number;
      justification: string;
    };
    funnel_contribution: {
      percentage: number;
      quality_score: number;
      justification: string;
    };
    semantic_importance: {
      score: number;
      justification: string;
    };
    marketing_funnel_position: {
      stage: 'TOFU' | 'MOFU' | 'BOFU';
      justification: string;
    };
    search_intent: {
      type: 'Informational' | 'Navigational' | 'Commercial' | 'Transactional';
      justification: string;
    };
    competitiveness: {
      score: number;
      difficulty_vs_roi: string;
      justification: string;
    };
    b2b_b2c_relevance: {
      b2b_score: number;
      b2c_score: number;
      justification: string;
    };
    seasonality: {
      impact: 'Low' | 'Medium' | 'High';
      justification: string;
    };
    traffic_and_conversion_potential: {
      potential_traffic: number;
      potential_conversions: number;
      estimated_conversion_rate: number;
      potential_revenue: number;
      justification: string;
    };
    content_classification: {
      type: 'Target Page' | 'Support Article' | 'Pillar Page';
      justification: string;
      related_pages: {
        target_page?: string;
        pillar_page?: string;
      };
    };
    overall_priority: {
      score: number;
      justification: string;
    };
  };
}

export interface ContextData {
  businessContext: string;
  brandName: string;
  category: string;
  conversionRate: number;
  currentSessions: number;
  requiredVolume: number;
  salesGoal: number;
  averageOrderValue: number;
  language: string;
}

export const keywordAnalysisService = {
  async analyzeKeyword(keyword: string, volume: number, contextData: ContextData): Promise<KeywordAnalysis> {
    try {
      const groq = new Groq({ 
        apiKey: GROQ_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const systemPrompt = `You are an expert SEO analyst for an e-commerce website specializing in ${contextData.category}. The brand of the site you are analyzing is ${contextData.brandName}...`; // Your full system prompt here

      const userPrompt = `Analyze the following keyword based on the system prompt rules:

E-commerce Category: ${contextData.category}
Brand: ${contextData.brandName}
Keyword: ${keyword}
Context about the website and business: ${contextData.businessContext}
Monthly search volume: ${volume}
Current conversion rate: ${contextData.conversionRate}
Current annual sessions: ${contextData.currentSessions}
Required search volume: ${contextData.requiredVolume}
Sales goal: ${contextData.salesGoal}
Average Order Value: ${contextData.averageOrderValue}
Output language: ${contextData.language}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.3,
        max_tokens: 4000,
        top_p: 0.9,
        stream: false
      });

      const content = completion.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Empty response from API');
      }

      return JSON.parse(content);

    } catch (error) {
      console.error('Error analyzing keyword:', error);
      throw error;
    }
  },

  async batchAnalyzeKeywords(keywords: Array<{ keyword: string; volume: number }>, contextData: ContextData, onProgress: (progress: number) => void) {
    const results: { [key: string]: KeywordAnalysis } = {};
    const batchSize = 5;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize);
      const progress = (i / keywords.length) * 100;
      onProgress(progress);

      await Promise.all(
        batch.map(async ({ keyword, volume }) => {
          try {
            const analysis = await this.analyzeKeyword(keyword, volume, contextData);
            results[keyword] = analysis;
          } catch (error) {
            console.error(`Error analyzing keyword "${keyword}":`, error);
            toast.error(`Erro ao analisar keyword "${keyword}"`);
          }
        })
      );

      if (i + batchSize < keywords.length) {
        await delay(1000); // Rate limiting
      }
    }

    onProgress(100);
    return results;
  }
};