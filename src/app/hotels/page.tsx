'use client';

import { mockHotels, mockLoans, mockFinancials, mockValuations } from '@/lib/mock-data';
import {
    aggregateAnnualMetrics,
    formatCurrency,
    formatPercent
} from '@/lib/calculations';
import Link from 'next/link';

// Get hotel display data
function getHotelDisplayData() {
    return mockHotels.map(hotel => {
        const loan = mockLoans.find(l => l.id === hotel.loanId);
        const financials = mockFinancials.filter(f => f.hotelId === hotel.id && f.scenario === 'ACTUAL');
        const metrics = aggregateAnnualMetrics(financials);
        const valuation = mockValuations.find(v => v.hotelId === hotel.id);

        return {
            ...hotel,
            loan,
            metrics,
            valuation,
        };
    });
}

export default function HotelsPage() {
    const hotelData = getHotelDisplayData();
    const totalKeys = hotelData.reduce((sum, h) => sum + h.keyCount, 0);

    return (
        <>
            <header className="page-header">
                <h1 className="page-title">Hotels</h1>
                <p className="page-subtitle">
                    {hotelData.length} properties • {totalKeys.toLocaleString()} total keys
                </p>
            </header>

            {/* Hotels Table */}
            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Hotel Name</th>
                            <th>Brand</th>
                            <th style={{ textAlign: 'right' }}>Keys</th>
                            <th>Location</th>
                            <th>Linked Loan</th>
                            <th style={{ textAlign: 'right' }}>Occupancy</th>
                            <th style={{ textAlign: 'right' }}>ADR</th>
                            <th style={{ textAlign: 'right' }}>RevPAR</th>
                            <th style={{ textAlign: 'right' }}>Appraised Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hotelData.map(hotel => (
                            <tr key={hotel.id}>
                                <td>
                                    <Link href={`/hotels/${hotel.id}`} className="cell-primary" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        {hotel.name}
                                    </Link>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        Built {hotel.yearBuilt}
                                        {hotel.yearRenovated && ` • Renovated ${hotel.yearRenovated}`}
                                    </div>
                                </td>
                                <td className="cell-secondary">{hotel.brand}</td>
                                <td className="cell-mono" style={{ textAlign: 'right' }}>{hotel.keyCount}</td>
                                <td className="cell-secondary" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {hotel.address}
                                </td>
                                <td>
                                    {hotel.loan ? (
                                        <Link href={`/loans/${hotel.loan.id}`} style={{ color: 'var(--status-info)', textDecoration: 'none' }}>
                                            {hotel.loan.name}
                                        </Link>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)' }}>Unencumbered</span>
                                    )}
                                </td>
                                <td className="cell-mono" style={{ textAlign: 'right' }}>
                                    {hotel.metrics.occupancy > 0 ? formatPercent(hotel.metrics.occupancy) : '—'}
                                </td>
                                <td className="cell-mono" style={{ textAlign: 'right' }}>
                                    {hotel.metrics.adr > 0 ? formatCurrency(hotel.metrics.adr) : '—'}
                                </td>
                                <td className="cell-mono" style={{ textAlign: 'right' }}>
                                    {hotel.metrics.revpar > 0 ? formatCurrency(hotel.metrics.revpar) : '—'}
                                </td>
                                <td className="cell-currency">
                                    {hotel.valuation ? formatCurrency(hotel.valuation.appraisedValue) : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
