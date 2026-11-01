import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { DetailedExpense, BudgetCategoryAllocation } from '../types/budget';
import { CATEGORY_ICON_MAP } from '../data/budgetConfig';
import { useTheme } from '../context/ThemeProvider';

interface TinyAddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number, category: string) => void;
  categories: BudgetCategoryAllocation[];
  currency: string;
}

export const TinyAddExpenseModal: React.FC<TinyAddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  currency,
}) => {
  const { character } = useTheme();

  const [amount, setAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0]?.name || 'Canteen'
  );

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;
    onSave(numAmount, selectedCategory);
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-sm bg-surface border border-edge rounded-3xl shadow-2xl p-5 space-y-4 select-none transition-colors duration-500"
        style={{ borderColor: `${character.theme.primary}50` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: character.theme.primary }}
            >
              <Plus size={18} strokeWidth={2.5} />
            </div>
            <h3 className="font-extrabold text-sm text-coffee">Add Expense</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-coffee-muted hover:text-coffee hover:bg-surface2 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Large Amount Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-coffee-muted">Amount</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-2xl font-black font-mono text-coffee-muted">
                {currency}
              </span>
              <input
                type="number"
                min="1"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-edge bg-surface2 text-coffee text-2xl font-black font-mono focus:outline-hidden focus:border-coffee transition"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex gap-1.5 pt-1">
              {['20', '50', '100', '200', '500'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setAmount(chip)}
                  className={`flex-1 py-1 rounded-xl border text-[11px] font-mono font-bold transition active:scale-95 ${
                    amount === chip
                      ? 'border-saddle bg-saddle/20 text-coffee'
                      : 'border-edge bg-surface2 text-coffee-muted hover:text-coffee'
                  }`}
                >
                  {currency}{chip}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Category (Tap an Icon) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-coffee-muted">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICON_MAP[cat.name] || Sparkles;
                const isSelected = selectedCategory === cat.name;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition active:scale-95 ${
                      isSelected
                        ? 'border-saddle bg-saddle/20 text-coffee font-bold shadow-xs'
                        : 'border-edge bg-surface2 text-coffee-muted hover:text-coffee hover:bg-sand/20'
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 transition-transform"
                      style={{
                        backgroundColor: isSelected ? `${cat.color}35` : `${cat.color}15`,
                        color: cat.color,
                      }}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="text-[10px] truncate max-w-full font-medium">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Big Save Button */}
          <button
            type="submit"
            disabled={numAmount <= 0}
            className="w-full py-3.5 rounded-2xl text-white font-black text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ backgroundColor: character.theme.primary }}
          >
            <span>Save Expense</span>
          </button>
        </form>
      </div>
    </div>
  );
};
