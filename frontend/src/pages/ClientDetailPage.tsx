import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button, Dialog, AlertDialog, Spinner, Flex } from '@radix-ui/themes'
import { ArrowLeft, Pencil, Trash2, Mail, Phone, MapPin, Calendar } from 'lucide-react'
import { useClient, useUpdateClient, useDeleteClient } from '../lib/queries/clients'
import ClientForm from '../components/clients/ClientForm'
import type { ClientCreate } from '../types/client'

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-800 mt-0.5">{value ?? <span className="text-slate-300">Not provided</span>}</p>
      </div>
    </div>
  )
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: client, isLoading, isError } = useClient(id!)
  const updateClient = useUpdateClient(id!)
  const deleteClient = useDeleteClient()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleUpdate(data: ClientCreate) {
    updateClient.mutate(data, { onSuccess: () => setEditOpen(false) })
  }

  function handleDelete() {
    deleteClient.mutate(id!, { onSuccess: () => navigate('/clients') })
  }

  if (isLoading) return (
    <div className="flex justify-center items-center py-32"><Spinner size="3" /></div>
  )
  if (isError || !client) return (
    <div className="p-8">
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Client not found.
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <Link to="/clients" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6">
        <ArrowLeft size={14} /> Back to Clients
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
          <p className="text-sm text-slate-400 mt-1">
            Added {new Date(client.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Flex gap="2">
          <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
            <Dialog.Trigger>
              <Button variant="outline" size="2">
                <Pencil size={13} /> Edit
              </Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="480px">
              <Dialog.Title>Edit client</Dialog.Title>
              <Dialog.Description size="2" color="gray" mb="4">
                Update the client's contact information.
              </Dialog.Description>
              <ClientForm
                defaultValues={client}
                onSubmit={handleUpdate}
                onCancel={() => setEditOpen(false)}
                loading={updateClient.isPending}
              />
            </Dialog.Content>
          </Dialog.Root>

          <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialog.Trigger>
              <Button variant="soft" color="red" size="2">
                <Trash2 size={13} /> Delete
              </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content maxWidth="400px">
              <AlertDialog.Title>Delete client</AlertDialog.Title>
              <AlertDialog.Description>
                Are you sure you want to delete <strong>{client.name}</strong>? This action cannot be undone.
              </AlertDialog.Description>
              <Flex gap="2" justify="end" mt="4">
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray">Cancel</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button color="red" loading={deleteClient.isPending} onClick={handleDelete}>
                    Delete client
                  </Button>
                </AlertDialog.Action>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </Flex>
      </div>

      {/* Info card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Information</p>
        </div>
        <div className="px-5 divide-y divide-slate-100">
          <InfoRow icon={Mail} label="Email" value={client.email} />
          <InfoRow icon={Phone} label="Phone" value={client.phone} />
          <InfoRow icon={MapPin} label="Address" value={client.address} />
          <InfoRow icon={Calendar} label="Last updated" value={new Date(client.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
        </div>
      </div>
    </div>
  )
}
