import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button, TextField, Flex, Grid, Text, Switch } from '@radix-ui/themes'
import type { Technician, TechnicianCreate } from '../../types/technician'
import PhoneField, { validatePhone } from '../PhoneField'

interface Props {
  defaultValues?: Partial<Technician>
  onSubmit: (data: TechnicianCreate) => void
  onCancel: () => void
  loading?: boolean
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FIELD_ERROR = 'text-red-500 text-xs mt-1'

export default function TechnicianForm({ defaultValues, onSubmit, onCancel, loading }: Props) {
  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm<TechnicianCreate>({
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
            <p className={FIELD_ERROR}>{errors.name.message}</p>
          )}
        </label>

        <Grid columns="2" gap="3">
          <label className="block">
            <Text size="2" weight="medium" className="text-slate-700 mb-1.5 block">
              Email <span className="text-red-500">*</span>
            </Text>
            <TextField.Root
              size="2"
              type="email"
              placeholder="jane@example.com"
              {...register('email', {
                required: 'Email is required',
                validate: v => !v || EMAIL_REGEX.test(v) || 'Invalid email address',
              })}
            />
            {errors.email && (
              <p className={FIELD_ERROR}>{errors.email.message}</p>
            )}
          </label>
          <label className="block">
            <Text size="2" weight="medium" className="text-slate-700 mb-1.5 block">
              Phone <span className="text-red-500">*</span>
            </Text>
            <Controller
              name="phone"
              control={control}
              rules={{ required: 'Phone is required', validate: validatePhone }}
              render={({ field }) => (
                <PhoneField
                  value={field.value ?? undefined}
                  onChange={v => field.onChange(v ?? '')}
                  error={errors.phone?.message}
                />
              )}
            />
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
