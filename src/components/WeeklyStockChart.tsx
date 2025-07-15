import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { WeeklyStockDataPoint } from '../utils/WeeklyParser';
import styles from '../Weekly.module.css';

interface WeeklyStockChartProps {
    data: WeeklyStockDataPoint[];
    stockColor: string;
    weekString: string;
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

const WeeklyStockChart: React.FC<WeeklyStockChartProps> = ({ data, stockColor, weekString }) => {
    const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div className={styles.customTooltip}>
                    <p className={styles.tooltipDate}>{`Tag: ${dataPoint.dateString}`}</p>
                    <p className={styles.tooltipPrice}>{`Kurs: ${dataPoint.closeString}€`}</p>
                </div>
            );
        }
        return null;
    };

    const formatXAxisLabel = (tickItem: number): string => {
        const date = new Date(tickItem);
        const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        return weekdays[date.getDay()];
    };

    const formatYAxisLabel = (value: number): string => {
        return `${value.toFixed(2)}€`;
    };

    const chartData: ChartDataPoint[] = data.map(item => ({
        ...item,
        timestamp: item.date.getTime()
    }));

    return (
        <div className={styles.stockChart}>
            <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>
                    Kursverlauf - {weekString}
                </h2>
            </div>

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
                        domain={['dataMin - 0.5', 'dataMax + 0.5']}
                        tickFormatter={formatYAxisLabel}
                        stroke="#64748b"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="linear"
                        dataKey="close"
                        stroke={stockColor}
                        strokeWidth={3}
                        dot={{ fill: stockColor, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 8, stroke: stockColor, strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WeeklyStockChart;
