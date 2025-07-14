import React, { useState, useEffect } from 'react';
import StockChart from './components/StockChart';
import MonthNavigator from './components/MonthNavigator';
import { parseNvidiaCSV, groupDataByMonth } from './utils/csvParser';
import type { StockDataPoint, GroupedStockData } from './utils/csvParser';
import styles from './Game.module.css';

const Game: React.FC = () => {
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedStockData>({});
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadCSVData = async (): Promise<void> => {
      try {
        const response = await fetch('/nvidia.csv');
        if (!response.ok) {
          throw new Error('CSV-Datei konnte nicht geladen werden');
        }
        const csvContent = await response.text();

        const parsedData = parseNvidiaCSV(csvContent);
        const grouped = groupDataByMonth(parsedData);
        const months = Object.keys(grouped).sort();

        setStockData(parsedData);
        setGroupedData(grouped);
        setAvailableMonths(months);
        setCurrentMonth(months[0]);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der CSV-Daten:', error);
        setError('Fehler beim Laden der Daten. Bitte stelle sicher, dass die nvidia.csv Datei im public-Ordner liegt.');
        setLoading(false);
      }
    };

    loadCSVData();
  }, []);

  const handleMonthChange = (month: string): void => {
    setCurrentMonth(month);
  };

  if (loading) {
    return (
      <div className={styles.gameContainer}>
        <div className={styles.loading}>Lade Nvidia-Aktiendaten...</div>
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

  return (
    <div className={styles.gameContainer}>
      <header className={styles.appHeader}>
        <h1>📈 Nvidia Trading Dashboard</h1>
        <p>Interaktive Aktienkurs-Analyse mit monatlicher Navigation</p>
      </header>

      <main className={styles.mainContent}>
        <MonthNavigator
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          availableMonths={availableMonths}
        />

        <div className={styles.chartContainer}>
          <StockChart data={currentMonthData} />
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
  );
};

export default Game;
