# SmartAccount - AI Бухгалтер для предпринимателей

## Полная спецификация проекта

### Технологический стек
- **Frontend**: Next.js 14+ (App Router) + TypeScript strict
- **UI**: Tailwind CSS, fintech dark theme
- **Charts**: Recharts
- **Backend**: Next.js Route Handlers
- **DB**: Supabase Postgres + RLS
- **Auth**: Telegram WebApp initData verification (HMAC)
- **Hosting**: Vercel
- **Tests**: Vitest

### Дизайн-система
- Base: #1E1F25
- Accent: #4F46E5 (indigo)
- Success: #10B981
- Danger: #EF4444
- Warning: #F59E0B

---

## Структура проекта

```
smartaccount/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Группа маршрутов авторизации
│   │   │   └── route.ts       # Telegram auth callback
│   │   ├── (dashboard)/       # Защищённые маршруты
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx      # Dashboard
│   │   │   ├── transactions/  # Операции
│   │   │   ├── forecast/     # Прогноз
│   │   │   ├── calendar/     # Календарь
│   │   │   └── settings/     # Настройки
│   │   ├── api/              # API Routes
│   │   │   ├── auth/         # Telegram auth
│   │   │   ├── transactions/ # CRUD операций
│   │   │   ├── forecast/     # Прогноз
│   │   │   ├── taxes/        # Расчёт налогов
│   │   │   └── ai/           # AI чат
│   │   ├── layout.tsx
│   │   └── page.tsx          # Онбординг/редирект
│   │
│   ├── domain/               # Бизнес-логика
│   │   ├── tax/             # Налоговые расчёты
│   │   │   ├── calculator.ts
│   │   │   ├── constants.ts
│   │   │   └── index.ts
│   │   ├── ledger/          # Операции
│   │   │   ├── types.ts
│   │   │   ├── repository.ts
│   │   │   └── index.ts
│   │   ├── pnl/             # P&L агрегации
│   │   │   ├── calculator.ts
│   │   │   └── index.ts
│   │   ├── forecast/        # AI прогнозирование
│   │   │   ├── engine.ts
│   │   │   ├── scenarios.ts
│   │   │   ├── features.ts
│   │   │   └── index.ts
│   │   ├── reminders/       # Напоминания
│   │   │   ├── scheduler.ts
│   │   │   └── index.ts
│   │   └── ai/              # AI модуль
│   │       ├── prompts.ts
│   │       └── index.ts
│   │
│   ├── lib/                 # Утилиты
│   │   ├── supabase/       # Supabase клиент
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── index.ts
│   │   ├── telegram/       # Telegram auth
│   │   │   ├── verify.ts
│   │   │   └── index.ts
│   │   ├── db/             # Database layer
│   │   │   ├── repositories/
│   │   │   └── index.ts
│   │   └── utils/
│   │
│   ├── components/         # UI компоненты
│   │   ├── ui/            # Базовые компоненты
│   │   ├── forms/         # Формы
│   │   ├── charts/        # Графики
│   │   └── layout/       # Layout компоненты
│   │
│   └── types/             # TypeScript типы
│       ├── domain.ts
│       ├── api.ts
│       └── index.ts
│
├── tests/                  # Тесты
│   ├── domain/
│   │   └── tax/
│   └── setup.ts
│
├── supabase/              # Supabase файлы
│   ├── migrations/
│   └── seed.sql
│
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── vitest.config.ts
```

---

## Базы данных (Supabase Schema)

### Таблицы

1. **profiles**
   - id (uuid, PK)
   - telegram_id (bigint, unique)
   - username (text)
   - tax_mode (text): 'usn_6' | 'usn_15' | 'patent' | 'selfemployed'
   - settings (jsonb)
   - created_at (timestamptz)
   - updated_at (timestamptz)

2. **transactions**
   - id (uuid, PK)
   - user_id (uuid, FK → profiles.id)
   - type (text): 'income' | 'expense'
   - amount (numeric)
   - currency (text): 'RUB'
   - category_id (uuid, FK → categories.id)
   - counterparty (text, nullable)
   - description (text, nullable)
   - occurred_at (timestamptz)
   - meta (jsonb)
   - created_at (timestamptz)

3. **categories**
   - id (uuid, PK)
   - user_id (uuid, FK → profiles.id, nullable для дефолтных)
   - name (text)
   - type (text): 'income' | 'expense'
   - is_default (boolean)
   - color (text)
   - icon (text)
   - created_at (timestamptz)

4. **forecasts**
   - id (uuid, PK)
   - user_id (uuid, FK → profiles.id)
   - horizon_days (int)
   - scenario (text): 'base' | 'optimistic' | 'pessimistic'
   - series (jsonb)
   - bands (jsonb)
   - quality (int): 0-100
   - explanation (text)
   - created_at (timestamptz)

5. **reminders**
   - id (uuid, PK)
   - user_id (uuid, FK → profiles.id)
   - kind (text): 'tax' | 'payment' | 'report'
   - title (text)
   - due_at (timestamptz)
   - status (text): 'pending' | 'completed' | 'dismissed'
   - payload (jsonb)
   - created_at (timestamptz)

6. **chats**
   - id (uuid, PK)
   - user_id (uuid, FK → profiles.id)
   - messages (jsonb)
   - created_at (timestamptz)
   - updated_at (timestamptz)

---

## Бизнес-логика

### Налоговые режимы

1. **ИП УСН 6% (Доходы)**
   - Налог = Доход × 6%
   - Вычет: взносы в ПФР/ФОМС
   - Лимит: 265.5 млн ₽

2. **ИП УСН 15% (Доходы - Расходы)**
   - Налог = max((Доход - Расход) × 15%, 1% от Дохода)
   - Лимит: 265.5 млн ₽

3. **ИП Патент**
   - Фиксированная сумма
   - Лимит: 60 млн ₽, 15 сотрудников

4. **Самозанятый**
   - 4% при работе с физлицами
   - 6% при работе с юрлицами/ИП
   - Лимит: 2.4 млн ₽

### Прогнозирование

- **Base**: Линейный тренд + скользящее среднее
- **Optimistic**: +20% доходы, -10% расходы
- **Pessimistic**: -20% доходы, +10% расходы
- Горизонт: 30/90 дней
- Confidence bands: ±1.5σ

---

## Монетизация

### Free
- Учёт операций
- Базовые расчёты налогов
- Прогноз base 30 дней

### Pro
- AI-чат
- Прогноз 90 дней + сценарии
- Экспорт PDF/CSV
- Расширенная аналитика

---

## Безопасность

- Telegram initData HMAC verification
- Supabase RLS policies
- Rate limiting на AI endpoints
- Secrets в .env

---

## TODO: Реализация

Следующие шаги:
1. Настроить структуру директорий
2. Создать Supabase schema + RLS
3. Реализовать Telegram auth
4. Создать domain модули (tax, ledger, pnl, forecast)
5. Создать UI компоненты
6. Реализовать страницы (dashboard, transactions, forecast)
7. Настроить API routes
8. Написать тесты
