import React, { useEffect, useState } from 'react';
import styles from '../css/Quests.module.css';
import Header from './Header';

interface Quest {
  id: string;
  group: string;
  description: string;
  xp: number;
  money: number;
  needed_amount: number;
}

const checkQuestCompletion = (quest: Quest, stats: any): boolean => {
  switch (quest.id) {
    case 'activity_1': return stats.weekTrades >= 2;
    case 'activity_2': return stats.weekTrades >= 50;
    case 'activity_3': return stats.weekTrades >= 100;
    case 'activity_4': return stats.weekTrades >= 250;
    case 'activity_5': return stats.weekTrades >= 750;
    case 'activity_6': return stats.weekTrades >= 1000;
    case 'activity_7': return stats.weekTrades >= 5000;
    case 'activity_8': return stats.weekTrades >= 10000;
    case 'buy_1': return stats.totalStocksBought >= 1;
    case 'buy_2': return stats.totalStocksBought >= 100;
    case 'buy_3': return stats.totalStocksBought >= 150;
    case 'buy_4': return stats.totalStocksBought >= 300;
    case 'buy_5': return stats.totalStocksBought >= 2000;
    case 'buy_6': return stats.totalStocksBought >= 10000;
    case 'buy_7': return stats.totalStocksBought >= 30000;
    case 'buy_8': return stats.totalStocksBought >= 100000;
    case 'buy_9': return stats.totalStocksBought >= 500000;
    case 'diversify_1': return stats.holdShares >= 2;
    case 'diversify_2': return stats.holdShares >= 5;
    case 'diversify_3': return stats.holdShares >= 10;
    case 'diversify_4': return stats.holdShares >= 14;
    case 'diversify_5': return stats.holdShares >= 19;
    case 'diversify_6': return stats.holdShares >= 25;
    case 'sell_1': return stats.totalStocksSelled >= 1;
    case 'sell_2': return stats.totalStocksSelled >= 100;
    case 'sell_3': return stats.totalStocksSelled >= 150;
    case 'sell_4': return stats.totalStocksSelled >= 300;
    case 'sell_5': return stats.totalStocksSelled >= 2000;
    case 'sell_6': return stats.totalStocksSelled >= 10000;
    case 'sell_7': return stats.totalStocksSelled >= 30000;
    case 'sell_8': return stats.totalStocksSelled >= 100000;
    case 'sell_9': return stats.totalStocksSelled >= 500000;
    case 'special_1': return stats.percentageProfit >= 10;
    case 'special_2': return stats.percentageProfit >= 50;
    case 'special_3': return stats.percentageProfit >= 100;
    case 'special_4': return stats.percentageProfit >= 150;
    case 'special_5': return stats.percentageProfit >= 200;
    case 'special_6': return stats.percentageProfit >= 300;
    case 'special_7': return stats.percentageProfit >= 350;
    default: return false;
  }
};

const Quests: React.FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [headerKey, setHeaderKey] = useState(0);
  const [showCompleted, setShowCompleted] = useState(false); // toggle state

  useEffect(() => {
    fetch('http://localhost:3000/api/quests')
      .then(res => res.json())
      .then(setQuests)
      .catch(err => console.error('Fehler beim Laden der Quests:', err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:3000/api/me/completed-quests', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const ids = data.map((q: any) => String(q.quest_id));
        setCompletedQuestIds([...new Set(ids)] as string[]);
      })
      .catch(err => console.error('Fehler beim Abrufen der abgeschlossenen Quests:', err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:3000/api/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setUserStats)
      .catch(err => console.error('Fehler beim Laden der Stats:', err));
  }, []);

  useEffect(() => {
    if (!quests.length || !userStats) return;

    const newlyCompleted = quests
      .filter(q => !completedQuestIds.includes(q.id) && checkQuestCompletion(q, userStats))
      .map(q => q.id);

    if (newlyCompleted.length > 0) {
      const token = localStorage.getItem('token');
      if (!token) return;

      Promise.all(
        newlyCompleted.map(questId =>
          fetch('http://localhost:3000/api/me/complete-quest', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ questId }),
          })
        )
      )
        .then(() => {
          setCompletedQuestIds(prev => [...new Set([...prev, ...newlyCompleted])]);
        })
        .catch(err => console.error('Fehler beim Abschließen von Quests:', err));
    }
  }, [quests, userStats, completedQuestIds]);

  const getSequentialQuestsPerGroup = (quests: Quest[], completed: string[]): Quest[] => {
    const grouped: Record<string, Quest[]> = {};
    quests.forEach(q => {
      if (!grouped[q.group]) grouped[q.group] = [];
      grouped[q.group].push(q);
    });

    const result: Quest[] = [];
    for (const group in grouped) {
      const sorted = grouped[group].sort((a, b) => a.needed_amount - b.needed_amount);
      for (let i = 0; i < sorted.length; i++) {
        const isCompleted = completed.includes(sorted[i].id);
        if (!isCompleted && sorted.slice(0, i).every(q => completed.includes(q.id))) {
          result.push(sorted[i]);
          break;
        }
      }
    }
    return result;
  };

  const visibleQuests = showCompleted
    ? quests.filter(q => completedQuestIds.includes(q.id))
    : getSequentialQuestsPerGroup(quests, completedQuestIds);

  const totalQuests = quests.length;
  const completedCount = completedQuestIds.length;
  const progress = totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0;

  return (
    <div className={styles.questsContainer}>
      <Header key={headerKey} />
      <div className={styles.questsTitle}>Quests</div>

      <ul className={styles.questList}>
        {visibleQuests.map((quest) => {
          const progressValue = userStats
            ? (() => {
                switch (quest.group) {
                  case 'activity': return userStats.weekTrades;
                  case 'buy': return userStats.totalStocksBought;
                  case 'diversify': return userStats.holdShares;
                  case 'sell': return userStats.totalStocksSelled;
                  case 'special': return userStats.percentageProfit;
                  default: return null;
                }
              })()
            : null;

          const progressMax = quest.needed_amount;
          const shownValue = progressValue !== null ? Math.min(progressValue, progressMax) : null;
          const isCompleted = completedQuestIds.includes(quest.id);

          return (
            <li
              key={quest.id}
              className={`${styles.questItem} ${isCompleted ? styles.completed : ''}`}
            >
              <div className={styles.questInfo}>
                <span className={styles.questDescription}>{quest.description}</span>
                {progressValue !== null && (
                  <span className={styles.questProgress}>
                    Fortschritt: {shownValue} / {progressMax}
                  </span>
                )}
              </div>
              <div className={styles.questRewards}>
                {quest.money ? (
                  <span className={styles.xpBadge}>{quest.money} €</span>
                ) : (
                  <span className={styles.xpBadge}>XP: {quest.xp}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className={styles.progressBarContainer}>
        <div className={styles.progressBarBg}>
          <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
        </div>
        <span className={styles.progressText}>
          {completedCount} / {totalQuests} Quests abgeschlossen
        </span>
      </div>
       <div className={styles.toggleButtonWrapper}>
    <button
      className={styles.toggleButton}
      onClick={() => setShowCompleted(prev => !prev)}
    >
      {showCompleted ? 'Nur offene anzeigen' : 'Alle erledigten anzeigen'}
    </button>
  </div>
    </div>
  );
};

export default Quests;
