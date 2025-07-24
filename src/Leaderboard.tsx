import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import './css/Leaderboard.css';
import './css/usernameColors.css';

interface LeaderboardUser {
  id: number;
  username: string;
  percentageProfit?: number;
  totalStocksBought?: number;
  weekTrades?: number;
  nameColor?: string;
  [key: string]: any; // Index signature für dynamischen Zugriff
}

const categories = [
  { key: 'percentageProfit', label: 'Highest Percentage Profit' },
  { key: 'totalStocksBought', label: 'Total Stocks Bought' },
  { key: 'weekTrades', label: 'Most Trades in a Week' },
];

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState(categories[0].key);

  // Funktion zum Ermitteln der CSS-Klasse für Namensfarben
  const getNameColorClass = (nameColor: string | undefined): string => {
    if (!nameColor) return '';

    const colorMapping: { [key: string]: string } = {
      'red': 'username-red',
      'blue': 'username-blue',
      'green': 'username-green',
      'yellow': 'username-yellow',
      'orange': 'username-orange',
      'purple': 'username-purple',
      'pink': 'username-pink',
      'cyan': 'username-cyan',
      'lime': 'username-lime',
      'teal': 'username-teal',
      'neon': 'username-neon',
      'silber': 'username-silber',
      'gold': 'username-gold',
      'diamond': 'username-diamond',
      'ruby': 'username-ruby',
      'emerald': 'username-emerald',
      'sapphire': 'username-sapphire',
      'amethyst': 'username-amethyst',
      'topaz': 'username-topaz',
      'obsidian': 'username-obsidian',
      'rainbow': 'username-rainbow',
      'plasma': 'username-plasma',
      'cosmic': 'username-cosmic'
    };

    return colorMapping[nameColor] || '';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Leaderboard-Daten mit Namensfarben abrufen
    const fetchLeaderboardWithColors = async () => {
      try {
        // Erste Anfrage: Standard Leaderboard
        const leaderboardResponse = await fetch('http://localhost:3000/api/stats/leaderboard', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const leaderboardData = await leaderboardResponse.json();
        const leaderboardUsers = Array.isArray(leaderboardData.leaderboard) ? leaderboardData.leaderboard : [];

        console.log('🏆 Leaderboard Daten:', leaderboardUsers);

        // Zweite Anfrage: Alle User-Farben - ERWEITERTE DEBUG VERSION
        console.log('🔍 Versuche Farben abzurufen von: http://localhost:3000/api/user-name/all-users-colors');

        const colorsResponse = await fetch('http://localhost:3000/api/user-name/all-users-colors', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('📡 Colors Response Status:', colorsResponse.status);
        console.log('📡 Colors Response Headers:', colorsResponse.headers);

        if (colorsResponse.ok) {
          const colorsData = await colorsResponse.json();
          console.log('🎨 Farben Daten RAW:', colorsData);
          console.log('🎨 Farben Daten Typ:', typeof colorsData);
          console.log('🎨 Farben Daten Array?:', Array.isArray(colorsData));

          const colorMapping: { [key: string]: string } = {};

          // Erweiterte Debug-Version - USERNAME-basiert
          if (Array.isArray(colorsData)) {
            colorsData.forEach((userColor: any, index: number) => {
              console.log(`🎨 User ${index}:`, userColor);
              if (userColor.nameColor && userColor.username) {
                colorMapping[userColor.username] = userColor.nameColor;
                console.log(`✅ Username-Mapping hinzugefügt: ${userColor.username} -> ${userColor.nameColor}`);
              } else {
                console.log(`❌ Keine nameColor/username für User:`, userColor);
              }
            });
          } else {
            console.log('❌ colorsData ist kein Array:', colorsData);
          }

          console.log('🗺️ Finales Username-Color Mapping:', colorMapping);

          // Füge Namensfarben zu Leaderboard-Daten hinzu - USERNAME-basiert
          const usersWithColors = leaderboardUsers.map((user: LeaderboardUser) => {
            const userColor = colorMapping[user.username];
            console.log(`👤 User ${user.username} (ID: ${user.id}) -> Farbe: ${userColor || 'keine'}`);
            return {
              ...user,
              nameColor: userColor || undefined
            };
          });

          console.log('👥 Users mit Farben FINAL:', usersWithColors);

          setUsers(usersWithColors);
        } else {
          const errorText = await colorsResponse.text();
          console.log('❌ Farben-Anfrage fehlgeschlagen:', colorsResponse.status, errorText);

          // Fallback: Versuche alternative Route
          console.log('🔄 Versuche Fallback-Route...');
          try {
            const fallbackResponse = await fetch('http://localhost:3000/api/user-name/me/names', {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });

            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              console.log('🔄 Fallback Daten:', fallbackData);
            }
          } catch (fallbackError) {
            console.log('❌ Auch Fallback fehlgeschlagen:', fallbackError);
          }

          setUsers(leaderboardUsers);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('💥 Kompletter Fehler beim Abrufen des Leaderboards:', error);
        setUsers([]);
        setIsLoading(false);
      }
    };

    fetchLeaderboardWithColors();
  }, []);

  const sortedUsers = [...users].sort((a, b) => {
    let aVal = a[category] ?? 0;
    let bVal = b[category] ?? 0;
    if (category === 'percentageProfit') {
      aVal = typeof aVal === 'string' ? parseFloat(aVal) : aVal;
      bVal = typeof bVal === 'string' ? parseFloat(bVal) : bVal;
    }
    return bVal - aVal;
  });

  const top10 = sortedUsers.slice(0, 10);

  return (
    <div className="leaderboard-bg">
      <Header />
      <div className="leaderboard-container">
        <div className="leaderboard-card">
          <h2 className="leaderboard-title">Leaderboard</h2>
          <div className="leaderboard-subtitle">
            Die besten Trader auf Stocktrainer! Vergleiche verschiedene Kategorien mit anderen Nutzern.
          </div>
          <div className="leaderboard-buttons">
            {categories.map(cat => (
              <button
                key={cat.key}
                className={`category-button ${category === cat.key ? 'active' : ''}`}
                onClick={() => setCategory(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {isLoading ? (
            <div className="leaderboard-loading">
              <div className="spinner"></div>
              Lade Leaderboard...
            </div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>{categories.find(cat => cat.key === category)?.label}</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((user, idx) => (
                  <tr key={user.id + '_' + idx} className={`rank-${idx + 1}`}>
                    <td>{idx + 1}</td>
                    <td>
                      <span
                        className={getNameColorClass(user.nameColor)}
                        title={`Color: ${user.nameColor || 'none'}, Class: ${getNameColorClass(user.nameColor)}`}
                      >
                        {user.username}
                      </span>
                    </td>
                    <td>{user[category] ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
