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

const Quests: React.FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([]);

  // Quests laden
  useEffect(() => {
    fetch('http://localhost:3000/api/quests')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Empfangene Quests:', data);
        setQuests(data);
      })
      .catch(err => {
        console.error('Fehler beim Laden der Quests:', err);
      });
  }, []);

  // Erledigte Quests des Users laden
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ Kein Token im LocalStorage gefunden');
      return;
    }

    fetch('http://localhost:3000/api/me/completed-quests', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP-Fehler: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        const ids = data.map((entry: { quest_id: string }) => entry.quest_id);
        console.log('Erledigte Quests:', ids);
        setCompletedQuestIds(ids);
      })
      .catch(err => {
        console.error('Fehler beim Laden der erledigten Quests:', err);
      });
  }, []);

  // Hilfsfunktion: Nur die nächste Quest pro Gruppe anzeigen
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

  const visibleQuests = getNextQuestsPerGroup(quests, completedQuestIds);
  const totalQuests = quests.length;
  const completedCount = completedQuestIds.length;
  const progress = totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0;

  // Debug-Log für erledigte Quests
  useEffect(() => {
    console.log('DEBUG: State completedQuestIds:', completedQuestIds);
  }, [completedQuestIds]);

  return (
    <div className={styles.questsContainer}>
      <Header/>

      <div className={styles.questsTitle}>Quests</div>

      <ul className={styles.questList}>
        {visibleQuests.map((quest) => (
          <li key={quest.id} className={styles.questItem}>
            <div className={styles.questInfo}>
              <span className={styles.questDescription}>{quest.description}</span>
            </div>
            <div className={styles.questRewards}>
              {quest.money !== null && quest.money !== undefined && quest.money !== 0 ? (
                <span className={styles.xpBadge}>{quest.money} €</span>
              ) : (
                <span className={styles.xpBadge}>XP: {quest.xp}</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.progressBarContainer}>
        <div className={styles.progressBarBg}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={styles.progressText}>
          {completedCount} / {totalQuests} Quests abgeschlossen
        </span>
      </div>
    </div>
  );
};

export default Quests;
