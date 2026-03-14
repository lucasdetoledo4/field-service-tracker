import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button, TextField, Flex, Grid, Text, Switch } from '@radix-ui/themes'
import type { Technician, TechnicianCreate } from '../../types/technician'

interface Props {
  defaultValues?: Partial<Technician>
  onSubmit: (data: TechnicianCreate) => void
  onCancel: () => void
  loading?: boolean
}

export default function TechnicianForm({ defaultValues, onSubmit, onCancel, loading }: Props) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<TechnicianCreate>({
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      specialty: defaultValues?.specialty ?? '',
      is_active: defaultValues?.is_active ?? true,
    },
  })

  const isActive = watch('is_active')

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      specialty: defaultValues?.specialty ?? '',
      is_active: defaultValues?.is_active ?? true,
    })
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid gap="3">
        <label>
          <Text size="2" weight="medium" mb="1" as="div">Name *</Text>
          <TextField.Root
            placeholder="Technician name"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <Text size="1" color="red">{errors.name.message}</Text>}
        </label>
        <label>
          <Text size="2" weight="medium" mb="1" as="div">Email</Text>
          <TextField.Root
            type="email"
            placeholder="email@example.com"
            {...register('email')}
          />
        </label>
        <label>
          <Text size="2" weight="medium" mb="1" as="div">Phone</Text>
          <TextField.Root
            placeholder="+1 555 000 0000"
            {...register('phone')}
          />
        </label>
        <label>
          <Text size="2" weight="medium" mb="1" as="div">Specialty</Text>
          <TextField.Root
            placeholder="e.g. HVAC, Electrical"
            {...register('specialty')}
          />
        </label>
        <Flex align="center" gap="2">
          <Switch
            checked={isActive ?? true}
            onCheckedChange={(v) => setValue('is_active', v)}
          />
          <Text size="2">Active</Text>
        </Flex>
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
