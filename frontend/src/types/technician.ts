import type { PaginationMeta } from './client'

export interface TechnicianFilters {
  search?: string
  is_active?: boolean
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

export interface TechniciansResponse {
  technicians: Technician[]
  meta: PaginationMeta
}

export interface Technician {
  id: string
  name: string
  email: string | null
  phone: string | null
  specialty: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TechnicianCreate {
  name: string
  email?: string | null
  phone?: string | null
  specialty?: string | null
  is_active?: boolean
}

export interface TechnicianUpdate {
  name?: string | null
  email?: string | null
  phone?: string | null
  specialty?: string | null
  is_active?: boolean | null
}
