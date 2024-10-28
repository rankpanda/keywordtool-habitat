import { KeywordSimilarity } from '../utils/keywordSimilarity';

interface Keyword {
  keyword: string;
  volume: number;
  difficulty: number;
  intent?: string;
  pageType?: 'pilar' | 'target' | 'support';
  funnelStage?: 'TOFU' | 'MOFU' | 'BOFU';
}

interface Cluster {
  name: string;
  keywords: Keyword[];
}

export const clusterService = {
  generateClusters(keywords: Keyword[]): Cluster[] {
    const clusters: Cluster[] = [];
    const usedKeywords = new Set<string>();
    const similarity = new KeywordSimilarity();

    // Sort keywords by volume for better cluster creation
    const sortedKeywords = [...keywords].sort((a, b) => b.volume - a.volume);

    for (const keyword of sortedKeywords) {
      if (usedKeywords.has(keyword.keyword)) continue;

      // Start a new cluster
      const cluster: Cluster = {
        name: keyword.keyword,
        keywords: [keyword]
      };
      usedKeywords.add(keyword.keyword);

      // Find related keywords
      for (const otherKeyword of sortedKeywords) {
        if (usedKeywords.has(otherKeyword.keyword)) continue;

        const similarityScore = similarity.calculate(
          keyword.keyword,
          otherKeyword.keyword
        );

        if (similarityScore >= 0.3) {
          cluster.keywords.push(otherKeyword);
          usedKeywords.add(otherKeyword.keyword);
        }
      }

      // Only add clusters with at least 2 keywords or high-volume single keywords
      if (cluster.keywords.length >= 2 || cluster.keywords[0].volume >= 1000) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }
};