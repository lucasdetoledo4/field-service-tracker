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

const priorities: WorkOrderPriority[] = ['low', 'medium', 'high', 'urgent']

export default function WorkOrderForm({
  defaultValues, clients, technicians, onSubmit, onCancel, loading,
}: Props) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<WorkOrderCreate>({
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      priority: defaultValues?.priority ?? 'medium',
      client_id: defaultValues?.client_id ?? undefined,
      technician_id: defaultValues?.technician_id ?? undefined,
      scheduled_at: defaultValues?.scheduled_at
        ? defaultValues.scheduled_at.slice(0, 16)
        : '',
    },
  })

  useEffect(() => {
    reset({
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      priority: defaultValues?.priority ?? 'medium',
      client_id: defaultValues?.client_id ?? undefined,
      technician_id: defaultValues?.technician_id ?? undefined,
      scheduled_at: defaultValues?.scheduled_at
        ? defaultValues.scheduled_at.slice(0, 16)
        : '',
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
      <Grid gap="3">
        <label>
          <Text size="2" weight="medium" mb="1" as="div">Title *</Text>
          <TextField.Root
            placeholder="Work order title"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && <Text size="1" color="red">{errors.title.message}</Text>}
        </label>
        <label>
          <Text size="2" weight="medium" mb="1" as="div">Description</Text>
          <TextArea placeholder="Describe the work to be done…" rows={3} {...register('description')} />
        </label>
        <label>
          <Text size="2" weight="medium" mb="1" as="div">Priority</Text>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select.Root value={field.value ?? 'medium'} onValueChange={field.onChange}>
                <Select.Trigger />
                <Select.Content>
                  {priorities.map((p) => (
                    <Select.Item key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            )}
          />
        </label>
        <label>
          <Text size="2" weight="medium" mb="1" as="div">Client</Text>
          <Controller
            name="client_id"
            control={control}
            render={({ field }) => (
              <Select.Root value={field.value ?? ''} onValueChange={field.onChange}>
                <Select.Trigger placeholder="Select client…" />
                <Select.Content>
                  <Select.Item value="">None</Select.Item>
                  {clients.map((c) => (
                    <Select.Item key={c.id} value={c.id}>{c.name}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            )}
          />
        </label>
        <label>
          <Text size="2" weight="medium" mb="1" as="div">Technician</Text>
          <Controller
            name="technician_id"
            control={control}
            render={({ field }) => (
              <Select.Root value={field.value ?? ''} onValueChange={field.onChange}>
                <Select.Trigger placeholder="Select technician…" />
                <Select.Content>
                  <Select.Item value="">None</Select.Item>
                  {technicians.map((t) => (
                    <Select.Item key={t.id} value={t.id}>{t.name}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            )}
          />
        </label>
        <label>
          <Text size="2" weight="medium" mb="1" as="div">Scheduled At</Text>
          <TextField.Root type="datetime-local" {...register('scheduled_at')} />
        </label>
      </Grid>
      <Flex gap="2" justify="end" mt="4">
        <Button type="button" variant="soft" color="gray" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Save
        </Button>
      </Flex>
    </form>
  )
}
