import React from 'react';
import { Indicator } from '../types';
import { TrendingUp, AlertTriangle, CheckCircle, MinusCircle, LayoutGrid, Layers, ShieldAlert } from 'lucide-react';

interface GlobalSummaryProps {
  platforms: { id: string; name: string }[];
  dataMap: Record<string, Indicator[]>;
}

const GlobalSummary: React.FC<GlobalSummaryProps> = ({ platforms, dataMap }) => {
  
  // Calculate aggregate stats
  let totalIndicators = 0;
  let abnormalCount = 0;
  let onTrackCount = 0;
  let analyzedCount = 0;

  platforms.forEach(p => {
    const inds = dataMap[p.id] || [];
    inds.forEach(i => {
      const active = i.scores.some(s => s.score > 0);
      if(active) totalIndicators++;
      if(i.analysis) {
        analyzedCount++;
        const lastScore = i.scores[i.scores.length - 1]?.score || 0;
        if(i.analysis.warningScore && lastScore < i.analysis.warningScore) {
          abnormalCount++;
        } else if (i.analysis.recommendedScore && lastScore >= i.analysis.recommendedScore) {
          onTrackCount++;
        }
      }
    });
  });

  const StatCard = ({ title, value, sub, icon: Icon, colorClass, bgClass }: any) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-800">{value}</p>
        <p className="text-xs text-slate-500 mt-2 font-medium">{sub}</p>
      </div>
      <div className={`p-3 rounded-xl ${bgClass}`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard 
           title="活跃指标总数" 
           value={totalIndicators} 
           sub="跨越 7 个平台" 
           icon={LayoutGrid} 
           colorClass="text-blue-600" 
           bgClass="bg-blue-50" 
         />
         <StatCard 
           title="已 AI 分析" 
           value={analyzedCount} 
           sub={`${totalIndicators > 0 ? Math.round((analyzedCount/totalIndicators)*100) : 0}% 覆盖率`} 
           icon={Layers} 
           colorClass="text-purple-600" 
           bgClass="bg-purple-50" 
         />
         <StatCard 
           title="正常/达成" 
           value={onTrackCount} 
           sub="运行状态良好" 
           icon={CheckCircle} 
           colorClass="text-emerald-600" 
           bgClass="bg-emerald-50" 
         />
         <StatCard 
           title="异常警告" 
           value={abnormalCount} 
           sub="需立即关注" 
           icon={ShieldAlert} 
           colorClass="text-red-600" 
           bgClass="bg-red-50" 
         />
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
          <div className="p-2 bg-indigo-100 rounded-lg">
             <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
             <h2 className="text-lg font-bold text-slate-900">详细达成报表</h2>
             <p className="text-slate-500 text-xs mt-0.5">所有平台实时监控数据汇总</p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {platforms.map((platform) => {
            const indicators = dataMap[platform.id] || [];
            const activeIndicators = indicators.filter(ind => 
               ind.scores.some(s => s.score > 0) || ind.analysis
            );

            if (activeIndicators.length === 0) return null;

            return (
              <div key={platform.id} className="border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-200 transition-colors">
                <div className="bg-slate-50/80 backdrop-blur px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    {platform.name}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                    {activeIndicators.length} 项指标
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white text-slate-400 font-semibold border-b border-slate-100 text-xs uppercase tracking-wide">
                      <tr>
                        <th className="px-6 py-4">指标名称</th>
                        <th className="px-6 py-4 text-right">上月实绩</th>
                        <th className="px-6 py-4 text-right">目标建议值</th>
                        <th className="px-6 py-4 text-right">警戒阈值</th>
                        <th className="px-6 py-4 text-center">当前状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                      {activeIndicators.map((ind) => {
                        const lastScore = ind.scores[ind.scores.length - 1]?.score || 0;
                        const target = ind.analysis?.recommendedScore;
                        const warning = ind.analysis?.warningScore;
                        
                        let statusIcon = <MinusCircle className="w-3.5 h-3.5 text-slate-400" />;
                        let statusText = "待分析";
                        let statusStyles = "text-slate-500 bg-slate-100 border-slate-200";

                        if (target !== undefined && warning !== undefined) {
                           if (lastScore < warning) {
                             statusIcon = <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
                             statusText = "异常";
                             statusStyles = "text-red-700 bg-red-50 border-red-100";
                           } else if (lastScore >= target) {
                             statusIcon = <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
                             statusText = "达成";
                             statusStyles = "text-emerald-700 bg-emerald-50 border-emerald-100";
                           } else {
                             statusIcon = <TrendingUp className="w-3.5 h-3.5 text-amber-600" />;
                             statusText = "进行中";
                             statusStyles = "text-amber-700 bg-amber-50 border-amber-100";
                           }
                        }

                        return (
                          <tr key={ind.id} className="hover:bg-indigo-50/30 transition-colors group">
                            <td className="px-6 py-4 font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">{ind.name}</td>
                            <td className="px-6 py-4 text-right">
                               <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">{lastScore > 0 ? lastScore : '-'}</span>
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-indigo-600">
                              {target !== undefined ? target : <span className="text-slate-300">-</span>}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-red-500">
                              {warning !== undefined ? warning : <span className="text-slate-300">-</span>}
                            </td>
                            <td className="px-6 py-4 text-center">
                               <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusStyles}`}>
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
          
          {Object.values(dataMap).every((list: Indicator[]) => list.every(i => i.scores.every(s => s.score === 0))) && (
             <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
               <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                 <LayoutGrid className="w-8 h-8 text-slate-300" />
               </div>
               <h3 className="text-slate-900 font-bold">暂无数据</h3>
               <p className="text-slate-500 mt-2 text-sm">请先在各平台录入指标分数并进行分析。</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSummary;