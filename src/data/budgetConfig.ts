import {
  Utensils,
  ShoppingBag,
  Bus,
  BookOpen,
  Film,
  Sparkles,
  Smartphone,
  HeartPulse,
  ShieldAlert,
  PiggyBank,
  MoreHorizontal,
  LucideIcon,
} from 'lucide-react';
import { QuickAddPreset } from '../types/budget';

export interface CategoryTemplate {
  name: string;
  defaultPercentage: number;
  color: string;
  iconName: string;
}

// 6 Simple Default Categories matching prompt
export const SIMPLE_BUDGET_CATEGORIES: CategoryTemplate[] = [
  { name: 'Canteen', defaultPercentage: 20, color: '#F97316', iconName: 'Utensils' },
  { name: 'Food and Groceries', defaultPercentage: 25, color: '#10B981', iconName: 'ShoppingBag' },
  { name: 'Travel', defaultPercentage: 10, color: '#0EA5E9', iconName: 'Bus' },
  { name: 'Entertainment', defaultPercentage: 10, color: '#EC4899', iconName: 'Film' },
  { name: 'Other expenses', defaultPercentage: 15, color: '#8B5CF6', iconName: 'MoreHorizontal' },
  { name: 'Savings', defaultPercentage: 20, color: '#22C55E', iconName: 'PiggyBank' },
];

export const DEFAULT_STUDENT_CATEGORIES = SIMPLE_BUDGET_CATEGORIES;

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  'Canteen': Utensils,
  'Food and Groceries': ShoppingBag,
  'Travel': Bus,
  'Entertainment': Film,
  'Other expenses': MoreHorizontal,
  'Savings': PiggyBank,
  // Fallbacks
  'Stationery and Books': BookOpen,
  'Shopping': Sparkles,
  'Subscriptions': Smartphone,
  'Health and Gym': HeartPulse,
  'Emergency Fund': ShieldAlert,
  'Other': MoreHorizontal,
};

export const CATEGORY_COLOR_MAP: Record<string, string> = {
  'Canteen': '#F97316',
  'Food and Groceries': '#10B981',
  'Travel': '#0EA5E9',
  'Entertainment': '#EC4899',
  'Other expenses': '#8B5CF6',
  'Savings': '#22C55E',
  'Stationery and Books': '#F59E0B',
  'Shopping': '#EC4899',
  'Subscriptions': '#6366F1',
  'Health and Gym': '#14B8A6',
  'Emergency Fund': '#EF4444',
  'Other': '#64748B',
};

export const QUICK_ADD_PRESETS: QuickAddPreset[] = [
  { id: 'canteen-meal', label: 'Canteen meal', defaultPrice: 60, category: 'Canteen' },
  { id: 'chai-coffee', label: 'Tea or coffee', defaultPrice: 20, category: 'Canteen' },
  { id: 'bus-fare', label: 'Bus fare', defaultPrice: 25, category: 'Travel' },
  { id: 'other-misc', label: 'Snack / Misc', defaultPrice: 40, category: 'Other expenses' },
];

export const BUDGET_XP_REWARDS = {
  LOG_EXPENSE: 5,
  MAX_DAILY_EXPENSE_CLAIMS: 3,
  UNDER_DAILY_LIMIT: 20,
};
