export type WorkOrderStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface WorkOrder {
  id: string
  title: string
  description: string | null
  status: WorkOrderStatus
  priority: WorkOrderPriority
  client_id: string | null
  technician_id: string | null
  scheduled_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface WorkOrderCreate {
  title: string
  description?: string | null
  priority?: WorkOrderPriority
  client_id?: string | null
  technician_id?: string | null
  scheduled_at?: string | null
}

export interface WorkOrderUpdate {
  title?: string | null
  description?: string | null
  priority?: WorkOrderPriority | null
  client_id?: string | null
  technician_id?: string | null
  scheduled_at?: string | null
}

export interface StatusTransitionRequest {
  to_status: WorkOrderStatus
  notes?: string | null
}

export interface WorkOrderStatusHistory {
  id: string
  work_order_id: string
  from_status: WorkOrderStatus | null
  to_status: WorkOrderStatus
  notes: string | null
  created_at: string
}

export interface WorkOrderFilters {
  status?: WorkOrderStatus
  priority?: WorkOrderPriority
  technician_id?: string
  client_id?: string
  search?: string
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

export interface WorkOrdersResponse {
  work_orders: WorkOrder[]
  meta: import('./client').PaginationMeta
}
