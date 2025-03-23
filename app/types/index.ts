export interface Transaction {
  id: number
  user_id: string
  month_id: number
  name: string
  amount_cad: number
  amount_usd: number | null
  category_id: number
  notes: string | null
  date: Date
  type: 'income' | 'expense'
  created_at: string
  category?: string
}

export interface Month {
  id: number
  month: string
  year: number
  notes: string | null
  transactionCount?: number
} 