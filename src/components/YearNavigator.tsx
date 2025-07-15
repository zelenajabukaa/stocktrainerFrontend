import React from 'react';
import styles from '../Weekly.module.css';

interface YearNavigatorProps {
    currentYear: string;
    onYearChange: (year: string) => void;
    availableYears: string[];
}

const YearNavigator: React.FC<YearNavigatorProps> = ({
    currentYear,
    onYearChange,
    availableYears
}) => {
    const currentIndex = availableYears.indexOf(currentYear);

    const goToPreviousYear = (): void => {
        if (currentIndex > 0) {
            onYearChange(availableYears[currentIndex - 1]);
        }
    };

    const goToNextYear = (): void => {
        if (currentIndex < availableYears.length - 1) {
            onYearChange(availableYears[currentIndex + 1]);
        }
    };

    return (
        <div className={styles.yearNavigator}>
            <button
                onClick={goToPreviousYear}
                disabled={currentIndex === 0}
                className={styles.navButton}
            >
                ← Vorheriges Jahr
            </button>

            <span className={styles.currentYear}>
                {currentYear}
            </span>

            <button
                onClick={goToNextYear}
                disabled={currentIndex === availableYears.length - 1}
                className={styles.navButton}
            >
                Nächstes Jahr →
            </button>
        </div>
    );
};

export default YearNavigator;
