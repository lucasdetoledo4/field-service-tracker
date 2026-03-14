import { ArrowRight } from 'lucide-react'
import { StatusBadge } from '../Badges'
import type { WorkOrderStatusHistory } from '../../types/work-order'

interface Props {
  history: WorkOrderStatusHistory[]
}

export default function HistoryTimeline({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-400">
        No status changes recorded yet.
      </div>
    )
  }

  return (
    <ol className="space-y-0">
      {history.map((entry, idx) => (
        <li key={entry.id} className="flex gap-4">
          {/* Timeline line + dot */}
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 border-2 border-white ring-1 ring-indigo-200 mt-1 flex-shrink-0" />
            {idx < history.length - 1 && (
              <div className="w-px flex-1 bg-slate-200 mt-1" />
            )}
          </div>

          {/* Content */}
          <div className="pb-5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {entry.from_status && (
                <>
                  <StatusBadge status={entry.from_status} />
                  <ArrowRight size={12} className="text-slate-400 flex-shrink-0" />
                </>
              )}
              <StatusBadge status={entry.to_status} />
            </div>
            {entry.notes && (
              <p className="text-sm text-slate-600 mt-1.5 bg-slate-50 border border-slate-100 rounded-md px-3 py-2">
                {entry.notes}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-1.5">
              {new Date(entry.created_at).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
