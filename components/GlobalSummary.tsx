import React from 'react';
import { Indicator } from '../types';
import { TrendingUp, AlertTriangle, CheckCircle, MinusCircle } from 'lucide-react';

interface GlobalSummaryProps {
  platforms: { id: string; name: string }[];
  dataMap: Record<string, Indicator[]>;
}

const GlobalSummary: React.FC<GlobalSummaryProps> = ({ platforms, dataMap }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">全平台指标达成情况总览</h2>
        <p className="text-slate-500 text-sm">
          汇总所有平台的指标得分、AI推荐目标值及警戒值。
        </p>
      </div>

      <div className="space-y-6">
        {platforms.map((platform) => {
          const indicators = dataMap[platform.id] || [];
          // Only show platforms that have at least one indicator with data (score > 0) or analysis
          const activeIndicators = indicators.filter(ind => 
             ind.scores.some(s => s.score > 0) || ind.analysis
          );

          if (activeIndicators.length === 0) return null;

          return (
            <div key={platform.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  {platform.name}
                </h3>
                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                  {activeIndicators.length} 个活跃指标
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">指标名称</th>
                      <th className="px-6 py-3 text-right">上月实绩</th>
                      <th className="px-6 py-3 text-right">目标建议值</th>
                      <th className="px-6 py-3 text-right text-red-600">警戒值</th>
                      <th className="px-6 py-3 text-center">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeIndicators.map((ind) => {
                      const lastScore = ind.scores[ind.scores.length - 1]?.score || 0;
                      const target = ind.analysis?.recommendedScore;
                      const warning = ind.analysis?.warningScore;
                      
                      let statusIcon = <MinusCircle className="w-4 h-4 text-slate-300 mx-auto" />;
                      let statusText = "待分析";
                      let statusColor = "text-slate-400";

                      if (target !== undefined && warning !== undefined) {
                         if (lastScore < warning) {
                           statusIcon = <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" />;
                           statusText = "异常";
                           statusColor = "text-red-600 bg-red-50";
                         } else if (lastScore >= target) {
                           statusIcon = <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />;
                           statusText = "达成";
                           statusColor = "text-emerald-600 bg-emerald-50";
                         } else {
                           statusIcon = <TrendingUp className="w-4 h-4 text-amber-500 mx-auto" />;
                           statusText = "进行中";
                           statusColor = "text-amber-600 bg-amber-50";
                         }
                      }

                      return (
                        <tr key={ind.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-700">{ind.name}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900">{lastScore > 0 ? lastScore : '-'}</td>
                          <td className="px-6 py-4 text-right text-indigo-600 font-bold">
                            {target !== undefined ? target : <span className="text-slate-300 font-normal">-</span>}
                          </td>
                          <td className="px-6 py-4 text-right text-red-500 font-medium">
                            {warning !== undefined ? warning : <span className="text-slate-300 font-normal">-</span>}
                          </td>
                          <td className="px-6 py-4 text-center">
                             <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                               {statusIcon}
                               {statusText}
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        
        {/* Empty State if no data entered anywhere */}
        {Object.values(dataMap).every((list: Indicator[]) => list.every(i => i.scores.every(s => s.score === 0))) && (
           <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
             <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
               <TrendingUp className="w-6 h-6 text-slate-400" />
             </div>
             <p className="text-slate-500">暂无数据。请先在各平台录入指标分数并进行分析。</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSummary;