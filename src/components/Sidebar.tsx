import React, { useState, useMemo } from 'react';
import type { StockInfo } from '../utils/stockLoader';
import styles from '../Game.module.css';

interface SidebarProps {
    availableStocks: StockInfo[];
    selectedStock: string;
    onStockSelect: (symbol: string) => void;
    userLevel: number;
    getRequiredLevelForStock: (symbol: string) => number | null;
}

const Sidebar: React.FC<SidebarProps> = ({
    availableStocks,
    selectedStock,
    onStockSelect,
    userLevel,
    getRequiredLevelForStock
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStocks = useMemo(() => {
        let stocks = searchTerm.trim()
            ? availableStocks.filter(stock =>
                stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                stock.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : availableStocks;

        // Sortierung: Erst verfügbare Aktien, dann nach Level
        return stocks.sort((a, b) => {
            const levelA = getRequiredLevelForStock(a.symbol);
            const levelB = getRequiredLevelForStock(b.symbol);

            // Aktien ohne Level-Anforderung (von Anfang an verfügbar) kommen zuerst
            if (levelA === null && levelB === null) {
                return a.symbol.localeCompare(b.symbol);
            }
            if (levelA === null) return -1;
            if (levelB === null) return 1;

            // Beide haben Level-Anforderungen - nach Level sortieren
            return levelA - levelB;
        });
    }, [availableStocks, searchTerm, getRequiredLevelForStock]);

    const clearSearch = () => {
        setSearchTerm('');
    };

    const isStockUnlocked = (stockSymbol: string): boolean => {
        const requiredLevel = getRequiredLevelForStock(stockSymbol);
        return requiredLevel === null || userLevel >= requiredLevel;
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <h3>Aktien auswählen</h3>
                <div className={styles.searchContainer}>
                    <div className={styles.searchInputWrapper}>
                        <input
                            type="text"
                            placeholder="Aktie suchen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        {searchTerm && (
                            <button onClick={clearSearch} className={styles.clearButton}>
                                ×
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.stockList}>
                {filteredStocks.map((stock) => {
                    const isUnlocked = isStockUnlocked(stock.symbol);
                    const requiredLevel = getRequiredLevelForStock(stock.symbol);

                    return (
                        <button
                            key={stock.symbol}
                            onClick={() => isUnlocked && onStockSelect(stock.symbol)}
                            className={`${styles.stockItem} ${selectedStock === stock.symbol ? styles.stockItemActive : ''
                                } ${!isUnlocked ? styles.stockItemLocked : ''}`}
                            disabled={!isUnlocked}
                        >
                            <div className={styles.stockColorIndicator}
                                style={{ backgroundColor: stock.color }} />
                            <div className={styles.stockInfo}>
                                <div className={styles.stockSymbol}>{stock.symbol}</div>
                                <div className={styles.stockName}>{stock.name}</div>
                            </div>

                            {!isUnlocked && (
                                <div className={styles.lockOverlay}>
                                    <div className={styles.lockIcon}>🔒</div>
                                    <div className={styles.lockText2}>
                                        Level {requiredLevel} erforderlich
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className={styles.sidebarFooter}>
                <p className={styles.stockCount}>
                    {filteredStocks.length} Aktien verfügbar
                </p>
            </div>
        </div>
    );
};

export default Sidebar;
