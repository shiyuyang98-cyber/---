import React from 'react';
import { Indicator } from '../types';
import { Edit2, ChevronRight, BarChart2 } from 'lucide-react';

interface IndicatorListProps {
  indicators: Indicator[];
  onUpdateName: (id: string, newName: string) => void;
  onSelect: (id: string) => void;
}

const IndicatorList: React.FC<IndicatorListProps> = ({ indicators, onUpdateName, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {indicators.map((indicator) => {
        // Calculate simple preview stats
        const validScores = indicator.scores.filter(s => s.score > 0);
        const lastScore = indicator.scores[indicator.scores.length - 1]?.score || 0;
        const avg = validScores.length > 0 
          ? (validScores.reduce((a, b) => a + b.score, 0) / validScores.length).toFixed(0) 
          : '-';

        return (
          <div 
            key={indicator.id} 
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow group flex flex-col"
          >
            <div className="mb-3">
              <label className="text-xs text-slate-400 font-semibold uppercase mb-1 block">
                指标名称
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={indicator.name}
                  onChange={(e) => onUpdateName(indicator.id, e.target.value)}
                  className="w-full text-slate-800 font-bold border-b border-transparent hover:border-slate-300 focus:border-primary focus:outline-none bg-transparent py-1 pr-6 truncate"
                  placeholder="请输入指标名称..."
                />
                <Edit2 className="w-3 h-3 text-slate-400 absolute right-1 top-2 opacity-0 group-hover:opacity-100 pointer-events-none" />
              </div>
            </div>

            <div className="flex justify-between items-end mt-auto pt-4">
              <div className="text-sm text-slate-500">
                <div>最新得分: <span className="font-bold text-slate-800">{lastScore}</span></div>
                <div className="text-xs mt-0.5">平均: {avg}</div>
              </div>
              <button
                onClick={() => onSelect(indicator.id)}
                className="flex items-center gap-1 text-sm font-medium text-primary bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <BarChart2 className="w-4 h-4" />
                分析
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default IndicatorList;
