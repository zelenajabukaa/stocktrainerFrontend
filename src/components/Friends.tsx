import React, { useState } from 'react';
import styles from '../css/Friends.module.css';
import Header from './Header';

interface Friend {
  id: number;
  name: string;
  avatar: string;
  level: number;
}

const dummyFriends: Friend[] = [
  { id: 1, name: 'Anna', avatar: '/avatar/avatar1.png', level: 12 },
  { id: 2, name: 'Ben', avatar: '/avatar/avatar2.png', level: 10 },
  { id: 3, name: 'Clara', avatar: '/avatar/avatar3.png', level: 15 },
  { id: 4, name: 'David', avatar: '/avatar/avatar4.png', level: 8 },
];

const dummyRequests: Friend[] = [
  { id: 5, name: 'Eva', avatar: '/avatar/avatar5.png', level: 10 },
  { id: 6, name: 'Felix', avatar: '/avatar/avatar6.png', level: 9 },
  { id: 7, name: 'Gina', avatar: '/avatar/avatar7.png', level: 11 },
];

const Friends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'freunde' | 'anfragen'>('freunde');
  const [friends, setFriends] = useState<Friend[]>(dummyFriends);
  const [requests, setRequests] = useState<Friend[]>(dummyRequests);

  const handleProfileClick = (id: number) => {
    alert(`Gehe zum Profil von ID ${id}`);
    // z. B. navigate(`/profile/${id}`);
  };

  const handleAccept = (id: number) => {
    const accepted = requests.find(r => r.id === id);
    if (accepted) {
      setFriends(prev => [...prev, accepted]);
    }
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleDecline = (id: number) => {
    alert(`Anfrage von ID ${id} abgelehnt`);
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className={styles.pageBg}>
      <Header />
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
