import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Dialog, Spinner } from '@radix-ui/themes'
import { Plus, Wrench, ChevronRight } from 'lucide-react'
import { useTechnicians, useCreateTechnician } from '../lib/queries/technicians'
import TechnicianForm from '../components/technicians/TechnicianForm'
import { ActiveBadge } from '../components/Badges'
import type { TechnicianCreate } from '../types/technician'

export default function TechniciansPage() {
  const { data: technicians, isLoading, isError } = useTechnicians()
  const createTechnician = useCreateTechnician()
  const [open, setOpen] = useState(false)

  function handleCreate(data: TechnicianCreate) {
    createTechnician.mutate(data, { onSuccess: () => setOpen(false) })
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Technicians</h1>
          {technicians && (
            <p className="text-sm text-slate-500 mt-0.5">
              {technicians.filter(t => t.is_active).length} active · {technicians.length} total
            </p>
          )}
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger>
            <Button size="2"><Plus size={15} /> New Technician</Button>
          </Dialog.Trigger>
          <Dialog.Content maxWidth="480px">
            <Dialog.Title>Add new technician</Dialog.Title>
            <Dialog.Description size="2" color="gray" mb="4">
              Fill in the technician's details below.
            </Dialog.Description>
            <TechnicianForm
              onSubmit={handleCreate}
              onCancel={() => setOpen(false)}
              loading={createTechnician.isPending}
            />
          </Dialog.Content>
        </Dialog.Root>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-20"><Spinner size="3" /></div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load technicians. Please try again.
        </div>
      )}

      {technicians?.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Wrench size={20} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No technicians yet</p>
          <p className="text-slate-400 text-sm mt-1">Add your first technician to get started.</p>
        </div>
      )}

      {technicians && technicians.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialty</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {technicians.map((t) => (
                <tr key={t.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link to={`/technicians/${t.id}`} className="font-medium text-slate-900 hover:text-indigo-600 transition-colors">
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{t.specialty ?? <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-3.5 text-slate-500">{t.email ?? t.phone ?? <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-3.5"><ActiveBadge active={t.is_active} /></td>
                  <td className="px-5 py-3.5">
                    <Link to={`/technicians/${t.id}`} className="text-slate-300 group-hover:text-slate-400 transition-colors">
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
