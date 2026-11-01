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
  Coffee,
  LucideIcon,
} from 'lucide-react';
import {
  BudgetStyle,
  QuickAddPreset,
  IncomeSource,
} from '../types/budget';

export interface CategoryTemplate {
  name: string;
  defaultPercentage: number;
  color: string;
  iconName: string;
}

export const DEFAULT_STUDENT_CATEGORIES: CategoryTemplate[] = [
  { name: 'Canteen', defaultPercentage: 15, color: '#F97316', iconName: 'Utensils' },
  { name: 'Food and Groceries', defaultPercentage: 20, color: '#10B981', iconName: 'ShoppingBag' },
  { name: 'Travel and Transport', defaultPercentage: 10, color: '#0EA5E9', iconName: 'Bus' },
  { name: 'Stationery and Books', defaultPercentage: 8, color: '#F59E0B', iconName: 'BookOpen' },
  { name: 'Entertainment', defaultPercentage: 8, color: '#EC4899', iconName: 'Film' },
  { name: 'Shopping', defaultPercentage: 7, color: '#8B5CF6', iconName: 'Sparkles' },
  { name: 'Subscriptions', defaultPercentage: 5, color: '#6366F1', iconName: 'Smartphone' },
  { name: 'Health and Gym', defaultPercentage: 5, color: '#14B8A6', iconName: 'HeartPulse' },
  { name: 'Emergency Fund', defaultPercentage: 7, color: '#EF4444', iconName: 'ShieldAlert' },
  { name: 'Savings', defaultPercentage: 10, color: '#22C55E', iconName: 'PiggyBank' },
  { name: 'Other', defaultPercentage: 5, color: '#64748B', iconName: 'MoreHorizontal' },
];

export const STUDENT_SAVER_SPLIT: Record<string, number> = {
  'Savings': 22,
  'Emergency Fund': 10,
  'Food and Groceries': 18,
  'Canteen': 10,
  'Travel and Transport': 8,
  'Stationery and Books': 8,
  'Health and Gym': 6,
  'Subscriptions': 4,
  'Entertainment': 5,
  'Shopping': 4,
  'Other': 5,
};

export const BALANCED_50_30_20_SPLIT: Record<string, number> = {
  'Food and Groceries': 25,
  'Canteen': 12,
  'Travel and Transport': 13,
  'Savings': 15,
  'Emergency Fund': 5,
  'Entertainment': 8,
  'Shopping': 7,
  'Stationery and Books': 5,
  'Subscriptions': 4,
  'Health and Gym': 3,
  'Other': 3,
};

export const WORKER_SPLIT: Record<string, number> = {
  'Food and Groceries': 22,
  'Savings': 20,
  'Travel and Transport': 12,
  'Emergency Fund': 10,
  'Entertainment': 8,
  'Shopping': 8,
  'Subscriptions': 5,
  'Health and Gym': 5,
  'Canteen': 5,
  'Other': 5,
};

export const ENTREPRENEUR_SPLIT: Record<string, number> = {
  'Savings': 25,
  'Emergency Fund': 15,
  'Food and Groceries': 18,
  'Travel and Transport': 10,
  'Subscriptions': 8,
  'Health and Gym': 6,
  'Stationery and Books': 5,
  'Canteen': 5,
  'Entertainment': 4,
  'Other': 4,
};

export const QUICK_ADD_PRESETS: QuickAddPreset[] = [
  { id: 'canteen-meal', label: 'Canteen meal', defaultPrice: 60, category: 'Canteen' },
  { id: 'chai-coffee', label: 'Tea or coffee', defaultPrice: 20, category: 'Canteen' },
  { id: 'bus-fare', label: 'Bus fare', defaultPrice: 25, category: 'Travel and Transport' },
  { id: 'stationery-pen', label: 'Stationery', defaultPrice: 50, category: 'Stationery and Books' },
  { id: 'gym-shake', label: 'Protein / Snack', defaultPrice: 70, category: 'Health and Gym' },
];

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  'Canteen': Utensils,
  'Food and Groceries': ShoppingBag,
  'Travel and Transport': Bus,
  'Stationery and Books': BookOpen,
  'Entertainment': Film,
  'Shopping': Sparkles,
  'Subscriptions': Smartphone,
  'Health and Gym': HeartPulse,
  'Emergency Fund': ShieldAlert,
  'Savings': PiggyBank,
  'Other': MoreHorizontal,
};

export const CATEGORY_COLOR_MAP: Record<string, string> = {
  'Canteen': '#F97316',
  'Food and Groceries': '#10B981',
  'Travel and Transport': '#0EA5E9',
  'Stationery and Books': '#F59E0B',
  'Entertainment': '#EC4899',
  'Shopping': '#8B5CF6',
  'Subscriptions': '#6366F1',
  'Health and Gym': '#14B8A6',
  'Emergency Fund': '#EF4444',
  'Savings': '#22C55E',
  'Other': '#94A3B8',
};

export const BUDGET_XP_REWARDS = {
  LOG_EXPENSE: 5,
  UNDER_DAILY_LIMIT: 15,
  WEEK_UNDER_BUDGET: 40,
  MONTH_UNDER_BUDGET: 100,
};
