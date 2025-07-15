import React, { useState, useEffect } from 'react';
import StockChart from './components/StockChart';
import MonthNavigator from './components/MonthNavigator';
import Sidebar from './components/Sidebar';
import { parseNvidiaCSV, groupDataByMonth } from './utils/csvParser';
import { loadAvailableStocks, loadStockData, AVAILABLE_STOCKS } from './utils/stockLoader';
import type { StockDataPoint, GroupedStockData } from './utils/csvParser';
import type { StockInfo } from './utils/stockLoader';
import styles from './Game.module.css';

interface StockHolding {
  symbol: string;
  shares: number;
  averagePrice: number;
}

const Game: React.FC = () => {
  const [availableStocks, setAvailableStocks] = useState<StockInfo[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedStockData>({});
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Trading-States
  const [startCapital, setStartCapital] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [stockHoldings, setStockHoldings] = useState<StockHolding[]>([]);
  const [showStartCapitalPopup, setShowStartCapitalPopup] = useState<boolean>(true);
  const [showBuyPopup, setShowBuyPopup] = useState<boolean>(false);
  const [showSellPopup, setShowSellPopup] = useState<boolean>(false);
  const [tempCapitalInput, setTempCapitalInput] = useState<string>('');
  const [tempShareAmount, setTempShareAmount] = useState<string>('');
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

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

  useEffect(() => {
    const prevZoom = document.body.style.zoom;
    document.body.style.zoom = "1.02";
    return () => {
      document.body.style.zoom = prevZoom;
    };
  }, []);

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

  // Helper Functions
  const getCurrentStockPrice = (): number => {
    const currentMonthData = groupedData[currentMonth] || [];
    if (currentMonthData.length === 0) return 0;
    return currentMonthData[currentMonthData.length - 1].close;
  };

  const getCurrentStockHolding = (): StockHolding | undefined => {
    return stockHoldings.find(holding => holding.symbol === selectedStock);
  };

  const getTotalInvestedAmount = (): number => {
    return stockHoldings.reduce((total, holding) => {
      return total + (holding.shares * holding.averagePrice);
    }, 0);
  };

  // KORRIGIERTE calculateTotalValue Funktion
  const calculateTotalValue = (): number => {
    let totalValue = currentBalance;

    stockHoldings.forEach(holding => {
      const stockInfo = availableStocks.find(s => s.symbol === holding.symbol);
      if (stockInfo) {
        let currentPrice = 0;

        if (holding.symbol === selectedStock) {
          // Für die aktuell ausgewählte Aktie verwenden wir den aktuellen Preis
          currentPrice = getCurrentStockPrice();
        } else {
          // Für andere Aktien verwenden wir den Durchschnittspreis (vereinfacht)
          // In einer echten App würdest du hier die aktuellen Preise aller Aktien laden
          currentPrice = holding.averagePrice;
        }

        totalValue += holding.shares * currentPrice;
      }
    });

    return totalValue;
  };

  // Neue Funktion: Gruppiere Daten nach Woche
  const groupDataByWeek = (data: StockDataPoint[]): GroupedStockData => {
    const grouped: GroupedStockData = {};
    data.forEach(point => {
      const year = point.date.getFullYear();
      // ISO Woche berechnen
      const tempDate = new Date(point.date.getTime());
      tempDate.setHours(0, 0, 0, 0);
      tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
      const yearStart = new Date(tempDate.getFullYear(), 0, 1);
      const weekNo = Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + yearStart.getDay() + 1) / 7);
      const weekKey = `${year}-KW${weekNo}`;
      if (!grouped[weekKey]) grouped[weekKey] = [];
      grouped[weekKey].push(point);
    });
    return grouped;
  };

  // Gruppiere Daten für die letzten 4 Wochen
  const getLast4WeeksData = (data: StockDataPoint[]): StockDataPoint[] => {
    if (data.length === 0) return [];
    const sorted = [...data].sort((a, b) => b.date.getTime() - a.date.getTime());
    const lastDate = sorted[0].date;
    const fourWeeksAgo = new Date(lastDate);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 27); // 4 Wochen = 28 Tage
    return sorted.filter(point => point.date >= fourWeeksAgo);
  };

  // Gruppiere Daten für das letzte Jahr
  const getLastYearData = (data: StockDataPoint[]): StockDataPoint[] => {
    if (data.length === 0) return [];
    const sorted = [...data].sort((a, b) => b.date.getTime() - a.date.getTime());
    const lastDate = sorted[0].date;
    const oneYearAgo = new Date(lastDate);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return sorted.filter(point => point.date >= oneYearAgo);
  };

  // Daten je nach Ansicht
  const currentPeriodData = viewMode === 'monthly' ? getLast4WeeksData(stockData) : getLastYearData(stockData);
  // const availablePeriods = viewMode === 'monthly' ? availableMonths : Object.keys(groupDataByWeek(stockData)).sort();
  const currentPeriod = viewMode === 'monthly' ? currentMonth : currentMonth; // currentMonth wird für beide genutzt
  const setCurrentPeriod = setCurrentMonth; // Alias für Klarheit

  // Handler Functions
  const handleStockSelect = (symbol: string): void => {
    setSelectedStock(symbol);
    setError('');
  };

  const handleMonthChange = (month: string): void => {
    setCurrentMonth(month);
  };

  const handleStartCapitalSubmit = (): void => {
    const capital = parseFloat(tempCapitalInput);
    if (capital > 0) {
      setStartCapital(capital);
      setCurrentBalance(capital);
      setShowStartCapitalPopup(false);
      setTempCapitalInput('');
    }
  };

  const handleBuyClick = (): void => {
    setShowBuyPopup(true);
    setTempShareAmount('');
  };

  const handleSellClick = (): void => {
    setShowSellPopup(true);
    setTempShareAmount('');
  };

  // NEU: Max-Button Handler
  const handleMaxBuy = (): void => {
    const maxShares = getMaxBuyableShares();
    setTempShareAmount(maxShares.toString());
  };

  const handleMaxSell = (): void => {
    const maxShares = getMaxSellableShares();
    setTempShareAmount(maxShares.toString());
  };

  // Gebühren-Berechnungen
  const calculateBuyFee = (shares: number): number => {
    const stockInfo = getCurrentStockInfo();
    if (!stockInfo) return 0;
    const subtotal = shares * getCurrentStockPrice();
    return subtotal * (stockInfo.buyFee / 100);
  };

  const calculateSellFee = (shares: number): number => {
    const stockInfo = getCurrentStockInfo();
    if (!stockInfo) return 0;
    const subtotal = shares * getCurrentStockPrice();
    return subtotal * (stockInfo.sellFee / 100);
  };

  const handleBuySubmit = (): void => {
    const shares = parseInt(tempShareAmount);
    const currentPrice = getCurrentStockPrice();
    const fee = calculateBuyFee(shares);
    const totalCost = shares * currentPrice + fee;

    if (shares > 0 && totalCost <= currentBalance) {
      setCurrentBalance(prev => prev - totalCost);

      setStockHoldings(prev => {
        const existingHolding = prev.find(h => h.symbol === selectedStock);

        if (existingHolding) {
          // Berechne neuen Durchschnittspreis
          const totalShares = existingHolding.shares + shares;
          const totalValue = (existingHolding.shares * existingHolding.averagePrice) + (shares * currentPrice);
          const newAveragePrice = totalValue / totalShares;

          return prev.map(h =>
            h.symbol === selectedStock
              ? { ...h, shares: totalShares, averagePrice: newAveragePrice }
              : h
          );
        } else {
          // Neue Aktie hinzufügen
          return [...prev, { symbol: selectedStock, shares, averagePrice: currentPrice }];
        }
      });
    }

    setShowBuyPopup(false);
    setTempShareAmount('');
  };

  const handleSellSubmit = (): void => {
    const shares = parseInt(tempShareAmount);
    const currentPrice = getCurrentStockPrice();
    const currentHolding = getCurrentStockHolding();
    const fee = calculateSellFee(shares);
    const totalRevenue = shares * currentPrice - fee;

    if (shares > 0 && currentHolding && shares <= currentHolding.shares) {
      setCurrentBalance(prev => prev + totalRevenue);

      setStockHoldings(prev => {
        return prev.map(h => {
          if (h.symbol === selectedStock) {
            const newShares = h.shares - shares;
            return newShares > 0
              ? { ...h, shares: newShares }
              : null; // Entferne Holding wenn keine Aktien mehr
          }
          return h;
        }).filter(Boolean) as StockHolding[];
      });
    }

    setShowSellPopup(false);
    setTempShareAmount('');
  };

  const getCurrentStockInfo = (): StockInfo | undefined => {
    return availableStocks.find(s => s.symbol === selectedStock);
  };

  const formatMonthDisplay = (monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long'
    });
  };

  // Berechnungen für Popups
  const calculateBuyTotal = (): number => {
    const shares = parseInt(tempShareAmount) || 0;
    const subtotal = shares * getCurrentStockPrice();
    const fee = calculateBuyFee(shares);
    return subtotal + fee;
  };

  const calculateSellTotal = (): number => {
    const shares = parseInt(tempShareAmount) || 0;
    const subtotal = shares * getCurrentStockPrice();
    const fee = calculateSellFee(shares);
    return subtotal - fee;
  };

  const getMaxBuyableShares = (): number => {
    const currentPrice = getCurrentStockPrice();
    const stockInfo = getCurrentStockInfo();
    if (currentPrice === 0 || !stockInfo) return 0;

    let maxShares = 0;
    let testShares = Math.floor(currentBalance / currentPrice);

    while (testShares > 0) {
      const totalCost = testShares * currentPrice + (testShares * currentPrice * (stockInfo.buyFee / 100));
      if (totalCost <= currentBalance) {
        maxShares = testShares;
        break;
      }
      testShares--;
    }

    return maxShares;
  };

  const getMaxSellableShares = (): number => {
    const holding = getCurrentStockHolding();
    return holding ? holding.shares : 0;
  };

  // Loading und Error States bleiben gleich...
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

  const currentStockInfo = getCurrentStockInfo();
  const currentPrice = getCurrentStockPrice();
  const currentHolding = getCurrentStockHolding();

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: '#f3f3f3ff', width: '100vw', height: '100vh' }} />
      <div className={styles.gameContainer} style={{ position: 'relative', zIndex: 1 }}>
        {/* Startkapital Popup bleibt gleich... */}
        {showStartCapitalPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              <h2>💰 Startkapital festlegen</h2>
              <p>Wie viel Geld möchtest du für das Trading verwenden?</p>
              <input
                type="number"
                value={tempCapitalInput}
                onChange={(e) => setTempCapitalInput(e.target.value)}
                placeholder="z.B. 10000"
                className={styles.popupInput}
                min="1"
                step="0.01"
              />
              <div className={styles.popupButtons}>
                <button
                  onClick={handleStartCapitalSubmit}
                  className={styles.popupButtonPrimary}
                  disabled={!tempCapitalInput || parseFloat(tempCapitalInput) <= 0}
                >
                  Bestätigen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ERWEITERTE Buy Popup mit Max-Button */}
        {showBuyPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              <h2>📈 Aktien kaufen</h2>
              <p>Wie viele {currentStockInfo?.name} Aktien möchtest du kaufen?</p>
              <div className={styles.priceInfo}>
                <span>Aktueller Preis: <strong>{currentPrice.toFixed(2)}€</strong></span>
                <span>Kaufgebühr: <strong>{currentStockInfo?.buyFee ?? 0}%</strong></span>
              </div>
              <div className={styles.inputWithMaxButton}>
                <input
                  type="number"
                  value={tempShareAmount}
                  onChange={(e) => setTempShareAmount(e.target.value)}
                  placeholder="Anzahl Aktien"
                  className={styles.popupInput}
                  min="1"
                  step="1"
                  max={getMaxBuyableShares()}
                />
                <button
                  onClick={handleMaxBuy}
                  className={styles.maxButton}
                  disabled={getMaxBuyableShares() === 0}
                >
                  Max ({getMaxBuyableShares()})
                </button>
              </div>
              <div className={styles.calculationInfo}>
                <div className={styles.feeBreakdown}>
                  <p>Aktienkosten: <strong>{((parseInt(tempShareAmount) || 0) * currentPrice).toFixed(2)}€</strong></p>
                  <p>Kaufgebühr: <strong>{calculateBuyFee(parseInt(tempShareAmount) || 0).toFixed(2)}€</strong></p>
                  <p className={styles.totalCost}>Gesamtkosten: <strong>{calculateBuyTotal().toFixed(2)}€</strong></p>
                </div>
                <p>Verfügbares Guthaben: {currentBalance.toFixed(2)}€</p>
              </div>
              <div className={styles.popupButtons}>
                <button
                  onClick={() => setShowBuyPopup(false)}
                  className={styles.popupButtonSecondary}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleBuySubmit}
                  className={styles.popupButtonPrimary}
                  disabled={
                    !tempShareAmount ||
                    parseInt(tempShareAmount) <= 0 ||
                    calculateBuyTotal() > currentBalance ||
                    parseInt(tempShareAmount) > getMaxBuyableShares()
                  }
                >
                  Kaufen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ERWEITERTE Sell Popup mit Max-Button */}
        {showSellPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              <h2>📉 Aktien verkaufen</h2>
              <p>Wie viele {currentStockInfo?.name} Aktien möchtest du verkaufen?</p>
              <div className={styles.priceInfo}>
                <span>Aktueller Preis: <strong>{currentPrice.toFixed(2)}€</strong></span>
                <span>Verkaufsgebühr: <strong>{currentStockInfo?.sellFee ?? 0}%</strong></span>
              </div>
              <div className={styles.inputWithMaxButton}>
                <input
                  type="number"
                  value={tempShareAmount}
                  onChange={(e) => setTempShareAmount(e.target.value)}
                  placeholder="Anzahl Aktien"
                  className={styles.popupInput}
                  min="1"
                  step="1"
                  max={getMaxSellableShares()}
                />
                <button
                  onClick={handleMaxSell}
                  className={styles.maxButton}
                  disabled={getMaxSellableShares() === 0}
                >
                  Max ({getMaxSellableShares()})
                </button>
              </div>
              <div className={styles.calculationInfo}>
                <div className={styles.feeBreakdown}>
                  <p>Verkaufserlös: <strong>{((parseInt(tempShareAmount) || 0) * currentPrice).toFixed(2)}€</strong></p>
                  <p>Verkaufsgebühr: <strong>-{calculateSellFee(parseInt(tempShareAmount) || 0).toFixed(2)}€</strong></p>
                  <p className={styles.totalRevenue}>Netto-Erlös: <strong>{calculateSellTotal().toFixed(2)}€</strong></p>
                </div>
                <p>Besitzt: {currentHolding?.shares || 0} Aktien</p>
                {currentHolding && (
                  <p>Ø Kaufpreis: {currentHolding.averagePrice.toFixed(2)}€</p>
                )}
              </div>
              <div className={styles.popupButtons}>
                <button
                  onClick={() => setShowSellPopup(false)}
                  className={styles.popupButtonSecondary}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSellSubmit}
                  className={styles.popupButtonPrimary}
                  disabled={
                    !tempShareAmount ||
                    parseInt(tempShareAmount) <= 0 ||
                    parseInt(tempShareAmount) > getMaxSellableShares()
                  }
                >
                  Verkaufen
                </button>
              </div>
            </div>
          </div>
        )}

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

            {/* Navigation mit KORRIGIERTER Vermögensanzeige */}
            <div className={styles.navigationContainer}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={viewMode === 'monthly' ? styles.navButton : styles.navButtonSecondary}
                  onClick={() => setViewMode('monthly')}
                  disabled={viewMode === 'monthly'}
                >
                  Letzte 4 Wochen
                </button>
                <button
                  className={viewMode === 'yearly' ? styles.navButton : styles.navButtonSecondary}
                  onClick={() => setViewMode('yearly')}
                  disabled={viewMode === 'yearly'}
                >
                  Letztes Jahr
                </button>
              </div>
              <div className={styles.balanceDisplay}>
                <span className={styles.balanceLabel}>Gesamtvermögen:</span>
                <span className={styles.balanceValue}>{calculateTotalValue().toFixed(2)}€</span>
              </div>
            </div>

            {/* Rest der Komponente bleibt gleich... */}
            <div className={styles.chartContainer}>
              <StockChart
                data={currentPeriodData}
                stockColor={currentStockInfo?.color || '#2563eb'}
              />
            </div>
            <div className={styles.tradingPanel}>
              <div className={styles.stockPosition} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '35%' }}>
                <div className={styles.positionInfo}>
                  <span className={styles.positionLabel}>Besitzt:</span>
                  <span className={styles.positionValue}>
                    {currentHolding?.shares || 0} Aktien
                  </span>
                </div>
                <div className={styles.positionInfo}>
                  <span className={styles.positionLabel}>Aktueller Preis:</span>
                  <span className={styles.positionValue}>{currentPrice.toFixed(2)}€</span>
                </div>
                <div className={styles.positionInfo}>
                  <span className={styles.positionLabel}>Bargeld:</span>
                  <span className={styles.positionValue}>{currentBalance.toFixed(2)}€</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 24, justifyContent: 'flex-end', width: '100%' }}>
                <div className={styles.tradingButtons}>
                  <button
                    onClick={handleBuyClick}
                    className={styles.buyButton}
                    disabled={getMaxBuyableShares() === 0}
                  >
                    📈 Kaufen
                  </button>
                  <button
                    onClick={handleSellClick}
                    className={styles.sellButton}
                    disabled={getMaxSellableShares() === 0}
                  >
                    📉 Verkaufen
                  </button>
                </div>
                <div className={styles.feeInfo} style={{ minWidth: 120, textAlign: 'right' }}>
                  <span>Kaufgebühr: {currentStockInfo?.buyFee ?? 0}%</span>
                  <span>Verkaufsgebühr: {currentStockInfo?.sellFee ?? 0}%</span>
                </div>
              </div>
            </div>

            {/* Stats bleiben unverändert... */}
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Datenpunkte im Monat:</span>
                <span className={styles.statValue}>{currentPeriodData.length}</span>
              </div>
              {currentPeriodData.length > 0 && (
                <>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Höchster Kurs:</span>
                    <span className={styles.statValue}>
                      {Math.max(...currentPeriodData.map(d => d.close)).toFixed(2)}€
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Niedrigster Kurs:</span>
                    <span className={styles.statValue}>
                      {Math.min(...currentPeriodData.map(d => d.close)).toFixed(2)}€
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Durchschnittskurs:</span>
                    <span className={styles.statValue}>
                      {(currentPeriodData.reduce((sum, d) => sum + d.close, 0) / currentPeriodData.length).toFixed(2)}€
                    </span>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Game;
