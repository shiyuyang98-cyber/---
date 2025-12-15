import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  LayoutDashboard, 
  Menu,
  X,
  Factory,
  Cpu,
  Droplet,
  Wrench,
  Zap,
  Lightbulb,
  PackagePlus,
  ArrowLeft,
  Grid,
  FileBarChart
} from 'lucide-react';
import ScoreTable from './components/ScoreTable';
import { TrendChart, NormalDistributionChart } from './components/Charts';
import IndicatorList from './components/IndicatorList';
import GlobalSummary from './components/GlobalSummary';
import { calculateStats, generateDistributionCurve } from './utils/mathUtils';
import { analyzeScoresWithAI } from './services/geminiService';
import { ScoreData, AIAnalysisResult, Indicator } from './types';

// Platform Definitions
const PLATFORMS = [
  { id: 'stamping', name: '冲压', icon: Factory },
  { id: 'components', name: '组件', icon: Cpu },
  { id: 'electrophoresis', name: '电泳', icon: Droplet },
  { id: 'manual_assembly', name: '手动总成', icon: Wrench },
  { id: 'electric_assembly', name: '电动总成', icon: Zap },
  { id: 'innovation', name: '创新产品平台', icon: Lightbulb },
  { id: 'new_products', name: '新品平台', icon: PackagePlus },
];

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

// Helper to generate 23 empty indicators
const generateIndicators = (platformName: string): Indicator[] => {
  return Array.from({ length: 23 }, (_, i) => {
    const id = crypto.randomUUID();
    return {
      id,
      name: `指标 ${i + 1}`,
      scores: MONTHS.map((month, idx) => ({
        id: idx + 1,
        month: month,
        score: 0 // Start with 0 or random for demo
      })),
      analysis: null
    };
  });
};

// Initialize with some dummy data for demo purposes, but mostly zeros
const initializeData = () => {
  const map: Record<string, Indicator[]> = {};
  PLATFORMS.forEach(p => {
    map[p.id] = generateIndicators(p.name);
  });
  return map;
};

type ViewMode = 'platform' | 'summary';

function App() {
  const [currentPlatformId, setCurrentPlatformId] = useState<string>(PLATFORMS[0].id);
  const [viewMode, setViewMode] = useState<ViewMode>('platform');
  const [dataMap, setDataMap] = useState<Record<string, Indicator[]>>(initializeData);
  const [activeIndicatorId, setActiveIndicatorId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get current context
  const currentPlatform = PLATFORMS.find(p => p.id === currentPlatformId) || PLATFORMS[0];
  const platformIndicators = dataMap[currentPlatformId] || [];
  const activeIndicator = activeIndicatorId ? platformIndicators.find(i => i.id === activeIndicatorId) : null;

  // Derived Statistics for active indicator
  const stats = useMemo(() => activeIndicator ? calculateStats(activeIndicator.scores) : { mean: 0, stdDev: 0, min: 0, max: 0 }, [activeIndicator]);
  
  // Derived Distribution Curve
  const distributionCurve = useMemo(() => 
    generateDistributionCurve(stats.mean, stats.stdDev, activeIndicator?.analysis?.recommendedScore || null), 
    [stats, activeIndicator]
  );

  // --- Handlers ---

  const handleUpdateIndicatorName = (id: string, newName: string) => {
    setDataMap(prev => ({
      ...prev,
      [currentPlatformId]: prev[currentPlatformId].map(ind => 
        ind.id === id ? { ...ind, name: newName } : ind
      )
    }));
  };

  const handleUpdateScore = (scoreId: number, field: keyof ScoreData, value: string | number) => {
    if (!activeIndicatorId) return;
    
    setDataMap(prev => ({
      ...prev,
      [currentPlatformId]: prev[currentPlatformId].map(ind => {
        if (ind.id === activeIndicatorId) {
          return {
            ...ind,
            scores: ind.scores.map(s => s.id === scoreId ? { ...s, [field]: value } : s),
            analysis: null // Reset analysis on data change
          };
        }
        return ind;
      })
    }));
  };

  const handleResetScores = () => {
    if (!activeIndicatorId) return;

    setDataMap(prev => ({
      ...prev,
      [currentPlatformId]: prev[currentPlatformId].map(ind => {
        if (ind.id === activeIndicatorId) {
          return {
            ...ind,
            scores: ind.scores.map(s => ({ ...s, score: 0 })),
            analysis: null
          };
        }
        return ind;
      })
    }));
  };

  const runAnalysis = async () => {
    if (!activeIndicator) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeScoresWithAI(activeIndicator.scores, stats, currentPlatform.name, activeIndicator.name);
      
      // Save analysis to state
      setDataMap(prev => ({
        ...prev,
        [currentPlatformId]: prev[currentPlatformId].map(ind => 
          ind.id === activeIndicatorId ? { ...ind, analysis: result } : ind
        )
      }));

    } catch (err) {
      setError("无法生成AI分析报告，请检查网络连接。");
    } finally {
      setIsLoading(false);
    }
  };

  // Determine standard deviation distance for the target
  const getSigma = () => {
    if (!activeIndicator?.analysis || stats.stdDev === 0) return 0;
    const diff = activeIndicator.analysis.recommendedScore - stats.mean;
    return (diff / stats.stdDev).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 right-4 z-50 p-2 bg-white rounded-md shadow-md md:hidden"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex-shrink-0 flex flex-col
      `}>
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2 font-bold text-xl">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <span>数据分析平台</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">智能分数预测系统</p>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {/* Summary View Link */}
          <button
            onClick={() => {
              setViewMode('summary');
              setActiveIndicatorId(null);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium mb-4
              ${viewMode === 'summary'
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
              }`}
          >
            <FileBarChart className="w-5 h-5" />
            全平台汇总报表
          </button>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-2">各平台入口</div>
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            const isActive = viewMode === 'platform' && currentPlatformId === platform.id;
            return (
              <button
                key={platform.id}
                onClick={() => {
                  setCurrentPlatformId(platform.id);
                  setViewMode('platform');
                  setActiveIndicatorId(null); // Go back to list when changing platform
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                  ${isActive
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Icon className="w-5 h-5" />
                {platform.name}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto flex flex-col h-screen">
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          
          {/* Render based on View Mode */}
          {viewMode === 'summary' ? (
            <GlobalSummary platforms={PLATFORMS} dataMap={dataMap} />
          ) : (
            <>
              {/* Header Area */}
              <header className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                      {currentPlatform.name} 
                      <span className="text-slate-400 font-normal text-lg hidden sm:inline">| 质量指标管理</span>
                    </h1>
                    
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                       <span className="cursor-pointer hover:text-primary" onClick={() => setActiveIndicatorId(null)}>
                         {currentPlatform.name}
                       </span>
                       {activeIndicator && (
                         <>
                           <span>/</span>
                           <span className="font-semibold text-slate-700">{activeIndicator.name}</span>
                         </>
                       )}
                    </div>
                  </div>

                  {/* Action Buttons (Only visible in Detail View) */}
                  {activeIndicator && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveIndicatorId(null)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        返回列表
                      </button>
                      <button
                        onClick={runAnalysis}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white shadow-md transition-all
                          ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-primary hover:bg-indigo-700'}`}
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isLoading ? '分析中...' : '生成 AI 预测'}
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {/* View Switcher */}
              {!activeIndicator ? (
                /* --- Grid View (Indicators) --- */
                <div className="animate-fade-in">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                     <Grid className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                     <div>
                       <h3 className="font-semibold text-blue-900 text-sm">操作指南</h3>
                       <p className="text-blue-700 text-sm mt-1">
                         当前平台包含 23 个关键指标。您可以直接点击指标名称进行修改。点击“分析”按钮进入详情页录入分数并获取智能建议。
                       </p>
                     </div>
                  </div>
                  <IndicatorList 
                    indicators={platformIndicators}
                    onUpdateName={handleUpdateIndicatorName}
                    onSelect={setActiveIndicatorId}
                  />
                </div>
              ) : (
                /* --- Detail View (Single Indicator) --- */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                  
                  {/* Left Column: Data Input */}
                  <div className="lg:col-span-3 h-[500px] lg:h-auto">
                     <ScoreTable data={activeIndicator.scores} onUpdate={handleUpdateScore} onReset={handleResetScores} />
                  </div>

                  {/* Right Column: Visualizations & Analysis */}
                  <div className="lg:col-span-9 space-y-6">
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-semibold">平均分 (Mean)</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.mean.toFixed(1)}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-semibold">标准差 (Std Dev)</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.stdDev.toFixed(1)}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-semibold">最高分 (Max)</p>
                        <p className="text-2xl font-bold text-emerald-600">{stats.max}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                         <p className="text-xs text-slate-500 uppercase font-semibold">稳定性</p>
                         <p className="text-lg font-bold text-slate-800">
                           {stats.stdDev === 0 ? '-' : stats.stdDev < 2 ? '非常稳定' : stats.stdDev < 8 ? '正常' : '波动'}
                         </p>
                      </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-slate-500" />
                          12个月趋势
                        </h3>
                        <TrendChart data={activeIndicator.scores} />
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center text-[10px] font-bold text-emerald-700">Ω</span>
                          概率分布
                        </h3>
                        <NormalDistributionChart 
                          distributionData={distributionCurve} 
                          stats={stats} 
                          targetScore={activeIndicator.analysis?.recommendedScore || null} 
                          warningScore={activeIndicator.analysis?.warningScore || null}
                        />
                      </div>
                    </div>

                    {/* AI Analysis Row */}
                    <div className="bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden">
                       <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex items-center justify-between">
                         <h2 className="font-semibold text-indigo-900 flex items-center gap-2">
                           <Sparkles className="w-5 h-5 text-indigo-500" />
                           下个月目标建议 (AI)
                         </h2>
                         {activeIndicator.analysis && (
                           <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-indigo-600 shadow-sm border border-indigo-100">
                             难度: {activeIndicator.analysis.difficulty}
                           </span>
                         )}
                       </div>
                       
                       <div className="p-6">
                         {activeIndicator.analysis ? (
                           <div className="flex flex-col md:flex-row gap-8">
                             <div className="flex-shrink-0 text-center md:text-left space-y-4">
                               <div>
                                  <p className="text-sm text-slate-500 mb-1">建议目标分</p>
                                  <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                    {activeIndicator.analysis.recommendedScore}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1">
                                    (比平均值高 {getSigma()}σ)
                                  </p>
                               </div>
                               
                               <div className="pt-2 border-t border-slate-100">
                                  <p className="text-sm text-red-500 font-semibold mb-1 flex items-center justify-center md:justify-start gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    警戒值
                                  </p>
                                  <p className="text-2xl font-bold text-red-600">
                                    {activeIndicator.analysis.warningScore}
                                  </p>
                               </div>
                             </div>
                             
                             <div className="flex-1 space-y-4">
                               <div>
                                 <h4 className="font-bold text-slate-800 mb-1">分析摘要</h4>
                                 <p className="text-slate-600 text-sm leading-relaxed">{activeIndicator.analysis.reasoning}</p>
                               </div>
                               <div>
                                 <h4 className="font-bold text-slate-800 mb-2">关键行动建议</h4>
                                 <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                   {activeIndicator.analysis.advice.map((tip, idx) => (
                                     <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                       <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                       {tip}
                                     </li>
                                   ))}
                                 </ul>
                               </div>
                             </div>
                           </div>
                         ) : (
                           <div className="text-center py-10">
                             <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                               <BarChart3 className="w-6 h-6 text-slate-400" />
                             </div>
                             <p className="text-slate-500">
                               请录入该指标的历史数据，并点击右上角的<br/> "生成 AI 预测" 获取分析结果。
                             </p>
                           </div>
                         )}
                         {error && (
                           <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                             <AlertCircle className="w-4 h-4" />
                             {error}
                           </div>
                         )}
                       </div>
                    </div>

                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;