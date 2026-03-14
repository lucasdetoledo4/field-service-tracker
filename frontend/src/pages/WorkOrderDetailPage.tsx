import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button, Dialog, AlertDialog, Spinner, Flex } from '@radix-ui/themes'
import { ArrowLeft, Pencil, Trash2, User, Wrench, Calendar, Clock, AlignLeft } from 'lucide-react'
import {
  useWorkOrder, useUpdateWorkOrder, useDeleteWorkOrder,
  useTransitionStatus, useWorkOrderHistory,
} from '../lib/queries/work-orders'
import { useClients } from '../lib/queries/clients'
import { useTechnicians } from '../lib/queries/technicians'
import WorkOrderForm from '../components/work-orders/WorkOrderForm'
import StatusTransitionDialog from '../components/work-orders/StatusTransitionDialog'
import HistoryTimeline from '../components/work-orders/HistoryTimeline'
import { StatusBadge, PriorityBadge } from '../components/Badges'
import type { WorkOrderCreate, WorkOrderStatus } from '../types/work-order'

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-800 mt-0.5">{value ?? <span className="text-slate-300">Not set</span>}</p>
      </div>
    </div>
  )
}

export default function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: wo, isLoading, isError } = useWorkOrder(id!)
  const { data: history = [] } = useWorkOrderHistory(id!)
  const { data: clients = [] } = useClients()
  const { data: technicians = [] } = useTechnicians()
  const updateWorkOrder = useUpdateWorkOrder(id!)
  const deleteWorkOrder = useDeleteWorkOrder()
  const transitionStatus = useTransitionStatus(id!)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleUpdate(data: WorkOrderCreate) {
    updateWorkOrder.mutate(data, { onSuccess: () => setEditOpen(false) })
  }

  function handleDelete() {
    deleteWorkOrder.mutate(id!, { onSuccess: () => navigate('/work-orders') })
  }

  function handleTransition(toStatus: WorkOrderStatus, notes?: string) {
    transitionStatus.mutate({ to_status: toStatus, notes })
  }

  if (isLoading) return (
    <div className="flex justify-center items-center py-32"><Spinner size="3" /></div>
  )
  if (isError || !wo) return (
    <div className="p-8">
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Work order not found.
      </div>
    </div>
  )

  const client = clients.find(c => c.id === wo.client_id)
  const tech = technicians.find(t => t.id === wo.technician_id)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/work-orders" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6">
        <ArrowLeft size={14} /> Back to Work Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 truncate">{wo.title}</h1>
            <StatusBadge status={wo.status} />
            <PriorityBadge priority={wo.priority} />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Created {new Date(wo.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Flex gap="2" flex-shrink="0">
          <StatusTransitionDialog
            currentStatus={wo.status}
            onTransition={handleTransition}
            loading={transitionStatus.isPending}
          />
          <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
            <Dialog.Trigger>
              <Button variant="outline" size="2"><Pencil size={13} /> Edit</Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="560px">
              <Dialog.Title>Edit work order</Dialog.Title>
              <Dialog.Description size="2" color="gray" mb="4">Update the work order details.</Dialog.Description>
              <WorkOrderForm
                defaultValues={wo}
                clients={clients}
                technicians={technicians}
                onSubmit={handleUpdate}
                onCancel={() => setEditOpen(false)}
                loading={updateWorkOrder.isPending}
              />
            </Dialog.Content>
          </Dialog.Root>

          <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialog.Trigger>
              <Button variant="soft" color="red" size="2"><Trash2 size={13} /> Delete</Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content maxWidth="400px">
              <AlertDialog.Title>Delete work order</AlertDialog.Title>
              <AlertDialog.Description>
                Are you sure you want to delete <strong>{wo.title}</strong>? This cannot be undone.
              </AlertDialog.Description>
              <Flex gap="2" justify="end" mt="4">
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray">Cancel</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button color="red" loading={deleteWorkOrder.isPending} onClick={handleDelete}>
                    Delete work order
                  </Button>
                </AlertDialog.Action>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </Flex>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main details */}
        <div className="col-span-2 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</p>
            </div>
            <div className="px-5 divide-y divide-slate-100">
              {wo.description && (
                <InfoRow icon={AlignLeft} label="Description" value={wo.description} />
              )}
              <InfoRow icon={User} label="Client" value={client?.name} />
              <InfoRow icon={Wrench} label="Technician" value={tech?.name} />
              <InfoRow
                icon={Calendar}
                label="Scheduled At"
                value={wo.scheduled_at ? new Date(wo.scheduled_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null}
              />
              {wo.completed_at && (
                <InfoRow
                  icon={Clock}
                  label="Completed At"
                  value={new Date(wo.completed_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                />
              )}
            </div>
          </div>
        </div>

        {/* History timeline */}
        <div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status History</p>
            </div>
            <div className="px-5 py-4">
              <HistoryTimeline history={history} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
