import React, { useState, useEffect } from 'react';
import { groqService } from '../services/groqService';
import { toast } from './ui/Toast';
import { Loader2, RefreshCw } from 'lucide-react';
import { KeywordTable } from './keyword/KeywordTable';
import { calculateTotalMetrics } from '../utils/keywordMetrics';

interface Keyword {
  keyword: string;
  volume: number;
  difficulty: number;
  intent?: string;
}

interface KeywordStats {
  totalVolume: number;
  avgDifficulty: number;
  totalTraffic: number;
  totalRevenue: number;
}

export function KeywordAnalysisView() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [stats, setStats] = useState<KeywordStats>({
    totalVolume: 0,
    avgDifficulty: 0,
    totalTraffic: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [contextData, setContextData] = useState({
    conversionRate: 2,
    averageOrderValue: 125
  });

  useEffect(() => {
    loadKeywords();
    loadContext();
  }, []);

  const loadContext = () => {
    const savedContext = localStorage.getItem('contextFormData');
    if (savedContext) {
      const parsedContext = JSON.parse(savedContext);
      setContextData({
        conversionRate: parsedContext.conversionRate,
        averageOrderValue: parsedContext.averageOrderValue
      });
    }
  };

  const loadKeywords = async () => {
    try {
      const projectId = localStorage.getItem('currentProjectId');
      if (!projectId) {
        toast.error('Nenhum projeto selecionado');
        return;
      }

      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const project = projects.find((p: any) => p.id === projectId);
      
      if (!project?.data?.keywords) {
        toast.error('Nenhuma keyword encontrada no projeto');
        return;
      }

      setKeywords(project.data.keywords);
      updateStats(project.data.keywords);
    } catch (error) {
      console.error('Error loading keywords:', error);
      toast.error('Erro ao carregar keywords');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (keywordList: Keyword[]) => {
    const totalMetrics = calculateTotalMetrics(keywordList, contextData);
    
    setStats({
      totalVolume: keywordList.reduce((sum, kw) => sum + kw.volume, 0),
      avgDifficulty: Math.round(keywordList.reduce((sum, kw) => sum + kw.difficulty, 0) / keywordList.length),
      totalTraffic: totalMetrics.potentialTraffic,
      totalRevenue: totalMetrics.potentialRevenue
    });
  };

  const toggleKeywordSelection = (keyword: string) => {
    const newSelection = new Set(selectedKeywords);
    if (newSelection.has(keyword)) {
      newSelection.delete(keyword);
    } else {
      newSelection.add(keyword);
    }
    setSelectedKeywords(newSelection);
  };

  const toggleAllKeywords = (selected: boolean) => {
    if (selected) {
      setSelectedKeywords(new Set(keywords.map(kw => kw.keyword)));
    } else {
      setSelectedKeywords(new Set());
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Volume Total</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {stats.totalVolume.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">KD Médio</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {stats.avgDifficulty}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Tráfego Potencial</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {stats.totalTraffic.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Receita Potencial</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            €{stats.totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Keywords Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Keywords</h2>
            <button
              onClick={() => {/* Implement analysis */}}
              disabled={isFetching || selectedKeywords.size === 0}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#11190c] rounded-md hover:bg-[#0a0f07] transition-colors disabled:opacity-50"
            >
              {isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Analisar Selecionadas
                </>
              )}
            </button>
          </div>
        </div>

        <KeywordTable
          keywords={keywords}
          selectedKeywords={selectedKeywords}
          onToggleKeyword={toggleKeywordSelection}
          onToggleAll={toggleAllKeywords}
          contextData={contextData}
        />
      </div>
    </div>
  );
}