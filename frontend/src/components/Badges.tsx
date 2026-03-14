import type { WorkOrderStatus, WorkOrderPriority } from '../types/work-order'

const STATUS_CONFIG: Record<WorkOrderStatus, { label: string; className: string }> = {
  pending:     { label: 'Pending',     className: 'bg-slate-100 text-slate-700 border-slate-200' },
  assigned:    { label: 'Assigned',    className: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: { label: 'In Progress', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed:   { label: 'Completed',   className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled:   { label: 'Cancelled',   className: 'bg-red-50 text-red-600 border-red-200' },
}

const PRIORITY_CONFIG: Record<WorkOrderPriority, { label: string; className: string }> = {
  low:    { label: 'Low',    className: 'bg-slate-50 text-slate-500 border-slate-200' },
  medium: { label: 'Medium', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  high:   { label: 'High',   className: 'bg-orange-50 text-orange-700 border-orange-200' },
  urgent: { label: 'Urgent', className: 'bg-red-50 text-red-700 border-red-200' },
}

export function StatusBadge({ status }: { status: WorkOrderStatus }) {
  const { label, className } = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${className}`}>
      {label}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: WorkOrderPriority }) {
  const { label, className } = PRIORITY_CONFIG[priority]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${className}`}>
      {label}
    </span>
  )
}

export function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border bg-slate-100 text-slate-500 border-slate-200">
      Inactive
    </span>
  )
}
