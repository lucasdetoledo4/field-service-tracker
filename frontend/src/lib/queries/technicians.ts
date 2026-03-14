import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api'
import type { Technician, TechnicianCreate, TechnicianUpdate } from '../../types/technician'

export function useTechnicians() {
  return useQuery({
    queryKey: ['technicians'],
    queryFn: () => apiFetch<Technician[]>('/api/v1/technicians'),
  })
}

export function useTechnician(id: string) {
  return useQuery({
    queryKey: ['technicians', id],
    queryFn: () => apiFetch<Technician>(`/api/v1/technicians/${id}`),
    enabled: !!id,
  })
}

export function useCreateTechnician() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TechnicianCreate) =>
      apiFetch<Technician>('/api/v1/technicians', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['technicians'] }),
  })
}

export function useUpdateTechnician(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TechnicianUpdate) =>
      apiFetch<Technician>(`/api/v1/technicians/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['technicians'] }),
  })
}

export function useDeleteTechnician() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/v1/technicians/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['technicians'] }),
  })
}
