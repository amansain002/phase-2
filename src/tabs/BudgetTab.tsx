import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Sliders,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  X,
  TrendingDown,
  PiggyBank,
} from 'lucide-react';
import {
  BudgetPlan,
  DetailedExpense,
  BudgetCategoryAllocation,
} from '../types/budget';
import {
  loadStoredBudgetPlan,
  saveStoredBudgetPlan,
  loadStoredDetailedExpenses,
  saveStoredDetailedExpenses,
  computeBudgetMetrics,
  createSimpleBudget,
  rebalanceCategories,
  getCoachFeedbackAfterExpense,
  canClaimExpenseXP,
  recordExpenseXPClaim,
  canClaimDailyLimitXP,
  recordDailyLimitXPClaim,
  checkAndHandleMonthlyReset,
  MonthEndSummary,
} from '../lib/budgetService';
import {
  CATEGORY_ICON_MAP,
  BUDGET_XP_REWARDS,
} from '../data/budgetConfig';
import { useTheme } from '../context/ThemeProvider';
import { useApp } from '../context/AppContext';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { BudgetDonutChart } from '../components/BudgetDonutChart';
import { TinyAddExpenseModal } from '../components/TinyAddExpenseModal';

type BudgetScreen = 'enter_amount' | 'review_budget' | 'track_spending';

export const BudgetTab: React.FC = () => {
  const { character } = useTheme();
  const { addXp } = useApp();

  // Load persistence
  const [budgetPlan, setBudgetPlan] = useState<BudgetPlan>(loadStoredBudgetPlan);
  const [expenses, setExpenses] = useState<DetailedExpense[]>(loadStoredDetailedExpenses);

  // Check if user has already made a budget
  const [hasSavedBudget, setHasSavedBudget] = useState<boolean>(() => {
    try {
      return localStorage.getItem('uplevel_budget_saved_active') === 'true';
    } catch {
      return false;
    }
  });

  // Current Screen
  const [currentScreen, setCurrentScreen] = useState<BudgetScreen>(() => {
    return hasSavedBudget ? 'track_spending' : 'enter_amount';
  });

  // Screen 1: Input Amount
  const [inputAmount, setInputAmount] = useState<string>(
    budgetPlan.totalIncome ? budgetPlan.totalIncome.toString() : '5000'
  );

  // Screen 3: Tiny Add Modal
  const [isTinyAddOpen, setIsTinyAddOpen] = useState<boolean>(false);

  // AI Coach Feedback Message
  const [coachMessage, setCoachMessage] = useState<string>(
    `${character.name} says: "Welcome! Keep your daily limits safe and build a massive savings streak!"`
  );

  // Monthly Reset Summary State
  const [monthEndSummary, setMonthEndSummary] = useState<MonthEndSummary | null>(null);

  // Tip Dismissal State
  const [showTip, setShowTip] = useState<boolean>(() => {
    try {
      return localStorage.getItem('uplevel_budget_tip_dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  // Check monthly reset on mount
  useEffect(() => {
    const summary = checkAndHandleMonthlyReset();
    if (summary) {
      setMonthEndSummary(summary);
      setBudgetPlan(loadStoredBudgetPlan());
      setExpenses(loadStoredDetailedExpenses());
    }
  }, []);

  // Save budget plan changes
  useEffect(() => {
    saveStoredBudgetPlan(budgetPlan);
  }, [budgetPlan]);

  // Save expenses changes
  useEffect(() => {
    saveStoredDetailedExpenses(expenses);
  }, [expenses]);

  const metrics = computeBudgetMetrics(budgetPlan, expenses);

  // SCREEN 1 -> SCREEN 2: Generate Budget from 1 Amount
  const handleMakeBudget = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amt = parseFloat(inputAmount) || 5000;
    const newPlan = createSimpleBudget(amt, budgetPlan.currency || '₹');
    setBudgetPlan(newPlan);
    setCurrentScreen('review_budget');
  };

  // SCREEN 2: Category Slider Rebalance
  const handleSliderChange = (catId: string, newPct: number) => {
    const updatedCategories = rebalanceCategories(
      budgetPlan.categories,
      catId,
      newPct,
      budgetPlan.spendableAmount
    );
    setBudgetPlan({
      ...budgetPlan,
      categories: updatedCategories,
      updatedAt: new Date().toISOString(),
    });
  };

  // SCREEN 2: Reset to default split
  const handleResetToDefault = () => {
    const def = createSimpleBudget(budgetPlan.totalIncome, budgetPlan.currency);
    setBudgetPlan(def);
  };

  // SCREEN 2 -> SCREEN 3: Save Budget
  const handleSaveBudget = () => {
    try {
      localStorage.setItem('uplevel_budget_saved_active', 'true');
    } catch {}
    setHasSavedBudget(true);
    setCurrentScreen('track_spending');
    addXp(15, `Budget of ${budgetPlan.currency}${budgetPlan.totalIncome.toLocaleString()} locked and saved!`);
  };

  // SCREEN 3: Add Expense
  const handleSaveExpense = (amount: number, category: string) => {
    const now = new Date();
    const newExp: DetailedExpense = {
      id: `exp-${Date.now()}`,
      amount,
      category,
      note: category,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      paymentMethod: 'UPI',
      createdAt: now.toISOString(),
    };

    const updated = [newExp, ...expenses];
    setExpenses(updated);

    const newMetrics = computeBudgetMetrics(budgetPlan, updated);

    // Dynamic Coach Feedback
    const cat = budgetPlan.categories.find((c) => c.name === category);
    const catSpent = updated
      .filter((e) => e.category === category)
      .reduce((s, e) => s + e.amount, 0);

    const feedback = getCoachFeedbackAfterExpense(
      category,
      catSpent,
      cat?.allocatedAmount || 0,
      newMetrics.todaySpent,
      newMetrics.dailySpendingLimit,
      character.name
    );
    setCoachMessage(feedback);

    // Award +5 XP (max 3 claims per day)
    if (canClaimExpenseXP()) {
      recordExpenseXPClaim();
      addXp(
        BUDGET_XP_REWARDS.LOG_EXPENSE,
        `${category} -${budgetPlan.currency}${amount}. ${budgetPlan.currency}${newMetrics.remainingSpendable.toLocaleString()} left this month. Today's limit: ${budgetPlan.currency}${newMetrics.dailySpendingLimit} left.`
      );
    } else {
      addXp(
        0,
        `${category} -${budgetPlan.currency}${amount}. ${budgetPlan.currency}${newMetrics.remainingSpendable.toLocaleString()} left this month. Today's limit: ${budgetPlan.currency}${newMetrics.dailySpendingLimit} left.`
      );
    }

    // Check if under daily limit for +20 XP bonus
    if (newMetrics.todaySpent <= newMetrics.dailySpendingLimit && canClaimDailyLimitXP()) {
      recordDailyLimitXPClaim();
      setTimeout(() => {
        addXp(BUDGET_XP_REWARDS.UNDER_DAILY_LIMIT, `+20 XP • Stayed under today's spending limit!`);
      }, 900);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleDismissTip = () => {
    setShowTip(false);
    try {
      localStorage.setItem('uplevel_budget_tip_dismissed', 'true');
    } catch {}
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-14 select-none">
      {/* ============================================================== */}
      {/* SCREEN 1: ENTER AMOUNT                                         */}
      {/* ============================================================== */}
      {currentScreen === 'enter_amount' && (
        <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6 text-center animate-fadeIn">
          {/* Header Icon */}
          <div
            className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg"
            style={{ backgroundColor: character.theme.primary }}
          >
            <Wallet size={32} />
          </div>

          {/* One Big Question */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-coffee tracking-tight">
              How much money do you have this month?
            </h2>
            <p className="text-xs text-coffee-muted">
              Type your amount and we will build your entire budget instantly.
            </p>
          </div>

          <form onSubmit={handleMakeBudget} className="space-y-5">
            {/* Large Number Input */}
            <div className="relative flex items-center max-w-xs mx-auto">
              <span className="absolute left-4 text-3xl font-black font-mono text-coffee-muted">
                {budgetPlan.currency}
              </span>
              <input
                type="number"
                min="500"
                step="100"
                required
                autoFocus
                placeholder="5000"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-3xl border border-edge bg-surface2 text-coffee text-4xl font-black font-mono text-center focus:outline-hidden focus:border-coffee transition shadow-sm"
              />
            </div>

            {/* Quick Chips: ₹2,000, ₹5,000, ₹10,000 */}
            <div className="flex justify-center gap-2">
              {['2000', '5000', '10000'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setInputAmount(chip)}
                  className={`px-4 py-2 rounded-2xl border text-xs font-mono font-bold transition active:scale-95 ${
                    inputAmount === chip
                      ? 'border-saddle bg-saddle/20 text-coffee shadow-xs'
                      : 'border-edge bg-surface2 text-coffee-muted hover:text-coffee hover:bg-sand/20'
                  }`}
                >
                  {budgetPlan.currency}{parseInt(chip).toLocaleString()}
                </button>
              ))}
            </div>

            {/* One Big "Make my budget" Button */}
            <div className="pt-3 max-w-xs mx-auto">
              <button
                type="submit"
                className="w-full py-4 rounded-3xl text-white font-black text-base shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
                style={{ backgroundColor: character.theme.primary }}
              >
                <span>Make my budget</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </form>

          {/* Back to track link if already saved */}
          {hasSavedBudget && (
            <button
              onClick={() => setCurrentScreen('track_spending')}
              className="text-xs font-bold text-coffee-muted hover:text-coffee underline transition"
            >
              Cancel & return to current spending tracker
            </button>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SCREEN 2: YOUR BUDGET (INSTANT RESULT)                         */}
      {/* ============================================================== */}
      {currentScreen === 'review_budget' && (
        <div className="space-y-4 max-w-xl mx-auto animate-fadeIn">
          {/* Header & Back Action */}
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-base font-black text-coffee flex items-center gap-2">
                <span>Your Monthly Budget</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Ready
                </span>
              </h2>
              <p className="text-[11px] text-coffee-muted">
                Total Budget: {budgetPlan.currency}{budgetPlan.totalIncome.toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => setCurrentScreen('enter_amount')}
              className="text-xs font-semibold text-coffee-muted hover:text-coffee underline"
            >
              Change Amount
            </button>
          </div>

          {/* Two Key Numbers at Top: Per Week & Per Day */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-3xl bg-surface/90 border border-edge shadow-xs text-center space-y-0.5">
              <span className="text-[11px] font-bold text-coffee-muted uppercase tracking-wider block">
                Per Week You Can Spend
              </span>
              <span className="text-2xl font-black text-coffee font-mono block">
                {budgetPlan.currency}{metrics.weeklyLimit.toLocaleString()}
              </span>
              <span className="text-[10px] text-coffee-muted">7-day spending allowance</span>
            </div>

            <div className="p-4 rounded-3xl bg-surface/90 border border-edge shadow-xs text-center space-y-0.5">
              <span className="text-[11px] font-bold text-coffee-muted uppercase tracking-wider block">
                Per Day You Can Spend
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono block">
                {budgetPlan.currency}{metrics.dailySpendingLimit.toLocaleString()}
              </span>
              <span className="text-[10px] text-coffee-muted">Safe daily target</span>
            </div>
          </div>

          {/* Donut Chart */}
          <BudgetDonutChart
            categories={budgetPlan.categories}
            expenses={expenses}
            spendableAmount={budgetPlan.spendableAmount}
            totalSpent={metrics.totalSpent}
            currency={budgetPlan.currency}
          />

          {/* List of Simple Categories with Sliders */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-coffee uppercase tracking-wider">
                Category Split (Adjust any slider)
              </h3>
              <button
                onClick={handleResetToDefault}
                className="text-xs font-semibold text-saddle hover:underline flex items-center gap-1"
              >
                <RotateCcw size={11} /> Reset to default
              </button>
            </div>

            <div className="space-y-2">
              {budgetPlan.categories.map((cat) => {
                const Icon = CATEGORY_ICON_MAP[cat.name] || Wallet;
                return (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-2xl bg-surface/90 border border-edge space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${cat.color}25`,
                            color: cat.color,
                          }}
                        >
                          <Icon size={16} />
                        </span>
                        <div>
                          <span className="text-xs font-extrabold text-coffee block">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-coffee-muted font-mono font-medium">
                            {cat.percentage}% of monthly budget
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black font-mono text-coffee">
                          {budgetPlan.currency}{cat.allocatedAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Slider */}
                    <div className="flex items-center gap-3 pt-0.5">
                      <input
                        type="range"
                        min="5"
                        max="60"
                        value={cat.percentage}
                        onChange={(e) => handleSliderChange(cat.id, parseInt(e.target.value, 10))}
                        className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                      <span className="text-xs font-mono font-bold text-coffee w-9 text-right">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons: Reset link & Save Budget */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleSaveBudget}
              className="w-full py-4 rounded-3xl text-white font-black text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              style={{ backgroundColor: character.theme.primary }}
            >
              <CheckCircle2 size={18} />
              <span>Save Budget & Start Tracking</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCREEN 3: TRACK SPENDING                                       */}
      {/* ============================================================== */}
      {currentScreen === 'track_spending' && (
        <div className="space-y-4 max-w-xl mx-auto animate-fadeIn">
          {/* Top Status Banner: ₹X left this month, ₹Y left today */}
          <div className="p-4 rounded-3xl bg-surface/90 border border-edge shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-coffee-muted uppercase tracking-wider block">
                  Budget Tracking
                </span>
                <h2 className="text-lg font-black text-coffee flex items-center gap-1.5 mt-0.5">
                  <span>{budgetPlan.currency}{metrics.remainingSpendable.toLocaleString()} left this month</span>
                </h2>
                <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                  {budgetPlan.currency}{metrics.dailySpendingLimit.toLocaleString()} left today ({metrics.daysLeft} days left)
                </p>
              </div>

              <button
                onClick={() => setCurrentScreen('enter_amount')}
                className="px-3 py-1.5 rounded-xl border border-edge bg-surface2 hover:bg-sand/30 text-coffee text-xs font-semibold transition active:scale-95"
              >
                Change Budget
              </button>
            </div>

            {/* AI Coach Reaction Speech Bubble */}
            <div className="p-3 rounded-2xl bg-surface2/80 border border-edge flex items-start gap-2.5">
              <CharacterAvatar character={character} size="sm" />
              <div className="flex-1">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider block"
                  style={{ color: character.theme.primary }}
                >
                  {character.name}'s Feedback
                </span>
                <p className="text-xs text-coffee mt-0.5 leading-snug">
                  {coachMessage}
                </p>
              </div>
            </div>
          </div>

          {/* First-Use Tip */}
          {showTip && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-coffee">
                <Lightbulb size={16} className="text-amber-400 shrink-0" />
                <span>
                  <strong>Tip:</strong> Tap the big floating <strong>"+"</strong> button anytime to log an expense in 3 seconds!
                </span>
              </div>
              <button
                onClick={handleDismissTip}
                className="p-1 rounded text-coffee-muted hover:text-coffee"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Donut Chart */}
          <BudgetDonutChart
            categories={budgetPlan.categories}
            expenses={expenses}
            spendableAmount={budgetPlan.spendableAmount}
            totalSpent={metrics.totalSpent}
            currency={budgetPlan.currency}
          />

          {/* Category Progress Bars (Green safe, Yellow near limit, Red over) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-coffee uppercase tracking-wider">
              Category Progress
            </h3>

            <div className="space-y-2">
              {budgetPlan.categories.map((cat) => {
                const Icon = CATEGORY_ICON_MAP[cat.name] || Wallet;
                const spent = expenses
                  .filter((e) => e.category === cat.name)
                  .reduce((sum, e) => sum + e.amount, 0);

                const pctUsed = cat.allocatedAmount > 0 ? Math.round((spent / cat.allocatedAmount) * 100) : 0;
                const isOver = pctUsed > 100;

                // Color code: green when safe, yellow near limit (70-90%), red when over (>90%)
                let barColor = '#22C55E'; // green safe
                if (pctUsed > 90) barColor = '#EF4444'; // red over
                else if (pctUsed >= 70) barColor = '#F59E0B'; // yellow near limit

                return (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-2xl bg-surface/90 border border-edge space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${cat.color}25`,
                            color: cat.color,
                          }}
                        >
                          <Icon size={16} />
                        </span>
                        <div>
                          <span className="text-xs font-extrabold text-coffee block">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-coffee-muted font-mono font-medium">
                            {pctUsed}% used
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-extrabold font-mono ${isOver ? 'text-red-400' : 'text-coffee'}`}>
                          {budgetPlan.currency}{spent}
                        </span>
                        <span className="text-[10px] text-coffee-muted block font-mono">
                          limit {budgetPlan.currency}{cat.allocatedAmount}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, pctUsed)}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simple List of Recent Expenses with Swipe/Delete */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-coffee uppercase tracking-wider">
              Recent Expenses
            </h3>

            <div className="space-y-1.5">
              {expenses.slice(0, 15).map((exp) => {
                const Icon = CATEGORY_ICON_MAP[exp.category] || Wallet;
                return (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-surface2/70 border border-edge hover:border-saddle/40 transition text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${character.theme.primary}15`,
                          color: character.theme.primary,
                        }}
                      >
                        <Icon size={15} />
                      </span>
                      <div>
                        <span className="font-extrabold text-coffee block text-xs">
                          {exp.category}
                        </span>
                        <span className="text-[10px] text-coffee-muted">
                          {exp.date} • {exp.time}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-coffee">
                        -{budgetPlan.currency}{exp.amount}
                      </span>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 rounded-lg text-coffee-muted hover:text-red-400 transition"
                        title="Delete expense"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Friendly Empty State */}
              {expenses.length === 0 && (
                <div className="p-8 text-center rounded-3xl border border-dashed border-edge/80 space-y-2 bg-surface/50">
                  <p className="text-xs font-bold text-coffee">
                    No expenses yet. Add your first one!
                  </p>
                  <p className="text-[11px] text-coffee-muted">
                    Tap the floating button below to record what you spent.
                  </p>
                  <button
                    onClick={() => setIsTinyAddOpen(true)}
                    className="px-4 py-2 rounded-2xl text-white text-xs font-bold shadow-md transition active:scale-95 mt-1"
                    style={{ backgroundColor: character.theme.primary }}
                  >
                    + Add first expense (+5 XP)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Floating "+" Button */}
          <button
            onClick={() => setIsTinyAddOpen(true)}
            className="fixed bottom-20 right-4 z-40 p-4 rounded-full text-white shadow-2xl transition active:scale-95 hover:scale-105 flex items-center justify-center"
            style={{
              backgroundColor: character.theme.primary,
              boxShadow: `0 6px 24px ${character.theme.primary}60`,
            }}
            title="Add expense"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* Tiny Add Expense Modal (3 things: amount, category, save) */}
      <TinyAddExpenseModal
        isOpen={isTinyAddOpen}
        onClose={() => setIsTinyAddOpen(false)}
        onSave={handleSaveExpense}
        categories={budgetPlan.categories}
        currency={budgetPlan.currency}
      />

      {/* Monthly Reset Summary Dialog */}
      {monthEndSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-surface border border-edge rounded-3xl p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <PiggyBank size={28} />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-base text-coffee">Monthly Reset</h3>
              <p className="text-xs text-coffee-muted">
                Last month ({monthEndSummary.previousMonth}), you saved:
              </p>
              <p className="text-2xl font-black font-mono text-emerald-400">
                {budgetPlan.currency}{monthEndSummary.totalSaved.toLocaleString()}
              </p>
            </div>

            <p className="text-[11px] text-coffee-muted">
              A fresh budget for this month has been initialized with your previous allowance.
            </p>

            <button
              onClick={() => setMonthEndSummary(null)}
              className="w-full py-3 rounded-2xl text-white font-bold text-xs shadow-md transition active:scale-95"
              style={{ backgroundColor: character.theme.primary }}
            >
              Let's Crush This Month!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
