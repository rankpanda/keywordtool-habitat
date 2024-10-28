import React, { useState, useEffect } from 'react';
import { toast } from '../ui/Toast';
import { groqService } from '../../services/groqService';
import { Loader2 } from 'lucide-react';

interface GroqModel {
  id: string;
  created: number;
  owned_by: string;
  root: string;
}

export function AdminSettings() {
  const [selectedModel, setSelectedModel] = useState('');
  const [models, setModels] = useState<GroqModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadModels();
    const savedModel = localStorage.getItem('groq_model');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  const loadModels = async () => {
    try {
      setIsLoading(true);
      const availableModels = await groqService.getAvailableModels();
      setModels(availableModels);
      
      // If no model is selected, use the first available one
      if (!selectedModel && availableModels.length > 0) {
        setSelectedModel(availableModels[0].id);
        localStorage.setItem('groq_model', availableModels[0].id);
      }
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error('Erro ao carregar modelos disponíveis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    localStorage.setItem('groq_model', newModel);
    toast.success('Modelo AI atualizado');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#444638] mb-1">
          Modelo AI para Clusters
        </label>
        {isLoading ? (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>A carregar modelos...</span>
          </div>
        ) : (
          <>
            <select
              value={selectedModel}
              onChange={handleModelChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c] text-sm"
            >
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.id}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Este modelo será usado para análise de clusters em todas as contas
            </p>
          </>
        )}
      </div>
    </div>
  );
}