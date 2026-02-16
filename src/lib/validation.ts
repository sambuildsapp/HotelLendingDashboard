/**
 * Hotel Lending Management System - Excel Validation
 * Phase 3: Data Transport
 * 
 * Validation rules for parsing uploaded Excel files.
 */

// =============================================================================
// TYPES
// =============================================================================
export interface ValidationError {
    ruleId: string;
    message: string;
    row?: number;
    col?: string;
    sheet?: string;
    severity: 'error' | 'warning';
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

// =============================================================================
// VALIDATION RULES
// =============================================================================

/**
 * V001: Check that a required sheet exists in the workbook.
 */
export function validateSheetExists(
    sheetNames: string[],
    requiredSheet: string
): ValidationError | null {
    if (!sheetNames.includes(requiredSheet)) {
        return {
            ruleId: 'V001',
            message: `Missing required sheet: '${requiredSheet}'`,
            severity: 'error',
        };
    }
    return null;
}

/**
 * V002: Validate that a value is a positive integer.
 */
export function validatePositiveInteger(
    value: unknown,
    fieldName: string,
    row?: number,
    sheet?: string
): ValidationError | null {
    if (value === null || value === undefined || value === '') {
        return {
            ruleId: 'V002',
            message: `Row ${row || '?'}: '${fieldName}' is required`,
            row,
            sheet,
            severity: 'error',
        };
    }

    const num = Number(value);
    if (!Number.isInteger(num) || num <= 0) {
        return {
            ruleId: 'V002',
            message: `Row ${row || '?'}: '${fieldName}' must be a positive integer, found '${value}'`,
            row,
            sheet,
            severity: 'error',
        };
    }
    return null;
}

/**
 * V003: Validate that a value is a number (or blank/zero).
 */
export function validateNumber(
    value: unknown,
    fieldName: string,
    row?: number,
    col?: string,
    sheet?: string
): ValidationError | null {
    if (value === null || value === undefined || value === '') {
        return null; // Blanks are OK for optional numbers
    }

    if (typeof value !== 'number' && isNaN(Number(value))) {
        return {
            ruleId: 'V003',
            message: `Row ${row || '?'}, Col ${col || '?'}: Expected number for '${fieldName}', found '${value}'`,
            row,
            col,
            sheet,
            severity: 'error',
        };
    }
    return null;
}

/**
 * V004: Validate that a date is parseable.
 */
export function validateDate(
    value: unknown,
    fieldName: string,
    row?: number,
    sheet?: string
): ValidationError | null {
    if (value === null || value === undefined || value === '') {
        return {
            ruleId: 'V004',
            message: `Unable to parse ${fieldName} date from row ${row || '?'}`,
            row,
            sheet,
            severity: 'error',
        };
    }

    // Excel dates can be numbers (serial date format) or strings
    let date: Date;
    if (typeof value === 'number') {
        // Excel serial date conversion (days since 1900-01-01)
        date = new Date((value - 25569) * 86400 * 1000);
    } else if (typeof value === 'string') {
        date = new Date(value);
    } else if (value instanceof Date) {
        date = value;
    } else {
        return {
            ruleId: 'V004',
            message: `Unable to parse ${fieldName} date from value '${value}'`,
            row,
            sheet,
            severity: 'error',
        };
    }

    if (isNaN(date.getTime())) {
        return {
            ruleId: 'V004',
            message: `Unable to parse ${fieldName} date from value '${value}'`,
            row,
            sheet,
            severity: 'error',
        };
    }

    return null;
}

/**
 * V005: Validate that total equals sum of components (with tolerance).
 */
export function validateSum(
    total: number,
    components: number[],
    fieldName: string,
    row?: number,
    sheet?: string,
    tolerance: number = 1
): ValidationError | null {
    const sum = components.reduce((a, b) => a + b, 0);
    const diff = Math.abs(total - sum);

    if (diff > tolerance) {
        return {
            ruleId: 'V005',
            message: `Row ${row || '?'}: ${fieldName} total (${total}) does not match sum of line items (${sum}). Difference: ${diff.toFixed(2)}`,
            row,
            sheet,
            severity: 'error',
        };
    }
    return null;
}

// =============================================================================
// AGGREGATED VALIDATION
// =============================================================================

/**
 * Combine multiple validation results into a single result.
 */
export function combineValidations(results: (ValidationError | null)[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    for (const result of results) {
        if (result) {
            if (result.severity === 'error') {
                errors.push(result);
            } else {
                warnings.push(result);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Format validation results for display.
 */
export function formatValidationResults(result: ValidationResult): string {
    if (result.valid && result.warnings.length === 0) {
        return '✅ Validation passed. No errors or warnings.';
    }

    const lines: string[] = [];

    if (result.errors.length > 0) {
        lines.push(`❌ ${result.errors.length} error(s):`);
        for (const error of result.errors) {
            lines.push(`  [${error.ruleId}] ${error.message}`);
        }
    }

    if (result.warnings.length > 0) {
        lines.push(`⚠️  ${result.warnings.length} warning(s):`);
        for (const warning of result.warnings) {
            lines.push(`  [${warning.ruleId}] ${warning.message}`);
        }
    }

    return lines.join('\n');
}
