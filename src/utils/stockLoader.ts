export interface StockInfo {
    symbol: string;
    name: string;
    filename: string;
    color: string;
    buyFee: number;  // Kaufgebühr in Prozent (z.B. 0.5 = 0.5%)
    sellFee: number; // Verkaufsgebühr in Prozent (z.B. 0.3 = 0.3%)
}
export const AVAILABLE_STOCKS: StockInfo[] = [
    { symbol: 'NVDA', name: 'Nvidia', filename: 'nvidia.csv', color: '#10b981', buyFee: 0.5, sellFee: 0.3 },
    { symbol: 'AMZN', name: 'Amazon', filename: 'amazon.csv', color: '#f59e0b', buyFee: 0.7, sellFee: 0.4 },
    { symbol: 'AAPL', name: 'Apple', filename: 'apple.csv', color: '#6366f1', buyFee: 0.3, sellFee: 0.2 },
    { symbol: 'BA', name: 'Boeing', filename: 'boeing.csv', color: '#1d428a', buyFee: 1.2, sellFee: 0.8 },
    { symbol: 'KO', name: 'Coca-Cola', filename: 'cola.csv', color: '#e41a1c', buyFee: 0.6, sellFee: 0.4 },
    { symbol: 'DIS', name: 'Disney', filename: 'disney.csv', color: '#ef4444', buyFee: 0.9, sellFee: 0.5 },
    { symbol: 'EBAY', name: 'eBay', filename: 'ebay.csv', color: '#86b817', buyFee: 0.4, sellFee: 0.2 },
    { symbol: 'GOOGL', name: 'Google', filename: 'google.csv', color: '#4285f4', buyFee: 0.8, sellFee: 0.6 },
    { symbol: 'HON', name: 'Honeywell', filename: 'honeywell.csv', color: '#ffb300', buyFee: 1.5, sellFee: 1.0 },
    { symbol: 'INTC', name: 'Intel', filename: 'intel.csv', color: '#0071c5', buyFee: 0.2, sellFee: 0.1 },
    { symbol: 'MA', name: 'MasterCard', filename: 'masterCard.csv', color: '#ff5f00', buyFee: 0.7, sellFee: 0.5 },
    { symbol: 'MCD', name: 'McDonalds', filename: 'mcDonalds.csv', color: '#fbff00ff', buyFee: 1.0, sellFee: 0.7 },
    { symbol: 'META', name: 'Meta', filename: 'meta.csv', color: '#9c9c9cff', buyFee: 0.6, sellFee: 0.4 },
    { symbol: 'MSFT', name: 'Microsoft', filename: 'microsoft.csv', color: '#0078d4', buyFee: 0.5, sellFee: 0.3 },
    { symbol: 'NFLX', name: 'Netflix', filename: 'netflix.csv', color: '#e50914', buyFee: 1.8, sellFee: 1.2 },
    { symbol: 'NKE', name: 'Nike', filename: 'nike.csv', color: '#ecf0ffff', buyFee: 0.4, sellFee: 0.2 },
    { symbol: 'ORCL', name: 'Oracle', filename: 'oracle.csv', color: '#f80000', buyFee: 0.9, sellFee: 0.6 },
    { symbol: 'PYPL', name: 'PayPal', filename: 'payPal.csv', color: '#003087', buyFee: 0.3, sellFee: 0.2 },
    { symbol: 'PEP', name: 'PepsiCo', filename: 'pepsiCo.csv', color: '#005cb4', buyFee: 0.8, sellFee: 0.5 },
    { symbol: 'PFE', name: 'Pfizer', filename: 'pfizer.csv', color: '#0093d0', buyFee: 1.3, sellFee: 1.0 },
    { symbol: 'SBUX', name: 'Starbucks', filename: 'starbucks.csv', color: '#00704a', buyFee: 0.7, sellFee: 0.4 },
    { symbol: 'TSLA', name: 'Tesla', filename: 'tesla.csv', color: '#cc0000', buyFee: 2.5, sellFee: 1.5 },
    { symbol: 'UNH', name: 'UnitedHealth', filename: 'unitedHealthGroup.csv', color: '#005da6', buyFee: 0.5, sellFee: 0.3 },
    { symbol: 'V', name: 'Visa', filename: 'visa.csv', color: '#1a1f71', buyFee: 0.6, sellFee: 0.4 },
    { symbol: 'WMT', name: 'Walmart', filename: 'walmart.csv', color: '#0071ce', buyFee: 5.0, sellFee: 3.0 },
];

export const loadAvailableStocks = async (): Promise<StockInfo[]> => {
    const availableStocks: StockInfo[] = [];

    for (const stock of AVAILABLE_STOCKS) {
        try {
            const response = await fetch(`/${stock.filename}`);
            if (response.ok) {
                availableStocks.push(stock);
            }
        } catch (error) {
            console.log(`${stock.filename} nicht verfügbar`);
        }
    }

    return availableStocks;
};

export const loadStockData = async (filename: string): Promise<string> => {
    const response = await fetch(`/${filename}`);
    if (!response.ok) {
        throw new Error(`Datei ${filename} konnte nicht geladen werden`);
    }
    return response.text();
};

