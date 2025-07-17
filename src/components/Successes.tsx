import React from 'react';
import styles from '../css/Successes.module.css';
import Header from './Header';

const successTypes = [
  {
    key: 'activity',
    label: 'Activity',
    current: 8,
    max: 8,
    image: '/successes/activity.png', // <--- Bildpfad
    desc: 'Complete general platform actions such as logging in, viewing pages, or exploring features.'
  },
  {
    key: 'buy',
    label: 'Buy',
    current: 1,
    max: 9,
    image: '/successes/buy.png',
    desc: 'Earn achievements by purchasing stocks and expanding your portfolio.'
  },
  {
    key: 'diversify',
    label: 'Diversify',
    current: 0,
    max: 6,
    image: '/successes/diversify.png',
    desc: 'Unlock rewards for investing in different industries or companies.'
  },
  {
    key: 'sell',
    label: 'Sell',
    current: 0,
    max: 9,
    image: '/successes/sell.png',
    desc: 'Reach milestones by selling stocks and realizing profits (or losses).'
  },
  {
    key: 'special',
    label: 'Special',
    current: 0,
    max: 7,
    image: '/successes/special.png',
    desc: 'Achieve unique challenges or rare in-game actions — only for the most dedicated traders!'
  },
];

const Successes: React.FC = () => {
  return (
    <div className={styles.successesContainer}>
      <Header username="Username" level={1} ingameCurrency={0} />
      <h2 className={styles.successesTitle}>Abzeichen</h2>

      <div className={styles.successesGrid}>
        {successTypes.map((type, idx) => {
          const isUnlocked = idx === 0 || type.current > 0;
          const isComplete = type.current === type.max;
          const progressPercent = Math.min((type.current / type.max) * 100, 100);

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
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '2.1rem',
                  marginBottom: 18,
                  display: 'block',
                }}
              >
                {type.label}
              </span>

              {/* Nur wenn Bild existiert */}
              {type.image && (
                <img
                  src={type.image}
                  alt={`${type.label} Badge`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '1rem',
                    marginBottom: '1rem',
                  }}
                />
              )}

              <div className={styles.progressBarWrapper}>
                <div
                  className={styles.progressBarBg}
                  style={!isUnlocked ? { opacity: 0.4, filter: 'grayscale(1)' } : {}}
                >
                  <div
                    className={styles.progressBarFill}
                    style={{
                      width: `${progressPercent}%`,
                      boxShadow: isComplete
                        ? '0 0 16px 4px #fff, 0 0 32px 8px #38f7a1'
                        : 'none',
                      background: isComplete
                        ? 'linear-gradient(90deg, #38f7a1 0%, #fff 100%)'
                        : 'linear-gradient(90deg, #38f7a1, #6effd6)',
                    }}
                  />
                </div>
                <span
                  className={styles.progressBarText}
                  style={!isUnlocked ? { opacity: 0.5 } : {}}
                >
                  {isUnlocked ? `${type.current} / ${type.max}` : `0 / ${type.max}`}
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
