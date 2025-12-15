import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  ReferenceLine,
  Label
} from 'recharts';
import { ScoreData, DistributionPoint, StatisticalSummary } from '../types';

interface ChartsProps {
  scoreData: ScoreData[];
  distributionData: DistributionPoint[];
  stats: StatisticalSummary;
  targetScore: number | null;
  warningScore?: number | null;
}

export const TrendChart: React.FC<{ data: ScoreData[] }> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} 
            axisLine={false} 
            tickLine={false} 
            dy={10}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} 
            axisLine={false} 
            tickLine={false} 
            domain={['auto', 'auto']} 
            width={30}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)' }}
            formatter={(value: number) => [<span className="font-bold text-indigo-600">{value}</span>, "分数"]}
            labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#6366f1" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#fff', strokeWidth: 3, stroke: '#6366f1' }}
            activeDot={{ r: 6, fill: '#6366f1', stroke: '#c7d2fe', strokeWidth: 4 }}
            name="分数"
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const NormalDistributionChart: React.FC<ChartsProps> = ({ distributionData, stats, targetScore, warningScore }) => {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={distributionData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={['auto', 'auto']} 
            tick={{ fontSize: 11, fill: '#94a3b8' }} 
            tickFormatter={(val) => val.toFixed(0)}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis hide />
          <Tooltip 
             content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/90 backdrop-blur p-3 shadow-xl rounded-xl border border-slate-100 text-xs">
                      <p className="font-bold text-slate-800 mb-1">分数: {Number(label).toFixed(1)}</p>
                      <p className="text-emerald-600 font-medium">概率密度: {Number(payload[0].value).toFixed(4)}</p>
                    </div>
                  );
                }
                return null;
             }}
          />
          <Area 
            type="monotone" 
            dataKey="density" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorDensity)" 
            animationDuration={1500}
          />
          
          {/* Mean Line */}
          <ReferenceLine x={stats.mean} stroke="#94a3b8" strokeDasharray="4 4">
            <Label value="平均" position="top" fill="#94a3b8" fontSize={11} fontWeight="bold" />
          </ReferenceLine>

          {/* Warning Line */}
          {warningScore && (
            <ReferenceLine x={warningScore} stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3">
              <Label value="警戒线" position="top" fill="#ef4444" fontSize={11} fontWeight="bold" />
            </ReferenceLine>
          )}

          {/* Target Line */}
          {targetScore && (
            <ReferenceLine x={targetScore} stroke="#f59e0b" strokeWidth={2}>
              <Label value="目标" position="top" fill="#f59e0b" fontSize={11} fontWeight="bold" />
            </ReferenceLine>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};