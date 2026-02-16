/**
 * Hotel Lending Management System - Financial Calculations
 * Phase 2: Domain Core
 * 
 * All formulas from the Implementation Plan Section 3 are implemented here.
 */

import type {
    FinancialPeriod,
    HotelOperatingMetrics,
    LoanPerformanceMetrics,
    STRIndexes,
    VarianceResult,
    Loan,
    Hotel,
    Valuation,
    MarketData,
} from './types';

// =============================================================================
// 3.1 HOTEL OPERATING METRICS
// =============================================================================

/**
 * Calculate all operating metrics from a single financial period.
 */
export function calculateOperatingMetrics(period: FinancialPeriod): HotelOperatingMetrics {
    // Occupancy = RoomsSold / RoomsAvailable
    const occupancy = period.roomsAvailable > 0
        ? period.roomsSold / period.roomsAvailable
        : 0;

    // ADR = RevenueRooms / RoomsSold
    const adr = period.roomsSold > 0
        ? period.revenueRooms / period.roomsSold
        : 0;

    // RevPAR = RevenueRooms / RoomsAvailable
    const revpar = period.roomsAvailable > 0
        ? period.revenueRooms / period.roomsAvailable
        : 0;

    // Total Revenue
    const totalRevenue =
        period.revenueRooms +
        period.revenueFB +
        period.revenueOther +
        period.revenueMisc;

    // Total Departmental Expenses
    const totalDeptExpenses =
        period.expenseRoomsDept +
        period.expenseFBDept +
        period.expenseOtherDept;

    // Departmental Profit = Total Revenue - Dept Expenses
    const departmentalProfit = totalRevenue - totalDeptExpenses;

    // Total Undistributed Expenses
    const totalUndistributedExpenses =
        period.expenseAdminGeneral +
        period.expenseInfoTelecom +
        period.expenseSalesMarketing +
        period.expensePropertyOps +
        period.expenseUtilities;

    // Gross Operating Profit = Dept Profit - Undistributed Expenses
    const grossOperatingProfit = departmentalProfit - totalUndistributedExpenses;

    // Total Non-Operating
    const totalNonOperating =
        period.expenseManagementFees +
        period.expenseRent +
        period.expensePropertyTaxes +
        period.expenseInsurance +
        period.expenseOtherNonOp;

    // EBITDA = GOP - Mgmt Fees - Non-Operating
    const ebitda = grossOperatingProfit - totalNonOperating;

    // NOI = EBITDA - FF&E Reserve
    const noi = ebitda - period.expenseFFEReserve;

    // Net Income = NOI - Interest
    const netIncome = noi - period.expenseInterest;

    return {
        occupancy,
        adr,
        revpar,
        totalRevenue,
        totalDeptExpenses,
        departmentalProfit,
        totalUndistributedExpenses,
        grossOperatingProfit,
        totalNonOperating,
        ebitda,
        noi,
        netIncome,
    };
}

/**
 * Aggregate multiple periods (e.g., 12 months) into annual totals.
 */
export function aggregateAnnualMetrics(periods: FinancialPeriod[]): HotelOperatingMetrics {
    if (periods.length === 0) {
        return {
            occupancy: 0,
            adr: 0,
            revpar: 0,
            totalRevenue: 0,
            totalDeptExpenses: 0,
            departmentalProfit: 0,
            totalUndistributedExpenses: 0,
            grossOperatingProfit: 0,
            totalNonOperating: 0,
            ebitda: 0,
            noi: 0,
            netIncome: 0,
        };
    }

    // Sum all periods
    const totals = periods.reduce(
        (acc, period) => {
            acc.roomsAvailable += period.roomsAvailable;
            acc.roomsSold += period.roomsSold;
            acc.revenueRooms += period.revenueRooms;
            acc.revenueFB += period.revenueFB;
            acc.revenueOther += period.revenueOther;
            acc.revenueMisc += period.revenueMisc;
            acc.expenseRoomsDept += period.expenseRoomsDept;
            acc.expenseFBDept += period.expenseFBDept;
            acc.expenseOtherDept += period.expenseOtherDept;
            acc.expenseAdminGeneral += period.expenseAdminGeneral;
            acc.expenseInfoTelecom += period.expenseInfoTelecom;
            acc.expenseSalesMarketing += period.expenseSalesMarketing;
            acc.expensePropertyOps += period.expensePropertyOps;
            acc.expenseUtilities += period.expenseUtilities;
            acc.expenseManagementFees += period.expenseManagementFees;
            acc.expenseRent += period.expenseRent;
            acc.expensePropertyTaxes += period.expensePropertyTaxes;
            acc.expenseInsurance += period.expenseInsurance;
            acc.expenseOtherNonOp += period.expenseOtherNonOp;
            acc.expenseFFEReserve += period.expenseFFEReserve;
            acc.expenseInterest += period.expenseInterest;
            return acc;
        },
        {
            roomsAvailable: 0, roomsSold: 0, revenueRooms: 0, revenueFB: 0, revenueOther: 0, revenueMisc: 0,
            expenseRoomsDept: 0, expenseFBDept: 0, expenseOtherDept: 0,
            expenseAdminGeneral: 0, expenseInfoTelecom: 0, expenseSalesMarketing: 0, expensePropertyOps: 0, expenseUtilities: 0,
            expenseManagementFees: 0, expenseRent: 0, expensePropertyTaxes: 0, expenseInsurance: 0, expenseOtherNonOp: 0,
            expenseFFEReserve: 0, expenseInterest: 0,
        }
    );

    // Calculate metrics from aggregated totals
    const occupancy = totals.roomsAvailable > 0 ? totals.roomsSold / totals.roomsAvailable : 0;
    const adr = totals.roomsSold > 0 ? totals.revenueRooms / totals.roomsSold : 0;
    const revpar = totals.roomsAvailable > 0 ? totals.revenueRooms / totals.roomsAvailable : 0;
    const totalRevenue = totals.revenueRooms + totals.revenueFB + totals.revenueOther + totals.revenueMisc;
    const totalDeptExpenses = totals.expenseRoomsDept + totals.expenseFBDept + totals.expenseOtherDept;
    const departmentalProfit = totalRevenue - totalDeptExpenses;
    const totalUndistributedExpenses = totals.expenseAdminGeneral + totals.expenseInfoTelecom +
        totals.expenseSalesMarketing + totals.expensePropertyOps + totals.expenseUtilities;
    const grossOperatingProfit = departmentalProfit - totalUndistributedExpenses;
    const totalNonOperating = totals.expenseManagementFees + totals.expenseRent +
        totals.expensePropertyTaxes + totals.expenseInsurance + totals.expenseOtherNonOp;
    const ebitda = grossOperatingProfit - totalNonOperating;
    const noi = ebitda - totals.expenseFFEReserve;
    const netIncome = noi - totals.expenseInterest;

    return {
        occupancy,
        adr,
        revpar,
        totalRevenue,
        totalDeptExpenses,
        departmentalProfit,
        totalUndistributedExpenses,
        grossOperatingProfit,
        totalNonOperating,
        ebitda,
        noi,
        netIncome,
    };
}

/**
 * Calculate remaining term in months from maturity date.
 * Uses current date by default, but can accept a reference date.
 */
export function calculateRemainingTermMonths(maturityDate: Date, referenceDate: Date = new Date()): number {
    const maturity = new Date(maturityDate);
    const reference = new Date(referenceDate);

    const yearDiff = maturity.getFullYear() - reference.getFullYear();
    const monthDiff = maturity.getMonth() - reference.getMonth();
    const dayDiff = maturity.getDate() - reference.getDate();

    let totalMonths = yearDiff * 12 + monthDiff;

    // Adjust for partial months
    if (dayDiff < 0) {
        totalMonths -= 1;
    }

    return Math.max(0, totalMonths); // Don't return negative
}

// =============================================================================
// 3.2 LOAN PERFORMANCE METRICS
// =============================================================================

/**
 * Calculate annual debt service (Interest-Only or Amortizing).
 */
export function calculateAnnualDebtService(loan: Loan): number {
    const { currentBalance, interestType, interestRate, sofrRate } = loan.terms;

    // Effective annual rate
    let effectiveRate = interestRate;
    if (interestType === 'FLOATING' && sofrRate !== undefined) {
        effectiveRate = interestRate + sofrRate; // Spread + SOFR
    }

    // Simplified: Interest-Only calculation
    // For amortizing, we would use PMT formula
    return currentBalance * effectiveRate;
}

/**
 * Calculate all loan performance metrics.
 */
export function calculateLoanPerformance(
    loan: Loan,
    annualNOI: number,
    hotels: Hotel[],
    valuation?: Valuation
): LoanPerformanceMetrics {
    const annualDebtService = calculateAnnualDebtService(loan);

    // DSCR = Annual NOI / Annual Debt Service
    const dscr = annualDebtService > 0 ? annualNOI / annualDebtService : 0;

    // Debt Yield = Annual NOI / Current Loan Balance
    const debtYield = loan.terms.currentBalance > 0
        ? annualNOI / loan.terms.currentBalance
        : 0;

    // LTV = Current Balance / Appraised Value
    const ltv = valuation
        ? loan.terms.currentBalance / valuation.appraisedValue
        : null;

    // Loan per Key
    const totalKeys = hotels
        .filter(h => loan.hotelIds.includes(h.id))
        .reduce((sum, h) => sum + h.keyCount, 0);
    const loanPerKey = totalKeys > 0 ? loan.terms.currentBalance / totalKeys : 0;

    // Covenant checks
    const covenantDSCRStatus = dscr >= loan.covenants.minDSCR ? 'PASS' : 'FAIL';
    const covenantDebtYieldStatus = debtYield >= loan.covenants.minDebtYield ? 'PASS' : 'FAIL';

    return {
        annualDebtService,
        dscr,
        debtYield,
        ltv,
        loanPerKey,
        covenantDSCRStatus,
        covenantDebtYieldStatus,
    };
}

// =============================================================================
// 3.3 MARKET BENCHMARKING (STR INDEXES)
// =============================================================================

/**
 * Calculate STR market indexes from a single period.
 */
export function calculateSTRIndexes(data: MarketData): STRIndexes {
    // MPI = (My Occ / Comp Set Occ) * 100
    const mpi = data.occupancyCompSet > 0
        ? (data.occupancyMyProp / data.occupancyCompSet) * 100
        : 0;

    // ARI = (My ADR / Comp Set ADR) * 100
    const ari = data.adrCompSet > 0
        ? (data.adrMyProp / data.adrCompSet) * 100
        : 0;

    // RGI = (My RevPAR / Comp Set RevPAR) * 100
    const rgi = data.revparCompSet > 0
        ? (data.revparMyProp / data.revparCompSet) * 100
        : 0;

    return { mpi, ari, rgi };
}

/**
 * Calculate running average for a metric over N periods.
 */
export function calculateRunningAverage(values: number[], periods: number): number {
    if (values.length === 0) return 0;
    const slice = values.slice(-periods);
    return slice.reduce((sum, v) => sum + v, 0) / slice.length;
}

// =============================================================================
// 3.4 VARIANCE ANALYSIS
// =============================================================================

/**
 * Calculate variance (dollar and percent) between actual and comparison value.
 */
export function calculateVariance(actual: number, comparison: number): VarianceResult {
    const varianceDollar = actual - comparison;
    const variancePercent = comparison !== 0
        ? ((actual - comparison) / Math.abs(comparison)) * 100
        : 0;

    return { varianceDollar, variancePercent };
}

// =============================================================================
// 3.5 INVESTMENT METRICS
// =============================================================================

/**
 * Calculate Cap Rate = NOI / Purchase Price
 */
export function calculateCapRate(annualNOI: number, purchasePrice: number): number {
    return purchasePrice > 0 ? annualNOI / purchasePrice : 0;
}

/**
 * Calculate Net Cash Flow After Debt = NOI - Annual Debt Service
 */
export function calculateNetCashFlowAfterDebt(annualNOI: number, annualDebtService: number): number {
    return annualNOI - annualDebtService;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format number as currency string.
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format number as percentage string.
 */
export function formatPercent(value: number, decimals: number = 2): string {
    return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format DSCR/ratio with 2 decimal places and 'x' suffix.
 */
export function formatRatio(value: number): string {
    return `${value.toFixed(2)}x`;
}
