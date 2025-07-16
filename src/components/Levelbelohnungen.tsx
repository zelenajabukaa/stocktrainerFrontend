
import React from 'react';
import styles from '../css/Levelbelohnungen.module.css';

const avatarImages: Record<string, string> = {
  'Avatar Livio': '/public/avatar/avatar5.png',
  'Avatar Araber': '/public/avatar/avatar4.png',
  'Avatar Goat': '/public/avatar/avatar9.png',
};

const defaultImages: Record<string, string> = {
  'Münzen': '/src/assets/coin.png',
};

const rewards = [
  { level: 1, reward: 'Nike Aktie', xp: 100, unlocked: true },
  { level: 2, reward: 'PepsiCo Aktie', xp: 300, unlocked: true },
  { level: 3, reward: 'Avatar Livio', xp: 500, unlocked: false },
  { level: 4, reward: 'Honeywell Aktie', xp: 1000, unlocked: false },
  { level: 5, reward: '900 Münzen', xp: 1500, unlocked: false },
  { level: 6, reward: 'PayPal Aktie', xp: 2200, unlocked: false },
  { level: 7, reward: 'Apple Aktie', xp: 2800, unlocked: false },
  { level: 8, reward: 'Avatar Araber', xp: 3500, unlocked: false },
  { level: 9, reward: 'Mc Donalds Aktie', xp: 4500, unlocked: false },
  { level: 10, reward: 'UnitedHealthGroup Aktie', xp: 5800, unlocked: false },
  { level: 11, reward: 'Visa Aktie', xp: 7000, unlocked: false },
  { level: 12, reward: '6000 Münzen', xp: 8500, unlocked: false },
  { level: 13, reward: 'Boeing Aktie', xp: 10000, unlocked: false },
  { level: 14, reward: 'Amazon Aktie', xp: 12000, unlocked: false },
  { level: 15, reward: 'Tesla Aktie', xp: 14500, unlocked: false },
  { level: 16, reward: 'Meta Aktie', xp: 17500, unlocked: false },
  { level: 17, reward: 'Mastercard Aktie', xp: 20000, unlocked: false },
  { level: 18, reward: 'Microsoft Aktie', xp: 23000, unlocked: false },
  { level: 19, reward: 'Netflix Aktie', xp: 27000, unlocked: false },
  { level: 20, reward: 'Avatar Goat', xp: 32450, unlocked: false },
];

const Levelbelohnungen: React.FC = () => {
  return (
    <div className={styles.battlepassFullPage}>
      <h2 className={styles.battlepassTitle}>Levelbelohnungen</h2>
      <div className={styles.levelsRowFull}>
        {rewards.map((item) => {
          let imgSrc = '';
          if (avatarImages[item.reward]) {
            imgSrc = avatarImages[item.reward];
          } else if (item.reward.includes('Aktie')) {
            const match = item.reward.match(/^(.*) Aktie$/);
            if (match && match[1]) {
              const logoName = match[1].replace(/ /g, '');
              imgSrc = `/public/logos/${logoName.toLowerCase()}.png`;
            } else {
              imgSrc = '/public/logos/stock.png'; // Fallback
            }
          } else if (item.reward.includes('Münzen')) {
            imgSrc = defaultImages['Münzen'];
          } else {
            imgSrc = '/public/avatar/avatar1.png'; // Fallback
          }
          return (
            <div
              key={item.level}
              className={item.unlocked ? styles.levelBoxUnlocked : styles.levelBox}
            >
              <div className={styles.levelNumber}>Level {item.level}</div>
              <img src={imgSrc} alt={item.reward} className={styles.avatarImg} />
              <div className={styles.reward}>{item.reward}</div>
              <div className={styles.xp}>XP: {item.xp}</div>
              {item.unlocked && <div className={styles.unlockedBadge}>Freigeschaltet</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Levelbelohnungen;
