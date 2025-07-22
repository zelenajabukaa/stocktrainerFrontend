import React, { useState, useEffect } from 'react';
import StockChart from './components/StockChart';
import MonthNavigator from './components/MonthNavigator';
import CompanyInfo from './components/CompanyInfo';
import Sidebar from './components/Sidebar';
import { parseNvidiaCSV, groupDataByMonth } from './utils/csvParser';
import { loadAvailableStocks, loadStockData, AVAILABLE_STOCKS } from './utils/stockLoader';
import type { StockDataPoint, GroupedStockData } from './utils/csvParser';
import type { StockInfo } from './utils/stockLoader';
import styles from './Game.module.css';
import Header from './components/Header';
import PurchaseSuccessEffect from './components/PurchaseSuccessEffect';

interface StockHolding {
  symbol: string;
  shares: number;
  averagePrice: number;
}

const Game: React.FC = () => {

  //------------------------------------------------------------------------------USE STATES----------------------------------------------------------------------------------------------
  const [availableStocks, setAvailableStocks] = useState<StockInfo[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedStockData>({});
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showCompanyInfo, setShowCompanyInfo] = useState<boolean>(false);

  // Trading-States
  const [startCapital, setStartCapital] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [stockHoldings, setStockHoldings] = useState<StockHolding[]>([]);
  const [showStartCapitalPopup, setShowStartCapitalPopup] = useState<boolean>(true);
  const [showBuyPopup, setShowBuyPopup] = useState<boolean>(false);
  const [showSellPopup, setShowSellPopup] = useState<boolean>(false);
  const [tempShareAmount, setTempShareAmount] = useState<string>('');
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [monthlyWeekOffset, setMonthlyWeekOffset] = useState<number>(-48);
  const [yearlyWeekOffset, setYearlyWeekOffset] = useState<number>(0);
  const [hasTraded, setHasTraded] = useState<boolean>(false);
  const [firstTradingWeek, setFirstTradingWeek] = useState<number>(Infinity);
  const [lastTradingWeek, setLastTradingWeek] = useState<number>(Infinity);
  const [showPurchaseEffect, setShowPurchaseEffect] = useState(false);
  const [lastPurchase, setLastPurchase] = useState({ symbol: '', shares: 0 });

  // Rundensystem States
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [showFinishPopup, setShowFinishPopup] = useState<boolean>(false);
  const [finalResults, setFinalResults] = useState<{
    startCapital: number;
    finalValue: number;
    percentageChange: number;
    profit: number;
  } | null>(null);

  const [showCapitalPopup, setShowCapitalPopup] = useState(true);
  const [tempCapitalInput, setTempCapitalInput] = useState('');
  const [maxStartingCapital, setMaxStartingCapital] = useState<number>(1000);
  const [userLevel, setUserLevel] = useState<number>(0);
  const [percentageProfit, setPercentageProfit] = useState<number | null>(null);
  const [totalStocksBought, setTotalStocksBought] = useState<number | null>(null);
  const [totalStocksSelled, setTotalStocksSelled] = useState<number | null>(null);
  const [holdShares, setHoldShares] = useState<number | null>(null);
  const [currentWeekTrades, setCurrentWeekTrades] = useState<number>(0);  // Aktuelle Woche
  const [maxWeekTrades, setMaxWeekTrades] = useState<number>(0);          // Höchster Wert ever


  const [weekTrades, setWeekTrades] = useState<number>(0);


  //----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  const rawRewards = [
    { level: 1, reward: 'NKE' },
    { level: 2, reward: 'PEP' },
    { level: 4, reward: 'HON' },
    { level: 6, reward: 'PYPL' },
    { level: 7, reward: 'AAPL' },
    { level: 9, reward: 'MCD' },
    { level: 10, reward: 'UNH' },
    { level: 11, reward: 'V' },
    { level: 13, reward: 'BA' },
    { level: 14, reward: 'AMZN' },
    { level: 15, reward: 'TSLA' },
    { level: 16, reward: 'META' },
    { level: 17, reward: 'MA' },
    { level: 18, reward: 'MSFT' },
    { level: 19, reward: 'NFLX' },
  ];

  //--------------------------------------------------------------------------------USE EFFECT--------------------------------------------------------------------------------------------

  // Berechne maximales Startkapital basierend auf Level
  useEffect(() => {
    const maxCapital = getMaxStartingCapital(userLevel);
    setMaxStartingCapital(maxCapital);
  }, [userLevel]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:3000/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.user?.level) {
          setUserLevel(data.user.level);
        }
      })
      .catch(err => {
        console.error('Fehler beim Abrufen des Levels:', err);
      });
  }, []);

  const getRequiredLevelForStock = (stockSymbol: string): number | null => {
    const reward = rawRewards.find(r => r.reward === stockSymbol);
    return reward ? reward.level : null;
  };

  // useEffect um holdShares automatisch zu aktualisieren wenn stockHoldings sich ändern
  useEffect(() => {
    const currentHoldShares = calculateHoldShares();
    if (holdShares !== currentHoldShares && stockHoldings.length > 0) {
      console.log(`🔄 HoldShares sync: ${holdShares} -> ${currentHoldShares}`);
      updateHoldShares(currentHoldShares);
    }
  }, [stockHoldings]);

  // Funktion um die Anzahl verschiedener Aktien zu berechnen
  const calculateHoldShares = (): number => {
    return stockHoldings.filter(holding => holding.shares > 0).length;
  };


  const getMaxStartingCapital = (userLevel: number): number => {
    // Grundkapital: 1000€
    const baseCapital = 1000;

    // Grundbonus: 500€ pro Level
    const levelBonus = userLevel * 500;

    // 5-Level-Bonus: 1000€ alle 5 Level
    const fiveLevelBonus = Math.floor(userLevel / 5) * 1000;

    // 10-Level-Bonus: 5000€ alle 10 Level
    const tenLevelBonus = Math.floor(userLevel / 10) * 5000;

    return baseCapital + levelBonus + fiveLevelBonus + tenLevelBonus;
  };


  // Stats laden
  const loadUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const stats = await response.json();
        setPercentageProfit(stats.percentageProfit);
        setMaxWeekTrades(stats.weekTrades || 0);  // Lade den Rekord
        setTotalStocksBought(stats.totalStocksBought);
        setTotalStocksSelled(stats.totalStocksSelled);
        setHoldShares(stats.holdShares);

        console.log(`📊 Geladener WeekTrades-Rekord: ${stats.weekTrades}`);
      }
    } catch (error) {
      console.error('Stats loading error:', error);
    }
  };


  const updatePercentageProfit = async (newPercentage: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const currentStats = await fetch('http://localhost:3000/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      // Frontend-Logik: Nur senden wenn höher als aktueller Wert
      if (percentageProfit === null || newPercentage > percentageProfit) {
        await fetch('http://localhost:3000/api/stats', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            weekTrades: currentStats.weekTrades, // Nur wenn undefined
            totalStocksBought: currentStats.totalStocksBought,  // Nur wenn undefined
            totalStocksSelled: currentStats.totalStocksSelled,  // Nur wenn undefined
            holdShares: currentStats.holdShares,                // Nur wenn undefined
            percentageProfit: newPercentage
          })
        });

        // Lokalen State aktualisieren
        setPercentageProfit(newPercentage);
      }
    } catch (error) {
      console.error('Stats update error:', error);
    }
  };

  const updateWeekTradesIfHigher = async (newWeekTrades: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Aktuellen DB-Wert lesen
      const currentStats = await fetch('http://localhost:3000/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      const currentDbWeekTrades = currentStats.weekTrades || 0;

      console.log(`🔍 DB weekTrades: ${currentDbWeekTrades}, Current week: ${newWeekTrades}`);

      // NUR updaten wenn die aktuelle Woche höher ist als der DB-Rekord
      if (newWeekTrades > currentDbWeekTrades) {
        await fetch('http://localhost:3000/api/stats', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            weekTrades: newWeekTrades,  // Neuer Rekord!
            totalStocksBought: currentStats.totalStocksBought,
            totalStocksSelled: currentStats.totalStocksSelled,
            holdShares: currentStats.holdShares,
            percentageProfit: currentStats.percentageProfit
          })
        });

        setMaxWeekTrades(newWeekTrades);
        console.log(`🎉 NEUER WEEK-TRADES REKORD: ${currentDbWeekTrades} -> ${newWeekTrades}`);
      } else {
        console.log(`⏭️ Kein neuer Rekord: ${newWeekTrades} <= ${currentDbWeekTrades}`);
      }

    } catch (error) {
      console.error('WeekTrades update error:', error);
    }
  };


  const updateHoldShares = async (newHoldShares: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Aktuellen DB-Wert lesen
      const currentStats = await fetch('http://localhost:3000/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      const currentDbHoldShares = currentStats.holdShares || 0;

      console.log(`🔍 DB holdShares: ${currentDbHoldShares}, Neue holdShares: ${newHoldShares}`);

      // Nur speichern wenn höher als DB-Wert
      if (newHoldShares > currentDbHoldShares) {
        await fetch('http://localhost:3000/api/stats', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            weekTrades: currentStats.weekTrades,
            totalStocksBought: currentStats.totalStocksBought,
            totalStocksSelled: currentStats.totalStocksSelled,
            holdShares: newHoldShares,
            percentageProfit: currentStats.percentageProfit
          })
        });

        console.log(`✅ Hold Shares aktualisiert: ${currentDbHoldShares} -> ${newHoldShares}`);
        setHoldShares(newHoldShares);
      } else {
        console.log(`⏭️ Hold Shares NICHT aktualisiert: ${newHoldShares} <= ${currentDbHoldShares}`);
        // Lokalen State mit höherem DB-Wert synchronisieren
        setHoldShares(Math.max(currentDbHoldShares, newHoldShares));
      }

    } catch (error) {
      console.error('HoldShares update error:', error);
    }
  };


  // Separate Update-Funktionen für totalStocksBought und totalStocksSelled
  const updateTotalStocksBought = async (newTotal: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const currentStats = await fetch('http://localhost:3000/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      await fetch('http://localhost:3000/api/stats', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          weekTrades: currentStats.weekTrades,
          totalStocksBought: newTotal,
          totalStocksSelled: currentStats.totalStocksSelled,
          holdShares: currentStats.holdShares,
          percentageProfit: currentStats.percentageProfit
        })
      });

      console.log(`✅ TotalStocksBought aktualisiert: ${newTotal}`);
    } catch (error) {
      console.error('TotalStocksBought update error:', error);
    }
  };

  const updateTotalStocksSelled = async (newTotal: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const currentStats = await fetch('http://localhost:3000/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      await fetch('http://localhost:3000/api/stats', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          weekTrades: currentStats.weekTrades,
          totalStocksBought: currentStats.totalStocksBought,
          totalStocksSelled: newTotal,
          holdShares: currentStats.holdShares,
          percentageProfit: currentStats.percentageProfit
        })
      });

      console.log(`✅ TotalStocksSelled aktualisiert: ${newTotal}`);
    } catch (error) {
      console.error('TotalStocksSelled update error:', error);
    }
  };



  // In deiner handleCapitalSubmit Funktion
  const handleCapitalSubmit = () => {
    const amount = parseFloat(tempCapitalInput);
    const maxCapital = getMaxStartingCapital(userLevel);

    if (isNaN(amount) || amount <= 0) {
      alert('Bitte geben Sie einen gültigen Betrag ein.');
      return;
    }

    if (amount > maxCapital) {
      alert(`Das maximale Startkapital für Level ${userLevel} beträgt ${maxCapital.toLocaleString()}€`);
      return;
    }

    setStartCapital(amount);
    setCurrentBalance(amount);
    setShowCapitalPopup(false);
    setTempCapitalInput('');
  };

  // useEffect für Stats laden
  useEffect(() => {
    loadUserStats();
  }, []);

  // useEffect für Finish-Überprüfung
  useEffect(() => {
    const checkFinish = () => {
      const currentOffset = yearlyWeekOffset;

      if (currentOffset == -53 && !gameFinished) {
        const finalPortfolioValue = calculateTotalValue();
        const profit = finalPortfolioValue - startCapital;
        const percentageChange = ((finalPortfolioValue - startCapital) / startCapital) * 100;

        setFinalResults({
          startCapital,
          finalValue: finalPortfolioValue,
          percentageChange,
          profit
        });

        updatePercentageProfit(percentageChange);

        setGameFinished(true);
        setShowFinishPopup(true);
        const token = localStorage.getItem('token');
        if (token) {
          fetch('http://localhost:3000/api/evaluations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              start_budget: startCapital,
              end_budget: finalPortfolioValue,
              profit_margin: profit,
              prozentuale_aenderung: percentageChange,
              message: `Auswertung gespeichert: ${profit >= 0 ? '+' : ''}${percentageChange.toFixed(2)}%`
            })
          })
            .then(res => {
              if (!res.ok) throw new Error('Fehler beim Speichern der Auswertung');
              console.log('Auswertung erfolgreich gespeichert');
            })
            .catch(err => {
              console.error('Fehler beim Speichern der Auswertung:', err);
            });
        }

      }
    };

    checkFinish();
  }, [monthlyWeekOffset, yearlyWeekOffset, viewMode, gameFinished, startCapital]);


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
  // Aktueller Preis aus den angezeigten Daten
  const getCurrentStockPrice = (): number => {
    const displayData = getShiftedData();
    if (displayData.length === 0) return 0;
    return displayData[displayData.length - 1].close; // Rechtester Punkt
  };

  // Funktion um den aktuellen Offset basierend auf viewMode zu bekommen
  const getCurrentOffset = (): number => {
    return viewMode === 'monthly' ? monthlyWeekOffset : yearlyWeekOffset;
  };

  const getCurrentStockHolding = (): StockHolding | undefined => {
    return stockHoldings.find(holding => holding.symbol === selectedStock);
  };

  // Funktion: Überprüfe ob Trading in der aktuellen Woche erlaubt ist
  const isTradingAllowed = (): boolean => {

    // Verwende den aktuellen Offset basierend auf viewMode
    const currentOffset = yearlyWeekOffset;
    if (currentOffset < firstTradingWeek) {
      setFirstTradingWeek(currentOffset);
    }

    // ✅ KORREKT: Wenn schon gehandelt wurde, nur in der ersten Trading-Woche oder SPÄTER erlaubt
    return currentOffset <= firstTradingWeek;
  };

  let TRADING_START_YEAR = 2020; // Startjahr für Trading-Daten

  const getShiftedData = (): StockDataPoint[] => {
    if (!stockData || stockData.length === 0) return [];

    let result: StockDataPoint[] = [];

    // Verwende den entsprechenden Offset für den aktuellen ViewMode
    const currentOffset = getCurrentOffset();

    // Finde den ersten Eintrag des Startjahres
    const startYearIndex = stockData.findIndex(item =>
      item.date.getFullYear() === TRADING_START_YEAR
    );

    if (startYearIndex === -1) {
      console.error(`Startjahr ${TRADING_START_YEAR} nicht in den Daten gefunden`);
      return [];
    }

    // Berechne den Endpunkt basierend auf dem aktuellen Offset
    const endIndex = Math.min(stockData.length, startYearIndex + (currentOffset * 7));

    if (viewMode === 'monthly') {
      // Letzte 4 Wochen vor dem Endpunkt
      const daysToShow = 29;
      const startIndex = Math.max(0, endIndex - daysToShow);
      result = stockData.slice(startIndex, endIndex);
    } else {
      // Letztes Jahr vor dem Endpunkt
      const daysToShow = 365;
      const startIndex = Math.max(0, endIndex - daysToShow);
      result = stockData.slice(startIndex, endIndex);
    }

    return result.reverse(); // Chronologisch, älteste zuerst
  };


  // Synchrone Shift-Handler - beide Modi werden gleichzeitig erhöht
  const handleShiftForward = (): void => {
    if (gameFinished) return; // Verhindere weitere Shifts nach Finish

    const maxMonthlyOffset = Math.min(52, Math.floor(stockData.length / 7) - 4);
    const maxYearlyOffset = Math.min(52, Math.floor(stockData.length / 7) - 52);

    if (monthlyWeekOffset < maxMonthlyOffset && yearlyWeekOffset < maxYearlyOffset) {
      setMonthlyWeekOffset(prev => prev - 1);
      setYearlyWeekOffset(prev => prev - 1);
    }
  };



  const handleShiftBackward = (): void => {
    setMonthlyWeekOffset(prev => prev + 1);
    setYearlyWeekOffset(prev => prev + 1);
  };


  // useEffect für Monthly Offset
  useEffect(() => {
    if (!stockData || stockData.length === 0) return;

    const maxMonthlyOffset = Math.floor(stockData.length / 7) - 4;
    if (monthlyWeekOffset > maxMonthlyOffset) {
      setMonthlyWeekOffset(Math.max(0, maxMonthlyOffset));
    }
  }, [stockData, monthlyWeekOffset]);

  // useEffect für Yearly Offset
  useEffect(() => {
    if (!stockData || stockData.length === 0) return;

    const maxYearlyOffset = Math.floor(stockData.length / 7) - 52;
    if (yearlyWeekOffset > maxYearlyOffset) {
      setYearlyWeekOffset(Math.max(0, maxYearlyOffset));
    }
  }, [stockData, yearlyWeekOffset]);


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

  // Handler Functions
  const handleStockSelect = (symbol: string): void => {
    setSelectedStock(symbol);
    setError('');
  };

  const handleCompanyInfoToggle = (): void => {
    setShowCompanyInfo(!showCompanyInfo);
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
    if (!isTradingAllowed()) return;

    const buySound = new Audio('/sounds/buy2.mp3');
    buySound.play().catch((err) => console.error('Sound konnte nicht abgespielt werden:', err));
    console.log("sound wird abgespielt");

    const shares = parseInt(tempShareAmount);
    const currentPrice = getCurrentStockPrice();
    const subtotal = shares * currentPrice;
    const fee = calculateBuyFee(shares);
    const totalCost = subtotal + fee;

    // Week Trades Logik - nur State setzen, NICHT DB updaten
    if (yearlyWeekOffset === lastTradingWeek) {
      const newCurrentWeekTrades = currentWeekTrades + shares;
      setCurrentWeekTrades(newCurrentWeekTrades);
      console.log(`Current Week Trades: ${newCurrentWeekTrades}`);
    } else {
      console.log(`Wechsel von Woche ${lastTradingWeek} zu ${yearlyWeekOffset}`);
      setLastTradingWeek(yearlyWeekOffset);
      setCurrentWeekTrades(shares);
      console.log(`Neue Woche gestartet mit: ${shares} trades`);
    }

    if (shares > 0 && totalCost <= currentBalance) {
      setCurrentBalance(prev => prev - totalCost);

      // ALLE Stats-Updates INNERHALB des Trading-Blocks
      const newTotalBought = (totalStocksBought || 0) + shares;
      setTotalStocksBought(newTotalBought);
      updateTotalStocksBought(newTotalBought);

      // Week Trades DB-Update HIER (geschützt im Trading-Block)
      const currentWeekTradesValue = yearlyWeekOffset === lastTradingWeek
        ? currentWeekTrades + shares
        : shares;
      updateWeekTradesIfHigher(currentWeekTradesValue);

      let oldHoldShares = calculateHoldShares();

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
          const newHoldings = [...prev, { symbol: selectedStock, shares, averagePrice: currentPrice }];
          const newHoldShares = newHoldings.length;

          console.log(`📊 Neue Aktie hinzugefügt: ${oldHoldShares} -> ${newHoldShares}`);
          updateHoldShares(newHoldShares);

          return newHoldings;
        }
      });

      setHasTraded(true);
    }

    setShowBuyPopup(false);
    setTempShareAmount('');

    // Event für Quest-System mit ausreichender Verzögerung
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('statsUpdated'));
    }, 3000);
  };


  const handleSellSubmit = (): void => {
    if (!isTradingAllowed()) return;

    const buySound = new Audio('/sounds/buy.mp3');
    buySound.play().catch((err) => console.error('Sound konnte nicht abgespielt werden:', err));
    console.log("sound wird abgespielt");

    const shares = parseInt(tempShareAmount);
    const currentPrice = getCurrentStockPrice();
    const subtotal = shares * currentPrice;
    const fee = calculateSellFee(shares);
    const totalRevenue = subtotal - fee;
    const currentHolding = getCurrentStockHolding();

    const newTotalSelled = (totalStocksSelled || 0) + shares;
    setTotalStocksSelled(newTotalSelled);
    updateTotalStocksSelled(newTotalSelled); // Sofort in DB speichern

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

      setHasTraded(true);
    }

    setShowSellPopup(false);
    setTempShareAmount('');

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('statsUpdated'));
    }, 500);
  };


  const getCurrentStockInfo = (): StockInfo | undefined => {
    return availableStocks.find(s => s.symbol === selectedStock);
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
  const displayData = getShiftedData();

  return (
    <div style={{ position: 'relative', width: '100vw', minHeight: '80vh', marginTop: '78px' }}>
      <Header/>
      {/* Hintergrund-Overlay entfernt, da der Hintergrund jetzt über body und Container geregelt wird */}
      <div className={styles.gameContainer} style={{ position: 'relative', zIndex: 1 }}>
        {/* Startkapital Popup bleibt gleich... */}
        {showCapitalPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              <h2>Startkapital festlegen</h2>
              <p>Wie viel Geld möchtest du für das Trading verwenden?</p>

              {/* Erweiterte Level Info mit Breakdown */}
              <div className={styles.levelCapitalInfo}>
                <div className={styles.levelDisplay}>
                  <span className={styles.levelLabel}>Dein Level:</span>
                  <span className={styles.levelValue}>{userLevel}</span>
                </div>

                {/* Detaillierte Kapital-Aufschlüsselung */}
                <div className={styles.capitalBreakdown}>
                  <div className={styles.breakdownItem}>
                    <span>Grundkapital:</span>
                    <span>1.000€</span>
                  </div>
                  <div className={styles.breakdownItem}>
                    <span>Level-Bonus ({userLevel} × 500€):</span>
                    <span>{(userLevel * 500).toLocaleString()}€</span>
                  </div>
                  {Math.floor(userLevel / 5) > 0 && (
                    <div className={styles.breakdownItem}>
                      <span>5-Level-Bonus ({Math.floor(userLevel / 5)} × 1.000€):</span>
                      <span>{(Math.floor(userLevel / 5) * 1000).toLocaleString()}€</span>
                    </div>
                  )}
                  {Math.floor(userLevel / 10) > 0 && (
                    <div className={styles.breakdownItem}>
                      <span>10-Level-Bonus ({Math.floor(userLevel / 10)} × 5.000€):</span>
                      <span>{(Math.floor(userLevel / 10) * 5000).toLocaleString()}€</span>
                    </div>
                  )}
                  <div className={styles.breakdownTotal}>
                    <span>Maximales Startkapital:</span>
                    <span>{maxStartingCapital.toLocaleString()}€</span>
                  </div>
                </div>
              </div>

              <input
                type="number"
                value={tempCapitalInput}
                onChange={(e) => setTempCapitalInput(e.target.value)}
                placeholder={`z.B. ${Math.min(25000, maxStartingCapital)}`}
                className={styles.popupInput}
                min="1"
                max={maxStartingCapital}
                step="0.01"
              />

              {/* Validierungs-Hinweis */}
              {tempCapitalInput && parseFloat(tempCapitalInput) > maxStartingCapital && (
                <div className={styles.validationError}>
                  ⚠️ Betrag überschreitet das maximale Startkapital von {maxStartingCapital.toLocaleString()}€
                </div>
              )}

              <div className={styles.popupButtons}>
                <button
                  onClick={handleCapitalSubmit}
                  className={styles.popupButtonPrimary}
                  disabled={
                    !tempCapitalInput ||
                    parseFloat(tempCapitalInput) <= 0 ||
                    parseFloat(tempCapitalInput) > maxStartingCapital
                  }
                >
                  Bestätigen
                </button>
                <button
                  onClick={() => {
                    setShowCapitalPopup(false);
                    setTempCapitalInput('');
                  }}
                  className={styles.popupButtonSecondary}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        )}


        {/* NEU: Company Info Button */}
        <div className={styles.companyInfoButtonContainer}>
          <button
            onClick={handleCompanyInfoToggle}
            className={styles.companyInfoButton}
          >
            <span className={styles.companyInfoButtonIcon}></span>
            Unternehmensinformationen
            <span className={styles.companyInfoButtonArrow}>
              {showCompanyInfo ? '▼' : '▶'}
            </span>
          </button>
        </div>

        {/* NEU: Company Info Panel */}
        <CompanyInfo
          isOpen={showCompanyInfo}
          onToggle={handleCompanyInfoToggle}
          stockSymbol={selectedStock}
          stockColor={currentStockInfo?.color || '#2563eb'}
        />


        {/* ERWEITERTE Buy Popup mit Max-Button */}
        {showBuyPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              <h2>Aktien kaufen</h2>
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
              <h2>Aktien verkaufen</h2>
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
            userLevel={userLevel}
            getRequiredLevelForStock={getRequiredLevelForStock}
          />


          <main className={styles.mainContent}>
            <header className={styles.appHeader}>
              <h1>{currentStockInfo?.name || 'Trading'}</h1>
              <img
                src={`/logos/${currentStockInfo?.name.toLowerCase() || 'default'}.png`}
                className={styles.logoImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </header>

            {/* Erweiterte Navigation Container */}
            <div className={styles.navigationContainer}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className={viewMode === 'monthly' ? styles.navButton : styles.navButtonSecondary}
                  onClick={() => setViewMode('monthly')}
                >
                  Letzte 4 Wochen
                </button>
                <button
                  className={viewMode === 'yearly' ? styles.navButton : styles.navButtonSecondary}
                  onClick={() => setViewMode('yearly')}
                >
                  Letztes Jahr
                </button>

                {/* Erweiterte Shift-Controls mit Finish-Button */}
                <div className={styles.shiftControls}>
                  <button
                    className={styles.shiftButton}
                    onClick={handleShiftBackward}
                    disabled={monthlyWeekOffset === 0 || yearlyWeekOffset === 0 || gameFinished}
                  >
                    ◀
                  </button>

                  <div className={styles.offsetDisplay}>
                    <span className={styles.currentModeOffset}>
                      Woche: {Math.abs(yearlyWeekOffset)}
                    </span>

                  </div>

                  {/* Bedingter Button mit korrekter 52-Wochen-Logik */}
                  {(yearlyWeekOffset <= -52) ? (
                    <button
                      className={styles.finishButton}
                      onClick={handleShiftForward}
                    >
                      🏁 Finish
                    </button>
                  ) : (
                    <button
                      className={styles.shiftButton}
                      onClick={handleShiftForward}
                      disabled={
                        monthlyWeekOffset >= 52 ||
                        yearlyWeekOffset >= 52 ||
                        gameFinished
                      }
                    >
                      ▶
                    </button>
                  )}
                </div>

              </div>

              <div className={styles.balanceDisplay}>
                <span className={styles.balanceLabel}>Bargeld:</span>
                <span className={styles.balanceValue}>{currentBalance.toFixed(2)}€</span>
              </div>
            </div>


            {/* Rest der Komponente bleibt gleich... */}
            <StockChart
              data={displayData}  // ✅ Richtig
              stockColor={currentStockInfo?.color || '#2563eb'}
            />
            <div className={styles.tradingPanel}>
              <div className={styles.stockPosition}>
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
                  <span className={styles.positionLabel}>Startkapital:</span>
                  <span className={styles.positionValue}>{startCapital.toFixed(2)}€</span>
                </div>
              </div>

              {/* ✅ FESTE HÖHE für Trading-Info - verhindert Layout-Sprung */}
              <div className={styles.tradingInfoContainer}>
                {isTradingAllowed() ? (
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
                        Kaufen
                      </button>
                      <button
                        onClick={handleSellClick}
                        className={styles.sellButton}
                        disabled={getMaxSellableShares() === 0}
                      >
                        Verkaufen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.lockContent}>
                    <span className={styles.lockIcon}>🔒</span>
                    <span className={styles.lockText}>Trading gesperrt</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats bleiben unverändert... */}
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Datenpunkte im Zeitraum:</span>
                <span className={styles.statValue}>{displayData.length}</span>
              </div>
              {displayData.length > 0 && (
                <>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Höchster Kurs:</span>
                    <span className={styles.statValue}>
                      {Math.max(...displayData.map(d => d.close)).toFixed(2)}€
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Niedrigster Kurs:</span>
                    <span className={styles.statValue}>
                      {Math.min(...displayData.map(d => d.close)).toFixed(2)}€
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Durchschnittskurs:</span>
                    <span className={styles.statValue}>
                      {(displayData.reduce((sum, d) => sum + d.close, 0) / displayData.length).toFixed(2)}€
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Entwicklung:</span>
                    <span className={`${styles.statValue} ${displayData.length > 1 &&
                      displayData[displayData.length - 1].close > displayData[0].close
                      ? styles.statValuePositive : styles.statValueNegative
                      }`}>
                      {displayData.length > 1 ? (
                        ((displayData[displayData.length - 1].close - displayData[0].close) / displayData[0].close * 100).toFixed(2)
                      ) : '0.00'}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
      {/* ✅ NEU: Finish-Popup */}
      {showFinishPopup && finalResults && (
        <div className={styles.popupOverlay}>
          <div className={styles.finishPopup}>
            <div className={styles.finishHeader}>
              <h2 className={styles.finishTitle}>Spiel beendet!</h2>
              <p className={styles.finishSubtitle}>52 Wochen Trading abgeschlossen</p>
            </div>

            <div className={styles.finishContent}>
              <div className={styles.resultCard}>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Startkapital:</span>
                  <span className={styles.resultValue}>{finalResults.startCapital.toFixed(2)}€</span>
                </div>

                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Endwert Portfolio:</span>
                  <span className={styles.resultValue}>{finalResults.finalValue.toFixed(2)}€</span>
                </div>

                <div className={styles.resultDivider}></div>

                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Gewinn/Verlust:</span>
                  <span className={`${styles.resultValue} ${finalResults.profit >= 0 ? styles.resultPositive : styles.resultNegative
                    }`}>
                    {finalResults.profit >= 0 ? '+' : ''}{finalResults.profit.toFixed(2)}€
                  </span>
                </div>

                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Prozentuale Änderung:</span>
                  <span className={`${styles.resultValue} ${styles.resultPercentage} ${finalResults.percentageChange >= 0 ? styles.resultPositive : styles.resultNegative
                    }`}>
                    {finalResults.percentageChange >= 0 ? '+' : ''}{finalResults.percentageChange.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className={styles.performanceIndicator}>
                {finalResults.percentageChange >= 20 ? (
                  <div className={styles.performanceExcellent}>
                    <span className={styles.performanceText}>Exzellente Performance!</span>
                  </div>
                ) : finalResults.percentageChange >= 10 ? (
                  <div className={styles.performanceGood}>
                    <span className={styles.performanceText}>Gute Performance!</span>
                  </div>
                ) : finalResults.percentageChange > 0 ? (
                  <div className={styles.performanceNeutral}>
                    <span className={styles.performanceText}>Positive Performance</span>
                  </div>
                ) : finalResults.percentageChange == 0 ? (
                  <div className={styles.performanceNeutral}>
                    <span className={styles.performanceText}>Hast du überhaupt gespielt?</span>
                  </div>
                ) : (
                  <div className={styles.performancePoor}>
                    <span className={styles.performanceText}>Verlust gemacht</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.finishActions}>
              <button
                onClick={() => window.location.href = '/home'}
                className={styles.finishCloseButton}
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Game;
