import type { WorkOrderStatus, WorkOrderPriority } from '../types/work-order'

const STATUS_CONFIG: Record<WorkOrderStatus, { label: string; className: string }> = {
  pending:     { label: 'Pending',     className: 'bg-slate-100 text-slate-600 border-slate-200' },
  assigned:    { label: 'Assigned',    className: 'bg-sky-50 text-sky-700 border-sky-200' },
  in_progress: { label: 'In Progress', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed:   { label: 'Completed',   className: 'bg-green-50 text-green-700 border-green-200' },
  cancelled:   { label: 'Cancelled',   className: 'bg-red-50 text-red-600 border-red-200' },
}

const PRIORITY_CONFIG: Record<WorkOrderPriority, { label: string; className: string }> = {
  low:    { label: 'Low',    className: 'bg-slate-50 text-slate-500 border-slate-200' },
  medium: { label: 'Medium', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  high:   { label: 'High',   className: 'bg-orange-50 text-orange-700 border-orange-200' },
  urgent: { label: 'Urgent', className: 'bg-red-50 text-red-700 border-red-200' },
}

const BASE = 'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap'

export function StatusBadge({ status }: { status: WorkOrderStatus }) {
  const { label, className } = STATUS_CONFIG[status]
  return <span className={`${BASE} ${className}`}>{label}</span>
}

export function PriorityBadge({ priority }: { priority: WorkOrderPriority }) {
  const { label, className } = PRIORITY_CONFIG[priority]
  return <span className={`${BASE} ${className}`}>{label}</span>
}

export function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="flex items-center gap-1.5 text-sm">
      <span className="text-green-500">●</span>
      <span className="text-slate-700">Active</span>
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-sm">
      <span className="text-gray-400">●</span>
      <span className="text-slate-500">Inactive</span>
    </span>
  )
}
