import React from 'react';

interface TradingDotProps {
    cx?: number;
    cy?: number;
    payload?: any;
    tradingData?: Array<{
        date: string;
        type: 'buy' | 'sell';
        price: number;
        shares: number;
    }>;
}

const TradingDot: React.FC<TradingDotProps> = (props) => {
    const { cx, cy, payload, tradingData } = props;

    if (!payload || !tradingData || typeof cx !== 'number' || typeof cy !== 'number') {
        return null;
    }

    const currentDate = new Date(payload.date).toDateString();
    const trade = tradingData.find(t =>
        new Date(t.date).toDateString() === currentDate
    );

    if (trade) {
        const color = trade.type === 'buy' ? '#28a745' : '#dc3545';
        const symbol = trade.type === 'buy' ? '▲' : '▼';

        return (
            <g>
                <circle cx={cx} cy={cy} r={6} fill={color} stroke="white" strokeWidth={2} />
                <text x={cx} y={cy - 12} textAnchor="middle" fontSize="12" fill={color} fontWeight="bold">
                    {symbol}
                </text>
                <text x={cx} y={cy + 20} textAnchor="middle" fontSize="10" fill="#666">
                    {trade.shares}
                </text>
            </g>
        );
    }

    return null;
};

export default TradingDot;
