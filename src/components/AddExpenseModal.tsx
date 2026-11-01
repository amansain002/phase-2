import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Calendar,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  Sparkles,
  Edit2,
  Check,
} from 'lucide-react';
import {
  DetailedExpense,
  PaymentMethod,
  QuickAddPreset,
  BudgetPlan,
} from '../types/budget';
import {
  CATEGORY_ICON_MAP,
  CATEGORY_COLOR_MAP,
} from '../data/budgetConfig';
import {
  loadStoredQuickPresets,
  saveStoredQuickPresets,
  computeBudgetMetrics,
} from '../lib/budgetService';
import { useTheme } from '../context/ThemeProvider';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<DetailedExpense, 'id' | 'createdAt'>) => void;
  budgetPlan: BudgetPlan;
  currentExpenses: DetailedExpense[];
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  budgetPlan,
  currentExpenses,
}) => {
  const { character } = useTheme();

  const [amount, setAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    budgetPlan.categories[0]?.name || 'Canteen'
  );
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  // Quick Add Presets
  const [presets, setPresets] = useState<QuickAddPreset[]>(loadStoredQuickPresets);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [presetNewPrice, setPresetNewPrice] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const numericAmount = parseFloat(amount) || 0;
  const metrics = computeBudgetMetrics(budgetPlan, currentExpenses);
  const projectedRemaining = Math.max(0, metrics.remainingSpendable - numericAmount);
  const projectedDailyLeft = Math.max(0, metrics.dailySpendingLimit - numericAmount);

  const handleApplyPreset = (preset: QuickAddPreset) => {
    setAmount(preset.defaultPrice.toString());
    setSelectedCategory(preset.category);
    setNote(preset.label);
  };

  const handleSavePresetPrice = (presetId: string) => {
    const val = parseInt(presetNewPrice, 10);
    if (val && val > 0) {
      const updated = presets.map((p) => (p.id === presetId ? { ...p, defaultPrice: val } : p));
      setPresets(updated);
      saveStoredQuickPresets(updated);
    }
    setEditingPresetId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) return;

    onAddExpense({
      amount: numericAmount,
      category: selectedCategory,
      note: note.trim() || selectedCategory,
      date,
      time,
      paymentMethod,
    });

    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-md bg-surface border border-edge rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ borderColor: `${character.theme.primary}40` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-edge bg-surface2/60">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: character.theme.primary }}
            >
              <Plus size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-coffee">Log Expense</h3>
              <p className="text-[11px] text-coffee-muted">Real-time budget & daily limit sync</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-coffee-muted hover:text-coffee hover:bg-surface2 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* Quick-Add Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-coffee-muted uppercase tracking-wider block">
              Quick Chips (Tap to auto-fill)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => (
                <div key={preset.id} className="relative group">
                  {editingPresetId === preset.id ? (
                    <div className="flex items-center gap-1 p-1 bg-surface2 rounded-xl border border-edge">
                      <input
                        type="number"
                        value={presetNewPrice}
                        onChange={(e) => setPresetNewPrice(e.target.value)}
                        className="w-14 bg-surface px-1.5 py-0.5 rounded text-xs text-coffee font-mono focus:outline-hidden"
                        placeholder="₹"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSavePresetPrice(preset.id)}
                        className="p-1 rounded bg-emerald-500 text-white"
                      >
                        <Check size={11} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-2.5 py-1 rounded-xl border border-edge bg-surface2/80 hover:bg-sand/30 text-[11px] font-semibold text-coffee transition active:scale-95 flex items-center gap-1.5"
                      >
                        <span>{preset.label}</span>
                        <span className="font-mono text-saddle font-bold">
                          {budgetPlan.currency}{preset.defaultPrice}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPresetId(preset.id);
                          setPresetNewPrice(preset.defaultPrice.toString());
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-coffee-muted hover:text-coffee transition ml-0.5"
                        title="Edit preset price"
                      >
                        <Edit2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Large Amount Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-coffee-muted">Expense Amount</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xl font-bold text-coffee-muted font-mono">
                {budgetPlan.currency}
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-edge bg-surface2 text-coffee text-2xl font-bold font-mono focus:outline-hidden transition focus:border-coffee"
              />
            </div>
          </div>

          {/* Category Selector Grid */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-coffee-muted">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
              {budgetPlan.categories.map((cat) => {
                const IconComponent = CATEGORY_ICON_MAP[cat.name] || Sparkles;
                const isSelected = selectedCategory === cat.name;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition active:scale-95 ${
                      isSelected
                        ? 'border-saddle bg-saddle/15 text-coffee font-bold shadow-xs'
                        : 'border-edge bg-surface2/60 text-coffee hover:bg-sand/20'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat.color}25`,
                        color: cat.color,
                      }}
                    >
                      <IconComponent size={13} />
                    </span>
                    <span className="truncate text-[11px]">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-coffee-muted">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'UPI' as PaymentMethod, label: 'UPI / QR', icon: Smartphone },
                { id: 'Cash' as PaymentMethod, label: 'Cash', icon: Banknote },
                { id: 'Card' as PaymentMethod, label: 'Card', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs transition ${
                      isSelected
                        ? 'border-saddle bg-saddle/20 text-coffee font-bold'
                        : 'border-edge bg-surface2 text-coffee-muted hover:text-coffee'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-coffee-muted">Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Chai with friends, metro recharge"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-edge bg-surface2 text-coffee text-xs focus:outline-hidden focus:border-coffee transition"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-coffee-muted flex items-center gap-1">
                <Calendar size={11} /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-edge bg-surface2 text-coffee text-xs font-mono focus:outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-coffee-muted flex items-center gap-1">
                <Clock size={11} /> Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-edge bg-surface2 text-coffee text-xs font-mono focus:outline-hidden"
              />
            </div>
          </div>

          {/* Live Impact Preview Card */}
          {numericAmount > 0 && (
            <div className="p-3 rounded-2xl bg-surface2/90 border border-edge/80 space-y-1 text-xs animate-fadeIn">
              <div className="flex items-center justify-between text-coffee-muted">
                <span>Remaining Month Budget:</span>
                <span className="font-mono font-bold text-coffee">
                  {budgetPlan.currency}{projectedRemaining.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-coffee-muted">
                <span>Today's Limit Left:</span>
                <span
                  className={`font-mono font-bold ${
                    projectedDailyLeft > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {budgetPlan.currency}{projectedDailyLeft}
                </span>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={numericAmount <= 0}
              className="w-full py-3 rounded-2xl text-white font-extrabold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: character.theme.primary }}
            >
              <span>Confirm & Log</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/20">
                +5 XP
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
