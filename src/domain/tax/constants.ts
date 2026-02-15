/**
 * Tax constants for Russian tax regimes
 * Updated for 2026
 */

export const TAX_MODES = {
  USN_6: 'usn_6',
  USN_15: 'usn_15',
  PATENT: 'patent',
  SELFEMPLOYED: 'selfemployed',
} as const;

export type TaxMode = typeof TAX_MODES[keyof typeof TAX_MODES];

// Tax rates
export const TAX_RATES = {
  // USN 6% (income)
  USN_6_RATE: 0.06,
  
  // USN 15% (income - expenses)
  USN_15_RATE: 0.15,
  USN_15_MIN_RATE: 0.01, // Minimum tax
  
  // Self-employed
  SELFEMPLOYED_RATE_FIZ: 0.04, // Physical persons
  SELFEMPLOYED_RATE_JUR: 0.06, // Legal entities/IP
} as const;

// Income limits
export const INCOME_LIMITS = {
  // USN limit (265.5M + 20% excess)
  USN_LIMIT: 265_500_000,
  USN_LIMIT_EXCESS: 318_600_000,
  
  // Patent limit
  PATENT_LIMIT: 60_000_000,
  
  // Self-employed limit
  SELFEMPLOYED_LIMIT: 2_400_000,
} as const;

// Employee limits
export const EMPLOYEE_LIMITS = {
  USN: 130,
  PATENT: 15,
} as const;

// Fixed contributions for IP (2026)
export const IP_FIXED_CONTRIBUTIONS = {
  PENSION: 56_000, // ~56k rub
  MEDICAL: 14_000,  // ~14k rub
} as const;

export const IP_TOTAL_FIXED = IP_FIXED_CONTRIBUTIONS.PENSION + IP_FIXED_CONTRIBUTIONS.MEDICAL;

// Additional pension contribution rate
export const IP_ADDITIONAL_PENSION_RATE = 0.01; // 1% from income > 300k
export const IP_ADDITIONAL_PENSION_MAX = 257_061;
export const IP_ADDITIONAL_PENSION_THRESHOLD = 300_000;

// Deadline dates
export const TAX_DEADLINES = {
  USN: {
    Q1: { month: 4, day: 25 },
    Q2: { month: 7, day: 25 },
    Q3: { month: 10, day: 25 },
    Q4: { month: 4, day: 30 }, // Annual
  },
  PATENT: {
    LESS_THAN_6_MONTHS: 90, // days from issue
    MORE_THAN_6_MONTHS: { first: 90, remainder: 'end_of_patent' },
  },
  SELFEMPLOYED: {
    PAYMENT: { day: 28 }, // Monthly by 28th
  },
  IP_CONTRIBUTIONS: {
    FIXED: { month: 12, day: 31 },
    ADDITIONAL: { month: 7, day: 1 }, // Next year by July 1
  },
} as const;

// KBK (Budget Classification Codes)
export const KBK = {
  USN_6: '18210501011011000110',
  USN_15: '18210501021011000110',
  PATENT: '18210505020011000110',
  SELFEMPLOYED: '18210506000011000110',
  IP_PENSION: '18210202000010160160',
  IP_MEDICAL: '18210202101008101360',
} as const;

// Tax regime labels
export const TAX_MODE_LABELS: Record<TaxMode, string> = {
  [TAX_MODES.USN_6]: 'ИП УСН 6% (Доходы)',
  [TAX_MODES.USN_15]: 'ИП УСН 15% (Доходы - Расходы)',
  [TAX_MODES.PATENT]: 'ИП Патент',
  [TAX_MODES.SELFEMPLOYED]: 'Самозанятый (НПД)',
};

// Legal references
export const LEGAL_REFERENCES = {
  USN: 'Глава 26.2 НК РФ',
  PATENT: 'Глава 26.5 НК РФ',
  SELFEMPLOYED: 'Федеральный закон № 422-ФЗ',
  CONTRIBUTIONS: 'Глава 34 НК РФ',
} as const;
