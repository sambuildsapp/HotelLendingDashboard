/**
 * Hotel Lending Management System - Type Definitions
 * Phase 2: Domain Core
 * 
 * These Zod schemas define the strict data contracts for the system.
 */

import { z } from 'zod';

// =============================================================================
// 2.1 LOAN SCHEMA
// =============================================================================
export const BorrowerSchema = z.object({
    name: z.string(),
    contactName: z.string().optional(),
    contactEmail: z.string().email().optional(),
});

export const LoanTermsSchema = z.object({
    originalPrincipal: z.number(),
    currentBalance: z.number(),
    interestType: z.enum(['FIXED', 'FLOATING']),
    interestRate: z.number(), // Fixed rate or spread over SOFR
    sofrRate: z.number().optional(), // Current SOFR if floating
    originationDate: z.coerce.date(),
    maturityDate: z.coerce.date(),
    originalTermMonths: z.number().int().positive(),
    remainingTermMonths: z.number().int().nonnegative().optional(), // Computed dynamically from maturityDate
    amortizationTermMonths: z.number().int().positive(),
    extensionTermMonths: z.number().int().optional(),
    extensionRequirements: z.string().optional(),
    isRecourse: z.boolean(),
    prepaymentAllowed: z.boolean(),
    yieldMaintenance: z.number().optional(),
    reserveRequirementPct: z.number().default(0.04),
    fiveYearCapitalPlan: z.number().optional(),
});

export const LoanCovenantsSchema = z.object({
    minDSCR: z.number(),
    minDebtYield: z.number(),
});

export const LoanSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    borrower: BorrowerSchema,
    terms: LoanTermsSchema,
    covenants: LoanCovenantsSchema,
    hotelIds: z.array(z.string().uuid()),
    status: z.enum(['PERFORMING', 'WATCHLIST', 'DEFAULT']),
});

export type Loan = z.infer<typeof LoanSchema>;

// =============================================================================
// 2.2 HOTEL SCHEMA
// =============================================================================
export const HotelSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    address: z.string(),
    keyCount: z.number().int().positive(),
    yearBuilt: z.number().int(),
    yearRenovated: z.number().int().optional(),
    brand: z.string(),
    managementCompany: z.string(),
    assetManager: z.string(),
    loanId: z.string().uuid().nullable(),
});

export type Hotel = z.infer<typeof HotelSchema>;

// =============================================================================
// 2.3 FINANCIAL PERFORMANCE SCHEMA (USALI P&L)
// =============================================================================
export const FinancialPeriodSchema = z.object({
    id: z.string().uuid(),
    hotelId: z.string().uuid(),
    period: z.coerce.date(), // First of month
    scenario: z.enum(['ACTUAL', 'BUDGET', 'FORECAST']),

    // Operating Statistics
    roomsAvailable: z.number().int().nonnegative(),
    roomsSold: z.number().int().nonnegative(),

    // Revenue
    revenueRooms: z.number(),
    revenueFB: z.number(),
    revenueOther: z.number(),
    revenueMisc: z.number(),

    // Departmental Expenses
    expenseRoomsDept: z.number(),
    expenseFBDept: z.number(),
    expenseOtherDept: z.number(),

    // Undistributed Expenses
    expenseAdminGeneral: z.number(),
    expenseInfoTelecom: z.number(),
    expenseSalesMarketing: z.number(),
    expensePropertyOps: z.number(),
    expenseUtilities: z.number(),

    // Non-Operating
    expenseManagementFees: z.number(),
    expenseRent: z.number(),
    expensePropertyTaxes: z.number(),
    expenseInsurance: z.number(),
    expenseOtherNonOp: z.number(),
    expenseFFEReserve: z.number(),

    // Interest (for Net Income)
    expenseInterest: z.number(),
});

export type FinancialPeriod = z.infer<typeof FinancialPeriodSchema>;

// =============================================================================
// 2.4 MARKET DATA SCHEMA (STR)
// =============================================================================
export const MarketDataSchema = z.object({
    id: z.string().uuid(),
    hotelId: z.string().uuid(),
    period: z.coerce.date(),

    occupancyMyProp: z.number().min(0).max(1),
    occupancyCompSet: z.number().min(0).max(1),
    occupancyMarket: z.number().min(0).max(1).optional(),

    adrMyProp: z.number(),
    adrCompSet: z.number(),

    revparMyProp: z.number(),
    revparCompSet: z.number(),
});

export type MarketData = z.infer<typeof MarketDataSchema>;

// =============================================================================
// 2.5 PROFORMA SCHEMA (Multi-Year)
// =============================================================================
export const ProformaYearSchema = z.object({
    id: z.string().uuid(),
    hotelId: z.string().uuid(),
    year: z.number().int(),
    yearType: z.enum(['HISTORICAL', 'FORECAST', 'PROFORMA']),

    occupancy: z.number(),
    adr: z.number(),
    revpar: z.number(),
    totalRevenue: z.number(),
    departmentalProfit: z.number(),
    undistributedExpenses: z.number(),
    grossOperatingProfit: z.number(),
    managementFees: z.number(),
    nonOperatingExpenses: z.number(),
    ebitda: z.number(),
    ffeReserve: z.number(),
    noi: z.number(),
});

export type ProformaYear = z.infer<typeof ProformaYearSchema>;

// =============================================================================
// 2.6 VALUATION SCHEMA
// =============================================================================
export const ValuationSchema = z.object({
    id: z.string().uuid(),
    hotelId: z.string().uuid(),
    valuationDate: z.coerce.date(),
    appraisedValue: z.number(),
    capRate: z.number(),
    valuationMethod: z.enum(['INCOME', 'SALES_COMPARISON', 'COST']).optional(),
});

export type Valuation = z.infer<typeof ValuationSchema>;

// =============================================================================
// 2.7 INVESTMENT SUMMARY SCHEMA
// =============================================================================
export const InvestmentSummarySchema = z.object({
    id: z.string().uuid(),
    loanId: z.string().uuid(),
    purchasePrice: z.number(),
    irr: z.number(),
    roi: z.number().optional(),
    cashOnCash: z.number().optional(),
    capRateAtPurchase: z.number(),
    netCashFlowAfterDebt: z.number(),
});

export type InvestmentSummary = z.infer<typeof InvestmentSummarySchema>;

// =============================================================================
// COMPUTED RESULTS (Output Types)
// =============================================================================
export interface HotelOperatingMetrics {
    occupancy: number;
    adr: number;
    revpar: number;
    totalRevenue: number;
    totalDeptExpenses: number;
    departmentalProfit: number;
    totalUndistributedExpenses: number;
    grossOperatingProfit: number;
    totalNonOperating: number;
    ebitda: number;
    noi: number;
    netIncome: number;
}

export interface LoanPerformanceMetrics {
    annualDebtService: number;
    dscr: number;
    debtYield: number;
    ltv: number | null; // Null if no valuation
    loanPerKey: number;
    covenantDSCRStatus: 'PASS' | 'FAIL';
    covenantDebtYieldStatus: 'PASS' | 'FAIL';
}

export interface STRIndexes {
    mpi: number; // Market Penetration Index (Occ)
    ari: number; // Average Rate Index (ADR)
    rgi: number; // Revenue Generation Index (RevPAR)
}

export interface VarianceResult {
    varianceDollar: number;
    variancePercent: number;
}
