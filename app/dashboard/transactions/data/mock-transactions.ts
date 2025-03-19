// Mock transaction data based on schema from technical-specs.md
export type Transaction = {
  id: number
  user_id: string
  month_id: number
  name: string
  amount_cad: number
  amount_usd: number | null
  category_id: number
  notes: string | null
  date: Date
  type: 'expense' | 'income'
  created_at: Date
  // For UI display purposes
  category?: string
}

// Categories for our mock data
const CATEGORIES = [
  { id: 1, name: 'Housing' },
  { id: 2, name: 'Transportation' },
  { id: 3, name: 'Food & Dining' },
  { id: 4, name: 'Entertainment' },
  { id: 5, name: 'Shopping' },
  { id: 6, name: 'Utilities' },
  { id: 7, name: 'Health' },
  { id: 8, name: 'Travel' },
  { id: 9, name: 'Education' },
  { id: 10, name: 'Salary' },
  { id: 11, name: 'Investments' },
  { id: 12, name: 'Gifts' }
]

// Transaction names for each category
const TRANSACTIONS_BY_CATEGORY: Record<number, string[]> = {
  1: ['Rent Payment', 'Mortgage', 'Property Tax', 'Home Insurance', 'Maintenance'],
  2: ['Car Payment', 'Gas', 'Public Transit', 'Uber/Lyft', 'Car Insurance', 'Car Repair'],
  3: ['Groceries', 'Restaurant', 'Coffee Shop', 'Fast Food', 'Food Delivery'],
  4: ['Movies', 'Concert Tickets', 'Streaming Services', 'Video Games', 'Sports Events'],
  5: ['Clothing', 'Electronics', 'Home Goods', 'Online Shopping', 'Department Store'],
  6: ['Electricity', 'Water Bill', 'Internet', 'Phone Bill', 'Natural Gas'],
  7: ['Doctor Visit', 'Medication', 'Health Insurance', 'Dental Care', 'Eye Care'],
  8: ['Flights', 'Hotels', 'Vacation Packages', 'Rental Car', 'Travel Insurance'],
  9: ['Tuition', 'Books', 'School Supplies', 'Courses', 'Student Loan Payment'],
  10: ['Salary', 'Bonus', 'Commission', 'Contract Work'],
  11: ['Dividend', 'Stock Sale', 'Interest Income', 'Rental Income'],
  12: ['Gift Received', 'Gift Given', 'Charitable Donation']
}

// Generate a random date within the last year
function getRandomDate(months = 12): Date {
  const today = new Date()
  const pastDate = new Date(today)
  pastDate.setMonth(today.getMonth() - Math.floor(Math.random() * months))
  pastDate.setDate(Math.floor(Math.random() * 28) + 1) // Random day 1-28
  return pastDate
}

// Generate 100 random transactions
function generateMockTransactions(count = 100): Transaction[] {
  const transactions: Transaction[] = []
  const user_id = "abc123def456" // Mock user ID

  for (let i = 1; i <= count; i++) {
    // Determine if income (20% chance) or expense (80% chance)
    const type = Math.random() < 0.2 ? 'income' : 'expense'
    
    // Select random category based on transaction type
    let categoryId: number
    if (type === 'income') {
      // Income categories
      categoryId = [10, 11, 12][Math.floor(Math.random() * 3)]
    } else {
      // Expense categories (1-9)
      categoryId = Math.floor(Math.random() * 9) + 1
    }
    
    // Random amount between ranges based on type
    let amount_cad: number
    if (type === 'income') {
      amount_cad = Math.random() * 5000 + 1000 // Income: $1000-$6000
    } else {
      amount_cad = Math.random() * 500 + 10 // Expense: $10-$510
    }
    amount_cad = Math.round(amount_cad * 100) / 100 // Round to 2 decimal places
    
    // 70% chance of having USD amount
    const hasUsdAmount = Math.random() < 0.7
    const amount_usd = hasUsdAmount ? Math.round(amount_cad * 0.74 * 100) / 100 : null
    
    // 30% chance of having notes
    const hasNotes = Math.random() < 0.3
    const notes = hasNotes ? 
      `Note for ${TRANSACTIONS_BY_CATEGORY[categoryId][0].toLowerCase()}` : null
    
    // Choose random transaction name from category
    const possibleNames = TRANSACTIONS_BY_CATEGORY[categoryId]
    const name = possibleNames[Math.floor(Math.random() * possibleNames.length)]
    
    // Random date in the last 12 months
    const date = getRandomDate()
    
    // Add transaction to array
    transactions.push({
      id: i,
      user_id,
      month_id: date.getMonth() + 1, // 1-12 for month
      name,
      amount_cad,
      amount_usd,
      category_id: categoryId,
      notes,
      date,
      type,
      created_at: new Date(date.getTime() - Math.random() * 86400000), // Random time before date
      category: CATEGORIES.find(c => c.id === categoryId)?.name
    })
  }

  // Sort by date, newest first
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export const mockTransactions = generateMockTransactions(100) 