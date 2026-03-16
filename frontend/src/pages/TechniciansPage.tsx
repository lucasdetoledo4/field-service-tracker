import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dialog, Spinner } from '@radix-ui/themes'
import { Plus, Wrench, Search, ChevronDown, ChevronUp, ChevronsUpDown, Pencil } from 'lucide-react'
import { useTechnicians, useCreateTechnician, useUpdateTechnician } from '../lib/queries/technicians'
import { parseApiError } from '../lib/api'
import TechnicianForm from '../components/technicians/TechnicianForm'
import Pagination from '../components/Pagination'
import { ActiveBadge } from '../components/Badges'
import { useToast } from '../components/Toast'
import type { TechnicianCreate, TechnicianFilters } from '../types/technician'

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
}

function SortTh({ label, field, filters, onSort }: {
  label: string
  field: string
  filters: TechnicianFilters
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

export default function TechniciansPage() {
  const toast = useToast()
  const [filters, setFilters] = useState<TechnicianFilters>({ page: 1, page_size: 20 })
  const [searchInput, setSearchInput] = useState('')
  const [statusOpen, setStatusOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchInput || undefined, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading, isError } = useTechnicians(filters)
  const createTechnician = useCreateTechnician()
  const updateTechnician = useUpdateTechnician(editingId ?? '')

  const technicians = data?.technicians ?? []
  const meta = data?.meta

  function handleSort(field: string) {
    setFilters(f => ({
      ...f,
      sort_by: field,
      sort_dir: f.sort_by === field && f.sort_dir === 'asc' ? 'desc' : 'asc',
      page: 1,
    }))
  }

  function handleCreate(data: TechnicianCreate) {
    createTechnician.mutate(data, {
      onSuccess: () => { setCreateOpen(false); toast.success('Technician created') },
      onError: (error) => toast.error(parseApiError(error)),
    })
  }

  function handleUpdate(data: TechnicianCreate) {
    updateTechnician.mutate(data, {
      onSuccess: () => { setEditingId(null); toast.success('Technician updated') },
      onError: (error) => toast.error(parseApiError(error)),
    })
  }

  const editingTechnician = technicians.find(t => t.id === editingId)

  const statusLabel =
    filters.is_active === true ? 'Active' :
    filters.is_active === false ? 'Inactive' : 'Status'

  function setStatusFilter(val: boolean | undefined) {
    setStatusOpen(false)
    setFilters(f => ({ ...f, is_active: val, page: 1 }))
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Technicians</h1>
        <p className="text-sm text-gray-400 mt-0.5">Home / Technicians</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search technicians..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setStatusOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
          >
            {statusLabel} <ChevronDown size={14} />
          </button>
          {statusOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              <button onClick={() => setStatusFilter(undefined)} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors rounded-t-lg">All</button>
              <button onClick={() => setStatusFilter(true)} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">Active</button>
              <button onClick={() => setStatusFilter(false)} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors rounded-b-lg">Inactive</button>
            </div>
          )}
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          <Plus size={15} /> New Technician
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-20"><Spinner size="3" /></div>
      )}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load technicians. Please try again.
        </div>
      )}
      {!isLoading && !isError && technicians.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Wrench size={20} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No technicians yet</p>
          <p className="text-slate-400 text-sm mt-1">Add your first technician to get started.</p>
        </div>
      )}

      {technicians.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3 w-10">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <SortTh label="Name"   field="name"      filters={filters} onSort={handleSort} />
                <SortTh label="Status" field="is_active" filters={filters} onSort={handleSort} />
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {technicians.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-5 py-3.5">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </td>
                  <td className="px-5 py-3.5">
                    <Link to={`/technicians/${t.id}`} className="flex items-center gap-2.5 group/link">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {getInitials(t.name)}
                      </div>
                      <span className="font-medium text-slate-900 group-hover/link:text-green-600 transition-colors">{t.name}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5"><ActiveBadge active={t.is_active} /></td>
                  <td className="px-5 py-3.5 text-slate-500">{t.email ?? <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-3.5 text-slate-500">{t.phone ?? <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setEditingId(t.id)}
                      className="text-slate-300 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
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
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>Add new technician</Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="4">
            Fill in the technician's details below.
          </Dialog.Description>
          <TechnicianForm
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            loading={createTechnician.isPending}
          />
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit dialog */}
      <Dialog.Root open={!!editingId} onOpenChange={open => { if (!open) setEditingId(null) }}>
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>Edit technician</Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="4">
            Update the technician's details.
          </Dialog.Description>
          <TechnicianForm
            defaultValues={editingTechnician}
            onSubmit={handleUpdate}
            onCancel={() => setEditingId(null)}
            loading={updateTechnician.isPending}
          />
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}
