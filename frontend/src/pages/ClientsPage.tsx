import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Dialog, Table, Flex, Heading, Text, Spinner } from '@radix-ui/themes'
import { Plus } from 'lucide-react'
import { useClients, useCreateClient } from '../lib/queries/clients'
import ClientForm from '../components/clients/ClientForm'
import type { ClientCreate } from '../types/client'

export default function ClientsPage() {
  const { data: clients, isLoading, isError } = useClients()
  const createClient = useCreateClient()
  const [open, setOpen] = useState(false)

  function handleCreate(data: ClientCreate) {
    createClient.mutate(data, { onSuccess: () => setOpen(false) })
  }

  return (
    <div className="p-6">
      <Flex align="center" justify="between" mb="4">
        <Heading size="5">Clients</Heading>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger>
            <Button>
              <Plus size={16} /> New Client
            </Button>
          </Dialog.Trigger>
          <Dialog.Content maxWidth="480px">
            <Dialog.Title>New Client</Dialog.Title>
            <ClientForm
              onSubmit={handleCreate}
              onCancel={() => setOpen(false)}
              loading={createClient.isPending}
            />
          </Dialog.Content>
        </Dialog.Root>
      </Flex>

      {isLoading && <Flex justify="center" mt="6"><Spinner /></Flex>}
      {isError && <Text color="red">Failed to load clients.</Text>}

      {clients && (
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Phone</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {clients.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={3}>
                  <Text color="gray" size="2">No clients yet.</Text>
                </Table.Cell>
              </Table.Row>
            )}
            {clients.map((c) => (
              <Table.Row key={c.id}>
                <Table.Cell>
                  <Link to={`/clients/${c.id}`} className="text-blue-600 hover:underline font-medium">
                    {c.name}
                  </Link>
                </Table.Cell>
                <Table.Cell>{c.email ?? '—'}</Table.Cell>
                <Table.Cell>{c.phone ?? '—'}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </div>
  )
}
