import React, { useState } from 'react';
import { BudgetCategoryAllocation, DetailedExpense } from '../types/budget';

interface BudgetDonutChartProps {
  categories: BudgetCategoryAllocation[];
  expenses: DetailedExpense[];
  spendableAmount: number;
  totalSpent: number;
  currency: string;
}

export const BudgetDonutChart: React.FC<BudgetDonutChartProps> = ({
  categories,
  expenses,
  spendableAmount,
  totalSpent,
  currency,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const radius = 70;
  const strokeWidth = 26;
  const center = 95;
  const circumference = 2 * Math.PI * radius;

  // Compute spend per category
  const categoriesWithSpent = categories.map((cat) => {
    const spent = expenses
      .filter((e) => e.category === cat.name)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      ...cat,
      spentAmount: spent,
    };
  });

  // Calculate slices based on percentage allocation
  let cumulativePercent = 0;
  const slices = categoriesWithSpent.map((cat, idx) => {
    const slicePercent = cat.percentage;
    const strokeDasharray = `${(slicePercent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += slicePercent;

    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
      index: idx,
    };
  });

  const activeCategory = hoveredIndex !== null ? categoriesWithSpent[hoveredIndex] : null;
  const remaining = Math.max(0, spendableAmount - totalSpent);
  const spentPercent = spendableAmount > 0 ? Math.round((totalSpent / spendableAmount) * 100) : 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-4 p-4 rounded-3xl bg-surface/80 border border-edge shadow-sm backdrop-blur-md">
      {/* SVG Donut Graphic */}
      <div className="relative flex items-center justify-center w-[190px] h-[190px] shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 190 190">
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />

          {/* Individual Category Slices */}
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.index;
            return (
              <circle
                key={slice.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-200 cursor-pointer"
                opacity={hoveredIndex === null || isHovered ? 1 : 0.45}
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center Summary Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2 select-none">
          {activeCategory ? (
            <div className="animate-fadeIn">
              <span className="text-[10px] font-semibold text-coffee-muted block truncate max-w-[110px]">
                {activeCategory.name}
              </span>
              <span className="text-sm font-extrabold text-coffee font-mono">
                {currency}{activeCategory.spentAmount}
              </span>
              <span className="text-[10px] text-coffee-muted block">
                of {currency}{activeCategory.allocatedAmount} ({activeCategory.percentage}%)
              </span>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <span className="text-[10px] font-semibold text-coffee-muted uppercase tracking-wider block">
                Remaining
              </span>
              <span className="text-base font-extrabold text-coffee font-mono">
                {currency}{remaining.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 block">
                {spentPercent}% spent
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Legend & Allocation Chips */}
      <div className="flex-1 w-full max-w-xs space-y-1.5">
        <div className="flex items-center justify-between pb-1 border-b border-edge/60">
          <span className="text-[11px] font-bold text-coffee-muted">Category Split</span>
          <span className="text-[11px] font-bold text-coffee-muted">Budget</span>
        </div>

        <div className="max-h-[140px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {categoriesWithSpent.map((cat, idx) => {
            const isHovered = hoveredIndex === idx;
            const pctUsed = cat.allocatedAmount > 0 ? Math.round((cat.spentAmount / cat.allocatedAmount) * 100) : 0;
            return (
              <div
                key={cat.id}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center justify-between p-1.5 rounded-xl text-xs transition cursor-pointer select-none ${
                  isHovered ? 'bg-sand/30 font-semibold' : 'hover:bg-sand/15 text-coffee'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate text-[11px] font-medium">{cat.name}</span>
                </div>
                <div className="text-right shrink-0 font-mono text-[11px]">
                  <span className={pctUsed > 100 ? 'text-red-400 font-bold' : 'text-coffee'}>
                    {currency}{cat.spentAmount}
                  </span>
                  <span className="text-coffee-muted text-[10px]"> / {currency}{cat.allocatedAmount}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
