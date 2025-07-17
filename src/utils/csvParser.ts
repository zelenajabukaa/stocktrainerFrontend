// Definiere ein Interface für einen einzelnen Datenpunkt einer Aktie
export interface StockDataPoint {
    date: Date;           // Das Datum als JavaScript Date-Objekt
    close: number;        // Schlusskurs als Zahl (z.B. 123.45)
    dateString: string;   // Das Datum als String (z.B. "01.06.2024")
    closeString: string;  // Schlusskurs als String (z.B. "123,45")
}

// Definiere ein Interface für gruppierte Daten nach Monat
export interface GroupedStockData {
    [monthKey: string]: StockDataPoint[]; // z.B. "2024-06": [ ... ]
}

// Funktion zum Parsen des CSV-Inhalts von Nvidia-Aktien
export const parseNvidiaCSV = (csvContent: string): StockDataPoint[] => {
    // Entferne Leerzeichen am Anfang/Ende und teile die Zeilen auf
    // slice(1) überspringt die Kopfzeile (Header)
    const lines = csvContent.trim().split('\n').slice(1);

    // Gehe jede Zeile durch und wandle sie in ein StockDataPoint-Objekt um
    const parsedData = lines.map(line => {
        // Finde das erste Komma (trennt Datum und Schlusskurs)
        const firstCommaIndex = line.indexOf(',');
        // Hole das Datum als String
        const date = line.substring(0, firstCommaIndex);
        // Hole den Schlusskurs als String
        let close = line.substring(firstCommaIndex + 1);

        // Entferne Anführungszeichen und ein eventuelles Komma am Ende
        close = close.replace(/"/g, '').replace(/,$/, '');

        // Ersetze das deutsche Komma durch einen Punkt und wandle in eine Zahl um
        const closeValue = parseFloat(close.replace(',', '.'));

        // Zerlege das Datum (z.B. "01.06.2024") in Tag, Monat, Jahr
        const [datePart] = date.split(' ');
        const [day, month, year] = datePart.split('.');
        // Erstelle ein Date-Objekt (Monat - 1, weil JS Monate bei 0 startet)
        const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

        // Gib das Ergebnis als Objekt zurück
        return {
            date: parsedDate,
            close: closeValue,
            dateString: date,
            closeString: close
        };
    });

    // Umkehren der Reihenfolge, damit die Daten chronologisch sind (älteste zuerst)
    return parsedData.reverse();
};

// Funktion zum Gruppieren der Daten nach Monat
export const groupDataByMonth = (data: StockDataPoint[]): GroupedStockData => {
    const grouped: GroupedStockData = {};

    // Gehe jeden Datenpunkt durch
    data.forEach(item => {
        // Erstelle einen Schlüssel für den Monat, z.B. "2024-06"
        const monthKey = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`;

        // Falls es diesen Monat noch nicht gibt, erstelle ein leeres Array
        if (!grouped[monthKey]) {
            grouped[monthKey] = [];
        }
        // Füge den Datenpunkt zum passenden Monat hinzu
        grouped[monthKey].push(item);
    });

    // Gib das gruppierte Ergebnis zurück
    return grouped;
};
