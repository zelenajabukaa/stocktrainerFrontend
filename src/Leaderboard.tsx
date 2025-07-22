import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import './css/Leaderboard.css';

const categories = [
  { key: 'percentageProfit', label: 'Highest Percentage Profit' },
  { key: 'totalStocksBought', label: 'Total Stocks Bought' },
  { key: 'weekTrades', label: 'Most Trades in a Week' },
];

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState(categories[0].key);
  const [ownStats, setOwnStats] = useState<any>(null);
  const [ownProfile, setOwnProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch('http://localhost:3000/api/profile', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setOwnProfile(data.user ?? null))
      .catch(() => setOwnProfile(null));

    fetch('http://localhost:3000/api/stats/leaderboard', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setUsers(Array.isArray(data.leaderboard) ? data.leaderboard : []);
        setIsLoading(false);
      })
      .catch(() => {
        setUsers([]);
        setIsLoading(false);
      });

    fetch('http://localhost:3000/api/stats/all', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setOwnStats(data.stats ?? null))
      .catch(() => setOwnStats(null));
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

  let ownId = null;
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      ownId = userObj.id;
    }
  } catch {}

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
                    <td>{user.username}</td>
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
