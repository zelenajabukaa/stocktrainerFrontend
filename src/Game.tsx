import React, { useEffect, useState } from "react";
import StockChart from "./components/StockChart";

type StockEntry = {
  date: string;   // z.B. "2023-05-15"
  symbol: string;
  close: number;
};

const Game: React.FC = () => {
  const [stockData, setStockData] = useState<StockEntry[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    fetch("/stock_data.json")
      .then((res) => res.json())
      .then((data: StockEntry[]) => {
        setStockData(data);
        const uniqueSymbols = Array.from(new Set(data.map(d => d.symbol)));
        setSymbols(uniqueSymbols);
        setSelectedSymbol(uniqueSymbols[0] || "");

        // Alle verfügbaren Monate extrahieren (Format: "2023-05")
        const uniqueMonths = Array.from(
          new Set(data.map(d => d.date.slice(0, 7)))
        ).sort();
        setMonths(uniqueMonths);
        setSelectedMonth(uniqueMonths[0] || "");
      });
  }, []);

  // Filter für gewähltes Symbol und Monat
  const filteredData = stockData.filter(
    d => d.symbol === selectedSymbol && d.date.startsWith(selectedMonth)
  );

  return (
    <div className="container">
      <h1>Aktien-Chart (Monatsgenau)</h1>
      <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)}>
        {symbols.map(symbol => (
          <option key={symbol} value={symbol}>{symbol}</option>
        ))}
      </select>
      <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
        {months.map(month => (
          <option key={month} value={month}>
            {new Date(month + "-01").toLocaleString("de-CH", { year: "numeric", month: "long" })}
          </option>
        ))}
      </select>
      <StockChart data={filteredData} symbol={selectedSymbol} month={selectedMonth} />
    </div>
  );
};

export default Game;
