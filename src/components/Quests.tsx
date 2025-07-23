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

// Quest-Completion-Check basierend auf Stats
const checkQuestCompletion = (quest: Quest, stats: any): boolean => {
  switch (quest.id) {
    // Activity Quests (weekTrades)
    case 'activity_1': return stats.weekTrades >= 2;
    case 'activity_2': return stats.weekTrades >= 50;
    case 'activity_3': return stats.weekTrades >= 100;
    case 'activity_4': return stats.weekTrades >= 250;
    case 'activity_5': return stats.weekTrades >= 750;
    case 'activity_6': return stats.weekTrades >= 1000;
    case 'activity_7': return stats.weekTrades >= 5000;
    case 'activity_8': return stats.weekTrades >= 10000;

    // Buy Quests (totalStocksBought)
    case 'buy_1': return stats.totalStocksBought >= 1;
    case 'buy_2': return stats.totalStocksBought >= 100;
    case 'buy_3': return stats.totalStocksBought >= 150;
    case 'buy_4': return stats.totalStocksBought >= 300;
    case 'buy_5': return stats.totalStocksBought >= 2000;
    case 'buy_6': return stats.totalStocksBought >= 10000;
    case 'buy_7': return stats.totalStocksBought >= 30000;
    case 'buy_8': return stats.totalStocksBought >= 100000;
    case 'buy_9': return stats.totalStocksBought >= 500000;

    // Diversify Quests (holdShares)
    case 'diversify_1': return stats.holdShares >= 2;
    case 'diversify_2': return stats.holdShares >= 5;
    case 'diversify_3': return stats.holdShares >= 10;
    case 'diversify_4': return stats.holdShares >= 14;
    case 'diversify_5': return stats.holdShares >= 19;
    case 'diversify_6': return stats.holdShares >= 25;

    // Sell Quests (totalStocksSelled)
    case 'sell_1': return stats.totalStocksSelled >= 1;
    case 'sell_2': return stats.totalStocksSelled >= 100;
    case 'sell_3': return stats.totalStocksSelled >= 150;
    case 'sell_4': return stats.totalStocksSelled >= 300;
    case 'sell_5': return stats.totalStocksSelled >= 2000;
    case 'sell_6': return stats.totalStocksSelled >= 10000;
    case 'sell_7': return stats.totalStocksSelled >= 30000;
    case 'sell_8': return stats.totalStocksSelled >= 100000;
    case 'sell_9': return stats.totalStocksSelled >= 500000;

    // Special Quests (percentageProfit)
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
        const ids = data.map((entry: { quest_id: string }) => entry.quest_id as string);
        const uniqueIds = [...new Set(ids)] as string[];
        setCompletedQuestIds(uniqueIds);
        console.log('Erledigte Quests:', uniqueIds);
      })
      .catch(err => {
        console.error('Fehler beim Laden der erledigten Quests:', err);
      });
  }, []);

  // Stats laden
  useEffect(() => {
    const loadUserStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:3000/api/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const stats = await response.json();
          setUserStats(stats);
          console.log('Geladene Stats für Quests:', stats);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Stats:', error);
      }
    };

    loadUserStats();

    // Event Listener für Stats-Updates aus Game.tsx
    // Entferne das unnötige Stats-Reload:
    const handleStatsUpdate = () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      fetch('http://localhost:3000/api/me/completed-quests', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const ids = data.map((entry: { quest_id: string }) => entry.quest_id as string);
          const uniqueIds = [...new Set(ids)] as string[];
          setCompletedQuestIds(uniqueIds);
          console.log('Quest-IDs aktualisiert (unique):', uniqueIds);
        })
        .catch(error => {
          console.error('Fehler beim Quest-Update:', error);
        });
    };



    window.addEventListener('statsUpdated', handleStatsUpdate);
    return () => window.removeEventListener('statsUpdated', handleStatsUpdate);
  }, []);

  // Quests automatisch abschließen basierend auf Stats
  useEffect(() => {
    if (!quests.length || !userStats) return;

    const newlyCompleted: string[] = [];

    quests.forEach(quest => {
      const isAlreadyCompleted = completedQuestIds.includes(quest.id);
      const shouldBeCompleted = checkQuestCompletion(quest, userStats);

      if (!isAlreadyCompleted && shouldBeCompleted) {
        newlyCompleted.push(quest.id);
        console.log(`✅ Quest abgeschlossen: ${quest.description}`);
      }
    });

    if (newlyCompleted.length > 0) {
      markMultipleQuestsCompleted(newlyCompleted);
    }
  }, [quests, userStats, completedQuestIds]);

  // Mehrere Quests als abgeschlossen markieren
  // KORRIGIERT in Quests.tsx:
  const reloadCompletedQuests = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:3000/api/me/completed-quests', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const ids = data.map((entry: { quest_id: string }) => entry.quest_id as string);
        const uniqueIds = [...new Set(ids)] as string[];
        setCompletedQuestIds(uniqueIds);
      });
  };

  const markMultipleQuestsCompleted = async (questIds: string[]) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // NUR Quest-Completion - keine Stats-Manipulation
      await Promise.all(
        questIds.map(questId =>
          fetch('http://localhost:3000/api/me/complete-quest', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ questId })
          })
        )
      );

      // Lokalen Quest-State aktualisieren
      setCompletedQuestIds(prev => [...new Set([...prev, ...questIds])]);

      // Nach Claim sofort neu laden
      reloadCompletedQuests();

      // Header nach 2 Sekunden neu rendern
      setTimeout(() => {
        setHeaderKey(prev => prev + 1);
      }, 1200);

      console.log(` ${questIds.length} neue Quests abgeschlossen!`);
    } catch (error) {
      console.error('Fehler beim Abschließen der Quests:', error);
    }
  };



  // KORRIGIERTE Hilfsfunktion: Sequenzielle Quest-Anzeige
  function getSequentialQuestsPerGroup(quests: Quest[], completed: string[]): Quest[] {
    const groups: { [key: string]: Quest[] } = {};
    quests.forEach((quest) => {
      if (!groups[quest.group]) groups[quest.group] = [];
      groups[quest.group].push(quest);
    });

    const result: Quest[] = [];

    for (const group in groups) {
      // Sortiere Quests nach needed_amount
      const sortedGroup = groups[group].sort((a, b) => a.needed_amount - b.needed_amount);

      // Finde die nächste unerledigte Quest in der Sequenz
      for (let i = 0; i < sortedGroup.length; i++) {
        const quest = sortedGroup[i];
        const isCompleted = completed.includes(quest.id);

        if (!isCompleted) {
          // Prüfe ob alle vorherigen Quests abgeschlossen sind
          const allPreviousCompleted = sortedGroup.slice(0, i).every(prevQuest =>
            completed.includes(prevQuest.id)
          );

          if (allPreviousCompleted) {
            result.push(quest);
            break; // Nur eine Quest pro Gruppe anzeigen
          }
        }
      }
    }

    return result;
  }

  const visibleQuests = getSequentialQuestsPerGroup(quests, completedQuestIds);
  const totalQuests = quests.length;
  const completedCount = completedQuestIds.length;
  const progress = totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0;

  // Debug-Log für erledigte Quests
  useEffect(() => {
    console.log('DEBUG: State completedQuestIds:', completedQuestIds);
  }, [completedQuestIds]);

  return (
    <div className={styles.questsContainer}>
      <Header key={headerKey} />

      <div className={styles.questsTitle}>Quests</div>

      <ul className={styles.questList}>
        {visibleQuests.map((quest, idx) => {
          // Fortschritt berechnen
          let progressValue: number | null = null;
          let progressMax: number | null = null;
          if (userStats) {
            switch (quest.group) {
              case 'activity':
                progressValue = userStats.weekTrades;
                progressMax = quest.needed_amount;
                break;
              case 'buy':
                progressValue = userStats.totalStocksBought;
                progressMax = quest.needed_amount;
                break;
              case 'diversify':
                progressValue = userStats.holdShares;
                progressMax = quest.needed_amount;
                break;
              case 'sell':
                progressValue = userStats.totalStocksSelled;
                progressMax = quest.needed_amount;
                break;
              case 'special':
                progressValue = userStats.percentageProfit;
                progressMax = quest.needed_amount;
                break;
              default:
                progressValue = null;
                progressMax = null;
            }
          }

          // Wenn es die letzte Quest ist, zeige den tatsächlichen Stat-Wert (auch wenn er über dem Ziel liegt)
          const isLast = idx === visibleQuests.length - 1;
          let shownValue = progressValue;
          if (isLast && progressValue !== null && progressMax !== null) {
            shownValue = progressValue;
          } else if (progressValue !== null && progressMax !== null) {
            shownValue = Math.min(progressValue, progressMax);
          }

          return (
            <li key={quest.id} className={styles.questItem}>
              <div className={styles.questInfo}>
                <span className={styles.questDescription}>{quest.description}</span>
                {progressValue !== null && progressMax !== null && (
                  <span className={styles.questProgress}>
                    Fortschritt: {shownValue} / {progressMax}
                  </span>
                )}
              </div>
              <div className={styles.questRewards}>
                {quest.money !== null && quest.money !== undefined && quest.money !== 0 ? (
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
