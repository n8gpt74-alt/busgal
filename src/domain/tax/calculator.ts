/**
 * Tax Calculator for Russian tax regimes
 * Supports: USN 6%, USN 15%, Patent, Self-employed
 */

import {
  TaxMode,
  TAX_MODES,
  TAX_RATES,
  INCOME_LIMITS,
  IP_TOTAL_FIXED,
  IP_ADDITIONAL_PENSION_RATE,
  IP_ADDITIONAL_PENSION_MAX,
  IP_ADDITIONAL_PENSION_THRESHOLD,
  KBK,
  LEGAL_REFERENCES,
} from './constants';

/**
 * Input parameters for tax calculation
 */
export interface TaxCalculationParams {
  /** Total income for the period */
  income: number;
  /** Total expenses for the period (USN 15% only) */
  expenses?: number;
  /** Fixed contributions paid (for USN deduction) */
  contributions?: number;
  /** Number of employees (affects some calculations) */
  employees?: number;
  /** Patent cost (for Patent mode) */
  patentCost?: number;
  /** Income from physical persons (self-employed) */
  incomeFromFiz?: number;
  /** Income from legal entities/IP (self-employed) */
  incomeFromJur?: number;
  /** Year for calculation */
  year: number;
}

/**
 * Tax calculation result
 */
export interface TaxCalculationResult {
  /** Calculated tax amount */
  tax: number;
  /** Effective tax rate */
  effectiveRate: number;
  /** Tax mode used */
  taxMode: TaxMode;
  /** Breakdown of the calculation */
  breakdown: {
    baseTax: number;
    deductions: number;
    minimumTax?: number;
    totalTaxable: number;
  };
  /** KBK code for payment */
  kbk: string;
  /** Legal reference */
  legalRef: string;
  /** Warnings (e.g., approaching limits) */
  warnings: string[];
  /** Whether the user exceeded income limit */
  limitExceeded: boolean;
}

/**
 * Check if income limit is exceeded
 */
export function checkIncomeLimit(taxMode: TaxMode, income: number): boolean {
  switch (taxMode) {
    case TAX_MODES.USN_6:
    case TAX_MODES.USN_15:
      return income > INCOME_LIMITS.USN_LIMIT;
    case TAX_MODES.PATENT:
      return income > INCOME_LIMITS.PATENT_LIMIT;
    case TAX_MODES.SELFEMPLOYED:
      return income > INCOME_LIMITS.SELFEMPLOYED_LIMIT;
    default:
      return false;
  }
}

/**
 * Calculate USN 6% tax (income)
 */
export function calculateUSN6(params: TaxCalculationParams): TaxCalculationResult {
  const { income, contributions = 0, year } = params;
  
  // Base tax: income * 6%
  const baseTax = income * TAX_RATES.USN_6_RATE;
  
  // Deductions: contributions (up to 100% without employees, 50% with)
  const maxDeduction = params.employees && params.employees > 0 
    ? baseTax * 0.5 
    : baseTax;
  
  const deductions = Math.min(contributions, maxDeduction);
  const tax = Math.max(baseTax - deductions, 0);
  const effectiveRate = income > 0 ? tax / income : 0;
  
  const warnings: string[] = [];
  if (income > INCOME_LIMITS.USN_LIMIT) {
    warnings.push(`Превышен лимит доходов УСН: ${INCOME_LIMITS.USN_LIMIT.toLocaleString()} ₽`);
  }
  
  return {
    tax,
    effectiveRate,
    taxMode: TAX_MODES.USN_6,
    breakdown: {
      baseTax,
      deductions,
      totalTaxable: income,
    },
    kbk: KBK.USN_6,
    legalRef: LEGAL_REFERENCES.USN,
    warnings,
    limitExceeded: income > INCOME_LIMITS.USN_LIMIT,
  };
}

/**
 * Calculate USN 15% tax (income - expenses)
 */
export function calculateUSN15(params: TaxCalculationParams): TaxCalculationResult {
  const { income, expenses = 0, year } = params;
  
  // Taxable base
  const taxableBase = Math.max(income - expenses, 0);
  
  // Base tax: (income - expenses) * 15%
  const baseTax = taxableBase * TAX_RATES.USN_15_RATE;
  
  // Minimum tax: 1% of income
  const minimumTax = income * TAX_RATES.USN_15_MIN_RATE;
  
  // Tax is max(baseTax, minimumTax)
  const tax = Math.max(baseTax, minimumTax);
  const effectiveRate = income > 0 ? tax / income : 0;
  
  const warnings: string[] = [];
  if (income > INCOME_LIMITS.USN_LIMIT) {
    warnings.push(`Превышен лимит доходов УСН: ${INCOME_LIMITS.USN_LIMIT.toLocaleString()} ₽`);
  }
  if (expenses > income * 0.8) {
    warnings.push('Расходы превышают 80% доходов - рекомендуется проверить обоснованность');
  }
  
  return {
    tax,
    effectiveRate,
    taxMode: TAX_MODES.USN_15,
    breakdown: {
      baseTax,
      deductions: 0,
      minimumTax,
      totalTaxable: taxableBase,
    },
    kbk: KBK.USN_15,
    legalRef: LEGAL_REFERENCES.USN,
    warnings,
    limitExceeded: income > INCOME_LIMITS.USN_LIMIT,
  };
}

/**
 * Calculate Patent tax
 */
export function calculatePatent(params: TaxCalculationParams): TaxCalculationResult {
  const { patentCost = 0, year } = params;
  
  // Patent is fixed cost
  const tax = patentCost;
  const warnings: string[] = [];
  
  return {
    tax,
    effectiveRate: 0, // Fixed amount
    taxMode: TAX_MODES.PATENT,
    breakdown: {
      baseTax: patentCost,
      deductions: 0,
      totalTaxable: 0,
    },
    kbk: KBK.PATENT,
    legalRef: LEGAL_REFERENCES.PATENT,
    warnings,
    limitExceeded: false,
  };
}

/**
 * Calculate Self-employed (NPD) tax
 */
export function calculateSelfEmployed(params: TaxCalculationParams): TaxCalculationResult {
  const {
    incomeFromFiz = 0,
    incomeFromJur = 0,
  } = params;
  
  const totalIncome = incomeFromFiz + incomeFromJur;
  
  // Tax: fiz * 4% + jur * 6%
  const taxFiz = incomeFromFiz * TAX_RATES.SELFEMPLOYED_RATE_FIZ;
  const taxJur = incomeFromJur * TAX_RATES.SELFEMPLOYED_RATE_JUR;
  const baseTax = taxFiz + taxJur;
  
  const warnings: string[] = [];
  if (totalIncome > INCOME_LIMITS.SELFEMPLOYED_LIMIT) {
    warnings.push(`Превышен лимит самозанятости: ${INCOME_LIMITS.SELFEMPLOYED_LIMIT.toLocaleString()} ₽`);
  }
  
  return {
    tax: baseTax,
    effectiveRate: totalIncome > 0 ? baseTax / totalIncome : 0,
    taxMode: TAX_MODES.SELFEMPLOYED,
    breakdown: {
      baseTax,
      deductions: 0,
      totalTaxable: totalIncome,
    },
    kbk: KBK.SELFEMPLOYED,
    legalRef: LEGAL_REFERENCES.SELFEMPLOYED,
    warnings,
    limitExceeded: totalIncome > INCOME_LIMITS.SELFEMPLOYED_LIMIT,
  };
}

/**
 * Calculate IP contributions (pension + medical)
 */
export function calculateIPContributions(params: TaxCalculationParams): {
  fixed: number;
  additional: number;
  total: number;
} {
  const { income = 0 } = params;
  
  // Fixed contributions
  const fixed = IP_TOTAL_FIXED;
  
  // Additional: 1% from income > 300k
  const additionalExcess = Math.max(income - IP_ADDITIONAL_PENSION_THRESHOLD, 0);
  const additional = Math.min(
    additionalExcess * IP_ADDITIONAL_PENSION_RATE,
    IP_ADDITIONAL_PENSION_MAX
  );
  
  return {
    fixed,
    additional,
    total: fixed + additional,
  };
}

/**
 * Main tax calculation function
 */
export function calculateTax(
  taxMode: TaxMode,
  params: TaxCalculationParams
): TaxCalculationResult {
  switch (taxMode) {
    case TAX_MODES.USN_6:
      return calculateUSN6(params);
    case TAX_MODES.USN_15:
      return calculateUSN15(params);
    case TAX_MODES.PATENT:
      return calculatePatent(params);
    case TAX_MODES.SELFEMPLOYED:
      return calculateSelfEmployed(params);
    default:
      throw new Error(`Unknown tax mode: ${taxMode}`);
  }
}

/**
 * Calculate estimated quarterly tax for USN
 */
export function calculateQuarterlyUSN(
  taxMode: 'usn_6' | 'usn_15',
  quarterlyIncome: number,
  quarterlyExpenses: number = 0,
  quarterlyContributions: number = 0
): number {
  if (taxMode === 'usn_6') {
    const base = quarterlyIncome * TAX_RATES.USN_6_RATE;
    const deduction = Math.min(quarterlyContributions, base);
    return Math.max(base - deduction, 0);
  } else {
    const taxable = Math.max(quarterlyIncome - quarterlyExpenses, 0);
    const base = taxable * TAX_RATES.USN_15_RATE;
    const minimum = quarterlyIncome * TAX_RATES.USN_15_MIN_RATE;
    return Math.max(base, minimum);
  }
}

/**
 * Format tax amount for display
 */
export function formatTaxAmount(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
