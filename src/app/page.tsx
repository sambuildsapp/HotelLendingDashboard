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

// Calculate portfolio summary
function getPortfolioSummary() {
  const loanData = getLoanDisplayData();

  const totalBalance = loanData.reduce((sum, l) => sum + l.terms.currentBalance, 0);
  const totalNOI = loanData.reduce((sum, l) => sum + l.annualNOI, 0);
  const avgDSCR = loanData.reduce((sum, l) => sum + l.dscr, 0) / loanData.length;
  const performing = loanData.filter(l => l.status === 'PERFORMING').length;
  const watchlist = loanData.filter(l => l.status === 'WATCHLIST').length;
  const defaulted = loanData.filter(l => l.status === 'DEFAULT').length;

  return {
    totalBalance,
    totalNOI,
    avgDSCR,
    loanCount: loanData.length,
    performing,
    watchlist,
    defaulted,
  };
}

export default function Dashboard() {
  const router = useRouter();
  const loanData = getLoanDisplayData();
  const summary = getPortfolioSummary();

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Portfolio Dashboard</h1>
        <p className="page-subtitle">
          Overview of {summary.loanCount} loans • {formatCurrency(summary.totalBalance)} total exposure
        </p>
      </header>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Loan Balance</span>
          <span className="stat-value">{formatCurrency(summary.totalBalance)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Annual NOI</span>
          <span className="stat-value">{formatCurrency(summary.totalNOI)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg. DSCR</span>
          <span className="stat-value">{formatRatio(summary.avgDSCR)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Status Breakdown</span>
          <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
            <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>
              {summary.performing} ✓
            </span>
            <span style={{ color: 'var(--status-warning)', fontWeight: 600 }}>
              {summary.watchlist} ⚠
            </span>
            <span style={{ color: 'var(--status-danger)', fontWeight: 600 }}>
              {summary.defaulted} ✗
            </span>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Loan Portfolio</h2>
            <p className="card-subtitle">Click a loan to view details</p>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Loan Name</th>
              <th>Status</th>
              <th>Hotels</th>
              <th style={{ textAlign: 'right' }}>Balance</th>
              <th style={{ textAlign: 'right' }}>NOI</th>
              <th style={{ textAlign: 'right' }}>DSCR</th>
              <th style={{ textAlign: 'center' }}>Covenant</th>
              <th style={{ textAlign: 'right' }}>Debt Yield</th>
              <th style={{ textAlign: 'right' }}>LTV</th>
            </tr>
          </thead>
          <tbody>
            {loanData.map(loan => (
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
                  {loan.hotels.length} hotel{loan.hotels.length > 1 ? 's' : ''} • {loan.totalKeys} keys
                </td>
                <td className="cell-currency">{formatCurrency(loan.terms.currentBalance)}</td>
                <td className="cell-currency">{formatCurrency(loan.annualNOI)}</td>
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
                <td className="cell-mono" style={{ textAlign: 'right' }}>
                  {loan.ltv !== null ? formatPercent(loan.ltv) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
