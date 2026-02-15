/**
 * Domain types for SmartAccount
 */

import { TaxMode } from '../tax/constants';

/**
 * Transaction type
 */
export type TransactionType = 'income' | 'expense';

/**
 * Transaction category
 */
export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: TransactionType;
  is_default: boolean;
  color: string;
  icon: string;
  created_at: string;
}

/**
 * Transaction
 */
export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  category_id: string | null;
  category?: Category;
  counterparty?: string;
  description?: string;
  occurred_at: string;
  meta?: Record<string, unknown>;
  created_at: string;
}

/**
 * User profile
 */
export interface Profile {
  id: string;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  tax_mode: TaxMode;
  settings: ProfileSettings;
  is_pro: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Profile settings
 */
export interface ProfileSettings {
  currency?: string;
  region?: string;
  patentCost?: number;
  selfEmployedRate?: 'fiz' | 'jur';
  hasEmployees?: boolean;
  notifications?: boolean;
  onboardingCompleted?: boolean;
}

/**
 * Reminder
 */
export interface Reminder {
  id: string;
  user_id: string;
  kind: 'tax' | 'payment' | 'report' | 'custom';
  title: string;
  description?: string;
  due_at: string;
  status: 'pending' | 'completed' | 'dismissed';
  payload?: Record<string, unknown>;
  created_at: string;
}

/**
 * Chat message
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/**
 * Chat
 */
export interface Chat {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

/**
 * Forecast
 */
export interface Forecast {
  id: string;
  user_id: string;
  horizon_days: number;
  scenario: 'base' | 'optimistic' | 'pessimistic';
  income_series: ForecastPoint[];
  expense_series: ForecastPoint[];
  profit_series: ForecastPoint[];
  bands: ForecastBands;
  quality: number;
  explanation?: string;
  created_at: string;
}

/**
 * Forecast point
 */
export interface ForecastPoint {
  date: string;
  income: number;
  expense: number;
  profit: number;
}

/**
 * Forecast bands
 */
export interface ForecastBands {
  upper: ForecastPoint[];
  lower: ForecastPoint[];
}

/**
 * Period filter for queries
 */
export type PeriodFilter = 
  | { type: 'today' }
  | { type: 'week' }
  | { type: 'month' }
  | { type: 'quarter' }
  | { type: 'year' }
  | { type: 'custom'; from: string; to: string };

/**
 * Transaction create input
 */
export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  currency?: string;
  category_id?: string;
  counterparty?: string;
  description?: string;
  occurred_at?: string;
  meta?: Record<string, unknown>;
}

/**
 * Transaction update input
 */
export interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: number;
  category_id?: string;
  counterparty?: string;
  description?: string;
  occurred_at?: string;
}

/**
 * Profile update input
 */
export interface UpdateProfileInput {
  tax_mode?: TaxMode;
  settings?: Partial<ProfileSettings>;
  is_pro?: boolean;
}
