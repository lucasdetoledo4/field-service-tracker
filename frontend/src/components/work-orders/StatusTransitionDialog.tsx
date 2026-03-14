import { useState } from 'react'
import { Button, Dialog, Select, TextArea, Flex, Text, Grid } from '@radix-ui/themes'
import { ArrowRight } from 'lucide-react'
import { StatusBadge } from '../Badges'
import type { WorkOrderStatus } from '../../types/work-order'

const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  pending:     ['assigned', 'cancelled'],
  assigned:    ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed:   [],
  cancelled:   [],
}

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  pending:     'Pending',
  assigned:    'Assigned',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
}

const NONE = '_none_'

interface Props {
  currentStatus: WorkOrderStatus
  onTransition: (toStatus: WorkOrderStatus, notes?: string) => void
  loading?: boolean
}

export default function StatusTransitionDialog({ currentStatus, onTransition, loading }: Props) {
  const [open, setOpen] = useState(false)
  const [toStatus, setToStatus] = useState<WorkOrderStatus | typeof NONE>(NONE)
  const [notes, setNotes] = useState('')

  const available = VALID_TRANSITIONS[currentStatus]
  if (available.length === 0) return null

  function handleOpen(v: boolean) {
    setOpen(v)
    if (!v) { setToStatus(NONE); setNotes('') }
  }

  function handleSubmit() {
    if (toStatus === NONE) return
    onTransition(toStatus, notes || undefined)
    handleOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpen}>
      <Dialog.Trigger>
        <Button variant="soft" color="indigo" size="2">Transition Status</Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="420px">
        <Dialog.Title>Transition Status</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Move this work order to a new status.
        </Dialog.Description>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
          <StatusBadge status={currentStatus} />
          <ArrowRight size={14} className="text-slate-400 flex-shrink-0" />
          {toStatus !== NONE
            ? <StatusBadge status={toStatus} />
            : <span className="text-xs text-slate-400 italic">select new status →</span>
          }
        </div>

        <Grid gap="3">
          <label className="block">
            <Text size="2" weight="medium" className="text-slate-700 mb-1.5 block">New Status</Text>
            <Select.Root value={toStatus} onValueChange={(v) => setToStatus(v as WorkOrderStatus | typeof NONE)}>
              <Select.Trigger placeholder="Select new status…" className="w-full" />
              <Select.Content>
                <Select.Item value={NONE} disabled>Select a status…</Select.Item>
                {available.map((s) => (
                  <Select.Item key={s} value={s}>{STATUS_LABELS[s]}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </label>

          <label className="block">
            <Text size="2" weight="medium" className="text-slate-700 mb-1.5 block">Notes <span className="text-slate-400 font-normal">(optional)</span></Text>
            <TextArea
              size="2"
              placeholder="Add context about this transition…"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </Grid>

        <Flex gap="2" justify="end" mt="5">
          <Dialog.Close>
            <Button variant="soft" color="gray">Cancel</Button>
          </Dialog.Close>
          <Button onClick={handleSubmit} disabled={toStatus === NONE} loading={loading}>
            Apply transition
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
