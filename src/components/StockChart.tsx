import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { StockDataPoint } from '../utils/csvParser';
import styles from '../Game.module.css';

interface StockChartProps {
    data: StockDataPoint[];
    stockColor: string;
    currentMonth: string;
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

const StockChart: React.FC<StockChartProps> = ({ data, stockColor, currentMonth }) => {
    const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div className={styles.customTooltip}>
                    <p className={styles.tooltipDate}>{`Datum: ${dataPoint.dateString}`}</p>
                    <p className={styles.tooltipPrice}>{`Kurs: ${dataPoint.closeString}€`}</p>
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

    const formatMonthDisplay = (monthKey: string): string => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long'
        });
    };

    // Berechne Trend für Farbkodierung
    const getTrendColor = (currentValue: number, previousValue: number): string => {
        if (currentValue > previousValue) return '#10b981'; // Grün für Aufwärtstrend
        if (currentValue < previousValue) return '#ef4444'; // Rot für Abwärtstrend
        return stockColor; // Standardfarbe bei gleichem Wert
    };

    const chartData: ChartDataPoint[] = data.map(item => ({
        ...item,
        timestamp: item.date.getTime()
    }));

    return (
        <div className={styles.stockChart}>
            <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>
                    Kursverlauf - {formatMonthDisplay(currentMonth)}
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
                        domain={['dataMin - 1', 'dataMax + 1']}
                        tickFormatter={formatYAxisLabel}
                        stroke="#64748b"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="linear" // Gerade Linien
                        dataKey="close"
                        stroke={stockColor}
                        strokeWidth={3}
                        dot={false} // Keine Punkte für saubere Linien
                        activeDot={{ r: 6, stroke: stockColor, strokeWidth: 2 }}
                    // Segment-basierte Farbkodierung würde hier komplexer sein
                    // Für jetzt verwenden wir eine einheitliche Farbe pro Aktie
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StockChart;
