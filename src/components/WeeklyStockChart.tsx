import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { WeeklyStockDataPoint } from '../utils/WeeklyParser.ts';
import styles from '../Weekly.module.css';

interface WeeklyStockChartProps {
    data: WeeklyStockDataPoint[];
    stockColor: string;
}

interface ChartDataPoint extends WeeklyStockDataPoint {
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

const WeeklyStockChart: React.FC<WeeklyStockChartProps> = ({ data, stockColor }) => {
    const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div className={styles.customTooltip}>
                    <p className={styles.tooltipDate}>{`Woche: ${dataPoint.weekString}`}</p>
                    <p className={styles.tooltipPrice}>{`Kurs: ${dataPoint.closeString}€`}</p>
                    <p className={styles.tooltipPeriod}>
                        {`${dataPoint.weekStart.toLocaleDateString('de-DE')} - ${dataPoint.weekEnd.toLocaleDateString('de-DE')}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    const formatXAxisLabel = (tickItem: number): string => {
        const date = new Date(tickItem);
        const week = Math.ceil(((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7;
        return `W${Math.floor(week)}`;
    };

    const formatYAxisLabel = (value: number): string => {
        return `${value.toFixed(2)}€`;
    };

    const chartData: ChartDataPoint[] = data.map(item => ({
        ...item,
        timestamp: item.weekEnd.getTime()
    }));

    return (
        <div className={styles.stockChart}>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="timestamp"
                        type="number"
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={formatXAxisLabel}
                        stroke="#64748b"
                    />
                    <YAxis
                        domain={['dataMin - 1', 'dataMax + 1']}
                        tickFormatter={formatYAxisLabel}
                        stroke="#64748b"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="linear"
                        dataKey="close"
                        stroke={stockColor}
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, stroke: stockColor, strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WeeklyStockChart;
