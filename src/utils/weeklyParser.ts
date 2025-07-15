export interface WeeklyStockDataPoint {
    date: Date;
    close: number;
    dateString: string;
    closeString: string;
}

export interface WeekData {
    weekKey: string;
    year: number;
    week: number;
    weekStart: Date;
    weekEnd: Date;
    dailyData: WeeklyStockDataPoint[];
    lastDayPrice: number;
    weekString: string;
}

export const parseWeeklyData = (csvContent: string): WeekData[] => {
    const lines = csvContent.trim().split('\n').slice(1);

    const dailyData = lines.map(line => {
        const firstCommaIndex = line.indexOf(',');
        const date = line.substring(0, firstCommaIndex);
        let close = line.substring(firstCommaIndex + 1);

        close = close.replace(/"/g, '').replace(/,$/, '');
        const closeValue = parseFloat(close.replace(',', '.'));

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

    // Gruppiere nach Wochen
    const weeklyGroups: { [key: string]: WeeklyStockDataPoint[] } = {};

    dailyData.forEach(item => {
        const year = item.date.getFullYear();
        const week = getWeekNumber(item.date);
        const weekKey = `${year}-W${week.toString().padStart(2, '0')}`;

        if (!weeklyGroups[weekKey]) {
            weeklyGroups[weekKey] = [];
        }
        weeklyGroups[weekKey].push(item);
    });

    // Konvertiere zu WeekData Array
    const weekDataArray: WeekData[] = [];

    Object.keys(weeklyGroups).forEach(weekKey => {
        const weekData = weeklyGroups[weekKey];
        const [yearStr, weekStr] = weekKey.split('-W');
        const year = parseInt(yearStr);
        const week = parseInt(weekStr);

        // Sortiere Tage innerhalb der Woche
        weekData.sort((a, b) => a.date.getTime() - b.date.getTime());

        const weekStart = weekData[0].date;
        const weekEnd = weekData[weekData.length - 1].date;
        const lastDayPrice = weekData[weekData.length - 1].close; // Letzter Tag der Woche

        weekDataArray.push({
            weekKey,
            year,
            week,
            weekStart,
            weekEnd,
            dailyData: weekData,
            lastDayPrice,
            weekString: `Woche ${week}, ${year}`
        });
    });

    return weekDataArray.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.week - b.week;
    });
};

// Helper Functions
const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};
