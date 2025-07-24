import React, { useEffect, useState } from 'react';
import styles from '../css/Successes.module.css';
import Header from './Header';

interface Quest {
  id: string;
  group: string;
  description: string;
  xp: number;
  money: number;
  needed_amount: number;
}

const Successes: React.FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const successCategories = [
    { key: 'activity', label: 'Aktivität', image: '/successes/activity.png', desc: 'Schliesse folgende anzahl von Trades aus.' },
    { key: 'buy', label: 'Kaufen', image: '/successes/buy.png', desc: 'Kaufe bestimmte anzahl von Aktien.' },
    { key: 'diversify', label: 'Diversifizieren', image: '/successes/diversify.png', desc: 'Gleichzeitiger Besitz von Aktien einer vorgegebenen Anzahl verschiedener Aktiengesellschaften sicherstellen. Bezug des Besitzzeitpunkts auf denselben Zeitpunkt erforderlich.' },
    { key: 'sell', label: 'Verkaufen', image: '/successes/sell.png', desc: 'Verkaufe bestimmte anzahl von Aktien.' },
    { key: 'special', label: 'Spezial', image: '/successes/special.png', desc: 'Erzielung eines vorgegebenen prozentualen Gewinns innerhalb eines Kalenderjahres.' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) return;

    const fetchData = async () => {
      try {
        const questRes = await fetch('http://localhost:3000/api/quests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const questData = await questRes.json();

        const completedRes = await fetch('http://localhost:3000/api/me/completed-quests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const completedData = await completedRes.json();
        const completedIds = completedData.map((q: { quest_id: string }) => q.quest_id);

        setQuests(questData);
        setCompletedIds(completedIds);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Quests:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Lade Erfolge...</div>;
  }

  const categoriesWithProgress = successCategories.map((cat) => {
    const questsInGroup = quests.filter(q => q.group === cat.key);
    const completedInGroup = questsInGroup.filter(q => completedIds.includes(q.id));
    return {
      ...cat,
      current: completedInGroup.length,
      max: questsInGroup.length,
    };
  });

  return (
    <div className={styles.successesContainer}>
      <Header />
      <h2 className={styles.successesTitle}>Abzeichen</h2>

      <div className={styles.successesGrid}>
        {categoriesWithProgress.map((cat, idx) => {
          const isUnlocked = idx === 0 || cat.current > 0;
          const isComplete = cat.current === cat.max;
          const progressPercent = Math.min((cat.current / cat.max) * 100, 100);

          return (
            <div
              key={cat.key}
              className={
                styles.successCard +
                ' ' + styles.successCardLarge +
                (!isUnlocked ? ' ' + styles.successCardLocked : '') +
                (isComplete ? ' ' + styles.successCardComplete : '')
              }
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '2.1rem',
                  marginBottom: 18,
                  display: 'block',
                }}
              >
                {cat.label}
              </span>

              <img
                src={cat.image}
                alt={`${cat.label} Badge`}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '1rem',
                  marginBottom: '1rem',
                }}
              />

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
                  {isUnlocked ? `${cat.current} / ${cat.max}` : `0 / ${cat.max}`}
                </span>
              </div>

              <span className={styles.successDesc} style={{ marginTop: 'auto', marginBottom: 'auto', display: 'block' }}>{cat.desc}</span>

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
