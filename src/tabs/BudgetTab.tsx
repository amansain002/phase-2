import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  Sliders,
  PiggyBank,
  Search,
  Filter,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  Zap,
  Info,
  Check,
  X,
} from 'lucide-react';
import {
  BudgetPlan,
  DetailedExpense,
  SavingsGoal,
  BudgetCategoryAllocation,
  BudgetCritique,
} from '../types/budget';
import {
  loadStoredBudgetPlan,
  saveStoredBudgetPlan,
  loadStoredDetailedExpenses,
  saveStoredDetailedExpenses,
  loadStoredSavingsGoals,
  saveStoredSavingsGoals,
  computeBudgetMetrics,
  evaluateBudgetCritique,
  generateSmartInsights,
  autoRebalanceBudget,
  rebalanceCategories,
  createBudgetPlan,
} from '../lib/budgetService';
import {
  CATEGORY_ICON_MAP,
  BUDGET_XP_REWARDS,
} from '../data/budgetConfig';
import { useTheme } from '../context/ThemeProvider';
import { useApp } from '../context/AppContext';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { BudgetDonutChart } from '../components/BudgetDonutChart';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { BudgetSetupModal } from '../components/BudgetSetupModal';
import { generateAssistantReply } from '../lib/gemini';

export const BudgetTab: React.FC = () => {
  const { character } = useTheme();
  const { addXp, progress } = useApp();

  const [budgetPlan, setBudgetPlan] = useState<BudgetPlan>(loadStoredBudgetPlan);
  const [expenses, setExpenses] = useState<DetailedExpense[]>(loadStoredDetailedExpenses);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(loadStoredSavingsGoals);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isRebalanceConfirmOpen, setIsRebalanceConfirmOpen] = useState<boolean>(false);
  const [isRegeneratingAI, setIsRegeneratingAI] = useState<boolean>(false);
  const [aiCritiqueNote, setAiCritiqueNote] = useState<string | null>(null);

  // Filter & Search states for history
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTimeframe, setFilterTimeframe] = useState<'all' | 'week' | 'month'>('month');

  // Editing Category Slider state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // New Goal modal state
  const [isAddGoalOpen, setIsAddGoalOpen] = useState<boolean>(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');

  // Persist whenever state changes
  useEffect(() => {
    saveStoredBudgetPlan(budgetPlan);
  }, [budgetPlan]);

  useEffect(() => {
    saveStoredDetailedExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveStoredSavingsGoals(savingsGoals);
  }, [savingsGoals]);

  const metrics = computeBudgetMetrics(budgetPlan, expenses);
  const critique = evaluateBudgetCritique(budgetPlan, expenses, character.name);
  const insights = generateSmartInsights(budgetPlan, expenses);

  // Add Expense Handler with Live XP & Toast
  const handleAddExpense = (expenseData: Omit<DetailedExpense, 'id' | 'createdAt'>) => {
    const newExp: DetailedExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updatedExpenses = [newExp, ...expenses];
    setExpenses(updatedExpenses);

    // Compute remaining after this transaction
    const newMetrics = computeBudgetMetrics(budgetPlan, updatedExpenses);

    // Award +5 XP through core engine
    addXp(
      BUDGET_XP_REWARDS.LOG_EXPENSE,
      `${expenseData.category} -${budgetPlan.currency}${expenseData.amount}. ${budgetPlan.currency}${newMetrics.remainingSpendable.toLocaleString()} left this month. Today's limit: ${budgetPlan.currency}${newMetrics.dailySpendingLimit} left.`
    );
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSliderChange = (catId: string, newPct: number) => {
    const updated = rebalanceCategories(
      budgetPlan.categories,
      catId,
      newPct,
      budgetPlan.spendableAmount
    );
    setBudgetPlan({
      ...budgetPlan,
      categories: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleApplyRebalance = () => {
    const rebalanced = autoRebalanceBudget(budgetPlan, expenses);
    setBudgetPlan(rebalanced);
    setIsRebalanceConfirmOpen(false);
    addXp(10, 'Budget rebalanced successfully! Funds redistributed safely.');
  };

  const handleRegenerateWithAI = async () => {
    setIsRegeneratingAI(true);
    try {
      const prompt = `Critique this student monthly budget in 2 punchy sentences as ${character.name}:
Total income: ${budgetPlan.currency}${budgetPlan.totalIncome}, Total spent: ${budgetPlan.currency}${metrics.totalSpent}, Spendable left: ${budgetPlan.currency}${metrics.remainingSpendable}, Days left: ${metrics.daysLeft}. Categories: ${budgetPlan.categories.map((c) => `${c.name}: ${c.percentage}%`).join(', ')}. Give 1 praise and 1 sharp actionable advice.`;

      const response = await generateAssistantReply(prompt, character);
      setAiCritiqueNote(response);
    } catch {
      setAiCritiqueNote(
        `${character.name} says: "Keep discipline on your canteen and entertainment limits! Allocate at least 15% to savings before spending on fun!"`
      );
    } finally {
      setIsRegeneratingAI(false);
    }
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newGoalAmount);
    if (!newGoalTitle.trim() || !amt || amt <= 0) return;

    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle.trim(),
      targetAmount: amt,
      savedAmount: 0,
      targetDate: newGoalDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      category: 'Savings',
      color: '#3B82F6',
    };

    setSavingsGoals([...savingsGoals, newGoal]);
    setNewGoalTitle('');
    setNewGoalAmount('');
    setNewGoalDate('');
    setIsAddGoalOpen(false);
    addXp(15, `New Savings Goal created: ${newGoal.title}!`);
  };

  // Filtered Expense History
  const filteredExpenses = expenses.filter((e) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        e.category.toLowerCase().includes(q) ||
        e.note.toLowerCase().includes(q) ||
        e.amount.toString().includes(q);
      if (!match) return false;
    }
    // Category filter
    if (filterCategory !== 'all' && e.category !== filterCategory) {
      return false;
    }
    // Timeframe filter
    if (filterTimeframe === 'week') {
      const expDate = new Date(e.date);
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      if (expDate < weekAgo) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 animate-fadeIn pb-12 select-none">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-extrabold text-coffee flex items-center gap-2">
            <Wallet className="text-saddle" size={19} />
            <span>Real-Time Budget Planner</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Live Tracker
            </span>
          </h2>
          <p className="text-[11px] text-coffee-muted">
            {metrics.daysLeft} days left in {new Date().toLocaleString('default', { month: 'long' })} • Pace: {metrics.paceStatus.replace('_', ' ')}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSetupOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-edge bg-surface2/80 hover:bg-sand/30 text-coffee text-xs font-semibold transition active:scale-95 touch-target"
          >
            <Sliders size={13} />
            <span>Setup Plan</span>
          </button>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-extrabold shadow-md transition active:scale-95 touch-target"
            style={{ backgroundColor: character.theme.primary }}
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* 2. Top Live Metrics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Card 1: Total Spendable Remaining */}
        <div className="p-3.5 rounded-2xl bg-surface/90 border border-edge shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-coffee-muted uppercase tracking-wider block">
            Spendable Left
          </span>
          <span className="text-lg font-black text-coffee font-mono block">
            {budgetPlan.currency}{metrics.remainingSpendable.toLocaleString()}
          </span>
          <span className="text-[10px] text-coffee-muted">
            of {budgetPlan.currency}{metrics.spendableAmount.toLocaleString()} total
          </span>
        </div>

        {/* Card 2: Today's Daily Limit */}
        <div className="p-3.5 rounded-2xl bg-surface/90 border border-edge shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-coffee-muted uppercase tracking-wider block">
            Today's Limit
          </span>
          <span
            className={`text-lg font-black font-mono block ${
              metrics.dailySpendingLimit > 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {budgetPlan.currency}{metrics.dailySpendingLimit.toLocaleString()}
          </span>
          <span className="text-[10px] text-coffee-muted">
            {budgetPlan.currency}{metrics.todaySpent} spent today
          </span>
        </div>

        {/* Card 3: Weekly Target */}
        <div className="p-3.5 rounded-2xl bg-surface/90 border border-edge shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-coffee-muted uppercase tracking-wider block">
            Weekly Limit
          </span>
          <span className="text-lg font-black text-coffee font-mono block">
            {budgetPlan.currency}{metrics.weeklyLimit.toLocaleString()}
          </span>
          <span className="text-[10px] text-coffee-muted">
            {metrics.daysLeft} days remaining
          </span>
        </div>

        {/* Card 4: Month-End Projection */}
        <div className="p-3.5 rounded-2xl bg-surface/90 border border-edge shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-coffee-muted uppercase tracking-wider">
              Projected Balance
            </span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                metrics.paceStatus === 'behind'
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {metrics.paceStatus}
            </span>
          </div>
          <span
            className={`text-lg font-black font-mono block ${
              metrics.projectedSavings > 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {budgetPlan.currency}{metrics.projectedSavings.toLocaleString()}
          </span>
          <span className="text-[10px] text-coffee-muted">
            pace avg: {budgetPlan.currency}{metrics.averageDailySpend}/day
          </span>
        </div>
      </div>

      {/* 3. Donut Chart & Category Split Breakdown */}
      <BudgetDonutChart
        categories={budgetPlan.categories}
        expenses={expenses}
        spendableAmount={budgetPlan.spendableAmount}
        totalSpent={metrics.totalSpent}
        currency={budgetPlan.currency}
      />

      {/* 4. Critique AI Card (Score, What's Working, What to Improve) */}
      <div className="p-4 rounded-3xl bg-surface/90 border border-edge space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Score Circular Gauge */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="3.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke={
                    critique.score >= 80 ? '#22C55E' : critique.score >= 60 ? '#F59E0B' : '#EF4444'
                  }
                  strokeWidth="3.5"
                  strokeDasharray={`${(critique.score / 100) * 88} 88`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-black text-xs text-coffee font-mono">
                {critique.score}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-xs text-coffee">Critique AI Financial Health</h3>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase"
                  style={{
                    backgroundColor: `${character.theme.primary}15`,
                    color: character.theme.primary,
                  }}
                >
                  Grade {critique.score >= 80 ? 'A' : critique.score >= 65 ? 'B' : 'C'}
                </span>
              </div>
              <p className="text-[10px] text-coffee-muted">Live spending analysis & coaching</p>
            </div>
          </div>

          <button
            onClick={handleRegenerateWithAI}
            disabled={isRegeneratingAI}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-edge bg-surface2 hover:bg-sand/30 text-coffee text-xs font-semibold transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRegeneratingAI ? 'animate-spin' : ''} />
            <span>Ask Coach</span>
          </button>
        </div>

        {/* AI Character Speech Bubble */}
        <div className="p-3 rounded-2xl bg-surface2/70 border border-edge flex items-start gap-2.5">
          <CharacterAvatar character={character} size="sm" />
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: character.theme.primary }}>
              {character.name}'s Financial Advice
            </span>
            <p className="text-xs text-coffee mt-0.5 leading-relaxed">
              {aiCritiqueNote || critique.coachSummary}
            </p>
          </div>
        </div>

        {/* What's Working vs What to Improve */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* What's Working */}
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={12} /> What's Working
            </span>
            <ul className="space-y-1">
              {critique.whatsWorking.map((item, idx) => (
                <li key={idx} className="text-[11px] text-coffee/90 leading-snug">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          {/* What to Improve */}
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle size={12} /> What to Watch
            </span>
            <ul className="space-y-1">
              {critique.whatsToImprove.map((item, idx) => (
                <li key={idx} className="text-[11px] text-coffee/90 leading-snug">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 5. Smart Insights & Rebalance Alert */}
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className="p-3.5 rounded-2xl border border-edge bg-surface/90 flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${character.theme.primary}20`,
                    color: character.theme.primary,
                  }}
                >
                  <Zap size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-coffee">{ins.title}</h4>
                  <p className="text-[11px] text-coffee-muted mt-0.5">{ins.description}</p>
                </div>
              </div>

              {ins.actionLabel && (
                <button
                  onClick={() => setIsRebalanceConfirmOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-white text-[11px] font-bold shrink-0 transition active:scale-95"
                  style={{ backgroundColor: character.theme.primary }}
                >
                  {ins.actionLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 6. Category Progress Bars & Interactive Sliders */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-coffee uppercase tracking-wider">
            Category Allocations & Sliders
          </h3>
          <span className="text-[10px] text-coffee-muted font-mono">
            Auto-rebalances to 100%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {budgetPlan.categories.map((cat) => {
            const Icon = CATEGORY_ICON_MAP[cat.name] || Wallet;
            const spent = expenses
              .filter((e) => e.category === cat.name)
              .reduce((sum, e) => sum + e.amount, 0);
            const pctUsed = cat.allocatedAmount > 0 ? Math.round((spent / cat.allocatedAmount) * 100) : 0;
            const isOver = pctUsed > 100;

            let barColor = '#22C55E';
            if (pctUsed > 100) barColor = '#EF4444';
            else if (pctUsed > 85) barColor = '#F59E0B';

            return (
              <div
                key={cat.id}
                className="p-3 rounded-2xl bg-surface/90 border border-edge space-y-2 shadow-xs hover:border-saddle/30 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat.color}25`,
                        color: cat.color,
                      }}
                    >
                      <Icon size={14} />
                    </span>
                    <div>
                      <span className="text-xs font-bold text-coffee block truncate max-w-[120px]">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-coffee-muted font-mono">
                        {cat.percentage}% of budget
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-bold font-mono ${isOver ? 'text-red-400' : 'text-coffee'}`}>
                      {budgetPlan.currency}{spent}
                    </span>
                    <span className="text-[10px] text-coffee-muted block font-mono">
                      of {budgetPlan.currency}{cat.allocatedAmount}
                    </span>
                  </div>
                </div>

                {/* Progress Bar with Over-Budget Badge */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-coffee-muted font-medium">{pctUsed}% used</span>
                    {isOver && (
                      <span className="text-[9px] font-black text-red-400 bg-red-500/15 px-1.5 py-0.2 rounded-md">
                        OVER BUDGET
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, pctUsed)}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>

                {/* Interactive Slider */}
                <div className="pt-1 flex items-center gap-2">
                  <input
                    type="range"
                    min="2"
                    max="60"
                    value={cat.percentage}
                    onChange={(e) => handleSliderChange(cat.id, parseInt(e.target.value, 10))}
                    className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <span className="text-[10px] font-mono text-coffee-muted font-bold w-7 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Savings Goals Section */}
      <div className="p-4 rounded-3xl bg-surface/90 border border-edge space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: character.theme.primary }}
            >
              <PiggyBank size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-coffee">Target Savings Goals</h3>
              <p className="text-[10px] text-coffee-muted">Lock funds for laptop, trips, and emergency reserve</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddGoalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-edge bg-surface2 hover:bg-sand/30 text-coffee text-xs font-semibold transition active:scale-95"
          >
            <Plus size={13} />
            <span>New Goal</span>
          </button>
        </div>

        {/* Goals List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {savingsGoals.map((goal) => {
            const goalPct = Math.min(100, Math.round((goal.savedAmount / Math.max(1, goal.targetAmount)) * 100));
            return (
              <div
                key={goal.id}
                className="p-3 rounded-2xl bg-surface2/70 border border-edge space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-coffee">{goal.title}</span>
                  <span className="text-[10px] font-mono text-coffee-muted">
                    Due: {goal.targetDate}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">
                    {budgetPlan.currency}{goal.savedAmount.toLocaleString()}
                  </span>
                  <span className="text-coffee-muted">
                    target: {budgetPlan.currency}{goal.targetAmount.toLocaleString()} ({goalPct}%)
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-emerald-400"
                    style={{ width: `${goalPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Expense History List */}
      <div className="p-4 rounded-3xl bg-surface/90 border border-edge space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-coffee uppercase tracking-wider">
              Expense History
            </h3>
            <p className="text-[10px] text-coffee-muted">
              {filteredExpenses.length} transactions logged
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-2.5 text-coffee-muted" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 rounded-xl border border-edge bg-surface2 text-coffee text-xs focus:outline-hidden"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          {['all', 'Canteen', 'Food and Groceries', 'Travel and Transport', 'Stationery and Books', 'Entertainment', 'Shopping'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold border transition ${
                filterCategory === cat
                  ? 'border-saddle bg-saddle/20 text-coffee font-bold'
                  : 'border-edge bg-surface2/60 text-coffee-muted hover:text-coffee'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Expenses List */}
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredExpenses.map((exp) => {
            const Icon = CATEGORY_ICON_MAP[exp.category] || Wallet;
            return (
              <div
                key={exp.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-surface2/60 border border-edge hover:border-saddle/30 transition text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${character.theme.primary}15`,
                      color: character.theme.primary,
                    }}
                  >
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0">
                    <span className="font-bold text-coffee block truncate text-[11px]">
                      {exp.note || exp.category}
                    </span>
                    <span className="text-[10px] text-coffee-muted flex items-center gap-1.5">
                      <span>{exp.category}</span>
                      <span>•</span>
                      <span>{exp.date} {exp.time}</span>
                      <span>•</span>
                      <span className="font-mono text-saddle">{exp.paymentMethod}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-extrabold text-sm text-coffee">
                    -{budgetPlan.currency}{exp.amount}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="p-1.5 rounded-lg text-coffee-muted hover:text-red-400 transition"
                    title="Delete expense"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredExpenses.length === 0 && (
            <div className="py-8 text-center text-coffee-muted space-y-1">
              <p className="text-xs">No expenses found matching filters.</p>
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="text-xs font-bold text-saddle underline"
              >
                + Log your first expense (+5 XP)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating "+ Add Expense" FAB on mobile */}
      <button
        onClick={() => setIsAddExpenseOpen(true)}
        className="fixed bottom-20 right-4 z-40 p-3.5 rounded-full text-white shadow-xl transition active:scale-95 hover:scale-105 flex items-center gap-1.5"
        style={{
          backgroundColor: character.theme.primary,
          boxShadow: `0 4px 20px ${character.theme.primary}50`,
        }}
      >
        <Plus size={20} strokeWidth={2.5} />
        <span className="text-xs font-extrabold pr-1">Log Expense</span>
      </button>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddExpense={handleAddExpense}
        budgetPlan={budgetPlan}
        currentExpenses={expenses}
      />

      <BudgetSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onPlanCreated={(newPlan) => setBudgetPlan(newPlan)}
        initialPlan={budgetPlan}
      />

      {/* Rebalance Confirmation Dialog */}
      {isRebalanceConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-surface border border-edge rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <RefreshCw size={18} />
              </div>
              <h3 className="font-extrabold text-sm text-coffee">Auto-Rebalance Budget?</h3>
            </div>

            <p className="text-xs text-coffee-muted leading-relaxed">
              Surplus allocations from underspent categories will be shifted to support categories running close to their limits.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setIsRebalanceConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-edge text-coffee text-xs font-bold hover:bg-surface2"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyRebalance}
                className="px-4 py-2 rounded-xl bg-saddle hover:bg-saddle-hover text-white text-xs font-bold shadow-xs"
              >
                Confirm Rebalance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <form
            onSubmit={handleAddGoal}
            className="w-full max-w-sm bg-surface border border-edge rounded-3xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-coffee">New Savings Goal</h3>
              <button
                type="button"
                onClick={() => setIsAddGoalOpen(false)}
                className="p-1 rounded text-coffee-muted hover:text-coffee"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Goal name (e.g. Laptop upgrade)"
                required
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-edge bg-surface2 text-coffee text-xs focus:outline-hidden"
              />
              <input
                type="number"
                placeholder="Target Amount (₹)"
                required
                min="100"
                value={newGoalAmount}
                onChange={(e) => setNewGoalAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-edge bg-surface2 text-coffee text-xs font-mono focus:outline-hidden"
              />
              <input
                type="date"
                value={newGoalDate}
                onChange={(e) => setNewGoalDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-edge bg-surface2 text-coffee text-xs font-mono focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-white text-xs font-bold shadow-xs"
              style={{ backgroundColor: character.theme.primary }}
            >
              Save Goal (+15 XP)
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
