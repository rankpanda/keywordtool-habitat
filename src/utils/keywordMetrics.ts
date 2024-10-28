interface KeywordMetrics {
  potentialTraffic: number;
  potentialConversions: number;
  potentialRevenue: number;
}

interface Keyword {
  keyword: string;
  volume: number;
  difficulty: number;
}

interface ContextData {
  conversionRate: number;
  averageOrderValue: number;
}

export function calculateKeywordMetrics(keyword: Keyword, contextData: ContextData): KeywordMetrics {
  // Get CTR based on difficulty (higher difficulty = lower CTR)
  const getOrganicCTR = (difficulty: number) => {
    if (difficulty <= 14) return 0.32; // 32% for very easy keywords
    if (difficulty <= 29) return 0.28;
    if (difficulty <= 49) return 0.24;
    if (difficulty <= 69) return 0.20;
    if (difficulty <= 84) return 0.16;
    return 0.12; // 12% for very hard keywords
  };

  const organicCTR = getOrganicCTR(keyword.difficulty);
  const conversionRate = contextData.conversionRate / 100;
  const averageOrderValue = contextData.averageOrderValue;

  const potentialTraffic = Math.round(keyword.volume * organicCTR);
  const potentialConversions = Math.round(potentialTraffic * conversionRate);
  const potentialRevenue = Math.round(potentialConversions * averageOrderValue);

  return {
    potentialTraffic,
    potentialConversions,
    potentialRevenue
  };
}

export function calculateTotalMetrics(keywords: Keyword[], contextData: ContextData): KeywordMetrics {
  return keywords.reduce((acc, keyword) => {
    const metrics = calculateKeywordMetrics(keyword, contextData);
    return {
      potentialTraffic: acc.potentialTraffic + metrics.potentialTraffic,
      potentialConversions: acc.potentialConversions + metrics.potentialConversions,
      potentialRevenue: acc.potentialRevenue + metrics.potentialRevenue
    };
  }, {
    potentialTraffic: 0,
    potentialConversions: 0,
    potentialRevenue: 0
  });
}