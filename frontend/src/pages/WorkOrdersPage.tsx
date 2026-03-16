import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dialog, Spinner } from '@radix-ui/themes'
import { Plus, ClipboardList, Search, ChevronDown, ChevronUp, ChevronsUpDown, Pencil } from 'lucide-react'
import { useWorkOrders, useCreateWorkOrder, useUpdateWorkOrder } from '../lib/queries/work-orders'
import { useClients } from '../lib/queries/clients'
import { useTechnicians } from '../lib/queries/technicians'
import WorkOrderForm from '../components/work-orders/WorkOrderForm'
import { StatusBadge, PriorityBadge } from '../components/Badges'
import Pagination from '../components/Pagination'
import { useToast } from '../components/Toast'
import type { WorkOrderCreate, WorkOrderFilters, WorkOrderStatus, WorkOrderPriority } from '../types/work-order'

const STATUSES: WorkOrderStatus[] = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled']
const PRIORITIES: WorkOrderPriority[] = ['low', 'medium', 'high', 'urgent']

function woDisplayId(id: string) {
  return 'WO-' + id.replace(/-/g, '').slice(-4).toUpperCase()
}

function SortTh({ label, field, filters, onSort }: {
  label: string
  field: string
  filters: WorkOrderFilters
  onSort: (field: string) => void
}) {
  const active = filters.sort_by === field
  const dir = filters.sort_dir
  return (
    <th
      onClick={() => onSort(field)}
      className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none group"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active
          ? dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
          : <ChevronsUpDown size={11} className="opacity-0 group-hover:opacity-40 transition-opacity" />}
      </span>
    </th>
  )
}

export default function WorkOrdersPage() {
  const toast = useToast()
  const [filters, setFilters] = useState<WorkOrderFilters>({ page: 1, page_size: 20 })
  const [searchInput, setSearchInput] = useState('')
  const [statusOpen, setStatusOpen] = useState(false)
  const [priorityOpen, setPriorityOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchInput || undefined, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading, isError } = useWorkOrders(filters)
  const { data: clientsData } = useClients()
  const { data: techniciansData } = useTechnicians()
  const createWorkOrder = useCreateWorkOrder()
  const updateWorkOrder = useUpdateWorkOrder(editingId ?? '')

  const workOrders = data?.work_orders ?? []
  const meta = data?.meta
  const clients = clientsData?.clients ?? []
  const technicians = techniciansData?.technicians ?? []

  function handleSort(field: string) {
    setFilters(f => ({
      ...f,
      sort_by: field,
      sort_dir: f.sort_by === field && f.sort_dir === 'asc' ? 'desc' : 'asc',
      page: 1,
    }))
  }

  function handleCreate(data: WorkOrderCreate) {
    createWorkOrder.mutate(data, {
      onSuccess: () => { setCreateOpen(false); toast.success('Work order created') },
      onError: () => toast.error('Failed to create work order'),
    })
  }

  function handleUpdate(data: WorkOrderCreate) {
    updateWorkOrder.mutate(data, {
      onSuccess: () => { setEditingId(null); toast.success('Work order updated') },
      onError: () => toast.error('Failed to update work order'),
    })
  }

  const editingWorkOrder = workOrders.find(wo => wo.id === editingId)

  const statusLabel = filters.status
    ? filters.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Status'
  const priorityLabel = filters.priority
    ? filters.priority.charAt(0).toUpperCase() + filters.priority.slice(1)
    : 'Priority'

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Work Orders</h1>
        <p className="text-sm text-gray-400 mt-0.5">Home / Work Orders</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search work orders..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => { setStatusOpen(o => !o); setPriorityOpen(false) }}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
          >
            {statusLabel} <ChevronDown size={14} />
          </button>
          {statusOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              <button onClick={() => { setFilters(f => ({ ...f, status: undefined, page: 1 })); setStatusOpen(false) }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg transition-colors">All</button>
              {STATUSES.map(s => (
                <button key={s} onClick={() => { setFilters(f => ({ ...f, status: s, page: 1 })); setStatusOpen(false) }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors last:rounded-b-lg">
                  {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setPriorityOpen(o => !o); setStatusOpen(false) }}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
          >
            {priorityLabel} <ChevronDown size={14} />
          </button>
          {priorityOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              <button onClick={() => { setFilters(f => ({ ...f, priority: undefined, page: 1 })); setPriorityOpen(false) }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg transition-colors">All</button>
              {PRIORITIES.map(p => (
                <button key={p} onClick={() => { setFilters(f => ({ ...f, priority: p, page: 1 })); setPriorityOpen(false) }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors last:rounded-b-lg">
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          <Plus size={15} /> New Work Order
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-20"><Spinner size="3" /></div>
      )}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load work orders. Please try again.
        </div>
      )}
      {!isLoading && !isError && workOrders.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ClipboardList size={20} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No work orders yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first work order to get started.</p>
        </div>
      )}

      {workOrders.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3 w-10">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">ID</th>
                <SortTh label="Title"      field="title"        filters={filters} onSort={handleSort} />
                <SortTh label="Client"     field="client_name"     filters={filters} onSort={handleSort} />
                <SortTh label="Technician" field="technician_name"  filters={filters} onSort={handleSort} />
                <SortTh label="Status"     field="status"       filters={filters} onSort={handleSort} />
                <SortTh label="Priority"   field="priority"     filters={filters} onSort={handleSort} />
                <SortTh label="Scheduled"  field="scheduled_at" filters={filters} onSort={handleSort} />
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workOrders.map((wo) => {
                const client = clients.find(c => c.id === wo.client_id)
                const tech = technicians.find(t => t.id === wo.technician_id)
                return (
                  <tr key={wo.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-3.5">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{woDisplayId(wo.id)}</td>
                    <td className="px-5 py-3.5">
                      <Link to={`/work-orders/${wo.id}`} className="font-medium text-slate-900 hover:text-green-600 transition-colors">
                        {wo.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{client?.name ?? <span className="text-slate-300">—</span>}</td>
                    <td className="px-5 py-3.5 text-slate-500">{tech?.name ?? <span className="text-slate-300">Unassigned</span>}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={wo.status} /></td>
                    <td className="px-5 py-3.5"><PriorityBadge priority={wo.priority} /></td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {wo.scheduled_at
                        ? new Date(wo.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setEditingId(wo.id)}
                        className="text-slate-300 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {meta && meta.total_pages > 1 && (
            <Pagination
              page={meta.page}
              totalPages={meta.total_pages}
              total={meta.total}
              from={meta.from}
              to={meta.to}
              onPageChange={p => setFilters(f => ({ ...f, page: p }))}
            />
          )}
        </div>
      )}

      {/* Create dialog */}
      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Content maxWidth="560px">
          <Dialog.Title>Create work order</Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="4">
            Fill in the details for the new work order.
          </Dialog.Description>
          <WorkOrderForm
            clients={clients}
            technicians={technicians}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            loading={createWorkOrder.isPending}
          />
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit dialog */}
      <Dialog.Root open={!!editingId} onOpenChange={open => { if (!open) setEditingId(null) }}>
        <Dialog.Content maxWidth="560px">
          <Dialog.Title>Edit work order</Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="4">
            Update the work order details.
          </Dialog.Description>
          <WorkOrderForm
            defaultValues={editingWorkOrder}
            clients={clients}
            technicians={technicians}
            onSubmit={handleUpdate}
            onCancel={() => setEditingId(null)}
            loading={updateWorkOrder.isPending}
          />
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}
