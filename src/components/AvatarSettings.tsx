import React, { useEffect, useState } from 'react';
import styles from '../css/AvatarSettings.module.css';
import Header from './Header';

import avatar1 from '../../public/avatar/avatar1.png';
import avatar2 from '../../public/avatar/avatar2.png';
import avatar3 from '../../public/avatar/avatar3.png';
import avatar4 from '../../public/avatar/avatar4.png';
import avatar5 from '../../public/avatar/avatar5.png';
import avatar6 from '../../public/avatar/avatar6.png';
import avatar7 from '../../public/avatar/avatar7.png';
import avatar8 from '../../public/avatar/avatar8.png';
import avatar9 from '../../public/avatar/avatar9.png';

import coin from '../assets/coin.png';

const AvatarSettings: React.FC = () => {
  const avatars = [
    { id: 4, src: avatar1 }, // Standard
    { id: 5, src: avatar2 },
    { id: 6, src: avatar3 },
    { id: 9, src: avatar6, price: 10000 },
    { id: 10, src: avatar7, price: 30000 },
    { id: 11, src: avatar8, price: 60000 },
    { id: 8, src: avatar5, level: 3},
    { id: 7, src: avatar4, level: 8},

    { id: 12, src: avatar9, level: 20 },
  ];

  let username = 'Username';
  let userId: number | null = null;

  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      if (userObj.username) username = userObj.username;
      if (userObj.id) userId = Number(userObj.id);
    }
  } catch {}

  const [userAvatars, setUserAvatars] = useState<any[]>([]);
  const [level, setLevel] = useState(1);
  const [ingameCurrency, setIngameCurrency] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!userId) return;
      const token = localStorage.getItem('token');

      try {
        // Avatare
        const res = await fetch(`http://localhost:3000/api/users/${userId}/avatars`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        setUserAvatars(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fehler beim Laden der Avatare:', err);
      }

      try {
        // Profil für Level & Coins
        const res = await fetch(`http://localhost:3000/api/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const { user } = await res.json();
        setLevel(user.level);
        setIngameCurrency(user.ingameCurrency);
      } catch (err) {
        console.error('Fehler beim Laden des Profils:', err);
      }
    }

    fetchData();
  }, [userId]);

  return (
    <div className={styles.avatarSettingsContainer}>
      <Header />

      <div className={styles.avatarSettingsContent}>
        <h2 className={styles.avatarTitle}>Avatar</h2>
        <div className={styles.avatarGrid}>
          {avatars.map(({ id: avatar_id, src, price, level: requiredLevel }) => {
            const ua = userAvatars.find(a => Number(a.avatar_id) === avatar_id);
            const isUnlocked = Number(ua?.bought) === 1;
            const isSelected = Number(ua?.selected) === 1;
            const meetsLevel = requiredLevel ? level >= requiredLevel : true;
            const canBuy = price && ingameCurrency >= price && !isUnlocked;

            return (
              <div key={avatar_id} className={styles.avatarField}>
                <img
                  src={src}
                  alt={`Avatar ${avatar_id}`}
                  className={styles.avatarImg}
                  draggable={false}
                  style={isUnlocked ? {} : { filter: 'grayscale(1)', opacity: 0.5 }}
                />

                {/* Button-Logik */}
                {isUnlocked ? (
                  <button
                    className={styles.avatarSelectButton}
                    disabled={isSelected}
                    style={isSelected ? { backgroundColor: 'gray', cursor: 'default' } : {}}
                    onClick={async () => {
                      if (!userId || isSelected) return;
                      setUserAvatars(prev => prev.map(a =>
                        Number(a.avatar_id) === avatar_id
                          ? { ...a, selected: 1 }
                          : { ...a, selected: 0 }
                      ));
                      try {
                        const token = localStorage.getItem('token');
                        const res = await fetch(`http://localhost:3000/api/users/${userId}/avatars/${avatar_id}/select`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                          },
                        });
                        if (res.ok) window.location.reload();
                        else alert('Avatar konnte nicht ausgewählt werden.');
                      } catch (err) {
                        alert('Fehler beim Auswählen des Avatars.');
                      }
                    }}
                  >
                    {isSelected ? 'Ausgewählt' : 'Auswählen'}
                  </button>
                ) : price ? (
                  <button
                    className={styles.avatarSelectButton}
                    disabled={!canBuy}
                    onClick={async () => {
                      if (!userId || !canBuy) return;
                      try {
                        const token = localStorage.getItem('token');
                        const res = await fetch(`http://localhost:3000/api/users/${userId}/avatars/${avatar_id}/buy`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                          },
                        });
                        if (res.ok) window.location.reload();
                        else alert('Avatar konnte nicht gekauft werden.');
                      } catch (err) {
                        alert('Fehler beim Kauf des Avatars.');
                      }
                    }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    {price.toLocaleString('de-DE')}
                    <img src={coin} alt="Münzen" style={{ width: 20, height: 20 }} />
                  </button>
                ) : requiredLevel ? (
                  <button className={styles.avatarSelectButton} disabled>
                    ab Level {requiredLevel}
                  </button>
                ) : (
                  <button className={styles.avatarSelectButton} disabled>
                    Nicht freigeschaltet
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AvatarSettings;
