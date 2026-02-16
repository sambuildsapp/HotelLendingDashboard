/**
 * Hotel Lending Management System - Excel Fixture Generator
 * Phase 3: Data Transport
 * 
 * Generates sample Excel files for testing and verification.
 * 
 * Usage: npx tsx scripts/generate-excel-fixtures.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateAllWorkbooks } from '../src/lib/excel-generator';
import { mockLoans, mockHotels, mockFinancials, mockValuations } from '../src/lib/mock-data';

const OUTPUT_DIR = path.join(__dirname, '../src/data/excel-fixtures');

async function main() {
    console.log('🏨 Hotel Lending Excel Fixture Generator');
    console.log('=========================================\n');

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);
    }

    // Generate workbooks
    console.log('📊 Generating Excel workbooks...\n');

    const workbooks = generateAllWorkbooks(
        mockLoans,
        mockHotels,
        mockFinancials,
        mockValuations
    );

    // Write files
    let successCount = 0;
    for (const wb of workbooks) {
        const filepath = path.join(OUTPUT_DIR, wb.filename);
        fs.writeFileSync(filepath, wb.buffer);
        console.log(`  ✅ ${wb.filename}`);
        successCount++;
    }

    console.log(`\n✨ Generated ${successCount} Excel files in ${OUTPUT_DIR}`);

    // Summary
    console.log('\n📋 Summary:');
    for (const loan of mockLoans) {
        const hotels = mockHotels.filter(h => loan.hotelIds.includes(h.id));
        console.log(`  • ${loan.name}: ${hotels.length} hotel(s)`);
    }

    console.log('\n🎉 Done! Open the .xlsx files in Excel to verify structure.');
}

main().catch(console.error);
