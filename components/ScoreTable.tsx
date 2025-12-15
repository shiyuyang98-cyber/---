import React from 'react';
import { ScoreData } from '../types';
import { RotateCcw } from 'lucide-react';

interface ScoreTableProps {
  data: ScoreData[];
  onUpdate: (id: number, field: keyof ScoreData, value: string | number) => void;
  onReset: () => void;
}

const ScoreTable: React.FC<ScoreTableProps> = ({ data, onUpdate, onReset }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
          历史数据录入
        </h2>
        <button 
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-3 custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-slate-400 uppercase tracking-wider sticky top-0 bg-white z-10">
            <tr>
              <th className="px-3 py-2 font-semibold">月份</th>
              <th className="px-3 py-2 text-right font-semibold">分数</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row) => (
              <tr key={row.id} className="group hover:bg-indigo-50/30 transition-colors">
                <td className="px-3 py-2.5">
                  <input
                    type="text"
                    value={row.month}
                    onChange={(e) => onUpdate(row.id, 'month', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-600 font-medium group-hover:text-indigo-700 transition-colors"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    value={row.score}
                    onChange={(e) => onUpdate(row.id, 'score', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 rounded-lg px-3 py-1.5 border border-transparent focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none text-slate-800 font-bold text-right transition-all"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreTable;