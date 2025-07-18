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

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [user, setUser] = useState({
    username: '',
    level: 0,
    ingameCurrency: 0,
    xp: 0,
  });

  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) return;

    try {
      const userObj = JSON.parse(userData);
      if (userObj?.id) setUserId(userObj.id);
    } catch {}

    fetch('http://localhost:3000/api/profile', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser((prev) => ({
            ...prev,
            username: data.user.username ?? '',
            level: data.user.level ?? 0,
            ingameCurrency: data.user.ingameCurrency ?? 0,
          }));
        }
      })
      .catch(() => {
        console.error('❌ Fehler beim Laden des Profils');
      });
  }, []);

  useEffect(() => {
    async function fetchUserXP() {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      let uid: number | null = null;

      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          uid = parsed?.id;
        } catch {}
      }

      if (!token || !uid) return;

      try {
        const res = await fetch(`http://localhost:3000/api/users/${uid}/completed-xp`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data?.xp !== undefined) {
          setUser((prev) => ({
            ...prev,
            xp: data.xp,
            level: data.level ?? calculateLevel(data.xp),
          }));
        }
      } catch (err) {
        console.error('❌ Fehler beim Laden der XP:', err);
      }
    }

    fetchUserXP();
  }, []);

  function calculateLevel(xp: number) {
    const xpTable = [
      { level: 1, xp: 100 }, { level: 2, xp: 300 }, { level: 3, xp: 500 },
      { level: 4, xp: 1000 }, { level: 5, xp: 1500 }, { level: 6, xp: 2200 },
      { level: 7, xp: 2800 }, { level: 8, xp: 3500 }, { level: 9, xp: 4500 },
      { level: 10, xp: 5800 }, { level: 11, xp: 7000 }, { level: 12, xp: 8500 },
      { level: 13, xp: 10000 }, { level: 14, xp: 12000 }, { level: 15, xp: 14500 },
      { level: 16, xp: 17500 }, { level: 17, xp: 20000 }, { level: 18, xp: 23000 },
      { level: 19, xp: 27000 }, { level: 20, xp: 32450 },
    ];
    let currentLevel = 0;
    for (const entry of xpTable) {
      if (xp >= entry.xp) currentLevel = entry.level;
      else break;
    }
    return currentLevel;
  }

  const avatarImages = [
    avatar1, avatar2, avatar3, avatar4, avatar5,
    avatar6, avatar7, avatar8, avatar9,
  ];

  const [userAvatars, setUserAvatars] = useState<any[]>([]);
  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem('token');

    fetch(`http://localhost:3000/api/users/${userId}/avatars`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserAvatars(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        console.error('❌ Fehler beim Laden der Avatare');
        setUserAvatars([]);
      });
  }, [userId]);

  const selectedAvatar = userAvatars.find((a) => Number(a.selected) === 1);
  const selectedAvatarImg =
    selectedAvatar && typeof selectedAvatar.avatar_id === 'number'
      ? avatarImages[selectedAvatar.avatar_id - 4] ?? null
      : null;

  async function handleLogout() {
    try {
      await fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    } catch {
      alert('Logout fehlgeschlagen');
    }
  }

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
          {user.ingameCurrency}
        </div>
        <div className={styles.levelBadge}>Lvl {user.level}</div>
        <div className={styles.levelBadge}>XP {user.xp}</div>
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
            <button className={styles.menuItem} onClick={() => navigate('/user/settings')}>
              Einstellungen
            </button>
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
