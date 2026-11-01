import {
  BudgetPlan,
  BudgetStyle,
  BudgetCurrency,
  IncomeSource,
  FixedExpense,
  BudgetCategoryAllocation,
  DetailedExpense,
  QuickAddPreset,
  SavingsGoal,
  BudgetCritique,
  MonthlyArchive,
} from '../types/budget';
import {
  SIMPLE_BUDGET_CATEGORIES,
  QUICK_ADD_PRESETS,
  CATEGORY_COLOR_MAP,
  BUDGET_XP_REWARDS,
} from '../data/budgetConfig';

const STORAGE_KEY_PLAN = 'uplevel_simple_budget_plan_v3';
const STORAGE_KEY_EXPENSES = 'uplevel_detailed_expenses_v2';
const STORAGE_KEY_GOALS = 'uplevel_savings_goals_v2';
const STORAGE_KEY_MONTH_CHECK = 'uplevel_budget_last_seen_month';
const STORAGE_KEY_LAST_SUMMARY = 'uplevel_budget_monthly_summary';

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getDaysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

export function getDaysLeftInCurrentMonth(): number {
  const now = new Date();
  const totalDays = getDaysInCurrentMonth();
  return Math.max(1, totalDays - now.getDate() + 1);
}

export function getDaysElapsedInCurrentMonth(): number {
  return new Date().getDate();
}

// -------------------------------------------------------------
// Simple Budget Creator (1 Amount -> Instant 6 Categories)
// -------------------------------------------------------------

export function createSimpleBudget(amount: number, currency: BudgetCurrency = '₹'): BudgetPlan {
  const safeAmount = Math.max(100, amount);

  const categories: BudgetCategoryAllocation[] = SIMPLE_BUDGET_CATEGORIES.map((cat) => ({
    id: `cat-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: cat.name,
    percentage: cat.defaultPercentage,
    allocatedAmount: Math.round(safeAmount * (cat.defaultPercentage / 100)),
    spentAmount: 0,
    color: cat.color,
    icon: cat.iconName,
  }));

  return {
    monthKey: getCurrentMonthKey(),
    currency,
    totalIncome: safeAmount,
    incomeSource: 'Pocket money',
    fixedExpenses: [],
    totalFixed: 0,
    spendableAmount: safeAmount,
    style: 'smart',
    categories,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generateDefaultPlan(totalIncome: number = 5000): BudgetPlan {
  return createSimpleBudget(totalIncome, '₹');
}

export function createBudgetPlan(
  totalIncome: number,
  currency: BudgetCurrency = '₹',
  incomeSource?: IncomeSource,
  fixedExpenses?: FixedExpense[],
  style?: BudgetStyle,
  selectedCategoryNames?: string[],
  userProfession?: string
): BudgetPlan {
  return createSimpleBudget(totalIncome, currency);
}

/**
 * Rebalances other categories when the user changes one category slider,
 * maintaining an exact 100% total.
 */
export function rebalanceCategories(
  categories: BudgetCategoryAllocation[],
  targetCategoryId: string,
  newPercentage: number,
  spendableAmount: number
): BudgetCategoryAllocation[] {
  const clampedNewPct = Math.max(1, Math.min(95, Math.round(newPercentage)));
  const targetCategory = categories.find((c) => c.id === targetCategoryId);
  if (!targetCategory) return categories;

  const others = categories.filter((c) => c.id !== targetCategoryId);
  const otherOldTotal = others.reduce((sum, c) => sum + c.percentage, 0);
  const newOthersTotal = 100 - clampedNewPct;

  let assignedPct = 0;
  const updatedOthers = others.map((cat, idx) => {
    let rebalancedPct = 0;
    if (otherOldTotal > 0) {
      rebalancedPct = Math.round((cat.percentage / otherOldTotal) * newOthersTotal);
    } else {
      rebalancedPct = Math.floor(newOthersTotal / others.length);
    }
    rebalancedPct = Math.max(1, rebalancedPct);

    if (idx === others.length - 1) {
      rebalancedPct = Math.max(1, newOthersTotal - assignedPct);
    } else {
      assignedPct += rebalancedPct;
    }

    return {
      ...cat,
      percentage: rebalancedPct,
      allocatedAmount: Math.round(spendableAmount * (rebalancedPct / 100)),
    };
  });

  const updatedTarget: BudgetCategoryAllocation = {
    ...targetCategory,
    percentage: clampedNewPct,
    allocatedAmount: Math.round(spendableAmount * (clampedNewPct / 100)),
  };

  return categories.map((c) => (c.id === targetCategoryId ? updatedTarget : updatedOthers.find((o) => o.id === c.id)!));
}

// -------------------------------------------------------------
// Live Metrics & Analytics
// -------------------------------------------------------------

export interface BudgetMetrics {
  totalIncome: number;
  totalFixed: number;
  spendableAmount: number;
  totalSpent: number;
  remainingSpendable: number;
  spentPercentage: number;
  todaySpent: number;
  dailySpendingLimit: number;
  weeklyLimit: number;
  daysInMonth: number;
  daysLeft: number;
  daysElapsed: number;
  averageDailySpend: number;
  projectedMonthEndSpend: number;
  projectedSavings: number;
  paceStatus: 'on_track' | 'ahead' | 'behind';
}

export function computeBudgetMetrics(
  plan: BudgetPlan,
  expenses: DetailedExpense[]
): BudgetMetrics {
  const currentMonth = getCurrentMonthKey();
  const todayStr = new Date().toISOString().split('T')[0];

  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const totalSpent = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const todaySpent = monthExpenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const daysInMonth = getDaysInCurrentMonth();
  const daysLeft = getDaysLeftInCurrentMonth();
  const daysElapsed = Math.max(1, getDaysElapsedInCurrentMonth());

  const spendableAmount = plan.spendableAmount;
  const remainingSpendable = Math.max(0, spendableAmount - totalSpent);
  const spentPercentage = spendableAmount > 0 ? Math.min(100, Math.round((totalSpent / spendableAmount) * 100)) : 0;

  // Key numbers: Per Day and Per Week
  const dailySpendingLimit = Math.max(0, Math.round(remainingSpendable / daysLeft));
  const weeklyLimit = Math.round(dailySpendingLimit * 7);

  const averageDailySpend = Math.round(totalSpent / daysElapsed);
  const projectedMonthEndSpend = totalSpent + averageDailySpend * Math.max(0, daysLeft - 1);
  const projectedSavings = Math.max(0, spendableAmount - projectedMonthEndSpend);

  let paceStatus: 'on_track' | 'ahead' | 'behind' = 'on_track';
  const expectedSpendRatio = daysElapsed / daysInMonth;
  const actualSpendRatio = spendableAmount > 0 ? totalSpent / spendableAmount : 0;

  if (actualSpendRatio > expectedSpendRatio + 0.1) {
    paceStatus = 'behind';
  } else if (actualSpendRatio < expectedSpendRatio - 0.08) {
    paceStatus = 'ahead';
  }

  return {
    totalIncome: plan.totalIncome,
    totalFixed: plan.totalFixed,
    spendableAmount,
    totalSpent,
    remainingSpendable,
    spentPercentage,
    todaySpent,
    dailySpendingLimit,
    weeklyLimit,
    daysInMonth,
    daysLeft,
    daysElapsed,
    averageDailySpend,
    projectedMonthEndSpend,
    projectedSavings,
    paceStatus,
  };
}

// -------------------------------------------------------------
// Coach Reaction After Expense
// -------------------------------------------------------------

export function getCoachFeedbackAfterExpense(
  categoryName: string,
  categorySpent: number,
  categoryAllocated: number,
  todaySpent: number,
  dailyLimit: number,
  characterName: string = 'Naruto Uzumaki'
): string {
  const catPct = categoryAllocated > 0 ? (categorySpent / categoryAllocated) * 100 : 0;

  if (catPct >= 100) {
    return `${characterName} warns: "Watch out! ${categoryName} is over budget! Let's hold off on more spending here."`;
  }
  if (catPct >= 85) {
    return `${characterName} says: "Careful, ${categoryName} is almost full (${Math.round(catPct)}% used)."`;
  }
  if (todaySpent > dailyLimit && dailyLimit > 0) {
    return `${characterName} notes: "Heads up! We crossed today's daily target. Let's make it up tomorrow!"`;
  }
  return `${characterName} praises: "Nice, you are on track! Keep that financial discipline strong!"`;
}

// -------------------------------------------------------------
// XP Anti-Spam & Daily Limit Rewards
// -------------------------------------------------------------

export function canClaimExpenseXP(): boolean {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `uplevel_budget_xp_count_${today}`;
    const count = parseInt(localStorage.getItem(key) || '0', 10);
    return count < BUDGET_XP_REWARDS.MAX_DAILY_EXPENSE_CLAIMS; // max 3 per day
  } catch {
    return true;
  }
}

export function recordExpenseXPClaim(): void {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `uplevel_budget_xp_count_${today}`;
    const count = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, (count + 1).toString());
  } catch {}
}

export function canClaimDailyLimitXP(): boolean {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `uplevel_daily_under_limit_claimed_${today}`;
    return localStorage.getItem(key) !== 'true';
  } catch {
    return true;
  }
}

export function recordDailyLimitXPClaim(): void {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `uplevel_daily_under_limit_claimed_${today}`;
    localStorage.setItem(key, 'true');
  } catch {}
}

// -------------------------------------------------------------
// Monthly Reset Check & Summary
// -------------------------------------------------------------

export interface MonthEndSummary {
  previousMonth: string;
  totalSaved: number;
  totalSpent: number;
  startingBudget: number;
}

export function checkAndHandleMonthlyReset(): MonthEndSummary | null {
  try {
    const currentMonth = getCurrentMonthKey();
    const lastSeenMonth = localStorage.getItem(STORAGE_KEY_MONTH_CHECK);

    if (!lastSeenMonth) {
      localStorage.setItem(STORAGE_KEY_MONTH_CHECK, currentMonth);
      return null;
    }

    if (lastSeenMonth !== currentMonth) {
      // Month changed! Generate summary of last month
      const plan = loadStoredBudgetPlan();
      const expenses = loadStoredDetailedExpenses();
      const lastMonthExpenses = expenses.filter((e) => e.date.startsWith(lastSeenMonth));
      const totalSpent = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);
      const totalSaved = Math.max(0, plan.spendableAmount - totalSpent);

      const summary: MonthEndSummary = {
        previousMonth: lastSeenMonth,
        totalSaved,
        totalSpent,
        startingBudget: plan.totalIncome,
      };

      localStorage.setItem(STORAGE_KEY_LAST_SUMMARY, JSON.stringify(summary));
      localStorage.setItem(STORAGE_KEY_MONTH_CHECK, currentMonth);

      // Create fresh budget for new month copying previous total
      const freshPlan = createSimpleBudget(plan.totalIncome, plan.currency);
      saveStoredBudgetPlan(freshPlan);

      return summary;
    }
  } catch {}
  return null;
}

export function getLastMonthSummary(): MonthEndSummary | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAST_SUMMARY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function clearLastMonthSummary(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_LAST_SUMMARY);
  } catch {}
}

// -------------------------------------------------------------
// Local Storage Persistence
// -------------------------------------------------------------

export function loadStoredBudgetPlan(): BudgetPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAN);
    if (raw) {
      const parsed: BudgetPlan = JSON.parse(raw);
      if (parsed.monthKey === getCurrentMonthKey() && parsed.categories?.length > 0) {
        return parsed;
      }
    }
  } catch {}
  const def = generateDefaultPlan();
  saveStoredBudgetPlan(def);
  return def;
}

export function saveStoredBudgetPlan(plan: BudgetPlan): void {
  try {
    localStorage.setItem(STORAGE_KEY_PLAN, JSON.stringify(plan));
  } catch {}
}

export function loadStoredDetailedExpenses(): DetailedExpense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveStoredDetailedExpenses(expenses: DetailedExpense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  } catch {}
}

export function loadStoredSavingsGoals(): SavingsGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GOALS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveStoredSavingsGoals(goals: SavingsGoal[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
  } catch {}
}

export function loadStoredQuickPresets(): QuickAddPreset[] {
  try {
    const raw = localStorage.getItem('uplevel_quick_budget_presets');
    if (raw) return JSON.parse(raw);
  } catch {}
  return QUICK_ADD_PRESETS;
}

export function saveStoredQuickPresets(presets: QuickAddPreset[]): void {
  try {
    localStorage.setItem('uplevel_quick_budget_presets', JSON.stringify(presets));
  } catch {}
}
