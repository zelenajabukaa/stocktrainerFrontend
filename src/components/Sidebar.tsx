import React from 'react';
import type { StockInfo } from '../utils/stockLoader';
import styles from '../Game.module.css';

interface SidebarProps {
    availableStocks: StockInfo[];
    selectedStock: string;
    onStockSelect: (symbol: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    availableStocks,
    selectedStock,
    onStockSelect
}) => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <h3>📈 Aktien</h3>
            </div>

            <div className={styles.stockList}>
                {availableStocks.map((stock) => (
                    <button
                        key={stock.symbol}
                        className={`${styles.stockItem} ${selectedStock === stock.symbol ? styles.stockItemActive : ''
                            }`}
                        onClick={() => onStockSelect(stock.symbol)}
                    >
                        <div
                            className={styles.stockColorIndicator}
                            style={{ backgroundColor: stock.color }}
                        />
                        <div className={styles.stockInfo}>
                            <span className={styles.stockSymbol}>{stock.symbol}</span>
                            <span className={styles.stockName}>{stock.name}</span>
                        </div>
                    </button>
                ))}
            </div>

            <div className={styles.sidebarFooter}>
                <p className={styles.stockCount}>
                    {availableStocks.length} Aktien verfügbar
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;
