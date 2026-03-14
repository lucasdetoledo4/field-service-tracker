import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Button, Dialog, Heading, Text, Flex, Card, Grid, Separator, AlertDialog, Spinner, Badge,
} from '@radix-ui/themes'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import {
  useWorkOrder, useUpdateWorkOrder, useDeleteWorkOrder,
  useTransitionStatus, useWorkOrderHistory,
} from '../lib/queries/work-orders'
import { useClients } from '../lib/queries/clients'
import { useTechnicians } from '../lib/queries/technicians'
import WorkOrderForm from '../components/work-orders/WorkOrderForm'
import StatusTransitionDialog from '../components/work-orders/StatusTransitionDialog'
import HistoryTimeline from '../components/work-orders/HistoryTimeline'
import type { WorkOrderCreate, WorkOrderStatus } from '../types/work-order'

const STATUS_COLORS: Record<WorkOrderStatus, 'gray' | 'blue' | 'yellow' | 'green' | 'red'> = {
  pending: 'gray',
  assigned: 'blue',
  in_progress: 'yellow',
  completed: 'green',
  cancelled: 'red',
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
    deleteWorkOrder.mutate(id!, {
      onSuccess: () => navigate('/work-orders'),
    })
  }

  function handleTransition(toStatus: WorkOrderStatus, notes?: string) {
    transitionStatus.mutate({ to_status: toStatus, notes })
  }

  if (isLoading) return <Flex justify="center" mt="8"><Spinner /></Flex>
  if (isError || !wo) return (
    <div className="p-6">
      <Text color="red">Work order not found.</Text>
    </div>
  )

  const client = clients.find((c) => c.id === wo.client_id)
  const tech = technicians.find((t) => t.id === wo.technician_id)

  return (
    <div className="p-6 max-w-2xl">
      <Flex align="center" gap="2" mb="4">
        <Link to="/work-orders" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={18} />
        </Link>
        <Heading size="5">{wo.title}</Heading>
        <Badge color={STATUS_COLORS[wo.status]}>
          {wo.status.replace('_', ' ')}
        </Badge>
      </Flex>

      <Card mb="4">
        <Grid columns="2" gap="4" p="2">
          <div>
            <Text size="1" color="gray" weight="medium">Priority</Text>
            <Text size="2" as="div" className="capitalize">{wo.priority}</Text>
          </div>
          <div>
            <Text size="1" color="gray" weight="medium">Client</Text>
            <Text size="2" as="div">{client?.name ?? '—'}</Text>
          </div>
          <div>
            <Text size="1" color="gray" weight="medium">Technician</Text>
            <Text size="2" as="div">{tech?.name ?? '—'}</Text>
          </div>
          <div>
            <Text size="1" color="gray" weight="medium">Scheduled At</Text>
            <Text size="2" as="div">
              {wo.scheduled_at ? new Date(wo.scheduled_at).toLocaleString() : '—'}
            </Text>
          </div>
          {wo.completed_at && (
            <div>
              <Text size="1" color="gray" weight="medium">Completed At</Text>
              <Text size="2" as="div">{new Date(wo.completed_at).toLocaleString()}</Text>
            </div>
          )}
          {wo.description && (
            <div className="col-span-2">
              <Text size="1" color="gray" weight="medium">Description</Text>
              <Text size="2" as="div">{wo.description}</Text>
            </div>
          )}
        </Grid>
        <Separator size="4" my="3" />
        <Flex gap="2" px="2" wrap="wrap">
          <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
            <Dialog.Trigger>
              <Button variant="soft">
                <Pencil size={14} /> Edit
              </Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="540px">
              <Dialog.Title>Edit Work Order</Dialog.Title>
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

          <StatusTransitionDialog
            currentStatus={wo.status}
            onTransition={handleTransition}
            loading={transitionStatus.isPending}
          />

          <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialog.Trigger>
              <Button variant="soft" color="red">
                <Trash2 size={14} /> Delete
              </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content maxWidth="400px">
              <AlertDialog.Title>Delete Work Order</AlertDialog.Title>
              <AlertDialog.Description>
                Are you sure you want to delete <strong>{wo.title}</strong>? This cannot be undone.
              </AlertDialog.Description>
              <Flex gap="2" justify="end" mt="4">
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray">Cancel</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button color="red" loading={deleteWorkOrder.isPending} onClick={handleDelete}>
                    Delete
                  </Button>
                </AlertDialog.Action>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </Flex>
      </Card>

      <Heading size="3" mb="3">Status History</Heading>
      <HistoryTimeline history={history} />
    </div>
  )
}
