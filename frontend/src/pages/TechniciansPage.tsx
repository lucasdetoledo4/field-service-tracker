import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Dialog, Table, Flex, Heading, Text, Spinner, Badge } from '@radix-ui/themes'
import { Plus } from 'lucide-react'
import { useTechnicians, useCreateTechnician } from '../lib/queries/technicians'
import TechnicianForm from '../components/technicians/TechnicianForm'
import type { TechnicianCreate } from '../types/technician'

export default function TechniciansPage() {
  const { data: technicians, isLoading, isError } = useTechnicians()
  const createTechnician = useCreateTechnician()
  const [open, setOpen] = useState(false)

  function handleCreate(data: TechnicianCreate) {
    createTechnician.mutate(data, { onSuccess: () => setOpen(false) })
  }

  return (
    <div className="p-6">
      <Flex align="center" justify="between" mb="4">
        <Heading size="5">Technicians</Heading>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger>
            <Button>
              <Plus size={16} /> New Technician
            </Button>
          </Dialog.Trigger>
          <Dialog.Content maxWidth="480px">
            <Dialog.Title>New Technician</Dialog.Title>
            <TechnicianForm
              onSubmit={handleCreate}
              onCancel={() => setOpen(false)}
              loading={createTechnician.isPending}
            />
          </Dialog.Content>
        </Dialog.Root>
      </Flex>

      {isLoading && <Flex justify="center" mt="6"><Spinner /></Flex>}
      {isError && <Text color="red">Failed to load technicians.</Text>}

      {technicians && (
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Specialty</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {technicians.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={4}>
                  <Text color="gray" size="2">No technicians yet.</Text>
                </Table.Cell>
              </Table.Row>
            )}
            {technicians.map((t) => (
              <Table.Row key={t.id}>
                <Table.Cell>
                  <Link to={`/technicians/${t.id}`} className="text-blue-600 hover:underline font-medium">
                    {t.name}
                  </Link>
                </Table.Cell>
                <Table.Cell>{t.specialty ?? '—'}</Table.Cell>
                <Table.Cell>{t.email ?? '—'}</Table.Cell>
                <Table.Cell>
                  <Badge color={t.is_active ? 'green' : 'gray'}>
                    {t.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </div>
  )
}
