import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { ComplaintRecord } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { StatusChip } from './StatusChip';
import { getCategoryIcon, getCategoryColor, getCategoryImage } from './CategoryChip';

interface ReportsTableProps {
  cases: ComplaintRecord[];
  onSelectCase?: (caseItem: ComplaintRecord) => void;
  selectedCaseId?: string | null;
  className?: string;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({
  cases = [],
  onSelectCase,
  selectedCaseId,
  className = '',
}) => {
  const navigate = useNavigate();

  return (
    <div className={`overflow-x-auto bg-transparent ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-4">Case ID</th>
            <th className="py-3.5 px-3">Thumb</th>
            <th className="py-3.5 px-4">Issue Type</th>
            <th className="py-3.5 px-4">Location</th>
            <th className="py-3.5 px-4">Severity</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Reported</th>
            <th className="py-3.5 px-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
          {cases.map((c) => {
            const isSelected = selectedCaseId === c.case_id;
            const CategoryIcon = getCategoryIcon(c.category);
            const categoryColor = getCategoryColor(c.category);
            const formattedDate = new Date(c.created_at).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });
            const formattedTime = new Date(c.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <tr
                key={c.id}
                onClick={() => {
                  if (onSelectCase) onSelectCase(c);
                  else navigate(`/case/${c.case_id}`);
                }}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50/80 border-l-4 border-l-blue-600' : 'hover:bg-slate-50/70'
                }`}
              >
                <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                  {c.case_id}
                </td>
                <td className="py-3 px-3">
                  <img
                    src={getCategoryImage(c.category, c.image_url)}
                    alt={c.category}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=300&q=80';
                    }}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200/80 shadow-2xs"
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="w-4 h-4 flex-shrink-0" style={{ color: categoryColor }} />
                    <span className="font-semibold text-slate-900 line-clamp-1">{c.category}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">
                  {c.address}
                </td>
                <td className="py-3 px-4">
                  <SeverityBadge severity={c.severity} />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <StatusChip status={c.status} />
                    {c.report_count > 1 && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] text-slate-600 px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200"
                        title={`${c.report_count} citizens reported this issue`}
                      >
                        <Users className="w-2.5 h-2.5 text-blue-600" />
                        <span>{c.report_count}</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">
                  <span>{formattedDate}</span>
                  <span className="text-[10px] block opacity-70">{formattedTime}</span>
                </td>
                <td className="py-3 px-2 text-slate-400">
                  <ChevronRight className="w-4 h-4" />
                </td>
              </tr>
            );
          })}
          {cases.length === 0 && (
            <tr>
              <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                No civic cases match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsTable;
