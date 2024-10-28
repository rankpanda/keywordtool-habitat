import { toast } from '../components/ui/Toast';

interface SerpResult {
  title: string;
  url: string;
}

const API_KEY = 'YOUR_SPACESERP_API_KEY';
const API_BASE_URL = 'https://api.spaceserp.com/google/search';

export const serpService = {
  async getTopResults(keyword: string): Promise<SerpResult[]> {
    try {
      const params = new URLSearchParams({
        q: keyword,
        domain: 'google.pt',
        gl: 'pt',  // Portugal
        hl: 'pt',  // Portuguese
        device: 'desktop',
        serp_type: 'web',
        output: 'json',
        api_key: API_KEY
      });

      const response = await fetch(`${API_BASE_URL}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.organic_results) {
        throw new Error('No organic results found');
      }

      // Extract organic results
      return data.organic_results
        .slice(0, 10)
        .map((item: any) => ({
          title: item.title,
          url: item.link
        }));

    } catch (error) {
      console.error('Error fetching SERP results:', error);
      toast.error('Erro ao obter dados SERP');
      return [];
    }
  },

  calculateKGR(titleMatches: number): number | null {
    if (titleMatches === 0) return null;
    return titleMatches / 10;
  },

  async analyzeKeyword(keyword: string): Promise<{
    titleMatches: number;
    kgr: number | null;
  }> {
    try {
      const results = await this.getTopResults(keyword);
      
      // Count how many titles contain our keyword (case insensitive)
      const normalizedKeyword = keyword.toLowerCase();
      const titleMatches = results.filter(result => 
        result.title.toLowerCase().includes(normalizedKeyword)
      ).length;

      return {
        titleMatches,
        kgr: this.calculateKGR(titleMatches)
      };
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      return {
        titleMatches: 0,
        kgr: null
      };
    }
  }
};