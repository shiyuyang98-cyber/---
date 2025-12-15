import React from 'react';
import { Indicator } from '../types';
import { Edit2, BarChart2, TrendingUp } from 'lucide-react';

interface IndicatorListProps {
  indicators: Indicator[];
  onUpdateName: (id: string, newName: string) => void;
  onSelect: (id: string) => void;
}

const IndicatorList: React.FC<IndicatorListProps> = ({ indicators, onUpdateName, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {indicators.map((indicator) => {
        // Calculate stats
        const validScores = indicator.scores.filter(s => s.score > 0);
        const lastScore = indicator.scores[indicator.scores.length - 1]?.score || 0;
        const avg = validScores.length > 0 
          ? (validScores.reduce((a, b) => a + b.score, 0) / validScores.length).toFixed(0) 
          : '-';
        
        // Intensity color based on last score (mock logic for visual variety)
        const intensityColor = lastScore > 90 ? 'bg-emerald-500' : lastScore > 70 ? 'bg-indigo-500' : lastScore > 0 ? 'bg-amber-500' : 'bg-slate-200';
        const shadowColor = lastScore > 90 ? 'shadow-emerald-500/20' : lastScore > 70 ? 'shadow-indigo-500/20' : lastScore > 0 ? 'shadow-amber-500/20' : 'shadow-slate-200';

        return (
          <div 
            key={indicator.id} 
            className={`
              bg-white rounded-2xl p-5 border border-slate-100 flex flex-col relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${shadowColor}
            `}
          >
            {/* Top decorative bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${intensityColor} opacity-0 group-hover:opacity-100 transition-opacity`} />

            <div className="mb-4 relative z-10">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                指标名称
              </label>
              <div className="relative group/input">
                <input 
                  type="text" 
                  value={indicator.name}
                  onChange={(e) => onUpdateName(indicator.id, e.target.value)}
                  className="w-full text-slate-800 font-bold text-lg border-b-2 border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none bg-transparent py-1 pr-6 truncate transition-colors"
                  placeholder="输入指标..."
                />
                <Edit2 className="w-3 h-3 text-slate-300 absolute right-0 top-3 opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </div>

            <div className="mt-auto pt-4 relative z-10">
               <div className="flex items-end justify-between mb-3">
                 <div>
                   <p className="text-xs text-slate-400 font-medium">最近实绩</p>
                   <p className="text-2xl font-black text-slate-800">{lastScore}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-xs text-slate-400 font-medium">12月均值</p>
                   <p className="text-sm font-bold text-slate-600">{avg}</p>
                 </div>
               </div>

               {/* Mini progress bar visualization */}
               <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                 <div 
                   className={`h-full rounded-full transition-all duration-1000 ease-out ${intensityColor}`} 
                   style={{ width: `${Math.min(lastScore, 100)}%` }} 
                 />
               </div>

              <button
                onClick={() => onSelect(indicator.id)}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white px-3 py-2.5 rounded-xl transition-all active:scale-95"
              >
                <BarChart2 className="w-4 h-4" />
                进入分析
              </button>
            </div>
            
            {/* Background decoration */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-slate-50 rounded-full group-hover:bg-indigo-50/50 transition-colors z-0"></div>
          </div>
        );
      })}
    </div>
  );
};

export default IndicatorList;