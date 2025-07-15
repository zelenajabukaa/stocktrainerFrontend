export interface WeeklyStockDataPoint {
    week: number;
    year: number;
    weekStart: Date;
    weekEnd: Date;
    close: number;
    weekString: string;
    closeString: string;
}

export interface GroupedWeeklyData {
    [yearKey: string]: WeeklyStockDataPoint[];
}

export const parseWeeklyData = (csvContent: string): WeeklyStockDataPoint[] => {
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
    const weeklyData: { [key: string]: any[] } = {};

    dailyData.forEach(item => {
        const year = item.date.getFullYear();
        const week = getWeekNumber(item.date);
        const weekKey = `${year}-W${week}`;

        if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = [];
        }
        weeklyData[weekKey].push(item);
    });

    // Konvertiere zu wöchentlichen Datenpunkten (letzter Tag der Woche)
    const weeklyPoints: WeeklyStockDataPoint[] = [];

    Object.keys(weeklyData).forEach(weekKey => {
        const weekData = weeklyData[weekKey];
        const lastDayOfWeek = weekData[weekData.length - 1]; // Letzter Tag der Woche

        const [year, weekStr] = weekKey.split('-W');
        const week = parseInt(weekStr);

        const weekStart = getWeekStartDate(parseInt(year), week);
        const weekEnd = getWeekEndDate(parseInt(year), week);

        weeklyPoints.push({
            week,
            year: parseInt(year),
            weekStart,
            weekEnd,
            close: lastDayOfWeek.close,
            weekString: `W${week} ${year}`,
            closeString: lastDayOfWeek.closeString
        });
    });

    return weeklyPoints.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.week - b.week;
    });
};

export const groupWeeklyDataByYear = (data: WeeklyStockDataPoint[]): GroupedWeeklyData => {
    const grouped: GroupedWeeklyData = {};

    data.forEach(item => {
        const yearKey = item.year.toString();

        if (!grouped[yearKey]) {
            grouped[yearKey] = [];
        }
        grouped[yearKey].push(item);
    });

    return grouped;
};

// Helper Functions
const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const getWeekStartDate = (year: number, week: number): Date => {
    const jan1 = new Date(year, 0, 1);
    const daysToFirstMonday = (8 - jan1.getDay()) % 7;
    const firstMonday = new Date(year, 0, 1 + daysToFirstMonday);
    return new Date(firstMonday.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
};

const getWeekEndDate = (year: number, week: number): Date => {
    const weekStart = getWeekStartDate(year, week);
    return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
};
