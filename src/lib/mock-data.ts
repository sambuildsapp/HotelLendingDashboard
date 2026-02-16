/**
 * Hotel Lending Management System - Mock Data
 * Phase 2: Domain Core - 5 Sample Loan Profiles
 * 
 * These are the test fixtures for verification.
 */

import type { Loan, Hotel, FinancialPeriod, MarketData, Valuation } from './types';
import { v4 as uuidv4 } from 'uuid';

// Generate consistent UUIDs for testing
const LOAN_IDS = {
    GRAND_PLAZA: '11111111-1111-1111-1111-111111111111',
    OCEANVIEW: '22222222-2222-2222-2222-222222222222',
    BOUTIQUE_BRIDGE: '33333333-3333-3333-3333-333333333333',
    HIGHWAY_PORTFOLIO: '44444444-4444-4444-4444-444444444444',
    SUBURBAN_DISTRESSED: '55555555-5555-5555-5555-555555555555',
};

const HOTEL_IDS = {
    GRAND_PLAZA_HOTEL: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    OCEANVIEW_RESORT: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    BOUTIQUE_45: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    HIGHWAY_BUDGET: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    HIGHWAY_AIRPORT: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    HIGHWAY_ROADSIDE: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    SUBURBAN_INN: '00000000-0000-0000-0000-000000000000',
};

// =============================================================================
// LOANS
// =============================================================================
export const mockLoans: Loan[] = [
    // 1. Grand Plaza Fixed - Performing, high DSCR
    {
        id: LOAN_IDS.GRAND_PLAZA,
        name: 'Grand Plaza Fixed',
        borrower: {
            name: 'Plaza Hospitality LLC',
            contactName: 'John Smith',
            contactEmail: 'jsmith@plazahospitality.com',
        },
        terms: {
            originalPrincipal: 50000000,
            currentBalance: 45000000,
            interestType: 'FIXED',
            interestRate: 0.045, // 4.5%
            originationDate: new Date('2024-01-15'),
            maturityDate: new Date('2029-01-15'),
            originalTermMonths: 60,
            amortizationTermMonths: 360,
            isRecourse: false,
            prepaymentAllowed: true,
            yieldMaintenance: 0.02,
            reserveRequirementPct: 0.04,
            fiveYearCapitalPlan: 5000000,
        },
        covenants: {
            minDSCR: 1.25,
            minDebtYield: 0.08,
        },
        hotelIds: [HOTEL_IDS.GRAND_PLAZA_HOTEL],
        status: 'PERFORMING',
    },

    // 2. Oceanview Floater - Watchlist, rate pressure
    {
        id: LOAN_IDS.OCEANVIEW,
        name: 'Oceanview Floater',
        borrower: {
            name: 'Coastal Resorts Inc',
            contactName: 'Maria Garcia',
            contactEmail: 'mgarcia@coastalresorts.com',
        },
        terms: {
            originalPrincipal: 75000000,
            currentBalance: 72000000,
            interestType: 'FLOATING',
            interestRate: 0.03, // SOFR + 3.0%
            sofrRate: 0.0525, // Current SOFR 5.25%
            originationDate: new Date('2025-06-01'),
            maturityDate: new Date('2028-06-01'),
            originalTermMonths: 36,
            amortizationTermMonths: 360,
            isRecourse: true,
            prepaymentAllowed: false,
            reserveRequirementPct: 0.04,
        },
        covenants: {
            minDSCR: 1.20,
            minDebtYield: 0.085,
        },
        hotelIds: [HOTEL_IDS.OCEANVIEW_RESORT],
        status: 'WATCHLIST',
    },

    // 3. Boutique Bridge - Default, underperforming
    {
        id: LOAN_IDS.BOUTIQUE_BRIDGE,
        name: 'Boutique Bridge',
        borrower: {
            name: 'Urban Style Hotels',
            contactName: 'David Chen',
            contactEmail: 'dchen@urbanstyle.com',
        },
        terms: {
            originalPrincipal: 25000000,
            currentBalance: 25000000,
            interestType: 'FLOATING',
            interestRate: 0.04, // SOFR + 4.0%
            sofrRate: 0.0525,
            originationDate: new Date('2025-07-01'),
            maturityDate: new Date('2027-07-01'),
            originalTermMonths: 24,
            amortizationTermMonths: 1, // Interest only (1 to pass validation)
            isRecourse: true,
            prepaymentAllowed: true,
            reserveRequirementPct: 0.04,
        },
        covenants: {
            minDSCR: 1.10,
            minDebtYield: 0.075,
        },
        hotelIds: [HOTEL_IDS.BOUTIQUE_45],
        status: 'DEFAULT',
    },

    // 4. Highway Portfolio - 3 hotels, mixed performance
    {
        id: LOAN_IDS.HIGHWAY_PORTFOLIO,
        name: 'Highway Portfolio',
        borrower: {
            name: 'Interstate Lodging Corp',
            contactName: 'Sarah Johnson',
            contactEmail: 'sjohnson@interstatelodging.com',
        },
        terms: {
            originalPrincipal: 35000000,
            currentBalance: 32000000,
            interestType: 'FIXED',
            interestRate: 0.05, // 5.0%
            originationDate: new Date('2023-09-01'),
            maturityDate: new Date('2028-09-01'),
            originalTermMonths: 60,
            amortizationTermMonths: 300,
            isRecourse: false,
            prepaymentAllowed: true,
            reserveRequirementPct: 0.04,
        },
        covenants: {
            minDSCR: 1.30,
            minDebtYield: 0.09,
        },
        hotelIds: [HOTEL_IDS.HIGHWAY_BUDGET, HOTEL_IDS.HIGHWAY_AIRPORT, HOTEL_IDS.HIGHWAY_ROADSIDE],
        status: 'PERFORMING',
    },

    // 5. Suburban Distressed - Default, severe underperformance
    {
        id: LOAN_IDS.SUBURBAN_DISTRESSED,
        name: 'Suburban Distressed',
        borrower: {
            name: 'Legacy Hotels LLC',
            contactName: 'Robert Williams',
            contactEmail: 'rwilliams@legacyhotels.com',
        },
        terms: {
            originalPrincipal: 20000000,
            currentBalance: 19500000,
            interestType: 'FLOATING',
            interestRate: 0.04, // SOFR + 4.0%
            sofrRate: 0.0525,
            originationDate: new Date('2025-03-01'),
            maturityDate: new Date('2028-03-01'),
            originalTermMonths: 36,
            amortizationTermMonths: 360,
            isRecourse: true,
            prepaymentAllowed: false,
            reserveRequirementPct: 0.04,
        },
        covenants: {
            minDSCR: 1.15,
            minDebtYield: 0.08,
        },
        hotelIds: [HOTEL_IDS.SUBURBAN_INN],
        status: 'DEFAULT',
    },
];

// =============================================================================
// HOTELS
// =============================================================================
export const mockHotels: Hotel[] = [
    {
        id: HOTEL_IDS.GRAND_PLAZA_HOTEL,
        name: 'Grand Plaza City Center',
        address: '100 Main Street, New York, NY 10001',
        keyCount: 300,
        yearBuilt: 2005,
        yearRenovated: 2020,
        brand: 'Marriott',
        managementCompany: 'Aimbridge Hospitality',
        assetManager: 'Jane Doe',
        loanId: LOAN_IDS.GRAND_PLAZA,
    },
    {
        id: HOTEL_IDS.OCEANVIEW_RESORT,
        name: 'Oceanview Luxury Resort',
        address: '1 Beach Road, Miami, FL 33139',
        keyCount: 200,
        yearBuilt: 2015,
        brand: 'Ritz-Carlton',
        managementCompany: 'Hersha Hospitality',
        assetManager: 'Michael Brown',
        loanId: LOAN_IDS.OCEANVIEW,
    },
    {
        id: HOTEL_IDS.BOUTIQUE_45,
        name: 'Boutique 45',
        address: '45 Fashion Avenue, Los Angeles, CA 90028',
        keyCount: 150,
        yearBuilt: 1985,
        yearRenovated: 2023,
        brand: 'Independent',
        managementCompany: 'Crescent Hotels',
        assetManager: 'Emily Davis',
        loanId: LOAN_IDS.BOUTIQUE_BRIDGE,
    },
    {
        id: HOTEL_IDS.HIGHWAY_BUDGET,
        name: 'Budget Inn - Highway 99',
        address: '500 Highway 99, Sacramento, CA 95823',
        keyCount: 80,
        yearBuilt: 1995,
        brand: 'Days Inn',
        managementCompany: 'G6 Hospitality',
        assetManager: 'Tom Wilson',
        loanId: LOAN_IDS.HIGHWAY_PORTFOLIO,
    },
    {
        id: HOTEL_IDS.HIGHWAY_AIRPORT,
        name: 'Airport Suites',
        address: '200 Airport Blvd, Sacramento, CA 95837',
        keyCount: 120,
        yearBuilt: 2008,
        brand: 'Hampton Inn',
        managementCompany: 'Remington Hotels',
        assetManager: 'Tom Wilson',
        loanId: LOAN_IDS.HIGHWAY_PORTFOLIO,
    },
    {
        id: HOTEL_IDS.HIGHWAY_ROADSIDE,
        name: 'Roadside Inn',
        address: '1000 Interstate Dr, Fresno, CA 93721',
        keyCount: 60,
        yearBuilt: 1990,
        brand: 'Motel 6',
        managementCompany: 'G6 Hospitality',
        assetManager: 'Tom Wilson',
        loanId: LOAN_IDS.HIGHWAY_PORTFOLIO,
    },
    {
        id: HOTEL_IDS.SUBURBAN_INN,
        name: 'Suburban Inn & Suites',
        address: '750 Commerce Park, Atlanta, GA 30339',
        keyCount: 180,
        yearBuilt: 1998,
        brand: 'Holiday Inn Express',
        managementCompany: 'Interstate Hotels',
        assetManager: 'Lisa Anderson',
        loanId: LOAN_IDS.SUBURBAN_DISTRESSED,
    },
];

// =============================================================================
// FINANCIAL PERIODS (Annual totals for simplicity)
// =============================================================================

/**
 * Helper to create annual financial data.
 * Revenue and expense values are designed to produce specific DSCR outcomes.
 */
function createAnnualFinancials(
    hotelId: string,
    year: number,
    scenario: 'ACTUAL' | 'BUDGET',
    keyCount: number,
    occupancy: number,
    adr: number,
    revenueMix: { fb: number; other: number; misc: number }, // as % of rooms
    expenseRatios: {
        roomsDept: number; fbDept: number; otherDept: number;
        undistributed: number; mgmtFees: number; nonOp: number; ffeReserve: number;
    }
): FinancialPeriod {
    const roomsAvailable = keyCount * 365;
    const roomsSold = Math.round(roomsAvailable * occupancy);
    const revenueRooms = roomsSold * adr;
    const revenueFB = revenueRooms * revenueMix.fb;
    const revenueOther = revenueRooms * revenueMix.other;
    const revenueMisc = revenueRooms * revenueMix.misc;
    const totalRevenue = revenueRooms + revenueFB + revenueOther + revenueMisc;

    return {
        id: uuidv4(),
        hotelId,
        period: new Date(`${year}-01-01`),
        scenario,
        roomsAvailable,
        roomsSold,
        revenueRooms,
        revenueFB,
        revenueOther,
        revenueMisc,
        expenseRoomsDept: revenueRooms * expenseRatios.roomsDept,
        expenseFBDept: revenueFB * 0.75, // 75% F&B expense ratio
        expenseOtherDept: revenueOther * 0.4,
        expenseAdminGeneral: totalRevenue * 0.07,
        expenseInfoTelecom: totalRevenue * 0.025,
        expenseSalesMarketing: totalRevenue * 0.12,
        expensePropertyOps: totalRevenue * 0.055,
        expenseUtilities: totalRevenue * 0.045,
        expenseManagementFees: totalRevenue * expenseRatios.mgmtFees,
        expenseRent: 0,
        expensePropertyTaxes: totalRevenue * 0.035,
        expenseInsurance: totalRevenue * 0.02,
        expenseOtherNonOp: totalRevenue * 0.005,
        expenseFFEReserve: totalRevenue * expenseRatios.ffeReserve,
        expenseInterest: 0, // Will be set based on loan
    };
}

export const mockFinancials: FinancialPeriod[] = [
    // Grand Plaza - Strong performer (DSCR ~2.1x target)
    createAnnualFinancials(
        HOTEL_IDS.GRAND_PLAZA_HOTEL, 2025, 'ACTUAL', 300, 0.78, 220,
        { fb: 0.25, other: 0.08, misc: 0.02 },
        { roomsDept: 0.28, fbDept: 0.75, otherDept: 0.4, undistributed: 0.315, mgmtFees: 0.03, nonOp: 0.06, ffeReserve: 0.04 }
    ),

    // Oceanview Resort - Watchlist (DSCR ~1.15x target, high costs)
    createAnnualFinancials(
        HOTEL_IDS.OCEANVIEW_RESORT, 2025, 'ACTUAL', 200, 0.68, 450,
        { fb: 0.40, other: 0.12, misc: 0.03 },
        { roomsDept: 0.32, fbDept: 0.78, otherDept: 0.45, undistributed: 0.32, mgmtFees: 0.035, nonOp: 0.065, ffeReserve: 0.04 }
    ),

    // Boutique 45 - Default (DSCR ~0.95x, renovation impact)
    createAnnualFinancials(
        HOTEL_IDS.BOUTIQUE_45, 2025, 'ACTUAL', 150, 0.55, 180,
        { fb: 0.15, other: 0.05, misc: 0.02 },
        { roomsDept: 0.35, fbDept: 0.80, otherDept: 0.5, undistributed: 0.35, mgmtFees: 0.03, nonOp: 0.07, ffeReserve: 0.04 }
    ),

    // Highway Portfolio - 3 hotels (mixed, aggregate DSCR ~1.45x)
    createAnnualFinancials(
        HOTEL_IDS.HIGHWAY_BUDGET, 2025, 'ACTUAL', 80, 0.72, 85,
        { fb: 0, other: 0.02, misc: 0.01 },
        { roomsDept: 0.25, fbDept: 0, otherDept: 0.3, undistributed: 0.28, mgmtFees: 0.025, nonOp: 0.055, ffeReserve: 0.04 }
    ),
    createAnnualFinancials(
        HOTEL_IDS.HIGHWAY_AIRPORT, 2025, 'ACTUAL', 120, 0.80, 135,
        { fb: 0.10, other: 0.03, misc: 0.01 },
        { roomsDept: 0.26, fbDept: 0.70, otherDept: 0.35, undistributed: 0.29, mgmtFees: 0.028, nonOp: 0.058, ffeReserve: 0.04 }
    ),
    createAnnualFinancials(
        HOTEL_IDS.HIGHWAY_ROADSIDE, 2025, 'ACTUAL', 60, 0.65, 70,
        { fb: 0, other: 0.01, misc: 0.005 },
        { roomsDept: 0.28, fbDept: 0, otherDept: 0.35, undistributed: 0.30, mgmtFees: 0.025, nonOp: 0.06, ffeReserve: 0.04 }
    ),

    // Suburban Distressed - Default (DSCR ~0.80x, declining market)
    createAnnualFinancials(
        HOTEL_IDS.SUBURBAN_INN, 2025, 'ACTUAL', 180, 0.52, 95,
        { fb: 0.08, other: 0.03, misc: 0.01 },
        { roomsDept: 0.35, fbDept: 0.80, otherDept: 0.5, undistributed: 0.36, mgmtFees: 0.03, nonOp: 0.075, ffeReserve: 0.04 }
    ),
];

// =============================================================================
// VALUATIONS
// =============================================================================
export const mockValuations: Valuation[] = [
    {
        id: uuidv4(),
        hotelId: HOTEL_IDS.GRAND_PLAZA_HOTEL,
        valuationDate: new Date('2025-06-01'),
        appraisedValue: 85000000,
        capRate: 0.055,
        valuationMethod: 'INCOME',
    },
    {
        id: uuidv4(),
        hotelId: HOTEL_IDS.OCEANVIEW_RESORT,
        valuationDate: new Date('2025-06-01'),
        appraisedValue: 95000000,
        capRate: 0.06,
        valuationMethod: 'INCOME',
    },
    {
        id: uuidv4(),
        hotelId: HOTEL_IDS.BOUTIQUE_45,
        valuationDate: new Date('2025-06-01'),
        appraisedValue: 28000000,
        capRate: 0.07,
        valuationMethod: 'INCOME',
    },
    // Highway Portfolio hotels
    {
        id: uuidv4(),
        hotelId: HOTEL_IDS.HIGHWAY_BUDGET,
        valuationDate: new Date('2025-06-01'),
        appraisedValue: 8000000,
        capRate: 0.09,
        valuationMethod: 'INCOME',
    },
    {
        id: uuidv4(),
        hotelId: HOTEL_IDS.HIGHWAY_AIRPORT,
        valuationDate: new Date('2025-06-01'),
        appraisedValue: 18000000,
        capRate: 0.08,
        valuationMethod: 'INCOME',
    },
    {
        id: uuidv4(),
        hotelId: HOTEL_IDS.HIGHWAY_ROADSIDE,
        valuationDate: new Date('2025-06-01'),
        appraisedValue: 5000000,
        capRate: 0.10,
        valuationMethod: 'INCOME',
    },
    // Suburban Distressed
    {
        id: uuidv4(),
        hotelId: HOTEL_IDS.SUBURBAN_INN,
        valuationDate: new Date('2025-06-01'),
        appraisedValue: 22000000,
        capRate: 0.085,
        valuationMethod: 'INCOME',
    },
];

// =============================================================================
// MARKET DATA (STR) - 18 Months of Historical Data
// =============================================================================

/**
 * Generate monthly market data for a hotel with realistic seasonal patterns.
 * Performance profiles:
 *   - OUTPERFORMER: Beats comp set (RGI > 100)
 *   - INLINE: Matches comp set (RGI ~100)
 *   - UNDERPERFORMER: Trails comp set (RGI < 100)
 */
function generateMonthlyMarketData(
    hotelId: string,
    baseOccupancy: number,
    baseADR: number,
    performanceProfile: 'OUTPERFORMER' | 'INLINE' | 'UNDERPERFORMER',
    seasonality: 'RESORT' | 'BUSINESS' | 'HIGHWAY'
): MarketData[] {
    const data: MarketData[] = [];

    // Seasonal multipliers by month (0 = Jan, 11 = Dec)
    const seasonalPatterns: Record<string, number[]> = {
        RESORT: [0.70, 0.75, 0.90, 0.95, 1.10, 1.20, 1.25, 1.20, 1.00, 0.85, 0.80, 0.85],
        BUSINESS: [0.85, 0.90, 1.00, 1.05, 1.05, 0.90, 0.80, 0.85, 1.00, 1.05, 1.00, 0.75],
        HIGHWAY: [0.80, 0.82, 0.90, 0.95, 1.05, 1.15, 1.20, 1.15, 1.00, 0.95, 0.85, 0.80],
    };

    // Performance multiplier relative to comp set
    const perfMultipliers: Record<string, { occ: number; adr: number }> = {
        OUTPERFORMER: { occ: 1.08, adr: 1.06 },
        INLINE: { occ: 1.00, adr: 1.00 },
        UNDERPERFORMER: { occ: 0.88, adr: 0.92 },
    };

    const pattern = seasonalPatterns[seasonality];
    const perf = perfMultipliers[performanceProfile];

    // Generate 18 months: Jan 2024 - Jun 2025
    for (let i = 0; i < 18; i++) {
        const year = i < 12 ? 2024 : 2025;
        const month = i < 12 ? i : i - 12;
        const period = new Date(year, month, 1);

        // Add slight random variance (-2% to +2%)
        const variance = 0.98 + Math.random() * 0.04;
        const seasonalMult = pattern[month] * variance;

        // Comp set values (baseline)
        const occupancyCompSet = Math.min(0.95, baseOccupancy * seasonalMult);
        const adrCompSet = baseADR * (0.95 + seasonalMult * 0.1); // ADR varies less than occ
        const revparCompSet = occupancyCompSet * adrCompSet;

        // My property values
        const occupancyMyProp = Math.min(0.98, occupancyCompSet * perf.occ);
        const adrMyProp = adrCompSet * perf.adr;
        const revparMyProp = occupancyMyProp * adrMyProp;

        data.push({
            id: uuidv4(),
            hotelId,
            period,
            occupancyMyProp,
            occupancyCompSet,
            adrMyProp,
            adrCompSet,
            revparMyProp,
            revparCompSet,
        });
    }

    return data;
}

export const mockMarketData: MarketData[] = [
    // Grand Plaza - OUTPERFORMER, Business hotel pattern
    ...generateMonthlyMarketData(
        HOTEL_IDS.GRAND_PLAZA_HOTEL,
        0.72, // Base occupancy
        210, // Base ADR
        'OUTPERFORMER',
        'BUSINESS'
    ),

    // Oceanview Resort - INLINE (watchlist = slipping), Resort pattern
    ...generateMonthlyMarketData(
        HOTEL_IDS.OCEANVIEW_RESORT,
        0.65,
        430,
        'INLINE',
        'RESORT'
    ),

    // Boutique 45 - UNDERPERFORMER (default), Business pattern
    ...generateMonthlyMarketData(
        HOTEL_IDS.BOUTIQUE_45,
        0.60,
        170,
        'UNDERPERFORMER',
        'BUSINESS'
    ),

    // Highway Budget - INLINE, Highway pattern
    ...generateMonthlyMarketData(
        HOTEL_IDS.HIGHWAY_BUDGET,
        0.68,
        80,
        'INLINE',
        'HIGHWAY'
    ),

    // Highway Airport - OUTPERFORMER, Business pattern
    ...generateMonthlyMarketData(
        HOTEL_IDS.HIGHWAY_AIRPORT,
        0.75,
        130,
        'OUTPERFORMER',
        'BUSINESS'
    ),

    // Highway Roadside - INLINE, Highway pattern
    ...generateMonthlyMarketData(
        HOTEL_IDS.HIGHWAY_ROADSIDE,
        0.62,
        65,
        'INLINE',
        'HIGHWAY'
    ),

    // Suburban Distressed - UNDERPERFORMER (severe), Business pattern
    ...generateMonthlyMarketData(
        HOTEL_IDS.SUBURBAN_INN,
        0.58,
        90,
        'UNDERPERFORMER',
        'BUSINESS'
    ),
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get market data for a specific hotel.
 */
export function getMarketDataByHotelId(hotelId: string): MarketData[] {
    return mockMarketData.filter(d => d.hotelId === hotelId)
        .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
}

/**
 * Get the latest market data for a hotel.
 */
export function getLatestMarketData(hotelId: string): MarketData | undefined {
    const data = getMarketDataByHotelId(hotelId);
    return data.length > 0 ? data[data.length - 1] : undefined;
}

// Export IDs for reference
export { LOAN_IDS, HOTEL_IDS };
