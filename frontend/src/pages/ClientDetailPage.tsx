import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Button, Dialog, Heading, Text, Flex, Card, Grid, Separator, AlertDialog, Spinner,
} from '@radix-ui/themes'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useClient, useUpdateClient, useDeleteClient } from '../lib/queries/clients'
import ClientForm from '../components/clients/ClientForm'
import type { ClientCreate } from '../types/client'

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: client, isLoading, isError } = useClient(id!)
  const updateClient = useUpdateClient(id!)
  const deleteClient = useDeleteClient()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleUpdate(data: ClientCreate) {
    updateClient.mutate(data, { onSuccess: () => setEditOpen(false) })
  }

  function handleDelete() {
    deleteClient.mutate(id!, {
      onSuccess: () => navigate('/clients'),
    })
  }

  if (isLoading) return <Flex justify="center" mt="8"><Spinner /></Flex>
  if (isError || !client) return (
    <div className="p-6">
      <Text color="red">Client not found.</Text>
    </div>
  )

  return (
    <div className="p-6 max-w-2xl">
      <Flex align="center" gap="2" mb="4">
        <Link to="/clients" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={18} />
        </Link>
        <Heading size="5">{client.name}</Heading>
      </Flex>

      <Card>
        <Grid columns="2" gap="4" p="2">
          <div>
            <Text size="1" color="gray" weight="medium">Email</Text>
            <Text size="2" as="div">{client.email ?? '—'}</Text>
          </div>
          <div>
            <Text size="1" color="gray" weight="medium">Phone</Text>
            <Text size="2" as="div">{client.phone ?? '—'}</Text>
          </div>
          <div className="col-span-2">
            <Text size="1" color="gray" weight="medium">Address</Text>
            <Text size="2" as="div">{client.address ?? '—'}</Text>
          </div>
        </Grid>
        <Separator size="4" my="3" />
        <Flex gap="2" px="2">
          <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
            <Dialog.Trigger>
              <Button variant="soft">
                <Pencil size={14} /> Edit
              </Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="480px">
              <Dialog.Title>Edit Client</Dialog.Title>
              <ClientForm
                defaultValues={client}
                onSubmit={handleUpdate}
                onCancel={() => setEditOpen(false)}
                loading={updateClient.isPending}
              />
            </Dialog.Content>
          </Dialog.Root>

          <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialog.Trigger>
              <Button variant="soft" color="red">
                <Trash2 size={14} /> Delete
              </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content maxWidth="400px">
              <AlertDialog.Title>Delete Client</AlertDialog.Title>
              <AlertDialog.Description>
                Are you sure you want to delete <strong>{client.name}</strong>? This cannot be undone.
              </AlertDialog.Description>
              <Flex gap="2" justify="end" mt="4">
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray">Cancel</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button color="red" loading={deleteClient.isPending} onClick={handleDelete}>
                    Delete
                  </Button>
                </AlertDialog.Action>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </Flex>
      </Card>
    </div>
  )
}
