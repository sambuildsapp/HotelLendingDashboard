/**
 * Hotel Lending Management System - Excel Parser
 * Phase 3: Data Transport
 * 
 * Parses uploaded Excel files into typed data structures.
 */

import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import type { Loan, Hotel, FinancialPeriod } from './types';
import {
    validateSheetExists,
    validatePositiveInteger,
    validateNumber,
    combineValidations,
    formatValidationResults,
    type ValidationResult,
    type ValidationError,
} from './validation';

// =============================================================================
// TYPES
// =============================================================================
export interface ParsedLoanData {
    loan: Partial<Loan>;
    hotels: Partial<Hotel>[];
    financials: Partial<FinancialPeriod>[];
}

export interface ParseResult {
    success: boolean;
    data?: ParsedLoanData;
    validation: ValidationResult;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get cell value from sheet by address (e.g., "B3")
 */
function getCellValue(sheet: XLSX.WorkSheet, address: string): unknown {
    const cell = sheet[address];
    return cell ? cell.v : undefined;
}

/**
 * Get cell value by row/col index (0-indexed)
 */
function getCellByIndex(sheet: XLSX.WorkSheet, row: number, col: number): unknown {
    const address = XLSX.utils.encode_cell({ r: row, c: col });
    return getCellValue(sheet, address);
}

/**
 * Convert sheet to 2D array
 */
function sheetToArray(sheet: XLSX.WorkSheet): unknown[][] {
    return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
}

/**
 * Find row index by label in first column
 */
function findRowByLabel(data: unknown[][], label: string, colIndex: number = 1): number {
    for (let i = 0; i < data.length; i++) {
        if (data[i][colIndex]?.toString().toLowerCase().includes(label.toLowerCase())) {
            return i;
        }
    }
    return -1;
}

// =============================================================================
// SHEET PARSERS
// =============================================================================

/**
 * Parse Loan Performance Details sheet
 */
function parseLoanSheet(sheet: XLSX.WorkSheet): { data: Partial<Loan>; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const arr = sheetToArray(sheet);

    // Helper to get value by row label
    const getByLabel = (label: string, valueCol: number = 2): unknown => {
        const rowIndex = findRowByLabel(arr, label);
        if (rowIndex === -1) return undefined;
        return arr[rowIndex][valueCol];
    };

    // Parse loan name
    const loanName = getByLabel('loan name');

    // Parse borrower
    const borrowerName = getByLabel('borrower')?.toString();
    const borrowerContact = getByLabel('contact')?.toString();

    // Parse terms
    const originalPrincipal = Number(getByLabel('loan amount')) || 0;
    const currentBalance = Number(getByLabel('loan balance', 3)) || originalPrincipal;
    const interestType = getByLabel('interest type')?.toString().toUpperCase();
    const interestRate = Number(getByLabel('interest rate')) || 0;
    const originalTermMonths = Number(getByLabel('original term (months)')) || 60;
    const amortizationTermMonths = Number(getByLabel('amortization term (months)')) || 360;
    const isRecourse = getByLabel('recourse')?.toString().toLowerCase() === 'yes';
    const prepaymentAllowed = getByLabel('prepayment allowed')?.toString().toLowerCase() === 'yes';
    const reserveRequirementPct = Number(getByLabel('reserve requirement')) || 0.04;

    // Parse covenants
    const minDSCR = Number(getByLabel('dscr', 2)) || 1.20;
    const minDebtYield = Number(getByLabel('debt yield', 2)) || 0.08;

    // Validate
    const numError = validatePositiveInteger(originalPrincipal, 'Loan Amount', undefined, 'Loan Performance Details');
    if (numError) errors.push(numError);

    const data: Partial<Loan> = {
        id: uuidv4(),
        name: loanName?.toString() || 'Unnamed Loan',
        borrower: {
            name: borrowerName || 'Unknown Borrower',
            contactName: borrowerContact,
        },
        terms: {
            originalPrincipal,
            currentBalance,
            interestType: interestType === 'FLOATING' ? 'FLOATING' : 'FIXED',
            interestRate,
            originationDate: new Date(),
            maturityDate: new Date(Date.now() + originalTermMonths * 30 * 24 * 60 * 60 * 1000),
            originalTermMonths,
            amortizationTermMonths,
            isRecourse,
            prepaymentAllowed,
            reserveRequirementPct,
        },
        covenants: {
            minDSCR,
            minDebtYield,
        },
        hotelIds: [],
        status: 'PERFORMING',
    };

    return { data, errors };
}

/**
 * Parse Hotel P&L sheet
 */
function parsePnLSheet(
    sheet: XLSX.WorkSheet,
    sheetName: string
): { hotel: Partial<Hotel>; financials: Partial<FinancialPeriod>[]; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const arr = sheetToArray(sheet);

    // Helper to get value by row label
    const getByLabel = (label: string, valueCol: number = 2): unknown => {
        const rowIndex = findRowByLabel(arr, label);
        if (rowIndex === -1) return undefined;
        return arr[rowIndex][valueCol];
    };

    // Parse hotel info
    const hotelName = getByLabel('hotel name');
    const address = getByLabel('property address');
    const yearBuilt = Number(getByLabel('year built')) || 2000;
    const yearRenovated = Number(getByLabel('last renovated'));
    const keyCount = Number(getByLabel('number of keys')) || 100;
    const managementCompany = getByLabel('management company');
    const brand = getByLabel('brand');
    const assetManager = getByLabel('asset manager');

    // Validate
    const keyError = validatePositiveInteger(keyCount, 'Number of Keys', undefined, sheetName);
    if (keyError) errors.push(keyError);

    const hotelId = uuidv4();

    const hotel: Partial<Hotel> = {
        id: hotelId,
        name: hotelName?.toString() || 'Unknown Hotel',
        address: address?.toString() || '',
        keyCount,
        yearBuilt,
        yearRenovated: yearRenovated || undefined,
        brand: brand?.toString() || 'Independent',
        managementCompany: managementCompany?.toString() || '',
        assetManager: assetManager?.toString() || '',
        loanId: null,
    };

    // Parse financial data
    const roomsAvailable = Number(getByLabel('rooms available')) || 0;
    const roomsSold = Number(getByLabel('rooms sold')) || 0;
    const revenueRooms = Number(getByLabel('rooms', 2)) || 0;
    const revenueFB = Number(getByLabel('food and beverage', 2)) || 0;
    const revenueOther = Number(getByLabel('other operated', 2)) || 0;
    const revenueMisc = Number(getByLabel('miscellaneous', 2)) || 0;

    // Find expense rows (search in specific section)
    const expenseRoomsDept = Number(getByLabel('rooms', 2)) || 0; // Will need better targeting
    const expenseFBDept = Number(getByLabel('food and beverage', 2)) || 0;

    const financials: Partial<FinancialPeriod>[] = [{
        id: uuidv4(),
        hotelId,
        period: new Date(),
        scenario: 'ACTUAL',
        roomsAvailable,
        roomsSold,
        revenueRooms,
        revenueFB,
        revenueOther,
        revenueMisc,
        expenseRoomsDept: expenseRoomsDept * 0.28, // Approximation
        expenseFBDept: revenueFB * 0.75,
        expenseOtherDept: revenueOther * 0.4,
        expenseAdminGeneral: (revenueRooms + revenueFB + revenueOther + revenueMisc) * 0.07,
        expenseInfoTelecom: (revenueRooms + revenueFB + revenueOther + revenueMisc) * 0.025,
        expenseSalesMarketing: (revenueRooms + revenueFB + revenueOther + revenueMisc) * 0.12,
        expensePropertyOps: (revenueRooms + revenueFB + revenueOther + revenueMisc) * 0.055,
        expenseUtilities: (revenueRooms + revenueFB + revenueOther + revenueMisc) * 0.045,
        expenseManagementFees: (revenueRooms + revenueFB + revenueOther + revenueMisc) * 0.03,
        expenseRent: 0,
        expensePropertyTaxes: (revenueRooms + revenueFB + revenueOther + revenueMisc) * 0.035,
        expenseInsurance: (revenueRooms + revenueFB + revenueOther + revenueMisc) * 0.02,
        expenseOtherNonOp: 0,
        expenseFFEReserve: (revenueRooms + revenueFB + revenueOther + revenueMisc) * 0.04,
        expenseInterest: 0,
    }];

    return { hotel, financials, errors };
}

// =============================================================================
// MAIN PARSER
// =============================================================================

/**
 * Parse an Excel file buffer into structured data.
 */
export function parseExcelFile(buffer: Buffer): ParseResult {
    const allErrors: ValidationError[] = [];

    // Read workbook
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheetNames = wb.SheetNames;

    console.log(`📂 Found sheets: ${sheetNames.join(', ')}`);

    // Check for required sheet
    const loanSheetError = validateSheetExists(sheetNames, 'Loan Performance Details');
    if (loanSheetError) {
        allErrors.push(loanSheetError);
    }

    // Parse Loan sheet
    let loanData: Partial<Loan> = {};
    if (sheetNames.includes('Loan Performance Details')) {
        const loanSheet = wb.Sheets['Loan Performance Details'];
        const result = parseLoanSheet(loanSheet);
        loanData = result.data;
        allErrors.push(...result.errors);
    }

    // Parse P&L sheets (any sheet starting with "P&L")
    const hotels: Partial<Hotel>[] = [];
    const financials: Partial<FinancialPeriod>[] = [];

    for (const sheetName of sheetNames) {
        if (sheetName.startsWith('P&L')) {
            const sheet = wb.Sheets[sheetName];
            const result = parsePnLSheet(sheet, sheetName);
            hotels.push(result.hotel);
            financials.push(...result.financials);
            allErrors.push(...result.errors);

            // Link hotel to loan
            if (result.hotel.id && loanData.hotelIds) {
                loanData.hotelIds.push(result.hotel.id);
            }
        }
    }

    // Update loan with hotel IDs
    if (loanData.hotelIds === undefined) {
        loanData.hotelIds = hotels.map(h => h.id).filter((id): id is string => id !== undefined);
    }

    // Combine validation results
    const validation = combineValidations(allErrors.map(e => e));

    console.log(formatValidationResults(validation));

    return {
        success: validation.valid,
        data: {
            loan: loanData,
            hotels,
            financials,
        },
        validation,
    };
}

/**
 * Parse Excel file from file path (for scripts/testing).
 */
export function parseExcelFileFromPath(filepath: string): ParseResult {
    const fs = require('fs');
    const buffer = fs.readFileSync(filepath);
    return parseExcelFile(buffer);
}
