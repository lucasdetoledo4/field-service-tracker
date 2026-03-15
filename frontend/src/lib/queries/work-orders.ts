import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api'
import type {
  WorkOrder,
  WorkOrderCreate,
  WorkOrderUpdate,
  WorkOrderFilters,
  WorkOrdersResponse,
  StatusTransitionRequest,
  WorkOrderStatusHistory,
} from '../../types/work-order'

export function useWorkOrders(filters?: WorkOrderFilters) {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.priority) params.set('priority', filters.priority)
  if (filters?.technician_id) params.set('technician_id', filters.technician_id)
  if (filters?.client_id) params.set('client_id', filters.client_id)
  if (filters?.search) params.set('search', filters.search)
  if (filters?.sort_by) params.set('sort_by', filters.sort_by)
  if (filters?.sort_dir) params.set('sort_dir', filters.sort_dir)
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.page_size) params.set('page_size', String(filters.page_size))
  const qs = params.toString()

  return useQuery({
    queryKey: ['work-orders', filters ?? {}],
    queryFn: () => apiFetch<WorkOrdersResponse>(`/api/v1/work-orders${qs ? `?${qs}` : ''}`),
  })
}

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: ['work-orders', id],
    queryFn: () => apiFetch<WorkOrder>(`/api/v1/work-orders/${id}`),
    enabled: !!id,
  })
}

export function useCreateWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: WorkOrderCreate) =>
      apiFetch<WorkOrder>('/api/v1/work-orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  })
}

export function useUpdateWorkOrder(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: WorkOrderUpdate) =>
      apiFetch<WorkOrder>(`/api/v1/work-orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  })
}

export function useDeleteWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/v1/work-orders/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  })
}

export function useTransitionStatus(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: StatusTransitionRequest) =>
      apiFetch<WorkOrder>(`/api/v1/work-orders/${id}/transition`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  })
}

export function useWorkOrderHistory(id: string) {
  return useQuery({
    queryKey: ['work-orders', id, 'history'],
    queryFn: () => apiFetch<WorkOrderStatusHistory[]>(`/api/v1/work-orders/${id}/history`),
    enabled: !!id,
  })
}
