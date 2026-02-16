'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    mockHotels,
    mockLoans,
    mockFinancials,
    mockValuations,
    getMarketDataByHotelId,
    getLatestMarketData
} from '@/lib/mock-data';
import {
    aggregateAnnualMetrics,
    formatCurrency,
    formatPercent
} from '@/lib/calculations';
import { STRIndexCards, PerformanceMetrics } from '@/components/STRIndexCards';
import { RGITrendChart, OccupancyComparisonChart, ADRComparisonChart } from '@/components/STRChart';

export default function HotelDetailPage() {
    const params = useParams();
    const hotelId = params.id as string;

    // Find the hotel
    const hotel = mockHotels.find(h => h.id === hotelId);

    if (!hotel) {
        return (
            <div>
                <header className="page-header">
                    <h1 className="page-title">Hotel Not Found</h1>
                    <Link href="/hotels" style={{ color: 'var(--status-info)' }}>← Back to Hotels</Link>
                </header>
            </div>
        );
    }

    // Get related data
    const loan = mockLoans.find(l => l.id === hotel.loanId);
    const financials = mockFinancials.filter(f => f.hotelId === hotel.id && f.scenario === 'ACTUAL');
    const metrics = aggregateAnnualMetrics(financials);
    const valuation = mockValuations.find(v => v.hotelId === hotel.id);
    const marketData = getMarketDataByHotelId(hotel.id);
    const latestMarketData = getLatestMarketData(hotel.id);

    // Calculate STR indexes
    const mpi = latestMarketData && latestMarketData.occupancyCompSet > 0
        ? (latestMarketData.occupancyMyProp / latestMarketData.occupancyCompSet) * 100
        : null;
    const ari = latestMarketData && latestMarketData.adrCompSet > 0
        ? (latestMarketData.adrMyProp / latestMarketData.adrCompSet) * 100
        : null;
    const rgi = latestMarketData && latestMarketData.revparCompSet > 0
        ? (latestMarketData.revparMyProp / latestMarketData.revparCompSet) * 100
        : null;

    return (
        <>
            <header className="page-header">
                <Link href="/hotels" style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none', marginBottom: '8px', display: 'block' }}>
                    ← Back to Hotels
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h1 className="page-title">{hotel.name}</h1>
                    <span style={{
                        padding: '4px 12px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: 'var(--text-secondary)'
                    }}>
                        {hotel.brand}
                    </span>
                </div>
                <p className="page-subtitle">{hotel.address}</p>
            </header>

            {/* KPI Summary */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Keys</span>
                    <span className="stat-value">{hotel.keyCount}</span>
                    <span className="stat-change" style={{ color: 'var(--text-muted)' }}>
                        Built {hotel.yearBuilt}
                        {hotel.yearRenovated && ` • Ren. ${hotel.yearRenovated}`}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Occupancy</span>
                    <span className="stat-value">
                        {metrics.occupancy > 0 ? formatPercent(metrics.occupancy) : '—'}
                    </span>
                    <span className="stat-change" style={{
                        color: mpi && mpi >= 100 ? 'var(--status-success)' : 'var(--status-danger)'
                    }}>
                        {mpi ? `MPI: ${mpi.toFixed(0)}` : '—'}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">ADR</span>
                    <span className="stat-value">
                        {metrics.adr > 0 ? formatCurrency(metrics.adr) : '—'}
                    </span>
                    <span className="stat-change" style={{
                        color: ari && ari >= 100 ? 'var(--status-success)' : 'var(--status-danger)'
                    }}>
                        {ari ? `ARI: ${ari.toFixed(0)}` : '—'}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">RevPAR</span>
                    <span className="stat-value">
                        {metrics.revpar > 0 ? formatCurrency(metrics.revpar) : '—'}
                    </span>
                    <span className="stat-change" style={{
                        color: rgi && rgi >= 100 ? 'var(--status-success)' : 'var(--status-danger)'
                    }}>
                        {rgi ? `RGI: ${rgi.toFixed(0)}` : '—'}
                    </span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

                {/* Property Details Card */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Property Details</h2>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Brand</span>
                        <span className="metric-value">{hotel.brand}</span>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Management Company</span>
                        <span className="metric-value">{hotel.managementCompany}</span>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Asset Manager</span>
                        <span className="metric-value">{hotel.assetManager}</span>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Year Built</span>
                        <span className="metric-value">{hotel.yearBuilt}</span>
                    </div>
                    {hotel.yearRenovated && (
                        <div className="metric-row">
                            <span className="metric-label">Year Renovated</span>
                            <span className="metric-value">{hotel.yearRenovated}</span>
                        </div>
                    )}
                    <div className="metric-row">
                        <span className="metric-label">Key Count</span>
                        <span className="metric-value">{hotel.keyCount} rooms</span>
                    </div>
                </div>

                {/* Valuation Card */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Valuation</h2>
                    </div>
                    {valuation ? (
                        <>
                            <div className="metric-row">
                                <span className="metric-label">Appraised Value</span>
                                <span className="metric-value highlight">{formatCurrency(valuation.appraisedValue)}</span>
                            </div>
                            <div className="metric-row">
                                <span className="metric-label">Cap Rate</span>
                                <span className="metric-value">{formatPercent(valuation.capRate)}</span>
                            </div>
                            <div className="metric-row">
                                <span className="metric-label">Value Per Key</span>
                                <span className="metric-value">{formatCurrency(valuation.appraisedValue / hotel.keyCount)}</span>
                            </div>
                            <div className="metric-row">
                                <span className="metric-label">Valuation Method</span>
                                <span className="metric-value">{valuation.valuationMethod}</span>
                            </div>
                            <div className="metric-row">
                                <span className="metric-label">Valuation Date</span>
                                <span className="metric-value">{valuation.valuationDate.toLocaleDateString()}</span>
                            </div>
                        </>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', padding: '16px 0' }}>No valuation data available</p>
                    )}
                </div>
            </div>

            {/* Linked Loan Card */}
            {loan && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-header">
                        <h2 className="card-title">Linked Loan</h2>
                        <Link
                            href={`/loans/${loan.id}`}
                            style={{
                                color: 'var(--status-info)',
                                textDecoration: 'none',
                                fontSize: '14px'
                            }}
                        >
                            View Loan Details →
                        </Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Loan Name</div>
                            <div style={{ fontWeight: 600 }}>{loan.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{loan.borrower.name}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</div>
                            <span className={`status-badge ${loan.status.toLowerCase()}`}>
                                <span className={`status-dot ${loan.status.toLowerCase()}`}></span>
                                {loan.status}
                            </span>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Balance</div>
                            <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{formatCurrency(loan.terms.currentBalance)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Maturity</div>
                            <div style={{ fontWeight: 600 }}>{loan.terms.maturityDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Financial Performance */}
            <div className="card" style={{ marginBottom: '24px' }}>
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
                            <span className="metric-value highlight">{formatCurrency(metrics.totalRevenue)}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">Departmental Profit</span>
                            <span className="metric-value">{formatCurrency(metrics.departmentalProfit)}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">GOP</span>
                            <span className="metric-value">{formatCurrency(metrics.grossOperatingProfit)}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">EBITDA</span>
                            <span className="metric-value">{formatCurrency(metrics.ebitda)}</span>
                        </div>
                        <div className="metric-row" style={{ borderBottom: '2px solid var(--border-secondary)' }}>
                            <span className="metric-label" style={{ fontWeight: 600 }}>NOI</span>
                            <span className="metric-value" style={{ color: 'var(--status-success)' }}>
                                {formatCurrency(metrics.noi)}
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
                            <span className="metric-value">{formatPercent(metrics.occupancy)}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">ADR</span>
                            <span className="metric-value">{formatCurrency(metrics.adr)}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">RevPAR</span>
                            <span className="metric-value">{formatCurrency(metrics.revpar)}</span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">GOP Margin</span>
                            <span className="metric-value">
                                {metrics.totalRevenue > 0 ? formatPercent(metrics.grossOperatingProfit / metrics.totalRevenue) : '—'}
                            </span>
                        </div>
                        <div className="metric-row">
                            <span className="metric-label">NOI Margin</span>
                            <span className="metric-value">
                                {metrics.totalRevenue > 0 ? formatPercent(metrics.noi / metrics.totalRevenue) : '—'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Market Data Section */}
            {latestMarketData && marketData.length > 0 && (
                <div style={{ marginTop: '32px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: 600,
                        marginBottom: '16px',
                        color: 'var(--text-primary)'
                    }}>
                        Market Performance (STR Data)
                    </h2>

                    {/* Current Performance Metrics */}
                    <div style={{ marginBottom: '24px' }}>
                        <PerformanceMetrics data={latestMarketData} />
                    </div>

                    {/* STR Index Cards */}
                    <div style={{ marginBottom: '24px' }}>
                        <STRIndexCards
                            currentData={latestMarketData}
                            historicalData={marketData}
                        />
                    </div>

                    {/* Charts Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '24px'
                    }}>
                        <RGITrendChart data={marketData} />
                        <OccupancyComparisonChart data={marketData} />
                        <ADRComparisonChart data={marketData} />
                    </div>
                </div>
            )}
        </>
    );
}
