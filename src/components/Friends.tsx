import React, { useEffect, useState } from 'react';
import styles from '../css/Friends.module.css';
import Header from './Header';

interface Friend {
  id: number;
  name: string;
  avatar?: string;
  level: number;
  status?: 'friend' | 'sent' | 'incoming' | 'none';
}

const Friends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'freunde' | 'anfragen'>('freunde');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);

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

  // 🔁 Live-Suche
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (!searchQuery.trim()) return setSearchResults([]);

      fetch(`http://localhost:3000/api/users/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(setSearchResults)
        .catch(console.error);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, token]);

  const handleSendRequest = async (receiverId: number) => {
    try {
      const res = await fetch('http://localhost:3000/api/friend-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId })
      });

      if (res.ok) {
        updateUserStatus(receiverId, 'sent');
      } else {
        const data = await res.json();
        console.warn('Serverfehler:', data.message);
        if (data.message.includes('bereits')) {
          updateUserStatus(receiverId, 'sent'); // falls Backend schon ablehnt
        }
      }
    } catch (err) {
      console.error('Fehler beim Senden', err);
    }
  };

  const updateUserStatus = (userId: number, status: Friend['status']) => {
    setSearchResults(prev =>
      prev.map(u => (u.id === userId ? { ...u, status } : u))
    );
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
      if (accepted) setFriends(prev => [...prev, accepted]);
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

      {/* 🔍 Live-Suche */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Nutzer suchen..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {searchResults.length > 0 && (
          <ul className={styles.friendsList}>
            {searchResults.map(user => (
              <li key={user.id} className={styles.friendItem}>
                <span className={styles.name}>{user.name}</span>
                <span className={styles.level}>LvL {user.level}</span>
                <button
                  disabled={user.status !== 'none'}
                  className={styles.addFriendBtn}
                  onClick={() => handleSendRequest(user.id)}
                >
                  {user.status === 'friend'
                    ? 'Bereits befreundet'
                    : user.status === 'sent'
                    ? 'Gesendet'
                    : user.status === 'incoming'
                    ? 'Antwort ausstehend'
                    : 'Anfrage senden'}
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
            {[...friends].sort((a, b) => b.level - a.level).map(friend => (
              <li key={friend.id} className={styles.friendItem} onClick={() => handleProfileClick(friend.id)} style={{ cursor: 'pointer' }}>
                <span className={styles.name}>{friend.name}</span>
                <span className={styles.level}>LvL {friend.level}</span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'anfragen' && (
          <ul className={styles.friendsList}>
            {requests.map(request => (
              <li key={request.id} className={styles.friendItem} onClick={() => handleProfileClick(request.id)} style={{ cursor: 'pointer' }}>
                <span className={styles.name}>
                  {request.name} <span className={styles.levelSmall}>LvL {request.level}</span>
                </span>
                <div className={styles.requestButtons}>
                  <button onClick={e => { e.stopPropagation(); handleAccept(request.id); }} className={styles.acceptBtn}>Ja</button>
                  <button onClick={e => { e.stopPropagation(); handleDecline(request.id); }} className={styles.declineBtn}>Nein</button>
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
