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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [value, "分数"]}
            labelFormatter={(label) => `月份: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#4f46e5" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
            name="分数"
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
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={['auto', 'auto']} 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            tickFormatter={(val) => val.toFixed(0)}
          />
          <YAxis hide />
          <Tooltip 
             content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 shadow-lg rounded border border-slate-100 text-xs">
                      <p className="font-bold">分数: {label}</p>
                      <p className="text-slate-500">概率密度: {Number(payload[0].value).toFixed(4)}</p>
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
            fillOpacity={1} 
            fill="url(#colorDensity)" 
          />
          
          {/* Mean Line */}
          <ReferenceLine x={stats.mean} stroke="#64748b" strokeDasharray="3 3">
            <Label value="平均" position="top" fill="#64748b" fontSize={12} />
          </ReferenceLine>

          {/* Warning Line */}
          {warningScore && (
            <ReferenceLine x={warningScore} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5">
              <Label value="警戒" position="top" fill="#ef4444" fontSize={12} fontWeight="bold" />
            </ReferenceLine>
          )}

          {/* Target Line */}
          {targetScore && (
            <ReferenceLine x={targetScore} stroke="#f59e0b" strokeWidth={2}>
              <Label value="目标" position="top" fill="#f59e0b" fontSize={12} fontWeight="bold" />
            </ReferenceLine>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};