import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Wallet,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  Zap,
} from 'lucide-react';
import {
  BudgetCurrency,
  BudgetStyle,
  IncomeSource,
  FixedExpense,
  BudgetPlan,
} from '../types/budget';
import {
  DEFAULT_STUDENT_CATEGORIES,
} from '../data/budgetConfig';
import { createBudgetPlan } from '../lib/budgetService';
import { useTheme } from '../context/ThemeProvider';

interface BudgetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (plan: BudgetPlan) => void;
  initialPlan?: BudgetPlan;
}

export const BudgetSetupModal: React.FC<BudgetSetupModalProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
  initialPlan,
}) => {
  const { character } = useTheme();

  const [step, setStep] = useState<number>(1);

  // Form states
  const [totalIncome, setTotalIncome] = useState<string>(
    initialPlan?.totalIncome ? initialPlan.totalIncome.toString() : '5000'
  );
  const [currency, setCurrency] = useState<BudgetCurrency>(
    initialPlan?.currency || '₹'
  );
  const [incomeSource, setIncomeSource] = useState<IncomeSource>(
    initialPlan?.incomeSource || 'Pocket money'
  );
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(
    initialPlan?.fixedExpenses && initialPlan.fixedExpenses.length > 0
      ? initialPlan.fixedExpenses
      : [
          { id: 'fx-recharge', name: 'Phone Recharge', amount: 299 },
          { id: 'fx-subs', name: 'Subscriptions', amount: 149 },
        ]
  );
  const [newFixedName, setNewFixedName] = useState('');
  const [newFixedAmount, setNewFixedAmount] = useState('');

  const [budgetStyle, setBudgetStyle] = useState<BudgetStyle>(
    initialPlan?.style || 'smart'
  );

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialPlan?.categories
      ? initialPlan.categories.map((c: any) => c.name)
      : DEFAULT_STUDENT_CATEGORIES.map((c: any) => c.name)
  );
  const [customCategoryName, setCustomCategoryName] = useState('');

  if (!isOpen) return null;

  const numericIncome = parseFloat(totalIncome) || 0;
  const totalFixed = fixedExpenses.reduce((sum, f) => sum + Number(f.amount), 0);
  const spendable = Math.max(0, numericIncome - totalFixed);

  const handleAddFixed = () => {
    const amt = parseFloat(newFixedAmount);
    if (newFixedName.trim() && amt > 0) {
      setFixedExpenses([
        ...fixedExpenses,
        { id: `fx-${Date.now()}`, name: newFixedName.trim(), amount: amt },
      ]);
      setNewFixedName('');
      setNewFixedAmount('');
    }
  };

  const handleRemoveFixed = (id: string) => {
    setFixedExpenses(fixedExpenses.filter((f) => f.id !== id));
  };

  const toggleCategory = (catName: string) => {
    if (selectedCategories.includes(catName)) {
      if (selectedCategories.length <= 3) return; // Keep at least 3 categories
      setSelectedCategories(selectedCategories.filter((c) => c !== catName));
    } else {
      setSelectedCategories([...selectedCategories, catName]);
    }
  };

  const handleAddCustomCategory = () => {
    if (customCategoryName.trim() && !selectedCategories.includes(customCategoryName.trim())) {
      setSelectedCategories([...selectedCategories, customCategoryName.trim()]);
      setCustomCategoryName('');
    }
  };

  const handleFinishSetup = () => {
    const plan = createBudgetPlan(
      numericIncome,
      currency,
      incomeSource,
      fixedExpenses,
      budgetStyle,
      selectedCategories
    );
    onPlanCreated(plan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg bg-surface border border-edge rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{ borderColor: `${character.theme.primary}40` }}
      >
        {/* Step Progress Bar & Header */}
        <div className="p-4 border-b border-edge bg-surface2/60">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold text-coffee-muted uppercase tracking-wider">
              Budget Setup • Step {step} of 5
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-coffee-muted hover:text-coffee transition"
            >
              <X size={16} />
            </button>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(step / 5) * 100}%`,
                backgroundColor: character.theme.primary,
              }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
          {/* STEP 1: Total Money & Currency */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-extrabold text-base text-coffee">
                  How much money do you have for this month?
                </h3>
                <p className="text-xs text-coffee-muted mt-1">
                  Enter your expected allowance, pocket money, or monthly income.
                </p>
              </div>

              {/* Currency Selector */}
              <div className="flex items-center gap-2">
                {(['₹', '$', '€', '£'] as BudgetCurrency[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`w-10 h-10 rounded-xl font-bold font-mono text-sm border transition ${
                      currency === c
                        ? 'border-saddle bg-saddle/20 text-coffee shadow-xs'
                        : 'border-edge bg-surface2 text-coffee-muted hover:text-coffee'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Amount Input */}
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-2xl font-bold font-mono text-coffee-muted">
                  {currency}
                </span>
                <input
                  type="number"
                  min="500"
                  step="100"
                  value={totalIncome}
                  onChange={(e) => setTotalIncome(e.target.value)}
                  placeholder="5000"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-edge bg-surface2 text-coffee text-3xl font-black font-mono focus:outline-hidden focus:border-coffee transition"
                />
              </div>

              {/* Quick Chips */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-coffee-muted block">
                  Quick Select
                </span>
                <div className="flex flex-wrap gap-2">
                  {['3000', '5000', '8000', '10000', '15000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTotalIncome(amt)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition active:scale-95 ${
                        totalIncome === amt
                          ? 'border-saddle bg-saddle/20 text-coffee'
                          : 'border-edge bg-surface2 text-coffee-muted hover:text-coffee'
                      }`}
                    >
                      {currency}{parseInt(amt).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Income Source */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-extrabold text-base text-coffee">
                  What is your primary income source?
                </h3>
                <p className="text-xs text-coffee-muted mt-1">
                  Optional context used to tune savings safety ratios.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(
                  [
                    'Pocket money',
                    'Salary',
                    'Scholarship',
                    'Part-time',
                    'Other',
                  ] as IncomeSource[]
                ).map((src) => {
                  const isSelected = incomeSource === src;
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setIncomeSource(src)}
                      className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition flex items-center justify-between ${
                        isSelected
                          ? 'border-saddle bg-saddle/20 text-coffee shadow-xs'
                          : 'border-edge bg-surface2 text-coffee hover:bg-sand/20'
                      }`}
                    >
                      <span>{src}</span>
                      {isSelected && <Check size={16} className="text-saddle" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Fixed Expenses */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-extrabold text-base text-coffee">
                  Fixed expenses first (Subtracted before split)
                </h3>
                <p className="text-xs text-coffee-muted mt-1">
                  Hostel/rent, mobile recharge, subscriptions, or fees that must be paid.
                </p>
              </div>

              {/* Fixed Expenses List */}
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {fixedExpenses.map((fx) => (
                  <div
                    key={fx.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-edge bg-surface2 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-coffee">{fx.name}</span>
                      <span className="font-mono text-saddle font-bold block text-[11px]">
                        {currency}{fx.amount}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFixed(fx.id)}
                      className="p-1 rounded text-red-400 hover:text-red-300 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                {fixedExpenses.length === 0 && (
                  <p className="text-xs text-coffee-muted italic text-center py-2">
                    No fixed expenses added. All {currency}{numericIncome} will be spendable!
                  </p>
                )}
              </div>

              {/* Add New Fixed Expense Row */}
              <div className="flex gap-2 items-center pt-2">
                <input
                  type="text"
                  placeholder="e.g. Hostel Rent"
                  value={newFixedName}
                  onChange={(e) => setNewFixedName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-edge bg-surface2 text-xs text-coffee focus:outline-hidden"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newFixedAmount}
                  onChange={(e) => setNewFixedAmount(e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl border border-edge bg-surface2 text-xs text-coffee font-mono focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddFixed}
                  className="p-2 rounded-xl bg-saddle hover:bg-saddle-hover text-white transition shrink-0"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Spendable Summary */}
              <div className="p-3 rounded-2xl bg-surface2 border border-edge flex items-center justify-between text-xs">
                <span className="text-coffee-muted">Spendable After Fixed Costs:</span>
                <span className="font-mono font-bold text-coffee text-sm">
                  {currency}{spendable.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: Choose Budget Style */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-extrabold text-base text-coffee">
                  Choose your budget split style
                </h3>
                <p className="text-xs text-coffee-muted mt-1">
                  How aggressive do you want your savings and spending limits to be?
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'smart' as BudgetStyle,
                    title: 'Smart Split (AI Recommended)',
                    desc: 'Balanced for students & campus living: Canteen 15%, Groceries 20%, Savings 10%, Emergency 7%.',
                    badge: 'Recommended',
                  },
                  {
                    id: 'saver' as BudgetStyle,
                    title: 'Student Saver',
                    desc: 'Higher financial safety: 22% Savings + 10% Emergency Fund. Minimizes impulse shopping.',
                    badge: 'High Discipline',
                  },
                  {
                    id: 'balanced' as BudgetStyle,
                    title: 'Balanced (50 / 30 / 20)',
                    desc: 'Standard economic formula adapted for food, rent, fun, and emergency.',
                    badge: 'Classic',
                  },
                  {
                    id: 'custom' as BudgetStyle,
                    title: 'Custom Split',
                    desc: 'Customize percentages for every category manually.',
                    badge: 'Full Control',
                  },
                ].map((s) => {
                  const isSelected = budgetStyle === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setBudgetStyle(s.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition ${
                        isSelected
                          ? 'border-saddle bg-saddle/15 shadow-sm'
                          : 'border-edge bg-surface2/80 hover:bg-sand/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-coffee">{s.title}</span>
                        <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border border-saddle/40 bg-saddle/20 text-saddle">
                          {s.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-coffee-muted mt-1">{s.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Categories Selection */}
          {step === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-extrabold text-base text-coffee">
                  Which categories do you spend on?
                </h3>
                <p className="text-xs text-coffee-muted mt-1">
                  Select at least 3 categories. Defaults are pre-selected for student life.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
                {DEFAULT_STUDENT_CATEGORIES.map((cat: any) => {
                  const isChecked = selectedCategories.includes(cat.name);
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 ${
                        isChecked
                          ? 'border-saddle bg-saddle/20 text-coffee shadow-xs'
                          : 'border-edge bg-surface2/60 text-coffee-muted hover:text-coffee'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span>{cat.name}</span>
                      {isChecked && <Check size={12} className="text-saddle" />}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Category */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="+ Add your own category"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-edge bg-surface2 text-xs text-coffee focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCategory}
                  className="px-3 py-2 rounded-xl bg-saddle text-white text-xs font-bold transition hover:bg-saddle-hover shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 border-t border-edge bg-surface2/60 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl border border-edge text-coffee text-xs font-bold hover:bg-sand/20 transition flex items-center gap-1"
            >
              <ChevronLeft size={15} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={numericIncome <= 0}
              className="px-5 py-2.5 rounded-xl text-white text-xs font-extrabold shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              style={{ backgroundColor: character.theme.primary }}
            >
              <span>Continue</span> <ChevronRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishSetup}
              className="px-6 py-2.5 rounded-xl text-white text-xs font-extrabold shadow-md transition flex items-center gap-1.5 active:scale-95"
              style={{ backgroundColor: character.theme.primary }}
            >
              <Zap size={15} />
              <span>Generate Monthly Budget</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
