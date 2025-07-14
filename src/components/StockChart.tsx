import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { StockDataPoint } from '../utils/csvParser';

interface StockChartProps {
    data: StockDataPoint[];
}

interface ChartDataPoint extends StockDataPoint {
    timestamp: number;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: ChartDataPoint;
        value: number;
    }>;
    label?: string;
}

const StockChart: React.FC<StockChartProps> = ({ data }) => {
    const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-date">{`Datum: ${dataPoint.dateString}`}</p>
                    <p className="tooltip-price">{`Kurs: ${dataPoint.closeString}€`}</p>
                </div>
            );
        }
        return null;
    };

    const formatXAxisLabel = (tickItem: number): string => {
        const date = new Date(tickItem);
        return date.getDate().toString();
    };

    const formatYAxisLabel = (value: number): string => {
        return `${value.toFixed(2)}€`;
    };

    const chartData: ChartDataPoint[] = data.map(item => ({
        ...item,
        timestamp: item.date.getTime()
    }));

    return (
        <div className="stock-chart">
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="timestamp"
                        type="number"
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={formatXAxisLabel}
                    />
                    <YAxis
                        domain={['dataMin - 1', 'dataMax + 1']}
                        tickFormatter={formatYAxisLabel}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="close"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StockChart;
