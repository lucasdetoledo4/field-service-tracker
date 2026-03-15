import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button, TextField, Flex, Grid, Text, Select, TextArea } from '@radix-ui/themes'
import type { WorkOrder, WorkOrderCreate, WorkOrderPriority } from '../../types/work-order'
import type { Client } from '../../types/client'
import type { Technician } from '../../types/technician'

interface Props {
  defaultValues?: Partial<WorkOrder>
  clients: Client[]
  technicians: Technician[]
  onSubmit: (data: WorkOrderCreate) => void
  onCancel: () => void
  loading?: boolean
}

const PRIORITIES: WorkOrderPriority[] = ['low', 'medium', 'high', 'urgent']
const PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent',
}

const NONE = '_none_'

export default function WorkOrderForm({ defaultValues, clients, technicians, onSubmit, onCancel, loading }: Props) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<WorkOrderCreate>({
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      priority: defaultValues?.priority ?? 'medium',
      client_id: defaultValues?.client_id ?? undefined,
      technician_id: defaultValues?.technician_id ?? undefined,
      scheduled_at: defaultValues?.scheduled_at ? defaultValues.scheduled_at.slice(0, 16) : '',
    },
  })

  useEffect(() => {
    reset({
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      priority: defaultValues?.priority ?? 'medium',
      client_id: defaultValues?.client_id ?? undefined,
      technician_id: defaultValues?.technician_id ?? undefined,
      scheduled_at: defaultValues?.scheduled_at ? defaultValues.scheduled_at.slice(0, 16) : '',
    })
  }, [defaultValues, reset])

  function handleValid(data: WorkOrderCreate) {
    onSubmit({
      ...data,
      client_id: data.client_id || null,
      technician_id: data.technician_id || null,
      scheduled_at: data.scheduled_at ? new Date(data.scheduled_at as string).toISOString() : null,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleValid)}>
      <Grid gap="4">
        <label className="block">
          <Text size="2" weight="medium" className="text-slate-700 mb-1.5 block">
            Title <span className="text-red-500">*</span>
          </Text>
          <TextField.Root
            size="2"
            placeholder="e.g. Replace HVAC unit"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && <Text size="1" className="text-red-500 mt-1 block">{errors.title.message}</Text>}
        </label>

        <label className="block">
          <Text size="2" weight="medium" className="text-slate-700 mb-1.5 block">Description</Text>
          <TextArea
            size="2"
            placeholder="Describe the work to be done…"
            rows={3}
            {...register('description')}
          />
        </label>

        <Grid columns="2" gap="3">
          <label className="block">
            <Text size="2" weight="medium" className="text-slate-700 mb-1.5 block">
              Client <span className="text-red-500">*</span>
            </Text>
            <Controller
              name="client_id"
              control={control}
              rules={{ validate: v => !!v || 'Client is required' }}
              render={({ field }) => (
                <Select.Root value={field.value ?? NONE} onValueChange={(v) => field.onChange(v === NONE ? null : v)}>
                  <Select.Trigger placeholder="Select client…" className="w-full" />
                  <Select.Content>
                    <Select.Item value={NONE}>No client</Select.Item>
                    {clients.map((c) => <Select.Item key={c.id} value={c.id}>{c.name}</Select.Item>)}
                  </Select.Content>
                </Select.Root>
              )}
            />
            {errors.client_id && <Text size="1" className="text-red-500 mt-1 block">{errors.client_id.message}</Text>}
          </label>

          <label className="block">
            <Text size="2" weight="medium" className="text-slate-700 mb-1.5 block">Priority</Text>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select.Root value={field.value ?? 'medium'} onValueChange={field.onChange}>
                  <Select.Trigger className="w-full" />
                  <Select.Content>
                    {PRIORITIES.map((p) => (
                      <Select.Item key={p} value={p}>{PRIORITY_LABELS[p]}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
            />
          </label>
        </Grid>

        <Grid columns="2" gap="3">
          <label className="block">
            <Text size="2" weight="medium" className="text-slate-700 mb-1.5 block">
              Scheduled At <span className="text-red-500">*</span>
            </Text>
            <TextField.Root
              size="2"
              type="datetime-local"
              {...register('scheduled_at', { required: 'Scheduled date & time is required' })}
            />
            {errors.scheduled_at && <Text size="1" className="text-red-500 mt-1 block">{errors.scheduled_at.message}</Text>}
          </label>

          <label className="block">
            <Text size="2" weight="medium" className="text-slate-700 mb-1.5 block">Technician</Text>
            <Controller
              name="technician_id"
              control={control}
              render={({ field }) => (
                <Select.Root value={field.value ?? NONE} onValueChange={(v) => field.onChange(v === NONE ? null : v)}>
                  <Select.Trigger placeholder="Select technician…" className="w-full" />
                  <Select.Content>
                    <Select.Item value={NONE}>Unassigned</Select.Item>
                    {technicians.map((t) => <Select.Item key={t.id} value={t.id}>{t.name}</Select.Item>)}
                  </Select.Content>
                </Select.Root>
              )}
            />
          </label>
        </Grid>
      </Grid>

      <Flex gap="2" justify="end" mt="5">
        <Button type="button" variant="soft" color="gray" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" loading={loading}>Save changes</Button>
      </Flex>
    </form>
  )
}
