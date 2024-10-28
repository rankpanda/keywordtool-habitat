import { Groq } from 'groq-sdk';
import { toast } from '../components/ui/Toast';

const GROQ_API_KEY = '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';

export interface Keyword {
  keyword: string;
  volume: number;
  difficulty: number;
  intent?: string;
  cpc?: number;
  trend?: string;
  analysis?: any;
}

export interface Cluster {
  id: string;
  name: string;
  keywords: Keyword[];
  totalVolume: number;
  avgDifficulty: number;
  funnel: 'TOFU' | 'MOFU' | 'BOFU';
  intent: string;
  pageType: 'pilar' | 'target' | 'support';
  createdAt: string;
}

export const groqService = {
  onProgress: (data: { progress: number; cluster?: Cluster }) => {},

  async getAvailableModels(): Promise<any[]> {
    try {
      const groq = new Groq({ 
        apiKey: GROQ_API_KEY,
        dangerouslyAllowBrowser: true
      });
      const models = await groq.models.list();
      return models;
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  },

  async loadClusters(projectId: string): Promise<Cluster[]> {
    try {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const project = projects.find((p: any) => p.id === projectId);
      
      if (!project?.clusters) {
        return [];
      }

      return project.clusters;
    } catch (error) {
      console.error('Error loading clusters:', error);
      throw new Error('Failed to load clusters');
    }
  },

  async saveClusters(projectId: string, clusters: Cluster[]): Promise<void> {
    try {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const projectIndex = projects.findIndex((p: any) => p.id === projectId);
      
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }

      projects[projectIndex].clusters = clusters;
      localStorage.setItem('projects', JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving clusters:', error);
      throw new Error('Failed to save clusters');
    }
  },

  async createClusters(keywords: Keyword[]): Promise<Cluster[]> {
    try {
      const groq = new Groq({ 
        apiKey: GROQ_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const clusters: Cluster[] = [];
      let processedKeywords = 0;

      // Group similar keywords
      const keywordGroups = this.groupSimilarKeywords(keywords);

      for (const group of keywordGroups) {
        const systemPrompt = `You are an expert SEO analyst. Analyze the following group of keywords and create a semantic cluster.`;
        
        const userPrompt = `
          Keywords: ${group.map(k => k.keyword).join(', ')}
          Volumes: ${group.map(k => k.volume).join(', ')}
          
          Create a cluster with the following information:
          1. A descriptive name for the cluster
          2. The most appropriate funnel stage (TOFU, MOFU, BOFU)
          3. The main search intent
          4. The most appropriate page type (pilar, target, support)
          
          Return the analysis in JSON format.
        `;

        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.3,
          max_tokens: 1000,
          stream: false
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) continue;

        const analysis = JSON.parse(content);

        const cluster: Cluster = {
          id: crypto.randomUUID(),
          name: analysis.name,
          keywords: group,
          totalVolume: group.reduce((sum, k) => sum + k.volume, 0),
          avgDifficulty: Math.round(group.reduce((sum, k) => sum + k.difficulty, 0) / group.length),
          funnel: analysis.funnel,
          intent: analysis.intent,
          pageType: analysis.pageType,
          createdAt: new Date().toISOString()
        };

        clusters.push(cluster);
        processedKeywords += group.length;

        // Report progress
        const progress = (processedKeywords / keywords.length) * 100;
        this.onProgress({ progress, cluster });

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return clusters;

    } catch (error) {
      console.error('Error creating clusters:', error);
      throw new Error('Failed to create clusters');
    }
  },

  groupSimilarKeywords(keywords: Keyword[]): Keyword[][] {
    const groups: Keyword[][] = [];
    const used = new Set<string>();

    for (const keyword of keywords) {
      if (used.has(keyword.keyword)) continue;

      const group = [keyword];
      used.add(keyword.keyword);

      // Find similar keywords
      for (const other of keywords) {
        if (used.has(other.keyword)) continue;

        if (this.calculateSimilarity(keyword.keyword, other.keyword) > 0.3) {
          group.push(other);
          used.add(other.keyword);
        }
      }

      groups.push(group);
    }

    return groups;
  },

  calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }
};