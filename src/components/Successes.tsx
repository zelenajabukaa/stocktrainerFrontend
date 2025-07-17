import React from 'react';
import styles from '../css/Successes.module.css';
import Header from './Header';

const successTypes = [
  {
    key: 'activity',
    label: 'Activity',
    max: 8,
    desc: 'Complete general platform actions such as logging in, viewing pages, or exploring features.'
  },
  {
    key: 'buy',
    label: 'Buy',
    max: 9,
    desc: 'Earn achievements by purchasing stocks and expanding your portfolio.'
  },
  {
    key: 'diversify',
    label: 'Diversify',
    max: 6,
    desc: 'Unlock rewards for investing in different industries or companies.'
  },
  {
    key: 'sell',
    label: 'Sell',
    max: 9,
    desc: 'Reach milestones by selling stocks and realizing profits (or losses).'
  },
  {
    key: 'special',
    label: 'Special',
    max: 7,
    desc: 'Achieve unique challenges or rare in-game actions — only for the most dedicated traders!'
  },
];

const Successes: React.FC = () => {
  return (
    <div className={styles.successesContainer}>
      <Header username="Username" level={1} ingameCurrency={0} />
      <h2 className={styles.successesTitle}>Badges & Successes</h2>
      <div className={styles.successesList + ' ' + styles.successesListLarge}>
        {successTypes.map((type, idx) => {
          // Nur Activity ist freigeschaltet und fertig, Rest ist locked
          const isUnlocked = idx === 0;
          const isComplete = idx === 0;
          return (
            <div
              key={type.key}
              className={
                styles.successCard +
                ' ' + styles.successCardLarge +
                (!isUnlocked ? ' ' + styles.successCardLocked : '') +
                (isComplete ? ' ' + styles.successCardComplete : '')
              }
            >
              <span style={{ fontWeight: 700, fontSize: '2.1rem', marginBottom: 18, display: 'block' }}>{type.label}</span>
              <div className={styles.progressBarWrapper}>
                <div
                  className={styles.progressBarBg}
                  style={!isUnlocked ? { opacity: 0.4, filter: 'grayscale(1)' } : {}}
                >
                  <div
                    className={styles.progressBarFill}
                    style={{
                      width: isUnlocked ? '100%' : '0%',
                      boxShadow: isComplete ? '0 0 16px 4px #fff, 0 0 32px 8px #38f7a1' : 'none',
                      background: isComplete ? 'linear-gradient(90deg, #38f7a1 0%, #fff 100%)' : '#fff4',
                    }}
                  />
                </div>
                <span
                  className={styles.progressBarText}
                  style={!isUnlocked ? { opacity: 0.5 } : {}}
                >
                  {isUnlocked ? `${type.max} / ${type.max}` : `0 / ${type.max}`}
                </span>
              </div>
              <span className={styles.successDesc}>{type.desc}</span>
              {!isUnlocked && (
                <span className={styles.lockedText}>Locked</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Successes;
