'use client';

import { mockLoans, mockHotels, mockFinancials, mockValuations } from '@/lib/mock-data';
import {
    calculateLoanPerformance,
    aggregateAnnualMetrics,
    formatCurrency,
    formatPercent,
    formatRatio
} from '@/lib/calculations';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Calculate all loan data for display
function getLoanDisplayData() {
    return mockLoans.map(loan => {
        const loanHotels = mockHotels.filter(h => loan.hotelIds.includes(h.id));
        const loanFinancials = mockFinancials.filter(f =>
            loanHotels.some(h => h.id === f.hotelId) && f.scenario === 'ACTUAL'
        );
        const annualMetrics = aggregateAnnualMetrics(loanFinancials);
        const valuation = mockValuations.find(v => loanHotels.some(h => h.id === v.hotelId));
        const performance = calculateLoanPerformance(loan, annualMetrics.noi, loanHotels, valuation);

        return {
            ...loan,
            hotels: loanHotels,
            totalKeys: loanHotels.reduce((sum, h) => sum + h.keyCount, 0),
            annualRevenue: annualMetrics.totalRevenue,
            annualNOI: annualMetrics.noi,
            ...performance,
        };
    });
}

export default function LoansPage() {
    const router = useRouter();
    const loanData = getLoanDisplayData();

    return (
        <>
            <header className="page-header">
                <h1 className="page-title">Loans</h1>
                <p className="page-subtitle">
                    All {loanData.length} loans in the portfolio
                </p>
            </header>

            {/* Loans Table */}
            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Loan Name</th>
                            <th>Status</th>
                            <th>Interest Type</th>
                            <th style={{ textAlign: 'right' }}>Balance</th>
                            <th style={{ textAlign: 'right' }}>Rate</th>
                            <th>Maturity</th>
                            <th style={{ textAlign: 'right' }}>DSCR</th>
                            <th style={{ textAlign: 'center' }}>Covenant</th>
                            <th style={{ textAlign: 'right' }}>Debt Yield</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loanData.map(loan => {
                            const effectiveRate = loan.terms.interestType === 'FLOATING' && loan.terms.sofrRate
                                ? loan.terms.interestRate + loan.terms.sofrRate
                                : loan.terms.interestRate;

                            return (
                                <tr
                                    key={loan.id}
                                    onClick={() => router.push(`/loans/${loan.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>
                                        <span className="cell-primary" style={{ color: 'inherit' }}>
                                            {loan.name}
                                        </span>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            {loan.borrower.name}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${loan.status.toLowerCase()}`}>
                                            <span className={`status-dot ${loan.status.toLowerCase()}`}></span>
                                            {loan.status}
                                        </span>
                                    </td>
                                    <td className="cell-secondary">
                                        {loan.terms.interestType}
                                        {loan.terms.interestType === 'FLOATING' && (
                                            <span style={{ color: 'var(--text-muted)' }}> (SOFR+)</span>
                                        )}
                                    </td>
                                    <td className="cell-currency">{formatCurrency(loan.terms.currentBalance)}</td>
                                    <td className="cell-mono" style={{ textAlign: 'right' }}>
                                        {formatPercent(effectiveRate)}
                                    </td>
                                    <td className="cell-secondary">
                                        {loan.terms.maturityDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="cell-mono" style={{
                                        textAlign: 'right',
                                        color: loan.dscr >= 1.2 ? 'var(--status-success)' :
                                            loan.dscr >= 1.0 ? 'var(--status-warning)' :
                                                'var(--status-danger)',
                                        fontWeight: 600
                                    }}>
                                        {formatRatio(loan.dscr)}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={`covenant-indicator ${loan.covenantDSCRStatus.toLowerCase()}`}>
                                            {loan.covenantDSCRStatus === 'PASS' ? '✓' : '✗'}
                                        </span>
                                    </td>
                                    <td className="cell-mono" style={{ textAlign: 'right' }}>
                                        {formatPercent(loan.debtYield)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}
