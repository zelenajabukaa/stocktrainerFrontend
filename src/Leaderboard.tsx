import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import './css/home.css';

const categories = [
  // XP entfernt
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
    // Profil-Daten holen
    fetch('http://localhost:3000/api/profile', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setOwnProfile(data.user ?? null);
      })
      .catch(() => {
        setOwnProfile(null);
      });
    // Leaderboard-Daten holen
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

    // Eigene Stats holen
    fetch('http://localhost:3000/api/stats/all', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setOwnStats(data.stats ?? null);
      })
      .catch(() => {
        setOwnStats(null);
      });
  }, []);

  return (
    <div className="main-bg">
      <Header />
      <div className="main-content">
        <div className="card card-main" style={{ minHeight: '520px', paddingTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <h2 className="stats-title">Leaderboard</h2>
          <div className="stats-description">
            Die besten Trader auf Stocktrainer! Vergleiche verschiedene Kategorien mit anderen Nutzern.
          </div>
          <div style={{ margin: '18px 0 24px 0', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 8,
                    border: 'none',
                    background: category === cat.key ? 'linear-gradient(90deg,#2563eb 60%,#1e293b 100%)' : 'rgba(37,99,235,0.10)',
                    color: category === cat.key ? '#fff' : '#2563eb',
                    fontWeight: category === cat.key ? 700 : 500,
                    fontSize: '1.07rem',
                    boxShadow: category === cat.key ? '0 2px 12px #2563eb44' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    outline: category === cat.key ? '2px solid #2563eb' : 'none',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          {isLoading ? (
            <div className="loading-stats">
              <div className="loading-spinner"></div>
              Lade Leaderboard...
            </div>
          ) : (
            <table className="leaderboard-table" style={{ width: '100%', maxWidth: 800, margin: '0 auto', background: 'rgba(255,255,255,0.10)', borderRadius: 12 }}>
              <thead>
                <tr style={{ color: '#2563eb', fontWeight: 700 }}>
                  <th style={{ padding: '12px 0' }}>#</th>
                  <th>Username</th>
                  <th>{categories.find(cat => cat.key === category)?.label}</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Sortiere nach gewählter Kategorie
                  const sorted = [...users].sort((a, b) => {
                    let aVal = a[category] ?? 0;
                    let bVal = b[category] ?? 0;
                    if (category === 'percentageProfit') {
                      aVal = typeof aVal === 'string' ? parseFloat(aVal) : aVal;
                      bVal = typeof bVal === 'string' ? parseFloat(bVal) : bVal;
                    }
                    return bVal - aVal;
                  });
                  const top10 = sorted.slice(0, 10);
                  let ownId = null;
                  let ownUsername = '';
                  try {
                    const userData = localStorage.getItem('user');
                    if (userData) {
                      const userObj = JSON.parse(userData);
                      ownId = userObj.id;
                      ownUsername = userObj.username;
                    }
                  } catch {}
                  let ownRank = null;
                  if (ownId) {
                    const foundIdx = sorted.findIndex(u => u.id === ownId);
                    if (foundIdx !== -1) {
                      ownRank = foundIdx + 1;
                    }
                  }
                  // Eigener Wert aus ownStats für jede Kategorie
                  let ownValue = '-';
                  if (ownStats) {
                    ownValue = ownStats[category] ?? '-';
                  }
                  // Prüfe, ob eigener User in den Top 10 ist
                  return (
                    <>
                      {top10.map((user, idx) => (
                        <tr key={user.id + '_' + idx} style={{ color: '#fff', fontWeight: idx === 0 ? 900 : 500, background: idx % 2 === 0 ? 'rgba(37,99,235,0.07)' : 'transparent' }}>
                          <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ textAlign: 'center' }}>{user.username}</td>
                          <td style={{ textAlign: 'center' }}>{user[category] ?? '-'}</td>
                        </tr>
                      ))}
                    </>
                  );
                })()}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
