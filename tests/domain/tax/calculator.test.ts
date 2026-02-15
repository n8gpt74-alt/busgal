/**
 * Tax Calculator Tests
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTax,
  calculateUSN6,
  calculateUSN15,
  calculateSelfEmployed,
  calculateIPContributions,
  checkIncomeLimit,
  calculateQuarterlyUSN,
  TAX_MODES,
} from '../../src/domain/tax/calculator';

describe('Tax Calculator', () => {
  describe('USN 6% (Income)', () => {
    it('should calculate basic USN 6% tax', () => {
      const result = calculateUSN6({
        income: 1_000_000,
        year: 2026,
      });
      
      expect(result.tax).toBe(60000);
      expect(result.effectiveRate).toBe(0.06);
      expect(result.taxMode).toBe(TAX_MODES.USN_6);
    });
    
    it('should apply deduction from contributions', () => {
      const result = calculateUSN6({
        income: 1_000_000,
        contributions: 50000,
        year: 2026,
      });
      
      // Base tax: 1M * 6% = 60k
      // Deduction: 50k (no employees = 100% allowed)
      // Final: 60k - 50k = 10k
      expect(result.tax).toBe(10000);
      expect(result.breakdown.deductions).toBe(50000);
    });
    
    it('should limit deduction to 50% with employees', () => {
      const result = calculateUSN6({
        income: 1_000_000,
        contributions: 50000,
        employees: 1,
        year: 2026,
      });
      
      // Base tax: 60k
      // Max deduction: 60k * 50% = 30k
      // Final: 60k - 30k = 30k
      expect(result.tax).toBe(30000);
    });
    
    it('should not go below zero', () => {
      const result = calculateUSN6({
        income: 100_000,
        contributions: 100_000,
        year: 2026,
      });
      
      // Base: 6k, Deduction: 100k (capped at 6k)
      expect(result.tax).toBe(0);
    });
  });
  
  describe('USN 15% (Income - Expenses)', () => {
    it('should calculate basic USN 15% tax', () => {
      const result = calculateUSN15({
        income: 1_000_000,
        expenses: 400_000,
        year: 2026,
      });
      
      // Taxable: 1M - 400k = 600k
      // Tax: 600k * 15% = 90k
      expect(result.tax).toBe(90000);
    });
    
    it('should apply minimum tax when base is less', () => {
      const result = calculateUSN15({
        income: 1_000_000,
        expenses: 900_000,
        year: 2026,
      });
      
      // Taxable: 1M - 900k = 100k
      // Base tax: 100k * 15% = 15k
      // Minimum: 1M * 1% = 10k
      // Final: max(15k, 10k) = 15k
      expect(result.tax).toBe(15000);
    });
    
    it('should use minimum tax when operating at loss', () => {
      const result = calculateUSN15({
        income: 500_000,
        expenses: 600_000,
        year: 2026,
      });
      
      // Taxable: 0 (negative)
      // Minimum: 500k * 1% = 5k
      expect(result.tax).toBe(5000);
      expect(result.breakdown.minimumTax).toBe(5000);
    });
  });
  
  describe('Self-employed (NPD)', () => {
    it('should calculate tax for fiz persons', () => {
      const result = calculateSelfEmployed({
        incomeFromFiz: 100_000,
        incomeFromJur: 0,
      });
      
      // Tax: 100k * 4% = 4k
      expect(result.tax).toBe(4000);
    });
    
    it('should calculate tax for jur persons', () => {
      const result = calculateSelfEmployed({
        incomeFromFiz: 0,
        incomeFromJur: 100_000,
      });
      
      // Tax: 100k * 6% = 6k
      expect(result.tax).toBe(6000);
    });
    
    it('should calculate combined tax correctly', () => {
      const result = calculateSelfEmployed({
        incomeFromFiz: 50_000,
        incomeFromJur: 50_000,
      });
      
      // FIZ: 50k * 4% = 2k
      // JUR: 50k * 6% = 3k
      // Total: 5k
      expect(result.tax).toBe(5000);
    });
  });
  
  describe('IP Contributions', () => {
    it('should calculate fixed contributions', () => {
      const result = calculateIPContributions({
        income: 100_000,
      });
      
      // Fixed: ~70k
      expect(result.fixed).toBeGreaterThan(0);
      expect(result.additional).toBe(0); // Income < 300k
      expect(result.total).toBe(result.fixed);
    });
    
    it('should calculate additional contribution', () => {
      const result = calculateIPContributions({
        income: 500_000,
      });
      
      // Excess: 500k - 300k = 200k
      // Additional: 200k * 1% = 2k
      expect(result.additional).toBe(2000);
      expect(result.total).toBe(result.fixed + 2000);
    });
    
    it('should cap additional at maximum', () => {
      const result = calculateIPContributions({
        income: 50_000_000,
      });
      
      // Without cap: (50M - 300k) * 1% = 497k
      // Cap: 257,061
      expect(result.additional).toBe(257061);
    });
  });
  
  describe('Income Limits', () => {
    it('should detect USN limit exceeded', () => {
      expect(checkIncomeLimit(TAX_MODES.USN_6, 300_000_000)).toBe(true);
      expect(checkIncomeLimit(TAX_MODES.USN_15, 300_000_000)).toBe(true);
      expect(checkIncomeLimit(TAX_MODES.USN_6, 100_000_000)).toBe(false);
    });
    
    it('should detect patent limit exceeded', () => {
      expect(checkIncomeLimit(TAX_MODES.PATENT, 70_000_000)).toBe(true);
      expect(checkIncomeLimit(TAX_MODES.PATENT, 50_000_000)).toBe(false);
    });
    
    it('should detect self-employed limit exceeded', () => {
      expect(checkIncomeLimit(TAX_MODES.SELFEMPLOYED, 3_000_000)).toBe(true);
      expect(checkIncomeLimit(TAX_MODES.SELFEMPLOYED, 2_000_000)).toBe(false);
    });
  });
  
  describe('Quarterly calculations', () => {
    it('should calculate quarterly USN 6%', () => {
      const tax = calculateQuarterlyUSN('usn_6', 500_000, 0, 0);
      expect(tax).toBe(30000); // 500k * 6%
    });
    
    it('should calculate quarterly USN 15%', () => {
      const tax = calculateQuarterlyUSN('usn_15', 500_000, 200_000, 0);
      expect(tax).toBe(45000); // (500k - 200k) * 15%
    });
    
    it('should apply minimum tax for quarterly USN 15%', () => {
      const tax = calculateQuarterlyUSN('usn_15', 500_000, 450_000, 0);
      // Base: (500k - 450k) * 15% = 7.5k
      // Minimum: 500k * 1% = 5k
      expect(tax).toBe(7500);
    });
  });
  
  describe('Main calculateTax function', () => {
    it('should route to correct calculator based on mode', () => {
      const result = calculateTax(TAX_MODES.USN_6, { income: 1_000_000, year: 2026 });
      expect(result.taxMode).toBe(TAX_MODES.USN_6);
      
      const result15 = calculateTax(TAX_MODES.USN_15, { income: 1_000_000, expenses: 500_000, year: 2026 });
      expect(result15.taxMode).toBe(TAX_MODES.USN_15);
    });
    
    it('should throw for unknown tax mode', () => {
      expect(() => {
        calculateTax('unknown' as any, { income: 0, year: 2026 });
      }).toThrow();
    });
  });
});
