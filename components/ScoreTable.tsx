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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800">历史数据录入 (近12个月)</h2>
        <button 
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          重置
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-2">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
            <tr>
              <th className="px-3 py-2">月份</th>
              <th className="px-3 py-2 text-right">分数</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.month}
                    onChange={(e) => onUpdate(row.id, 'month', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-700 font-medium"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={row.score}
                    onChange={(e) => onUpdate(row.id, 'score', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-100 rounded px-2 py-1 focus:ring-2 focus:ring-primary focus:outline-none text-slate-900 font-bold text-right"
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