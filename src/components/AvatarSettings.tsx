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

const AvatarSettings: React.FC = () => {
  const avatarImages = [
    avatar1,
    avatar2,
    avatar3,
    avatar4,
    avatar5,
    avatar6,
    avatar7,
    avatar8,
    avatar9,
  ];

  let username = 'Username';
  let userId: number | null = null;

  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      if (userObj.username) username = userObj.username;
      if (userObj.id) userId = Number(userObj.id); // ✅ wichtig: sicherstellen, dass userId eine Zahl ist!
    }
  } catch {}

  const level = 1;
  const ingameCurrency = 0;

  const [userAvatars, setUserAvatars] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUserAvatars() {
      if (!userId) return;
      try {
        const token = localStorage.getItem('token');

        const res = await fetch(`http://localhost:3000/api/users/${userId}/avatars`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const text = await res.text(); // lesen als Text für Fehleranalyse
        console.log('📦 Server Response:', text);

        try {
          const data = JSON.parse(text);
          console.log('✅ Parsed Avatars:', data);
          setUserAvatars(Array.isArray(data) ? data : []);
        } catch (parseErr) {
          console.error('❌ Fehler beim Parsen der JSON-Antwort:', parseErr);
        }

      } catch (err) {
        console.error('❌ Fehler beim Laden der Avatare:', err);
        setUserAvatars([]);
      }
    }

    fetchUserAvatars();
  }, [userId]);

  return (
    <div className={styles.avatarSettingsContainer}>
      <Header username={username} level={level} ingameCurrency={ingameCurrency} />

      <div className={styles.avatarSettingsContent}>
        <h2 className={styles.avatarTitle}>Avatar</h2>
        <div className={styles.avatarGrid}>
          {avatarImages.map((src, i) => {
            const avatar_id = i + 4;
            const ua = userAvatars.find(a => Number(a.avatar_id) === avatar_id);
            const isUnlocked = Number(ua?.bought) === 1;
            const isSelected = Number(ua?.selected) === 1;

            console.log(`🧩 Avatar ${avatar_id}`, ua, 'Unlocked:', isUnlocked, 'Selected:', isSelected);

            return (
              <div key={avatar_id} className={styles.avatarField}>
                <img
                  src={src}
                  alt={`Avatar ${i + 1}`}
                  className={styles.avatarImg}
                  draggable={false}
                  style={isUnlocked ? {} : { filter: 'grayscale(1)', opacity: 0.5 }}
                />
                <button
                  className={styles.avatarSelectButton}
                  disabled={!isUnlocked || isSelected}
                  style={isSelected ? { backgroundColor: 'gray', cursor: 'default' } : {}}
                >
                  {!isUnlocked
                    ? 'Nicht freigeschaltet'
                    : isSelected
                      ? 'Ausgewählt'
                      : 'Auswählen'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AvatarSettings;
