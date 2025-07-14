import React, { useState, useEffect } from 'react';
import StockChart from './components/StockChart';
import MonthNavigator from './components/MonthNavigator';
import Sidebar from './components/Sidebar';
import { parseNvidiaCSV, groupDataByMonth } from './utils/csvParser';
import { loadAvailableStocks, loadStockData, AVAILABLE_STOCKS } from './utils/stockLoader';
import type { StockDataPoint, GroupedStockData } from './utils/csvParser';
import type { StockInfo } from './utils/stockLoader';
import styles from './Game.module.css';

const Game: React.FC = () => {
  const [availableStocks, setAvailableStocks] = useState<StockInfo[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedStockData>({});
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Lade verfügbare Aktien beim Start
  useEffect(() => {
    const initializeStocks = async (): Promise<void> => {
      try {
        const stocks = await loadAvailableStocks();
        setAvailableStocks(stocks);

        if (stocks.length > 0) {
          setSelectedStock(stocks[0].symbol);
        }
      } catch (error) {
        console.error('Fehler beim Laden der verfügbaren Aktien:', error);
        setError('Keine Aktien-Daten verfügbar');
        setLoading(false);
      }
    };

    initializeStocks();
  }, []);

  // Lade Daten für ausgewählte Aktie
  useEffect(() => {
    if (!selectedStock) return;

    const loadSelectedStockData = async (): Promise<void> => {
      try {
        setLoading(true);
        const stockInfo = availableStocks.find(s => s.symbol === selectedStock);

        if (!stockInfo) {
          throw new Error('Aktie nicht gefunden');
        }

        const csvContent = await loadStockData(stockInfo.filename);
        const parsedData = parseNvidiaCSV(csvContent);
        const grouped = groupDataByMonth(parsedData);
        const months = Object.keys(grouped).sort();

        setStockData(parsedData);
        setGroupedData(grouped);
        setAvailableMonths(months);
        setCurrentMonth(months[0]);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Aktien-Daten:', error);
        setError(`Fehler beim Laden der ${selectedStock}-Daten`);
        setLoading(false);
      }
    };

    loadSelectedStockData();
  }, [selectedStock, availableStocks]);

  const handleStockSelect = (symbol: string): void => {
    setSelectedStock(symbol);
    setError('');
  };

  const handleMonthChange = (month: string): void => {
    setCurrentMonth(month);
  };

  const getCurrentStockInfo = (): StockInfo | undefined => {
    return availableStocks.find(s => s.symbol === selectedStock);
  };

  if (loading) {
    return (
      <div className={styles.gameContainer}>
        <div className={styles.loading}>Lade Aktien-Daten...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.gameContainer}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  const currentMonthData = groupedData[currentMonth] || [];
  const currentStockInfo = getCurrentStockInfo();

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameLayout}>
        <Sidebar
          availableStocks={availableStocks}
          selectedStock={selectedStock}
          onStockSelect={handleStockSelect}
        />

        <main className={styles.mainContent}>
          <header className={styles.appHeader}>
            <h1>📈 {currentStockInfo?.name || 'Trading'} Dashboard</h1>
            <p>Interaktive Aktienkurs-Analyse mit monatlicher Navigation</p>
          </header>

          <MonthNavigator
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
            availableMonths={availableMonths}
          />

          <div className={styles.chartContainer}>
            <StockChart
              data={currentMonthData}
              stockColor={currentStockInfo?.color || '#2563eb'}
              currentMonth={currentMonth}
            />
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Datenpunkte im Monat:</span>
              <span className={styles.statValue}>{currentMonthData.length}</span>
            </div>
            {currentMonthData.length > 0 && (
              <>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Höchster Kurs:</span>
                  <span className={styles.statValue}>
                    {Math.max(...currentMonthData.map(d => d.close)).toFixed(2)}€
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Niedrigster Kurs:</span>
                  <span className={styles.statValue}>
                    {Math.min(...currentMonthData.map(d => d.close)).toFixed(2)}€
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Durchschnittskurs:</span>
                  <span className={styles.statValue}>
                    {(currentMonthData.reduce((sum, d) => sum + d.close, 0) / currentMonthData.length).toFixed(2)}€
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Monatliche Entwicklung:</span>
                  <span className={`${styles.statValue} ${currentMonthData.length > 1 &&
                    currentMonthData[currentMonthData.length - 1].close > currentMonthData[0].close
                    ? styles.statValuePositive : styles.statValueNegative
                    }`}>
                    {currentMonthData.length > 1 ? (
                      ((currentMonthData[currentMonthData.length - 1].close - currentMonthData[0].close) / currentMonthData[0].close * 100).toFixed(2)
                    ) : '0.00'}%
                  </span>
                </div>
              </>
            )}
          </div>

          <div className={styles.tradingInfo}>
            <div className={styles.infoSection}>
              <h3 className={styles.infoSectionTitle}>📊 Marktanalyse</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Volatilität:</span>
                  <span className={styles.infoValue}>
                    {currentMonthData.length > 1 ? (
                      (Math.max(...currentMonthData.map(d => d.close)) - Math.min(...currentMonthData.map(d => d.close))).toFixed(2)
                    ) : '0.00'}€
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Handelstage:</span>
                  <span className={styles.infoValue}>{currentMonthData.length}</span>
                </div>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.infoSectionTitle}>🎯 Trading-Hinweise</h3>
              <div className={styles.tradingTips}>
                {currentMonthData.length > 0 && (
                  <>
                    <div className={styles.tip}>
                      <strong>Trend:</strong> {
                        currentMonthData.length > 1 &&
                          currentMonthData[currentMonthData.length - 1].close > currentMonthData[0].close
                          ? '📈 Aufwärtstrend' : '📉 Abwärtstrend'
                      }
                    </div>
                    <div className={styles.tip}>
                      <strong>Support:</strong> {Math.min(...currentMonthData.map(d => d.close)).toFixed(2)}€
                    </div>
                    <div className={styles.tip}>
                      <strong>Resistance:</strong> {Math.max(...currentMonthData.map(d => d.close)).toFixed(2)}€
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Game;
