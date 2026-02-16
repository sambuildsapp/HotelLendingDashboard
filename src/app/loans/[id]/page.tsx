'use client';

import { useParams } from 'next/navigation';
import { mockLoans, mockHotels, mockFinancials, mockValuations } from '@/lib/mock-data';
import {
    calculateLoanPerformance,
    calculateOperatingMetrics,
    aggregateAnnualMetrics,
    calculateRemainingTermMonths,
    formatCurrency,
    formatPercent,
    formatRatio
} from '@/lib/calculations';
import Link from 'next/link';

export default function LoanDetailPage() {
    const params = useParams();
    const loanId = params.id as string;

    // Find the loan
    const loan = mockLoans.find(l => l.id === loanId);

    if (!loan) {
        return (
            <div>
                <header className="page-header">
                    <h1 className="page-title">Loan Not Found</h1>
                    <Link href="/" style={{ color: 'var(--status-info)' }}>← Back to Dashboard</Link>
                </header>
            </div>
        );
    }

    // Get related data
    const loanHotels = mockHotels.filter(h => loan.hotelIds.includes(h.id));
    const loanFinancials = mockFinancials.filter(f =>
        loanHotels.some(h => h.id === f.hotelId) && f.scenario === 'ACTUAL'
    );
    const annualMetrics = aggregateAnnualMetrics(loanFinancials);
    const valuation = mockValuations.find(v => loanHotels.some(h => h.id === v.hotelId));
    const performance = calculateLoanPerformance(loan, annualMetrics.noi, loanHotels, valuation);

    const effectiveRate = loan.terms.interestType === 'FLOATING' && loan.terms.sofrRate
        ? loan.terms.interestRate + loan.terms.sofrRate
        : loan.terms.interestRate;

    return (
        <>
            <header className="page-header">
                <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none', marginBottom: '8px', display: 'block' }}>
                    ← Back to Dashboard
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h1 className="page-title">{loan.name}</h1>
                    <span className={`status-badge ${loan.status.toLowerCase()}`}>
                        <span className={`status-dot ${loan.status.toLowerCase()}`}></span>
                        {loan.status}
                    </span>
                </div>
                <p className="page-subtitle">{loan.borrower.name}</p>
            </header>

            {/* KPI Summary */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Current Balance</span>
                    <span className="stat-value">{formatCurrency(loan.terms.currentBalance)}</span>
                    <span className="stat-change" style={{ color: 'var(--text-muted)' }}>
                        of {formatCurrency(loan.terms.originalPrincipal)}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">DSCR</span>
                    <span className="stat-value" style={{
                        color: performance.dscr >= 1.2 ? 'var(--status-success)' :
                            performance.dscr >= 1.0 ? 'var(--status-warning)' :
                                'var(--status-danger)'
                    }}>
                        {formatRatio(performance.dscr)}
                    </span>
                    <span className="stat-change" style={{
                        color: performance.covenantDSCRStatus === 'PASS' ? 'var(--status-success)' : 'var(--status-danger)'
                    }}>
                        {performance.covenantDSCRStatus === 'PASS' ? '✓ Covenant Pass' : '✗ Covenant Breach'}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Debt Yield</span>
                    <span className="stat-value">{formatPercent(performance.debtYield)}</span>
                    <span className="stat-change" style={{ color: 'var(--text-muted)' }}>
                        Min: {formatPercent(loan.covenants.minDebtYield)}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">LTV</span>
                    <span className="stat-value">
                        {performance.ltv !== null ? formatPercent(performance.ltv) : 'N/A'}
                    </span>
                    {valuation && (
                        <span className="stat-change" style={{ color: 'var(--text-muted)' }}>
                            Value: {formatCurrency(valuation.appraisedValue)}
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

                {/* Loan Terms Card */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Loan Terms</h2>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Interest Type</span>
                        <span className="metric-value">{loan.terms.interestType}</span>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Interest Rate</span>
                        <span className="metric-value">
                            {loan.terms.interestType === 'FLOATING'
                                ? `SOFR + ${formatPercent(loan.terms.interestRate)} = ${formatPercent(effectiveRate)}`
                                : formatPercent(effectiveRate)
                            }
                        </span>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Maturity Date</span>
                        <span className="metric-value">{loan.terms.maturityDate.toLocaleDateString()}</span>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Remaining Term</span>
                        <span className="metric-value">{calculateRemainingTermMonths(loan.terms.maturityDate)} months</span>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Recourse</span>
                        <span className="metric-value">{loan.terms.isRecourse ? 'Yes' : 'Non-Recourse'}</span>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Prepayment</span>
                        <span className="metric-value">
                            {loan.terms.prepaymentAllowed
                                ? loan.terms.yieldMaintenance
                                    ? `Allowed (${formatPercent(loan.terms.yieldMaintenance)} YM)`
                                    : 'Allowed'
                                : 'Locked Out'
                            }
                        </span>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Reserve Requirement</span>
                        <span className="metric-value">{formatPercent(loan.terms.reserveRequirementPct)}</span>
                    </div>
                </div>

                {/* Covenant Status Card */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Covenant Compliance</h2>
                    </div>

                    {/* DSCR Covenant */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span className="metric-label">DSCR Covenant</span>
                            <span className={`status-badge ${performance.covenantDSCRStatus === 'PASS' ? 'performing' : 'default'}`} style={{ fontSize: '11px' }}>
                                {performance.covenantDSCRStatus}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                {formatRatio(performance.dscr)}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                Min: {formatRatio(loan.covenants.minDSCR)}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className={`progress-fill ${performance.dscr >= loan.covenants.minDSCR ? 'success' : 'danger'}`}
                                style={{ width: `${Math.min((performance.dscr / loan.covenants.minDSCR) * 50, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Debt Yield Covenant */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span className="metric-label">Debt Yield Covenant</span>
                            <span className={`status-badge ${performance.covenantDebtYieldStatus === 'PASS' ? 'performing' : 'default'}`} style={{ fontSize: '11px' }}>
                                {performance.covenantDebtYieldStatus}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                {formatPercent(performance.debtYield)}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                Min: {formatPercent(loan.covenants.minDebtYield)}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className={`progress-fill ${performance.debtYield >= loan.covenants.minDebtYield ? 'success' : 'danger'}`}
                                style={{ width: `${Math.min((performance.debtYield / loan.covenants.minDebtYield) * 50, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hotels Table */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                    <h2 className="card-title">Collateral Hotels</h2>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {loanHotels.length} hotel{loanHotels.length > 1 ? 's' : ''} • {loanHotels.reduce((s, h) => s + h.keyCount, 0)} total keys
                    </span>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Hotel Name</th>
                            <th>Location</th>
                            <th>Brand</th>
                            <th style={{ textAlign: 'right' }}>Keys</th>
                            <th style={{ textAlign: 'right' }}>Year Built</th>
                            <th style={{ textAlign: 'right' }}>Loan/Key</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loanHotels.map(hotel => (
                            <tr key={hotel.id}>
                                <td className="cell-primary">{hotel.name}</td>
                                <td className="cell-secondary">{hotel.address}</td>
                                <td>{hotel.brand}</td>
                                <td className="cell-mono" style={{ textAlign: 'right' }}>{hotel.keyCount}</td>
                                <td className="cell-mono" style={{ textAlign: 'right' }}>
                                    {hotel.yearBuilt}
                                    {hotel.yearRenovated && <span style={{ color: 'var(--text-muted)' }}> (Ren. {hotel.yearRenovated})</span>}
                                </td>
                                <td className="cell-currency">
                                    {formatCurrency(loan.terms.currentBalance / loanHotels.reduce((s, h) => s + h.keyCount, 0))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Financial Summary */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Financial Performance (2025 Actual)</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                    {/* Revenue Side */}
                    <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)' }}>
                            Revenue
                        </h3>
                        <div className="metric-row">
                            <span className="metric-label">Total Revenue</span>
                            <span className="metric-value highlight">{formatCurrency(annualMetrics.totalRevenue)}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">Departmental Profit</span>
                            <span className="metric-value">{formatCurrency(annualMetrics.departmentalProfit)}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">GOP</span>
                            <span className="metric-value">{formatCurrency(annualMetrics.grossOperatingProfit)}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">EBITDA</span>
                            <span className="metric-value">{formatCurrency(annualMetrics.ebitda)}</span>
                        </div>
                        <div className="metric-row" style={{ borderBottom: '2px solid var(--border-secondary)' }}>
                            <span className="metric-label" style={{ fontWeight: 600 }}>NOI</span>
                            <span className="metric-value" style={{ color: 'var(--status-success)' }}>
                                {formatCurrency(annualMetrics.noi)}
                            </span>
                        </div>
                    </div>

                    {/* Key Ratios */}
                    <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)' }}>
                            Key Ratios
                        </h3>
                        <div className="metric-row">
                            <span className="metric-label">Occupancy</span>
                            <span className="metric-value">{formatPercent(annualMetrics.occupancy)}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">ADR</span>
                            <span className="metric-value">{formatCurrency(annualMetrics.adr)}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">RevPAR</span>
                            <span className="metric-value">{formatCurrency(annualMetrics.revpar)}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">GOP Margin</span>
                            <span className="metric-value">
                                {formatPercent(annualMetrics.grossOperatingProfit / annualMetrics.totalRevenue)}
                            </span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">NOI Margin</span>
                            <span className="metric-value">
                                {formatPercent(annualMetrics.noi / annualMetrics.totalRevenue)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
