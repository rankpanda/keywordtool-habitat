import React from 'react';
import { KDIndicator } from './KDIndicator';
import { calculateKeywordMetrics } from '../../utils/keywordMetrics';
import type { Keyword } from '../../types/keyword';

interface KeywordTableProps {
  keywords: Keyword[];
  selectedKeywords: Set<string>;
  onToggleKeyword: (keyword: string) => void;
  onToggleAll: (selected: boolean) => void;
  contextData: any;
}

export function KeywordTable({ 
  keywords, 
  selectedKeywords, 
  onToggleKeyword, 
  onToggleAll,
  contextData 
}: KeywordTableProps) {
  const allSelected = keywords.length > 0 && keywords.every(kw => selectedKeywords.has(kw.keyword));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onToggleAll(e.target.checked)}
                className="h-4 w-4 text-[#11190c] focus:ring-[#11190c] border-gray-300 rounded"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Keyword
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Volume
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              KD
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Intent
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Potential Traffic
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Potential Revenue
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {keywords.map((kw) => {
            const metrics = calculateKeywordMetrics(kw, contextData);
            
            return (
              <tr key={kw.keyword} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedKeywords.has(kw.keyword)}
                    onChange={() => onToggleKeyword(kw.keyword)}
                    className="h-4 w-4 text-[#11190c] focus:ring-[#11190c] border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{kw.keyword}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{kw.volume.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <KDIndicator kd={kw.difficulty} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {kw.intent || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {metrics.potentialTraffic.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  €{metrics.potentialRevenue.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}