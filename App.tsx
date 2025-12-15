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
  FileBarChart,
  ChevronRight
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
    <div className="min-h-screen bg-slate-100 flex font-sans">
      
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-slate-200 md:hidden transition-transform active:scale-95"
      >
        {isSidebarOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex-shrink-0 flex flex-col
      `}>
        <div className="p-8 border-b border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center gap-3 font-bold text-2xl tracking-tight text-white">
            <div className="bg-indigo-500 p-2 rounded-lg shadow-lg shadow-indigo-500/30">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span>数据罗盘</span>
          </div>
          <p className="text-xs text-slate-400 mt-3 font-medium tracking-wide opacity-70">智能质量指标预测系统</p>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
          {/* Summary View Link */}
          <button
            onClick={() => {
              setViewMode('summary');
              setActiveIndicatorId(null);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-semibold mb-6 group relative overflow-hidden
              ${viewMode === 'summary'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <div className={`absolute inset-0 bg-white/10 opacity-0 transition-opacity ${viewMode === 'summary' ? 'opacity-0' : 'group-hover:opacity-100'}`}></div>
            <FileBarChart className={`w-5 h-5 ${viewMode === 'summary' ? 'text-white' : 'text-emerald-400'}`} />
            全平台汇总报表
          </button>

          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-6 px-4">平台入口</div>
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            const isActive = viewMode === 'platform' && currentPlatformId === platform.id;
            return (
              <button
                key={platform.id}
                onClick={() => {
                  setCurrentPlatformId(platform.id);
                  setViewMode('platform');
                  setActiveIndicatorId(null);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium relative group
                  ${isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-200' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                {platform.name}
                {isActive && <ChevronRight className="w-4 h-4 absolute right-3 text-indigo-300 opacity-70" />}
              </button>
            );
          })}
        </nav>
        
        {/* User / Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow-lg">AI</div>
             <div className="flex-1">
               <p className="text-sm font-semibold text-slate-200">Admin User</p>
               <p className="text-xs text-slate-500">在线</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto flex flex-col h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          
          {/* Render based on View Mode */}
          {viewMode === 'summary' ? (
            <div className="animate-slide-up">
               <GlobalSummary platforms={PLATFORMS} dataMap={dataMap} />
            </div>
          ) : (
            <>
              {/* Header Area */}
              <header className="mb-8 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
                      {currentPlatform.name} 
                      <span className="text-slate-300 font-light text-2xl hidden sm:inline">|</span>
                      <span className="text-slate-500 font-medium text-lg hidden sm:inline">质量指标管理</span>
                    </h1>
                    
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-2 font-medium">
                       <span 
                         className="cursor-pointer hover:text-indigo-600 transition-colors bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200" 
                         onClick={() => setActiveIndicatorId(null)}
                       >
                         {currentPlatform.name}
                       </span>
                       {activeIndicator && (
                         <>
                           <ChevronRight className="w-3 h-3 text-slate-400" />
                           <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{activeIndicator.name}</span>
                         </>
                       )}
                    </div>
                  </div>

                  {/* Action Buttons (Only visible in Detail View) */}
                  {activeIndicator && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveIndicatorId(null)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md transition-all text-sm font-semibold group"
                      >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        返回列表
                      </button>
                      <button
                        onClick={runAnalysis}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95
                          ${isLoading 
                            ? 'bg-slate-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'}`}
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isLoading ? 'AI 正在思考...' : '生成 AI 预测'}
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {/* View Switcher */}
              {!activeIndicator ? (
                /* --- Grid View (Indicators) --- */
                <div className="animate-slide-up">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-sm">
                     <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Grid className="w-6 h-6" />
                     </div>
                     <div>
                       <h3 className="font-bold text-blue-900 text-base">操作指南</h3>
                       <p className="text-blue-700/80 text-sm mt-1 leading-relaxed">
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up pb-10">
                  
                  {/* Left Column: Data Input */}
                  <div className="lg:col-span-3 h-[600px] lg:h-auto">
                     <ScoreTable data={activeIndicator.scores} onUpdate={handleUpdateScore} onReset={handleResetScores} />
                  </div>

                  {/* Right Column: Visualizations & Analysis */}
                  <div className="lg:col-span-9 space-y-6">
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">平均分 (Mean)</p>
                        <p className="text-3xl font-black text-slate-800 mt-1">{stats.mean.toFixed(1)}</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">标准差 (Std Dev)</p>
                        <p className="text-3xl font-black text-slate-800 mt-1">{stats.stdDev.toFixed(1)}</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">最高分 (Max)</p>
                        <p className="text-3xl font-black text-emerald-500 mt-1">{stats.max}</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                         <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">稳定性</p>
                         <div className="flex items-center gap-2 mt-1">
                           <span className={`w-3 h-3 rounded-full ${stats.stdDev < 2 ? 'bg-emerald-500 animate-pulse' : stats.stdDev < 8 ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                           <p className="text-xl font-bold text-slate-800">
                             {stats.stdDev === 0 ? '-' : stats.stdDev < 2 ? '非常稳定' : stats.stdDev < 8 ? '正常' : '波动'}
                           </p>
                         </div>
                      </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <div className="p-1.5 bg-indigo-100 rounded text-indigo-600">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          12个月趋势
                        </h3>
                        <TrendChart data={activeIndicator.scores} />
                      </div>

                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-100 rounded text-emerald-600 font-serif font-bold text-xs w-7 h-7 flex items-center justify-center">
                            Ω
                          </div>
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
                    <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-white overflow-hidden transform transition-all hover:scale-[1.01]">
                       <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-1">
                          <div className="bg-white/95 backdrop-blur-xl p-4 flex items-center justify-between">
                             <h2 className="font-bold text-indigo-900 flex items-center gap-2 text-lg">
                               <Sparkles className="w-5 h-5 text-purple-500 fill-purple-100" />
                               AI 智能分析报告
                             </h2>
                             {activeIndicator.analysis && (
                               <span className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full text-xs font-bold text-indigo-600 border border-indigo-100">
                                 难度指数: {activeIndicator.analysis.difficulty}
                               </span>
                             )}
                          </div>
                       </div>
                       
                       <div className="p-8">
                         {activeIndicator.analysis ? (
                           <div className="flex flex-col md:flex-row gap-10">
                             <div className="flex-shrink-0 text-center md:text-left space-y-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
                               <div>
                                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">建议目标值</p>
                                  <div className="relative inline-block">
                                     <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 drop-shadow-sm">
                                       {activeIndicator.analysis.recommendedScore}
                                     </p>
                                  </div>
                                  <p className="text-xs font-medium text-slate-400 mt-2 bg-slate-50 inline-block px-2 py-1 rounded">
                                    较平均值 +{getSigma()}σ
                                  </p>
                               </div>
                               
                               <div className="pt-4">
                                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center justify-center md:justify-start gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    警戒阈值
                                  </p>
                                  <p className="text-3xl font-bold text-slate-700">
                                    {activeIndicator.analysis.warningScore}
                                  </p>
                               </div>
                             </div>
                             
                             <div className="flex-1 space-y-6">
                               <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                 <h4 className="font-bold text-indigo-900 mb-2 text-sm">分析摘要</h4>
                                 <p className="text-indigo-800/80 text-sm leading-relaxed">{activeIndicator.analysis.reasoning}</p>
                               </div>
                               <div>
                                 <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    关键行动建议
                                 </h4>
                                 <div className="grid grid-cols-1 gap-3">
                                   {activeIndicator.analysis.advice.map((tip, idx) => (
                                     <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all">
                                       <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                         {idx + 1}
                                       </div>
                                       <p className="text-sm text-slate-600 mt-0.5 font-medium">{tip}</p>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             </div>
                           </div>
                         ) : (
                           <div className="text-center py-16 flex flex-col items-center justify-center opacity-60">
                             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                               <BarChart3 className="w-8 h-8 text-slate-400" />
                             </div>
                             <h3 className="text-lg font-bold text-slate-700">等待分析</h3>
                             <p className="text-slate-500 mt-2 max-w-sm">
                               请录入历史数据，点击上方 <span className="text-indigo-600 font-bold">"生成 AI 预测"</span> 按钮启动智能分析引擎。
                             </p>
                           </div>
                         )}
                         {error && (
                           <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm shadow-sm">
                             <AlertCircle className="w-5 h-5 flex-shrink-0" />
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