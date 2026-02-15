-- SmartAccount Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    tax_mode TEXT NOT NULL DEFAULT 'usn_6',
    settings JSONB DEFAULT '{}',
    is_pro BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES (default + custom)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    is_default BOOLEAN DEFAULT false,
    color TEXT DEFAULT '#6B7280',
    icon TEXT DEFAULT 'folder',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT DEFAULT 'RUB',
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    counterparty TEXT,
    description TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FORECASTS
CREATE TABLE IF NOT EXISTS forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    horizon_days INTEGER NOT NULL,
    scenario TEXT NOT NULL CHECK (scenario IN ('base', 'optimistic', 'pessimistic')),
    income_series JSONB NOT NULL,
    expense_series JSONB NOT NULL,
    profit_series JSONB NOT NULL,
    bands JSONB NOT NULL,
    quality INTEGER CHECK (quality >= 0 AND quality <= 100),
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REMINDERS
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('tax', 'payment', 'report', 'custom')),
    title TEXT NOT NULL,
    description TEXT,
    due_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'dismissed')),
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CHATS
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Chat',
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON transactions(occurred_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_occurred ON transactions(user_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_user_id ON forecasts(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_at ON reminders(due_at);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON profiles(telegram_id);

-- RLS POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories: users see default + own
CREATE POLICY "Users can view own categories" ON categories
    FOR SELECT USING (user_id = auth.uid() OR is_default = true);

CREATE POLICY "Users can manage own categories" ON categories
    FOR ALL USING (user_id = auth.uid());

-- Transactions: users only see own
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own transactions" ON transactions
    FOR ALL USING (user_id = auth.uid());

-- Forecasts: users only see own
CREATE POLICY "Users can view own forecasts" ON forecasts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own forecasts" ON forecasts
    FOR ALL USING (user_id = auth.uid());

-- Reminders: users only see own
CREATE POLICY "Users can view own reminders" ON reminders
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own reminders" ON reminders
    FOR ALL USING (user_id = auth.uid());

-- Chats: users only see own
CREATE POLICY "Users can view own chats" ON chats
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own chats" ON chats
    FOR ALL USING (user_id = auth.uid());

-- Seed default categories
INSERT INTO categories (name, type, is_default, color, icon) VALUES
    ('Продажи', 'income', true, '#10B981', 'trending-up'),
    ('Услуги', 'income', true, '#3B82F6', 'briefcase'),
    ('Возврат', 'income', true, '#8B5CF6', 'rotate-ccw'),
    ('Прочее (доход)', 'income', true, '#6B7280', 'more-horizontal'),
    ('Аренда', 'expense', true, '#EF4444', 'home'),
    ('Закупка', 'expense', true, '#F59E0B', 'shopping-cart'),
    ('Зарплата', 'expense', true, '#EC4899', 'users'),
    ('Налоги', 'expense', true, '#8B5CF6', 'file-text'),
    ('Взносы', 'expense', true, '#6366F1', 'shield'),
    ('Прочее (расход)', 'expense', true, '#6B7280', 'more-horizontal')
ON CONFLICT DO NOTHING;

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_chats_updated_at
    BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
