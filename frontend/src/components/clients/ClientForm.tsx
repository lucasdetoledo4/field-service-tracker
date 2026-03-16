import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button, TextField, Flex, Grid, Text } from '@radix-ui/themes'
import type { Client, ClientCreate } from '../../types/client'
import PhoneField, { validatePhone } from '../PhoneField'

interface Props {
  defaultValues?: Partial<Client>
  onSubmit: (data: ClientCreate) => void
  onCancel: () => void
  loading?: boolean
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FIELD_ERROR = 'text-red-500 text-xs mt-1'

export default function ClientForm({ defaultValues, onSubmit, onCancel, loading }: Props) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ClientCreate>({
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      address: defaultValues?.address ?? '',
    },
  })

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      address: defaultValues?.address ?? '',
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
            placeholder="e.g. Acme Corporation"
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
              placeholder="contact@example.com"
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
          <Text size="2" weight="medium" className="text-slate-700 mb-1.5 block">Address</Text>
          <TextField.Root
            size="2"
            placeholder="123 Main St, City, State"
            {...register('address')}
          />
        </label>
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
