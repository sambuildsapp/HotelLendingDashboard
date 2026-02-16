/**
 * Hotel Lending Management System - Round-Trip Test
 * Phase 3: Data Transport
 * 
 * Tests that generated Excel files can be parsed back correctly.
 * 
 * Usage: npx tsx scripts/test-excel-roundtrip.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseExcelFileFromPath } from '../src/lib/excel-parser';
import { formatValidationResults } from '../src/lib/validation';
import { mockLoans, mockHotels } from '../src/lib/mock-data';

const FIXTURE_DIR = path.join(__dirname, '../src/data/excel-fixtures');

interface TestResult {
    filename: string;
    passed: boolean;
    details: string[];
}

async function main() {
    console.log('🔄 Excel Round-Trip Test');
    console.log('========================\n');

    const results: TestResult[] = [];

    // Get all Excel files
    const files = fs.readdirSync(FIXTURE_DIR).filter(f => f.endsWith('.xlsx'));

    console.log(`📂 Found ${files.length} fixture files\n`);

    for (const file of files) {
        console.log(`\n📄 Testing: ${file}`);
        console.log('-'.repeat(40));

        const filepath = path.join(FIXTURE_DIR, file);
        const details: string[] = [];
        let passed = true;

        try {
            // Parse the file
            const result = parseExcelFileFromPath(filepath);

            // Check validation result
            if (!result.success) {
                passed = false;
                details.push(`Validation failed: ${result.validation.errors.length} errors`);
            } else {
                details.push('✅ Validation passed');
            }

            // Check parsed data
            if (result.data) {
                const { loan, hotels, financials } = result.data;

                // Loan checks
                if (loan.name) {
                    details.push(`  Loan: ${loan.name}`);
                } else {
                    passed = false;
                    details.push(`  ❌ Missing loan name`);
                }

                // Hotels check
                details.push(`  Hotels parsed: ${hotels.length}`);

                // Financials check
                details.push(`  Financial periods: ${financials.length}`);

                // Compare to expected
                const expectedLoan = mockLoans.find(l =>
                    file.toLowerCase().includes(l.name.split(' ')[0].toLowerCase())
                );

                if (expectedLoan) {
                    const expectedHotelCount = mockHotels.filter(h =>
                        expectedLoan.hotelIds.includes(h.id)
                    ).length;

                    if (hotels.length === expectedHotelCount) {
                        details.push(`  ✅ Hotel count matches (${expectedHotelCount})`);
                    } else {
                        details.push(`  ⚠️  Hotel count: ${hotels.length}, expected: ${expectedHotelCount}`);
                    }
                }
            }
        } catch (error) {
            passed = false;
            details.push(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        results.push({ filename: file, passed, details });

        for (const detail of details) {
            console.log(detail);
        }
    }

    // Summary
    console.log('\n\n📊 Test Summary');
    console.log('='.repeat(40));

    const passedCount = results.filter(r => r.passed).length;
    const failedCount = results.filter(r => !r.passed).length;

    console.log(`✅ Passed: ${passedCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`📁 Total:  ${results.length}`);

    if (failedCount > 0) {
        console.log('\n⚠️  Some tests failed. Review the output above for details.');
        process.exit(1);
    } else {
        console.log('\n🎉 All round-trip tests passed!');
    }
}

main().catch(console.error);
