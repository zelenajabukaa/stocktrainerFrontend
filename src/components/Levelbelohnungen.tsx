import React, { useEffect, useRef, useState } from 'react';
import styles from '../css/Levelbelohnungen.module.css';
import Header from './Header';

const avatarImages: Record<string, string> = {
  'Avatar Rajib': '/public/avatar/avatar5.png',
  'Avatar Muhamed': '/public/avatar/avatar4.png',
  'Avatar Goat': '/public/avatar/avatar9.png',
};

const defaultImages: Record<string, string> = {
  'Münzen': '/src/assets/coin.png',
};

const rawRewards = [
  { level: 1, reward: 'Nike Aktie', xp: 100 },
  { level: 2, reward: 'PepsiCo Aktie', xp: 300 },
  { level: 3, reward: 'Avatar Rajib', xp: 500 },
  { level: 4, reward: 'Honeywell Aktie', xp: 1000 },
  { level: 5, reward: '900 Münzen', xp: 1500 },
  { level: 6, reward: 'PayPal Aktie', xp: 2200 },
  { level: 7, reward: 'Apple Aktie', xp: 2800 },
  { level: 8, reward: 'Avatar Muhamed', xp: 3500 },
  { level: 9, reward: 'Mc Donalds Aktie', xp: 4500 },
  { level: 10, reward: 'UnitedHealthGroup Aktie', xp: 5800 },
  { level: 11, reward: 'Visa Aktie', xp: 7000 },
  { level: 12, reward: '6000 Münzen', xp: 8500 },
  { level: 13, reward: 'Boeing Aktie', xp: 10000 },
  { level: 14, reward: 'Amazon Aktie', xp: 12000 },
  { level: 15, reward: 'Tesla Aktie', xp: 14500 },
  { level: 16, reward: 'Meta Aktie', xp: 17500 },
  { level: 17, reward: 'Mastercard Aktie', xp: 20000 },
  { level: 18, reward: 'Microsoft Aktie', xp: 23000 },
  { level: 19, reward: 'Netflix Aktie', xp: 27000 },
  { level: 20, reward: 'Avatar Goat', xp: 32450 },
];

const Levelbelohnungen: React.FC = () => {
  const [userLevel, setUserLevel] = useState<number>(0);
  const [claimedLevels, setClaimedLevels] = useState<number[]>([]);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [userXp, setUserXp] = useState<number>(0);
  const [userCoins, setUserCoins] = useState<number>(0);
  const token = localStorage.getItem('token');
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:3000/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.user?.level) {
          setUserLevel(data.user.level);
        }
        if (data.user?.xp_points !== undefined) {
          setUserXp(data.user.xp_points);
        }
        if (data.user?.ingameCurrency !== undefined) {
          setUserCoins(data.user.ingameCurrency);
        }
      })
      .catch(err => {
        console.error('Fehler beim Abrufen des Levels:', err);
      });

    // Lade bereits abgeholte Level-Belohnungen vom Backend
    fetch('http://localhost:3000/api/levelrewards/claimed', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Fehler beim Laden der Level-Belohnungen');
        return res.json();
      })
      .then(data => setClaimedLevels(data.claimedLevels || []))
      .catch(err => setClaimError('Fehler beim Laden der Level-Belohnungen.'));
  }, [token]);

  useEffect(() => {
    return () => {
      if (successTimeout.current) clearTimeout(successTimeout.current);
    };
  }, []);

  const refreshUserData = () => {
    if (!token) return;
    fetch('http://localhost:3000/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.user?.xp_points !== undefined) {
          setUserXp(data.user.xp_points);
        }
        if (data.user?.ingameCurrency !== undefined) {
          setUserCoins(data.user.ingameCurrency);
        }
      });
  };

  const handleClaim = (level: number) => {
    setClaimError(null);
    if (!token) return;
    fetch('http://localhost:3000/api/levelrewards/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ level })
    })
      .then(res => {
        if (!res.ok) throw new Error('Fehler beim Abholen der Belohnung');
        return res.json();
      })
      .then(() => {
        fetch('http://localhost:3000/api/levelrewards/claimed', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => setClaimedLevels(data.claimedLevels || []));
        refreshUserData();
        setShowSuccess(false); // Animation zurücksetzen
        if (successTimeout.current) clearTimeout(successTimeout.current);
        setTimeout(() => setShowSuccess(true), 10); // Animation kurz aus/ein
        successTimeout.current = setTimeout(() => setShowSuccess(false), 2000);
      })
      .catch(() => {/* Fehleranzeige entfernt */ });
  };

  const rewards = rawRewards.map(item => ({
    ...item,
    unlocked: item.level <= userLevel,
  }));

  return (
    <div className={styles.battlepassFullPage}>
      <Header />
      <h2 className={styles.battlepassTitle}>Levelbelohnungen</h2>
      {showSuccess && (
        <div className={styles.successToast}>
          <span className={styles.successCheck}>✔</span> Belohnung erfolgreich abgeholt!
        </div>
      )}
      <div className={styles.levelsRowFull}>
        {rewards.map((item) => {
          let imgSrc = '';
          if (avatarImages[item.reward]) {
            imgSrc = avatarImages[item.reward];
          } else if (item.reward.includes('Aktie')) {
            const match = item.reward.match(/^(.*) Aktie$/);
            if (match && match[1]) {
              let logoName = match[1].replace(/ /g, '');
              // Spezialfall für UnitedHealthGroup
              if (logoName.toLowerCase() === 'unitedhealthgroup') logoName = 'unitedhealth';
              imgSrc = `/public/logos/${logoName.toLowerCase()}.png`;
            } else {
              imgSrc = '/public/logos/stock.png';
            }
          } else if (item.reward.includes('Münzen')) {
            imgSrc = defaultImages['Münzen'];
          } else {
            imgSrc = '/public/avatar/avatar4.png';
          }

          // Claim-Button nur für XP/Münzen, nicht für Aktien/Avatare
          const isClaimable = !item.reward.includes('Aktie');
          const isAutoUnlocked = item.reward.includes('Aktie') && item.unlocked;

          return (
            <div
              key={item.level}
              className={item.unlocked ? styles.levelBoxUnlocked : styles.levelBox}
            >
              <div className={styles.levelNumber}>Level {item.level}</div>
              <img src={imgSrc} alt={item.reward} className={styles.avatarImg} />
              <div className={styles.reward}>{item.reward}</div>
              <div className={styles.xp}>XP: {item.xp}</div>
              {item.unlocked && isClaimable && !claimedLevels.includes(item.level) && (
                <button onClick={() => handleClaim(item.level)} className={styles.claimButton}>
                  Belohnung abholen
                </button>
              )}
              {(item.unlocked && (isAutoUnlocked || claimedLevels.includes(item.level))) && (
                <div className={styles.unlockedBadge}>Freigeschaltet</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Levelbelohnungen;
