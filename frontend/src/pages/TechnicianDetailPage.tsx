import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Button, Dialog, Heading, Text, Flex, Card, Grid, Separator, AlertDialog, Spinner, Badge,
} from '@radix-ui/themes'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useTechnician, useUpdateTechnician, useDeleteTechnician } from '../lib/queries/technicians'
import TechnicianForm from '../components/technicians/TechnicianForm'
import type { TechnicianCreate } from '../types/technician'

export default function TechnicianDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: technician, isLoading, isError } = useTechnician(id!)
  const updateTechnician = useUpdateTechnician(id!)
  const deleteTechnician = useDeleteTechnician()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleUpdate(data: TechnicianCreate) {
    updateTechnician.mutate(data, { onSuccess: () => setEditOpen(false) })
  }

  function handleDelete() {
    deleteTechnician.mutate(id!, {
      onSuccess: () => navigate('/technicians'),
    })
  }

  if (isLoading) return <Flex justify="center" mt="8"><Spinner /></Flex>
  if (isError || !technician) return (
    <div className="p-6">
      <Text color="red">Technician not found.</Text>
    </div>
  )

  return (
    <div className="p-6 max-w-2xl">
      <Flex align="center" gap="2" mb="4">
        <Link to="/technicians" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={18} />
        </Link>
        <Heading size="5">{technician.name}</Heading>
        <Badge color={technician.is_active ? 'green' : 'gray'}>
          {technician.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </Flex>

      <Card>
        <Grid columns="2" gap="4" p="2">
          <div>
            <Text size="1" color="gray" weight="medium">Email</Text>
            <Text size="2" as="div">{technician.email ?? '—'}</Text>
          </div>
          <div>
            <Text size="1" color="gray" weight="medium">Phone</Text>
            <Text size="2" as="div">{technician.phone ?? '—'}</Text>
          </div>
          <div>
            <Text size="1" color="gray" weight="medium">Specialty</Text>
            <Text size="2" as="div">{technician.specialty ?? '—'}</Text>
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
              <Dialog.Title>Edit Technician</Dialog.Title>
              <TechnicianForm
                defaultValues={technician}
                onSubmit={handleUpdate}
                onCancel={() => setEditOpen(false)}
                loading={updateTechnician.isPending}
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
              <AlertDialog.Title>Delete Technician</AlertDialog.Title>
              <AlertDialog.Description>
                Are you sure you want to delete <strong>{technician.name}</strong>? This cannot be undone.
              </AlertDialog.Description>
              <Flex gap="2" justify="end" mt="4">
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray">Cancel</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button color="red" loading={deleteTechnician.isPending} onClick={handleDelete}>
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
