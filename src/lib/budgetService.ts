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
  DEFAULT_STUDENT_CATEGORIES,
  STUDENT_SAVER_SPLIT,
  BALANCED_50_30_20_SPLIT,
  WORKER_SPLIT,
  ENTREPRENEUR_SPLIT,
  QUICK_ADD_PRESETS,
  CATEGORY_COLOR_MAP,
} from '../data/budgetConfig';

const STORAGE_KEY_PLAN = 'uplevel_budget_plan_v2';
const STORAGE_KEY_EXPENSES = 'uplevel_detailed_expenses_v2';
const STORAGE_KEY_GOALS = 'uplevel_savings_goals_v2';
const STORAGE_KEY_ARCHIVES = 'uplevel_monthly_budget_archives';
const STORAGE_KEY_PRESETS = 'uplevel_quick_budget_presets';

// Helper to get current month key: YYYY-MM
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
// Generation & Rebalancing Engine
// -------------------------------------------------------------

export function generateDefaultPlan(totalIncome: number = 5000): BudgetPlan {
  const fixedExpenses: FixedExpense[] = [
    { id: 'fx-phone', name: 'Mobile Recharge', amount: 299 },
    { id: 'fx-subs', name: 'Spotify / Apps', amount: 119 },
  ];
  const totalFixed = fixedExpenses.reduce((sum, f) => sum + f.amount, 0);
  const spendable = Math.max(0, totalIncome - totalFixed);

  const categories: BudgetCategoryAllocation[] = DEFAULT_STUDENT_CATEGORIES.map((cat) => ({
    id: `cat-${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: cat.name,
    percentage: cat.defaultPercentage,
    allocatedAmount: Math.round(spendable * (cat.defaultPercentage / 100)),
    spentAmount: 0,
    color: cat.color,
    icon: cat.iconName,
  }));

  return {
    monthKey: getCurrentMonthKey(),
    currency: '₹',
    totalIncome,
    incomeSource: 'Pocket money',
    fixedExpenses,
    totalFixed,
    spendableAmount: spendable,
    style: 'smart',
    categories,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createBudgetPlan(
  totalIncome: number,
  currency: BudgetCurrency,
  incomeSource: IncomeSource,
  fixedExpenses: FixedExpense[],
  style: BudgetStyle,
  selectedCategoryNames: string[],
  userProfession?: string
): BudgetPlan {
  const totalFixed = fixedExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const spendableAmount = Math.max(0, totalIncome - totalFixed);

  // Determine split dictionary based on style / profile
  let splitMap: Record<string, number> = {};

  if (style === 'saver') {
    splitMap = { ...STUDENT_SAVER_SPLIT };
  } else if (style === 'balanced') {
    splitMap = { ...BALANCED_50_30_20_SPLIT };
  } else if (style === 'smart') {
    if (userProfession === 'Office Worker') {
      splitMap = { ...WORKER_SPLIT };
    } else if (userProfession === 'Entrepreneur') {
      splitMap = { ...ENTREPRENEUR_SPLIT };
    } else {
      DEFAULT_STUDENT_CATEGORIES.forEach((c) => {
        splitMap[c.name] = c.defaultPercentage;
      });
    }
  } else {
    // Custom: equal initial split
    const equalShare = Math.floor(100 / Math.max(1, selectedCategoryNames.length));
    selectedCategoryNames.forEach((name) => {
      splitMap[name] = equalShare;
    });
  }

  // Filter to only selected categories
  const activeNames = selectedCategoryNames.length > 0
    ? selectedCategoryNames
    : DEFAULT_STUDENT_CATEGORIES.map((c) => c.name);

  // Sum raw percentages
  let rawSum = 0;
  activeNames.forEach((name) => {
    rawSum += splitMap[name] || 5;
  });

  // Normalize so total is strictly 100%
  let runningTotalPct = 0;
  const categories: BudgetCategoryAllocation[] = activeNames.map((name, idx) => {
    const rawVal = splitMap[name] || 5;
    let normalizedPct = Math.round((rawVal / rawSum) * 100);

    // Ensure last element rounds out precisely to 100%
    if (idx === activeNames.length - 1) {
      normalizedPct = Math.max(1, 100 - runningTotalPct);
    } else {
      runningTotalPct += normalizedPct;
    }

    const template = DEFAULT_STUDENT_CATEGORIES.find((c) => c.name === name);
    const color = template?.color || CATEGORY_COLOR_MAP[name] || '#6366F1';
    const icon = template?.iconName || 'MoreHorizontal';

    return {
      id: `cat-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name,
      percentage: normalizedPct,
      allocatedAmount: Math.round(spendableAmount * (normalizedPct / 100)),
      spentAmount: 0,
      color,
      icon,
    };
  });

  return {
    monthKey: getCurrentMonthKey(),
    currency,
    totalIncome,
    incomeSource,
    fixedExpenses,
    totalFixed,
    spendableAmount,
    style,
    categories,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
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

  // Filter to this month's expenses
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

  const dailySpendingLimit = Math.max(0, Math.round(remainingSpendable / daysLeft));
  const weeklyLimit = Math.round(dailySpendingLimit * 7);

  const averageDailySpend = Math.round(totalSpent / daysElapsed);
  const projectedMonthEndSpend = totalSpent + averageDailySpend * Math.max(0, daysLeft - 1);
  const projectedSavings = Math.max(0, spendableAmount - projectedMonthEndSpend);

  // Pace status
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
// Critique AI & Health Score Engine
// -------------------------------------------------------------

export function evaluateBudgetCritique(
  plan: BudgetPlan,
  expenses: DetailedExpense[],
  characterName: string = 'Naruto Uzumaki'
): BudgetCritique {
  const metrics = computeBudgetMetrics(plan, expenses);
  let score = 85;
  const whatsWorking: string[] = [];
  const whatsToImprove: string[] = [];

  // 1. Savings Analysis
  const savingsCategory = plan.categories.find((c) => c.name.toLowerCase().includes('saving'));
  if (savingsCategory && savingsCategory.percentage >= 15) {
    score += 5;
    whatsWorking.push(`High savings allocation (${savingsCategory.percentage}% of spendable income) builds a strong financial shield.`);
  } else if (!savingsCategory || savingsCategory.percentage < 8) {
    score -= 8;
    whatsToImprove.push('Savings allocation is below 8%. Aim for at least 10% to protect against unexpected costs.');
  }

  // 2. Pace Evaluation
  if (metrics.paceStatus === 'ahead') {
    score += 8;
    whatsWorking.push(`Currently ahead of your monthly pace: saving an estimated ₹${metrics.projectedSavings} by month end.`);
  } else if (metrics.paceStatus === 'behind') {
    score -= 15;
    whatsToImprove.push(`Pace alert: spending is running faster than the calendar (${Math.round((metrics.totalSpent / Math.max(1, metrics.spendableAmount)) * 100)}% spent with ${metrics.daysLeft} days remaining).`);
  } else {
    whatsWorking.push('Spending is nicely aligned with the days left in the month.');
  }

  // 3. Category Overspend Check
  const currentMonth = getCurrentMonthKey();
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));

  let overbudgetCount = 0;
  plan.categories.forEach((cat) => {
    const catSpent = monthExpenses
      .filter((e) => e.category === cat.name)
      .reduce((s, e) => s + e.amount, 0);
    const catPct = cat.allocatedAmount > 0 ? (catSpent / cat.allocatedAmount) * 100 : 0;

    if (catPct >= 100) {
      overbudgetCount++;
      whatsToImprove.push(`${cat.name} is over budget (₹${catSpent} of ₹${cat.allocatedAmount} spent).`);
    } else if (catPct >= 80) {
      whatsToImprove.push(`${cat.name} has reached ${Math.round(catPct)}% of its limit.`);
    } else if (catPct <= 50 && catSpent > 0) {
      whatsWorking.push(`${cat.name} is well under control (${Math.round(catPct)}% used).`);
    }
  });

  score -= overbudgetCount * 8;
  score = Math.max(20, Math.min(100, score));

  let status: 'on_track' | 'caution' | 'critical' = 'on_track';
  if (score < 50) status = 'critical';
  else if (score < 75) status = 'caution';

  const coachSummary =
    score >= 80
      ? `Outstanding discipline! ${characterName} says: "Your financial chakra is balanced! Keep stacking those savings!"`
      : score >= 60
      ? `Steady, but watch those impulse cravings! ${characterName} advises trimming discretionary spending for the next 7 days.`
      : `Danger zone! ${characterName} warns: "We need an emergency rebalance right now before you run dry before month-end!"`;

  return {
    score,
    status,
    whatsWorking: whatsWorking.slice(0, 3),
    whatsToImprove: whatsToImprove.slice(0, 3),
    coachSummary,
    suggestedAction:
      overbudgetCount > 0
        ? 'Rebalance budget to shift funds from underspent categories'
        : 'Lock ₹200 extra into your Savings goal today',
  };
}

// -------------------------------------------------------------
// Smart Alerts & Insights
// -------------------------------------------------------------

export interface SmartInsight {
  id: string;
  type: 'weekend' | 'top_category' | 'run_out' | 'streak';
  title: string;
  description: string;
  actionLabel?: string;
  actionType?: string;
}

export function generateSmartInsights(
  plan: BudgetPlan,
  expenses: DetailedExpense[]
): SmartInsight[] {
  const currentMonth = getCurrentMonthKey();
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const insights: SmartInsight[] = [];

  if (monthExpenses.length === 0) return insights;

  // 1. Weekend vs Weekday analysis
  let weekendSum = 0;
  let weekendDays = 0;
  let weekdaySum = 0;
  let weekdayDays = 0;

  monthExpenses.forEach((exp) => {
    const day = new Date(exp.date).getDay();
    if (day === 0 || day === 6) {
      weekendSum += exp.amount;
      weekendDays++;
    } else {
      weekdaySum += exp.amount;
      weekdayDays++;
    }
  });

  const avgWeekend = weekendDays > 0 ? weekendSum / weekendDays : 0;
  const avgWeekday = weekdayDays > 0 ? weekdaySum / weekdayDays : 0;

  if (avgWeekend > avgWeekday * 1.3 && avgWeekend > 50) {
    const higherPct = Math.round(((avgWeekend - avgWeekday) / Math.max(1, avgWeekday)) * 100);
    insights.push({
      id: 'weekend-surge',
      type: 'weekend',
      title: `Weekend Surge (+${higherPct}%)`,
      description: `You spend ${higherPct}% more on weekends than weekdays. Plan small weekend caps to protect your monthly savings.`,
    });
  }

  // 2. Top Spending Category
  const catTotals: Record<string, number> = {};
  monthExpenses.forEach((e) => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });

  let topCat = '';
  let topAmount = 0;
  Object.entries(catTotals).forEach(([cat, amt]) => {
    if (amt > topAmount) {
      topAmount = amt;
      topCat = cat;
    }
  });

  if (topCat && topAmount > 0) {
    const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const catPct = Math.round((topAmount / Math.max(1, totalSpent)) * 100);
    insights.push({
      id: 'top-cat',
      type: 'top_category',
      title: `${topCat} is Top Expense (${catPct}%)`,
      description: `₹${topAmount} has gone to ${topCat} this month. Watch quick daily purchases here to keep limits safe.`,
    });
  }

  // 3. Projected Run-Out Date Alert
  const metrics = computeBudgetMetrics(plan, expenses);
  if (metrics.paceStatus === 'behind' && metrics.averageDailySpend > 0) {
    const daysUntilExhaustion = Math.floor(metrics.remainingSpendable / metrics.averageDailySpend);
    const runOutDay = metrics.daysElapsed + daysUntilExhaustion;
    if (runOutDay <= metrics.daysInMonth) {
      insights.push({
        id: 'run-out-alert',
        type: 'run_out',
        title: `Projected Exhaustion on Day ${runOutDay}`,
        description: `At current pace (₹${metrics.averageDailySpend}/day), funds may run out before month end. Limit daily spend to ₹${metrics.dailySpendingLimit} to stay safe.`,
        actionLabel: 'Rebalance Budget',
        actionType: 'rebalance',
      });
    }
  }

  return insights;
}

// -------------------------------------------------------------
// Auto-Rebalance Engine
// -------------------------------------------------------------

export function autoRebalanceBudget(
  plan: BudgetPlan,
  expenses: DetailedExpense[]
): BudgetPlan {
  const currentMonth = getCurrentMonthKey();
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const spendable = plan.spendableAmount;

  // Identify categories: surplus vs deficit
  const surplusCategories: { id: string; surplus: number }[] = [];
  const deficitCategories: { id: string; deficit: number }[] = [];

  plan.categories.forEach((cat) => {
    const spent = monthExpenses
      .filter((e) => e.category === cat.name)
      .reduce((s, e) => s + e.amount, 0);
    const remaining = cat.allocatedAmount - spent;

    if (remaining < 0) {
      deficitCategories.push({ id: cat.id, deficit: Math.abs(remaining) });
    } else if (remaining > cat.allocatedAmount * 0.35 && cat.percentage > 5) {
      surplusCategories.push({ id: cat.id, surplus: Math.round(remaining * 0.4) });
    }
  });

  const totalSurplusAvailable = surplusCategories.reduce((s, c) => s + c.surplus, 0);
  const totalDeficitNeeded = deficitCategories.reduce((s, c) => s + c.deficit, 0);

  if (totalSurplusAvailable === 0 || totalDeficitNeeded === 0) {
    return plan;
  }

  const shiftAmount = Math.min(totalSurplusAvailable, totalDeficitNeeded);

  // Distribute shifts in percentages
  const updatedCategories = plan.categories.map((cat) => {
    const isSurplus = surplusCategories.find((s) => s.id === cat.id);
    const isDeficit = deficitCategories.find((d) => d.id === cat.id);

    if (isSurplus) {
      const deduction = Math.round((isSurplus.surplus / totalSurplusAvailable) * shiftAmount);
      const newAlloc = Math.max(100, cat.allocatedAmount - deduction);
      const newPct = Math.max(2, Math.round((newAlloc / spendable) * 100));
      return { ...cat, allocatedAmount: newAlloc, percentage: newPct };
    }

    if (isDeficit) {
      const addition = Math.round((isDeficit.deficit / totalDeficitNeeded) * shiftAmount);
      const newAlloc = cat.allocatedAmount + addition;
      const newPct = Math.round((newAlloc / spendable) * 100);
      return { ...cat, allocatedAmount: newAlloc, percentage: newPct };
    }

    return cat;
  });

  // Re-normalize to 100%
  let sumPct = updatedCategories.reduce((s, c) => s + c.percentage, 0);
  if (sumPct !== 100 && updatedCategories.length > 0) {
    updatedCategories[0].percentage += 100 - sumPct;
  }

  return {
    ...plan,
    categories: updatedCategories,
    updatedAt: new Date().toISOString(),
  };
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
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  // Initial seed demo expenses for authentic feel
  const currentMonth = getCurrentMonthKey();
  const demoExpenses: DetailedExpense[] = [
    {
      id: 'demo-exp-1',
      amount: 60,
      category: 'Canteen',
      note: 'Dosa and chai breakfast',
      date: `${currentMonth}-01`,
      time: '09:30',
      paymentMethod: 'UPI',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-exp-2',
      amount: 150,
      category: 'Stationery and Books',
      note: 'Spiral notebook and pens',
      date: `${currentMonth}-01`,
      time: '13:15',
      paymentMethod: 'UPI',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-exp-3',
      amount: 25,
      category: 'Travel and Transport',
      note: 'Campus metro ticket',
      date: `${currentMonth}-01`,
      time: '17:40',
      paymentMethod: 'Cash',
      createdAt: new Date().toISOString(),
    },
  ];

  saveStoredDetailedExpenses(demoExpenses);
  return demoExpenses;
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

  const currentYear = new Date().getFullYear();
  const demoGoals: SavingsGoal[] = [
    {
      id: 'goal-1',
      title: 'Coding Laptop Upgrade',
      targetAmount: 45000,
      savedAmount: 18500,
      targetDate: `${currentYear}-12-31`,
      category: 'Savings',
      color: '#3B82F6',
    },
    {
      id: 'goal-2',
      title: 'Emergency Reserve',
      targetAmount: 10000,
      savedAmount: 4500,
      targetDate: `${currentYear}-11-30`,
      category: 'Emergency Fund',
      color: '#EF4444',
    },
  ];
  saveStoredSavingsGoals(demoGoals);
  return demoGoals;
}

export function saveStoredSavingsGoals(goals: SavingsGoal[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
  } catch {}
}

export function loadStoredQuickPresets(): QuickAddPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRESETS);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveStoredQuickPresets(QUICK_ADD_PRESETS);
  return QUICK_ADD_PRESETS;
}

export function saveStoredQuickPresets(presets: QuickAddPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(presets));
  } catch {}
}
