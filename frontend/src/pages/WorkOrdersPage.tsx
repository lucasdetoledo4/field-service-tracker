import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button, Dialog, Table, Flex, Heading, Text, Spinner, Badge, Select,
} from '@radix-ui/themes'
import { Plus, X } from 'lucide-react'
import { useWorkOrders, useCreateWorkOrder } from '../lib/queries/work-orders'
import { useClients } from '../lib/queries/clients'
import { useTechnicians } from '../lib/queries/technicians'
import WorkOrderForm from '../components/work-orders/WorkOrderForm'
import type { WorkOrderCreate, WorkOrderFilters, WorkOrderStatus, WorkOrderPriority } from '../types/work-order'

const STATUS_COLORS: Record<WorkOrderStatus, 'gray' | 'blue' | 'yellow' | 'green' | 'red'> = {
  pending: 'gray',
  assigned: 'blue',
  in_progress: 'yellow',
  completed: 'green',
  cancelled: 'red',
}

const STATUSES: WorkOrderStatus[] = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled']
const PRIORITIES: WorkOrderPriority[] = ['low', 'medium', 'high', 'urgent']

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

  function clearFilters() {
    setFilters({})
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="p-6">
      <Flex align="center" justify="between" mb="4">
        <Heading size="5">Work Orders</Heading>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger>
            <Button><Plus size={16} /> New Work Order</Button>
          </Dialog.Trigger>
          <Dialog.Content maxWidth="540px">
            <Dialog.Title>New Work Order</Dialog.Title>
            <WorkOrderForm
              clients={clients}
              technicians={technicians}
              onSubmit={handleCreate}
              onCancel={() => setOpen(false)}
              loading={createWorkOrder.isPending}
            />
          </Dialog.Content>
        </Dialog.Root>
      </Flex>

      <Flex gap="2" mb="4" wrap="wrap" align="center">
        <Select.Root
          value={filters.status ?? ''}
          onValueChange={(v) => setFilters((f) => ({ ...f, status: (v || undefined) as WorkOrderStatus | undefined }))}
        >
          <Select.Trigger placeholder="Status" />
          <Select.Content>
            <Select.Item value="">All statuses</Select.Item>
            {STATUSES.map((s) => (
              <Select.Item key={s} value={s}>{s.replace('_', ' ')}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={filters.priority ?? ''}
          onValueChange={(v) => setFilters((f) => ({ ...f, priority: (v || undefined) as WorkOrderPriority | undefined }))}
        >
          <Select.Trigger placeholder="Priority" />
          <Select.Content>
            <Select.Item value="">All priorities</Select.Item>
            {PRIORITIES.map((p) => (
              <Select.Item key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={filters.client_id ?? ''}
          onValueChange={(v) => setFilters((f) => ({ ...f, client_id: v || undefined }))}
        >
          <Select.Trigger placeholder="Client" />
          <Select.Content>
            <Select.Item value="">All clients</Select.Item>
            {clients.map((c) => (
              <Select.Item key={c.id} value={c.id}>{c.name}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={filters.technician_id ?? ''}
          onValueChange={(v) => setFilters((f) => ({ ...f, technician_id: v || undefined }))}
        >
          <Select.Trigger placeholder="Technician" />
          <Select.Content>
            <Select.Item value="">All technicians</Select.Item>
            {technicians.map((t) => (
              <Select.Item key={t.id} value={t.id}>{t.name}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        {hasFilters && (
          <Button variant="ghost" color="gray" onClick={clearFilters}>
            <X size={14} /> Clear
          </Button>
        )}
      </Flex>

      {isLoading && <Flex justify="center" mt="6"><Spinner /></Flex>}
      {isError && <Text color="red">Failed to load work orders.</Text>}

      {workOrders && (
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Priority</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Client</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Technician</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {workOrders.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={5}>
                  <Text color="gray" size="2">No work orders found.</Text>
                </Table.Cell>
              </Table.Row>
            )}
            {workOrders.map((wo) => {
              const client = clients.find((c) => c.id === wo.client_id)
              const tech = technicians.find((t) => t.id === wo.technician_id)
              return (
                <Table.Row key={wo.id}>
                  <Table.Cell>
                    <Link to={`/work-orders/${wo.id}`} className="text-blue-600 hover:underline font-medium">
                      {wo.title}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={STATUS_COLORS[wo.status]}>
                      {wo.status.replace('_', ' ')}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="capitalize">{wo.priority}</span>
                  </Table.Cell>
                  <Table.Cell>{client?.name ?? '—'}</Table.Cell>
                  <Table.Cell>{tech?.name ?? '—'}</Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      )}
    </div>
  )
}
