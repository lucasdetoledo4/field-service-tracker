import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dialog, Spinner } from '@radix-ui/themes'
import { Plus, Users, Search, ChevronDown, ChevronUp, ChevronsUpDown, Pencil } from 'lucide-react'
import { useClients, useCreateClient, useUpdateClient } from '../lib/queries/clients'
import ClientForm from '../components/clients/ClientForm'
import Pagination from '../components/Pagination'
import { useToast } from '../components/Toast'
import type { ClientCreate, ClientFilters } from '../types/client'

const SORT_OPTIONS = [
  { label: 'Name A→Z',  sort_by: 'name',       sort_dir: 'asc'  as const },
  { label: 'Name Z→A',  sort_by: 'name',       sort_dir: 'desc' as const },
  { label: 'Newest',    sort_by: 'created_at', sort_dir: 'desc' as const },
  { label: 'Oldest',    sort_by: 'created_at', sort_dir: 'asc'  as const },
]

function SortTh({ label, field, filters, onSort }: {
  label: string
  field: string
  filters: ClientFilters
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

export default function ClientsPage() {
  const toast = useToast()
  const [filters, setFilters] = useState<ClientFilters>({ page: 1, page_size: 20 })
  const [searchInput, setSearchInput] = useState('')
  const [sortOpen, setSortOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchInput || undefined, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading, isError } = useClients(filters)
  const createClient = useCreateClient()
  const updateClient = useUpdateClient(editingId ?? '')

  const clients = data?.clients ?? []
  const meta = data?.meta

  const sortLabel = SORT_OPTIONS.find(
    o => o.sort_by === filters.sort_by && o.sort_dir === filters.sort_dir
  )?.label ?? 'Sort by'

  function handleSort(field: string) {
    setFilters(f => ({
      ...f,
      sort_by: field,
      sort_dir: f.sort_by === field && f.sort_dir === 'asc' ? 'desc' : 'asc',
      page: 1,
    }))
  }

  function handleCreate(data: ClientCreate) {
    createClient.mutate(data, {
      onSuccess: () => { setCreateOpen(false); toast.success('Client created') },
      onError: () => toast.error('Failed to create client'),
    })
  }

  function handleUpdate(data: ClientCreate) {
    updateClient.mutate(data, {
      onSuccess: () => { setEditingId(null); toast.success('Client updated') },
      onError: () => toast.error('Failed to update client'),
    })
  }

  const editingClient = clients.find(c => c.id === editingId)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <p className="text-sm text-gray-400 mt-0.5">Home / Clients</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setSortOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
          >
            {sortLabel} <ChevronDown size={14} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => {
                    setFilters(f => ({ ...f, sort_by: opt.sort_by, sort_dir: opt.sort_dir, page: 1 }))
                    setSortOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          <Plus size={15} /> New Client
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-20"><Spinner size="3" /></div>
      )}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load clients. Please try again.
        </div>
      )}
      {!isLoading && !isError && clients.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users size={20} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No clients yet</p>
          <p className="text-slate-400 text-sm mt-1">Add your first client to get started.</p>
        </div>
      )}

      {clients.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3 w-10">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <SortTh label="Name"    field="name"       filters={filters} onSort={handleSort} />
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                <SortTh label="Created" field="created_at" filters={filters} onSort={handleSort} />
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-5 py-3.5">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </td>
                  <td className="px-5 py-3.5">
                    <Link to={`/clients/${c.id}`} className="font-medium text-slate-900 hover:text-green-600 transition-colors">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{c.email ?? <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-3.5 text-slate-500">{c.phone ?? <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setEditingId(c.id)}
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
          <Dialog.Title>Add new client</Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="4">
            Fill in the client's contact information below.
          </Dialog.Description>
          <ClientForm
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            loading={createClient.isPending}
          />
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit dialog */}
      <Dialog.Root open={!!editingId} onOpenChange={open => { if (!open) setEditingId(null) }}>
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>Edit client</Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="4">
            Update the client's contact information.
          </Dialog.Description>
          <ClientForm
            defaultValues={editingClient}
            onSubmit={handleUpdate}
            onCancel={() => setEditingId(null)}
            loading={updateClient.isPending}
          />
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}
