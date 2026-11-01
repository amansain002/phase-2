export type BudgetCurrency = '₹' | '$' | '€' | '£';

export type BudgetStyle = 'smart' | 'saver' | 'balanced' | 'custom';

export type IncomeSource =
  | 'Pocket money'
  | 'Salary'
  | 'Scholarship'
  | 'Part-time'
  | 'Other';

export type PaymentMethod = 'UPI' | 'Cash' | 'Card';

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
}

export interface BudgetCategoryAllocation {
  id: string;
  name: string;
  percentage: number; // 0 to 100
  allocatedAmount: number;
  spentAmount: number;
  color: string;
  icon: string;
}

export interface BudgetPlan {
  monthKey: string; // e.g. '2026-11'
  currency: BudgetCurrency;
  totalIncome: number;
  incomeSource: IncomeSource;
  fixedExpenses: FixedExpense[];
  totalFixed: number;
  spendableAmount: number;
  style: BudgetStyle;
  categories: BudgetCategoryAllocation[];
  createdAt: string;
  updatedAt: string;
}

export interface DetailedExpense {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface QuickAddPreset {
  id: string;
  label: string;
  defaultPrice: number;
  category: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
  color: string;
}

export interface BudgetCritique {
  score: number; // 0-100
  status: 'on_track' | 'caution' | 'critical';
  whatsWorking: string[];
  whatsToImprove: string[];
  coachSummary: string;
  suggestedAction?: string;
}

export interface MonthlyArchive {
  monthKey: string;
  monthName: string;
  totalIncome: number;
  totalSpent: number;
  totalSaved: number;
  healthScore: number;
  topCategory: string;
  topCategorySpent: number;
  categoryBreakdown: { name: string; allocated: number; spent: number }[];
}
