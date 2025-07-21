import React, { useEffect, useState } from 'react';
import styles from '../css/Friends.module.css';
import Header from './Header';

interface Friend {
  id: number;
  name: string;
  avatar: string;
  level: number;
}

const Friends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'freunde' | 'anfragen'>('freunde');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<number[]>([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    fetch('http://localhost:3000/api/friends', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setFriends)
      .catch(console.error);

    fetch('http://localhost:3000/api/friend-requests', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setRequests)
      .catch(console.error);
  }, [token]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`http://localhost:3000/api/users/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Fehler bei Suche', err);
    }
  };

  const handleSendRequest = async (receiverId: number) => {
    try {
      await fetch('http://localhost:3000/api/friend-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId })
      });
      setSentRequests(prev => [...prev, receiverId]);
    } catch (err) {
      console.error('Fehler beim Senden', err);
    }
  };

  const handleProfileClick = (id: number) => {
    alert(`Gehe zum Profil von ID ${id}`);
  };

  const handleAccept = async (requestId: number) => {
    try {
      await fetch(`http://localhost:3000/api/friend-requests/${requestId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const accepted = requests.find(r => r.id === requestId);
      if (accepted) {
        setFriends(prev => [...prev, accepted]);
      }
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Fehler beim Akzeptieren', error);
    }
  };

  const handleDecline = async (requestId: number) => {
    try {
      await fetch(`http://localhost:3000/api/friend-requests/${requestId}/decline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Fehler beim Ablehnen', error);
    }
  };

  return (
    <div className={styles.pageBg}>
      <Header />
      <h1 className={styles.friendsTitle}>Freunde</h1>

      {/* 🔍 Suchleiste */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Nutzer suchen..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className={styles.searchButton}>Suchen</button>

        {searchResults.length > 0 && (
          <ul className={styles.friendsList}>
            {searchResults.map(user => (
              <li key={user.id} className={styles.friendItem}>
                <img src={user.avatar} alt={user.name} className={styles.avatar} />
                <span className={styles.name}>{user.name}</span>
                <span className={styles.level}>LvL {user.level}</span>
                <button
                  disabled={sentRequests.includes(user.id)}
                  className={styles.addFriendBtn}
                  onClick={() => handleSendRequest(user.id)}
                >
                  {sentRequests.includes(user.id) ? 'Gesendet' : 'Anfrage senden'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tabs + Inhalte */}
      <div className={styles.cardMain}>
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === 'freunde' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('freunde')}
          >
            Freunde
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'anfragen' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('anfragen')}
          >
            Anfragen
          </button>
        </div>

        {activeTab === 'freunde' && (
          <ul className={styles.friendsList}>
            {[...friends]
              .sort((a, b) => b.level - a.level)
              .map(friend => (
                <li key={friend.id} className={styles.friendItem}>
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className={styles.avatar}
                    onClick={() => handleProfileClick(friend.id)}
                  />
                  <span className={styles.name} onClick={() => handleProfileClick(friend.id)}>
                    {friend.name}
                  </span>
                  <span className={styles.level}>LvL {friend.level}</span>
                </li>
              ))}
          </ul>
        )}

        {activeTab === 'anfragen' && (
          <ul className={styles.friendsList}>
            {requests.map(request => (
              <li key={request.id} className={styles.friendItem}>
                <img
                  src={request.avatar}
                  alt={request.name}
                  className={styles.avatar}
                  onClick={() => handleProfileClick(request.id)}
                />
                <span className={styles.name} onClick={() => handleProfileClick(request.id)}>
                  {request.name} <span className={styles.levelSmall}>LvL {request.level}</span>
                </span>
                <div className={styles.requestButtons}>
                  <button onClick={() => handleAccept(request.id)} className={styles.acceptBtn}>Ja</button>
                  <button onClick={() => handleDecline(request.id)} className={styles.declineBtn}>Nein</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Friends;
