import React, { useState, useMemo } from 'react';
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
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Gefilterte Aktien basierend auf Suchbegriff
    const filteredStocks = useMemo(() => {
        if (!searchTerm.trim()) {
            return availableStocks;
        }

        const searchLower = searchTerm.toLowerCase();
        return availableStocks.filter(stock =>
            stock.symbol.toLowerCase().includes(searchLower) ||
            stock.name.toLowerCase().includes(searchLower)
        );
    }, [availableStocks, searchTerm]);

    // Suchfeld leeren
    const clearSearch = () => {
        setSearchTerm('');
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <h3>Aktien</h3>

                {/* ✅ NEU: Suchleiste */}
                <div className={styles.searchContainer}>
                    <div className={styles.searchInputWrapper}>
                        <input
                            type="text"
                            placeholder="Aktien suchen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className={styles.clearButton}
                                title="Suche löschen"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Such-Icon */}
                    <div className={styles.searchIcon}>
                        🔍
                    </div>
                </div>
            </div>

            <div className={styles.stockList}>
                {filteredStocks.length > 0 ? (
                    filteredStocks.map((stock) => (
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
                    ))
                ) : (
                    <div className={styles.noResults}>
                        <span className={styles.noResultsIcon}></span>
                        <p className={styles.noResultsText}>
                            Keine Aktien gefunden für "{searchTerm}"
                        </p>
                    </div>
                )}
            </div>

            <div className={styles.sidebarFooter}>
                <p className={styles.stockCount}>
                    {filteredStocks.length} von {availableStocks.length} Aktien
                    {searchTerm && ` (gefiltert)`}
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;
