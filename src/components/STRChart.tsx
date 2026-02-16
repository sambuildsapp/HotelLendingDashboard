'use client';

/**
 * STR Market Performance Charts
 * Displays RevPAR Index trend and Occupancy/ADR comparisons vs Comp Set
 */

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import type { MarketData } from '@/lib/types';
import { calculateSTRIndexes } from '@/lib/calculations';

interface STRChartProps {
    data: MarketData[];
    title?: string;
}

/**
 * Format date for chart labels (e.g., "Jan 24")
 */
function formatPeriod(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date(date);
    return `${months[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
}

/**
 * RevPAR Index (RGI) trend chart with 100 reference line
 */
export function RGITrendChart({ data, title = 'RevPAR Index Trend' }: STRChartProps) {
    const chartData = data.map(d => ({
        period: formatPeriod(d.period),
        RGI: Number(calculateSTRIndexes(d).rgi.toFixed(1)),
    }));

    return (
        <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} domain={[70, 130]} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#f1f5f9' }}
                    />
                    <ReferenceLine y={100} stroke="#facc15" strokeDasharray="5 5" label={{ value: '100', fill: '#facc15', fontSize: 10 }} />
                    <Line
                        type="monotone"
                        dataKey="RGI"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        dot={{ fill: '#22d3ee', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

/**
 * Occupancy comparison chart (My Property vs Comp Set)
 */
export function OccupancyComparisonChart({ data, title = 'Occupancy: Property vs Comp Set' }: STRChartProps) {
    const chartData = data.map(d => ({
        period: formatPeriod(d.period),
        'My Property': Number((d.occupancyMyProp * 100).toFixed(1)),
        'Comp Set': Number((d.occupancyCompSet * 100).toFixed(1)),
    }));

    return (
        <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} unit="%" domain={[40, 100]} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#f1f5f9' }}
                        formatter={(value: any) => `${value}%`}
                    />
                    <Legend wrapperStyle={{ color: '#f1f5f9' }} />
                    <Line type="monotone" dataKey="My Property" stroke="#22d3ee" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Comp Set" stroke="#f472b6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

/**
 * ADR comparison chart (My Property vs Comp Set)
 */
export function ADRComparisonChart({ data, title = 'ADR: Property vs Comp Set' }: STRChartProps) {
    const chartData = data.map(d => ({
        period: formatPeriod(d.period),
        'My Property': Number(d.adrMyProp.toFixed(0)),
        'Comp Set': Number(d.adrCompSet.toFixed(0)),
    }));

    return (
        <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} unit="$" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#f1f5f9' }}
                        formatter={(value: any) => `$${value}`}
                    />
                    <Legend wrapperStyle={{ color: '#f1f5f9' }} />
                    <Line type="monotone" dataKey="My Property" stroke="#22d3ee" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Comp Set" stroke="#f472b6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
