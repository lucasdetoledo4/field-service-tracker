import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button, TextField, Flex, Grid, Text } from '@radix-ui/themes'
import type { Client, ClientCreate } from '../../types/client'

interface Props {
  defaultValues?: Partial<Client>
  onSubmit: (data: ClientCreate) => void
  onCancel: () => void
  loading?: boolean
}

export default function ClientForm({ defaultValues, onSubmit, onCancel, loading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientCreate>({
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
      <Grid gap="3">
        <label>
          <Text size="2" weight="medium" mb="1" as="div">Name *</Text>
          <TextField.Root
            placeholder="Client name"
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
          <Text size="2" weight="medium" mb="1" as="div">Address</Text>
          <TextField.Root
            placeholder="123 Main St"
            {...register('address')}
          />
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
