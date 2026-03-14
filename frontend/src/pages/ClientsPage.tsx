import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Dialog, Spinner } from '@radix-ui/themes'
import { Plus, Users, ChevronRight, Mail, Phone } from 'lucide-react'
import { useClients, useCreateClient } from '../lib/queries/clients'
import ClientForm from '../components/clients/ClientForm'
import type { ClientCreate } from '../types/client'

export default function ClientsPage() {
  const { data: clients, isLoading, isError } = useClients()
  const createClient = useCreateClient()
  const [open, setOpen] = useState(false)

  function handleCreate(data: ClientCreate) {
    createClient.mutate(data, { onSuccess: () => setOpen(false) })
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          {clients && (
            <p className="text-sm text-slate-500 mt-0.5">{clients.length} {clients.length === 1 ? 'client' : 'clients'} total</p>
          )}
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger>
            <Button size="2">
              <Plus size={15} /> New Client
            </Button>
          </Dialog.Trigger>
          <Dialog.Content maxWidth="480px">
            <Dialog.Title>Add new client</Dialog.Title>
            <Dialog.Description size="2" color="gray" mb="4">
              Fill in the client's contact information below.
            </Dialog.Description>
            <ClientForm
              onSubmit={handleCreate}
              onCancel={() => setOpen(false)}
              loading={createClient.isPending}
            />
          </Dialog.Content>
        </Dialog.Root>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Spinner size="3" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load clients. Please try again.
        </div>
      )}

      {/* Empty */}
      {clients?.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users size={20} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No clients yet</p>
          <p className="text-slate-400 text-sm mt-1">Add your first client to get started.</p>
        </div>
      )}

      {/* Table */}
      {clients && clients.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((c) => (
                <tr key={c.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link to={`/clients/${c.id}`} className="font-medium text-slate-900 hover:text-indigo-600 transition-colors">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    {c.email ? (
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Mail size={13} className="text-slate-400" />{c.email}
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {c.phone ? (
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Phone size={13} className="text-slate-400" />{c.phone}
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link to={`/clients/${c.id}`} className="text-slate-300 group-hover:text-slate-400 transition-colors">
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
