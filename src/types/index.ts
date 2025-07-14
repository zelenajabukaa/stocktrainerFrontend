export interface StockDataPoint {
    date: Date;
    close: number;
    dateString: string;
    closeString: string;
}

export interface GroupedStockData {
    [monthKey: string]: StockDataPoint[];
}

export const parseNvidiaCSV = (csvContent: string): StockDataPoint[] => {
    const lines = csvContent.trim().split('\n').slice(1); // Skip header

    return lines.map(line => {
        // Split nur beim ersten Komma
        const firstCommaIndex = line.indexOf(',');
        const date = line.substring(0, firstCommaIndex);
        let close = line.substring(firstCommaIndex + 1);

        // Entferne Anführungszeichen und letztes Komma falls vorhanden
        close = close.replace(/"/g, '').replace(/,$/, '');

        // Konvertiere deutsche Dezimalzahl zu JavaScript-Float
        const closeValue = parseFloat(close.replace(',', '.'));

        // Parse Datum
        const [datePart] = date.split(' ');
        const [day, month, year] = datePart.split('.');
        const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

        return {
            date: parsedDate,
            close: closeValue,
            dateString: date,
            closeString: close
        };
    });
};

export const groupDataByMonth = (data: StockDataPoint[]): GroupedStockData => {
    const grouped: GroupedStockData = {};

    data.forEach(item => {
        const monthKey = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`;

        if (!grouped[monthKey]) {
            grouped[monthKey] = [];
        }
        grouped[monthKey].push(item);
    });

    return grouped;
};
