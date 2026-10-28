import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getCategoryColor } from './CategoryChip';

interface ImpactDonutProps {
  distribution: Record<string, number>;
  total: number;
  className?: string;
  showHeader?: boolean;
}

export const ImpactDonut: React.FC<ImpactDonutProps> = ({
  distribution = {},
  total = 0,
  className = '',
  showHeader = false,
}) => {
  const data = Object.entries(distribution)
    .map(([name, value]) => ({
      name,
      value,
      color: getCategoryColor(name),
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className={`space-y-4 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Impact Insights</h3>
          <span className="text-[11px] text-slate-400">All categories</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Donut Chart with Center Total */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0];
                    const percent = total > 0 ? ((Number(item.value) / total) * 100).toFixed(0) : 0;
                    return (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs shadow-lg space-y-0.5">
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        <span className="text-slate-600 font-mono text-[11px]">
                          {item.value} issues ({percent}%)
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={65}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-slate-900 tabular-nums">{total}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reports</span>
          </div>
        </div>

        {/* Category Legend */}
        <div className="flex-1 w-full space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {data.map((entry) => {
            const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
            return (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-slate-700 font-medium truncate max-w-[120px]">{entry.name}</span>
                </div>
                <div className="font-mono text-slate-500">
                  <span className="font-bold text-slate-900">{entry.value}</span>
                  <span className="text-[10px] ml-1">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ImpactDonut;
