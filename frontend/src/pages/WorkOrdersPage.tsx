import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Dialog, Spinner, Select } from '@radix-ui/themes'
import { Plus, ClipboardList, ChevronRight, X } from 'lucide-react'
import { useWorkOrders, useCreateWorkOrder } from '../lib/queries/work-orders'
import { useClients } from '../lib/queries/clients'
import { useTechnicians } from '../lib/queries/technicians'
import WorkOrderForm from '../components/work-orders/WorkOrderForm'
import { StatusBadge, PriorityBadge } from '../components/Badges'
import type { WorkOrderCreate, WorkOrderFilters, WorkOrderStatus, WorkOrderPriority } from '../types/work-order'

const STATUSES: WorkOrderStatus[] = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled']
const PRIORITIES: WorkOrderPriority[] = ['low', 'medium', 'high', 'urgent']
const ALL = '_all_'

export default function WorkOrdersPage() {
  const [filters, setFilters] = useState<WorkOrderFilters>({})
  const [open, setOpen] = useState(false)

  const { data: workOrders, isLoading, isError } = useWorkOrders(filters)
  const { data: clients = [] } = useClients()
  const { data: technicians = [] } = useTechnicians()
  const createWorkOrder = useCreateWorkOrder()

  function handleCreate(data: WorkOrderCreate) {
    createWorkOrder.mutate(data, { onSuccess: () => setOpen(false) })
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Work Orders</h1>
          {workOrders && (
            <p className="text-sm text-slate-500 mt-0.5">{workOrders.length} {workOrders.length === 1 ? 'order' : 'orders'}{hasFilters ? ' matching filters' : ' total'}</p>
          )}
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger>
            <Button size="2"><Plus size={15} /> New Work Order</Button>
          </Dialog.Trigger>
          <Dialog.Content maxWidth="560px">
            <Dialog.Title>Create work order</Dialog.Title>
            <Dialog.Description size="2" color="gray" mb="4">
              Fill in the details for the new work order.
            </Dialog.Description>
            <WorkOrderForm
              clients={clients}
              technicians={technicians}
              onSubmit={handleCreate}
              onCancel={() => setOpen(false)}
              loading={createWorkOrder.isPending}
            />
          </Dialog.Content>
        </Dialog.Root>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <Select.Root
          value={filters.status ?? ALL}
          onValueChange={(v) => setFilters(f => ({ ...f, status: v === ALL ? undefined : v as WorkOrderStatus }))}
        >
          <Select.Trigger variant="soft" />
          <Select.Content>
            <Select.Item value={ALL}>All statuses</Select.Item>
            {STATUSES.map(s => <Select.Item key={s} value={s}>{s.replace('_', ' ')}</Select.Item>)}
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={filters.priority ?? ALL}
          onValueChange={(v) => setFilters(f => ({ ...f, priority: v === ALL ? undefined : v as WorkOrderPriority }))}
        >
          <Select.Trigger variant="soft" />
          <Select.Content>
            <Select.Item value={ALL}>All priorities</Select.Item>
            {PRIORITIES.map(p => <Select.Item key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</Select.Item>)}
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={filters.client_id ?? ALL}
          onValueChange={(v) => setFilters(f => ({ ...f, client_id: v === ALL ? undefined : v }))}
        >
          <Select.Trigger variant="soft" />
          <Select.Content>
            <Select.Item value={ALL}>All clients</Select.Item>
            {clients.map(c => <Select.Item key={c.id} value={c.id}>{c.name}</Select.Item>)}
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={filters.technician_id ?? ALL}
          onValueChange={(v) => setFilters(f => ({ ...f, technician_id: v === ALL ? undefined : v }))}
        >
          <Select.Trigger variant="soft" />
          <Select.Content>
            <Select.Item value={ALL}>All technicians</Select.Item>
            {technicians.map(t => <Select.Item key={t.id} value={t.id}>{t.name}</Select.Item>)}
          </Select.Content>
        </Select.Root>

        {hasFilters && (
          <button
            onClick={() => setFilters({})}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-20"><Spinner size="3" /></div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load work orders. Please try again.
        </div>
      )}

      {workOrders?.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ClipboardList size={20} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">{hasFilters ? 'No orders match your filters' : 'No work orders yet'}</p>
          <p className="text-slate-400 text-sm mt-1">
            {hasFilters ? 'Try adjusting your filters.' : 'Create your first work order to get started.'}
          </p>
        </div>
      )}

      {workOrders && workOrders.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Technician</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workOrders.map((wo) => {
                const client = clients.find(c => c.id === wo.client_id)
                const tech = technicians.find(t => t.id === wo.technician_id)
                return (
                  <tr key={wo.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link to={`/work-orders/${wo.id}`} className="font-medium text-slate-900 hover:text-indigo-600 transition-colors">
                        {wo.title}
                      </Link>
                      {wo.scheduled_at && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(wo.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={wo.status} /></td>
                    <td className="px-5 py-3.5"><PriorityBadge priority={wo.priority} /></td>
                    <td className="px-5 py-3.5 text-slate-500">{client?.name ?? <span className="text-slate-300">—</span>}</td>
                    <td className="px-5 py-3.5 text-slate-500">{tech?.name ?? <span className="text-slate-300">Unassigned</span>}</td>
                    <td className="px-5 py-3.5">
                      <Link to={`/work-orders/${wo.id}`} className="text-slate-300 group-hover:text-slate-400 transition-colors">
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
