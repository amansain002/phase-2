import React from 'react';
import { Wallet, Plus, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { BudgetPlan, DetailedExpense } from '../types/budget';
import { computeBudgetMetrics } from '../lib/budgetService';
import { useTheme } from '../context/ThemeProvider';

interface HomeBudgetCardProps {
  plan: BudgetPlan;
  expenses: DetailedExpense[];
  onOpenBudgetTab: () => void;
  onOpenAddExpense: () => void;
}

export const HomeBudgetCard: React.FC<HomeBudgetCardProps> = ({
  plan,
  expenses,
  onOpenBudgetTab,
  onOpenAddExpense,
}) => {
  const { character } = useTheme();
  const metrics = computeBudgetMetrics(plan, expenses);

  const spentPct = metrics.spendableAmount > 0
    ? Math.min(100, Math.round((metrics.totalSpent / metrics.spendableAmount) * 100))
    : 0;

  let progressColor = '#22C55E'; // green
  if (spentPct > 90) progressColor = '#EF4444'; // red
  else if (spentPct > 70) progressColor = '#F59E0B'; // yellow

  return (
    <div
      onClick={onOpenBudgetTab}
      className="p-4 rounded-3xl border border-edge bg-surface/90 hover:border-saddle/40 transition cursor-pointer shadow-xs space-y-3 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: character.theme.primary }}
          >
            <Wallet size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-coffee flex items-center gap-1.5">
              <span>Real-Time Budget</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Live
              </span>
            </h3>
            <p className="text-[10px] text-coffee-muted">
              {metrics.daysLeft} days left in month
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenAddExpense();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-white text-[11px] font-bold shadow-xs transition active:scale-95"
          style={{ backgroundColor: character.theme.primary }}
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>Expense</span>
        </button>
      </div>

      {/* 2-Column Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-2xl bg-surface2 border border-edge/60">
          <span className="text-[10px] font-medium text-coffee-muted block">Month Left</span>
          <span className="text-sm font-extrabold text-coffee font-mono">
            {plan.currency}{metrics.remainingSpendable.toLocaleString()}
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-surface2 border border-edge/60">
          <span className="text-[10px] font-medium text-coffee-muted block">Today's Limit</span>
          <span
            className={`text-sm font-extrabold font-mono ${
              metrics.dailySpendingLimit > 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {plan.currency}{metrics.dailySpendingLimit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Progress Bar & Footer */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-coffee-muted font-medium">
            Spent: {plan.currency}{metrics.totalSpent.toLocaleString()} ({spentPct}%)
          </span>
          <span
            className="font-bold capitalize"
            style={{ color: metrics.paceStatus === 'behind' ? '#EF4444' : '#22C55E' }}
          >
            {metrics.paceStatus.replace('_', ' ')}
          </span>
        </div>

        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${spentPct}%`,
              backgroundColor: progressColor,
            }}
          />
        </div>
      </div>
    </div>
  );
};
