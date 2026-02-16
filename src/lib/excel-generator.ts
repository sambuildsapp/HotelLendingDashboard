/**
 * Hotel Lending Management System - Excel Generator
 * Phase 3: Data Transport
 * 
 * Generates multi-sheet Excel workbooks from loan/hotel data.
 */

import * as XLSX from 'xlsx';
import type { Loan, Hotel, FinancialPeriod, Valuation } from './types';
import { calculateOperatingMetrics, calculateRemainingTermMonths, formatCurrency } from './calculations';

// =============================================================================
// TYPES
// =============================================================================
export interface ExcelGeneratorInput {
    loan: Loan;
    hotels: Hotel[];
    financials: FinancialPeriod[];
    valuations: Valuation[];
}

export interface GeneratedWorkbook {
    buffer: Buffer;
    filename: string;
}

// =============================================================================
// SHEET BUILDERS
// =============================================================================

/**
 * Build Loan Performance Details sheet
 */
function buildLoanSheet(loan: Loan, hotels: Hotel[]): XLSX.WorkSheet {
    const totalKeys = hotels.reduce((sum, h) => sum + h.keyCount, 0);
    const remainingMonths = calculateRemainingTermMonths(loan.terms.maturityDate);

    const effectiveRate = loan.terms.interestType === 'FLOATING' && loan.terms.sofrRate
        ? loan.terms.interestRate + loan.terms.sofrRate
        : loan.terms.interestRate;

    const data = [
        ['', 'Loan Information', '', '', 'Hotel Information'],
        [''],
        ['', 'Loan Name', loan.name, '', 'Hotels', hotels.map(h => h.name).join(', ')],
        ['', 'Borrower', loan.borrower.name, '', 'Total Keys', totalKeys],
        ['', 'Contact', loan.borrower.contactName || '', '', '', ''],
        [''],
        ['', 'Loan Terms', 'At Origination', 'Current', 'Definition'],
        ['', 'Loan Amount', loan.terms.originalPrincipal, '', 'Original principal amount'],
        ['', 'Loan/Key', loan.terms.originalPrincipal / totalKeys, '', 'Loan Amount / number of rooms'],
        ['', 'Loan Balance', '', loan.terms.currentBalance, 'Outstanding balance'],
        ['', 'Loan Balance/Key', '', loan.terms.currentBalance / totalKeys, 'Balance / number of rooms'],
        ['', 'Interest Type', loan.terms.interestType, '', 'Fixed or Floating'],
        ['', 'Interest Rate', loan.terms.interestRate, effectiveRate, 'Annual interest rate'],
        ['', 'Monthly Interest Rate', loan.terms.interestRate / 12, effectiveRate / 12, 'Annual / 12'],
        ['', 'Original Term (months)', loan.terms.originalTermMonths, '', 'Original term length'],
        ['', 'Remaining Term (months)', '', remainingMonths, 'Months until maturity'],
        ['', 'Amortization Term (months)', loan.terms.amortizationTermMonths, '', 'Amortization schedule'],
        ['', 'Recourse', loan.terms.isRecourse ? 'Yes' : 'No', '', 'Recourse loan'],
        ['', 'Prepayment Allowed', loan.terms.prepaymentAllowed ? 'Yes' : 'No', '', 'Prepayment permitted'],
        ['', 'Reserve Requirement', loan.terms.reserveRequirementPct, '', 'Required reserve %'],
        [''],
        ['', 'Covenants', 'Minimum', '', ''],
        ['', 'DSCR', loan.covenants.minDSCR, '', 'Debt Service Coverage Ratio'],
        ['', 'Debt Yield', loan.covenants.minDebtYield, '', 'Minimum Debt Yield'],
        [''],
        ['', 'Status', loan.status, '', ''],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
        { wch: 3 },   // A
        { wch: 28 },  // B - Label
        { wch: 18 },  // C - At Origination
        { wch: 18 },  // D - Current
        { wch: 40 },  // E - Definition
    ];

    return ws;
}

/**
 * Build Hotel Performance Details (P&L) sheet
 */
function buildPnLSheet(hotel: Hotel, financials: FinancialPeriod[]): XLSX.WorkSheet {
    // Get actual financials
    const actualPeriods = financials.filter(f => f.hotelId === hotel.id && f.scenario === 'ACTUAL');
    const period = actualPeriods[0]; // Most recent

    if (!period) {
        return XLSX.utils.aoa_to_sheet([['No financial data available']]);
    }

    const metrics = calculateOperatingMetrics(period);
    const totalRevenue = metrics.totalRevenue;

    // P&L format matching prototype
    const data = [
        ['', ''],
        ['', 'Hotel Information'],
        ['', 'Hotel Name', hotel.name],
        ['', 'Property Address', hotel.address],
        ['', 'Year Built', hotel.yearBuilt],
        ['', 'Last Renovated', hotel.yearRenovated || 'N/A'],
        ['', 'Number of Keys', hotel.keyCount],
        ['', 'Management Company', hotel.managementCompany],
        ['', 'Brand/Franchise', hotel.brand],
        ['', 'Asset Manager', hotel.assetManager],
        [''],
        ['', '', 'Annual', '%'],
        ['', 'Summary Operating Statement'],
        [''],
        ['', 'Rooms Available', period.roomsAvailable, ''],
        ['', 'Rooms Sold', period.roomsSold, ''],
        ['', 'Occupancy', metrics.occupancy, ''],
        ['', 'ADR', metrics.adr, ''],
        ['', 'RevPAR', metrics.revpar, ''],
        [''],
        ['', 'Operating Revenue'],
        ['', 'Rooms', period.revenueRooms, period.revenueRooms / totalRevenue],
        ['', 'Food and Beverage', period.revenueFB, period.revenueFB / totalRevenue],
        ['', 'Other Operated Departments', period.revenueOther, period.revenueOther / totalRevenue],
        ['', 'Miscellaneous Income', period.revenueMisc, period.revenueMisc / totalRevenue],
        [''],
        ['', 'Total Operating Revenue', totalRevenue, 1],
        [''],
        ['', 'Departmental Expenses'],
        ['', 'Rooms', period.expenseRoomsDept, period.expenseRoomsDept / period.revenueRooms],
        ['', 'Food and Beverage', period.expenseFBDept, period.revenueFB > 0 ? period.expenseFBDept / period.revenueFB : 0],
        ['', 'Other Operated Departments', period.expenseOtherDept, period.revenueOther > 0 ? period.expenseOtherDept / period.revenueOther : 0],
        [''],
        ['', 'Total Departmental Expenses', metrics.totalDeptExpenses, metrics.totalDeptExpenses / totalRevenue],
        [''],
        ['', 'Total Departmental Profit', metrics.departmentalProfit, metrics.departmentalProfit / totalRevenue],
        [''],
        ['', 'Undistributed Operating Expenses'],
        ['', 'Administrative and General', period.expenseAdminGeneral, period.expenseAdminGeneral / totalRevenue],
        ['', 'Information and Telecommunications', period.expenseInfoTelecom, period.expenseInfoTelecom / totalRevenue],
        ['', 'Sales and Marketing', period.expenseSalesMarketing, period.expenseSalesMarketing / totalRevenue],
        ['', 'Property Operation and Maintenance', period.expensePropertyOps, period.expensePropertyOps / totalRevenue],
        ['', 'Utilities', period.expenseUtilities, period.expenseUtilities / totalRevenue],
        [''],
        ['', 'Total Undistributed Expenses', metrics.totalUndistributedExpenses, metrics.totalUndistributedExpenses / totalRevenue],
        [''],
        ['', 'Gross Operating Profit', metrics.grossOperatingProfit, metrics.grossOperatingProfit / totalRevenue],
        [''],
        ['', 'Management Fees', period.expenseManagementFees, period.expenseManagementFees / totalRevenue],
        [''],
        ['', 'Non-Operating Income and Expenses'],
        ['', 'Rent', period.expenseRent, period.expenseRent / totalRevenue],
        ['', 'Property and Other Taxes', period.expensePropertyTaxes, period.expensePropertyTaxes / totalRevenue],
        ['', 'Insurance', period.expenseInsurance, period.expenseInsurance / totalRevenue],
        ['', 'Other', period.expenseOtherNonOp, period.expenseOtherNonOp / totalRevenue],
        [''],
        ['', 'Total Non-Operating', metrics.totalNonOperating, metrics.totalNonOperating / totalRevenue],
        [''],
        ['', 'EBITDA', metrics.ebitda, metrics.ebitda / totalRevenue],
        [''],
        ['', 'FF&E Reserve Contribution', period.expenseFFEReserve, period.expenseFFEReserve / totalRevenue],
        [''],
        ['', 'NOI (Net Operating Income)', metrics.noi, metrics.noi / totalRevenue],
        [''],
        ['', 'Interest', period.expenseInterest, period.expenseInterest / totalRevenue],
        [''],
        ['', 'Net Income', metrics.netIncome, metrics.netIncome / totalRevenue],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
        { wch: 3 },   // A
        { wch: 38 },  // B - Label
        { wch: 18 },  // C - Value
        { wch: 12 },  // D - %
    ];

    return ws;
}

/**
 * Build Valuation sheet
 */
function buildValuationSheet(hotels: Hotel[], valuations: Valuation[]): XLSX.WorkSheet {
    const data: (string | number | null)[][] = [
        ['', 'Valuation Summary'],
        [''],
        ['', 'Hotel', 'Valuation Date', 'Appraised Value', 'Cap Rate', 'Method'],
    ];

    for (const hotel of hotels) {
        const val = valuations.find(v => v.hotelId === hotel.id);
        if (val) {
            data.push([
                '',
                hotel.name,
                val.valuationDate.toISOString().split('T')[0],
                val.appraisedValue,
                val.capRate,
                val.valuationMethod || 'N/A',
            ]);
        } else {
            data.push(['', hotel.name, 'No valuation', null, null, null]);
        }
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
        { wch: 3 },
        { wch: 30 },
        { wch: 15 },
        { wch: 18 },
        { wch: 12 },
        { wch: 18 },
    ];

    return ws;
}

// =============================================================================
// MAIN GENERATOR
// =============================================================================

/**
 * Generate a complete Excel workbook for a loan.
 */
export function generateLoanWorkbook(input: ExcelGeneratorInput): GeneratedWorkbook {
    const { loan, hotels, financials, valuations } = input;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add Loan Performance Details sheet
    const loanSheet = buildLoanSheet(loan, hotels);
    XLSX.utils.book_append_sheet(wb, loanSheet, 'Loan Performance Details');

    // Add P&L sheet for each hotel
    for (const hotel of hotels) {
        const pnlSheet = buildPnLSheet(hotel, financials);
        const sheetName = `P&L - ${hotel.name.substring(0, 20)}`;
        XLSX.utils.book_append_sheet(wb, pnlSheet, sheetName);
    }

    // Add Valuation sheet
    const valSheet = buildValuationSheet(hotels, valuations);
    XLSX.utils.book_append_sheet(wb, valSheet, 'Valuation');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Generate filename
    const safeName = loan.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${safeName}.xlsx`;

    return { buffer, filename };
}

/**
 * Export all loans to separate Excel files.
 * Returns an array of generated workbooks.
 */
export function generateAllWorkbooks(
    loans: Loan[],
    hotels: Hotel[],
    financials: FinancialPeriod[],
    valuations: Valuation[]
): GeneratedWorkbook[] {
    return loans.map(loan => {
        const loanHotels = hotels.filter(h => loan.hotelIds.includes(h.id));
        const loanFinancials = financials.filter(f =>
            loanHotels.some(h => h.id === f.hotelId)
        );
        const loanValuations = valuations.filter(v =>
            loanHotels.some(h => h.id === v.hotelId)
        );

        return generateLoanWorkbook({
            loan,
            hotels: loanHotels,
            financials: loanFinancials,
            valuations: loanValuations,
        });
    });
}
