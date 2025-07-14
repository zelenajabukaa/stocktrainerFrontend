export interface StockInfo {
    symbol: string;
    name: string;
    filename: string;
    color: string;
}

export const AVAILABLE_STOCKS: StockInfo[] = [
    { symbol: 'NVDA', name: 'Nvidia', filename: 'nvidia.csv', color: '#10b981' },
    { symbol: 'AMZN', name: 'Amazon', filename: 'amazon.csv', color: '#f59e0b' },
    { symbol: 'AAPL', name: 'Apple', filename: 'apple.csv', color: '#6366f1' },
    { symbol: 'BA', name: 'Boeing', filename: 'boeing.csv', color: '#1d428a' },
    { symbol: 'KO', name: 'Coca-Cola', filename: 'cola.csv', color: '#e41a1c' },
    { symbol: 'DIS', name: 'Disney', filename: 'disney.csv', color: '#ef4444' },
    { symbol: 'EBAY', name: 'eBay', filename: 'ebay.csv', color: '#86b817' },
    { symbol: 'GOOGL', name: 'Google', filename: 'google.csv', color: '#4285f4' },
    { symbol: 'HON', name: 'Honeywell', filename: 'honeywell.csv', color: '#ffb300' },
    { symbol: 'INTC', name: 'Intel', filename: 'intel.csv', color: '#0071c5' },
    { symbol: 'MA', name: 'MasterCard', filename: 'masterCard.csv', color: '#ff5f00' },
    { symbol: 'MCD', name: 'McDonalds', filename: 'mcDonalds.csv', color: '#fbff00ff' },
    { symbol: 'META', name: 'Meta', filename: 'meta.csv', color: '#9c9c9cff' },
    { symbol: 'MSFT', name: 'Microsoft', filename: 'microsoft.csv', color: '#0078d4' },
    { symbol: 'NFLX', name: 'Netflix', filename: 'netflix.csv', color: '#e50914' },
    { symbol: 'NKE', name: 'Nike', filename: 'nike.csv', color: '#111111' },
    { symbol: 'ORCL', name: 'Oracle', filename: 'oracle.csv', color: '#f80000' },
    { symbol: 'PYPL', name: 'PayPal', filename: 'payPal.csv', color: '#003087' },
    { symbol: 'PEP', name: 'PepsiCo', filename: 'pepsiCo.csv', color: '#005cb4' },
    { symbol: 'PFE', name: 'Pfizer', filename: 'pfizer.csv', color: '#0093d0' },
    { symbol: 'SBUX', name: 'Starbucks', filename: 'starbucks.csv', color: '#00704a' },
    { symbol: 'TSLA', name: 'Tesla', filename: 'tesla.csv', color: '#cc0000' },
    { symbol: 'UNH', name: 'UnitedHealth', filename: 'unitedHealthGroup.csv', color: '#005da6' },
    { symbol: 'V', name: 'Visa', filename: 'visa.csv', color: '#1a1f71' },
    { symbol: 'WMT', name: 'Walmart', filename: 'walmart.csv', color: '#0071ce' },
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
