import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api'
import type { Technician, TechnicianCreate, TechnicianUpdate, TechnicianFilters, TechniciansResponse } from '../../types/technician'

export function useTechnicians(filters?: TechnicianFilters) {
  const params = new URLSearchParams()
  if (filters?.search) params.set('search', filters.search)
  if (filters?.is_active !== undefined) params.set('is_active', String(filters.is_active))
  if (filters?.sort_by) params.set('sort_by', filters.sort_by)
  if (filters?.sort_dir) params.set('sort_dir', filters.sort_dir)
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.page_size) params.set('page_size', String(filters.page_size))
  const qs = params.toString()

  return useQuery({
    queryKey: ['technicians', filters ?? {}],
    queryFn: () => apiFetch<TechniciansResponse>(`/api/v1/technicians${qs ? `?${qs}` : ''}`),
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
