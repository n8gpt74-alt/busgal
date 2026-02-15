/**
 * P&L (Profit & Loss) Calculator
 * Aggregates income, expenses, and calculates profit
 */

import type { Transaction } from '../ledger/types';

/**
 * P&L summary for a period
 */
export interface PLSummary {
  income: number;
  expense: number;
  profit: number;
  transactionCount: number;
  avgTransaction: number;
  period: string;
  startDate: string;
  endDate: string;
}

/**
 * P&L by category
 */
export interface PLByCategory {
  categoryId: string;
  categoryName: string;
  total: number;
  count: number;
  percentage: number;
}

/**
 * P&L by period (daily/weekly/monthly)
 */
export interface PLByPeriod {
  period: string;
  income: number;
  expense: number;
  profit: number;
}

/**
 * Calculate P&L summary for transactions
 */
export function calculatePLSummary(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): PLSummary {
  const filtered = transactions.filter(tx => {
    const txDate = new Date(tx.occurred_at);
    return txDate >= startDate && txDate <= endDate;
  });
  
  const income = filtered
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const expense = filtered
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const profit = income - expense;
  const transactionCount = filtered.length;
  const avgTransaction = transactionCount > 0 
    ? (income + expense) / transactionCount 
    : 0;
  
  return {
    income,
    expense,
    profit,
    transactionCount,
    avgTransaction,
    period: `${startDate.toLocaleDateString('ru')} - ${endDate.toLocaleDateString('ru')}`,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

/**
 * Calculate P&L by category
 */
export function calculatePLByCategory(
  transactions: Transaction[],
  type: 'income' | 'expense'
): PLByCategory[] {
  const filtered = transactions.filter(tx => tx.type === type);
  
  const byCategory = new Map<string, { name: string; total: number; count: number }>();
  
  for (const tx of filtered) {
    const catId = tx.category_id || 'uncategorized';
    const catName = tx.category?.name || 'Без категории';
    
    const existing = byCategory.get(catId) || { name: catName, total: 0, count: 0 };
    existing.total += tx.amount;
    existing.count += 1;
    
    byCategory.set(catId, existing);
  }
  
  const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);
  
  return Array.from(byCategory.entries()).map(([id, data]) => ({
    categoryId: id,
    categoryName: data.name,
    total: data.total,
    count: data.count,
    percentage: total > 0 ? (data.total / total) * 100 : 0,
  })).sort((a, b) => b.total - a.total);
}

/**
 * Calculate P&L by period (daily)
 */
export function calculateDailyPL(transactions: Transaction[]): PLByPeriod[] {
  const byDate = new Map<string, { income: number; expense: number }>();
  
  for (const tx of transactions) {
    const date = new Date(tx.occurred_at).toISOString().split('T')[0];
    const existing = byDate.get(date) || { income: 0, expense: 0 };
    
    if (tx.type === 'income') {
      existing.income += tx.amount;
    } else {
      existing.expense += tx.amount;
    }
    
    byDate.set(date, existing);
  }
  
  return Array.from(byDate.entries())
    .map(([date, data]) => ({
      period: date,
      income: data.income,
      expense: data.expense,
      profit: data.income - data.expense,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Calculate P&L by period (monthly)
 */
export function calculateMonthlyPL(transactions: Transaction[]): PLByPeriod[] {
  const byMonth = new Map<string, { income: number; expense: number }>();
  
  for (const tx of transactions) {
    const date = new Date(tx.occurred_at);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const existing = byMonth.get(month) || { income: 0, expense: 0 };
    
    if (tx.type === 'income') {
      existing.income += tx.amount;
    } else {
      existing.expense += tx.amount;
    }
    
    byMonth.set(month, existing);
  }
  
  return Array.from(byMonth.entries())
    .map(([month, data]) => ({
      period: month,
      income: data.income,
      expense: data.expense,
      profit: data.income - data.expense,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Get current month P&L
 */
export function getCurrentMonthPL(transactions: Transaction[]): PLSummary {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  return calculatePLSummary(transactions, startOfMonth, endOfMonth);
}

/**
 * Get current quarter P&L
 */
export function getCurrentQuarterPL(transactions: Transaction[]): PLSummary {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
  const endOfQuarter = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59);
  
  return calculatePLSummary(transactions, startOfQuarter, endOfQuarter);
}

/**
 * Get current year P&L
 */
export function getCurrentYearPL(transactions: Transaction[]): PLSummary {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  
  return calculatePLSummary(transactions, startOfYear, endOfYear);
}

/**
 * Compare periods
 */
export function comparePeriods(
  current: PLSummary,
  previous: PLSummary
): {
  incomeChange: number;
  expenseChange: number;
  profitChange: number;
  incomePercent: number;
  expensePercent: number;
  profitPercent: number;
} {
  const incomeChange = current.income - previous.income;
  const expenseChange = current.expense - previous.expense;
  const profitChange = current.profit - previous.profit;
  
  return {
    incomeChange,
    expenseChange,
    profitChange,
    incomePercent: previous.income > 0 
      ? (incomeChange / previous.income) * 100 
      : 0,
    expensePercent: previous.expense > 0 
      ? (expenseChange / previous.expense) * 100 
      : 0,
    profitPercent: previous.profit > 0 
      ? (profitChange / previous.profit) * 100 
      : 0,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
