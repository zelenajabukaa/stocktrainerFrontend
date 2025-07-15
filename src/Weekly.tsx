import React, { useState, useEffect } from 'react';
import WeeklyStockChart from './components/WeeklyStockChart';
import YearNavigator from './components/YearNavigator';
import Sidebar from './components/Sidebar';
import { parseWeeklyData, groupWeeklyDataByYear } from './utils/WeeklyParser';
import { loadAvailableStocks, loadStockData } from './utils/stockLoader';
import type { WeeklyStockDataPoint, GroupedWeeklyData } from './utils/WeeklyParser';
import type { StockInfo } from './utils/stockLoader';
import styles from './Weekly.module.css';

interface StockHolding {
  symbol: string;
  shares: number;
  averagePrice: number;
}

const Weekly: React.FC = () => {
  const [availableStocks, setAvailableStocks] = useState<StockInfo[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [stockData, setStockData] = useState<WeeklyStockDataPoint[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedWeeklyData>({});
  const [currentYear, setCurrentYear] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<string[]>([]);
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

  // Lade Wochendaten für ausgewählte Aktie
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
        const parsedData = parseWeeklyData(csvContent);
        const grouped = groupWeeklyDataByYear(parsedData);
        const years = Object.keys(grouped).sort();

        setStockData(parsedData);
        setGroupedData(grouped);
        setAvailableYears(years);
        setCurrentYear(years[0]);
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
    const currentYearData = groupedData[currentYear] || [];
    if (currentYearData.length === 0) return 0;
    return currentYearData[currentYearData.length - 1].close;
  };

  const getCurrentStockInfo = (): StockInfo | undefined => {
    return availableStocks.find(s => s.symbol === selectedStock);
  };

  const getCurrentStockHolding = (): StockHolding | undefined => {
    return stockHoldings.find(holding => holding.symbol === selectedStock);
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

  // Handler Functions
  const handleStockSelect = (symbol: string): void => {
    setSelectedStock(symbol);
    setError('');
  };

  const handleYearChange = (year: string): void => {
    setCurrentYear(year);
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

  const handleMaxBuy = (): void => {
    const maxShares = getMaxBuyableShares();
    setTempShareAmount(maxShares.toString());
  };

  const handleMaxSell = (): void => {
    const maxShares = getMaxSellableShares();
    setTempShareAmount(maxShares.toString());
  };

  const handleBuySubmit = (): void => {
    const shares = parseInt(tempShareAmount);
    const currentPrice = getCurrentStockPrice();
    const subtotal = shares * currentPrice;
    const fee = calculateBuyFee(shares);
    const totalCost = subtotal + fee;

    if (shares > 0 && totalCost <= currentBalance) {
      setCurrentBalance(prev => prev - totalCost);

      setStockHoldings(prev => {
        const existingHolding = prev.find(h => h.symbol === selectedStock);

        if (existingHolding) {
          const totalShares = existingHolding.shares + shares;
          const totalValue = (existingHolding.shares * existingHolding.averagePrice) + subtotal;
          const newAveragePrice = totalValue / totalShares;

          return prev.map(h =>
            h.symbol === selectedStock
              ? { ...h, shares: totalShares, averagePrice: newAveragePrice }
              : h
          );
        } else {
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
    const subtotal = shares * currentPrice;
    const fee = calculateSellFee(shares);
    const totalRevenue = subtotal - fee;
    const currentHolding = getCurrentStockHolding();

    if (shares > 0 && currentHolding && shares <= currentHolding.shares) {
      setCurrentBalance(prev => prev + totalRevenue);

      setStockHoldings(prev => {
        return prev.map(h => {
          if (h.symbol === selectedStock) {
            const newShares = h.shares - shares;
            return newShares > 0
              ? { ...h, shares: newShares }
              : null;
          }
          return h;
        }).filter(Boolean) as StockHolding[];
      });
    }

    setShowSellPopup(false);
    setTempShareAmount('');
  };

  if (loading) {
    return (
      <div className={styles.weeklyContainer}>
        <div className={styles.loading}>Lade Wochendaten...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.weeklyContainer}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  const currentYearData = groupedData[currentYear] || [];
  const currentStockInfo = getCurrentStockInfo();
  const currentPrice = getCurrentStockPrice();
  const currentHolding = getCurrentStockHolding();

  return (
    <div className={styles.weeklyContainer}>
      {/* Alle Popups - identisch zu Game.tsx aber mit wöchentlichen Daten */}
      {showStartCapitalPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h2>💰 Startkapital festlegen</h2>
            <p>Wie viel Geld möchtest du für das wöchentliche Trading verwenden?</p>
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

      {/* Buy Popup */}
      {showBuyPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h2>📈 Aktien kaufen</h2>
            <p>Wie viele {currentStockInfo?.name} Aktien möchtest du kaufen?</p>
            <div className={styles.priceInfo}>
              <span>Wochenpreis: <strong>{currentPrice.toFixed(2)}€</strong></span>
              <span>Kaufgebühr: <strong>{currentStockInfo?.buyFee}%</strong></span>
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

      {/* Sell Popup */}
      {showSellPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h2>📉 Aktien verkaufen</h2>
            <p>Wie viele {currentStockInfo?.name} Aktien möchtest du verkaufen?</p>
            <div className={styles.priceInfo}>
              <span>Wochenpreis: <strong>{currentPrice.toFixed(2)}€</strong></span>
              <span>Verkaufsgebühr: <strong>{currentStockInfo?.sellFee}%</strong></span>
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

      <div className={styles.weeklyLayout}>
        <Sidebar
          availableStocks={availableStocks}
          selectedStock={selectedStock}
          onStockSelect={handleStockSelect}
        />

        <main className={styles.mainContent}>
          <header className={styles.appHeader}>
            <h1>📊 {currentStockInfo?.name || 'Weekly Trading'} Dashboard</h1>
            <p>Wöchentliche Aktienkurs-Analyse mit Jahresnavigation</p>
          </header>

          <div className={styles.navigationContainer}>
            <YearNavigator
              currentYear={currentYear}
              onYearChange={handleYearChange}
              availableYears={availableYears}
            />
            <div className={styles.balanceDisplay}>
              <span className={styles.balanceLabel}>Startkapital:</span>
              <span className={styles.balanceValue}>{startCapital.toFixed(2)}€</span>
            </div>
          </div>

          <div className={styles.chartContainer}>
            <WeeklyStockChart
              data={currentYearData}
              stockColor={currentStockInfo?.color || '#2563eb'}
            />
          </div>

          <div className={styles.tradingPanel}>
            <div className={styles.stockPosition}>
              <div className={styles.positionInfo}>
                <span className={styles.positionLabel}>Besitzt:</span>
                <span className={styles.positionValue}>
                  {currentHolding?.shares || 0} Aktien
                </span>
              </div>
              <div className={styles.positionInfo}>
                <span className={styles.positionLabel}>Wochenpreis:</span>
                <span className={styles.positionValue}>{currentPrice.toFixed(2)}€</span>
              </div>
              <div className={styles.positionInfo}>
                <span className={styles.positionLabel}>Bargeld:</span>
                <span className={styles.positionValue}>{currentBalance.toFixed(2)}€</span>
              </div>
            </div>
            <div className={styles.tradingInfo}>
              <div className={styles.feeInfo}>
                <span>Kaufgebühr: {currentStockInfo?.buyFee}%</span>
                <span>Verkaufsgebühr: {currentStockInfo?.sellFee}%</span>
              </div>
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
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Wochen im Jahr:</span>
              <span className={styles.statValue}>{currentYearData.length}</span>
            </div>
            {currentYearData.length > 0 && (
              <>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Höchster Kurs:</span>
                  <span className={styles.statValue}>
                    {Math.max(...currentYearData.map(d => d.close)).toFixed(2)}€
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Niedrigster Kurs:</span>
                  <span className={styles.statValue}>
                    {Math.min(...currentYearData.map(d => d.close)).toFixed(2)}€
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Durchschnittskurs:</span>
                  <span className={styles.statValue}>
                    {(currentYearData.reduce((sum, d) => sum + d.close, 0) / currentYearData.length).toFixed(2)}€
                  </span>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Weekly;
