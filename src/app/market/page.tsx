'use client';

import { useState } from 'react';
import { mockHotels, mockMarketData, getMarketDataByHotelId, getLatestMarketData } from '@/lib/mock-data';
import { formatPercent, formatCurrency } from '@/lib/calculations';
import { STRIndexCards, PerformanceMetrics } from '@/components/STRIndexCards';
import { RGITrendChart, OccupancyComparisonChart, ADRComparisonChart } from '@/components/STRChart';

export default function MarketPage() {
    const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);

    // Get summary data for each hotel (latest month)
    const hotelSummaries = mockHotels.map(hotel => {
        const latestData = getLatestMarketData(hotel.id);
        if (!latestData) return null;

        const mpi = latestData.occupancyCompSet > 0
            ? (latestData.occupancyMyProp / latestData.occupancyCompSet) * 100
            : 0;
        const ari = latestData.adrCompSet > 0
            ? (latestData.adrMyProp / latestData.adrCompSet) * 100
            : 0;
        const rgi = latestData.revparCompSet > 0
            ? (latestData.revparMyProp / latestData.revparCompSet) * 100
            : 0;

        return {
            hotel,
            latestData,
            mpi,
            ari,
            rgi,
        };
    }).filter(Boolean) as NonNullable<typeof hotelSummaries[0]>[];

    // Get detailed data for selected hotel
    const selectedHotel = selectedHotelId
        ? mockHotels.find(h => h.id === selectedHotelId)
        : null;
    const selectedHistoricalData = selectedHotelId
        ? getMarketDataByHotelId(selectedHotelId)
        : [];
    const selectedLatestData = selectedHotelId
        ? getLatestMarketData(selectedHotelId)
        : null;

    return (
        <>
            <header className="page-header">
                <h1 className="page-title">Market Data</h1>
                <p className="page-subtitle">
                    STR performance indexes vs. competitive set
                </p>
            </header>

            {/* Legend */}
            <div className="card" style={{ marginBottom: '24px', padding: '16px 24px' }}>
                <div style={{ display: 'flex', gap: '32px', fontSize: '13px', flexWrap: 'wrap' }}>
                    <div>
                        <strong>MPI</strong> (Market Penetration Index) = Occupancy vs Comp Set
                    </div>
                    <div>
                        <strong>ARI</strong> (Average Rate Index) = ADR vs Comp Set
                    </div>
                    <div>
                        <strong>RGI</strong> (Revenue Generation Index) = RevPAR vs Comp Set
                    </div>
                    <div style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
                        Index &gt; 100 = Outperforming • Click row to view trends
                    </div>
                </div>
            </div>

            {/* Market Data Table */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Hotel</th>
                            <th style={{ textAlign: 'right' }}>My Occ</th>
                            <th style={{ textAlign: 'right' }}>Comp Occ</th>
                            <th style={{ textAlign: 'center' }}>MPI</th>
                            <th style={{ textAlign: 'right' }}>My ADR</th>
                            <th style={{ textAlign: 'right' }}>Comp ADR</th>
                            <th style={{ textAlign: 'center' }}>ARI</th>
                            <th style={{ textAlign: 'right' }}>My RevPAR</th>
                            <th style={{ textAlign: 'right' }}>Comp RevPAR</th>
                            <th style={{ textAlign: 'center' }}>RGI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hotelSummaries.map((data) => (
                            <tr
                                key={data.hotel.id}
                                onClick={() => setSelectedHotelId(
                                    selectedHotelId === data.hotel.id ? null : data.hotel.id
                                )}
                                style={{
                                    cursor: 'pointer',
                                    backgroundColor: selectedHotelId === data.hotel.id
                                        ? 'var(--bg-secondary)'
                                        : undefined
                                }}
                            >
                                <td className="cell-primary">{data.hotel.name}</td>
                                <td className="cell-mono" style={{ textAlign: 'right' }}>
                                    {formatPercent(data.latestData.occupancyMyProp)}
                                </td>
                                <td className="cell-mono" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                                    {formatPercent(data.latestData.occupancyCompSet)}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '999px',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        background: data.mpi >= 100 ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
                                        color: data.mpi >= 100 ? 'var(--status-success)' : 'var(--status-danger)',
                                    }}>
                                        {data.mpi.toFixed(0)}
                                    </span>
                                </td>
                                <td className="cell-mono" style={{ textAlign: 'right' }}>
                                    {formatCurrency(data.latestData.adrMyProp)}
                                </td>
                                <td className="cell-mono" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                                    {formatCurrency(data.latestData.adrCompSet)}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '999px',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        background: data.ari >= 100 ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
                                        color: data.ari >= 100 ? 'var(--status-success)' : 'var(--status-danger)',
                                    }}>
                                        {data.ari.toFixed(0)}
                                    </span>
                                </td>
                                <td className="cell-mono" style={{ textAlign: 'right' }}>
                                    {formatCurrency(data.latestData.revparMyProp)}
                                </td>
                                <td className="cell-mono" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                                    {formatCurrency(data.latestData.revparCompSet)}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '999px',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        background: data.rgi >= 100 ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
                                        color: data.rgi >= 100 ? 'var(--status-success)' : 'var(--status-danger)',
                                    }}>
                                        {data.rgi.toFixed(0)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Section - Shows when a hotel is selected */}
            {selectedHotel && selectedLatestData && selectedHistoricalData.length > 0 && (
                <div style={{ marginTop: '32px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: 600,
                        marginBottom: '16px',
                        color: 'var(--text-primary)'
                    }}>
                        {selectedHotel.name} - Market Performance
                    </h2>

                    {/* Current Performance Metrics */}
                    <div style={{ marginBottom: '24px' }}>
                        <PerformanceMetrics data={selectedLatestData} />
                    </div>

                    {/* STR Index Cards */}
                    <div style={{ marginBottom: '24px' }}>
                        <STRIndexCards
                            currentData={selectedLatestData}
                            historicalData={selectedHistoricalData}
                        />
                    </div>

                    {/* Charts Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '24px'
                    }}>
                        <RGITrendChart data={selectedHistoricalData} />
                        <OccupancyComparisonChart data={selectedHistoricalData} />
                        <ADRComparisonChart data={selectedHistoricalData} />
                    </div>
                </div>
            )}
        </>
    );
}
