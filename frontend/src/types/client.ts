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
