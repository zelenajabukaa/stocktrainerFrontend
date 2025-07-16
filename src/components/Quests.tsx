import React from 'react';
import styles from './Quests.module.css';
import Header from './Header';

interface Quest {
  id: string;
  group: string; 
  description: string;
  xp?: number;
  money?: number;
}

const quests: Quest[] = [
  { id: 'buy_1', group: 'buy', description: 'Kaufe deine erste Aktie.', xp: 50 },
  { id: 'buy_2', group: 'buy', description: 'Kaufe 10 Aktien', xp: 100 },
  { id: 'buy_3', group: 'buy', description: 'Kaufe 50 Aktien', xp: 150 },
  { id: 'buy_4', group: 'buy', description: 'Kaufe 100 Aktien', xp: 200 },
  { id: 'buy_5', group: 'buy', description: 'Kaufe 500 Aktien', xp: 500 },
  { id: 'buy_6', group: 'buy', description: 'Kaufe 1000 Aktien', xp: 750 },
  { id: 'buy_7', group: 'buy', description: 'Kaufe 7500 Aktien', xp: 900 },
  { id: 'buy_8', group: 'buy', description: 'Kaufe 15000 Aktien', xp: 1500 },
  { id: 'buy_9', group: 'buy', description: 'Kaufe 100000 Aktien', xp: 4000 },


  { id: 'sell_1', group: 'sell', description: 'Verkaufe deine erste Aktie.', xp: 50 },
  { id: 'sell_2', group: 'sell', description: 'Verkaufe 10 Aktien', xp: 100 },
  { id: 'sell_3', group: 'sell', description: 'Verkaufe 50 Aktien', xp: 150 },
  { id: 'sell_4', group: 'sell', description: 'Verkaufe 100 Aktien', xp: 200 },
  { id: 'sell_5', group: 'sell', description: 'Verkaufe 500 Aktien', xp: 500},
  { id: 'sell_6', group: 'sell', description: 'Verkaufe 1000 Aktien', xp: 750 },
  { id: 'sell_7', group: 'sell', description: 'Verkaufe 7500 Aktien', xp: 900 },
  { id: 'sell_8', group: 'sell', description: 'Verkaufe 15000 Aktien', xp: 1500 },
  { id: 'sell_9', group: 'sell', description: 'Verkaufe 100000 Aktien', xp: 4000 },


  { id: 'diversify_1', group: 'diversify', description: 'Halte Aktien von 2 verschiedenen Unternehmen.', xp: 100 },
  { id: 'diversify_2', group: 'diversify', description: 'Halte Aktien von 5 verschiedenen Unternehmen.', xp: 200 },
  { id: 'diversify_3', group: 'diversify', description: 'Halte Aktien von 10 verschiedenen Unternehmen.', xp: 400 },
  { id: 'diversify_4', group: 'diversify', description: 'Halte Aktien von 14 verschiedenen Unternehmen.', xp: 750 },
  { id: 'diversify_5', group: 'diversify', description: 'Halte Aktien von 19 verschiedenen Unternehmen.', xp: 1000 },
  { id: 'diversify_6', group: 'diversify', description: 'Halte Aktien von 25 verschiedenen Unternehmen.', xp: 3000 },


  { id: 'activity_1', group: 'activity', description: 'Führe in einer Woche mindestens 2 Trades aus.', xp: 50 },
  { id: 'activity_2', group: 'activity', description: 'Führe in einer Woche mindestens 6 Trades aus.', xp: 100 },
  { id: 'activity_3', group: 'activity', description: 'Führe in einer Woche mindestens 10 Trades aus.', xp: 300 },
  { id: 'activity_4', group: 'activity', description: 'Führe in einer Woche mindestens 18 Trades aus.', xp: 500 },
  { id: 'activity_5', group: 'activity', description: 'Führe in einer Woche mindestens 25 Trades aus.', xp: 750 },
  { id: 'activity_6', group: 'activity', description: 'Führe in einer Woche mindestens 30 Trades aus.', xp: 1000 },
  { id: 'activity_7', group: 'activity', description: 'Führe in einer Woche mindestens 40 Trades aus.', xp: 3000 },
  { id: 'activity_8', group: 'activity', description: 'Führe in einer Woche mindestens 50 Trades aus.', xp: 5000 },

 { id: 'special_1', group: 'special', description: 'Vermeide Verluste und erhalte mindestens dein Startbudget zurück.', money: 100 },
{ id: 'special_2', group: 'special', description: 'Erziele mindestens 10% Gewinn auf dein Startbudget.', money: 500 },
{ id: 'special_3', group: 'special', description: 'Erziele mindestens 20% Gewinn auf dein Startbudget.', money: 2500 },
{ id: 'special_4', group: 'special', description: 'Erziele mindestens 50% Gewinn auf dein Startbudget.', money: 5000 },
{ id: 'special_5', group: 'special', description: 'Verdopple dein Startbudget.', money: 10000 },
{ id: 'special_6', group: 'special', description: 'Verdreifache dein Startbudget.', money: 25000 },
{ id: 'special_7', group: 'special', description: 'Vervierfache dein Startbudget.', money: 50000 }






];

const completedQuestIds = [];

function getNextQuestsPerGroup(quests: Quest[], completed: string[]): Quest[] {
  const groups: { [key: string]: Quest[] } = {};

  
  quests.forEach((quest) => {
    if (!groups[quest.group]) groups[quest.group] = [];
    groups[quest.group].push(quest);
  });


  const result: Quest[] = [];
  for (const group in groups) {
    const next = groups[group].find((q) => !completed.includes(q.id));
    if (next) result.push(next);
  }

  return result;
}

const Quests: React.FC = () => {
  const visibleQuests = getNextQuestsPerGroup(quests, completedQuestIds);
  const totalQuests = quests.length;
  const completedCount = completedQuestIds.length;
  const progress = (completedCount / totalQuests) * 100;

  let username = "Username";
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      if (userObj.username) username = userObj.username;
    }
  } catch {}
  const level = 1;
  const ingameCurrency = 0;

  return (
    <div className={styles.questsContainer}>
      <Header username={username} level={level} ingameCurrency={ingameCurrency} />
      <div className={styles.questsTitle}>Quests</div>

      <ul className={styles.questList}>
        {visibleQuests.map((quest) => (
          <li key={quest.id} className={styles.questItem}>
            <div className={styles.questInfo}>
              <span className={styles.questDescription}>{quest.description}</span>
            </div>
            {typeof quest.money === 'number' ? (
              <span className={styles.xpBadge}>{quest.money} €</span>
            ) : (
              <span className={styles.xpBadge}>{quest.xp} XP</span>
            )}
          </li>
        ))}
      </ul>

      <div className={styles.progressBarContainer}>
        <div className={styles.progressBarBg}>
          <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
        </div>
        <span className={styles.progressText}>{completedCount} / {totalQuests} Quests abgeschlossen</span>
      </div>
    </div>
  );
};

export default Quests;
