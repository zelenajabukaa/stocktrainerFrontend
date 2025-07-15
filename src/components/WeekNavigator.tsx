import React from 'react';
import styles from '../Weekly.module.css';

interface WeekNavigatorProps {
    currentWeekKey: string;
    onWeekChange: (weekKey: string) => void;
    availableWeeks: string[];
    weekString: string;
}

const WeekNavigator: React.FC<WeekNavigatorProps> = ({
    currentWeekKey,
    onWeekChange,
    availableWeeks,
    weekString
}) => {
    const currentIndex = availableWeeks.indexOf(currentWeekKey);

    const goToPreviousWeek = (): void => {
        if (currentIndex > 0) {
            onWeekChange(availableWeeks[currentIndex - 1]);
        }
    };

    const goToNextWeek = (): void => {
        if (currentIndex < availableWeeks.length - 1) {
            onWeekChange(availableWeeks[currentIndex + 1]);
        }
    };

    return (
        <div className={styles.weekNavigator}>
            <button
                onClick={goToPreviousWeek}
                disabled={currentIndex === 0}
                className={styles.navButton}
            >
                ← Vorherige Woche
            </button>

            <span className={styles.currentWeek}>
                {weekString}
            </span>

            <button
                onClick={goToNextWeek}
                disabled={currentIndex === availableWeeks.length - 1}
                className={styles.navButton}
            >
                Nächste Woche →
            </button>
        </div>
    );
};

export default WeekNavigator;
