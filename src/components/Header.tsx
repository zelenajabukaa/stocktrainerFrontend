import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Header.module.css';

import coin from '../assets/coin.png';
import avatar1 from '../../public/avatar/avatar1.png';
import avatar2 from '../../public/avatar/avatar2.png';
import avatar3 from '../../public/avatar/avatar3.png';
import avatar4 from '../../public/avatar/avatar4.png';
import avatar5 from '../../public/avatar/avatar5.png';
import avatar6 from '../../public/avatar/avatar6.png';
import avatar7 from '../../public/avatar/avatar7.png';
import avatar8 from '../../public/avatar/avatar8.png';
import avatar9 from '../../public/avatar/avatar9.png';

const Header: React.FC<{ username: string; level: number; ingameCurrency: number }> = ({
  username,
  level,
  ingameCurrency,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // User ID aus localStorage holen
  let userId: number | null = null;
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      if (userObj.id) userId = Number(userObj.id);
    }
  } catch {}

  // Avatar-Bilder
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

  // Avatare des Users laden
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
            'Authorization': `Bearer ${token}`,
          },
        });

        const text = await res.text();
        console.log('👤 Avatar-Fetch-Response (Header):', text);

        try {
          const data = JSON.parse(text);
          console.log('✅ Parsed user avatars (Header):', data);
          setUserAvatars(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('❌ JSON-Parsing Fehler im Header:', err);
        }
      } catch {
        console.error('❌ Fehler beim Abrufen der Avatare im Header');
        setUserAvatars([]);
      }
    }

    fetchUserAvatars();
  }, [userId]);

  // Aktuellen Avatar bestimmen (selected == 1)
  let selectedAvatarImg = null;
  const selected = userAvatars.find((a) => Number(a.selected) === 1);
  if (selected && typeof selected.avatar_id === 'number') {
    const idx = selected.avatar_id - 4;
    if (idx >= 0 && idx < avatarImages.length) {
      selectedAvatarImg = avatarImages[idx];
    }
  }

  async function handleLogout() {
    try {
      await fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    } catch (e) {
      alert('Logout fehlgeschlagen');
    }
  }

  // Dropdown schließen bei Klick außerhalb
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <header className={styles.headerBar}>
      <div className={styles.leftInfo}>
        <div className={styles.ingameCurrency}>
          <img src={coin} alt="Coin" />
          {ingameCurrency}
        </div>
        <div className={styles.levelBadge}>Lvl {level}</div>
      </div>

      <div className={styles.avatarMenuWrapper} ref={menuRef}>
        <button className={styles.homeLinkBtn} onClick={() => navigate('/home')} aria-label="Home">
          Home
        </button>
        <button
          className={styles.avatarCircle}
          onClick={() => setOpen((v) => !v)}
          aria-label="Optionen"
        >
          {selectedAvatarImg ? (
            <img
              src={selectedAvatarImg}
              alt="Avatar"
              className={styles.avatarImg}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                objectFit: 'cover',
                background: '#fff',
              }}
              draggable={false}
            />
          ) : (
            <span className={styles.avatarInitials}>A</span>
          )}
        </button>
        {open && (
          <div className={styles.menuDropdown}>
            <button className={styles.menuItem}>Einstellungen</button>
            <button className={styles.menuItem} onClick={() => navigate('/user/avatar')}>
              Avatar ändern
            </button>
            <button className={styles.menuItem} onClick={handleLogout}>
              Ausloggen
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
