import { useState } from 'react'
import { Button, Dialog, Select, TextArea, Flex, Text, Grid } from '@radix-ui/themes'
import type { WorkOrderStatus } from '../../types/work-order'

const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  pending: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

interface Props {
  currentStatus: WorkOrderStatus
  onTransition: (toStatus: WorkOrderStatus, notes?: string) => void
  loading?: boolean
}

export default function StatusTransitionDialog({ currentStatus, onTransition, loading }: Props) {
  const [open, setOpen] = useState(false)
  const [toStatus, setToStatus] = useState<WorkOrderStatus | ''>('')
  const [notes, setNotes] = useState('')

  const available = VALID_TRANSITIONS[currentStatus]

  if (available.length === 0) return null

  function handleSubmit() {
    if (!toStatus) return
    onTransition(toStatus, notes || undefined)
    setOpen(false)
    setToStatus('')
    setNotes('')
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="soft" color="blue">Transition Status</Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="400px">
        <Dialog.Title>Transition Status</Dialog.Title>
        <Grid gap="3">
          <label>
            <Text size="2" weight="medium" mb="1" as="div">New Status</Text>
            <Select.Root value={toStatus} onValueChange={(v) => setToStatus(v as WorkOrderStatus)}>
              <Select.Trigger placeholder="Select new status…" />
              <Select.Content>
                {available.map((s) => (
                  <Select.Item key={s} value={s}>{STATUS_LABELS[s]}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </label>
          <label>
            <Text size="2" weight="medium" mb="1" as="div">Notes</Text>
            <TextArea
              placeholder="Optional transition notes…"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </Grid>
        <Flex gap="2" justify="end" mt="4">
          <Dialog.Close>
            <Button variant="soft" color="gray">Cancel</Button>
          </Dialog.Close>
          <Button onClick={handleSubmit} disabled={!toStatus} loading={loading}>
            Apply
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
