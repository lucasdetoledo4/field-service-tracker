import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api'
import type { Client, ClientCreate, ClientUpdate, ClientFilters, ClientsResponse } from '../../types/client'

export function useClients(filters?: ClientFilters) {
  const params = new URLSearchParams()
  if (filters?.search) params.set('search', filters.search)
  if (filters?.sort_by) params.set('sort_by', filters.sort_by)
  if (filters?.sort_dir) params.set('sort_dir', filters.sort_dir)
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.page_size) params.set('page_size', String(filters.page_size))
  const qs = params.toString()

  return useQuery({
    queryKey: ['clients', filters ?? {}],
    queryFn: () => apiFetch<ClientsResponse>(`/api/v1/clients${qs ? `?${qs}` : ''}`),
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => apiFetch<Client>(`/api/v1/clients/${id}`),
    enabled: !!id,
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ClientCreate) =>
      apiFetch<Client>('/api/v1/clients', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ClientUpdate) =>
      apiFetch<Client>(`/api/v1/clients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/v1/clients/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}
