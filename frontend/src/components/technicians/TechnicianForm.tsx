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
      <Grid gap="4">
        <label className="block">
          <Text size="2" weight="medium" className="text-slate-700 mb-1.5 block">
            Name <span className="text-red-500">*</span>
          </Text>
          <TextField.Root
            size="2"
            placeholder="e.g. Jane Smith"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && (
            <Text size="1" className="text-red-500 mt-1 block">{errors.name.message}</Text>
          )}
        </label>

        <Grid columns="2" gap="3">
          <label className="block">
            <Text size="2" weight="medium" className="text-slate-700 mb-1.5 block">Email</Text>
            <TextField.Root size="2" type="email" placeholder="jane@example.com" {...register('email')} />
          </label>
          <label className="block">
            <Text size="2" weight="medium" className="text-slate-700 mb-1.5 block">Phone</Text>
            <TextField.Root size="2" placeholder="+1 555 000 0000" {...register('phone')} />
          </label>
        </Grid>

        <label className="block">
          <Text size="2" weight="medium" className="text-slate-700 mb-1.5 block">Specialty</Text>
          <TextField.Root size="2" placeholder="e.g. HVAC, Electrical, Plumbing" {...register('specialty')} />
        </label>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <Text size="2" weight="medium" className="text-slate-700">Active technician</Text>
            <Text size="1" className="text-slate-400 block">Can be assigned to work orders</Text>
          </div>
          <Switch
            checked={isActive ?? true}
            onCheckedChange={(v) => setValue('is_active', v)}
          />
        </div>
      </Grid>

      <Flex gap="2" justify="end" mt="5">
        <Button type="button" variant="soft" color="gray" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Save changes
        </Button>
      </Flex>
    </form>
  )
}
