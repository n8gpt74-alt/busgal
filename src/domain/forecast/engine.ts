/**
 * AI Forecast Engine
 * Statistical forecasting with scenarios (base, optimistic, pessimistic)
 * No external API dependencies - all computation on server
 */

import type { Transaction } from '../ledger/types';

/**
 * Forecast horizon options
 */
export const FORECAST_HORIZONS = {
  SHORT: 30,
  MEDIUM: 60,
  LONG: 90,
} as const;

export type ForecastHorizon = typeof FORECAST_HORIZONS[keyof typeof FORECAST_HORIZONS];

/**
 * Forecast scenarios
 */
export const SCENARIOS = {
  BASE: 'base',
  OPTIMISTIC: 'optimistic',
  PESSIMISTIC: 'pessimistic',
} as const;

export type Scenario = typeof SCENARIOS[keyof typeof SCENARIOS];

/**
 * Scenario adjustments (percentage)
 */
export const SCENARIO_ADJUSTMENTS = {
  [SCENARIOS.BASE]: { income: 0, expense: 0 },
  [SCENARIOS.OPTIMISTIC]: { income: 0.2, expense: -0.1 }, // +20% income, -10% expense
  [SCENARIOS.PESSIMISTIC]: { income: -0.2, expense: 0.1 }, // -20% income, +10% expense
} as const;

/**
 * Daily forecast data point
 */
export interface ForecastPoint {
  date: string;
  income: number;
  expense: number;
  profit: number;
}

/**
 * Forecast result with confidence bands
 */
export interface ForecastResult {
  horizon: number;
  scenario: Scenario;
  series: ForecastPoint[];
  bands: {
    upper: ForecastPoint[];
    lower: ForecastPoint[];
  };
  quality: number; // 0-100
  explanation: string;
  trend: 'up' | 'down' | 'stable';
  avgDailyIncome: number;
  avgDailyExpense: number;
  avgDailyProfit: number;
}

/**
 * Input data for forecasting
 */
export interface ForecastInput {
  transactions: Transaction[];
  horizon: ForecastHorizon;
  scenario: Scenario;
}

/**
 * Group transactions by date
 */
function groupByDate(transactions: Transaction[]): Map<string, { income: number; expense: number }> {
  const grouped = new Map<string, { income: number; expense: number }>();
  
  for (const tx of transactions) {
    const date = new Date(tx.occurred_at).toISOString().split('T')[0];
    const existing = grouped.get(date) || { income: 0, expense: 0 };
    
    if (tx.type === 'income') {
      existing.income += tx.amount;
    } else {
      existing.expense += tx.amount;
    }
    
    grouped.set(date, existing);
  }
  
  return grouped;
}

/**
 * Calculate moving average
 */
function movingAverage(values: number[], window: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    result.push(avg);
  }
  
  return result;
}

/**
 * Linear regression (Theil-Sen simplified)
 */
function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) || 0;
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

/**
 * Calculate standard deviation
 */
function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Detect weekly seasonality (day of week patterns)
 */
function detectWeeklySeasonality(dailyData: { income: number; expense: number }[]): number[] {
  const dayOfWeekIncome: number[][] = Array.from({ length: 7 }, () => []);
  
  for (const data of dailyData) {
    const dayOfWeek = new Date(data.date || Date.now()).getDay();
    dayOfWeekIncome[dayOfWeek].push(data.income);
  }
  
  // Return average income by day of week
  return dayOfWeekIncome.map(days => 
    days.length > 0 ? days.reduce((a, b) => a + b, 0) / days.length : 0
  );
}

/**
 * Apply scenario adjustments
 */
function applyScenario(
  income: number,
  expense: number,
  scenario: Scenario
): { income: number; expense: number } {
  const adj = SCENARIO_ADJUSTMENTS[scenario];
  return {
    income: income * (1 + adj.income),
    expense: expense * (1 + adj.expense),
  };
}

/**
 * Main forecast function
 */
export function generateForecast(input: ForecastInput): ForecastResult {
  const { transactions, horizon, scenario } = input;
  
  if (transactions.length === 0) {
    return createEmptyForecast(horizon, scenario);
  }
  
  // Group by date and fill missing days
  const grouped = groupByDate(transactions);
  const sortedDates = Array.from(grouped.keys()).sort();
  
  // Create daily data series
  const dailyData: { date: string; income: number; expense: number }[] = [];
  
  if (sortedDates.length > 0) {
    const startDate = new Date(sortedDates[0]);
    const endDate = new Date();
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const data = grouped.get(dateStr) || { income: 0, expense: 0 };
      dailyData.push({ date: dateStr, ...data });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  // Calculate statistics
  const incomeValues = dailyData.map(d => d.income);
  const expenseValues = dailyData.map(d => d.expense);
  
  const avgIncome = incomeValues.reduce((a, b) => a + b, 0) / (incomeValues.length || 1);
  const avgExpense = expenseValues.reduce((a, b) => a + b, 0) / (expenseValues.length || 1);
  
  // Linear trend
  const incomeTrend = linearRegression(incomeValues);
  const expenseTrend = linearRegression(expenseValues);
  
  // Standard deviation for confidence bands
  const incomeStd = standardDeviation(incomeValues);
  const expenseStd = standardDeviation(expenseValues);
  
  // Weekly seasonality
  const weeklyPattern = detectWeeklySeasonality(dailyData);
  
  // Determine trend direction
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (incomeTrend.slope > avgIncome * 0.01) trend = 'up';
  else if (incomeTrend.slope < -avgIncome * 0.01) trend = 'down';
  
  // Generate forecast series
  const series: ForecastPoint[] = [];
  const bands = { upper: [] as ForecastPoint[], lower: [] as ForecastPoint[] };
  
  const lastDate = dailyData.length > 0 
    ? new Date(dailyData[dailyData.length - 1].date) 
    : new Date();
  
  for (let i = 1; i <= horizon; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    const dateStr = forecastDate.toISOString().split('T')[0];
    
    // Base prediction: trend + average
    const dayIndex = dailyData.length + i - 1;
    let predictedIncome = incomeTrend.intercept + incomeTrend.slope * dayIndex;
    let predictedExpense = expenseTrend.intercept + expenseTrend.slope * dayIndex;
    
    // Apply weekly pattern if available
    const dayOfWeek = forecastDate.getDay();
    if (weeklyPattern[dayOfWeek] > 0) {
      const seasonalFactor = weeklyPattern[dayOfWeek] / (avgIncome || 1);
      if (seasonalFactor > 0) {
        predictedIncome *= (1 + seasonalFactor) * 0.5;
      }
    }
    
    // Ensure non-negative
    predictedIncome = Math.max(0, predictedIncome);
    predictedExpense = Math.max(0, predictedExpense);
    
    // Apply scenario adjustments
    const adjusted = applyScenario(predictedIncome, predictedExpense, scenario);
    
    const profit = adjusted.income - adjusted.expense;
    
    series.push({
      date: dateStr,
      income: Math.round(adjusted.income),
      expense: Math.round(adjusted.expense),
      profit: Math.round(profit),
    });
    
    // Confidence bands (1.5 sigma)
    const confidenceFactor = 1.5;
    bands.upper.push({
      date: dateStr,
      income: Math.round(adjusted.income + incomeStd * confidenceFactor),
      expense: Math.round(adjusted.expense + expenseStd * confidenceFactor),
      profit: Math.round(profit + (incomeStd + expenseStd) * confidenceFactor),
    });
    bands.lower.push({
      date: dateStr,
      income: Math.round(Math.max(0, adjusted.income - incomeStd * confidenceFactor)),
      expense: Math.round(Math.max(0, adjusted.expense - expenseStd * confidenceFactor)),
      profit: Math.round(Math.max(0, profit - (incomeStd + expenseStd) * confidenceFactor)),
    });
  }
  
  // Calculate quality score
  const quality = calculateQualityScore(dailyData, series.slice(0, 7));
  
  // Generate explanation
  const explanation = generateExplanation(trend, quality, dailyData.length, scenario);
  
  return {
    horizon,
    scenario,
    series,
    bands,
    quality,
    explanation,
    trend,
    avgDailyIncome: Math.round(avgIncome),
    avgDailyExpense: Math.round(avgExpense),
    avgDailyProfit: Math.round(avgIncome - avgExpense),
  };
}

/**
 * Calculate forecast quality score
 */
function calculateQualityScore(
  historical: { income: number; expense: number }[],
  predicted: ForecastPoint[]
): number {
  if (historical.length < 7 || predicted.length === 0) {
    return 30; // Low confidence with insufficient data
  }
  
  // Base score from data amount
  let score = Math.min(70, historical.length * 3);
  
  // Consistency bonus (low variance = higher score)
  const incomeVariance = standardDeviation(historical.map(h => h.income)) / 
    (historical.reduce((a, b) => a + b.income, 0) / historical.length || 1);
  
  if (incomeVariance < 0.5) score += 15;
  else if (incomeVariance < 1) score += 8;
  
  // Cap at 100
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Generate human-readable explanation
 */
function generateExplanation(
  trend: 'up' | 'down' | 'stable',
  quality: number,
  dataPoints: number,
  scenario: Scenario
): string {
  const trendText = trend === 'up' ? 'положительная динамика' 
    : trend === 'down' ? 'отрицательная динамика' 
    : 'стабильная ситуация';
  
  const qualityText = quality > 70 ? 'высокая' 
    : quality > 40 ? 'средняя' 
    : 'низкая';
  
  const scenarioText = scenario === 'optimistic' ? 'в оптимистичном сценарии'
    : scenario === 'pessimistic' ? 'в пессимистичном сценарии'
    : 'в базовом сценарии';
  
  let base = `Прогноз ${scenarioText}: ${trendText}.`;
  
  if (dataPoints < 30) {
    base += ' Мало данных для точного прогноза.';
  }
  
  base += ` Качество прогноза: ${qualityText}.`;
  
  return base;
}

/**
 * Create empty forecast for new users
 */
function createEmptyForecast(horizon: number, scenario: Scenario): ForecastResult {
  const series: ForecastPoint[] = [];
  const bands = { upper: [] as ForecastPoint[], lower: [] as ForecastPoint[] };
  
  const today = new Date();
  
  for (let i = 1; i <= horizon; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    series.push({ date: dateStr, income: 0, expense: 0, profit: 0 });
    bands.upper.push({ date: dateStr, income: 0, expense: 0, profit: 0 });
    bands.lower.push({ date: dateStr, income: 0, expense: 0, profit: 0 });
  }
  
  return {
    horizon,
    scenario,
    series,
    bands,
    quality: 0,
    explanation: 'Недостаточно данных для прогнозирования. Добавьте операции для получения прогноза.',
    trend: 'stable',
    avgDailyIncome: 0,
    avgDailyExpense: 0,
    avgDailyProfit: 0,
  };
}

/**
 * Get summary statistics for forecast
 */
export function getForecastSummary(forecast: ForecastResult): {
  totalIncome: number;
  totalExpense: number;
  totalProfit: number;
  avgProfit: number;
  bestDay: ForecastPoint | null;
  worstDay: ForecastPoint | null;
} {
  const totalIncome = forecast.series.reduce((sum, p) => sum + p.income, 0);
  const totalExpense = forecast.series.reduce((sum, p) => sum + p.expense, 0);
  const totalProfit = forecast.series.reduce((sum, p) => sum + p.profit, 0);
  const avgProfit = totalProfit / forecast.series.length;
  
  let bestDay = null;
  let worstDay = null;
  
  for (const point of forecast.series) {
    if (!bestDay || point.profit > bestDay.profit) bestDay = point;
    if (!worstDay || point.profit < worstDay.profit) worstDay = point;
  }
  
  return { totalIncome, totalExpense, totalProfit, avgProfit, bestDay, worstDay };
}
