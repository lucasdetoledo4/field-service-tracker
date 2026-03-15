export interface PaginationMeta {
  page: number
  page_size: number
  total: number
  total_pages: number
  from: number
  to: number
}

export interface ClientFilters {
  search?: string
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

export interface ClientsResponse {
  clients: Client[]
  meta: PaginationMeta
}

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface ClientCreate {
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
}

export interface ClientUpdate {
  name?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
}
