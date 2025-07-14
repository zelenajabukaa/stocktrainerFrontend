import React from 'react';

interface MonthNavigatorProps {
    currentMonth: string;
    onMonthChange: (month: string) => void;
    availableMonths: string[];
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({
    currentMonth,
    onMonthChange,
    availableMonths
}) => {
    const currentIndex = availableMonths.indexOf(currentMonth);

    const goToPreviousMonth = (): void => {
        if (currentIndex > 0) {
            onMonthChange(availableMonths[currentIndex - 1]);
        }
    };

    const goToNextMonth = (): void => {
        if (currentIndex < availableMonths.length - 1) {
            onMonthChange(availableMonths[currentIndex + 1]);
        }
    };

    const formatMonthDisplay = (monthKey: string): string => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long'
        });
    };

    return (
        <div className="month-navigator">
            <button
                onClick={goToPreviousMonth}
                disabled={currentIndex === 0}
                className="nav-button"
            >
                ← Vorheriger Monat
            </button>

            <span className="current-month">
                {formatMonthDisplay(currentMonth)}
            </span>

            <button
                onClick={goToNextMonth}
                disabled={currentIndex === availableMonths.length - 1}
                className="nav-button"
            >
                Nächster Monat →
            </button>
        </div>
    );
};

export default MonthNavigator;
