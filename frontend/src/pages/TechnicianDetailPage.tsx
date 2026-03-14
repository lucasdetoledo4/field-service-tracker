import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button, Dialog, AlertDialog, Spinner, Flex } from '@radix-ui/themes'
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Wrench, Calendar } from 'lucide-react'
import { useTechnician, useUpdateTechnician, useDeleteTechnician } from '../lib/queries/technicians'
import TechnicianForm from '../components/technicians/TechnicianForm'
import { ActiveBadge } from '../components/Badges'
import type { TechnicianCreate } from '../types/technician'

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

export default function TechnicianDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: technician, isLoading, isError } = useTechnician(id!)
  const updateTechnician = useUpdateTechnician(id!)
  const deleteTechnician = useDeleteTechnician()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleUpdate(data: TechnicianCreate) {
    updateTechnician.mutate(data, { onSuccess: () => setEditOpen(false) })
  }

  function handleDelete() {
    deleteTechnician.mutate(id!, { onSuccess: () => navigate('/technicians') })
  }

  if (isLoading) return (
    <div className="flex justify-center items-center py-32"><Spinner size="3" /></div>
  )
  if (isError || !technician) return (
    <div className="p-8">
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Technician not found.
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link to="/technicians" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6">
        <ArrowLeft size={14} /> Back to Technicians
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{technician.name}</h1>
            <ActiveBadge active={technician.is_active} />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Added {new Date(technician.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Flex gap="2">
          <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
            <Dialog.Trigger>
              <Button variant="outline" size="2"><Pencil size={13} /> Edit</Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="480px">
              <Dialog.Title>Edit technician</Dialog.Title>
              <Dialog.Description size="2" color="gray" mb="4">Update the technician's details.</Dialog.Description>
              <TechnicianForm
                defaultValues={technician}
                onSubmit={handleUpdate}
                onCancel={() => setEditOpen(false)}
                loading={updateTechnician.isPending}
              />
            </Dialog.Content>
          </Dialog.Root>

          <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialog.Trigger>
              <Button variant="soft" color="red" size="2"><Trash2 size={13} /> Delete</Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content maxWidth="400px">
              <AlertDialog.Title>Delete technician</AlertDialog.Title>
              <AlertDialog.Description>
                Are you sure you want to delete <strong>{technician.name}</strong>? This action cannot be undone.
              </AlertDialog.Description>
              <Flex gap="2" justify="end" mt="4">
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray">Cancel</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button color="red" loading={deleteTechnician.isPending} onClick={handleDelete}>
                    Delete technician
                  </Button>
                </AlertDialog.Action>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </Flex>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</p>
        </div>
        <div className="px-5 divide-y divide-slate-100">
          <InfoRow icon={Wrench} label="Specialty" value={technician.specialty} />
          <InfoRow icon={Mail} label="Email" value={technician.email} />
          <InfoRow icon={Phone} label="Phone" value={technician.phone} />
          <InfoRow icon={Calendar} label="Last updated" value={new Date(technician.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
        </div>
      </div>
    </div>
  )
}
