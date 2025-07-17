import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { StockDataPoint } from '../utils/csvParser';
import styles from '../Game.module.css';

interface StockChartProps {
    data: StockDataPoint[];
    stockColor: string;
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

const StockChart: React.FC<StockChartProps> = ({ data, stockColor }) => {
    const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;

            // Formatiere den Kurs korrekt (entferne das Komma am Ende)
            const formattedPrice = dataPoint.close.toFixed(2);

            return (
                <div className={styles.customTooltip}>
                    <p className={styles.tooltipPrice}>{formattedPrice}€</p>
                </div>
            );
        }
        return null;
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
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="timestamp"
                        type="number"
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        tick={false}
                        axisLine={true}
                        stroke="#64748b"
                        reversed={false}
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

export default StockChart;
